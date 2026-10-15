# Align dates, claims, and featured projects

## Scope

Apply only the seven requested corrections after approval. Treat the supplied dates and wording as authoritative. Leave `public/resume.pdf` byte-for-byte unchanged. No styling, colours, gradients, effects, authentication, or backend changes. No em dashes in added text.

## 1. Correct experience and education dates

In `src/components/ExperienceTimeline.tsx`:
- `rs-infotech`: `FEB 2023 → AUG 2024`.
- `be-mech`: `COMPLETED AUG 2023`.
- Leave the MTA entry and the existing `EXPECTED DEC 2026` M.S. date unchanged.

In `src/pages/Resume.tsx`:
- R.S. Infotech period: `Feb 2023 – Aug 2024`.
- G H Patel period: `Aug 2023`.
- Pace period: `Jan 2025 – Dec 2026 (expected)`.

## 2. Replace the duration claim and MTA bullet

Set the resume summary exactly to:

> Cybersecurity engineer with systems and network operations experience at R.S. Infotech and the MTA. At the MTA, handles access requests and incidents on a 24/7 rail network. Outside work, builds and runs two production web platforms and fixes their security issues. CompTIA Security+, CompTIA CySA+, and Cisco CCNA certified.

In the resume meta description, replace only `three years in systems and network operations` with `systems and network operations at R.S. Infotech`.

Set the resume MTA incidents bullet exactly to:

> Handle about 14 ServiceNow incidents a week and escalate to senior staff or vendors such as Dell, HP, and Solari.

Keep `Emerging Talent Intern` unchanged. Leave other bullets unchanged, including the timeline MTA bullet, as the request specifies this bullet change only on the resume page.

Repeat a case-insensitive literal search of all `src` files and `index.html` for `three years`, `3 years`, and `3+ years`. The current search finds only the summary and meta description in `Resume.tsx`; no `index.html` edit is currently needed.

## 3. Remove the unsupported skill

Remove only the `Kubernetes` skill entry from `src/components/SkillMatrix.tsx`. Leave the remaining skills and layout intact.

## 4. Make BreachScope the third featured project

In `src/data/projects.json`:
- Set only `cutmox.featured` to `false`; retain its other content and index availability.
- Insert the following entry immediately after `vaultsnake-platform`, using the existing JSON schema:

```json
{
  "id": "breachscope",
  "title": "BreachScope: Live Threat Intelligence Map",
  "description": "A live threat-intelligence map built on six public security feeds, with provenance and location accuracy on every record.",
  "category": "Threat Intelligence",
  "tech": ["Go", "PostgreSQL", "React", "TypeScript", "MapLibre GL", "Vercel"],
  "year": "2026",
  "status": "live",
  "featured": true,
  "keyResults": [
    "Load tested at 20,000 requests and 200 concurrent with zero errors and zero data races",
    "Pulls C2 servers, malware hosts, scanners, exploited CVEs and breaches from ThreatFox, URLhaus, Feodo Tracker, SANS DShield, CISA KEV and Have I Been Pwned",
    "Runs at $0 a month"
  ],
  "links": {
    "github": "https://github.com/VijaysinghPuwar/BreachScope",
    "writeup": null,
    "demo": "https://breachscope-live.vercel.app"
  },
  "image": "",
  "tags": ["threat intelligence", "go", "postgres", "react"]
}
```

### Necessary display-order adjustment

`ProjectShowcase.tsx` currently selects featured cards by membership in `FEATURED_ORDER`, not by the JSON `featured` flag. Therefore, the JSON changes alone would leave cutmox featured and omit BreachScope.

Replace `cutmox` with `breachscope` in `FEATURED_ORDER`. Keep `FEATURED_LIMIT = 3` and the other IDs unchanged. The unfiltered cards will be **Recap Verse, VAULTSNAKE, BreachScope**, in that order. Use the existing description and results fallback for BreachScope's detail view; do not add invented enrichment or impact claims. The existing status fallback already displays `live` as `LIVE`.

## 5. Verify and report

- Check the exact requested dates, summary, meta description, bullet, and skill removal in the source and running pages.
- Validate JSON, BreachScope's exact facts and links, its position after VAULTSNAKE, and cutmox's false flag.
- Verify the actual three-card order, BreachScope's headline and detail view, and cutmox's continued index availability through the running site. Use an authenticated session if required; do not weaken access controls.
- Check the preview's automatic build results. Do not manually run builds or typechecks.
- Confirm the PDF SHA-256 remains `fbfe3d18e405683a7ad2f2218de8bf151a9858a691dd982044948286be38f38f`.
- Inspect the final diff for unrelated changes and newly added em dashes.
- Provide every edited file with its final line numbers or line ranges, including this planning file. Expected application changes are limited to `Resume.tsx`, `ExperienceTimeline.tsx`, `SkillMatrix.tsx`, `projects.json`, and the `FEATURED_ORDER` line in `ProjectShowcase.tsx`.

## Technical notes

The reference index and schema guide under `../reference/` are unavailable in this workspace, so the entry follows the inspected project JSON and current rendering code. Database-backed project rows take precedence only for matching IDs; leave that merge behaviour unchanged. No LinkedIn content was fetched, so verification will be against the exact facts supplied in this request, not an independent LinkedIn audit.