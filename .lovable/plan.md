

## Mobile Hero — Eliminate Blank-Screen-First Issue

### Root cause
The hero uses `min-h-screen flex flex-col justify-center` plus the inner container has `pt-32 pb-20` (128px top padding). On a 390px-wide phone, vertical-centering a tall terminal inside a min-100vh section + 128px top padding pushes the terminal far below the fold, leaving the top ~40% of the screen empty. The status indicators (`pt-20`) sit just below the navbar but are tiny, so the first impression is "empty dark space."

### Fix scope
Mobile-only (< lg). Desktop layout stays exactly as-is.

### Changes — `src/pages/Index.tsx` hero section only

**1. Hero section wrapper (line 113)**
- Remove `min-h-screen` and `justify-center` on mobile; apply only at `lg:` breakpoint.
- New: `relative flex flex-col overflow-hidden hero-grid-bg lg:min-h-screen lg:justify-center`
- This lets the hero be exactly as tall as its content on mobile.

**2. Inner container (line 135)**
- Cut top padding hard on mobile: `pt-20 pb-10` (80px top — just clears the 56px navbar with a small breath) instead of `pt-32 pb-20`.
- Keep desktop: `sm:pt-36 sm:pb-24`.

**3. Status indicator block (line 117)**
- Currently has its own `pt-20` AND sits above the container which also has `pt-32` → double spacing.
- Remove `pt-20` on mobile; reduce `mb-4` to `mb-3`.
- Keep absolute positioning on desktop (`md:absolute md:top-20`).

**4. Scroll indicator (line 170)**
- On mobile this gets stranded mid-page once we shrink the section. Hide on mobile: add `hidden lg:flex`.

**5. Social icons (line 145)**
- Reduce `mt-6` → `mt-4` on mobile to tighten.

### Changes — `src/components/TerminalHero.tsx`

**6. Terminal body min-height (line ~140 area)**
- Currently `min-h-[320px] sm:min-h-[380px]` — too tall before content types in, contributing to perceived emptiness.
- Change to `min-h-[260px] sm:min-h-[380px]` so mobile starts more compact while typing animation plays.

**7. Terminal padding**
- `px-4 sm:px-6 py-5` → `px-4 sm:px-6 py-4 sm:py-5` (small mobile reduction).

### Expected mobile above-the-fold (390×844 iPhone)
```
[ 0–56px   ] Navbar (logo • shield • menu)
[ 56–80px  ] Status row: ● Systems Online · 📍 NY · ● Open
[ 80–96px  ] (12px breath)
[ 96–420px ] Terminal card — name, role, mission begin typing immediately
[ 420–470px] Social icons + bottom of card
[ 470–844px] Skills section header peeks → invites scroll
```

No empty top zone. Hero content visible instantly.

### Out of scope (already fine)
- Navigation spacing — Navigation.tsx already handles mobile cleanly per prior fixes
- Skills/projects/contact mobile layout — already addressed in earlier passes
- HeroShield — already `hidden lg:flex`, doesn't render on mobile

### Files modified
| File | Lines touched |
|------|---------------|
| `src/pages/Index.tsx` | 113, 117, 135, 145, 170 (hero section only) |
| `src/components/TerminalHero.tsx` | terminal body min-height + padding |

No new files. No database changes. No desktop regression.

