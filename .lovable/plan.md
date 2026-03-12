

# Premium Cybersecurity Portfolio Redesign — Full Plan

This is a large redesign covering content removal, access control gating, and visual polish across the entire site.

---

## 1. Remove Writeups Section Entirely

**Files affected:** `src/pages/Index.tsx`, `src/components/Navigation.tsx`, `src/App.tsx`, `src/pages/Writeups.tsx`

- Delete the "Technical Writeups" section (lines 292-321) from `Index.tsx`
- Remove `writeupsData` import and `recentWriteups` variable
- Remove "Writeups" from `navItems` array in `Navigation.tsx` (line 21)
- Remove the `/writeups` route from `App.tsx`
- Delete `src/pages/Writeups.tsx`
- Update Login.tsx line 109: remove "writeups" from sign-in description text

---

## 2. Access Control — Gate Projects & Resume Behind Google Sign-In

**Files affected:** `src/pages/Index.tsx`, `src/pages/Projects.tsx`, `src/pages/ProjectDetail.tsx`, `src/components/Navigation.tsx`, `src/components/ProjectCard.tsx`

### Approach
Use the existing `useAuth` hook. No new database tables needed — the gating is purely client-side UI visibility.

### Hero CTA gating (`Index.tsx`)
- **Download Resume**: If not authenticated, instead of linking to `/resume.pdf`, show a sign-in prompt dialog or redirect to `/login`. If authenticated, allow download.
- **View Projects**: If not authenticated, redirect to `/login` with a return URL. If authenticated, navigate to `/projects`.

### Featured Projects section on homepage (`Index.tsx`)
- If user is NOT signed in: show a single placeholder card: "Sign in with Google to view projects and resume" with a sign-in button. Hide actual project cards.
- If user IS signed in: show project cards as normal.

### Projects page (`Projects.tsx`)
- Wrap the entire page content in an auth check.
- If not authenticated: show a centered card with "Sign in with Google to access the full project portfolio" + Google sign-in button.
- If authenticated: show existing project list.

### ProjectDetail page (`ProjectDetail.tsx`)
- Same pattern: if not authenticated, show sign-in prompt instead of project details.

### Navigation (`Navigation.tsx`)
- Keep "Projects" in nav but add a lock icon (`Lock` from lucide) next to it when user is not signed in.
- Remove "Writeups" entirely.

---

## 3. GitHub Credibility Strip

**File:** `src/pages/Index.tsx`

Add a compact section between Featured Projects and Experience showing:
- GitHub profile link with icon
- Text: "10+ public repositories · Security Automation · Python · PowerShell · Bash"
- Simple horizontal layout, monospace font, subtle styling
- This is static content (no API calls to GitHub).
- Only visible to authenticated users (same gating as projects).

---

## 4. Visual Polish & Typography (already partially done in Phase 1)

**File:** `src/index.css`
- Fonts are already set (Space Grotesk + Inter). Verify they're loading.
- No further font changes needed.

**File:** `src/pages/Index.tsx`
- Experience section: already has bolded metrics — no change needed.
- Education: already has B.E. coursework — no change needed.
- Open To section: already exists — no change needed.
- Certifications: already polished — no change needed.

---

## 5. Footer & Contact — Verify mailto Links

**Files:** `src/components/Footer.tsx`, `src/pages/Contact.tsx`, `src/pages/Index.tsx`

- All mailto links already point to `contact@vijaysinghpuwar.com` — verify no onClick interceptors.
- Footer already has working icons — minor spacing refinement only.

---

## 6. Login Page Copy Update

**File:** `src/pages/Login.tsx`
- Change description from "Sign in to access projects, writeups, and more." to "Sign in with Google to access the full project portfolio and resume."

---

## Summary of File Changes

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Remove writeups section, gate projects/resume behind auth, add GitHub credibility strip |
| `src/components/Navigation.tsx` | Remove Writeups nav item, add lock icon to Projects for guests |
| `src/App.tsx` | Remove `/writeups` route |
| `src/pages/Writeups.tsx` | Delete file |
| `src/pages/Projects.tsx` | Add auth gate — show sign-in prompt for guests |
| `src/pages/ProjectDetail.tsx` | Add auth gate — show sign-in prompt for guests |
| `src/pages/Login.tsx` | Update copy |
| `src/components/Footer.tsx` | Minor spacing polish |

