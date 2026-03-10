

## Plan: Remove Boxed Look — Rebuild Hero Portrait Composition

### Problem
The `overflow-hidden` on line 166's container (`div.relative.w-full.h-80...overflow-hidden`) clips the radial glow to a rectangle, creating the visible dark panel behind the portrait. The glow is constrained inside a box-shaped container.

### Solution

**File: `src/pages/Index.tsx`** — Lines 159-181

1. **Remove `overflow-hidden`** from the image container div (line 166). This is the primary cause — it clips the radial glow into a visible rectangle.

2. **Move the radial glow outside the image container** and position it as an unconstrained element within the hero section. Make it larger (`w-[500px] h-[500px]`) with heavier blur (`blur-[120px]`) and use `rounded-full` so it remains organic/circular, not rectangular.

3. **Remove the left-fade and bottom-fade gradient divs** (lines 176-179). These rectangular overlays contribute to the boxed perception. Instead, use CSS `mask-image` directly on the `<img>` element with a radial gradient mask that keeps the face/center sharp and fades the outer edges organically:
   ```
   style={{ maskImage: 'radial-gradient(ellipse 70% 80% at 50% 40%, black 50%, transparent 90%)' }}
   ```

4. **Result**: The portrait fades at its edges via a non-rectangular mask, the glow behind it is unconstrained and circular, and no clipping container creates a visible box.

### Also: Replace portrait asset
Copy the new uploaded image (`Adobe_Express_-_file-2.png`) to `src/assets/profile-portrait.png`, replacing the previous version.

### Files to modify
| File | Change |
|------|--------|
| `src/assets/profile-portrait.png` | Replace with new uploaded image |
| `src/pages/Index.tsx` | Remove overflow-hidden, use radial mask-image on img, move glow outside container, remove rectangular gradient overlays |

