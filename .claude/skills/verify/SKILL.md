---
name: verify
description: Build, run, and drive this portfolio site to verify changes end-to-end
---

# Verifying changes in this repo

Vite + React SPA. Dev server: `npm run dev` → http://localhost:8080/.
Production build: `npm run build` (about 1.5s). Typecheck:
`npx tsc --noEmit -p tsconfig.app.json`. Lint: `npx eslint src --quiet`.

## The whole check

```sh
npm run verify
```

Builds, serves the build on :4173, starts a headless Chrome on :9333 and runs
every suite in `scripts/verify/`. It prints only failures and totals, and exits
non-zero if anything failed. Nothing is installed: `cdp.mjs` drives Chrome over
the DevTools protocol with Node's own WebSocket (Node 22+). Set `CHROME` if the
browser is not at the default macOS path, and `BASE=https://…` to test a
deployed site instead of building.

Always test the production build, not the dev server: the dev server reloads
mid-test when a file changes, and it does not chunk the way production does.

## One suite at a time

With `npx vite preview --port 4173 --strictPort` and a Chrome started by
`launch()` from `cdp.mjs` already running:

| Suite | What it holds to account |
| --- | --- |
| `terminal-test.mjs 1440x900` (`375x812m` for touch) | Every command and key; the card never resizes, the page never scrolls or shifts (layout shift must be 0) |
| `site-test.mjs` | Navigation, scroll reset, dialogs, the palette, the mobile menu, the hero figure at each breakpoint |
| `auth-test.mjs` | A signed-out visit sends the backend nothing and does not download its client; a signed-in page view reads once and writes nothing |
| `layout-sweep.mjs` | Every route at every width: overflow, text spilling its box, clipping, console errors. Screenshots land in `scripts/verify/.out/` |

## Things that have fooled a test before

- The intro types for about three seconds. Press Escape (or wait) before
  measuring anything in the hero.
- The schematic draws its chain over several seconds, and pauses while it is
  off screen. Scroll it into view and wait before judging a screenshot of it.
- CDP: only send `windowsVirtualKeyCode` for letters, digits and space, or "."
  is delivered as Delete. `setTouchEmulationEnabled` rejects `maxTouchPoints: 0`.
- Do not pipe a suite through a wrapper that keeps the pipe open (a background
  timer and `wait`): it looks like the test hangs.

## Checks that are not scripted

- Personal data: `pdftotext public/resume.pdf - | grep -E "@|[0-9]{10}"` must
  print nothing, and the built bundle must not contain the contact address in
  plain form (`src/lib/contact-email.ts` stores it reversed).
- A real sign-in (Google or the magic link) needs the owner's account and can
  only be tested on the deployed site.
