

# Interactive Skills Radar Chart

## Architecture Change
The radar and skill tabs need to share state. Lift `activeTab` state to the parent (`Index.tsx`) and pass it as props to both components. Both components become controlled.

## Files to Modify

| File | Action |
|------|--------|
| `src/components/SkillsRadar.tsx` | **Rewrite** — Full interactive radar |
| `src/components/SkillCategories.tsx` | **Edit** — Accept `activeTab`/`onTabChange` props |
| `src/pages/Index.tsx` | **Edit** — Lift shared state, pass props |

## SkillsRadar.tsx — Full Rewrite

### Data mapping (radar axis → tab key)
```
Identity & Access → security
Automation → automation
Cloud Security → cloud
Network Defense → cloud
Detection & SIEM → security
Offensive Security → tools
```

### Props
- `activeTab: string` — current tab from parent
- `onAxisClick: (tabKey: string) => void` — notify parent to switch tab

### Interaction 1: Hover spotlight
- On hover of axis `i`, compute modified values: hovered axis goes to 100%, others shrink to 60% of their base value
- Animate polygon points using `requestAnimationFrame` lerping (not direct setState per frame — lerp a target array and render interpolated values)
- Dot grows to 10px, label brightens to white
- Glass-morphism tooltip with name, percentage bar, and value — positioned relative to the dot with smart placement (avoid clipping edges)

### Interaction 2: Radar ↔ Tab sync
- **Click axis → switch tab**: Call `onAxisClick(mappedTabKey)` on click
- **Tab changes radar**: When `activeTab` prop changes, temporarily override displayed values — axes mapped to that tab go to 100%, others to 50%. After 1.5s timeout, return to base values. Track this with a `tabHighlight` state + timeout ref.

### Interaction 3: Animated entry (scroll into view)
Phased animation using `useInView` + a `phase` state variable:
1. **Phase 0** (not in view): Nothing visible
2. **Phase 1** (0–0.8s): Grid hexagons draw in one by one (inner to outer), using `stroke-dashoffset` animation with 0.2s stagger
3. **Phase 2** (0.8–1.6s): Data polygon morphs from center point to full shape (spring)
4. **Phase 3** (1.6–2.2s): Dots pop in clockwise (0.1s stagger each)
5. **Phase 4** (2.2–2.5s): Labels fade in together

### Interaction 4: Ambient pulse (idle)
- When `hovered === null` and no tab highlight active:
  - Polygon fill opacity oscillates 0.15↔0.25 via CSS animation (3s infinite)
  - Each dot has a subtle scale pulse (1.0→1.2→1.0, 2s, offset by `i * 0.3s`)

### Styling
- Gradient: `#00e5ff` to `#a855f7`
- Grid hexagons: `rgba(0, 229, 255, 0.06)` stroke
- Dots: `#00e5ff`, 6px default
- Tooltips: `rgba(15,23,42,0.9)` bg, backdrop-blur, thin border, scale+fade entry

### Mobile
- Hover → tap (toggle hovered state on tap, dismiss on tap elsewhere)
- Tap axis triggers tab switch same as click

## SkillCategories.tsx — Minor Edit
- Change from internal `useState('security')` to props: `activeTab: string`, `onTabChange: (key: string) => void`
- Replace `active`/`setActive` with the props
- Everything else stays the same

## Index.tsx — Lift State
```tsx
const [skillTab, setSkillTab] = useState('security');
// ...
<SkillsRadar activeTab={skillTab} onAxisClick={setSkillTab} />
<SkillCategories activeTab={skillTab} onTabChange={setSkillTab} />
```

