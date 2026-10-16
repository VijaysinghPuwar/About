# Remove the MTA internship from the website

Every mention of the MTA / Staten Island Railway internship comes off the site. R.S. Infotech becomes the only work experience shown.

## Changes

- **Home page timeline** (`ExperienceTimeline.tsx`): delete the `mta-sirtoa` entry. Remaining order: M.S., R.S. Infotech, B.E.
- **Resume page** (`Resume.tsx`): delete the MTA role; rewrite the profile line to drop "the MTA and" (becomes "...IT infrastructure experience at R.S. Infotech across..."); remove "Identity, access and incident work on the MTA rail network," from the page description.
- **Terminal** (`terminal-commands.ts` lines ~146, ~196): remove the MTA lines from the whoami/experience output.
- **Hero schematic** (`SecurityDiagram.tsx` ~467): remove the "current: MTA, Staten Island Railway" fact row (or replace with "Pace University, M.S. Cybersecurity" so the layout keeps its row count).
- **Environment page** (`Environment.tsx` lines 68, 89): remove the two MTA-derived items (NTP service, System Verification Log).
- **Search metadata** (`index.html` ~89): remove the MTA employer from the structured data.
- Update the project memory so MTA is not re-added.

## Not changed

- `public/resume.pdf` still lists the MTA. You would need to upload a new PDF without it; until then the download and the page will differ.

## Verify

Search the code for MTA, SIRTOA, Staten Island, Emerging Talent, Rail Control: zero hits. Typecheck, build log, and a quick look at home, /resume and /environment.
