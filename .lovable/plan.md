

## Plan: Redesign About/Profile Section

### Changes to `src/pages/About.tsx` — Full Rewrite

**Split Layout (desktop: 2 columns, mobile: stacked):**

Left column:
- Large circular profile image (160px)
- Accent border ring + subtle shadow
- Smooth scale hover animation

Right column:
- Name as large heading
- "Cybersecurity Engineer" title
- Role tags row: `IAM Security` · `Security Automation` · `Cloud Security` · `Network Defense`
- Short 2-3 line professional summary (concise, no wall of text)
- Key highlights as a scannable list with check marks:
  - Secured 150+ enterprise endpoints
  - Identity & Access Management (AD, MFA, GPO)
  - Python & PowerShell security automation
  - Cloud and network security defense
- Social icons row (GitHub, LinkedIn, Email) with hover effects

**Stats bar below the profile area:**
- `150+` Systems Secured
- `10+` Security Projects
- `5+` Certifications

Compact, horizontal row with number + label.

**Capability cards (3 columns, redesigned):**
- Security Operations — IAM, endpoint hardening, incident response, SIEM, vulnerability management
- Security Automation — Python/PowerShell for log analysis, hardening, workflows
- Cloud & Network Security — AWS config, firewall policies, network monitoring, threat detection

Cards: consistent height, better icon spacing, cleaner typography, subtle border only.

**CTA section** at bottom stays as-is (Get in Touch + View Resume).

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/About.tsx` | Full rewrite with split layout, highlights, stats bar, improved cards |

No other files need changes.

