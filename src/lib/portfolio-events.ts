/**
 * A narrow event channel between the hero terminal and the sections it drives.
 *
 * The terminal sits in the hero and the projects grid owns its own selection
 * and expansion state. Threading callbacks from one to the other would mean
 * lifting that state into the page for the sake of a single caller, so they
 * talk over two named window events instead. Typed helpers on both ends keep
 * the payloads honest.
 */

const OPEN_PROJECT = 'portfolio:open-project';
const FILTER_SKILL = 'portfolio:filter-skill';

export interface OpenProjectDetail {
  /** Project id, matched case-insensitively against id and title. */
  query: string;
}

export interface FilterSkillDetail {
  label: string;
  aliases: string[];
}

/*
 * Listener counts and held events, per name. The command palette can fire an
 * event from /books, where nothing is listening: it navigates home first, and
 * the home page and its lazy sections subscribe a moment later. An event sent
 * with no listener is held (the latest one wins) and handed to the first
 * listener that subscribes, so it is acted on once the target has mounted.
 * Held events go stale after a few seconds so a later visit to the home page
 * does not replay an old request.
 */
const listenerCounts = new Map<string, number>();
const held = new Map<string, { detail: unknown; at: number }>();
const HOLD_MS = 5000;

function emit<T>(name: string, detail: T) {
  if (typeof window === 'undefined') return;
  if (!listenerCounts.get(name)) {
    held.set(name, { detail, at: Date.now() });
    return;
  }
  window.dispatchEvent(new CustomEvent<T>(name, { detail }));
}

function listen<T>(name: string, handler: (detail: T) => void) {
  if (typeof window === 'undefined') return () => undefined;
  const wrapped = (event: Event) => handler((event as CustomEvent<T>).detail);
  window.addEventListener(name, wrapped);
  listenerCounts.set(name, (listenerCounts.get(name) ?? 0) + 1);

  const pending = held.get(name);
  let replay: number | undefined;
  if (pending) {
    held.delete(name);
    if (Date.now() - pending.at < HOLD_MS) {
      // After the subscribing effect returns, so the component has committed.
      replay = window.setTimeout(() => {
        replay = undefined;
        handler(pending.detail as T);
      }, 0);
    }
  }

  return () => {
    // Unsubscribed before the replay ran (StrictMode's mount-unmount-mount, or
    // a fast route change): hand the event back for the next listener.
    if (replay !== undefined) {
      window.clearTimeout(replay);
      if (pending) held.set(name, pending);
    }
    window.removeEventListener(name, wrapped);
    listenerCounts.set(name, Math.max(0, (listenerCounts.get(name) ?? 1) - 1));
  };
}

export const emitOpenProject = (detail: OpenProjectDetail) =>
  emit<OpenProjectDetail>(OPEN_PROJECT, detail);

export const onOpenProject = (handler: (detail: OpenProjectDetail) => void) =>
  listen<OpenProjectDetail>(OPEN_PROJECT, handler);

export const emitFilterSkill = (detail: FilterSkillDetail) =>
  emit<FilterSkillDetail>(FILTER_SKILL, detail);

export const onFilterSkill = (handler: (detail: FilterSkillDetail) => void) =>
  listen<FilterSkillDetail>(FILTER_SKILL, handler);

/** Scrolls a section into view allowing for the fixed navigation bar. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 64,
    behavior: 'smooth',
  });
}
