# Auth-Gated Email in Contact Section

Gate `contact@vijaysinghpuwar.com` behind sign-in on the Contact page, preserving the current dark cyber aesthetic. GitHub/LinkedIn stay public. No redesign, no new deps, no DB calls.

## Scope
Single file: `src/pages/Contact.tsx` (the email link in the "Let's Connect" glass card).

## Behavior

**Logged out**
- Render a masked email: `cont••••@vijaysinghpuwar.com`
- Apply a subtle CSS `blur-sm` on the local part with a glass overlay
- Small lock icon (lucide `Lock`) + helper text: *"Sign in to unlock direct contact access"*
- Clicking the row navigates to `/login` (existing route) via `react-router` `useNavigate`
- Hover: blur eases off slightly, primary glow intensifies (pure CSS transition, no JS)

**Logged in**
- Read `user` from existing `useAuth()` (already imported in this file — zero extra calls)
- Reveal full `contact@vijaysinghpuwar.com` as a normal `mailto:` link
- Fade/blur transition via `transition-[filter,opacity] duration-500`

## Implementation Notes
- No new components, no new files, no new packages
- Uses existing `useAuth` session state — no extra Supabase requests
- Respects `prefers-reduced-motion` (transitions only, no transforms)
- Keeps 44px tap target on mobile; layout unchanged
- No toasts, no redirect loops — single `navigate('/login')` on click when logged out
- All other page content (form, availability, GitHub, LinkedIn, hero, nav, mobile, perf, Supabase fallback) untouched

## Accessibility
- `aria-label="Sign in to reveal email"` on the gated state
- `aria-label="Email Vijaysingh"` on the revealed `mailto`
- Lock icon marked `aria-hidden`

## Out of Scope
- No analytics event (keeping it dependency-free; can add later if desired)
- No changes to auth flow, RLS, or backend
