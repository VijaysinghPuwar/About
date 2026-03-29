

# Single-Page Portfolio Rebuild — Deep Space Design System

Major architectural shift from multi-page routing to a single-page scrolling app with section anchors, a new color palette, and interactive elements throughout.

---

## Architecture Change

Convert from React Router multi-page to a **single scrolling page** with smooth-scroll anchor navigation. Keep `/login`, `/admin`, `/pending`, `/blocked` as separate routes. Remove `/about`, `/contact`, `/projects`, `/projects/:id` as standalone pages — their content merges into the single homepage.

---

## 1. Color System Update (`src/index.css`)

Replace current HSL variables with the new deeper palette:
- `--background`: #050816 (near-black)
- `--card`: rgba(15, 23, 42, 0.5) with backdrop-blur
- `--primary`: #00e5ff (electric cyan, slightly warmer than current)
- `--secondary`: #a855f7 (vivid purple, brighter than current)
- Text primary: #e2e8f0, muted: #64748b
- Update `.glass-card` border to `rgba(100, 220, 255, 0.08)`
- Add `--success-metric: #22d3ee` for highlighted numbers

---

## 2. Navigation → Scroll Anchors (`src/components/Navigation.tsx`)

- Change nav items from route `Link`s to smooth-scroll anchor `<a href="#section">` elements
- Sections: Home, Skills, Projects, Experience, Contact
- Add `scroll-behavior: smooth` to `<html>`
- Active section detection using `IntersectionObserver` — highlight the nav item whose section is currently in viewport
- Keep auth dropdown, mobile sheet, VP monogram
- Keep `/login` redirect for gated items

---

## 3. App.tsx — Simplified Routing

- Remove routes for `/about`, `/contact`, `/projects`, `/projects/:id`
- Keep only: `/` (single page), `/login`, `/admin`, `/pending`, `/blocked`
- The Index page becomes the entire site

---

## 4. Index.tsx — Full Single-Page Rebuild

Merge all content into one scrolling page with these sections (each with an `id` for anchors):

### `#home` — Hero (keep existing structure)
- CyberVisual on right, text on left
- Update spring physics: `type: "spring", stiffness: 100, damping: 15`
- Update `whileInView` to use `viewport={{ once: true, amount: 0.3 }}`

### `#skills` — Skills & Competencies
- Merge the marquee ticker + bento competency grid + skills grid from About page into one section
- Bento grid with interactive hover — hovering a competency card reveals expanded description with a slide-down animation
- Skills organized into 4 category cards (Security, Automation, Cloud & Network, Tools) with hover-to-highlight individual skills

### `#projects` — Projects (Full Grid, Not Just Featured)
- Show ALL projects (not just 3 featured) with category filter tabs
- Keep auth gating — unauthenticated users see the sign-in placeholder
- Active filter tab gets gradient background
- Cards: glass-morphism with gradient mesh header, tech stack pills, GitHub links
- Staggered entrance with `AnimatePresence` for filter transitions

### `#experience` — Experience + Education + Certifications
- Combine experience timeline, education cards, and certifications into one section
- Use tabbed interface: **Experience | Education | Certifications** — clicking switches content with Framer Motion `AnimatePresence`
- This makes the section interactive rather than a long scroll of cards
- Timeline, education, certifications keep their current visual treatment

### `#contact` — Contact
- Merge Contact page content directly into the homepage
- Two-column layout: info on left, form on right
- Keep existing form logic (Supabase edge function, auth-aware prefill)
- Add the "Open To" role chips above or beside the contact form
- Keep availability indicators with glowing dots

---

## 5. Animation System Update

All `fadeUp` variants updated to use spring physics:
```
transition: { type: "spring", stiffness: 100, damping: 15, delay: i * 0.1 }
```
All `whileInView` uses `viewport={{ once: true, amount: 0.3 }}`

---

## 6. Back-to-Top Button

Add a floating button (bottom-right) that appears after scrolling past the hero. Gradient background, small, rounded. Smooth-scrolls to `#home`.

---

## 7. Footer (`src/components/Footer.tsx`)

Keep minimal. No changes needed beyond what's already there.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/index.css` | Deeper color palette (#050816), updated glass-card border color |
| `src/pages/Index.tsx` | **Full rewrite** — merge all sections into single scrolling page |
| `src/components/Navigation.tsx` | Anchor-based scroll nav with IntersectionObserver active detection |
| `src/App.tsx` | Remove /about, /contact, /projects routes |
| `src/components/BackToTop.tsx` | **New** — floating scroll-to-top button |

### Files kept but no longer routed (can delete later)
- `src/pages/About.tsx` — content merged into Index
- `src/pages/Contact.tsx` — content merged into Index
- `src/pages/Projects.tsx` — content merged into Index
- `src/pages/ProjectDetail.tsx` — content merged into Index

### Key interactive elements per section
- **Skills**: Hover-expand on competency cards, skill badge hover highlights
- **Projects**: Filter tabs with animated layout transitions, card hover lift + glow
- **Experience**: Tabbed interface switching between Experience/Education/Certifications
- **Contact**: Form with focus state gradient borders, glowing availability dots

