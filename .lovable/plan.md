

# Final Polish Pass

12 items covering smooth scroll, animations, cursor effect, preloader, Konami code, SEO, favicon, keyboard accessibility, and scroll progress.

---

## Files to Create

### 1. `src/components/CursorSpotlight.tsx` — NEW
Mouse-following radial gradient spotlight. Uses `mousemove` listener on `document`, updates a `div` position via `useRef` + `requestAnimationFrame`. 300px radial gradient of `hsl(var(--primary) / 0.04)`. Hidden on mobile via `hidden md:block` or `useIsMobile()` check.

### 2. `src/components/Preloader.tsx` — NEW
Shows "VP" monogram with gradient pulse animation for 1.5s, then fades out. Uses `useState` timer + `AnimatePresence`. Renders a full-screen overlay with `z-[100]` that exits with opacity fade.

### 3. `src/components/ScrollProgress.tsx` — NEW
Fixed bar at very top (`top-0 left-0 z-[60]`), 2px tall, gradient background. Width driven by `scroll` event: `scrollY / (docHeight - windowHeight) * 100%`. Uses `requestAnimationFrame` for smooth updates.

### 4. `src/components/KonamiCode.tsx` — NEW
Listens for `keydown` sequence: up up down down left right left right b a. On trigger, adds a `.rainbow-mode` class to `document.documentElement` for 5 seconds, then removes it. The class is defined in CSS to override gradient variables with rainbow colors.

### 5. `public/favicon.svg` — NEW
Simple SVG: "VP" text with a linear gradient fill in cyan-to-purple.

---

## Files to Modify

### 6. `index.html`
- Update `<title>` to "Vijaysingh Puwar | Cybersecurity Engineer"
- Update `<meta name="description">` to the new copy
- Add `<meta name="keywords">`
- Replace favicon link to point to `/favicon.svg` with `type="image/svg+xml"`

### 7. `src/index.css`
- Add `.rainbow-mode` class that overrides `--primary` and `--secondary` CSS variables with rotating hue animation
- Add focus-visible utility: `*:focus-visible { outline: 2px solid hsl(var(--primary)); outline-offset: 2px; border-radius: 4px; }` for keyboard nav
- Ensure `html { scroll-behavior: smooth; scroll-padding-top: 4rem; }` for navbar offset

### 8. `src/App.tsx`
- Import and render `CursorSpotlight`, `Preloader`, `ScrollProgress`, `KonamiCode`
- `Preloader` wraps or sits above everything, controls visibility
- `ScrollProgress` sits at top of the layout
- `CursorSpotlight` is a global overlay

### 9. `src/pages/Index.tsx`
- Wrap each section (skills, projects, experience, contact) content in a `motion.div` with:
  ```
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.2 }}
  ```
- The hero section already has entrance animations so skip it
- Use `React.lazy` + `Suspense` for `ProjectShowcase`, `ExperienceTimeline`, `SkillsRadar`, `SkillCategories` to lazy-load below-fold components

### 10. `src/components/Navigation.tsx`
- Update `scrollTo` to use `window.scrollTo` with offset calculation: `el.getBoundingClientRect().top + window.scrollY - 64` (navbar height)
- IntersectionObserver rootMargin is already set; verify it works correctly with the offset

### 11. `src/components/Footer.tsx`
- Update nav link clicks to use smooth scroll with offset (same pattern as Navigation)

---

## Technical Notes

- **Scroll offset**: `scroll-padding-top: 3.5rem` in CSS handles the 56px (h-14) navbar
- **Cursor spotlight**: Absolutely positioned div with `pointer-events: none`, `position: fixed`, `mix-blend-mode: screen`
- **Preloader**: Uses `onAnimationEnd` or `setTimeout(1500)` then sets `loaded` state, `AnimatePresence` fades it out
- **Rainbow mode**: `@keyframes rainbow-shift` rotates hue; `.rainbow-mode` sets `--primary` and `--secondary` to animated values using CSS `filter: hue-rotate()` on gradient elements
- **Favicon**: Simple `<text>` SVG element with gradient `<linearGradient>` fill
- **Performance**: Lazy imports use dynamic `import()`, all animations use transform/opacity only, cursor spotlight uses rAF

