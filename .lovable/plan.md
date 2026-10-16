# End the MTA internship at Aug 2026

## Changes
1. Resume page (`src/pages/Resume.tsx` line 31): `Jun 2026 – Present` becomes `Jun 2026 – Aug 2026`.
2. Home timeline (`src/components/ExperienceTimeline.tsx`, entry `mta-sirtoa`):
   - Dates `JUN 2026 → NOW` become `JUN 2026 → AUG 2026`.
   - Remove `now: true`, so the "CURRENT" tag and blinking cursor disappear and the hexagon mark returns to the neutral colour like the other past entries.
3. Present-tense MTA bullets switch to past tense in both places ("Review" to "Reviewed", "Handle" to "Handled", "Troubleshoot" to "Troubleshot", "Supporting" to "Supported" in the timeline detail paragraph). Wording otherwise unchanged; ServiceNow sentence keeps no ticket count.
4. Record the end date in the verified-dates memory so it stays consistent.

## Not changed
- `public/resume.pdf` stays as is. Note: it still says the internship is ongoing, so it will differ from the site until you upload an updated PDF.
- Job title stays Emerging Talent Intern.

## Verify
Typecheck, build log, and a quick look at `/resume` and the home timeline.
