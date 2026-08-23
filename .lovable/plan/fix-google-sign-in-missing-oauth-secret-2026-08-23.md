# Fix Google sign-in: "missing OAuth secret"

## What's happening

The auth logs show every `/authorize` request failing with `validation_failed: missing OAuth secret`. That means the Google provider on the current backend has no client credentials attached, so the provider rejects the request before Google is ever reached. This is a backend provider-configuration problem, not a bug in the sign-in UI.

Also relevant: `signInWithGoogle` in `src/hooks/useAuth.tsx` calls `supabase.auth.signInWithOAuth('google', ...)` directly. On Lovable Cloud the supported path is the managed auth helper, which handles the popup/redirect and session correctly in both the editor preview and production.

## Plan

1. Enable Google as a managed social provider on the backend (Configure Social Login). This attaches working Google credentials, which removes the "missing OAuth secret" error. Email/magic-link and GitHub stay as they are.
2. Update `signInWithGoogle` in `src/hooks/useAuth.tsx` to use the managed helper:
   - `lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth/callback` })`
   - Keep the same `{ error }` return shape so `Login.tsx` needs no change.
   - Handle the `redirected` case (browser navigates away) and the token case (session already set — let `/auth/callback` and the existing `?next=` logic take over).
3. Leave `/auth/callback`, `?next=` redirect handling, `ProtectedEmail`, `ProtectedRoute`, and all UI untouched.
4. Verify: typecheck, then load `/login` headless and confirm the Google button triggers the managed flow with no console errors. Full end-to-end Google consent must be confirmed by you after publishing.

## Note

If you would rather use your own Google Cloud client ID/secret for branding, that is configured in Cloud → Users → Authentication Settings → Google, and that panel shows the exact callback URL to register. Your existing callback `https://xyhyqukvfcshqwengxth.supabase.co/auth/v1/callback` is correct for this backend either way.
