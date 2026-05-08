# Security and Code Quality Audit
**Date**: 2026-05-07
**Branch**: audit/security-and-quality
**Scope**: full codebase as of commit `e0a5aef`

This is a **read-only audit**. No source files were modified during this scan. Findings below are recommendations; nothing is fixed yet.

The audit covers all 10 in-scope areas from the task brief: auth/authz, Supabase RLS migrations, edge functions, client-side input handling, secrets, dependencies, build/config, CORS, React-specific issues, and code quality. Files explicitly out of bounds (`src/integrations/lovable/`, `lovable-tagger` config, env var names, chunk-order rules) were not modified or planned for modification.

## Executive Summary
- **Total findings: 32**
- Critical: **0**
- High: **2**
- Medium: **6**
- Low: **8**
- Informational / Code Quality: **16**

The most pressing items are an unauthenticated edge function that lets any caller forge audit-trail rows for arbitrary `user_id`/`email` (`log-auth-event`), and the fact that `.env` is tracked in git with no `.gitignore` entry — today the committed values are anon publishable keys (intended to be public) so nothing is leaked, but the pattern guarantees a future secret addition will be silently committed.

The previously-suspected privilege-escalation path (a non-admin user setting their own `profiles.status = 'approved'`) is **already mitigated** by both an RLS `WITH CHECK` subquery and a `BEFORE INSERT/UPDATE` trigger added in the most recent two migrations. Defense-in-depth is in place.

---

## Critical Findings

None.

---

## High Findings

### H1. `log-auth-event` edge function accepts arbitrary `user_id`, `email`, `event_type` from the request body with no authentication
**File**: `supabase/functions/log-auth-event/index.ts:15`–`83`

The function:
- Has `Access-Control-Allow-Origin: *` and no auth check at all (no JWT verification, no shared secret).
- Reads `user_id`, `email`, `event_type`, `user_agent` directly from the JSON body and uses them verbatim.
- Connects with `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS.
- Inserts into `auth_events` with attacker-supplied values, and — if the client says it's "suspicious" by tripping the heuristics — also inserts into `admin_notifications` with attacker-controlled `user_email` and `message` strings.

**Why it matters**: anyone who knows the function URL (it's reachable from any browser) can:
- Forge login / failed-login / suspicious-activity rows under any real user's `user_id`/`email`, polluting the audit trail and shifting blame.
- Flood the admin dashboard's "Suspicious" tab with fake rows referencing real users.
- Inject arbitrary text into `admin_notifications.message` (it appears in the admin UI, escaped by JSX so no XSS, but social-engineering bait is trivial).
- A migration (`20260401204344_…`) explicitly added a hardened RPC `insert_auth_event(...)` that derives `user_id` from `auth.uid()` and validates `event_type` — this edge function does not call that RPC and bypasses both protections.

**Suggested fix (do not apply yet)**: require `Authorization: Bearer <jwt>`, derive `user_id`/`email` from `supabase.auth.getUser(token)`, drop the body params, validate `event_type` against the same allowlist used by the `insert_auth_event` RPC. Consider routing through that RPC with the user's anon-key client instead of using the service role.

---

### H2. `.env` is tracked in git and not listed in `.gitignore`
**Files**: `.env`, `.gitignore`

`git ls-files | grep .env` returns `.env`. The current `.gitignore` has no `.env`, `.env.*`, or `*.env` entry. The `.env` file's *current* contents are:

```
SUPABASE_PUBLISHABLE_KEY="<anon JWT>"
SUPABASE_URL="https://xyhyqukvfcshqwengxth.supabase.co"
VITE_SUPABASE_PROJECT_ID="xyhyqukvfcshqwengxth"
VITE_SUPABASE_PUBLISHABLE_KEY="<same anon JWT>"
VITE_SUPABASE_URL="https://xyhyqukvfcshqwengxth.supabase.co"
```

The JWT decodes to `"role": "anon"` — these are intended-public values, so **no live secret is exposed today**. But two real risks:

1. The next time anyone (or any tool) appends `SUPABASE_SERVICE_ROLE_KEY=…` or any third-party API key to `.env`, it will be auto-staged and committed without warning.
2. Git history will contain whatever was written, even if reverted later — rotation is the only remediation.

**Suggested fix**: add `.env`, `.env.local`, `.env.*.local` to `.gitignore`; then `git rm --cached .env` and re-add a `.env.example` with empty placeholders; brief contributors that secrets go in `.env.local` only. (No need to scrub history for the current contents since the leaked values are anon/public.)

---

## Medium Findings

### M1. `contact_messages` table allows direct INSERT from the anon role
**File**: `supabase/migrations/20260307190449_55db4996-….sql:13`

```sql
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
```

No `TO authenticated`, no condition on `auth.uid()`. The contact form goes through the `send-contact-email` edge function (which rate-limits by email), but **that path is bypassable**: anyone with the public anon key (which is the publishable key embedded in the SPA bundle) can directly `INSERT INTO contact_messages` with arbitrary `name`, `email`, `subject`, `message`, `user_id` — fully skipping the rate limiter.

**Suggested fix**: drop the public INSERT policy and require all writes to come through the edge function, which already uses the service role.

---

### M2. `send-contact-email` rate limiter is by email only
**File**: `supabase/functions/send-contact-email/index.ts:62`–`74`

`max 3 submissions per hour per email`. Trivially bypassed: an attacker varies the `email` field per request. No IP-based throttle, no CAPTCHA, no token bucket. Combined with **M1** (direct table insert), the contact endpoint has no effective abuse protection.

**Suggested fix**: add an IP-based rate limit (the function already extracts IP at line 24–27), or front the function with Cloudflare Turnstile / hCaptcha.

---

### M3. Admin `mailto:` template concatenates unvalidated `msg.email` into an href
**File**: `src/pages/Admin.tsx:626`

```tsx
<a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
```

`msg.email` comes from `contact_messages` which (per **M1**) accepts arbitrary attacker input. JSX escapes attribute values so attribute-injection XSS is blocked. But `mailto:` URLs accept `?cc=…&bcc=…&body=…` query params, and an attacker can submit:

```
email = "attacker@x.com?bcc=phish@evil.com&body=Please%20wire%20funds"
```

When the admin clicks "Reply", their mail client opens with the BCC and body pre-filled. Same risk applies to header smuggling within the local part. JSX does not encode `?`, `&`, or `%` inside attribute values when concatenated raw.

**Suggested fix**: validate `email` matches a strict regex on insert (in the edge function and / or as a CHECK constraint), and `encodeURIComponent(msg.email)` (or split + rebuild the URL) at render time.

---

### M4. `insert_auth_event(p_email, …)` trusts the email parameter
**File**: `supabase/migrations/20260401204344_e58d0e81-….sql:5`–`22`

The RPC correctly sets `user_id := auth.uid()` (good) but accepts `p_email` from the caller and inserts it verbatim. A logged-in user can spoof the email shown alongside their own auth events. The blast radius is small (`user_id` is correct, so an admin investigating can still resolve the real account), but the displayed email becomes untrustworthy.

**Suggested fix**: drop `p_email` from the signature; look it up server-side from `auth.users` using `auth.uid()`.

---

### M5. `handle_new_user()` writes `status = 'approved'` but the INSERT trigger silently rewrites it to `'pending'`
**Files**: `supabase/migrations/20260307190449_…sql:42`–`52` (sets `'approved'`) vs `20260410022008_…sql:7`–`11` (forces `'pending'` for non-admin)

The two triggers are wired in the right order so the *effective* signup status is `'pending'`, which is the intended behavior. But `handle_new_user` reads as if it auto-approves — anyone editing this trigger later will assume the workflow is auto-approval and may either re-introduce the bug (e.g., by removing the `prevent_status_self_change` INSERT branch) or change `handle_new_user` in ways that race with the trigger.

**Suggested fix**: change the literal in `handle_new_user` to `'pending'` (or omit the column entirely and rely on the column DEFAULT), so both layers tell the same story.

---

### M6. RLS policy "Users can update own non-status fields" is misnamed and relies on the trigger to enforce its name
**File**: `supabase/migrations/20260410022608_….sql:1`–`14`

The policy's `WITH CHECK` does *attempt* to forbid status changes via a subquery comparing `status` to the current row, with an admin override. Combined with the `prevent_status_self_change` trigger this is correct in practice. But:
- The policy name implies a column-level restriction it does not actually express.
- The subquery in `WITH CHECK` is unusual — a future maintainer may simplify it without realizing the trigger is the real load-bearing piece.

**Suggested fix**: keep both layers (defense in depth is good) but rename to "Users can update own profile" and add an SQL comment pointing to the trigger as the canonical enforcement.

---

## Low Findings

### L1. Three edge functions set `Access-Control-Allow-Origin: *`
**Files**:
- `supabase/functions/send-contact-email/index.ts:4`
- `supabase/functions/log-auth-event/index.ts:4`
- `supabase/functions/auth-email-hook/index.ts:13` and `:84`

For `auth-email-hook` the wildcard is harmless because the endpoint requires a valid Lovable webhook signature. For the other two, wildcard CORS lets any origin invoke from a browser; combined with H1/M1/M2 this widens the abuse surface.

**Suggested fix**: pin to the production origin (e.g. `https://vijaysinghpuwar.com`) and the Lovable preview origin pattern; respond with a 403 for everything else.

---

### L2. No security headers configured at the document level
**File**: `index.html:1`–`58`

Missing:
- `<meta http-equiv="Content-Security-Policy" content="…">`
- `<meta name="referrer" content="strict-origin-when-cross-origin">`

`X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy`, and `X-Content-Type-Options` cannot be set via meta and must be configured at the hosting layer (Lovable / Cloudflare). See "Recommended hosting headers" below.

---

### L3. `robots.txt` does not disallow `/admin`
**File**: `public/robots.txt`

The Admin page sets `<meta name="robots" content="noindex, nofollow" />` (Admin.tsx:355), but Helmet runs client-side only — non-JS crawlers see the empty SPA shell and the meta is never applied. Add `Disallow: /admin` for defense in depth.

---

### L4. Supabase session JWT stored in `localStorage` (Supabase SDK default)
**File**: `src/integrations/supabase/client.ts:13`

This is the framework default and is not a vulnerability per se, but any future XSS becomes account takeover. Worth flagging because the cost-benefit changes if XSS gets introduced via a markdown renderer or third-party widget.

---

### L5. `auth-email-hook` outer catch returns `error.message` to the response body
**File**: `supabase/functions/auth-email-hook/index.ts:296`–`303`

```ts
const message = error instanceof Error ? error.message : 'Unknown error'
return new Response(JSON.stringify({ error: message }), { status: 500, … })
```

If a downstream library throws with internal detail (paths, env-var hints) it leaks to the caller. The webhook endpoint only responds to authenticated callers (signature-verified) but the preview path does not gate this catch. Low-risk info disclosure.

---

### L6. `.env` carries unprefixed duplicates of the publishable key/URL
**File**: `.env` (tracked)

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are not consumed anywhere in `src/` (only `VITE_` variants are). They were likely added for an edge function or local script. Dead config; keep noise out of `.env` to reduce confusion. (Per project constraint, the `VITE_` names must not be renamed — this finding is purely about the *unprefixed duplicates*.)

---

### L7. `markNotificationsRead` issues N sequential UPDATE round-trips
**File**: `src/pages/Admin.tsx:182`–`189`

```ts
for (const n of unread) {
  await supabase.from('admin_notifications').update({ read: true }).eq('id', n.id);
}
```

Performance, not security. Use one `update().in('id', ids)` call.

---

### L8. `NotFound.tsx` logs the full pathname to console
**File**: `src/pages/NotFound.tsx:9`

```ts
console.error("404 Error: User attempted to access non-existent route:", location.pathname);
```

If logs are aggregated to a third-party tool, attacker-controlled URL fragments (including potential PII or secrets in query params) flow there. Tiny risk; remove the log or strip the path.

---

## Informational / Code Quality

### I1. No ErrorBoundary in the app
A render-time crash in any lazy-loaded chunk (`HeroShield`, `SkillsRadar`, `ProjectShowcase`, etc.) or in a page component blanks the entire app. Wrap routes (or at minimum each `<Suspense>` boundary) with a React error boundary that logs and shows a fallback.

### I2. Five page components are imported by nothing
`src/pages/About.tsx`, `Contact.tsx`, `Resume.tsx`, `Projects.tsx`, `ProjectDetail.tsx` are not registered in `App.tsx`'s `<Routes>` and not imported anywhere. The live `/contact` form lives inline in `Index.tsx`. Either delete these files or wire the routes.

### I3. `useProject(id)` hook is orphaned
`src/hooks/useProjects.tsx:59` is only consumed by the orphaned `ProjectDetail.tsx` (I2).

### I4. `src/components/ui/chart.tsx` is dead code; pulls in `recharts` (which pulls in `lodash`)
`grep` shows zero importers. This is a generated shadcn scaffold component. Removing it lets you drop the `recharts` and `lodash` dependency, which alone resolves two of the eleven `npm audit` findings (lodash high + lodash moderate).

### I5. `@mdx-js/rollup` + `@mdx-js/mdx` are dependencies but not configured
Not registered as a Vite plugin in `vite.config.ts` and not imported by any source file. Removing them resolves the `mdast-util-to-hast` advisory.

### I6. Six occurrences of `catch (err: any)` in `Admin.tsx`
Lines 175, 208, 221, 237, 248, 260. Should be `catch (err: unknown)` with type narrowing before reading `.message`.

### I7. `metadata: any` on `AuthEvent` interface and `as any` cast in Admin.tsx
`src/pages/Admin.tsx:79` types `metadata` as `any`; line 509 casts `val as any` for the access-level select. Tighten to `Record<string, unknown>` and the `'public' | 'basic' | 'admin'` enum.

### I8. Admin component is 596 lines mixing every concern
`src/pages/Admin.tsx:95`–`690`. Single component handles users tab, projects tab, messages tab, security tab, four RPCs/mutations, schema definitions, the form, helper sub-components, and two large `useEffect`s. Splitting per tab would meaningfully reduce cognitive load and make targeted changes safer.

### I9. Index.tsx contact form duplicates `Contact.tsx`
`src/pages/Index.tsx:79`–`105` and `:322`–`377` reproduce the form from the orphaned `Contact.tsx`. Pick one home for the form.

### I10. `handleProtectedAction(e, _target)` in Index.tsx is unused
`src/pages/Index.tsx:107` defines a function with an underscore-prefixed (intentionally unused) param; the function itself has no callers.

### I11. No client-side validation on the contact form
`src/pages/Index.tsx:88`–`105` and `Contact.tsx:25`–`42` rely entirely on HTML5 `required` plus the edge function's length check. No email-format validation, no length feedback before submit. Consider a small zod schema (already a project dependency).

### I12. `supabase.auth.getSession().then(…)` has no `.catch()`
`src/hooks/useAuth.tsx:55`. Network failure during boot becomes an unhandled promise rejection.

### I13. `setTimeout(() => fetchProfile(...), 0)` is uncancelled in useAuth
`src/hooks/useAuth.tsx:42`–`46`. Fires `setState` on the AuthProvider after unmount in theory; in practice the AuthProvider lives the lifetime of the app, so this is hypothetical. Worth a `clearTimeout` on cleanup if you ever extract the hook into a sub-tree.

### I14. `console.error` left in production code
`useAuth.tsx:79,85`, `useProjects.tsx:45,85`, `Admin.tsx:158`, `NotFound.tsx:9`. Not a vulnerability; consider routing through a thin `log()` helper so a future production logger is one-line.

### I15. `.github/workflows/*.yml` is a Jekyll deploy template
The committed workflow expects a Jekyll site under the repo root; this is a Vite/React SPA. If anyone enables GitHub Pages, the deploy will publish nothing useful (or fail). Delete the file or replace with a Vite-build → Pages workflow.

### I16. `index.html` preconnects to a Supabase project URL that doesn't match the configured one
`index.html:14` preconnects to `https://hveucrpuystdvuubaocv.supabase.co` but the configured project (per `.env`) is `xyhyqukvfcshqwengxth.supabase.co`. The actual data fetches go to the right place via the supabase-js client; this preconnect just wastes a TCP slot at page load and looks like leftover from a different project clone.

---

## Dependency Audit (npm audit)

`npm audit --omit=dev` reports **11 vulnerabilities (5 moderate, 6 high)**. Reachability assessment for each:

| Package | Severity | Brought in by | Reachable from app code? |
|---|---|---|---|
| `glob 10.2.0–10.4.5` | high | build tooling | No — CLI vuln, not invoked at runtime |
| `lodash <=4.17.23` | high (×2 advisories) + moderate | `recharts` only | **No** — `recharts` is only used by `chart.tsx` (I4) which is dead code |
| `minimatch 9.0.0–9.0.6` | high (×3 advisories) | build tooling (`glob`) | No — build-time only |
| `picomatch <=2.3.1 / 4.0.0–4.0.3` | high | build tooling | No — build-time only |
| `react-router 7.0.0–7.12.0-pre.0` | high (×4 advisories: CSRF, SSR XSS, ScrollRestoration XSS, open-redirect) | direct (`react-router-dom@7.9.3`) | **No** — app uses `<BrowserRouter>` + plain `<Routes>` only; no loaders, actions, ScrollRestoration, SSR, or untrusted-input `navigate(...)` calls (every `navigate()` and `<Navigate to=…>` uses a hardcoded path). All four advisories require those features. |
| `rollup 4.0.0–4.58.0` | high | build tooling | No — build-time only |
| `brace-expansion 2.0.0–2.0.2` | moderate | build tooling | No — build-time only |
| `mdast-util-to-hast 13.0.0–13.2.0` | moderate | `@mdx-js/rollup` (dead, see I5) | **No** — MDX plugin not registered |
| `postcss <8.5.10` | moderate | build tooling | No — build-time CSS pipeline |
| `yaml 2.0.0–2.8.2` | moderate | build tooling | No — build-time only |

Net runtime exposure today: **0 reachable advisories**. Eight of the eleven are pure build-tool noise; two more (lodash + mdast-util-to-hast) drop out the moment the `recharts` and `@mdx-js` dead deps are removed (I4, I5). The react-router family is the only one in actual runtime use; the four open advisories all require router features the app doesn't use.

Per the brief, no `npm audit fix` was run.

---

## CORS, Headers, and Hosting Recommendations

The edge functions all set wildcard CORS (L1). The SPA serves no headers from `index.html` beyond what the host provides.

**Recommended security headers to set at the hosting level (Lovable / Cloudflare)** — list only, not applied:

- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'` — tune per actual third-party origins
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or rely on `frame-ancestors 'none'` in CSP)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

---

## False Positives Considered

These looked like findings but are not, after verification:

- **`VITE_SUPABASE_PUBLISHABLE_KEY` exposed in the client bundle** — by design. Vite's `VITE_` prefix means client-public; the JWT decodes to `"role": "anon"` which is the role meant to be public. Real protection is RLS, which is enforced on every table.
- **`dangerouslySetInnerHTML` in `chart.tsx`** — the only occurrence, but it interpolates dev-controlled `THEMES`/`config` values into a `<style>` tag. The file is also dead code (I4). No untrusted input touches this path today.
- **React-Router 7 advisories (CSRF / SSR XSS / open-redirect / ScrollRestoration XSS)** — present in the dependency tree but require router features (data router actions, SSR, `<ScrollRestoration>`, untrusted-input navigation) that this app does not use. Verified by reading every `navigate()` and `<Navigate>` call.
- **`lodash` and `mdast-util-to-hast` advisories** — both come in via dependencies the app does not actually exercise (`recharts` only inside an unused file; `@mdx-js/rollup` not registered as a Vite plugin). Removing the dead deps removes the advisories.
- **`update_profile_status` RPC privilege escalation** — explicitly checks `has_role(auth.uid(), 'admin')` before any UPDATE, validates the new status against an allowlist, and is `SECURITY DEFINER` with a fixed `search_path`. Solid.
- **`user_roles` self-assignment** — only policies are SELECT-own and ALL-by-admin (with proper `WITH CHECK`). Anon role has no policy at all. Verified across `20260127172034_…` and `20260402043455_…`.
- **Profile `status` self-elevation** — protected at *three* layers: policy `WITH CHECK` subquery, `prevent_status_self_change` BEFORE trigger, and the `validate_profile_status` value-allowlist trigger. The original concern is fully mitigated.
- **`admin_notifications` spam by authenticated users** — early migration (`20260307083056_…`) tightened to `WITH CHECK (user_id = auth.uid())`, and the most recent (`20260402043455_…`) dropped that policy entirely so only `SECURITY DEFINER` triggers can insert. Closed.

---

## Out of Scope

Per the brief, the following were not audited or were noted-only:

- **Live website pen testing** — no DAST scanner available, no production credentials.
- **Supabase database internals** — no DB credentials; review limited to the SQL in `supabase/migrations/`.
- **Authenticated-flow black-box testing** — would need a real Google OAuth session.
- **`src/integrations/lovable/index.ts`** — explicit no-touch.
- **`supabase/functions/*`** — reviewed for findings, no edits proposed beyond suggestions.
- **`vite.config.ts` chunk-order rules** — left as-is to avoid the React/Radix vendor-chunk regression.
- **Env var renaming** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` left as-is per project rule.

---

## Recommended Fix Order

Suggested grouping for follow-up PRs. Each bundle is self-contained and reviewable on its own. Apply in order; each unblocks or de-risks the next.

**PR 1 — Secrets hygiene** (low diff, high latent value)
- Add `.env`, `.env.local`, `.env.*.local` to `.gitignore`.
- `git rm --cached .env`; commit a `.env.example` with empty placeholders.
- Optional: rotate the anon key just to establish the rotation muscle (low value because the leaked key is anon).
- Drop the unprefixed `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` duplicates from `.env.example` (L6).

**PR 2 — Lock down `log-auth-event`** (closes H1)
- Require `Authorization: Bearer <JWT>`; reject without it.
- Use `supabase.auth.getUser(token)` to derive `user_id`/`email`; ignore body values for those fields.
- Validate `event_type` against the same allowlist used by `insert_auth_event`.
- Restrict CORS to the production origin (also addresses L1 for this function).

**PR 3 — Lock down the contact write path** (closes M1, M2)
- Drop the `Anyone can submit contact` RLS policy on `contact_messages` so direct anon inserts are refused.
- Add IP-based rate limiting in `send-contact-email` (the IP is already available at index.ts:24).
- Optional: integrate Cloudflare Turnstile for a bot-resistant signal.
- Restrict CORS to the production origin (L1 cont.).

**PR 4 — Render-time hardening in admin** (closes M3)
- Validate `email` format on insert (regex in `send-contact-email`, plus a CHECK constraint on `contact_messages.email`).
- Build the `mailto:` href via `URL`/encoding rather than string concatenation.

**PR 5 — Drop dead deps + dead UI** (closes I4, I5; eliminates 3 npm audit findings)
- Delete `src/components/ui/chart.tsx`.
- `npm uninstall recharts @mdx-js/rollup @mdx-js/mdx` (and any orphaned transitives).
- Remove the orphaned `vite.config.ts` chart-vendor chunk rule that won't match anything afterwards (do **not** touch the React/Radix rules).

**PR 6 — Decide on the orphan pages** (closes I2, I3, I9)
- Either register `/about`, `/contact`, `/resume`, `/projects`, `/projects/:id` in `App.tsx` (and keep the corresponding pages), or delete those page files plus `useProject(id)`.
- Remove the duplicated contact form from `Index.tsx` if `Contact.tsx` is kept.

**PR 7 — Defense-in-depth headers** (closes L2, L3)
- Add CSP and Referrer-Policy meta tags in `index.html`.
- Add `Disallow: /admin` to `public/robots.txt`.
- Configure HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy at the hosting layer (out-of-repo).

**PR 8 — Auth-event RPC tightening** (closes M4)
- Change `insert_auth_event` to drop `p_email` and look the email up server-side.
- Update `log-auth-event` (post-PR 2) to match the new signature.

**PR 9 — Trigger/policy clarity** (closes M5, M6)
- Change `handle_new_user` to write `'pending'` literally so its behavior matches reality.
- Rename the misnamed RLS policy and add a SQL comment cross-referencing the trigger.

**PR 10 — Code quality batch** (closes I1, I6, I7, I8, I11, I12, I14)
- Add an `<ErrorBoundary>` at the App root (and per `<Suspense>` if appetite exists).
- Replace `catch (err: any)` with `catch (err: unknown)` + narrowing in Admin.
- Tighten `metadata: any` and `as any` in Admin.
- Add a zod schema to the contact form and run it before `supabase.functions.invoke`.
- Add `.catch()` to the `getSession()` boot promise in useAuth.
- Optional: split `Admin.tsx` per tab.

**PR 11 — CI cleanup** (closes I15)
- Replace the Jekyll workflow with a Vite-build → Pages (or other host) workflow, or delete it.

**PR 12 — Trivial cleanup** (closes I10, I13, I16)
- Drop `handleProtectedAction` and its caller checks if truly unused.
- Fix or remove the wrong `preconnect` URL in `index.html`.
- Add a `clearTimeout` in the useAuth setTimeout cleanup.

---

*End of audit. Awaiting review before any fixes are applied.*
