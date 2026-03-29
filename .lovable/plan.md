

# Command Palette (⌘K / Ctrl+K)

## Files

| File | Action |
|------|--------|
| `src/components/CommandPalette.tsx` | **Create** — Full component |
| `src/App.tsx` | **Edit** — Mount inside BrowserRouter |
| `src/components/Footer.tsx` | **Edit** — Add "Press ⌘K to navigate" hint |

## CommandPalette.tsx

### Data
Build a static commands array from `projects.json` and hardcoded nav/action entries, grouped into 4 categories:

- **Navigation**: Go to Home/Skills/Projects/Experience/Contact — each scrolls to that section ID
- **Actions**: Download Resume (alert placeholder), Open GitHub, Open LinkedIn, Send Email
- **Skills**: Python, PowerShell, AWS, Docker, Linux, Nmap — with "Used in N projects" hints computed from `projects.json` tech arrays
- **Projects**: All 12 project titles from `projects.json` — activating scrolls to `#projects`

### Keyboard
- `useEffect` listener for `keydown`: if `(e.metaKey || e.ctrlKey) && e.key === 'k'` → toggle `isOpen`, `e.preventDefault()`
- Arrow Up/Down changes `selectedIndex`, Enter executes, Escape closes
- Auto-focus input on open; restore focus on close

### Filtering
- Simple case-insensitive substring match on label + keywords
- Group results by category; hide empty category headers
- Show "No results found" with muted icon when empty

### Rendering
- Overlay: fixed inset-0, `rgba(5,8,22,0.7)`, backdrop-blur-sm, click to close
- Modal: centered ~20% from top, max-w-[560px] w-[90vw], glass-morphism card
- Input row with Search icon left, ESC badge right, bottom border
- Scrollable results list (max-h-[360px]), category headers as small uppercase labels
- Selected row: `bg-[rgba(0,229,255,0.06)]` + 2px left cyan border
- Footer: keyboard hints in mono 11px
- Framer Motion `AnimatePresence` for open/close (scale 0.95→1, opacity, 0.15s)

### Icons (from lucide-react)
- Navigation: `Compass`
- Actions: `Zap`
- Skills: `Code`
- Projects: `Folder`

## App.tsx
Add `import { CommandPalette } from "@/components/CommandPalette"` and mount `<CommandPalette />` inside `BrowserRouter`, next to `ThreatLevelIndicator`.

## Footer.tsx
After the social icons div, add a small element:
```tsx
<span className="font-mono text-[11px] text-[#475569]">
  Press <kbd>⌘K</kbd> to navigate
</span>
```
Detect Mac via `navigator.platform` to show ⌘ vs Ctrl. Style the `kbd` as a tiny bordered key cap.

