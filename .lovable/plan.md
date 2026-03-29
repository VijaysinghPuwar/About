

# Contact Section & Footer Rebuild

## Overview
Replace the contact section in Index.tsx (lines 251-344) with an interactive "digital business card" layout, and rebuild the Footer component with center nav links and a gradient separator.

---

## 1. Contact Section in `src/pages/Index.tsx` (lines 251-344)

### Section Intro
- Label: "CONNECT" (gradient, uppercase)
- Heading: "Let's Work Together"
- Subtitle text about openness to roles

### Left Column — Digital Business Card + Availability
**Business card** (glass-card):
- "VP" monogram with `gradient-text text-3xl font-bold`
- Name: "Vijaysingh Puwar" in white bold
- Title: "Cybersecurity Engineer" in muted
- 3 contact rows (Mail, Github, Linkedin icons), each with `group` hover: row background brightens + subtle cyan glow (`hover:bg-primary/5 hover:shadow-[inset_0_0_20px_hsl(var(--primary)/0.05)]`)
- Rounded corners, gradient-border on hover

**Availability section** below the card:
- 4 items with pulsing green dots (`animate-cyber-pulse` reused from existing CSS)
- Items: Cybersecurity Engineering roles, Security Operations positions, Cloud Security opportunities, Collaborations & Consulting

### Right Column — Contact Form (keep existing logic)
- Preserve existing `handleSubmit` with Supabase edge function
- Preserve auth-aware behavior (hide email when logged in, pre-fill name)
- **Enhanced styling**: inputs get `focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)]` glow on focus
- **Success state upgrade**: After submit, animate button to checkmark using `AnimatePresence` — button morphs to a success state with `CheckCircle2` icon + "Message Sent!" text, then a "Send Another" option appears below

### Remove
- `openToRoles` array (move inline into availability items)
- The role pills bar above the grid (lines 260-268)

---

## 2. Footer — `src/components/Footer.tsx`

Rebuild with 3-column layout:
- **Top border**: gradient line (`bg-gradient-to-r from-transparent via-primary/40 to-transparent h-px`)
- **Left**: "VP" gradient monogram + "© 2026 · Built with intent"
- **Center**: Nav links as tiny `text-xs font-mono` anchors: Skills · Projects · Experience · Contact (smooth scroll `href="#skills"` etc.)
- **Right**: Social icons (GitHub, LinkedIn, Email) — same as current
- Transparent background so particle effects show through (`bg-transparent`)

---

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Replace contact section (lines 251-344), remove `openToRoles` array, enhance form success state |
| `src/components/Footer.tsx` | Rebuild with 3-column layout + gradient separator + center nav links |

