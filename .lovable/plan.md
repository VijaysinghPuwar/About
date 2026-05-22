## Scope

Update only the B.E. Mechanical Engineering education entry across the three places it appears. No layout, styling, or unrelated content changes.

## Edits

1. **`src/components/ExperienceTimeline.tsx`** — `be-mech` entry
   - `subtitle`: `G. H. Patel College of Engineering & Technology · Gujarat Technological University, Ahmedabad`
   - `period`: `Completed Aug 2023`
   - Expanded content: `CGPA: 7.11 / 10` (highlighted) + one polished sentence:
     > "Bachelor of Engineering in Mechanical Engineering — a strong technical foundation in engineering problem-solving, systems thinking, and structured project execution that now informs a security-focused mindset."

2. **`src/pages/About.tsx`** — Education card for the B.E.
   - `school`: `G. H. Patel College of Engineering & Technology`
   - Add new field `affiliation`: `Gujarat Technological University, Ahmedabad` rendered as a small muted line under the school
   - `gpa`: `CGPA: 7.11 / 10`
   - `status`: `Completed Aug 2023`
   - Branch already conveyed via `degree: "B.E. Mechanical Engineering"`

3. **`src/pages/Resume.tsx`** — Same B.E. card updates as About (school, affiliation line, `CGPA: 7.11 / 10`, `Completed Aug 2023`).

4. **About page intro paragraph (one sentence addition only)** — If an "About" narrative exists near the top of `src/pages/About.tsx`, append:
   > "My engineering background strengthens how I analyze complex systems, troubleshoot technical issues, and approach cybersecurity challenges with a structured problem-solving mindset."
   If no suitable paragraph exists, skip this rather than invent new structure.

## Out of scope

- No transcript numbers, enrollment IDs, semester tables, or document scans shown.
- No changes to M.S. Cybersecurity entry, projects, contact, auth, animations, SEO, or styling.
- No PDF regeneration.

## Verification

- `rg "Mechanical Engineering"` in `src/` — spelled correctly everywhere.
- `rg "7.11"` — appears as `7.11 / 10` in all three locations.
- Visually check `/`, `/about`, `/resume` at mobile (≤640px) and desktop widths — cards still single-column on mobile, two-column on desktop, no overflow from the longer school/affiliation string.
