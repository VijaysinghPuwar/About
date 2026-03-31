

# Full-Site Theme Transformation System

## Overview
Create a cinematic, system-recalibration-style transition overlay that fires whenever the user toggles between Default (blue/cyan) and Pentest (red) modes. The transition will feel like an interface changing operational state — not a color swap.

## Architecture

### New Files
| File | Purpose |
|------|---------|
| `src/components/ThemeTransition.tsx` | Full-screen transition overlay component |

### Modified Files
| File | Changes |
|------|---------|
| `src/hooks/useTheme.tsx` | Add `isTransitioning` state + `transitionDirection` to context; delay actual theme class swap until mid-transition |
| `src/components/ThemeToggle.tsx` | Disable button during transition to prevent double-clicks |
| `src/App.tsx` | Mount `<ThemeTransition />` at root level (above everything) |
| `src/components/CyberGrid.tsx` | Read theme from context to use red or cyan dot colors |
| `src/index.css` | Add CSS transitions on all theme-driven custom properties for post-transition settling |

---

## ThemeTransition.tsx — The Core Effect

### Trigger Flow
1. User clicks toggle → `useTheme.toggleTheme()` sets `isTransitioning: true` and `transitionDirection: 'to-pentest' | 'to-default'`
2. Overlay mounts (z-index 90, above content, below preloader)
3. At ~400ms mark (midpoint), the actual CSS theme class swaps on `<html>` — the new colors are now underneath
4. At ~900ms, overlay begins exiting
5. At ~1100ms, overlay unmounts, `isTransitioning` resets to false
6. A brief mode-confirmation chip appears top-right for 2s then fades out

### Visual Design: "System Recalibration Sweep"

**Phase 1 — Scan Line (0–400ms)**
- A horizontal 2px line sweeps top-to-bottom across the viewport
- Line color: cyan gradient for to-default, red gradient for to-pentest
- Behind it, a very subtle full-width band (40px tall, 0.08 opacity) follows
- CSS animation on a pseudo-element for GPU performance

**Phase 2 — Grid Pulse + Theme Swap (300–700ms)**
- At 400ms, theme class swaps
- A radial glow emanates from center of viewport (the "recalibration pulse")
  - To-pentest: red radial gradient, opacity 0→0.15→0
  - To-default: cyan radial gradient, opacity 0→0.12→0
- Subtle grid overlay (matching CyberGrid spacing) flashes once then fades

**Phase 3 — Settle (700–1100ms)**
- Overlay opacity fades to 0
- All CSS custom property transitions on `<html>` kick in (0.4s ease-out on color vars via `transition: color 0.4s, background-color 0.4s, border-color 0.4s`)
- Interface elements visibly settle into new palette

### Direction-Specific Differences

**Blue → Red (to-pentest)**
- Scan line: sharper, faster (300ms), red-orange gradient
- Pulse: red, slightly stronger (opacity 0.18)
- Overlay text flash: "PENTEST MODE ACTIVATED" in mono 11px, red, center screen, appears at 500ms for 400ms

**Red → Blue (to-default)**
- Scan line: smoother, slightly slower (400ms), cyan-to-purple gradient
- Pulse: cyan, calmer (opacity 0.12)
- Overlay text flash: "SECURE MODE RESTORED" in mono 11px, cyan, center screen

### Implementation
- Use React portal or fixed div with `z-index: 90`
- All animations via CSS `@keyframes` + inline styles (no Framer Motion needed for the overlay — pure CSS for max performance)
- Use `requestAnimationFrame` for the theme swap timing
- Respect `prefers-reduced-motion`: skip scan line + pulse, do instant theme swap with a single 200ms opacity crossfade

### Mobile
- Same effect but scan line is 50% faster
- No grid flash (skip for performance)
- Radial pulse radius reduced
- Total duration ~800ms instead of ~1100ms

---

## useTheme.tsx Changes

Expand the context to include:
```
isTransitioning: boolean
transitionDirection: 'to-pentest' | 'to-default' | null
```

New `toggleTheme` flow:
1. Set `isTransitioning: true`, `transitionDirection`
2. After 400ms delay, swap the actual theme class on `<html>` and update localStorage
3. After 1100ms, set `isTransitioning: false`

---

## Mode Confirmation Chip

After the overlay exits, render a small status chip in the top-right corner:
- "Pentest Mode Activated" or "Defensive Mode Restored"
- Font: JetBrains Mono, 11px
- Glass background with colored left border (red or cyan)
- Appears with slide-in-right, holds 2s, fades out
- Part of `ThemeTransition.tsx` (manages its own timeout)

---

## CyberGrid Theme Awareness

Currently hardcodes `rgba(0, 229, 255, ...)` for dots and lines. Change to read from theme context:
- Default mode: keep cyan `rgba(0, 229, 255, ...)`
- Pentest mode: use red `rgba(244, 63, 94, ...)`
- Transition between colors smoothly by lerping the RGB values when theme changes

---

## CSS Property Transitions

Add to `index.css` on the root:
```css
:root, .theme-blue, .theme-pentest {
  transition: --background 0.4s, --primary 0.4s; /* won't work on custom props */
}
```

Since CSS custom properties don't transition, instead add transition rules to the elements that consume them:
```css
body { transition: background-color 0.4s ease-out; }
.glass-card { transition: border-color 0.4s ease-out, background-color 0.4s ease-out; }
```
This ensures cards, borders, backgrounds, and accents all smoothly settle after the overlay reveals the new theme.

---

## Performance Budget
- Overlay uses only `transform`, `opacity`, and `background` animations (GPU-composited)
- No DOM measurement during animation
- No Framer Motion for the overlay (lighter)
- Total JS: ~150 lines for ThemeTransition + ~20 lines of useTheme changes

