

# Interactive Skills Explorer — Rebuild Plan

Replace the current skills section (lines 295–373 in Index.tsx) with a two-column interactive layout featuring a radar chart and toggleable skill categories.

---

## New Component: `src/components/SkillsRadar.tsx`

Custom SVG radar/spider chart:
- 6 axes: Identity & Access (90), Automation (85), Cloud Security (75), Network Defense (80), Detection & SIEM (85), Offensive Security (70)
- Concentric hexagonal grid lines at 25/50/75/100% in `stroke-muted-foreground/10`
- Filled data polygon with `fill: url(#gradient)` at 0.2 opacity and gradient stroke
- **Scroll animation**: Use `useInView` to trigger. Animate polygon points from center (0) to actual values over ~1s using `requestAnimationFrame` and interpolation
- **Hover interaction**: Each axis endpoint is a transparent hit-area circle. On hover, enlarge the point and show a tooltip (skill name + percentage bar) using local state
- Axis labels positioned outside the hexagon in `font-mono text-xs`
- SVG viewBox ~400x400, responsive via `w-full max-w-md mx-auto`

## New Component: `src/components/SkillCategories.tsx`

Toggleable category tabs with animated pill badges:
- 4 tabs: Security (Shield icon), Automation (Terminal icon), Cloud & Network (Cloud icon), Tools (Radar icon)
- Active tab: gradient bottom border (`border-b-2` with gradient via pseudo-element), brighter text
- Below tabs: `AnimatePresence mode="wait"` wrapping a `motion.div` keyed by active category
- Each skill renders as a pill badge: `glass-card` background, thin border that transitions to gradient on hover, subtle glow (`hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]`)
- Pills stagger in: `variants` with `staggerChildren: 0.05`, each pill fades up
- Below pills: 1-line category description in `text-sm text-muted-foreground`
- Category descriptions map:
  - Security: "Enterprise identity security, threat detection, and incident response."
  - Automation: "Scripting and tooling to eliminate manual security workflows."
  - Cloud & Network: "Cloud infrastructure security and network defense architecture."
  - Tools: "Offensive and defensive security tooling for assessment and monitoring."

## Index.tsx Changes (lines ~295–373)

Replace the skills marquee + skills section with:

```text
┌─────────────────────────────────────────────────────┐
│ ARSENAL (gradient label)                            │
│ Skills & Technologies (heading)                     │
├────────────────────┬────────────────────────────────┤
│   Radar Chart      │   Category Tabs                │
│   (SkillsRadar)    │   [Security] [Auto] [Cloud]... │
│                    │   ┌─────────────────────┐      │
│                    │   │ pill  pill  pill     │      │
│                    │   │ pill  pill           │      │
│                    │   └─────────────────────┘      │
│                    │   Category description line     │
├────────────────────┴────────────────────────────────┤
│ 🛡 CompTIA Security+ · 🛡 CompTIA CySA+ · ...      │
│ (certification marquee, glass-card bar)             │
└─────────────────────────────────────────────────────┘
```

- On mobile: radar chart stacks above category tabs (single column)
- Remove the old competency bento grid, stats counters, and skills grid
- Keep stats counters — move them into the experience section or remove (they're redundant with the new radar)

### Certification Ticker
- Full-width glass-card bar below the two columns
- Infinite horizontal marquee (reuse existing `.marquee-track` CSS)
- Each cert: Shield icon (Lucide) + cert name, `font-mono text-sm`
- Pauses on hover (existing CSS handles this)

## Files

| File | Action |
|------|--------|
| `src/components/SkillsRadar.tsx` | **New** — SVG radar chart with scroll animation + hover tooltips |
| `src/components/SkillCategories.tsx` | **New** — tabbed skill category explorer with animated pills |
| `src/pages/Index.tsx` | Replace lines ~295–373 with new skills section using both components + cert ticker |

