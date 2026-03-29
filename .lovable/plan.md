

# Fix VP Logo Centering & Proportions

## Problem
The "VP" text is off-center (shifted right) inside the hexagon. The letters are too small, the stroke is too thick, and there's an unnecessary double/glow hexagon.

## Changes

### 1. `src/components/LogoIcon.tsx` — Rewrite
- **Remove** the outer glow hexagon entirely (lines 29-41)
- **Reduce** inner hexagon `strokeWidth` from `1.2` to `1.5` (in viewBox units, ~1.5 scaled)
- **Center VP text** using a single `<text>` element at exact center (x=20, y=20) with `text-anchor="middle"` and `dominant-baseline="central"`, shifted ~1px left for optical correction → x=19
- **Increase font-size** from 15 to 18 so letters fill ~55-60% of hexagon width
- **Negative letter-spacing**: use `letter-spacing="-0.8"` on the text element
- Keep V as `#00e5ff`, P as `#a855f7` — use two `<tspan>` elements inside one centered `<text>`
- Remove the `animated` glow rotation (no glow hex to rotate). Keep the hover effects on the single hexagon (brighten stroke, letters flash white)

### 2. `src/components/Preloader.tsx` — Update logo SVG (lines 101-141)
- Remove the glow hexagon pulse path (lines 82-99)
- Update the inner hexagon `strokeWidth` to match LogoIcon
- Replace the two separate `<motion.text>` elements with centered text using same approach (x=19, y=20, text-anchor=middle, dominant-baseline=central, font-size=18)
- Keep the stroke draw-on and letter fade-in animations

### 3. `public/favicon.svg` — Update
- Same centering fix: position text at center with text-anchor="middle"
- Increase font size, reduce stroke width, remove outer glow hexagon

## Technical Detail — SVG Text Centering
```xml
<text x="19" y="20" textAnchor="middle" dominantBaseline="central"
      fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize="18">
  <tspan fill="#00e5ff">V</tspan>
  <tspan fill="#a855f7">P</tspan>
</text>
```
The hexagon center is at (20, 20). Using x=19 provides the ~1px leftward optical correction for the P's visual weight.

