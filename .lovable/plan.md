

## Mode Transformation Enhancement — High-Impact Cyber Identity Shift

### Current State Audit
- `ThemeTransition.tsx` already has: scan line, radial pulse, grid flash, mode text, confirmation chip
- `LogoIcon.tsx` already has: transition glow + scale
- `useTheme.tsx` orchestrates 1100ms total / 400ms swap delay

**What's missing for "powerful transformation" feel**: glitch/RGB-shift, energy pulse from toggle button origin, UI element reactions (scale/glow), stronger background differentiation between modes, optional sound.

### Scope
Enhance `ThemeTransition.tsx`, `useTheme.tsx`, `ThemeToggle.tsx`, `index.css`. No DB changes. No new dependencies.

---

### 1. Toggle Button as Pulse Origin (`useTheme.tsx` + `ThemeToggle.tsx`)
- `toggleTheme` accepts optional `originX, originY` (button rect center).
- Stored in context as `transitionOrigin`.
- `ThemeToggle` passes its button rect on click via `getBoundingClientRect()`.

### 2. Energy Pulse from Button (`ThemeTransition.tsx`)
- New layer: radial gradient circle starting at `transitionOrigin`, scales from 0 → ~250vmax over 700ms.
- Soft neon for blue, sharp aggressive ring for red.
- Mobile: smaller scale (180vmax), shorter (500ms).

### 3. Glitch / RGB-Shift Layer (desktop only, gated by reduced-motion)
- Two duplicated overlays with `mix-blend-mode: screen`, offset by ±2px on X-axis, tinted red and cyan.
- Animated via 4-step keyframes for ~180ms (frames 1–2 of transition only).
- Adds scanline strip overlay (already exists, intensify opacity briefly).

### 4. Background Mode Differentiation (`index.css`)
- Add `.theme-pentest` body class hooks:
  - Slightly darker `--background` shift (already partially set via tokens).
  - Add subtle animated noise: `body.theme-pentest::before { /* SVG noise, 4% opacity, 8s drift */ }`.
  - Blue mode: calm — no noise, soft glow vignette.
- Implemented via pure CSS, no JS overhead.

### 5. UI Element Reactions (global CSS class trigger)
- During transition, `<html>` gets `.theme-shifting` class (via `useTheme`).
- CSS rule:
  ```
  html.theme-shifting .glass-card,
  html.theme-shifting [data-card] {
    transform: scale(0.985);
    transition: transform 400ms ease-out, border-color 400ms;
  }
  html.theme-shifting svg { filter: drop-shadow(0 0 6px currentColor); }
  ```
- Auto-resets when class removed at transition end.

### 6. Logo Polish (`LogoIcon.tsx`)
- Already has transition glow — verify "no constant glow when idle" (current code: `filter: isTransitioning ? glow : 'none'` ✓ — confirmed clean).
- Add brief 180° hue-rotate sweep mid-transition for stronger "morph" feel.

### 7. Optional Sound
- Add 90KB-free WebAudio synthesized "cyber click" (no asset file): short 800Hz→200Hz sweep + noise burst, ~120ms.
- Triggered in `toggleTheme`. Respects `prefers-reduced-motion` (skipped).
- User can disable via localStorage flag `theme-sound: off` (default on). Keep volume low (0.15).

### 8. Mobile Tuning
- Glitch layer: skipped entirely on mobile.
- Pulse: 500ms vs 700ms.
- Total duration: 800ms vs 1100ms (already set).
- Noise overlay: disabled on mobile (`@media (max-width: 768px)`).

---

### Files Modified
| File | Change |
|------|--------|
| `src/hooks/useTheme.tsx` | Add `transitionOrigin`, `.theme-shifting` class on `<html>`, sound trigger |
| `src/components/ThemeToggle.tsx` | Pass click origin to `toggleTheme` |
| `src/components/ThemeTransition.tsx` | Add pulse-from-origin layer, glitch/RGB layer, scanline intensify |
| `src/components/LogoIcon.tsx` | Add hue-rotate keyframe during transition |
| `src/index.css` | `.theme-shifting` reactions, pentest noise overlay, new keyframes |

### Performance Budget
- Pulse + glitch use `transform`/`opacity` only (GPU).
- Glitch layer auto-removed after 180ms.
- Noise overlay: single SVG data URI, CSS-animated, ~0.5% CPU.
- WebAudio: synthesized inline, no network.
- Total added JS: ~80 lines.

### Acceptance
- Toggle feels like a system mode switch, not a color swap.
- Pulse visibly originates from the toggle button.
- Glitch flickers briefly on desktop (controlled, not overdone).
- Pentest mode background subtly differs (noise + vignette) vs Defensive.
- Cards/icons react during shift.
- Mobile gets a leaner version (no glitch, no noise, faster).
- `prefers-reduced-motion` users get instant swap, no sound, no effects.

