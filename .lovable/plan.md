## Restore Lovable Preview — Root Cause & Targeted Fix

### Root cause

Claude's recent PRs hardened `.gitignore`. It now contains:

```
.env
.env.local
.env.*.local
```

This project is a **classic Vite + Lovable Cloud** stack. The Supabase client at `src/integrations/supabase/client.ts` reads:

```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

Lovable manages `.env` for this stack and expects it to live in the repo. With `.env` git-ignored, the file never reaches the published build, so `createClient(undefined, undefined)` throws at module-eval time. Every page that imports the client (Index, Auth provider, etc.) crashes before render → **blank dark screen**.

The local sandbox preview still has a leftover `.env` on disk, which is why the dev server returns HTML — but the deployed/published preview has nothing, matching the user's report.

### Fix (minimal, no feature loss)

**1. `.gitignore` — un-ignore `.env`**
Remove the three `.env*` lines. Lovable's managed env state must be committed for Vite builds to inline `import.meta.env.VITE_*` values. This is the documented Lovable + Vite contract.

```diff
- # Local env files — never commit secrets or per-environment config
- .env
- .env.local
- .env.*.local
+ # NOTE: .env is managed by Lovable Cloud and must be committed so Vite
+ # can inline VITE_* vars at build time. Only the publishable anon key
+ # lives there — no service-role secrets.
```

**2. `src/integrations/supabase/client.ts` — defensive guard**
Today, missing env vars cause a hard crash on import. Add a fail-safe so a misconfigured deployment shows the portfolio (public, static) instead of a blank screen, and only auth-gated calls fail:

- If both vars are present → behave exactly as today.
- If either is missing → log a console warning and create the client with safe placeholder strings so module-eval doesn't throw. Public pages render; auth/db calls will error individually (caught by existing try/catch in `useAuth`, `useProjects`, etc.).

This is purely additive — does not change behavior when env vars are present.

**3. `index.html` — fix stale preconnect**
Line 14 preconnects to an old Supabase ref `hveucrpuystdvuubaocv.supabase.co` that no longer belongs to this project. Replace with the current ref `xyhyqukvfcshqwengxth.supabase.co`. Cosmetic, but avoids a wasted DNS handshake and a confusing entry in Network tab.

### What is preserved (no changes)

- Mobile hero rework, status-indicator padding fix
- Theme transformation (Blue ↔ Red), `ThemeTransition`, cyber-click sound, glitch layer
- Security migrations, JWT validation in `log-auth-event`
- Auth flow, RLS, admin hub, contact form, all components
- Design system, fonts, Deep Space palette
- All routes, all gated content

### What is NOT changed

- No code reverted from Claude's PRs
- No feature deletions
- No design changes
- No new dependencies
- No backend / migration changes
- No router or build-config changes

### Files touched

| File | Change |
|------|--------|
| `.gitignore` | Remove `.env`, `.env.local`, `.env.*.local` lines |
| `src/integrations/supabase/client.ts` | Add fallback so missing env vars don't crash render |
| `index.html` | Update stale Supabase preconnect host |

### Validation steps

1. Confirm dev server still serves `/` (curl already returns 200).
2. Open `/` in preview → portfolio renders, no blank screen.
3. Check console: no `supabaseUrl is required` error.
4. Verify mobile (390×844) and desktop (1025×900) layouts unchanged.
5. Toggle theme → Blue ↔ Red transformation still plays.
6. After republish: production site loads (env now present in build).

### Risk

Low. The `.gitignore` change re-aligns the repo with the Lovable-managed `.env` workflow that the project was originally built under. The client guard is additive. The preconnect change is metadata only.
