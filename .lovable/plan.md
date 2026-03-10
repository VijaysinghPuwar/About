

## Plan: Immersive Hero Portrait — Full Rebuild

The current implementation still has gradient overlays that create a visible dark rectangular mask over the portrait. The fix requires a fundamentally different approach to how the image is composited.

---

### Changes to `src/pages/Index.tsx` — Hero image section (lines 159-184)

**Core problem:** The gradient overlays (`bg-gradient-to-l/t/b/r`) cover the entire image container with `inset-0`, creating visible dark rectangles. The `object-contain` also leaves empty space around the figure.

**New approach:**

1. **Grid ratio**: Change from `[1fr_0.8fr]` to `[1fr_1fr]` so the portrait gets 50% of hero width.

2. **Image container**: Use `overflow-hidden` with NO background, NO border, NO shadow. Height increased to `lg:h-[600px]`. Allow the image to extend beyond the container bottom with negative margin or absolute positioning.

3. **Image element**: Use `object-contain object-bottom` with full width/height. Add a subtle `drop-shadow` and `brightness(1.1)` filter to lift the portrait from the dark background.

4. **Edge blending — refined approach**:
   - **Left fade only**: A narrower gradient div positioned on the left ~30% of the container (`left-0 w-1/3 h-full`) fading `from-background to-transparent`. This avoids covering the entire image.
   - **Bottom fade**: A shorter gradient div at the bottom (`bottom-0 h-1/3 w-full`) fading `from-background to-transparent`. Keeps it minimal.
   - **Remove** the top and right gradient overlays entirely — they darken the image unnecessarily.
   - **Remove** the full-coverage `bg-primary/[0.02]` tint overlay.

5. **Background glow**: Keep the soft `bg-primary/[0.06] blur-[80px]` circle but make it slightly larger (`w-[80%] h-[80%]`).

6. **Hero section padding**: Reduce bottom padding on the hero (`pb-0 lg:pb-0`) so the portrait can visually extend to the section edge, creating a more cinematic composition.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Rebuild hero image: 50/50 grid, taller container, targeted edge fades instead of full-coverage overlays, brightness filter, reduced bottom padding |

