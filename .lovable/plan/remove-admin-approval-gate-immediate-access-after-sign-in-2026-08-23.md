# Remove Admin Approval Gate — Immediate Access After Sign-In

## Audit findings (verified in code + database)

Where the approval gate lives today:

- `src/components/ProtectedRoute.tsx` — after auth resolves, it requires a `profiles` row and redirects `status === 'pending'` to `/pending`, `blocked` to `/blocked`.
- `src/pages/Login.tsx` — post-sign-in effect routes to `/pending` unless `profile.status === 'approved'`.
- `src/pages/Pending.tsx` + route `/pending` in `src/App.tsx` — the waiting screen.
- `src/pages/Blocked.tsx` — bounces `pending` users to `/pending`.
- `src/pages/Admin.tsx` — admin UI for approving/pending users (legitimate admin tool).
- `src/lib/mcp/tools/get-my-access.ts` — reports status text.

Database side:

- `profiles.status` (`pending` | `approved` | `blocked`), default `'pending'`.
- `handle_new_user()` inserts new profiles with `'approved'`, but the `BEFORE INSERT` trigger `prevent_status_self_change()` overwrites it to `'pending'` for any non-admin caller — so every new signup lands as **pending** today. This is the real root of the wait.
- No RLS policy on any table uses `status`; access control is `auth.uid()` and `has_role(..., 'admin')` only. So removing the gate does not weaken RLS.

`ProtectedEmail` and the resume gate already check only `user` from `useAuth()` — no approval check there. Public projects use the `access_level = 'public'` policy and stay public.

## Changes

1. **Database (non-destructive, no column drops)**
   - Update `prevent_status_self_change()` so it no longer forces `'pending'` on INSERT; it keeps blocking users from changing their own status on UPDATE (admins only, via `update_profile_status`).
   - Change `profiles.status` default to `'approved'`.
   - Backfill existing `pending` rows to `approved` (they were only pending because of the old flow). `blocked` rows are left untouched.

2. **`src/components/ProtectedRoute.tsx`**
   - Keep: loading state, `!user` → `/login?next=...`, `requireAdmin && !isAdmin` → `/`.
   - Keep the `blocked` redirect (moderation still works).
   - Remove the `pending` redirect and the "no profile row → login" bounce, so a valid session is enough.

3. **`src/pages/Login.tsx`**
   - On authenticated session: go to `consumeNext() ?? '/'`, except `blocked` → `/blocked`. No longer waits for a profile row.

4. **`src/pages/Blocked.tsx`** — remove the `pending` branch.

5. **`/pending`** — remove the route from `src/App.tsx` and delete `src/pages/Pending.tsx`. Nothing else links to it after the above edits.

6. **Kept as-is** — Admin dashboard (still admin-only, still shows/edits status for blocking), `ProtectedEmail`, resume gate, `?next=` flow, Google/GitHub/magic-link sign-in, `useAuth`, `/auth/callback`, project ref `xyhyqukvfcshqwengxth`.

## Verification

Typecheck plus a browser pass: signed-out resume → login redirect preserves `?next=/resume`; masked vs revealed email; admin route still blocks a normal user.

## Out of scope

The `Unsupported provider: missing OAuth secret` error is a backend provider-credential setting (Cloud → Users → Authentication Settings → Google), untouched by this change.
