# Fix Supabase Missing-Table Errors & Toast Spam

## Root cause

The published site loads against a Supabase project whose schema cache does not contain `public.projects` or `public.profiles` (error code `PGRST205`). Two pieces of code react badly:

1. `src/hooks/useAuth.tsx` (`fetchProfile`) — on any error, calls `toast.error("Couldn't load your profile, retrying…")` and schedules a retry. For a signed-in visitor on a misconfigured backend this fires every auth event → the stack of red toasts seen in the screenshot.
2. `src/hooks/useProjects.tsx` — on error, sets `error` state and logs `Error fetching projects:` to the console. It is invoked on the homepage even for anonymous visitors (via `Index.tsx` → `useProjects()`), so every page load logs the PGRST205 error. `Index.tsx` already falls back to `projectsData` from `@/data/projects.json`, so the UI is fine — only the noise is the problem.

The homepage does **not** actually need Supabase data to render. The static `projects.json` already covers the "Featured Projects" gate copy for anonymous users.

## Changes

### 1. `src/hooks/useAuth.tsx` — silent profile fetch
- Remove both `toast.error("Couldn't load your profile, retrying…")` calls (lines ~95 and ~111).
- Keep the single silent retry and the `profileError` state (so `ProtectedRoute` can still render its inline error UI for authenticated routes — unchanged behavior there).
- Detect the "table missing" case (`error.code === 'PGRST205'` or message includes `schema cache`) and treat it like "no profile row": set `profile = null`, clear `profileError`, skip the retry. This prevents the retry loop entirely when the backend simply doesn't have the table.
- Downgrade `console.error('Error fetching profile:', error)` to a single `console.warn` only when it's not the schema-cache case; suppress entirely for PGRST205.

### 2. `src/hooks/useProjects.tsx` — silent project fetch
- Same PGRST205 / schema-cache detection: when the table is missing, set `projects = []`, `error = null`, and return without logging. `Index.tsx`'s merge with `projectsData` then renders the static list.
- For real errors, keep a single `console.warn` (not `console.error`) so it doesn't show as a red error and doesn't trip Lovable's runtime-error overlay.

### 3. No other files changed
- `Index.tsx`, `ProjectShowcase`, `Admin`, `ProtectedRoute`, design, mobile, animation, contact, resume — untouched.
- No schema migrations. The site must work against either Supabase project (with or without these tables) without code changes.
- `client.ts` and `types.ts` left alone (auto-generated).

## Verification

- Reload `/` while signed out → no red toasts, no `Error fetching projects` in console, featured-projects gate still shows the "Sign in" card.
- Reload `/` while signed in → no profile toasts, projects render from static JSON if DB tables missing, from DB otherwise.
- `/admin` still functions when tables exist (Admin.tsx unchanged).
- `ProtectedRoute` still shows its inline "Couldn't load your profile" screen if a genuine network error occurs on an authenticated route (not the missing-table case).

## Out of scope

Design, layout, education/coursework content, resume PDF, contact form, auth flow, RLS, migrations.
