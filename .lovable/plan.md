

# Interactive Timeline — Experience & Education

Replace the tabbed experience section (lines 283–378 in Index.tsx) with a new `ExperienceTimeline` component featuring an alternating vertical timeline with accordion behavior and flippable certification cards.

---

## New Component: `src/components/ExperienceTimeline.tsx`

### Timeline Data
5 entries in chronological order (most recent first), each with:
- `type`: "education" | "work"
- `icon`: GraduationCap or Briefcase
- Collapsed: company/school, role/degree, period
- Expanded: bullets (work) or coursework pills (education)
- Metrics like "150+", "70%", "20%", "100%", "4.00" highlighted in cyan (`text-primary font-semibold`)

### Layout
- **Desktop**: Center vertical line with entries alternating left/right. Odd entries left, even entries right. Timeline dot centered on the line.
- **Mobile**: Line on the left, all entries to the right.
- Vertical line: animated gradient background using CSS `background-size` animation (energy flowing down).

### Accordion Behavior
- `expandedId` state — only one node open at a time
- Click toggles: if same node clicked, collapse; otherwise expand new and collapse old
- Use `AnimatePresence` + `motion.div` with `initial/animate/exit` height animation for expand/collapse
- Expand icon: small `ChevronDown` that rotates 180° when expanded
- Active timeline dot: brighter glow + pulse animation (`shadow-[0_0_16px_hsl(var(--primary)/0.8)]`)

### Scroll Entrance
- Each node uses `motion.div` with `whileInView` — slides in from left (odd) or right (even) on desktop, always from left on mobile

### Certification Row (below timeline)
- 5 cert cards in a horizontal flex/grid row
- Each card has front/back via CSS `transform-style: preserve-3d` + `rotateY(180deg)` on hover
- Front: Shield icon + cert name
- Back: issuing org text (e.g., "CompTIA", "Cisco", "ISC2", "Google")
- Glass-morphism styling, gradient border on hover

---

## Index.tsx Changes (lines 283–378)

Replace entire experience section with:
```
<section id="experience">
  <p className="section-heading">Journey</p>
  <h2 className="section-title">Experience & Education</h2>
  <ExperienceTimeline />
</section>
```

Remove: `expTab` state, `experience` array, `education` array, `certifications` array (move into component). Clean up unused imports (`Award`, `GraduationCap`, `Briefcase` if only used there).

---

## CSS Addition (`src/index.css`)

Add `@keyframes timeline-flow` for the animated gradient line:
```css
@keyframes timeline-flow {
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 200%; }
}
```

Add `.flip-card` styles for certification card 3D flip.

---

## Files

| File | Action |
|------|--------|
| `src/components/ExperienceTimeline.tsx` | **New** — full timeline + cert cards |
| `src/pages/Index.tsx` | Replace lines 283–378, remove moved data/state |
| `src/index.css` | Add timeline-flow keyframes + flip-card styles |

