

# Matrix Rain Background for Experience Section

## Overview
Create a `MatrixRain` canvas component and add it as an absolute-positioned overlay behind the Experience section content.

## New File: `src/components/MatrixRain.tsx`

A self-contained canvas component that renders the falling code effect:

- **Characters**: `0 1 { } < > / \ | $ # @ ! = + - _ & % ~ A B C D E F` plus occasional security terms ("ENCRYPT", "HASH", "AUTH", "FIREWALL", "PATCH", "SUDO", "ROOT", "CHMOD", "SSH", "TLS", "AES", "RSA") dropped letter-by-letter
- **Rendering**: Single `<canvas>` element, `requestAnimationFrame` loop capped at ~30fps via timestamp delta check
- **Columns**: 20-30 on desktop, 10-15 on mobile (based on canvas width / column spacing)
- **Per-column state**: random speed (30-80 px/s), current y position, character queue
- **Character appearance**: JetBrains Mono (or monospace fallback), 11px, `#00e5ff` at 0.06-0.12 opacity; brief 0.3 opacity flash on first frame of each new char, then dims
- **Fade out**: Characters fade as they approach bottom of canvas
- **Intersection Observer**: Pauses the rAF loop when the canvas is not in the viewport
- **Canvas sizing**: `ResizeObserver` to match parent dimensions

## Edit: `src/pages/Index.tsx` (lines 244-255)

Add `relative overflow-hidden` to the experience `<section>` and render `<MatrixRain />` as an absolute-positioned child behind the content:

```tsx
<section id="experience" className="py-20 border-t border-border/40 relative overflow-hidden">
  <MatrixRain />
  <motion.div {...sectionAnim} className="container max-w-5xl mx-auto relative z-10">
    ...
  </motion.div>
</section>
```

Import `MatrixRain` (not lazy-loaded since it's a lightweight canvas).

## Files

| File | Action |
|------|--------|
| `src/components/MatrixRain.tsx` | **New** — canvas falling code effect |
| `src/pages/Index.tsx` | Add `MatrixRain` to experience section, add relative/overflow-hidden |

