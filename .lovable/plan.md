## Root cause found

The public homepage calls `useProjects()` in `src/pages/Index.tsx`, which reads `public.projects` through `src/hooks/useProjects.tsx`. Signed-in sessions also call `fetchProfile()`, `checkAdminRole()`, and `updateLastLogin()` in `src/hooks/useAuth.tsx`, which read/update `public.profiles` and read `public.user_roles`.

The repeated visible toast text appears to already be removed in the current source, but the defensive fallback should be tightened so missing-table errors never retry, never set public error state, and never log noisy `Error fetching ...` output.

## Tables currently read by public/session code

- `projects` from `src/hooks/useProjects.tsx`
- `profiles` from `src/hooks/useAuth.tsx`
- `user_roles` from `src/hooks/useAuth.tsx`

Admin-only code also reads `projects`, `profiles`, `project_access`, `admin_notifications`, `contact_messages`, and `auth_events` from `src/pages/Admin.tsx`; I will not change admin behavior except if needed to avoid public homepage noise.

## Plan

1. Add a shared small helper for optional backend errors
   - Detect `PGRST205` and schema-cache missing-table messages consistently.
   - Keep it local/minimal so no generated integration files are edited.

2. Harden `src/hooks/useAuth.tsx`
   - Ensure `profiles` missing-table errors resolve as `profile = null` with no toast, no retry, and no `profileError`.
   - Ensure `user_roles` missing-table errors silently set `isAdmin = false`.
   - Ensure `updateLastLogin()` does not create console noise or retry loops if `profiles` or logging function support is unavailable.
   - Preserve Google auth, admin checks when tables exist, protected route behavior for genuine non-optional failures, and contact form prefill when profile exists.

3. Harden `src/hooks/useProjects.tsx`
   - Ensure `projects` missing-table errors resolve to an empty DB project list and `error = null`.
   - Keep `Index.tsx` fallback behavior so local `src/data/projects.json` renders normally.
   - Apply the same missing-table handling to `useProject(id)` so individual project routes do not spam console if the table is unavailable.
   - Avoid repeated noisy logs; if logging is kept, make it development-only and at most warning-level for non-missing-table failures.

4. Preserve static public content
   - Leave skills, education, experience, hero, contact links, and social links untouched because they are already local/static on the homepage.
   - Leave project static fallback merging in `Index.tsx` intact.

5. Verification after implementation
   - Inspect source for any remaining `Couldn't load your profile, retrying...`, `Error fetching projects`, and `Error fetching profile` strings.
   - Run the project validation available in the environment after edits.
   - Check browser console on the preview homepage for absence of repeated profile/project errors and toast spam.
   - Check the current viewport plus a mobile-sized viewport visually enough to confirm homepage layout remains intact.

## Files expected to change

- `src/hooks/useAuth.tsx`
- `src/hooks/useProjects.tsx`

No migrations, redesigns, generated Supabase client edits, SEO edits, resume/contact/project design changes, or unrelated refactors.