---
name: verify
description: Build, run, and drive this portfolio site to verify changes end-to-end
---

# Verifying changes in this repo

Vite + React SPA. Dev server: `npm run dev` → http://localhost:8080/ (ready in ~100ms).
Prod build: `npm run build` (~1.5s). Typecheck: `npx tsc --noEmit`.
Lint has ~25 pre-existing problems in shadcn `ui/*`, hooks, Admin, supabase functions,
and tailwind.config — don't count those against a change.

## Driving the app headlessly

The Claude-in-Chrome extension is usually not connected on this machine. Use
playwright-core with the cached headless shell instead:

```js
import { chromium } from 'playwright-core'; // npm i playwright-core in scratchpad
const exe = '/Users/vijay_macbookm5/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: exe, headless: true });
```

(`chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app` also exists if a headed
build is needed. Adjust the revision if the cache updates.)

## Gotchas when driving

- A preloader plus staggered entry animations run on load — wait ~2.5s after
  `networkidle` before measuring layout or screenshots.
- Sections animate in with framer-motion `x`/`y` offsets; off-screen cards sit at
  `translateX(20px)` until scrolled into view, which looks like fake horizontal
  overflow. Measure `document.body.scrollWidth - clientWidth` instead of rects.
- The SkillsRadar entry animation takes ~2.5s after it scrolls into view.
- Command palette: `page.keyboard.press('Meta+k')`; modal is
  `[role="dialog"][aria-label="Command palette"]`.
- The cert marquee scrolls forever — exclude `.marquee-track` from overflow scans.

## Flows worth driving

- Responsive sweep at 360/390/393/402/430/440/1280/2560 px: no horizontal overflow,
  hero text `vijaysingh@security` visible, no blank first screen, zero console errors.
- Protected email: logged out, `document.documentElement.outerHTML` must NOT contain
  `contact@vijaysinghpuwar.com` (only the masked `cont••••@…`).
- Skills radar hover: tooltips are `<foreignObject>` inside the SVG.
- Experience timeline cards: `[role="button"][aria-expanded]`, toggle with Enter.
