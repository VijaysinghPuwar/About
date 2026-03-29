

# Add Cursor Particle Trail Effect

## Plan

Create `src/components/CursorTrail.tsx` — a new component rendering a fixed full-viewport canvas with a particle trail effect.

### Component Logic
- Fixed canvas: `position: fixed, inset: 0, z-index: 9999, pointer-events: none`
- Track mouse via `window.mousemove`; maintain particles array (max 50)
- Each particle: `{ x, y, size, opacity, velocityX, velocityY, color }` with cyan/purple random color
- Distance threshold: only spawn particle if mouse moved >5px since last spawn
- Animation loop at 60fps: clear canvas, draw each particle as filled circle + larger glow circle behind, update position/opacity/size, remove dead particles
- Mobile: return `null` when `useIsMobile()` is true (reuse existing hook)

### Mount Point
In `src/App.tsx`, import and add `<CursorTrail />` alongside `<CursorSpotlight />` at the app root level.

### Files
| File | Action |
|------|--------|
| `src/components/CursorTrail.tsx` | **Create** — canvas-based particle trail component |
| `src/App.tsx` | **Edit** — import and mount `<CursorTrail />` |

