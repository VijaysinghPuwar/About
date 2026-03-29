

# Fix Timeline Alternating Layout

## Root Cause
The `order-3` and `order-2` CSS classes on the grid children are breaking the natural 3-column grid placement. When `isLeft` is false (right-side card), the empty left div gets `order-3` and the right div gets no order (0), so the card renders in the first column visually — always appearing on the left.

## Fix in `src/components/ExperienceTimeline.tsx`

**Line 170**: Remove all `order` classes from the grid children. The 3-column grid `[1fr_auto_1fr]` already places items correctly by DOM order:
- Column 1 (left div) — renders card only when `isLeft` is true
- Column 2 (center dot) — always renders
- Column 3 (right div) — renders card only when `isLeft` is false

Specific changes:
1. **Line 172**: Change `hidden md:block ${isLeft ? '' : 'order-3'}` → `hidden md:block`
2. **Line 185**: Change `hidden md:flex flex-col items-center order-2` → `hidden md:flex flex-col items-center`
3. **Line 209**: Change `hidden md:block ${isLeft ? 'order-3' : ''}` → `hidden md:block`

No other files touched.

