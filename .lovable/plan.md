

# Interactive 3D Hexagon Shield

## Overview
Replace `SecurityShield` with a new `HeroShield` component featuring multi-layered hexagons with 3D mouse-tracking tilt, parallax depth per layer, orbiting icons that scatter on hover, and a click-triggered scan pulse.

## Files

| File | Action |
|------|--------|
| `src/components/HeroShield.tsx` | **Create** — Full interactive component |
| `src/pages/Index.tsx` | **Edit** — Replace `SecurityShield` import/usage with `HeroShield` |
| `src/components/SecurityShield.tsx` | **Delete** |

## HeroShield Component Design

### Layered Hexagons (CSS transforms, not canvas)
Each layer is an absolutely-positioned SVG hexagon centered in a container:
- **Layer 1**: 380px, stroke `#00e5ff` at 0.15 opacity
- **Layer 2**: 280px, stroke `#a855f7` at 0.2 opacity, rotated 15°
- **Layer 3**: 180px, stroke `#00e5ff` at 0.3 opacity, rotated 30°
- **Layer 4**: 100px, gradient fill at 0.1 opacity
- **Center**: Lock icon (32px, white, 0.6 opacity)

### 3D Tilt (mouse tracking)
- `onMouseMove` on the container calculates offset from center
- `tiltX = (mouseY - centerY) / height * 20`, `tiltY = (mouseX - centerX) / width * -20`
- Each layer applies tilt at a different multiplier (1.0x, 0.7x, 0.4x, 0.2x) for parallax
- Uses `requestAnimationFrame` + lerp (factor 0.08) to smooth the following
- On mouse leave, lerps back to (0, 0)
- Transform: `perspective(800px) rotateX() rotateY()`

### Idle Animation (no hover)
- Track `isHovering` state
- When not hovering, layers rotate via CSS animation:
  - L1: clockwise 30s, L2: counter-clockwise 25s, L3: clockwise 20s
  - L4: scale pulse 1.0→1.05→1.0 over 3s
- When hovering starts: set `animation-play-state: paused`, tilt takes over
- When hovering ends: resume rotations, lerp tilt to zero

### Orbiting Icons
- 4 icons (Terminal, Shield, Cloud, Lock) positioned using `Math.sin`/`Math.cos` with time-based angle from `requestAnimationFrame`
- Each at Layer 1 radius (~190px from center), offset by 0°/90°/180°/270°, different speeds (20s/25s/22s/28s)
- Glass-morphism containers: 36px square, `bg-[rgba(15,23,42,0.5)]`, border `rgba(100,220,255,0.15)`
- On hover: icons translate 40px further outward (lerped transition)
- Icons also shift based on current tilt values for depth

### Click Scan Pulse
- On click/touchstart, spawn a pulse ring element using state array
- Ring expands 0→500px over 0.8s via CSS animation, gradient stroke, fades opacity 0.6→0
- All hex layers briefly flash (opacity spike via a CSS class toggled for 200ms)
- Center icon switches to CheckCircle for 1s, then reverts to Lock

### Mobile (<768px)
- Scale container to 60% via wrapper class
- Disable tilt (skip mouse tracking)
- Keep idle rotations and orbit animations
- Use `touchstart` for scan pulse

### Performance
- All visual transforms are CSS (`transform`, `opacity`) — GPU composited
- Single `requestAnimationFrame` loop handles: tilt lerping + orbit position calculation
- Cleanup on unmount

## Index.tsx Changes
- Replace `import { SecurityShield }` with `import { HeroShield }`
- Replace `<SecurityShield />` with `<HeroShield />`

