

# Interactive Project Showcase — Rebuild Plan

Replace the current flat project card grid (lines ~273–377 in Index.tsx) with an interactive showcase featuring hoverable cards and an expandable modal with Framer Motion `layoutId` animations.

---

## New Component: `src/components/ProjectShowcase.tsx`

Self-contained component that receives `projects` array, `user` auth state, and handles all filtering, cards, and modal logic.

### Filter Bar
- Horizontal pills: All, Security Automation, Cloud Security, Network Security, Application Security, Research, Automation, Application Development
- Active pill: `gradient-btn` class. Inactive: `glass-card text-muted-foreground`
- Remove search input — filters only via category pills
- Switching filters uses `AnimatePresence mode="popLayout"` with `layout` on each card for smooth rearrangement

### Project Cards
Two tiers based on `featured` flag:
- **Featured** (6 cards): standard size in a 3-column grid (2-col on md, 1-col on mobile)
- **Secondary** (6 cards): smaller cards in a 4-column grid below featured, more compact (less padding, no description)

**Card default state:**
- Glass-morphism card with 2px gradient top accent line (color varies by category via a color map)
- Project name (white, bold), category pill + year, 1-line description (muted, `line-clamp-1`), tech pills (tiny), GitHub icon link in top-right corner
- Uses `motion.div` with `layoutId={project.id}` for shared layout animation

**Card hover state (desktop):**
- `hover:-translate-y-2` lift, border brightens to `border-primary/40`
- "View Details →" text fades in at bottom (`opacity-0 group-hover:opacity-100 transition-opacity`)
- Subtle glow shadow: `hover:shadow-[0_8px_30px_hsl(var(--primary)/0.12)]`

**Card click:**
- Sets `selectedProject` state, opens modal overlay

### Expanded Modal
- Dark overlay (`bg-black/60 backdrop-blur-sm`) with `AnimatePresence`
- Modal card uses `motion.div` with matching `layoutId={selectedProject.id}` so the card visually morphs into the modal
- Modal content:
  - Project name (large, `text-2xl font-bold`)
  - Category pill + year
  - Full description (from the hardcoded project data in the component — the user provided detailed descriptions for each)
  - Tech stack as larger pills
  - Key features as bullet list (3-4 items, also hardcoded per project)
  - "View on GitHub →" gradient button
  - Close X button top-right
- Close on overlay click, Escape key, or X button
- Mobile: modal is `w-full max-w-2xl` with padding, scrollable

### Project Data
Hardcode the enriched project data (descriptions, features) directly in the component since the user provided specific copy for all 12 projects. Map by project ID to merge with the existing `projects.json` data.

### Bottom Strip
- "18+ public repositories" with GitHub icon
- "View All on GitHub →" gradient button linking to `github.com/vijaysinghpuwar`

---

## Index.tsx Changes (lines ~273–377)

- Replace entire projects section with:
  ```
  <section id="projects">
    <p className="section-heading">WORK</p>
    <h2 className="section-title">Featured Projects</h2>
    {user ? <ProjectShowcase projects={allProjects} /> : <sign-in-card />}
  </section>
  ```
- Import `ProjectShowcase` component
- Remove `search` state, `selectedCategory` state (moved into component)
- Keep auth gating logic

---

## Files

| File | Action |
|------|--------|
| `src/components/ProjectShowcase.tsx` | **New** — full interactive project showcase with filters, cards, modal |
| `src/pages/Index.tsx` | Replace lines ~273–377 with new section using ProjectShowcase, clean up unused state |

