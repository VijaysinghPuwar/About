

# Terminal-Themed Hero Rebuild

Replace the current two-column hero (text left + CyberVisual right) with an immersive terminal-themed hero that tells a story through a typewriter effect.

---

## Architecture

Two new components + hero section rewrite in Index.tsx. The existing `CyberVisual.tsx` will be replaced with a new `SecurityShield.tsx` for the right-side geometric visual. A new `TerminalHero.tsx` component handles the typewriter logic.

---

## 1. `src/components/TerminalHero.tsx` (New)

A self-contained terminal component with typewriter animation:

- **Terminal chrome**: Dark card (`glass-card`) with rounded top corners, three colored dots (red `#f43f5e`, yellow `#eab308`, green `#22c55e`) in top-left, title bar text `vijaysingh@security:~$` in JetBrains Mono
- **Typewriter engine**: Uses `useState` + `useEffect` with `setTimeout` to type through a sequence of lines. Each line object has: `type` ("command" or "output"), `text`, `color` (cyan for commands, white for output, gradient for role, green-tinted for skills), `delay` (pause before starting), `speed` (ms per char, ~40ms for commands, instant for output lines that appear after command finishes)
- **Line sequence** (exactly as specified): `$ whoami` → name output → `$ cat role.txt` → role output → `$ cat mission.txt` → mission lines → `$ ls skills/` → skills output → `$ ./connect.sh`
- **After typing completes**: Two CTA buttons fade in inside the terminal card — "View My Work" (gradient) and "Download Resume" (outline). Resume button is auth-gated (shows Lock icon if not signed in)
- **Blinking cursor**: A `|` character with `animate-terminal-blink` on the last visible line

## 2. `src/components/SecurityShield.tsx` (New, replaces CyberVisual)

Desktop-only (`hidden lg:flex`) animated geometric shield:

- **SVG shield shape**: Built from layered hexagons with circuit-line patterns, using the cyan-to-violet gradient
- **Subtle rotation**: Entire shield slowly rotates (0→360° over ~30s, CSS animation)
- **Pulsing opacity**: Shield layers pulse between 0.6 and 1.0
- **Orbiting icons**: 4 small Lucide icons (Lock, Terminal, Cloud, Shield) positioned on a circular orbit path using CSS `@keyframes orbit` with staggered delays — they slowly circle the shield
- **Glow backdrop**: Same radial blur blobs as current CyberVisual

## 3. Hero Section in `src/pages/Index.tsx`

Replace lines 220-280 (current hero) with:

**Top-left status indicators** (absolute positioned or flex row at top of hero):
- Green dot + "SYSTEMS ONLINE" — tiny, `font-mono text-xs text-muted-foreground`
- Pin icon + "Location: New York, NY"
- Pulsing green dot + "Status: Open to opportunities" — dot uses `animate-cyber-pulse`

**Layout**: `grid lg:grid-cols-[3fr_2fr]` — terminal takes ~60%, shield takes ~40%

**Left side**: `<TerminalHero />` component + social icons below it (GitHub, LinkedIn, Email)

**Right side**: `<SecurityShield />` with `hidden lg:block`

**Scroll indicator** at bottom: Bouncing chevron-down icon + "Scroll to explore" text. Uses a scroll listener to fade out after scrollY > 100.

**Remove**: The skills marquee stays as-is below the hero (it's separate from the hero section).

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/TerminalHero.tsx` | **New** — typewriter terminal with CTA buttons |
| `src/components/SecurityShield.tsx` | **New** — geometric shield with orbiting icons |
| `src/pages/Index.tsx` | Replace hero section (lines ~220-280), update imports |
| `src/index.css` | Add `@keyframes orbit` for orbiting icons, add `@keyframes bounce-subtle` for scroll indicator |

