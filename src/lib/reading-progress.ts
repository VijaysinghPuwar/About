import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { bookPercent, clamp01, getBook } from '@/lib/books';
import type { Json } from '@/integrations/supabase/types';

/*
  Reading history: where each reader is in each book, and which chapters they
  have been through.

  Local first. Every scroll tick lands in memory and, a moment later, in
  localStorage, so a reload, a dropped connection or a backend without the
  table never loses a reader's place. The `reading_progress` table is the
  copy that follows the reader to another device; it is written on a
  debounce (at most one request every few seconds per reader) and flushed
  when the tab is hidden or closed.

  On sign-in the two copies are merged per book: the more recently updated
  location wins, and the per-chapter marks are unioned, keeping the furthest
  point reached in each. Neither device can make the other forget a chapter.

  If the table is missing (the migration has not been applied), the remote
  side switches itself off for the session and the reader keeps working on
  the local copy alone. That mirrors how `useAuth` treats a missing
  `profiles` table.
*/

export interface ChapterMark {
  /** Furthest point reached in the chapter, 0..1. */
  p: number;
  /** When the chapter was last open, ISO 8601. */
  t: string;
}

export interface BookProgress {
  slug: string;
  chapterId: string;
  /** Current location within `chapterId`, 0..1. */
  position: number;
  /** Overall progress at the current location, 0..100. */
  percent: number;
  chapters: Record<string, ChapterMark>;
  startedAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

type RemoteState = 'idle' | 'ok' | 'unavailable';

interface State {
  userId: string | null;
  books: Record<string, BookProgress>;
  /** True once local storage has been read for the current user. */
  ready: boolean;
  /** True once the server copy has been fetched, or has failed to be. */
  synced: boolean;
  remote: RemoteState;
}

/** A chapter read to here counts as read. The last screen is often notes. */
export const READ_THRESHOLD = 0.9;

const LOCAL_SAVE_MS = 400;
const REMOTE_SAVE_MS = 4000;
const REMOTE_MAX_WAIT_MS = 15000;

let state: State = { userId: null, books: {}, ready: false, synced: false, remote: 'idle' };
const listeners = new Set<() => void>();
const dirty = new Set<string>();
let localTimer: ReturnType<typeof setTimeout> | null = null;
let remoteTimer: ReturnType<typeof setTimeout> | null = null;
let firstDirtyAt = 0;
let inflight: Promise<void> | null = null;
let retryDelay = REMOTE_SAVE_MS;

function emit(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function storageKey(userId: string) {
  return `vj-reading:${userId}`;
}

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return err.code === 'PGRST205' || err.code === '42P01' || /schema cache|does not exist/i.test(err.message || '');
}

/* ---------- validation: everything read back is untrusted ---------- */

function sanitizeMarks(value: unknown): Record<string, ChapterMark> {
  const out: Record<string, ChapterMark> = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [id, mark] of Object.entries(value as Record<string, unknown>)) {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !mark || typeof mark !== 'object') continue;
    const m = mark as { p?: unknown; t?: unknown };
    const p = typeof m.p === 'number' ? clamp01(m.p) : 0;
    const t = typeof m.t === 'string' && !Number.isNaN(Date.parse(m.t)) ? m.t : new Date(0).toISOString();
    out[id] = { p, t };
  }
  return out;
}

function sanitizeProgress(slug: string, raw: unknown): BookProgress | null {
  const book = getBook(slug);
  if (!book || !raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const chapterId = typeof r.chapterId === 'string' ? r.chapterId : '';
  if (!book.chapters.some(c => c.id === chapterId)) return null;
  const position = clamp01(Number(r.position));
  const date = (v: unknown, fallback: string) =>
    typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : fallback;
  const now = new Date().toISOString();
  return {
    slug,
    chapterId,
    position,
    // Recomputed rather than trusted, so a catalogue change re-weights it.
    percent: bookPercent(book, chapterId, position),
    chapters: sanitizeMarks(r.chapters),
    startedAt: date(r.startedAt, now),
    updatedAt: date(r.updatedAt, now),
    finishedAt: typeof r.finishedAt === 'string' ? date(r.finishedAt, now) : null,
  };
}

function readLocal(userId: string): Record<string, BookProgress> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, BookProgress> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      const p = sanitizeProgress(slug, value);
      if (p) out[slug] = p;
    }
    return out;
  } catch {
    return {};
  }
}

function writeLocal() {
  if (!state.userId) return;
  try {
    localStorage.setItem(storageKey(state.userId), JSON.stringify(state.books));
  } catch {
    // Quota or a locked-down profile. The in-memory copy still syncs remotely.
  }
}

function mergeMarks(a: Record<string, ChapterMark>, b: Record<string, ChapterMark>) {
  const out = { ...a };
  for (const [id, m] of Object.entries(b)) {
    const cur = out[id];
    out[id] = cur
      ? { p: Math.max(cur.p, m.p), t: cur.t > m.t ? cur.t : m.t }
      : m;
  }
  return out;
}

function merge(local: BookProgress | undefined, remote: BookProgress | undefined): BookProgress | undefined {
  if (!local) return remote;
  if (!remote) return local;
  const newer = Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local : remote;
  return {
    ...newer,
    chapters: mergeMarks(local.chapters, remote.chapters),
    startedAt: local.startedAt < remote.startedAt ? local.startedAt : remote.startedAt,
    finishedAt: local.finishedAt ?? remote.finishedAt,
  };
}

/* ---------- remote ---------- */

function fetchRows(userId: string) {
  return supabase.from('reading_progress').select('*').eq('user_id', userId);
}

async function pullRemote(userId: string) {
  let data: Awaited<ReturnType<typeof fetchRows>>['data'] = null;
  let error: { code?: string; message?: string } | null = null;
  try {
    ({ data, error } = await fetchRows(userId));
  } catch (e) {
    error = { message: e instanceof Error ? e.message : String(e) };
  }

  if (state.userId !== userId) return; // signed out or switched while waiting
  if (error) {
    emit({ remote: isMissingTable(error) ? 'unavailable' : 'idle', synced: true });
    return;
  }

  const books = { ...state.books };
  for (const row of data ?? []) {
    const remote = sanitizeProgress(row.book_slug, {
      chapterId: row.chapter_id,
      position: row.position,
      chapters: row.chapters,
      startedAt: row.started_at,
      updatedAt: row.updated_at,
      finishedAt: row.finished_at,
    });
    if (!remote) continue;
    const local = books[row.book_slug];
    const merged = merge(local, remote);
    if (!merged) continue;
    books[row.book_slug] = merged;
    // The local copy knew something the server did not: send it back.
    if (
      merged.chapterId !== remote.chapterId ||
      merged.position !== remote.position ||
      JSON.stringify(merged.chapters) !== JSON.stringify(remote.chapters)
    ) {
      dirty.add(row.book_slug);
    }
  }
  // Books read locally that the server has never seen.
  for (const slug of Object.keys(books)) {
    if (!(data ?? []).some(r => r.book_slug === slug)) dirty.add(slug);
  }
  emit({ books, remote: 'ok', synced: true });
  writeLocal();
  if (dirty.size) scheduleRemote();
}

async function pushRemote(): Promise<void> {
  const userId = state.userId;
  if (!userId || state.remote === 'unavailable' || dirty.size === 0) return;
  if (inflight) return inflight;

  const slugs = [...dirty];
  dirty.clear();
  firstDirtyAt = 0;
  const rows = slugs
    .map(slug => state.books[slug])
    .filter((b): b is BookProgress => !!b)
    .map(b => ({
      user_id: userId,
      book_slug: b.slug,
      chapter_id: b.chapterId,
      position: b.position,
      percent: b.percent,
      chapters: b.chapters as unknown as Json,
      finished_at: b.finishedAt,
      started_at: b.startedAt,
      // The table has no update trigger, so its default only stamps inserts.
      // Sent explicitly, so the per-book merge on another device can tell
      // which copy is newer.
      updated_at: b.updatedAt,
    }));
  if (!rows.length) return;

  inflight = (async () => {
    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert(rows, { onConflict: 'user_id,book_slug' });
      if (error) {
        if (isMissingTable(error)) {
          emit({ remote: 'unavailable' });
          return;
        }
        throw error;
      }
      retryDelay = REMOTE_SAVE_MS;
      if (state.remote !== 'ok') emit({ remote: 'ok' });
    } catch {
      // Offline or a transient failure: put the work back and try later,
      // backing off so a dead connection is not hammered.
      slugs.forEach(s => dirty.add(s));
      retryDelay = Math.min(retryDelay * 2, 60000);
      scheduleRemote(retryDelay);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function scheduleRemote(delay = REMOTE_SAVE_MS) {
  if (state.remote === 'unavailable') return;
  if (!firstDirtyAt) firstDirtyAt = Date.now();
  if (remoteTimer) clearTimeout(remoteTimer);
  // Debounced, but never starved: continuous scrolling still saves every 15s.
  const wait = Math.max(0, Math.min(delay, REMOTE_MAX_WAIT_MS - (Date.now() - firstDirtyAt)));
  remoteTimer = setTimeout(() => { remoteTimer = null; void pushRemote(); }, wait);
}

function scheduleLocal() {
  if (localTimer) return;
  localTimer = setTimeout(() => { localTimer = null; writeLocal(); }, LOCAL_SAVE_MS);
}

/** Write everything now. Called when the tab is hidden, closed or left. */
export function flushReadingProgress() {
  if (localTimer) { clearTimeout(localTimer); localTimer = null; }
  writeLocal();
  if (remoteTimer) { clearTimeout(remoteTimer); remoteTimer = null; }
  void pushRemote();
}

/* ---------- public API ---------- */

export function bindReadingUser(userId: string | null) {
  if (state.userId === userId && state.ready) return;
  flushReadingProgress();
  dirty.clear();
  if (!userId) {
    emit({ userId: null, books: {}, ready: true, synced: true, remote: 'idle' });
    return;
  }
  emit({ userId, books: readLocal(userId), ready: true, synced: false, remote: 'idle' });
  void pullRemote(userId);
}

/** Record the reader's current location. Cheap enough to call on every frame. */
export function recordPosition(slug: string, chapterId: string, position: number) {
  const book = getBook(slug);
  if (!state.userId || !book) return;
  const i = book.chapters.findIndex(c => c.id === chapterId);
  if (i < 0) return;
  const pos = Math.round(clamp01(position) * 1000) / 1000;
  const prev = state.books[slug];
  const prevMark = prev?.chapters[chapterId];
  if (prev && prev.chapterId === chapterId && prev.position === pos && prevMark && prevMark.p >= pos) return;

  const now = new Date().toISOString();
  const chapters = { ...(prev?.chapters ?? {}), [chapterId]: { p: Math.max(prevMark?.p ?? 0, pos), t: now } };
  const atEnd = i === book.chapters.length - 1 && pos >= 0.98;
  const next: BookProgress = {
    slug,
    chapterId,
    position: pos,
    percent: bookPercent(book, chapterId, pos),
    chapters,
    startedAt: prev?.startedAt ?? now,
    updatedAt: now,
    finishedAt: prev?.finishedAt ?? (atEnd ? now : null),
  };
  emit({ books: { ...state.books, [slug]: next } });
  dirty.add(slug);
  scheduleLocal();
  scheduleRemote();
}

/** Forget a book entirely, here and on the server. */
export async function resetBookProgress(slug: string) {
  const userId = state.userId;
  if (!userId) return;
  const books = { ...state.books };
  delete books[slug];
  dirty.delete(slug);
  emit({ books });
  writeLocal();
  if (state.remote === 'unavailable') return;
  const { error } = await supabase.from('reading_progress').delete().eq('user_id', userId).eq('book_slug', slug);
  if (error && isMissingTable(error)) emit({ remote: 'unavailable' });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => state;

/** All progress for the signed-in reader, kept in step with auth. */
export function useReadingProgress() {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!loading) bindReadingUser(userId);
  }, [userId, loading]);

  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Until the store is bound to this user, show nothing rather than a
  // previous reader's shelf.
  const books = snap.userId === userId ? snap.books : {};
  const mine = snap.userId === userId;
  return { books, ready: snap.ready && mine, synced: snap.synced && mine, remote: snap.remote };
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushReadingProgress);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushReadingProgress();
  });
}
