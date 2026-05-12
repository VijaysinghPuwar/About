## Goal

When a user tries to sign in with one provider but their email is already registered with another, surface a clear error instead of silently bouncing to home.

## Changes

### 1. `src/pages/AuthCallback.tsx`

Before waiting on session, parse OAuth errors from both `window.location.hash` (fragment, used by implicit OAuth flows) and `window.location.search` (used by PKCE/code flows):

- Read `error`, `error_code`, and `error_description` from each.
- Detect identity-conflict cases by checking `error_code` for values like `identity_already_exists`, `email_exists`, `provider_email_needs_verification`, or `error_description` matching `/already (registered|exists|linked)|identity.*exist/i`.
- If detected, render a dedicated message:
  > "This email is already linked to a different sign-in method. Please continue with the provider you originally used to create the account."
  Plus a generic fallback that shows `error_description` for any other OAuth error.
- If any OAuth error present, do NOT start the session-wait timer; render the error UI immediately with the existing "Back to sign in" link to `/login`.
- Keep the existing success path (session detected → `navigate('/')`) and the 6 s "could not complete" timeout untouched for the no-error case.

### 2. `src/hooks/useAuth.tsx`

In `signInWithGoogle`:

- After `lovable.auth.signInWithOAuth(...)`, inspect `result.error` and `result.error_description` (or `.message`) for the same identity-conflict patterns.
- If matched, return `{ error: new Error('This email is already registered with a different sign-in provider. Please use that provider to sign in.') }` so `Login.tsx`'s existing `toast.error` shows a meaningful message before any redirect.
- Non-conflict errors keep their original message.

Add a small helper `isIdentityConflictError(code?, description?)` at module scope (shared with AuthCallback via a new tiny util `src/lib/auth-errors.ts`) so both files use the same detection logic.

### 3. `src/lib/auth-errors.ts` (new)

Exports:
- `parseOAuthErrorFromUrl()` — reads hash + search, returns `{ error, errorCode, errorDescription } | null`.
- `isIdentityConflictError(code?, description?)` — boolean.
- `IDENTITY_CONFLICT_MESSAGE` — the user-facing copy.

### 4. GitHub sign-in

`Login.tsx` calls `supabase.auth.signInWithOAuth({ provider: 'github' })` directly. That call only errors for client-side issues; identity conflicts surface only after the GitHub redirect lands back on `/auth/callback`. The AuthCallback URL parsing in change #1 already covers GitHub. No change needed in `Login.tsx`.

## Out of scope

- No UI redesign of the login page or callback spinner.
- No changes to successful sign-in routing.
- No changes to Supabase config, RLS, or providers.
- No new dependencies.

## Verification

- Manually append `#error=server_error&error_code=identity_already_exists&error_description=Identity+already+exists` to `/auth/callback` URL → see the inline conflict message and "Back to sign in" link, no redirect.
- Normal Google sign-in still lands on `/`.
- Normal GitHub sign-in still lands on `/`.