import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProtectedEmail } from '@/components/ProtectedEmail';

/**
 * Web resume.
 *
 * Content is transcribed from the canonical PDF at /resume.pdf (2026-08-22) and
 * must not drift from it — a recruiter who reads this page and then downloads
 * the PDF should find the same claims. Nothing here is inferred or generated.
 *
 * The previous version of this page was never routed, which is why it still
 * carried a 3.91 GPA, the wrong institution for the B.E., an "ISC2 Candidate"
 * line, and two retired metrics. All of that is gone.
 *
 * Deliberately not a PDF facsimile inside a card: one column, real type
 * hierarchy, hairline rules instead of borders, and it prints cleanly.
 */

const PROFILE =
  'Engineer working across two halves of the same stack: the network and systems infrastructure underneath, and the AI-powered applications running on top. Supports enterprise routing, switching, and zero-trust access for a transit operating agency, and separately designs, ships, and operates production platforms with paying users — multi-provider LLM pipelines, REST backends, and relational data layers, backed by 1,280+ automated tests.';

interface Role {
  org: string;
  title: string;
  period: string;
  location: string;
  bullets: string[];
}

const EXPERIENCE: Role[] = [
  {
    org: 'MTA Staten Island Railway (SIRTOA)',
    title: 'IT Emerging Talent Intern',
    period: 'June 2026 – Present',
    location: 'New York City',
    bullets: [
      'Configure Cisco Catalyst switching (VLANs, access and trunk ports) and support OSPF and BGP routing on production network devices.',
      'Administer zero-trust and identity access: Zscaler ZPA application groups, DUO multi-factor enrollment, Active Directory groups, and provisioning and revocation as staff join, move, and leave.',
      'Own incidents end to end in ServiceNow from triage through closure, maintain a daily System Verification Log, and deploy endpoint hardware at remote facilities.',
      'Designed a Power Automate and SharePoint intake application and root-caused a trigger-versus-Compose defect in testing; deployed a Python NTP clock-correction service for a Rail Control Center workstation.',
    ],
  },
  {
    org: 'R.S. Infotech',
    title: 'System Engineer',
    period: 'February 2023 – August 2024',
    location: 'Vadodara, India',
    bullets: [
      'Configured production firewall rules and supported IDS/IPS, reviewing traffic and system logs to remediate misconfigurations and suspicious activity.',
      'Hardened 150+ Windows and Linux production endpoints (baselines, patching, post-change validation) with Windows Server, Active Directory, and Group Policy administration.',
      'Built automation in Python, PowerShell, and Bash for log analysis, configuration-compliance checking, and inventory; investigated failed-authentication patterns with Splunk SPL.',
    ],
  },
];

interface ResumeProject {
  name: string;
  discipline: string;
  stack: string;
  href: string;
  label: string;
  bullets: string[];
}

const PROJECTS: ResumeProject[] = [
  {
    name: 'Recap Verse',
    discipline: 'AI engineering',
    stack: 'Python, FastAPI, multi-provider LLMs, MongoDB, Cloud Run',
    href: 'https://recapverse.com',
    label: 'recapverse.com',
    bullets: [
      'Operate a paying multi-tenant platform on a multi-provider LLM pipeline (Claude Opus and Sonnet, GPT, Gemini) with bring-your-own-key isolation and AES-GCM encrypted per-user credentials — a 19-router FastAPI backend on Google Cloud Run across 353 deployments, with 900+ tests run before every release.',
      'Architected the pipeline as vision observation, then a deterministic five-stage resolver, then narration with Chain-of-Density rolling summaries, then deterministic post-processing. The design judgment is which stages a model may own and which must not be probabilistic.',
      'Instrumented it for measurement: an evaluation harness, A/B feature flags pitting a pipeline stage against its predecessor, reservoir-sampled model observations for telemetry replay, and capture of human edits against AI output.',
    ],
  },
  {
    name: 'Web Audio TV',
    discipline: 'Full stack',
    stack: 'TypeScript, React, PostgreSQL, PL/pgSQL, Deno',
    href: 'https://webaudiotv.com',
    label: 'webaudiotv.com',
    bullets: [
      'Own the data layer behind a live platform serving 843 users: 40+ tables, 52 SQL functions, 11 triggers, 93 versioned migrations, and 190+ row-level access policies across 24 edge functions.',
      'Built an append-only rewards ledger enforced by database trigger, Stripe and PayPal billing with webhook verification and scheduled reconciliation, and an abuse-detection console with named heuristics and behavioral baselining. 389 tests across 39 files.',
    ],
  },
  {
    name: 'Networking & Security Labs',
    discipline: 'Infrastructure',
    stack: 'Cisco, Linux, Nmap NSE',
    href: 'https://github.com/VijaysinghPuwar',
    label: 'github.com/VijaysinghPuwar',
    bullets: [
      'Dual-ISP assessment and remediation: diagnosed a split-brain network with overlapping RFC1918 subnets via multi-vantage-point discovery, remediated it, and documented the result with topology diagrams and a written report.',
      'Rapid-PVST campus lab (per-VLAN root load balancing, PortFast, BPDU Guard, Root Guard), iptables hardening with default-deny and brute-force rate limiting under CI, and a custom Nmap NSE script checking HSTS, CSP, and X-Frame-Options.',
    ],
  },
];

const EDUCATION = [
  {
    school: 'Pace University — Seidenberg School of Computer Science and Information Systems',
    location: 'New York, NY',
    degree: 'M.S. Cybersecurity, GPA 3.92 / 4.0',
    detail: 'Network Security & Defense, Ethical Hacking, Algorithms, Data Science',
    period: 'December 2026',
  },
  {
    school: 'G H Patel College of Engineering and Technology',
    location: 'Anand, India',
    degree: 'B.E. Mechanical Engineering',
    detail: null,
    period: 'January 2024',
  },
];

const SKILLS: { label: string; items: string }[] = [
  {
    label: 'Certifications',
    items: 'Cisco CCNA, CompTIA Security+, CompTIA CySA+, Google AI Essentials; Cisco CCNP Enterprise (in progress); TryHackMe — top 7% globally, 69 rooms',
  },
  {
    label: 'Networking',
    items: 'Routing and switching, OSPF, BGP, VLANs and trunking, Rapid-PVST, TCP/IP, DNS, NTP, HTTP/TLS, subnetting, Cisco IOS, firewalls, IDS/IPS, VPN, zero-trust access',
  },
  {
    label: 'AI Engineering',
    items: 'Multi-provider LLM integration (Anthropic, OpenAI, Google), prompt design, deterministic stages around model output, evaluation harnesses, A/B feature flags, telemetry sampling',
  },
  {
    label: 'Programming',
    items: 'Python, TypeScript, JavaScript, SQL, PL/pgSQL, PowerShell, Bash, Lua',
  },
  {
    label: 'Software Engineering',
    items: 'FastAPI, REST API design, Next.js, React, Pydantic and Zod validation, PostgreSQL, MongoDB, Redis job queues, Docker, Cloud Run, Vercel, AWS, GitHub Actions CI, Windows Server, Active Directory, Linux, ServiceNow',
  },
  {
    label: 'Security',
    items: 'Authorization design, least privilege, secure architecture review, input validation, SSRF defense, secrets management, Nmap NSE',
  },
];

/** Section heading plus the hairline rule the print layout also uses. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary font-mono pb-2 mb-5 border-b border-border/50">
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
    <div className="py-14 sm:py-20">
      <Helmet>
        <title>Resume | Vijaysingh Puwar</title>
        <meta
          name="description"
          content="Resume of Vijaysingh Puwar — cybersecurity and infrastructure engineer in New York. Enterprise networking at the MTA, production AI and full-stack platforms, M.S. Cybersecurity at Pace University."
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
            Cybersecurity Engineer — networks, systems, and the software on top
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span>New York, NY</span>
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

        {/* ── Experience ── */}
        <section className="mb-10">
          <SectionHeading>Experience</SectionHeading>
          <div className="space-y-7">
            {EXPERIENCE.map(role => (
              <div key={role.org}>
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
                <EntryHead
                  left={
                    <>
                      <h3 className="text-base font-semibold text-foreground">
                        {p.name}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {p.discipline}
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">{p.stack}</p>
                    </>
                  }
                  right={
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {p.label}
                    </a>
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
                    <h3 className="text-base font-semibold text-foreground">{e.degree}</h3>
                    <p className="text-sm text-muted-foreground">{e.school}</p>
                    {e.detail && <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>}
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

        {/* ── Skills ── */}
        <section>
          <SectionHeading>Skills &amp; Certifications</SectionHeading>
          <dl className="space-y-3">
            {SKILLS.map(s => (
              <div key={s.label} className="sm:flex sm:gap-4">
                <dt className="text-sm font-semibold text-foreground sm:w-44 sm:shrink-0">
                  {s.label}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{s.items}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </div>
  );
}
