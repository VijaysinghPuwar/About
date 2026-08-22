// Post-sign-in destination handling.
//
// The OAuth `redirectTo` must always be the public `/auth/callback` route, so
// the intended destination is carried separately: `/login?next=<path>` →
// sessionStorage → consumed by `/auth/callback` after the session lands.

const KEY = 'auth:next';

/** Only same-origin relative paths are allowed (no `//host`, no absolute URLs). */
export function sanitizeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  if (/^\/(login|auth\/callback)\b/.test(value)) return null;
  return value;
}

/** Build `/login?next=<current path>` for Sign In links and gated actions. */
export function loginHref(currentPath?: string): string {
  const path =
    sanitizeNext(currentPath) ??
    (typeof window !== 'undefined'
      ? sanitizeNext(window.location.pathname + window.location.search + window.location.hash)
      : null);
  return path ? `/login?next=${encodeURIComponent(path)}` : '/login';
}

export function storeNext(value: string | null | undefined): void {
  const safe = sanitizeNext(value);
  if (typeof window === 'undefined') return;
  try {
    if (safe) window.sessionStorage.setItem(KEY, safe);
  } catch {
    // storage unavailable (private mode) — fall back to default destination
  }
}

export function consumeNext(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return sanitizeNext(value);
  } catch {
    return null;
  }
}
