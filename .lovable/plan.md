

# Full Portfolio Rebuild — Cyber Gradient Design System

This is a large rebuild touching every page and the global design system. I'll implement it in **3 phases within this execution** to keep changes organized.

---

## Phase 1: Design System + Hero

### 1.1 Color System Overhaul (`src/index.css`)
- Replace current blue primary with **cyan #00d4ff** (`195 100% 50%`)
- Add secondary **violet #7c3aed** (`263 70% 58%`)
- Deepen background to **#0a0e1a** (`222 47% 5%`)
- Card backgrounds: semi-transparent `rgba(15, 23, 42, 0.6)` with `backdrop-blur-xl` and subtle border `rgba(148, 163, 184, 0.1)`
- Add CSS custom properties for gradient: `--gradient-accent: linear-gradient(135deg, #00d4ff, #7c3aed)`
- Add `.gradient-text` utility class using `background-clip: text` with the accent gradient
- Add `.glass-card` utility for glass-morphism styling
- Add dot-matrix background pattern at very low opacity (~0.03) replacing current grid

### 1.2 Typography
- Keep Space Grotesk + Inter + JetBrains Mono (already set up)
- No font changes needed — current pairing matches the prompt

### 1.3 Navigation (`src/components/Navigation.tsx`)
- Replace Shield + text logo with **"VP" monogram** using gradient text
- Add gradient underline for active nav link instead of just color change
- Keep existing auth dropdown, lock icons, mobile sheet

### 1.4 Hero Rebuild (`src/pages/Index.tsx`)
- **Remove portrait photo entirely**
- **Right side**: Create an animated SVG network graph component (`src/components/CyberVisual.tsx`)
  - Animated nodes (circles) connected by lines, subtly pulsing
  - Uses cyan/violet gradient colors
  - Nodes float with gentle motion using Framer Motion
  - Responsive sizing
- **Left side**: Keep text content structure but apply gradient text to "CYBERSECURITY ENGINEER" label
- CTAs: Primary button gets gradient background (`bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]`), secondary stays outline with gradient border
- Update tagline: "I secure enterprise infrastructure, automate security operations, and build detection pipelines that catch threats before they escalate."

### 1.5 Skills Ticker
- Replace static chip row with **infinite horizontal marquee**
- Duplicate the list for seamless loop using CSS `animation: marquee`
- Each skill as a semi-transparent pill with subtle gradient glow on hover

---

## Phase 2: Sections Upgrade

### 2.1 Core Competencies — Bento Grid (`src/pages/Index.tsx`)
- Change from uniform 4-col grid to **bento layout**: first card spans 2 columns (Security Operations & IAM), remaining 3 are standard size
- Cards get glass-morphism styling (`.glass-card`)
- First card gets animated gradient border
- Icons get gradient background circles behind them
- Section label "WHAT I DO" uses `.gradient-text`

### 2.2 Featured Projects
- Taller cards with gradient mesh/abstract pattern header area (CSS-only using radial gradients with project-specific color accents)
- Keep existing auth gating logic
- Below cards: stats bar "18+ public repositories · Security Automation · Python · PowerShell · Bash"
- "View All Projects →" button with gradient style

### 2.3 Experience Timeline
- Replace `border-l-2 border-border/60` with gradient border (`border-image: linear-gradient(#00d4ff, #7c3aed)`)
- Timeline dot gets glow effect
- Role title in gradient text
- Key metrics (150+, 70%, 20%) highlighted with cyan accent
- Glass-morphism cards wrapping each entry

### 2.4 Education
- Glass-morphism cards
- GPA badges with gradient background
- Keep existing coursework structure

### 2.5 Certifications
- Slightly larger cards with glass-morphism
- Subtle hover glow effect

### 2.6 Open To & Contact CTA
- Keep structure, apply glass-morphism and gradient accents

---

## Phase 3: Secondary Pages

### 3.1 Projects Page (`src/pages/Projects.tsx`)
- Active filter tab gets gradient background
- Search input gets glass-morphism styling
- Cards match new design system
- Keep auth gating

### 3.2 About Page (`src/pages/About.tsx`)
- Replace circular photo with gradient-bordered rounded rectangle
- Stats bar: numbers use gradient text, animate count-up with Framer Motion
- Skills categories get glass-morphism cards
- Apply gradient timeline to experience section
- Apply glass-morphism to all cards

### 3.3 Contact Page (`src/pages/Contact.tsx`)
- Glass-morphism form card
- Input focus state: border transitions to gradient
- Keep existing form logic and auth-aware prefill

### 3.4 Footer (`src/components/Footer.tsx`)
- Glass-morphism style matching nav
- "Built with intent" tagline
- Keep working mailto/GitHub/LinkedIn icons

---

## New Component

### `src/components/CyberVisual.tsx`
- SVG-based animated network graph
- ~8-12 nodes positioned in a circular/organic layout
- Lines connecting nearby nodes
- Nodes pulse with opacity animation
- Lines have subtle gradient stroke
- Entire visual has gentle floating motion
- Uses Framer Motion for animations
- Responsive: smaller on mobile

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/index.css` | New color system, gradient utilities, glass-card class, dot-matrix bg |
| `src/components/CyberVisual.tsx` | **New** — animated SVG network graph |
| `src/pages/Index.tsx` | Full hero rebuild, bento grid, marquee ticker, glass-morphism everywhere |
| `src/components/Navigation.tsx` | VP monogram, gradient active indicator |
| `src/components/Footer.tsx` | Glass-morphism, tagline |
| `src/pages/About.tsx` | Glass-morphism cards, gradient accents, stats animation |
| `src/pages/Projects.tsx` | Glass-morphism, gradient filter tabs |
| `src/pages/Contact.tsx` | Glass-morphism form, gradient focus states |
| `src/components/ProjectCard.tsx` | Glass-morphism, gradient header area |
| `tailwind.config.ts` | No changes needed — already has gradient utilities |

