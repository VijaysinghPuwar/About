

## Plan: Pentest Mode, UX Improvements, and Profile Photo

### 1. Fix Build Error + Refactor Theme System

The current build error is likely from the `ThemeProvider` and App.tsx setup. The existing theme system uses `blue`/`red` string types but is incomplete.

**Refactor `src/hooks/useTheme.tsx`:**
- Rename theme values to `'default' | 'pentest'` (Pentest Mode branding)
- Apply class `theme-pentest` on `<html>` when active, remove it when default
- Persist to `localStorage` key `pentest-mode`

**Update `src/index.css`:**
- Keep `:root` as the blue/default theme (already defined)
- Rename `.theme-red` to `.theme-pentest` and ensure ALL CSS variables are overridden with red palette:
  - `--primary`, `--secondary`, `--ring`, `--border`, `--glow-cyan` (rename glow vars)
  - `--scanline-color`, `--grid-color` all shift red
- Add a global `transition: background-color 200ms, color 200ms, border-color 200ms` to `*` for smooth theme switching

**Update `src/components/ThemeToggle.tsx`:**
- Label: show "Pentest Mode" text on desktop, icon-only on mobile
- Use a `Shield` or `Crosshair` icon for pentest, `Waves` for default
- Style the toggle with a red glow when pentest is active

### 2. Update Navigation (`src/components/Navigation.tsx`)
- Add `ThemeToggle` back (it was removed when the Navigation was rewritten)
- Keep it in both desktop and mobile menu sections
- Ensure `shadow-glow-cyan` class references work with theme (they use CSS vars, so they'll auto-switch)

### 3. Profile Photo in Hero (`src/pages/Index.tsx`)
- Add a circular avatar image above/left of the name in the hero section
- Image URL: the LinkedIn photo URL provided
- Style: `w-32 h-32 rounded-full border-4` with `border-primary` (auto-switches with theme)
- Add `ring-4 ring-primary/30` glow effect
- Alt text: "Vijaysingh Puwar profile photo"
- On mobile: centered above name; on desktop: inline-left of name

### 4. UX Improvements
- **Hero section**: Increase `leading-relaxed` on subtitle text, reduce visual clutter by simplifying cert badges area
- **Smooth scroll**: Already using `react-router-dom` for navigation between pages (not single-page scroll anchors), so this is already handled
- **Card hover**: Already has `hover:-translate-y-1` — ensure consistent across all cards
- **Theme transition**: Add CSS `transition` on `background-color`, `color`, `border-color` globally (200ms)

### 5. Tailwind Config (`tailwind.config.ts`)
- Remove the unused `red-team` color references that reference undefined CSS variables (likely causing the build error)

### Files to modify:
1. `src/index.css` — Rename `.theme-red` to `.theme-pentest`, add transition
2. `src/hooks/useTheme.tsx` — Update types to `'default' | 'pentest'`
3. `src/components/ThemeToggle.tsx` — Update labels and icons
4. `src/components/Navigation.tsx` — Re-add ThemeToggle import and usage
5. `src/pages/Index.tsx` — Add profile photo to hero
6. `tailwind.config.ts` — Remove undefined `red-team` CSS var references

