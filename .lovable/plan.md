

## Plan: Complete Portfolio Redesign — Clean, Premium, Recruiter-Friendly

This is a full visual and structural redesign. The content stays largely the same but the layout, styling, and hierarchy get a complete overhaul. No database or backend changes needed.

---

### Design System Changes

**CSS (`src/index.css` + `tailwind.config.ts`):**
- Reduce glow intensities across all `--glow-*` variables (50% reduction)
- Remove `cyber-grid` background from body (`App.tsx` — remove `cyber-grid` class)
- Remove `scanlines` effects and `cyber-hover` scale transforms
- Simplify `gradient-border` — use subtle 1px borders instead of gradient masks
- Reduce border opacity defaults (`--border` slightly dimmer)
- Keep dark mode base colors but soften card backgrounds slightly

---

### 1. Homepage Redesign (`src/pages/Index.tsx`) — Full Rewrite

**Section A — Hero:**
- Profile photo (smaller, 96-112px, subtle ring)
- Name: "Vijaysingh Puwar"
- Title: "Cybersecurity Engineer"
- One-liner: "Securing infrastructure, automating defense, and building practical cloud and network security solutions."
- 2 CTAs only: "View Resume" + "Contact Me"
- Small social row below: GitHub | LinkedIn | Email icons
- Remove certification badges from hero, remove marquee tools section, remove parallax background

**Section B — About Snapshot (3 columns):**
- "Security Operations & IAM" — AD hygiene, MFA, endpoint hardening
- "Automation" — Python, PowerShell, scripting
- "Cloud & Network Security" — AWS, VPC, firewalls, routing
- Simple icon + title + 2-line description per block

**Section C — Featured Projects (3 cards):**
- Show 3 featured projects only
- Simpler card: title, short description, tech tags, GitHub link
- "View All Projects" button below
- Remove stats bar, remove gradient overlays, remove floating elements

**Section D — Writeups (3 cards):**
- Clean article-style cards: category tag, title, summary, "Read More"
- Remove oversized gradient boxes and aspect-video placeholder areas
- "View All Writeups" link

**Section E — Experience (timeline):**
All 3 roles from resume/LinkedIn:

1. **R.S. Infotech — System Engineer** (Feb 2023 – Aug 2024)
   - Secured 150+ enterprise endpoints
   - AD identity hygiene via PowerShell
   - IAM operations, MFA enforcement
   - Python automation for log analysis
   - Firewall/IDS/IPS, reduced breaches 20%

2. **L&T-Sargent & Lundy — Systems Intern** (Jan 2023 – Apr 2023)
   - HVAC system design & optimization
   - 100% adherence to ASHRAE standards

3. **Elecon Engineering — Design Intern** (Jan 2022 – Jun 2022)
   - CAD modeling and analysis
   - Engineering documentation

Clean stacked timeline layout, no oversized cards.

**Section F — Education (2 cards side-by-side):**

Card 1: Pace University
- M.S. Cybersecurity
- New York, NY
- GPA: 4.00
- Expected: Dec 2026
- Selected Coursework: Computational Statistics, Introduction to Cybersecurity, Information Security Management, Network Security & Defense, Ethical Hacking & Penetration Testing, Automating InfoSec with Python & Shell, Cyber Intelligence Analysis & Modeling, Operating Systems Theory & Administration

Card 2: G.H. Patel College of Engineering & Technology
- B.E. Mechanical Engineering
- Gujarat, India
- CGPA: 7.11
- Completed: Aug 2023

No transcript downloads. No transcript links.

**Section G — Certifications (compact row):**
- CompTIA Security+
- CompTIA CySA+
- Cisco CCNA
- ISC2 Candidate
- Google AI Essentials

Small badges/pills in a single row. Remove large cert image cards.

**Section H — Contact (simple):**
- Short text + email link + contact form link
- Or inline compact form

---

### 2. Projects Page (`src/pages/Projects.tsx`)

- Remove login/auth gate — make projects public (remove `ProtectedRoute` wrapper)
- Remove access level badges and auth prompts
- Keep category filter + search
- Remove stats bar
- Simplify `ServiceCard` — remove gradient overlays, floating elements, `cyber-hover` scale
- Simpler card: subtle border, title, description, tech tags, GitHub button
- Remove `FeaturedService` large layout — use same card style for all

**Project data — public repos only:**
Keep existing projects.json entries (all are public). From the repos PDF, additional public repos to consider adding:
- `secure-ubuntu-fleet`
- `http-hardening-nmap-nse`
- `drive-folder-topology`
- `test_dicript`
- `Configuring-RIP-Cisco-Packet-Tracer`
- `CS601C-Computational-Statistics-Project`
- `distance-conversion-tool`

Exclude private repos: web-audio-tv, image_to_video_fal_app, Aveengers, WDP.AmazonClone, CISSP-Domains, PetSnap-Facts, GitTestfromVscode, FirstDay01-Web.

Add `http-hardening-nmap-nse` and `secure-ubuntu-fleet` to featured list (security-focused).

---

### 3. Route Changes (`src/App.tsx`)

- Remove `ProtectedRoute` from `/projects`, `/projects/:id`, `/writeups`, `/resume`
- Keep `ProtectedRoute` only on `/admin`
- All content pages become public

---

### 4. Writeups Page (`src/pages/Writeups.tsx`)

- Simplify card styling — remove `cyber-hover`, `shadow-cyber`, gradient backgrounds
- Use clean flat cards with subtle border
- Keep search + category filter

---

### 5. Resume Page (`src/pages/Resume.tsx`)

- Add Education section with both degrees (Pace + GH Patel) using transcript data
- Add selected coursework from graduate transcript
- Remove cert images (keep text-only cert list)
- Keep skills, experience, academic projects
- No transcript download buttons anywhere

---

### 6. About Page (`src/pages/About.tsx`)

- Simplify cards — remove `backdrop-blur-sm`, `shadow-cyber` effects
- Clean typography, less visual noise

---

### 7. Navigation (`src/components/Navigation.tsx`)

- Simplify: remove glow effects on active link
- Make navbar transparent → solid on scroll (add scroll listener)
- Cleaner, lighter button styling
- Keep: Home, Projects, Writeups, Resume, About, Contact

---

### 8. Footer (`src/components/Footer.tsx`)

- Minimal: name, role, email, GitHub, LinkedIn, copyright
- Remove "Resources" and "Quick Links" columns — single row
- Remove `cyber-grid` background
- Remove "Built with React + Vite" text

---

### 9. Contact Page (`src/pages/Contact.tsx`)

- Keep existing functional form (already wired to edge function)
- Simplify visual styling — remove glow effects
- Keep "What I'm Looking For" section

---

### 10. Theme Cleanup

- Remove `cyber-grid` class from `App.tsx` body
- Reduce all `shadow-glow-cyan` / `shadow-cyber` usage — use subtle `shadow-sm` or `shadow-md`
- Remove `animate-glow-pulse` from hero profile photo
- Remove parallax `backgroundAttachment: 'fixed'` from hero
- Cards: use `border border-border/40` only, no `backdrop-blur-sm`
- Buttons: consistent styling, remove `shadow-glow-cyan` from most buttons
- Keep pentest mode toggle but apply same cleanup

---

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Full rewrite — new section structure |
| `src/pages/Projects.tsx` | Simplify, remove auth gate |
| `src/pages/Writeups.tsx` | Simplify card styling |
| `src/pages/Resume.tsx` | Add 2nd degree, coursework, remove cert images |
| `src/pages/About.tsx` | Simplify styling |
| `src/pages/Contact.tsx` | Simplify styling |
| `src/components/Navigation.tsx` | Scroll-based transparency, cleaner links |
| `src/components/Footer.tsx` | Minimal single-row footer |
| `src/components/ServiceCard.tsx` | Simplify — remove gradients/glows |
| `src/components/FeaturedService.tsx` | Remove or simplify significantly |
| `src/App.tsx` | Remove ProtectedRoute from public pages |
| `src/index.css` | Reduce glow/blur effects |
| `src/data/projects.json` | Add `secure-ubuntu-fleet`, `http-hardening-nmap-nse` |
| `index.html` | Clean up duplicate meta tags |

### No Changes Needed
- Database schema — no changes
- Edge functions — no changes
- Auth system — keep as-is (just remove route protection from content pages)
- `useAuth`, `useProjects` hooks — no changes

