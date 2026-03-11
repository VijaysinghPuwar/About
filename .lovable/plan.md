

# Premium Cybersecurity Portfolio Redesign

This is a comprehensive redesign touching nearly every page and component. To keep it manageable and avoid breaking changes, I recommend splitting it into **3 phases**. Here is Phase 1 — the highest-impact changes.

---

## Phase 1: Core Visual System + Hero + Critical Fixes

### 1. Typography Upgrade (`src/index.css`)
- Replace Inter with **Space Grotesk** (headings) + **Inter** (body, kept for readability)
- Add Space Grotesk import from Google Fonts
- Update heading styles: `.section-title` gets `font-family: 'Space Grotesk'` with tighter letter-spacing
- Hero h1 gets extra bold weight (700-800) for stronger presence

### 2. Hero Section Redesign (`src/pages/Index.tsx`)
**Content changes:**
- Reorder: Name first, then "Cybersecurity Engineer" label below
- Replace summary with stronger copy: *"Specializing in identity security, security automation, and cloud infrastructure defense. Building practical detection pipelines, endpoint hardening systems, and scalable security tooling."*
- Change CTAs to: **Download Resume** (primary, links to `/resume.pdf` download) + **View Projects** (outline, links to `/projects`)
- Add small "Contact Me" text link below CTAs

**Add Security Stack chip row** below the hero (or as a sub-section):
- Horizontal scrollable badge row: Python, PowerShell, AWS, Active Directory, Splunk, Docker, Linux, Ansible, IAM, SIEM, Nmap, Wireshark
- Styled as small monospace chips with subtle border

### 3. Fix mailto Links (Global)
- Hero social icons: already correct (`mailto:contact@vijaysinghpuwar.com` on line 152) — verify working
- Footer (`src/components/Footer.tsx`): already uses `mailto:` — verify
- Contact page: already has mailto link — verify
- Ensure no `onClick` handlers are intercepting the `<a>` tags

### 4. Writeups Section — Honest Labeling (`src/pages/Index.tsx`, `src/pages/Writeups.tsx`)
- Change section heading from "Research" → **"Security Analysis"**
- Change title from "Recent Writeups" → **"Technical Writeups"**
- Change card CTA from "Read More →" → **"View Analysis →"**
- On Writeups page: change "Research" heading → "Security Analysis", subtitle "Writeups & Labs" → "Technical Writeups"

### 5. Core Competencies Upgrade (`src/pages/Index.tsx`)
- Add 4th card: **Detection & Monitoring** — "SIEM monitoring with Splunk, log analysis, threat detection rules, and security alerting pipelines."
- Use `Radar` icon from lucide for the 4th card
- Switch grid to `md:grid-cols-2 lg:grid-cols-4`
- Slightly increase card padding and icon size

### 6. Experience Section Polish (`src/pages/Index.tsx`)
- Bold key metrics in bullet text using `<strong>` tags: "**150+** enterprise endpoints", "**70%** reduction", "**20%** reduction"
- Increase spacing between entries (`space-y-10` instead of `space-y-8`)
- Make role title more prominent: company in bold, role as primary-colored text

### 7. Education Balance (`src/pages/Index.tsx`)
- Add coursework/highlights to the B.E. card:
  - "Engineering Design & Analysis"
  - "Manufacturing Systems"
  - "Thermodynamics & Fluid Mechanics"
  - "Technical Documentation"
- This balances the two cards visually

### 8. Certifications Polish (`src/pages/Index.tsx`)
- Increase padding on cert items
- Add subtle hover effect
- Use slightly stronger border styling

### 9. "Open To" Recruiter Section (`src/pages/Index.tsx`)
- Add new section before the Contact CTA
- Title: **"Open To"**
- Grid of role chips: Cybersecurity Engineering, Security Operations, Cloud Security, Security Automation, IAM / Identity Security
- Subtle card or badge-row layout

### 10. Footer Polish (`src/components/Footer.tsx`)
- Tighten layout, ensure icons are properly aligned
- Add subtle separator styling
- Verify all links work (mailto, GitHub, LinkedIn)

### 11. Contact Page — No changes needed
- mailto links already work
- Authenticated flow already hides email field
- Form is functional

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add Space Grotesk font, update heading styles |
| `src/pages/Index.tsx` | Hero content/CTAs, security stack row, competencies 4-col, experience bold metrics, education B.E. coursework, writeups relabeling, "Open To" section, cert polish |
| `src/pages/Writeups.tsx` | Relabel "Research" → "Security Analysis" |
| `src/components/Footer.tsx` | Minor spacing/alignment polish |

---

## Phase 2 (next iteration)
- Project cards redesign with stronger descriptions and GitHub metadata
- GitHub credibility strip
- ProjectCard component upgrade

## Phase 3 (next iteration)
- About page alignment with new design system
- Contact page visual refinements
- Navigation polish
- Responsive fine-tuning across all pages

