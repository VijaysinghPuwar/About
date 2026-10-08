# Rebuild the resume around the new PDF

The uploaded `VijaysinghPuwar_Resume.pdf` (2 pages, parsed and verified against page images) is a full rewrite of the resume. It supersedes the R.S. Infotech text approved earlier today: the PDF's version is different (security-focused bullets, end date March 2026), and the user confirmed the PDF wins everywhere.

## 1. Replace the downloadable file

- Copy `user-uploads://VijaysinghPuwar_Resume.pdf` over `public/resume.pdf`, so the page and the "Download PDF" button stay identical.

## 2. Rewrite `src/pages/Resume.tsx` to match the PDF

Keep the existing page structure (one column, `SectionHeading`, `EntryHead`, `Bullets`, `ProtectedEmail`). Change the content:

- **Header** — keep name, add the phone number `929-400-2052` as plain text; keep the gated email via `ProtectedEmail` (phone public, email behind sign-in, per the user's choice); GitHub and LinkedIn links stay. Update the `Helmet` description if the summary changes it.
- **Summary** — replace the current PROFILE with the PDF's three-sentence summary ("Cybersecurity engineer with three years in systems and network operations. At the MTA, handles access requests and incidents on a 24/7 rail network. Outside work, builds and runs two production web platforms and fixes their security issues. CompTIA Security+, CompTIA CySA+, and Cisco CCNA certified.")
- **Experience**
  - *Emerging Talent Intern | Metropolitan Transportation Authority (MTA), New York, NY, Jun 2026 – Present* — the PDF's six bullets (AD/DUO MFA/Zscaler ZPA access reviews; ServiceNow incidents escalating to Dell, HP, Solari; railway device inventory traced to switch ports; Cisco Catalyst and OSPF/BGP troubleshooting; SIR IT request intake in Power Automate/SharePoint with runbook; Python NTP clock-correction service for a Rail Control Center workstation).
  - *System Engineer | R.S. Infotech, Vadodara, India, Feb 2023 – Mar 2026* — the PDF's six bullets (150+ Windows/Linux on-prem and AWS/Azure with patching and scheduled changes; AD/Group Policy with MFA enrollment and privileged-group reviews; Splunk incidents and IDS/IPS/firewall tuning; SonarQube/ZAP/Burp/Nessus triage plus GitLab CI security checks; Python/PowerShell/Bash scripts for compliance, log review, inventory; backup/DR testing and audit evidence).
- **Projects** — all eight from the PDF, each with its link and stack line: Web Audio TV (webaudiotv.com), Recap Verse (recapverse.com), AWS Cloud Security Lab (GitHub), TrustKart (GitHub), Dual ISP Network Assessment (GitHub), x86-64 Binary Hardening Lab (GitHub), Hardened Static Page (GitHub), spoonstill (GitHub), with the PDF's bullets verbatim.
- **Education and Certifications** — M.S. Cybersecurity, Pace University Seidenberg School of CSIS, GPA 3.92, Jan 2025 – Present, with the PDF's relevant-coursework line; B.E. Mechanical Engineering, G H Patel College, May 2023; Certifications: CompTIA Security+, CompTIA CySA+, Cisco CCNA, Google AI Essentials.
- **Skills** — the PDF's six groups: Security, Identity, Cloud and Systems, Networking, Languages, Databases.

Note: the PDF's B.E. date (May 2023) supersedes the January 2024 shown today; the R.S. Infotech end date becomes March 2026.

## 3. Update `src/components/ExperienceTimeline.tsx`

- `mta-sirtoa` — align the bullets with the PDF's six (condensed for the card); title of record becomes "Emerging Talent Intern".
- `rs-infotech` — dates `FEB 2023 → MAR 2026`; bullets replaced with the PDF's six, keeping the `highlightMetric('150+')` treatment; refresh the "Working with" chips to match.
- `be-mech` — dates `COMPLETED MAY 2023` (the earlier Aug 2023 transcript completion date is superseded by the resume's date).
- `ms-cyber` — already says GPA 3.92 and matches the PDF; no change beyond consistency checks.

## 4. Align the project showcase numbers

`src/data/projects.json` still shows stats the PDF supersedes (Recap Verse "353 deployments / 900+ tests" → 398 deployments / 2,019 tests; Web Audio TV 843 users → about 1,000). Update only the numbers and claims the PDF explicitly restates; leave the rest of the showcase entries untouched.

## 5. Verify

- `bunx tsgo --noEmit` passes; `/tmp/observability/build-errors.log` shows a clean build.
- Playwright check of `/resume`: phone visible, email masked when signed out, new sections (Projects with eight entries, Skills groups) render; `public/resume.pdf` downloads.
