

# Threat Level Scroll Indicator

## Overview
Replace `ScrollProgress` (the boring top bar) with a cybersecurity-themed `ThreatLevelIndicator` fixed to the bottom-left corner. It uses Intersection Observer on the 5 Index page sections to show a contextual status that changes with glitch/slide animations.

## Files

| File | Action |
|------|--------|
| `src/components/ThreatLevelIndicator.tsx` | **Create** |
| `src/App.tsx` | **Edit** — Replace `ScrollProgress` with `ThreatLevelIndicator` (mount inside `BrowserRouter` so it only shows on `/`) |
| `src/components/ScrollProgress.tsx` | **Delete** |

## ThreatLevelIndicator Component

### Section Detection
- Use `IntersectionObserver` with `threshold: 0.3` on sections by their IDs: `home`, `skills`, `projects`, `experience`, `contact`
- Track which section is most visible; update `activeSection` state
- Only render on the Index page (check `location.pathname === '/'` or observe if sections exist)

### State Map
```ts
const SECTIONS = [
  { id: 'home',       dot: '#22c55e', status: 'RECON',         label: 'Hero' },
  { id: 'skills',     dot: '#eab308', status: 'SCANNING',      label: 'Skills & Technologies' },
  { id: 'projects',   dot: '#00e5ff', status: 'ACTIVE OPS',    label: 'Featured Projects' },
  { id: 'experience', dot: '#a855f7', status: 'CLASSIFIED',    label: 'Experience & Education' },
  { id: 'contact',    dot: '#22c55e', status: 'CHANNEL OPEN',  label: 'Contact' },
];
```

### Collapsed View (default)
- Glass card: `bg-[rgba(15,23,42,0.85)]`, `backdrop-blur-xl`, border `rgba(100,220,255,0.1)`, rounded-xl, ~160px wide
- Row 1: Pulsing dot (8px) + status text (JetBrains Mono / font-mono, 11px, uppercase, tracking-[1.5px])
- Row 2: Section label (Inter, 10px, `#64748b`)

### Transition Animation (on section change)
1. Current text slides left + fades out (0.2s) via Framer Motion `AnimatePresence`
2. Brief glitch frame: show `█▓░▒` characters for ~100ms
3. New text slides in from right + fades in (0.2s)
4. Dot color transitions via CSS `transition: background-color 0.3s`

### CLASSIFIED Glitch
- When `activeSection === 'experience'`, run a `setInterval` every 3s that scrambles the status text to random block chars for 150ms then restores it

### Expanded Section Map (click/tap)
- `isExpanded` state toggles on click
- Framer Motion `animate` height from collapsed to showing all 5 sections as a vertical list
- Each row: dot + status + label; current section highlighted with brighter text + left gradient border
- Click a section → `document.getElementById(id).scrollIntoView({ behavior: 'smooth' })` + collapse
- Click outside (use a backdrop or `useEffect` click listener) or Escape → collapse

### Mobile
- Width shrinks to 140px via responsive class
- Tap = click for all interactions

### Mounting
- Place inside `BrowserRouter` in `App.tsx` (needs route context to conditionally render only on `/`)
- Or simpler: always mount, observe sections by ID — if none found, hide the widget

