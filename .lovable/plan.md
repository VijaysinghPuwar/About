

## Plan: Full-Width Split-Hero Homepage Redesign

### Overview
Redesign the homepage hero into a split-screen layout (text left, large portrait right) with subtle cyber-themed visual effects. Widen all remaining sections and add an animated grid background for the hacker aesthetic.

---

### 1. Hero Section — Split Layout (`src/pages/Index.tsx`)

Replace the centered hero with a two-column split:

**Left column (~55%):**
- Small mono label: `CYBERSECURITY ENGINEER`
- Large name heading (`text-5xl lg:text-7xl`)
- Title line
- Summary paragraph
- CTA buttons row
- Social icons row
- All left-aligned

**Right column (~45%):**
- Large portrait image filling the column height (~400px)
- Rounded corners, not circular
- Gradient overlay fading left into the background
- Subtle glow/shadow effect
- `object-cover` to fill space

**Mobile:** Stack vertically — text first, image below (or hidden on very small screens).

### 2. Cyber Background Effects (`src/index.css`)

Add a subtle animated grid background to the hero section using the existing `bg-cyber-grid` utility and `--grid-color` variable. Add a CSS class `.hero-grid-bg` with the grid pattern at `40px` intervals, very low opacity.

### 3. Button Glow Effects

Add a subtle `shadow-[0_0_15px_hsl(var(--primary)/0.3)]` on CTA buttons and `hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)]` for the cyber glow feel.

### 4. All Other Sections — Already `max-w-6xl`

The remaining sections (Competencies, Projects, Writeups, Experience, Education, Certifications, Contact CTA) are already at `max-w-6xl`. No width changes needed.

### 5. Section Title Sizing

Increase `.section-title` from `text-3xl md:text-4xl` to `text-3xl md:text-4xl lg:text-5xl` in `src/index.css`.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Rewrite hero to split layout; larger image; left-aligned text; glow buttons |
| `src/index.css` | Add `.hero-grid-bg` class; increase `.section-title` size |

No other files need changes — navigation, About merge, Contact layout, and container widths are already done from previous iterations.

