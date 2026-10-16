import { useSyncExternalStore } from 'react';

/*
  Whether the site animates, decided once and written to `<html data-motion>`.

  `prefers-reduced-motion` alone was the switch, and on Windows it is not a
  reliable one. Chrome there reports `reduce` whenever "Animation effects" is
  off, and that is off under "Adjust for best performance", on many OEM and
  company images, in VMs and over Remote Desktop. So a perfectly capable
  machine whose owner never asked for less motion got the static site.

  The order is: an explicit choice on this site (command palette, stored under
  MOTION_KEY) wins; otherwise Windows animates; otherwise the OS preference is
  followed. Anyone on Windows who does want less motion can say so in the
  palette and it sticks.

  The same decision runs as an inline script in index.html so the attribute is
  in place before first paint; keep the two in step. CSS keys off
  `:root[data-motion="reduce"]` and Tailwind's `reduced:` variant, never the
  media query directly.
*/

export const MOTION_KEY = 'motion';
const CHANGE = 'motion-change';

type Pref = 'full' | 'reduce';

function storedPref(): Pref | null {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    return v === 'full' || v === 'reduce' ? v : null;
  } catch {
    return null;
  }
}

function isWindows() {
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  return uaData?.platform === 'Windows' || /Windows/i.test(navigator.userAgent);
}

function decide(): boolean {
  const pref = storedPref();
  if (pref) return pref === 'reduce';
  if (isWindows()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function apply() {
  const reduce = decide();
  const root = document.documentElement;
  if (reduce) root.dataset.motion = 'reduce';
  else delete root.dataset.motion;
  window.dispatchEvent(new Event(CHANGE));
}

export function isReducedMotion() {
  return typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduce';
}

/** Persist an explicit choice for this site and apply it immediately. */
export function setReducedMotion(reduce: boolean) {
  try {
    localStorage.setItem(MOTION_KEY, reduce ? 'reduce' : 'full');
  } catch {
    /* private mode, the preference just doesn't persist */
  }
  apply();
}

function subscribe(cb: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onOs = () => apply();
  mql.addEventListener('change', onOs);
  window.addEventListener(CHANGE, cb);
  return () => {
    mql.removeEventListener('change', onOs);
    window.removeEventListener(CHANGE, cb);
  };
}

/** Drop-in for framer-motion's hook, but answering the site's decision. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, isReducedMotion, () => false);
}
