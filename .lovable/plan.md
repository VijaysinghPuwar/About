

## Plan: Immersive Hero Portrait — Remove Boxed Look

### Change: `src/pages/Index.tsx` — Hero image section (lines 159-178)

Replace the current boxed image container with a borderless, blended portrait:

**Remove:**
- `rounded-2xl` — creates the card look
- `shadow-[0_0_40px_...]` — creates the floating box feel
- `border border-primary/10 rounded-2xl` glow accent div
- Fixed `w-64 h-80 sm:w-72 sm:h-96` sizing that constrains the image

**Replace with:**
- Container: `lg:w-full lg:h-[480px]` with NO border-radius, NO shadow, NO border — just `overflow-hidden`
- Image: `object-cover object-top` for better portrait framing
- **Gradient overlays (enhanced for blending):**
  - Left fade: `bg-gradient-to-l from-transparent via-transparent to-background` (full opacity, not 80%)
  - Bottom fade: `bg-gradient-to-t from-background via-background/40 to-transparent`
  - Top fade: `bg-gradient-to-b from-background/30 to-transparent` (subtle top vignette)
  - Right fade: `bg-gradient-to-r from-transparent to-background/40` (soft right edge)
- Optional: very subtle `bg-primary/[0.03]` overlay for cyber tint
- Increase height to `lg:h-[480px]` for more visual dominance
- On mobile: `w-full h-72 sm:h-80` — full width, no card appearance

**Result:** The portrait dissolves into the dark background on all edges, feeling cinematic and integrated rather than boxed.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Restyle hero image container — remove card styling, add multi-directional gradient fades |

