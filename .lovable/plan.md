# Fix OAuth sign-in (Google + GitHub)

## Diagnosis

**Env vars (preview build):** `.env` in the sandbox contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` — all set. So the **preview** build has them. The published site at `vijaysinghpuwar.com` is a separate deploy and may be stale.

### SYMPTOM 2 — GitHub "placeholder.supabase.co" / NXDOMAIN
Root cause: the failing browser is hitting a **stale published build** that was created before the Supabase env vars existed. In `src/integrations/supabase/client.ts` we deliberately fall back to `https://placeholder.supabase.co` when the vars are missing, exactly to avoid a hard module-eval crash. That fallback URL is what's producing NXDOMAIN. The GitHub button code itself is correct (`provider: 'github'`, `redirectTo: ${window.location.origin}/auth/callback`). The fix is a fresh **Publish** after env vars were added — no code change required for GitHub itself, beyond the diagnostic logs we'll add.

### SYMPTOM 1 — Google lands on `/` unauthenticated
Two real bugs cooperating:

1. **Callback fights with `detectSessionInUrl`.** `client.ts` has `detectSessionInUrl: true`, and `src/pages/AuthCallback.tsx` *also* calls `supabase.auth.exchangeCodeForSession(window.location.href)`. Whichever runs second sees an already-consumed `code` and errors → callback toasts "Sign-in failed" and bounces to `/login`, OR (for the Lovable-managed Google flow) the browser is redirected back to `window.location.origin` (i.e. `/`, **not** `/auth/callback`), so the callback handler never runs at all and the home page renders before the async `setSession` from the Lovable SDK completes.

2. **Google uses the Lovable-managed flow** (`lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`). That SDK posts tokens and calls `supabase.auth.setSession(...)` itself — but only on the return navigation, and `Login.tsx`'s redirect `useEffect` already moved the user to `/` before `onAuthStateChange` fires. Net effect: home page renders with `user === null`.

The clean fix is to let `detectSessionInUrl` do its job and make the `/auth/callback` route a passive waiter that just polls `getSession()` once, then routes. No `exchangeCodeForSession` call.

## Code changes (minimal, scoped)

1. **`src/integrations/supabase/client.ts`** — add module-load diagnostic logs (booleans only, no values):
   ```ts
   console.log('[supabase] URL set:', !!import.meta.env.VITE_SUPABASE_URL);
   console.log('[supabase] KEY set:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
   ```
   Leave `detectSessionInUrl: true` and the placeholder fallback as-is.

2. **`src/pages/AuthCallback.tsx`** — remove the `exchangeCodeForSession` call. New behavior: render a loading spinner, wait for `supabase.auth.getSession()` (and one `onAuthStateChange` tick) to confirm a session, then `navigate('/', { replace: true })`. On error or timeout (~5 s), show an inline error with a link back to `/login` instead of silently redirecting.

3. **`src/hooks/useAuth.tsx`** — keep `loading` true until *both* the initial `getSession()` resolves *and* the first `onAuthStateChange` event has fired with the resulting session. This closes the race that lets `Login.tsx` and `ProtectedRoute` decide before the Lovable SDK's `setSession` lands. (`ProtectedRoute` already gates on `loading`, so this is the right place.)

4. **`src/pages/Login.tsx`** — in the redirect `useEffect`, additionally guard on `!authLoading` (already there) and ensure no redirect happens until `profile` is fetched. Currently OK; verify only.

No UI changes. No new deps. No changes to `lovable/index.ts`, route table, or migrations.

## Verification (after changes)

- Reload preview → console shows `[supabase] URL set: true`, `KEY set: true`.
- Click "Continue with Google" → return to `/` → `useAuth` finishes loading → `Login.tsx` redirect (or home page) shows authenticated state.
- Click "Continue with GitHub" in **preview** → redirects to `github.com/login/oauth/...` (real Supabase URL), not `placeholder.supabase.co`.
- For the live site: user must click **Publish → Update** so `vijaysinghpuwar.com` picks up the env vars and new code.

Diagnostic `console.log`s stay until the user confirms end-to-end sign-in works.
