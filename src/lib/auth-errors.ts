// Shared OAuth error parsing + identity-conflict detection.

export const IDENTITY_CONFLICT_MESSAGE =
  'This email is already linked to a different sign-in method. Please continue with the provider you originally used to create the account.';

export interface ParsedOAuthError {
  error: string;
  errorCode: string;
  errorDescription: string;
}

export function parseOAuthErrorFromUrl(): ParsedOAuthError | null {
  if (typeof window === 'undefined') return null;

  const fromHash = new URLSearchParams(
    window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash,
  );
  const fromSearch = new URLSearchParams(window.location.search);

  const pick = (key: string) => fromHash.get(key) || fromSearch.get(key) || '';

  const error = pick('error');
  const errorCode = pick('error_code');
  const errorDescription = decodeURIComponent((pick('error_description') || '').replace(/\+/g, ' '));

  if (!error && !errorCode && !errorDescription) return null;
  return { error, errorCode, errorDescription };
}

export function isIdentityConflictError(code?: string | null, description?: string | null): boolean {
  const c = (code || '').toLowerCase();
  if (
    c === 'identity_already_exists' ||
    c === 'email_exists' ||
    c === 'user_already_exists' ||
    c === 'provider_email_needs_verification'
  ) {
    return true;
  }
  const d = (description || '').toLowerCase();
  return /already\s+(registered|exists|linked)|identity.*exist|user already registered/.test(d);
}
