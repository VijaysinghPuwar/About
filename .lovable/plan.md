

# "Show Impact" Diff View in Project Modal

## Overview
Add a toggle button to the project modal in `ProjectShowcase.tsx` that switches between the normal detail view and a before/after security diff view. Only shown for 4 specific projects.

## File to Modify

| File | Action |
|------|--------|
| `src/components/ProjectShowcase.tsx` | **Edit** — Add diff toggle + diff view inside the modal |

## Implementation

### Diff Data
Add a `const IMPACT_DIFFS` map keyed by project ID with `before: string[]` and `after: string[]` arrays for the 4 projects:
- `secure-ubuntu-fleet`
- `http-hardening-nmap-nse`
- `win-dev-sec-bootstrap`
- `aws-cloud-security`

Content exactly as specified in the request (SSH hardening lines, HTTP headers, setup time, security groups, etc.).

### Modal Changes
Inside the modal (lines 197–258), add:

1. **State**: `const [showDiff, setShowDiff] = useState(false)` — reset to `false` when `selectedProject` changes
2. **Toggle button**: Rendered next to the close button (top-right area) only when `selectedProject.id` is in `IMPACT_DIFFS`. Ghost-styled, font-mono text-[12px], glass border. Shows "Show Impact" with `Columns2` icon or "Show Details" with gradient border when active.
3. **Content swap**: Wrap the existing description/tech/features/github-link block and the diff view in `AnimatePresence` with `mode="wait"`. When `showDiff` is false, render existing content with a fade motion wrapper. When true, render the diff view.

### Diff View Component
Inline within the modal or as a local component `DiffView`:

- Two-column grid (`grid md:grid-cols-2 gap-4`, stacked on mobile)
- **Left column**: Red-tinted — 3px left border `rgba(244,63,94,0.3)`, bg `rgba(244,63,94,0.03)`, header badge "BEFORE" in red, lines with `−` prefix in font-mono text-[12px] (11px on mobile)
- **Right column**: Green-tinted — 3px left border `rgba(34,197,94,0.3)`, bg `rgba(34,197,94,0.03)`, header badge "AFTER" in green, lines with `+` prefix

### Staggered Line Animation
Use Framer Motion `variants` with stagger:
- BEFORE lines animate in first (slide from left, 0.08s stagger)
- AFTER lines animate after BEFORE completes (slide from right, 0.08s stagger, `delayChildren: beforeLines.length * 0.08`)
- Use a `key` on the diff container tied to `selectedProject.id` so animation replays when toggling back

### Reset on Toggle Off
When switching back to "Show Details", `showDiff` becomes false, the diff unmounts (AnimatePresence handles crossfade), and next toggle-on replays the animation via fresh mount.

