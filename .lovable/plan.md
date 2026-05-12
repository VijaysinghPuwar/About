# Fix Auth: Restore Real Supabase Client Config

## Audit of current state

- **`src/integrations/supabase/client.ts`** — Already reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (correct names). Already has placeholder fallback. **Missing**: `detectSessionInUrl: true`, and uses `console.warn` instead of `console.error`.
- **`src/pages/AuthCallback.tsx`** — Already exists, calls `exchangeCodeForSession(window.location.href)`, redirects to `/` on success and `/login` on failure with toast. Route registered in `src/App.tsx` at `/auth/callback`. ✅ Correct.
- **`src/pages/Login.tsx`** — GitHub OAuth uses `redirectTo: ${window.location.origin}/auth/callback`. Magic link uses `emailRedirectTo: ${window.location.origin}/auth/callback`. ✅ Correct.
- **Google sign-in** — Goes through `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` (managed Lovable Cloud flow, not raw Supabase). This is the recommended path and should not be changed.

## Single change required

Edit **`src/integrations/supabase/client.ts`**:

1. Switch the missing-env-var log from `console.warn` to `console.error` with the exact message specified:
   `[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Auth and database calls will fail. Check Lovable Cloud → Secrets.`
2. Add `detectSessionInUrl: true` to the `auth` options so PKCE/magic-link tokens are parsed automatically on the callback route.
3. Keep the placeholder fallback (`https://placeholder.supabase.co` / `placeholder-anon-key`) and the `??` operators so module evaluation never throws.
4. Keep the auto-generated header comment and existing `storage` / `persistSession` / `autoRefreshToken` options.

## Already correct — no changes

- Env var names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- `/auth/callback` route and its `exchangeCodeForSession` logic
- GitHub `signInWithOAuth` redirectTo
- Magic link `signInWithOtp` emailRedirectTo
- Google sign-in via `lovable.auth.signInWithOAuth`

## Verification after rebuild

- Console shows no `[supabase] Missing ...` error.
- Network tab: Google / GitHub / magic-link requests target `https://hveucrpuystdvuubaocv.supabase.co/auth/v1/...` (or the Lovable OAuth broker for Google, which is expected for the managed flow).
- Callback at `/auth/callback?code=...` resolves session and lands on `/`.

## Constraints respected

No UI changes. No new dependencies. No renamed secrets. No other files modified.