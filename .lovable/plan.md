

# Replace MatrixRain with Site-Wide CyberGrid

## Overview
Delete the MatrixRain component and its usage, then create a new `CyberGrid` component mounted at the app root that provides an interactive blueprint-style grid background across the entire site.

## Changes

### 1. Delete `src/components/MatrixRain.tsx`
Remove the file entirely.

### 2. Remove MatrixRain from `src/pages/Index.tsx`
- Remove the import of `MatrixRain` (line 19)
- Remove `<MatrixRain />` from the Experience section (line 247)

### 3. Create `src/components/CyberGrid.tsx`
New component with a fixed full-viewport canvas (`z-index: 0`, `pointer-events: none`).

**Grid rendering:**
- Lines at 60px spacing (40px on mobile), color `rgba(0, 229, 255, 0.03)`
- 2px dots at intersections, `rgba(0, 229, 255, 0.05)`
- Pre-calculate intersection points as `{ x, y, currentOpacity, currentSize, targetOpacity, targetSize }` array
- Parallax: offset grid by `scrollY * -0.3`

**Proximity glow (desktop only):**
- Track mouse position; dots within 120px of cursor glow brighter (inverse distance interpolation)
- Closest dots: `rgba(0, 229, 255, 0.4)`, fading to default at 120px
- Draw connecting lines between dots within 80px of cursor at `rgba(0, 229, 255, 0.08)`
- Only check dots in a bounding box around cursor for performance

**Click ripple (desktop + mobile via touchstart):**
- On click/tap, spawn a ripple: `{ x, y, radius: 0, opacity: 0.15 }`
- Expand to 400px over 1.2s, draw as thin circle stroke fading with growth
- Dots hit by ripple edge: spike targetOpacity to 0.5, targetSize to 5, then lerp back
- Remove ripple when radius > 400 or opacity < 0.01
- Multiple simultaneous ripples supported

**Animation loop:**
- 60fps via `requestAnimationFrame`
- Lerp `currentOpacity` and `currentSize` toward targets (factor 0.08)
- Skip proximity calc if frame > 20ms
- Recalculate grid on resize

**Mobile:** Static grid + dots + tap ripples. No hover glow.

### 4. Mount in `src/App.tsx`
- Import `CyberGrid`
- Add `<CyberGrid />` as first child inside the `<AuthProvider>`, before `<Preloader />`
- The existing `<div className="min-h-screen bg-background">` already provides `relative` context; content naturally layers above `z-index: 0`

## Technical Details

| File | Action |
|------|--------|
| `src/components/MatrixRain.tsx` | Delete |
| `src/pages/Index.tsx` | Remove MatrixRain import and usage |
| `src/components/CyberGrid.tsx` | Create — full interactive grid canvas |
| `src/App.tsx` | Import and mount CyberGrid |

