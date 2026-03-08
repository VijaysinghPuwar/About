

## Plan: Full-Width Layout Redesign + Merge Resume into About

This plan covers widening the global layout, reducing dead space, merging Resume into About, and redesigning the Contact section into a two-column layout.

---

### 1. Global Container Width (`tailwind.config.ts`)

Change the container `2xl` screen from `1400px` to `1440px` and reduce padding from `2rem` to `1.5rem` on large screens:

```ts
container: {
  center: true,
  padding: {
    DEFAULT: "1rem",
    sm: "1.5rem",
    lg: "2rem",
  },
  screens: {
    "2xl": "1440px",
  },
},
```

### 2. Homepage (`src/pages/Index.tsx`) — Widen All Sections

- **Hero**: Change `max-w-4xl` → `max-w-6xl`, increase profile image from `w-28 h-28` → `w-44 h-44`, widen summary `max-w-2xl` → `max-w-3xl`
- **Competencies**: `max-w-5xl` → `max-w-6xl`
- **Featured Projects**: `max-w-5xl` → `max-w-6xl`
- **Writeups**: `max-w-5xl` → `max-w-6xl`
- **Experience**: `max-w-3xl` → `max-w-5xl` (was too narrow)
- **Education**: `max-w-5xl` → `max-w-6xl`
- **Certifications**: `max-w-4xl` → `max-w-6xl`, use grid layout instead of flex-wrap
- **Contact CTA**: `max-w-2xl` → `max-w-4xl`
- **Section spacing**: Reduce `py-20` → `py-16` across all sections; hero keeps `py-24 md:py-32`
- **Hero CTA**: Change "View Resume" link from `/resume` → `/about`

### 3. Merge Resume into About (`src/pages/About.tsx`) — Major Rewrite

The About page will absorb all Resume content. New structure:

**Section 1 — Profile intro** (existing split layout, widened to `max-w-6xl`):
- Profile image `w-44 h-44` (increased from 160px)
- Name, title, role tags, summary, highlights, social links
- Stats bar below

**Section 2 — Skills** (from Resume):
- 4-column grid of skill categories (Security, Automation, Cloud & Network, Tools)
- Wider layout

**Section 3 — Experience** (from Resume):
- Timeline layout, widened container `max-w-5xl`
- All 3 roles with bullets

**Section 4 — Education** (from Resume):
- 2-column cards, wider
- Coursework tags on M.S. card

**Section 5 — Certifications** (from Resume):
- Grid/pill layout

**Section 6 — Resume Download**:
- Small "Download Resume PDF" button at bottom

**CTA** at the very end.

### 4. Remove Resume Route (`src/App.tsx`)

- Remove the `/resume` route
- Keep the `Resume` import for now (or remove entirely)

### 5. Update Navigation (`src/components/Navigation.tsx`)

- Remove "Resume" from `navItems`
- Nav becomes: Home, Projects, Writeups, About, Contact

### 6. Contact Page (`src/pages/Contact.tsx`) — Two-Column Layout

Change from current 3-column (1 sidebar + 2 form) to a proper two-column split:

- Widen to `max-w-6xl`
- **Left column**: "Let's Connect" headline, intro text, contact links (email, GitHub, LinkedIn), availability list
- **Right column**: Full contact form (keeps smart auth behavior)

### 7. Projects Page (`src/pages/Projects.tsx`) — Widen

- `max-w-5xl` → `max-w-6xl`

### 8. Writeups Page (`src/pages/Writeups.tsx`) — Widen

- `max-w-5xl` → `max-w-6xl`

### 9. Footer (`src/components/Footer.tsx`) — Widen

- `max-w-5xl` → `max-w-6xl`

---

### Files to Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Widen container, responsive padding |
| `src/pages/Index.tsx` | Widen all sections, enlarge hero image, reduce vertical gaps, link to `/about` instead of `/resume` |
| `src/pages/About.tsx` | Full rewrite — merge Resume content (skills, experience, education, certs, download button) |
| `src/App.tsx` | Remove `/resume` route |
| `src/components/Navigation.tsx` | Remove "Resume" nav item |
| `src/pages/Contact.tsx` | Widen to `max-w-6xl`, two-column layout |
| `src/pages/Projects.tsx` | Widen to `max-w-6xl` |
| `src/pages/Writeups.tsx` | Widen to `max-w-6xl` |
| `src/components/Footer.tsx` | Widen to `max-w-6xl` |

