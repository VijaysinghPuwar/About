import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProtectedEmail } from '@/components/ProtectedEmail';

/**
 * Web resume.
 *
 * Content is transcribed from the canonical PDF at /resume.pdf and must not
 * drift from it: a recruiter who reads this page and then downloads the PDF
 * should find the same claims, in the same order. Nothing here is inferred or
 * generated. The PDF is printed from scripts/resume/resume.html (see the
 * command there); change both together.
 *
 * The phone number is public by decision; the email stays behind sign-in via
 * ProtectedEmail, as everywhere else on the site.
 */

const PROFILE =
  'Software, Systems, and Security Engineer who has run 150+ Windows and Linux servers across AWS, Azure, and on-premises environments, managed Active Directory access at R. S. Infotech and the MTA, and builds live software in Python, Go, Rust, C#/.NET, and Java. Shipped production applications with AES-GCM encrypted secrets, per-route authorization, PostgreSQL row-level security, short-lived signed URLs, CI secret scanning, and 3,000+ automated tests. Finishing an M.S. in Cybersecurity at Pace University (Dec 2026, 3.92 GPA) holding CompTIA Security+, CySA+, and Cisco CCNA certifications.';

const SKILLS: { label: string; items: string }[] = [
  { label: 'Languages', items: 'Python, Go, Rust, C# (.NET), Java, TypeScript, SQL, Bash, PowerShell' },
  { label: 'Frameworks & APIs', items: 'FastAPI, Spring Boot, React, Tauri, REST APIs' },
  { label: 'Databases & Storage', items: 'PostgreSQL, MongoDB, Redis, S3 / Cloudflare R2' },
  { label: 'Cloud, Systems & CI/CD', items: 'AWS, Microsoft Azure, Linux, Windows Server, Docker, Terraform, GitHub Actions, GitLab CI' },
  { label: 'Networking, IAM & Security', items: 'Cisco IOS (VLANs, OSPF, BGP), Active Directory, Group Policy (GPO), Duo MFA, Zscaler ZPA, ServiceNow, Splunk (SPL), OWASP ZAP, Nessus' },
];

interface Role {
  org: string;
  title: string;
  period: string;
  location: string;
  bullets: string[];
}

const EXPERIENCE: Role[] = [
  {
    org: 'Metropolitan Transportation Authority (MTA)',
    title: 'IT Network Intern',
    period: 'Jun 2026 – Aug 2026',
    location: 'New York, NY, U.S.',
    bullets: [
      'Resolved incidents and service requests in ServiceNow for a 24/7 rail operation, isolating faults across the application, network path, access policy, and host, and wrote the operator runbook the team works from.',
      'Built an IT request intake system with Microsoft Forms, Power Automate, and SharePoint to replace manual triage, and caught a validation defect writing wrong values before release.',
      'Supported Cisco Catalyst switching across VLANs, access ports, and trunk ports, mapped devices, verified IP addressing and port assignments, and installed, cabled, and decommissioned servers, thin clients, and telephony equipment.',
      'Wrote a Python NTP clock-correction service for a Rail Control Center workstation with dry-run mode, elevation checks, and rotating logs, and processed access requests for Active Directory groups, Duo MFA, and Zscaler ZPA against policy.',
    ],
  },
  {
    org: 'R. S. Infotech',
    title: 'System Engineer',
    period: 'Feb 2023 – Aug 2024',
    location: 'Vadodara, India (Hybrid)',
    bullets: [
      'Ran 150+ Windows and Linux systems on-premises and on AWS and Azure; patched servers, handled OS imaging and build baselines, administered DNS and DHCP, and tested backup and disaster recovery.',
      'Managed Active Directory: Group Policy (GPO), privileged group access reviews, MFA enrollment, onboarding, and offboarding.',
      'Investigated incidents in Splunk by correlating Windows event logs and network traffic, wrote SPL queries for failed authentication and suspicious activity, and tuned IDS/IPS and firewall rules to cut false positives.',
      'Automated compliance checks, log review, and inventory in Python, PowerShell, and Bash.',
      'Triaged SonarQube, OWASP ZAP, Burp Suite, and Nessus findings, added automated security checks to GitLab CI pipelines, and prepared evidence for audits and client security questionnaires.',
    ],
  },
  {
    org: 'L&T-Sargent & Lundy Limited',
    title: 'Systems Intern',
    period: 'Jan 2023 – Apr 2023',
    location: 'Vadodara, India',
    bullets: [
      'Performed HVAC heat load calculations and duct sizing, designed duct layouts and technical drawings in AutoCAD, and wrote technical reports turning calculations into clear recommendations for stakeholders.',
    ],
  },
  {
    org: 'Elecon Engineering Company',
    title: 'Design Intern',
    period: 'Jun 2022 – Jul 2022',
    location: 'Anand, India',
    bullets: [
      'Produced AutoCAD drawings and bills of materials for gear manufacturing, ran quality control checks against drawing specifications and tolerances, and reported design and production findings to stakeholders.',
    ],
  },
];

interface ResumeProject {
  name: string;
  /** Printed on the PDF's title row; made clickable here. */
  links: { href: string; label: string }[];
  bullets: string[];
}

const PROJECTS: ResumeProject[] = [
  {
    name: 'Recap Verse & Web Audio TV',
    links: [
      { href: 'https://recapverse.com', label: 'recapverse.com' },
      { href: 'https://webaudiotv.com', label: 'webaudiotv.com' },
    ],
    bullets: [
      'Built and ran Recap Verse in Python, FastAPI, and MongoDB, an AI video-recap and multi-provider LLM platform with paying subscribers across 17 routers, 28 services, 398 deployments, and 2,019 automated tests, using AES-GCM encrypted secrets, per-route auth checks, CI secret scanning, and deduplicated Stripe and PayPal webhooks.',
      'Operated streaming platform Web Audio TV on PostgreSQL, Supabase, and REST APIs (with row-level security) for 1,000+ registered users and 200 daily active users; moved audio delivery off the main host to cut hosting costs by 90% and drop stream start latency to 0.35s, and tuned an 8.05s SQL query timeout down to 0.49s.',
    ],
  },
  {
    name: 'R2Dock – Cloudflare R2 Desktop Client',
    links: [{ href: 'https://github.com/VijaysinghPuwar/R2Dock', label: 'github.com/VijaysinghPuwar/R2Dock' }],
    bullets: [
      'Created a 6-crate async Rust, Tokio, Tauri 2, React, and TypeScript desktop client for Linux, Windows, and macOS with parallel checksummed multipart uploads, disk-journaled crash recovery, local FFmpeg AV1 compression, and OS keychain credential storage behind a strict Content Security Policy.',
    ],
  },
  {
    name: 'TrustKart – Full-Stack Technology Store',
    links: [{ href: 'https://trustkart-xi.vercel.app', label: 'trustkart-xi.vercel.app' }],
    bullets: [
      'Built a Dockerized store in Java 21, Spring Boot 4, PostgreSQL 17, Redis, and React across 1,260+ products (101 deployments) with single-transaction checkout, one-time order keys, and fixed-order stock locks to prevent deadlocks, passing 100 concurrent checkouts with zero overselling and 120+ JUnit 5 and Testcontainers tests.',
    ],
  },
  {
    name: 'BreachScope & AWS Cloud Hardening',
    links: [{ href: 'https://github.com/VijaysinghPuwar/BreachScope', label: 'github.com/VijaysinghPuwar/BreachScope' }],
    bullets: [
      'Built a live threat-intelligence map in Go, PostgreSQL, React, and TypeScript load-tested locally at 20,000 requests with zero errors, and wrote Terraform modules to harden AWS EC2 with Security Groups, NACLs, VPC Flow Logs, IMDSv2, and CloudWatch monitoring.',
    ],
  },
];

const EDUCATION = [
  {
    school: 'Pace University',
    degree: 'Master of Science in Cybersecurity (GPA: 3.92)',
    period: 'Jan 2025 – Dec 2026',
    location: 'New York, NY, U.S.',
  },
  {
    school: 'G H Patel College of Engineering & Technology',
    degree: 'Bachelor of Engineering in Mechanical Engineering',
    period: 'Jun 2019 – Aug 2023',
    location: 'Anand, India',
  },
];

const CERTIFICATIONS = [
  'CompTIA Security+',
  'CompTIA CySA+',
  'Cisco CCNA',
  'Google Cybersecurity Certificate',
  'Google AI Essentials',
];

/** Section heading plus the hairline rule the print layout also uses. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-heading pb-2 mb-5 border-b border-border">
      {children}
    </h2>
  );
}

/** Title on the left, dates/location on the right; stacks on narrow screens. */
function EntryHead({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <div className="min-w-0">{left}</div>
      <div className="shrink-0 text-xs text-muted-foreground font-mono sm:text-right">{right}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2.5 space-y-1.5">
      {items.map(b => (
        <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span aria-hidden="true" className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Resume() {
  return (
    /* pt-24, not py-14: the navigation is fixed and 64px tall, so 56px of
       top padding put the name behind it, and the bar is transparent at the
       top of the page, so the two simply overlapped. */
    <div className="pb-14 pt-24 sm:pb-20 sm:pt-28">
      <Helmet>
        <title>Resume | Vijaysingh Puwar</title>
        <meta
          name="description"
          content="Resume of Vijaysingh Puwar, software, systems and security engineer in New York. Windows and Linux servers across AWS, Azure and on-premises, Active Directory access, and production software in Python, Go, Rust, C# and Java. M.S. Cybersecurity, Pace University. CompTIA Security+, CySA+, Cisco CCNA."
        />
        <link rel="canonical" href="https://vijaysinghpuwar.com/resume" />
      </Helmet>

      <article className="container max-w-3xl mx-auto px-4 sm:px-6">
        {/* ── Header ── */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Vijaysingh Puwar
          </h1>
          <p className="mt-1 text-base sm:text-lg text-primary font-medium">
            Software, Systems, and Security Engineer | M.S. Cybersecurity, Pace University
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>New York, NY</span>
            <span>929-400-2052</span>
            <ProtectedEmail variant="row" compactHint />
            <a
              href="https://github.com/VijaysinghPuwar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/vijaysinghpuwar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              LinkedIn
            </a>
          </div>

          <p className="mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {PROFILE}
          </p>

          <a
            href="/resume.pdf"
            download
            className="print:hidden mt-6 inline-flex items-center justify-center h-10 px-5 rounded-md text-sm font-medium gradient-btn"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download PDF
          </a>
        </header>

        {/* Section order follows the PDF: skills, experience, projects,
            education, certifications. */}

        {/* ── Technical Skills ── */}
        <section className="mb-10">
          <SectionHeading>Technical Skills</SectionHeading>
          <dl className="space-y-3">
            {SKILLS.map(s => (
              <div key={s.label} className="sm:flex sm:gap-4">
                <dt className="text-sm font-semibold text-foreground sm:w-56 sm:shrink-0">
                  {s.label}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{s.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Experience ── */}
        <section className="mb-10">
          <SectionHeading>Experience</SectionHeading>
          <div className="space-y-7">
            {EXPERIENCE.map(role => (
              <div key={`${role.org}-${role.title}`}>
                <EntryHead
                  left={
                    <>
                      <h3 className="text-base font-semibold text-foreground">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">{role.org}</p>
                    </>
                  }
                  right={
                    <>
                      <div>{role.period}</div>
                      <div>{role.location}</div>
                    </>
                  }
                />
                <Bullets items={role.bullets} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="mb-10">
          <SectionHeading>Projects</SectionHeading>
          <div className="space-y-7">
            {PROJECTS.map(p => (
              <div key={p.name}>
                {/* Name on the left, links on the right, as on the PDF's
                    title row; the links drop under the name on a phone. */}
                <EntryHead
                  left={<h3 className="text-base font-semibold text-foreground">{p.name}</h3>}
                  right={
                    <div className="flex flex-wrap gap-x-3 sm:justify-end">
                      {p.links.map(l => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline underline-offset-4 break-all"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  }
                />
                <Bullets items={p.bullets} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ── */}
        <section className="mb-10">
          <SectionHeading>Education</SectionHeading>
          <div className="space-y-5">
            {EDUCATION.map(e => (
              <EntryHead
                key={e.school}
                left={
                  <>
                    <h3 className="text-base font-semibold text-foreground">{e.school}</h3>
                    <p className="text-sm text-muted-foreground">{e.degree}</p>
                  </>
                }
                right={
                  <>
                    <div>{e.period}</div>
                    <div>{e.location}</div>
                  </>
                }
              />
            ))}
          </div>
        </section>

        {/* ── Certifications ── */}
        <section>
          <SectionHeading>Certifications</SectionHeading>
          <ul className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {CERTIFICATIONS.map((c, i) => (
              <li key={c}>
                <span className="font-semibold text-foreground">{c}</span>
                {i < CERTIFICATIONS.length - 1 && <span aria-hidden="true" className="ml-2">|</span>}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
