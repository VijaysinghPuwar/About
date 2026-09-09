# Update R.S. Infotech role to the new job description

Replace the current R.S. Infotech bullets in all three places they appear with the three-bullet version from the new JD, and drop the duplicated/overlapping lines (endpoint hardening, firewall/IDS-IPS, MFA, Tier 1/2 support, "70% manual effort", "20% fewer breaches") so the role reads once, consistently.

## New content (used everywhere)

Role: System Engineer — R.S. Infotech — Feb 2023 – Aug 2024

1. Automated recurring operational workflows across a 150+ Windows and Linux environment in Python, SQL, PowerShell and Bash — log processing, inventory, uptime monitoring, account lifecycle, configuration compliance, data reconciliation and reporting — replacing manual process with reusable, maintainable tooling rather than one-off scripts.
2. Delivered solutions end to end with stakeholders: identified the problem, investigated it, designed and built the solution, tested, deployed and documented the expected behaviour so other engineers could support it, maintained through Git-based development.
3. Root-caused defects across applications, system services, authentication, data and networking using Splunk, operating-system logs, event data and network evidence, then validated each fix; supported AWS and Microsoft Azure alongside on-premises infrastructure.

## Where it changes

- `src/components/ExperienceTimeline.tsx` — the `rs-infotech` entry: swap its four bullets for the three above, keeping the existing `highlightMetric('150+')` treatment on the endpoint count.
- `src/pages/Resume.tsx` — the `R.S. Infotech` block: same three bullets (résumé already caps at 5, so the shorter list is fine).
- `src/pages/About.tsx` — the `R.S. Infotech` item: same three bullets, replacing the five older ones.

No layout, styling, or other section changes.
