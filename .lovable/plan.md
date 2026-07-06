## Goal
Replace the MTA experience card text in the Experience timeline with a shorter, premium, recruiter-friendly version. No layout, design, animation, or other data changes.

## Scope
- **File:** `src/components/ExperienceTimeline.tsx`
- **Target:** The `expandedContent` block inside the `mta-sirtoa` timeline entry (lines ~76-136).
- **Untouched:** Title, subtitle, period, card styling, animations, mobile/desktop layout, other timeline entries, technology badge component structure.

## Changes

### Summary paragraph
Replace the long opening paragraph with:
> "Supporting enterprise IT infrastructure, network operations, endpoint systems, and secure technology services for MTA Staten Island Railway, focusing on system reliability, troubleshooting, and operational efficiency."

### Bullet points (5 total)
Replace the 10-bullet list with:
1. Supported enterprise IT operations by resolving ServiceNow incidents, troubleshooting system issues, and coordinating with cross-functional MTA technology teams.
2. Deployed and maintained Windows endpoints, Microsoft 365 services, user access, printers, mobile devices, and enterprise applications across railway environments.
3. Performed network and infrastructure troubleshooting including LAN connectivity, device communication, shared resources, and operational system availability.
4. Assisted with Active Directory access management, endpoint security practices, asset lifecycle tracking, and technical documentation.
5. Supported enterprise platforms including HxGN EAM, ArcGIS, and internal databases while improving workflow reliability and operational efficiency.

### Security Alignment
Reduce from 3 bullets to 1 sentence:
> "Supported secure infrastructure operations through endpoint management, access control, system verification, and enterprise technology support."

### Technology badges
Reorganize into 4 cleaner groups (no new badge styling):
- **Networking:** TCP/IP, LAN Troubleshooting, Enterprise Networks
- **Systems:** Windows Administration, Active Directory, Microsoft 365, Endpoint Management
- **Security:** Access Management, Endpoint Security, System Verification
- **Tools:** ServiceNow, ArcGIS, HxGN EAM

### Removed
- All 10 original long bullet points
- Original 3 Security Alignment bullets
- "Infrastructure" and "Cybersecurity" badge groups (consolidated into cleaner groups above)

## Verification
- Build passes without errors.
- Screenshot confirmation that card layout, spacing, and animations remain identical.
- No other timeline entries modified.