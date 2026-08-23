# Backend Audit — No Changes Made

No backend, environment, or authentication changes were made. This is a read-only audit.

## Answers

**1. Which Supabase project ref does the production website currently use?**

`hveucrpuystdvuubaocv` — the *old, dead* project.

Evidence: the live JavaScript bundle served from `https://vijaysinghpuwar.com` (`/assets/index-BTEyTO_E.js`) contains exactly one backend hostname, `hveucrpuystdvuubaocv.supabase.co`. The correct ref appears nowhere in it.

**2. Which Supabase project ref does the Lovable preview use?**

`xyhyqukvfcshqwengxth` — correct and current. Confirmed in `.env`, `supabase/config.toml`, `index.html`, and the hardcoded fallback in `src/integrations/supabase/client.ts`.

**3. Is `xyhyqukvfcshqwengxth` the current active backend?**

Yes. It is the live, Lovable-managed project: active (not paused), org `wpczgwxsriezaubncuom`, region `aws-1-eu-west-1`. All tables, auth, RLS, edge functions, and the new MCP work live here.

**4. Has any newer Supabase project replaced it?**

No. Nothing newer exists. The mismatch runs the other direction: production is running an *older* build pinned to the *previous* project. The only other ref anywhere in the repo is a historical mention in `SECURITY_AUDIT.md`.

**5. Where must the Google OAuth Client ID and Secret be configured?**

For `xyhyqukvfcshqwengxth`, via **Cloud → Users → Authentication Settings → Sign-in Methods → Google**. That panel also displays the exact callback URL to register in Google Cloud Console.

Your configured callback `https://xyhyqukvfcshqwengxth.supabase.co/auth/v1/callback` is correct for the *active* backend. It is simply not the backend production is calling right now, which is why production auth fails.

## Root cause

The source code is correct. The **published build is stale** — it was compiled before the client fallback was corrected, so the dead ref `hveucrpuystdvuubaocv` is baked as a literal into the shipped JavaScript. Vite inlines these values at build time; nothing at runtime can override them. No amount of secret or OAuth configuration will fix production until a fresh build is published.

## Proposed next step (single action, no backend changes)

Publish the app. This recompiles from current source with `xyhyqukvfcshqwengxth` and replaces the stale bundle. Nothing in the code needs to change first.

After publishing, verify by loading the production site and confirming network requests go to `xyhyqukvfcshqwengxth.supabase.co`, then testing Google sign-in end to end.

## Untouched

Authentication, ProtectedEmail, resume protection, `?next=` redirects, Google sign-in UI, environment variables, and the Supabase project were all left exactly as they are.
