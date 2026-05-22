## Scope

Add grouped Mechanical Engineering coursework to the B.E. entry across all three render sites, and remove the previous cybersecurity-framing sentence per the explicit instruction "Do not connect this section to cybersecurity."

## Edits

1. **`src/components/ExperienceTimeline.tsx`** — `be-mech` expanded content
   - Keep: title, subtitle, period, `CGPA: 7.11 / 10`
   - **Remove** the sentence "A strong technical foundation … cybersecurity."
   - Replace with a "Relevant Coursework" block using 6 collapsible/grouped sections (one heading per group, courses as chips below). Use the same `glass-card` chip style already used for the M.S. coursework — no new components.
   - Groups: Core Mechanical Engineering, Manufacturing and Design, Engineering Mathematics and Science, Management Quality and Modern Engineering, Projects / Practical, General / Professional Development (full lists per user).

2. **`src/pages/About.tsx`** — Education data + render
   - Populate `coursework` on the B.E. entry; introduce a new optional `courseGroups` field shaped as `{ label, items }[]` so the render block can show grouped subheadings instead of one flat blob.
   - Render: under the existing GPA badges, show a "Relevant Coursework" label, then iterate `courseGroups` rendering each group as a small subheading + chip row. Reuse existing chip class. Keep responsive (chips wrap; on mobile each group stacks).
   - Leave the M.S. entry untouched (its existing `coursework` flat list still renders the same way for that card).

3. **`src/pages/Resume.tsx`** — Same `courseGroups` pattern as About (subheading + Badge rows), reusing existing Badge styling. Ensure two-column education grid still works; the B.E. card will simply grow taller — that's expected and acceptable.

## Privacy

- No enrollment number, token, barcode, seat number, marks, or semester table rendered anywhere.
- Only course titles, degree, college, university, completion date, CGPA shown.

## Responsive / build safety

- Chips use `flex-wrap gap-1.5` already present — no overflow risk.
- No new dependencies, routes, or layout changes.
- Other sections (projects, contact, auth, animations, navbar, SEO) untouched.

## Verification

- `rg "cybersecurity" src/components/ExperienceTimeline.tsx` → no match in the `be-mech` block.
- `rg "Gujarat Technological University"` → present in all three files.
- Spot-check `/`, `/about`, `/resume` at 375px and 1280px viewports — chip rows wrap cleanly, group headings stack on mobile.
