

# Redesign Experience Timeline + Update Matrix Rain

## Overview
The existing `ExperienceTimeline.tsx` already has an alternating layout skeleton but needs key fixes: wrong side assignment, missing focus-dimming, no triangular pointers, no hover lift. The `MatrixRain.tsx` needs minor tweaks for column staggering.

## Changes to `src/components/ExperienceTimeline.tsx`

### 1. Fix alternating side assignment
Currently `isLeft = index % 2 === 0` which puts Entry 0 (M.S. Cybersecurity) on left. Change to `isLeft = index % 2 === 1` so:
- Index 0 (M.S. Cybersecurity) → RIGHT
- Index 1 (System Engineer) → LEFT
- Index 2 (Systems Intern) → RIGHT
- Index 3 (B.E. Mechanical) → LEFT
- Index 4 (Design Intern) → RIGHT

### 2. Add focus-dimming
Pass `expandedId` to each `NodeCard`. When `expandedId !== null && !isExpanded`, apply `opacity-40` transition to the card wrapper. This dims non-active cards when one is expanded.

### 3. Add triangular pointer arrows
On each card, add a CSS triangle pseudo-element (or a small absolute-positioned div) pointing toward the center line:
- Left-side cards: triangle on the right edge pointing right
- Right-side cards: triangle on the left edge pointing left
- Use `border` trick for the triangle, colored to match the card background

### 4. Card styling updates
- Replace `glass-card` with explicit: `bg-[rgba(15,23,42,0.5)] backdrop-blur-xl border border-[rgba(100,220,255,0.08)]`
- Add hover lift: `hover:-translate-y-0.5`
- Expanded state keeps the brighter border glow

### 5. Animation stagger
Add `delay: index * 0.15` to each card's entrance animation (currently all use 0.1).

### 6. Mobile layout
Already mostly correct (line on left, cards on right). Ensure cards animate from the right (`x: 20` instead of current `x: -20`).

## Changes to `src/components/MatrixRain.tsx`

### 7. Organic column activation
Add a simple mechanism where not all columns are active simultaneously — each column has a random start delay and occasionally pauses for a random duration before restarting. This makes the rain feel more organic.

### 8. Adjust opacity range
Change the dim opacity from `0.06 + random * 0.06` to `0.04 + random * 0.04` (max ~0.08 when dim) to keep it even more subtle per the user's emphasis. Flash opacity stays at 0.15.

## Files

| File | Action |
|------|--------|
| `src/components/ExperienceTimeline.tsx` | Redesign layout: fix sides, add dimming, pointers, hover lift, stagger |
| `src/components/MatrixRain.tsx` | Add organic column pausing, adjust opacity |

