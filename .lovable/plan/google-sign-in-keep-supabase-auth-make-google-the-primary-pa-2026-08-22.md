# Google Sign-In: keep Supabase Auth, make Google the primary path

## Audit findings (verified in code)

- Session owner: Supabase Auth. `src/hooks/useAuth.tsx` uses `supabase.auth.onAuthStateChange` + `getSession`, and loads a `profiles` row (`status: pending | approved | blocked`) plus `user_roles` for admin.
- Google is already wired natively: `signInWithGoogle()` calls `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin + '/auth/callback' })`. `/auth/callback` waits for the session, then always navigates to `/`.
- `/login` currently offers three methods: Google, GitHub, and email magic link.
- `ProtectedRoute` expects a Supabase user + profile; `/admin` is the only protected route. `ProtectedEmail.tsx` gates the address on `useAuth().user`.
- `src/pages/Resume.tsx` exists but is **not** registered as a route in `App.tsx` (routes: `/`, `/login`, `/auth/callback`, `/pending`, `/blocked`, `/admin`, `*`). Resume content is reached from the single-page `Index`.
- `.env` points at project `xyhyqukvfcshqwengxth`, but `src/integrations/supabase/client.ts` has a hardcoded fallback for a **different, older project** (`hveucrpuystdvuubaocv`). If the build ever misses the env vars, the app silently talks to the wrong backend — this matches the earlier production breakage.

**Recommendation: Option A** — Google OAuth through the existing Supabase Auth. No rewrite; Supabase keeps owning session, UUIDs, RLS, profiles, and roles.

## What will change

1. **Login page** — make "Continue with Google" the single primary action with the cyber-styled `SECURE ACCESS` heading and the supporting line "Authentication is handled securely through Google." GitHub and magic link move below a subtle "Other options" divider (kept working, de-emphasised). Existing dark/grid/glass styling preserved.
2. **Return-to destination** — `ProtectedEmail`, `ProtectedRoute`, and the nav Sign In button pass the current path as `?next=`. `/login` stores a validated same-origin relative path in `sessionStorage`, and `/auth/callback` navigates there after the session lands (falling back to `/`, and to `/pending` / `/blocked` per profile status). No protected route is used as the OAuth `redirectTo` — that stays `${origin}/auth/callback`.
3. **Client fallback fix** — replace the stale hardcoded project fallback in `src/integrations/supabase/client.ts` with the current project's URL and publishable key, so a missing env var can never point the app at a dead backend.
4. **Provider config** — enable/verify the Google provider on the backend with your Google Cloud Web client. Scopes stay the default minimum: `openid email profile`. The client secret is stored provider-side only; nothing Google-related enters the frontend bundle.
5. No changes to `ProtectedEmail` masking behaviour, RLS, profile/pending logic, homepage, or any visual system beyond the login card.

## Google Cloud Console values

Authorized JavaScript origins:
```text
https://vijaysinghpuwar.com
https://www.vijaysinghpuwar.com
http://localhost:8080
```

Authorized redirect URI (single, Supabase-owned — do not invent others):
```text
https://xyhyqukvfcshqwengxth.supabase.co/auth/v1/callback
```

Site/redirect allow-list on the backend must include `https://vijaysinghpuwar.com/auth/callback`, `https://www.vijaysinghpuwar.com/auth/callback`, and `http://localhost:8080/auth/callback`.

## Verification

TypeScript check, production build, and a headless pass over `/` and `/login` at 360/390/430 px and desktop to confirm no overflow, no flash of protected content while auth is loading, and the logged-out masked email stays masked.

## Open question

Should I keep GitHub and magic-link sign-in as secondary options, or remove them so Google is the only method? The plan currently keeps them.
