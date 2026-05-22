## Scope

Update academic content only — no design, layout, or auth changes. Preserve cybersecurity visual identity, responsive fixes, and performance optimizations.

## Files to update

1. **`src/components/ExperienceTimeline.tsx`** (M.S. Cybersecurity entry)
   - GPA: `4.00` → `3.91`
   - Status: keep `Expected Dec 2026`
   - Replace coursework chips with completed + in-progress courses (grouped):
     - **Completed**: Introduction to Cybersecurity, Operating Systems Theory & Administration, Information Security Management, Network Security & Defense, Ethical Hacking & Penetration Testing, Automating InfoSec with Python & Shell, Cyber Intelligence Analysis & Modeling, Computational Statistics, Introduction to Coding, Business Data Communications, Algorithms & Computing Theory
     - **In Progress**: Data Science I: Intro to Data, Cybersecurity Capstone Project
   - Add small line: `39 credits applied · Seidenberg School of CSIS, NYC`

2. **`src/pages/About.tsx`** (education card)
   - GPA: `4.00` → `3.91`
   - Replace `coursework` array with the 11 completed courses above
   - Add a second small `inProgress` field (Data Science I, Capstone) shown as a separate badge row labeled "In Progress"

3. **`src/pages/Resume.tsx`** (resume page)
   - Same GPA + coursework + in-progress update as About
   - Sharpen skill mapping in the `skills` object to reflect completed coursework:
     - **Security**: keep + add `Penetration Testing`, `Threat Intelligence`, `Security Management (NIST/ISO 27001)`
     - **Automation**: keep (Python/PowerShell/Shell already accurate)
     - **Cloud & Network**: keep
     - **Tools**: keep
   - No bullet-point experience changes (transcript doesn't affect work history)

4. **`public/sitemap.xml`, SEO meta**: no change needed (no GPA in meta).

5. **Resume PDF (`public/resume.pdf`)**: out of scope to regenerate binary — will flag in summary so user can update separately. Website content structure will match what the new PDF should contain.

## Wording polish (light)

- Education subtitle stays factual; no marketing fluff.
- Add the campus/school line once in the timeline expanded view for ATS keyword coverage ("Seidenberg School of Computer Science and Information Systems").

## Out of scope

- No changes to auth flow, project cards, theme, animations, or layout.
- No new components, routes, or dependencies.
- Resume PDF binary not regenerated.

## Verification

- Grep for `4.00` and `4\.0` in `src/` returns no matches after edit.
- Preview `/`, `/about`, `/resume` — all three show GPA 3.91 and the updated course list.

## Post-update report to user

- List of changed sections (timeline, About education, Resume education + skills).
- Outdated items found (old GPA 4.00 in 3 places; coursework missing 3 newly completed courses).
- Recommendations (regenerate `public/resume.pdf` to match; consider adding Capstone project to Projects page once underway).
