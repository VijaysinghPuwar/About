

# Redesign VP Logo & Preloader

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/LogoIcon.tsx` | **Create** — Reusable hexagon VP SVG component |
| `src/components/Preloader.tsx` | **Rewrite** — Boot sequence animation with sessionStorage check |
| `src/components/Navigation.tsx` | **Edit** — Replace text "VP" with `<LogoIcon />` |
| `src/components/Footer.tsx` | **Edit** — Replace text "VP" with `<LogoIcon size={28} />` |
| `public/favicon.svg` | **Rewrite** — Hexagon VP design matching the new logo |

## 1. `LogoIcon.tsx` — Reusable SVG Component

Props: `size` (default 40), `className`, `animated` (default false — enables hover rotation).

SVG structure (viewBox `0 0 40 40`):
- **Outer glow hexagon**: Same hexagon path scaled ~1.1x, stroke opacity 0.15, `className` for CSS rotation animation when `animated=true`
- **Inner hexagon**: Stroke-only hexagon using `<linearGradient>` from `#00e5ff` to `#a855f7`
- **"V" text**: Fill `#00e5ff`, x centered left, Space Grotesk bold
- **"P" text**: Fill `#a855f7`, x centered right, slightly overlapping V

When `animated` is true (navbar usage):
- Outer glow hexagon gets `animate-shield-rotate` (already exists in CSS — 30s rotation, will change to 8s)
- On hover via CSS group: inner hexagon brightens, glow scales to 1.15x, letters flash white then return

## 2. `Preloader.tsx` — Boot Sequence

- Check `sessionStorage.getItem('preloaderShown')` — if set, return null immediately
- On mount, set `sessionStorage.setItem('preloaderShown', 'true')`
- Use framer-motion for the sequence (2s total):
  - **0–0.4s**: Hexagon stroke draws on via `stroke-dashoffset` animation (motion.path)
  - **0.4–0.7s**: "V" fades in + slides up
  - **0.5–0.8s**: "P" fades in + slides up
  - **0.8–1.2s**: Glow hexagon pulses outward (scale 1→1.3→1, opacity 0.3→0)
  - **0.8–1.4s**: Text types out "Initializing secure connection..." char by char (JetBrains Mono, 12px, `#64748b`)
  - **1.4–1.7s**: Text switches to "Connection established ✓" (checkmark in `#22d3ee`)
  - **1.7–2.0s**: Everything fades out (opacity 0, scale 1.05)
- Background: `#050816`, CyberGrid renders behind it naturally (z-index layering)

## 3. Navigation.tsx

Replace line 86 (`<span className="text-xl font-bold gradient-text">VP</span>`) with `<LogoIcon size={36} animated />` wrapped in a group for hover effects.

## 4. Footer.tsx

Replace line 27 (`<span className="font-bold gradient-text text-lg">VP</span>`) with `<LogoIcon size={24} />`.

## 5. CSS Updates in `index.css`

- Change `animate-shield-rotate` duration from 30s to 8s for the logo rotation
- Add a new `@keyframes` or keep separate — actually, add a dedicated `animate-logo-rotate` at 8s so we don't break the shield component

## 6. `public/favicon.svg`

Rewrite to use hexagon outline with VP letters matching the gradient colors, replacing the current rounded-rect design.

