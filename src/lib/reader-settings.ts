import { useCallback, useSyncExternalStore } from 'react';

/*
  Reader appearance: page theme, typeface and text size.

  A per-device preference, so it lives in localStorage rather than in the
  reading_progress row: the size that suits a phone is wrong on a monitor.
*/

export type ReaderPage = 'site' | 'plain' | 'paper';
export type ReaderFont = 'sans' | 'serif';

export interface ReaderSettings {
  page: ReaderPage;
  font: ReaderFont;
  /** Index into TEXT_SIZES. */
  size: number;
}

export const TEXT_SIZES = [15, 16, 17.5, 19, 21, 23] as const;
export const PAGES: { id: ReaderPage; label: string }[] = [
  { id: 'site', label: 'Site' },
  { id: 'plain', label: 'Plain' },
  { id: 'paper', label: 'Paper' },
];

const KEY = 'vj-reader';
const DEFAULTS: ReaderSettings = { page: 'site', font: 'sans', size: 2 };

function read(): ReaderSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<ReaderSettings>;
    return {
      page: PAGES.some(p => p.id === raw.page) ? (raw.page as ReaderPage) : DEFAULTS.page,
      font: raw.font === 'serif' ? 'serif' : 'sans',
      size: Number.isInteger(raw.size) && raw.size! >= 0 && raw.size! < TEXT_SIZES.length ? raw.size! : DEFAULTS.size,
    };
  } catch {
    return DEFAULTS;
  }
}

let current: ReaderSettings = typeof window === 'undefined' ? DEFAULTS : read();
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useReaderSettings() {
  const settings = useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
  const update = useCallback((patch: Partial<ReaderSettings>) => {
    current = { ...current, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* not persisted; still applied for this visit */
    }
    listeners.forEach(l => l());
  }, []);
  return [settings, update] as const;
}
