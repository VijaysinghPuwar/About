

# Mobile Responsiveness, Smooth Scrolling & Scroll Reveal Effects

## Overview
Three-part overhaul: (1) fix all mobile responsiveness issues across every component, (2) improve scroll navigation with navbar offset handling, (3) add scroll-triggered section reveal animations (line wipe + fade-up + letter reveal).

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `overflow-x: hidden` on html/body, mobile text sizing overrides, section reveal keyframes, `prefers-reduced-motion` rules |
| `src/pages/Index.tsx` | Mobile padding on all sections (`px-4`), cap `section-title` sizes, replace `sectionAnim` with new `SectionReveal` wrapper, add letter-by-letter label animation |
| `src/components/TerminalHero.tsx` | Cap name text to `max-w-full text-xl` on mobile, ensure terminal is `w-full px-3` on mobile |
| `src/components/HeroShield.tsx` | Already `hidden lg:flex` — confirmed OK |
| `src/components/SkillsRadar.tsx` | No changes needed — already responsive SVG |
| `src/components/SkillCategories.tsx` | Ensure tab buttons have `min-h-[44px]` tap targets |
| `src/components/ExperienceTimeline.tsx` | Mobile timeline already left-aligned — verify tap targets are 44px |
| `src/components/ProjectShowcase.tsx` | Project cards: force `grid-cols-1` on mobile. Modal: full-screen on mobile (`md:max-w-2xl md:max-h-[85vh] md:rounded-xl` else `w-screen h-screen rounded-none`). Filter pills: `min-h-[44px]`. Diff view already stacks on mobile. |
| `src/components/Navigation.tsx` | Add `overflow-hidden` on body when sheet open. Mobile nav links: `min-h-[44px]`. Fix `scrollTo` to use `window.scrollTo` with offset. |
| `src/components/ThreatLevelIndicator.tsx` | Reduce to `w-[130px]`, font `text-[10px]` on mobile |
| `src/components/CommandPalette.tsx` | Width `w-[95vw]` on mobile, results font `text-[13px]` |
| `src/components/Footer.tsx` | Ensure `px-4` padding on mobile |
| `src/components/CyberGrid.tsx` | Already handles mobile spacing (40px) and skips proximity glow — OK |
| `src/components/SectionReveal.tsx` | **Create** — reusable wrapper component |

## Part 1: Global Mobile Fixes

### `src/index.css`
- Add to `html` rule: `overflow-x: hidden`
- Add `body { overflow-x: hidden; }`
- Add responsive overrides:
```css
@media (max-width: 767px) {
  .section-title { font-size: 1.75rem !important; } /* 28px */
  .section-heading { font-size: 11px !important; }
}
```

### `src/pages/Index.tsx`
- Add `px-4` to all section containers (most already have `container` class which provides padding, but verify)
- Hero status indicators: change from `absolute top-20 left-4` to `relative` on mobile with a wrapper that shows above the terminal on small screens — use `md:absolute md:top-20 md:left-8` and `relative mb-4 md:mb-0 md:absolute`
- Hero grid: already `lg:grid-cols-[3fr_2fr]` → collapses to 1 col. Shield already `hidden lg:flex` ✓
- Skills grid: change `lg:grid-cols-2` to ensure stacking below 768px (already does since it's `lg:`) ✓
- Contact grid: already `md:grid-cols-2` ✓
- Wrap each section's inner content with `<SectionReveal>` component for the scroll animation

### `src/components/TerminalHero.tsx`
- Name style: change `text-2xl sm:text-3xl` to `text-xl sm:text-3xl` (caps at 24px on mobile)
- Terminal body padding: already `px-4 sm:px-6` ✓

### `src/components/ProjectShowcase.tsx`
- Featured grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (add `grid-cols-1`)
- Secondary grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (add `grid-cols-1`)
- Filter pills: add `min-h-[44px]` class
- Modal: on mobile make it full-screen:
  ```
  className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl glass-card ...
  // Change to:
  className="relative w-full md:max-w-2xl md:max-h-[85vh] md:rounded-xl 
             max-md:w-screen max-md:h-screen max-md:rounded-none max-md:max-h-screen
             overflow-y-auto glass-card ...
  ```

### `src/components/Navigation.tsx`
- Mobile nav links: add `min-h-[44px]` to each button
- When sheet opens, add `document.body.style.overflow = 'hidden'`; restore on close
- Update `scrollTo` to use `window.scrollTo({ top, behavior: 'smooth' })` — already does this ✓

### `src/components/ThreatLevelIndicator.tsx`
- Change width: `w-[130px] sm:w-[160px]` (currently `w-[140px] sm:w-[160px]` — reduce mobile to 130px)
- Status text: `text-[10px] sm:text-[11px]`

### `src/components/CommandPalette.tsx`
- Modal width: add `max-md:w-[95vw]`
- Results text: `text-[13px] md:text-sm`

### `src/components/SkillCategories.tsx`
- Tab buttons: add `min-h-[44px]`

## Part 2: Smooth Scrolling

Already handled:
- `html { scroll-behavior: smooth; scroll-padding-top: 3.5rem; }` exists in `index.css`
- `Navigation.scrollTo` already computes offset of 64px and uses `window.scrollTo`
- `Footer.scrollTo` already does the same

Fix needed:
- `CommandPalette.scrollTo` uses `el.scrollIntoView` — change to offset-aware `window.scrollTo`
- `ThreatLevelIndicator.navigateTo` uses `scrollIntoView` — change to offset-aware `window.scrollTo`
- `TerminalHero` "View My Work" button uses `scrollIntoView` — change to offset-aware scroll

## Part 3: Scroll-Triggered Section Reveal

### Create `src/components/SectionReveal.tsx`
A wrapper component that:
1. Uses `IntersectionObserver` (threshold 0.15, `once: true`)
2. When triggered:
   - Renders a horizontal line (1px) that expands from center outward (CSS animation, 0.6s)
   - Line holds 0.3s then fades out
   - After 0.3s delay, children fade up (opacity 0→1, translateY 30px→0 on desktop, 15px on mobile)
   - Children stagger by 0.08s
3. Respects `prefers-reduced-motion` — skip all animations, show content immediately

### Section Label Letter Reveal
Create a `RevealLabel` sub-component used for the section-heading labels ("ARSENAL", "WORK", etc.):
- Each letter animates individually: opacity 0 + translateY(-10px) → visible
- 0.04s delay between letters
- Triggers after the line wipe completes

### Usage in `Index.tsx`
Wrap each section's content `<motion.div {...sectionAnim}>` replacement:
```tsx
<SectionReveal>
  <RevealLabel text="Arsenal" />
  <h2 className="section-title">Skills & Technologies</h2>
  ...
</SectionReveal>
```

### CSS additions in `index.css`
```css
@keyframes line-wipe {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .section-reveal * { animation: none !important; transition: none !important; }
}
```

### Animation implementation
- Use Framer Motion for the content fade-up and stagger (consistent with rest of site)
- Use CSS animation for the horizontal line (simpler, GPU-accelerated)
- Track triggered state with `useRef` + `useState` per section so animations only fire once

