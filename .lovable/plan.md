## Objective
Add the latest MTA (Staten Island Railway) internship to the portfolio's Experience section, positioning it as the most recent work entry with cybersecurity-aligned impact points and technology skill tags.

## Files to Change

### 1. `src/components/ExperienceTimeline.tsx`
- Insert new work entry `mta-sirtoa` as the second item in the `entries` array (index 1, left-side desktop placement), after the M.S. education entry.
- **Title:** IT Infrastructure & Network Operations Intern
- **Subtitle:** Metropolitan Transportation Authority (MTA) — Staten Island Railway (SIRTOA), NYCT - SIRTOA Operations Support
- **Period:** June 2026 – Present
- **Type:** work
- **Expanded content:**
  - Opening summary line about supporting enterprise IT infrastructure across Staten Island Railway environments.
  - Bulleted responsibilities using existing `highlightMetric` pattern where applicable (e.g., "enterprise endpoints", "daily system verification checks").
  - Security alignment subsection with 3 security-focused bullets (endpoint configuration, CIS systems support, incident response workflows).
  - Technology skill tags using the existing `glass-card` rounded-full badge pattern, grouped by category: Networking, Systems, Tools, Infrastructure, Cybersecurity.

### 2. `src/pages/About.tsx`
- Insert MTA entry at the top of the `experience` array.
- Same role title, company, period.
- 4–5 high-impact bullets matching the Timeline entry, focused on enterprise scale, troubleshooting, network connectivity, endpoint management, and security operations.

### 3. Global search confirmation
- Search for any old references to "IT/OT Network Intern", "Information Technology, Emerging Talent Intern", or "Emerging Talent Intern" across the codebase.
- If found, replace with "IT Infrastructure & Network Operations Intern" for display consistency.

## What Stays Unchanged
- Existing timeline layout, alternating left/right logic, mobile responsive layout, and animation behavior.
- All other entries: R.S. Infotech, L&T-Sargent & Lundy, B.E. Mechanical Engineering, Elecon Engineering.
- Certifications section.
- No redesign of visual theme or component structure.

## Verification Steps
- Run `bun run build` to confirm TypeScript compiles cleanly.
- Use Playwright to screenshot the Experience section on both desktop and mobile viewport to confirm:
  - MTA card renders correctly in timeline position.
  - Expanded state shows bullets and tech tags properly.
  - No layout shifts or truncation on mobile.

## Recruiter Impact Recommendations (post-implementation)
- Lead bullet with enterprise scale: "Supported enterprise IT infrastructure operations across Staten Island Railway environments..."
- Include quantifiable scope where possible: endpoints, facilities, daily checks.
- Security subsection explicitly ties operational IT work to cybersecurity analyst/SOC analyst vocabulary: endpoint security, access management, system verification, operational technology.