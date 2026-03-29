

# Rebuild MatrixRain Component

## Problem
The current `MatrixRain.tsx` uses a complex column-object approach that isn't producing a visible effect. The user wants a simpler, proven "classic matrix rain" implementation.

## Plan

### Replace `src/components/MatrixRain.tsx` entirely

New implementation using the exact algorithm specified:

1. **Canvas setup**: `position: absolute, inset: 0, w-full, h-full, z-index: 0, pointer-events: none`
2. **Columns**: `Math.floor(canvas.width / 20)`, each 20px wide
3. **Drops array**: One entry per column, initialized to `Math.random() * -100`
4. **Draw loop** (throttled to ~20fps via timestamp delta):
   - Fill canvas with `rgba(5, 8, 22, 0.08)` for trail fade
   - For each column: draw random char from `"01{}< >\/|$#@!=+-_&%~ABCDEF"` at `(col * 20, drops[col] * 14)`
   - Trail chars: `rgba(0, 229, 255, 0.10)` — head char: `rgba(0, 229, 255, 0.25)`
   - Track which column index is "newest" to apply brighter head color
   - Increment drop; reset to 0 when past canvas height with `Math.random() > 0.975`
5. **Font**: `12px monospace`
6. **IntersectionObserver**: pause/resume rAF when section leaves/enters viewport
7. **ResizeObserver**: recalculate canvas size and column count on resize

### No changes to `src/pages/Index.tsx`
The section already has `relative overflow-hidden` and renders `<MatrixRain />` as the first child with the content at `z-index: 10`. No changes needed.

### Files
| File | Action |
|------|--------|
| `src/components/MatrixRain.tsx` | **Rewrite** with simple drops-array algorithm |

