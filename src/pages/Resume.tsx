import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProtectedEmail } from '@/components/ProtectedEmail';

/**
 * Web resume.
 *
 * Content is transcribed from the canonical PDF at /resume.pdf (2026-10-15) and
 * must not drift from it: a recruiter who reads this page and then downloads
 * the PDF should find the same claims. Nothing here is inferred or generated.
 *
 * The phone number is public by decision; the email stays behind sign-in via
 * ProtectedEmail, as everywhere else on the site.
 */

const PROFILE =
  'Cybersecurity engineer with IT infrastructure experience at the MTA and R.S. Infotech across identity and access, Cisco networking and Windows and Linux operations. Builds and runs production web and AI applications in Python, TypeScript, Java and Go. CompTIA Security+, CySA+ and Cisco CCNA.';

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
    title: 'Emerging Talent Intern',
    period: 'Jun 2026 – Aug 2026',
    location: 'New York, NY',
    bullets: [
      'Resolve incidents and service requests in ServiceNow on a 24/7 rail operation, isolating faults across application, network path, access policy and host, and escalating to senior staff or vendors (Dell, HP, Solari).',
      'Reviewed Active Directory, DUO MFA and Zscaler ZPA access requests with the security team against policy.',
      'Troubleshot Cisco Catalyst switches, VLANs, trunk ports and OSPF and BGP routing at sites across the railway; inventoried every network device and traced each one to its switch port.',
      'Built the SIR IT request intake system in Microsoft Forms, Power Automate and SharePoint, caught a defect silently writing incorrect values before release, and wrote the operator runbook.',
      'Wrote and deployed a Python NTP clock-correction service on a Rail Control Center workstation with dry-run mode, elevation check, rotating logs and distinct exit codes.',
    ],
  },
  {
    org: 'R.S. Infotech',
    title: 'System Engineer',
    period: 'Feb 2023 – Aug 2024',
    location: 'Vadodara, India',
    bullets: [
      'Ran 150+ Windows and Linux systems on premises and on AWS and Azure, including patching and scheduled changes.',
      'Managed Active Directory and Group Policy: MFA enrollment, privileged group reviews, onboarding and offboarding.',
      'Wrote Splunk SPL queries for failed authentication and suspicious activity, and tuned IDS/IPS and firewall rules to cut false positives.',
      'Triaged SonarQube, OWASP ZAP, Burp Suite and Nessus findings and added security checks to GitLab CI.',
      'Wrote Python, PowerShell and Bash scripts for compliance checks, log review and inventory.',
    ],
  },
];

interface ResumeProject {
  name: string;
  descriptor?: string;
  stack: string;
  href: string;
  label: string;
  bullets: string[];
}

const PROJECTS: ResumeProject[] = [
  {
    name: 'Recap Verse',
    descriptor: 'AI video SaaS with paying subscribers',
    stack: 'Python, FastAPI, Next.js, MongoDB, Redis, Google Cloud Run, Anthropic, OpenAI and Gemini APIs',
    href: 'https://recapverse.com',
    label: 'recapverse.com',
    bullets: [
      'Built and run it alone: a multi-stage pipeline that combines LLM calls with deterministic stages, covered by 2,019 automated tests across five CI jobs.',
      'Provider-abstracted LLM layer across Anthropic, OpenAI and Gemini with schema-validated JSON output and quality-gated retries.',
      'Encrypt per-user API keys with AES-GCM, enforce resource ownership on every route, and gate CI on gitleaks secret scanning.',
      'Stripe and PayPal subscriptions through deduplicated webhooks, so a redelivered event is never applied twice.',
    ],
  },
  {
    name: 'Web Audio TV',
    descriptor: 'Audiobook streaming platform, about 1,000 users',
    stack: 'TypeScript, React, PostgreSQL with row level security (Supabase), Cloudflare Workers and R2',
    href: 'https://webaudiotv.com',
    label: 'webaudiotv.com',
    bullets: [
      'Found and fixed three production security flaws: an email queue the public API key could call, a publicly downloadable storage bucket, and a leaderboard farming exploit traced with SQL over raw listening events.',
      'Serve audio only through a Cloudflare Worker that checks a short-lived signed ticket bound to caller, resource and expiry.',
      'Verify every database role’s permissions against the real migrations with a 48-check access matrix; 1,059 automated tests.',
    ],
  },
  {
    name: 'BreachScope',
    descriptor: 'Live threat-intelligence map',
    stack: 'Go (chi, pgx), PostgreSQL, React, TypeScript, MapLibre GL, Vercel',
    href: 'https://github.com/VijaysinghPuwar/BreachScope',
    label: 'github.com/VijaysinghPuwar/BreachScope',
    bullets: [
      'Ingests six public feeds (ThreatFox, URLhaus, Feodo Tracker, SANS DShield, CISA KEV, Have I Been Pwned) and records provenance and location precision on every record.',
      'Resumable SSE stream with Last-Event-ID; load tested at 20,000 requests and 200 concurrent with zero errors and zero data races.',
    ],
  },
  {
    name: 'TrustKart',
    descriptor: 'Full-stack online store',
    stack: 'Java 21, Spring Boot, PostgreSQL, Redis, React',
    href: 'https://github.com/VijaysinghPuwar/TrustKart',
    label: 'github.com/VijaysinghPuwar/TrustKart',
    bullets: [
      'Checkout runs as one database transaction, so 100 concurrent shoppers cannot duplicate orders, oversell or deadlock; idempotency keys guarantee exactly-once orders.',
    ],
  },
  {
    name: 'Dual-ISP Network Assessment',
    stack: 'Nmap, Wireshark, PowerShell, Bash, Python',
    href: 'https://github.com/VijaysinghPuwar/Dual-ISP-Network-Assessment-and-Subnet-Remediation',
    label: 'github.com/VijaysinghPuwar/Dual-ISP-Network-Assessment-and-Subnet-Remediation',
    bullets: [
      'Traced conflicting device inventories to two ISP routers on the same 192.168.0.0/24 subnet (one gateway IP answering from two MACs), moved one LAN to 192.168.20.0/24 and confirmed one gateway MAC, one DHCP server and no duplicate addresses.',
    ],
  },
];

const EDUCATION = [
  {
    school: 'Pace University, Seidenberg School of CSIS',
    degree: 'M.S. Cybersecurity | GPA 3.92',
    detail: 'Coursework: Ethical Hacking, Network Security and Defense, Automating Information Security with Python and PowerShell, Cyber Intelligence Analysis, Algorithms, Object-Oriented Programming',
    period: 'Jan 2025 – Dec 2026 (expected)',
  },
  {
    school: 'G H Patel College of Engineering and Technology',
    degree: 'B.E. Mechanical Engineering',
    detail: null,
    period: 'Aug 2023',
  },
];

const SKILLS: { label: string; items: string }[] = [
  { label: 'Security and Identity', items: 'Splunk (SPL), IDS/IPS, firewalls, Burp Suite, OWASP ZAP, Nessus, Active Directory, Group Policy, DUO MFA, Zscaler ZPA' },
  { label: 'Networking and Systems', items: 'TCP/IP, DNS, DHCP, VLANs, OSPF, BGP, Cisco Catalyst, Linux, Windows Server, ServiceNow' },
  { label: 'Cloud and DevOps', items: 'AWS, Azure, Google Cloud Run, Cloudflare, Terraform, Docker, GitHub Actions, GitLab CI' },
  { label: 'Languages and Frameworks', items: 'Python, TypeScript, Java, Go, C#, Rust, SQL, PowerShell, Bash, FastAPI, Spring Boot, React, Next.js' },
  { label: 'AI', items: 'Anthropic, OpenAI and Gemini APIs, structured-output prompting, schema validation, evaluation harnesses' },
  { label: 'Databases', items: 'PostgreSQL, MongoDB, Redis' },
  { label: 'Activities', items: 'Pace University Cybersecurity Club; STEM outreach volunteer mentoring undergraduate and high school students in cybersecurity; TryHackMe top 8%, 217 active days in 2025' },
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
          content="Resume of Vijaysingh Puwar, cybersecurity engineer in New York. Identity, access and incident work on the MTA rail network, systems and network operations at R.S. Infotech, and production web and AI applications. CompTIA Security+, CySA+, Cisco CCNA."
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
            Cybersecurity Engineer: IT Infrastructure, Networking and Secure Software
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
                <h3 className="text-base font-semibold text-foreground">
                  {p.name}
                  {p.descriptor && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      | {p.descriptor}
                    </span>
                  )}
                </h3>
                {/* The GitHub URLs are too long to share a row with anything:
                    they squeezed the stack into a narrow column. Each gets its
                    own line under the stack. */}
                <p className="text-xs text-muted-foreground font-mono">{p.stack}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline underline-offset-4 break-all"
                >
                  {p.label}
                </a>
                <Bullets items={p.bullets} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Education and Certifications ── */}
        <section className="mb-10">
          <SectionHeading>Education and Certifications</SectionHeading>
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
                right={<div>{e.period}</div>}
              />
            ))}
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Certifications:</span>{' '}
              CompTIA Security+, CompTIA CySA+, Cisco CCNA, Google AI Essentials
            </p>
          </div>
        </section>

        {/* ── Skills and Activities ── */}
        <section>
          <SectionHeading>Skills and Activities</SectionHeading>
          <dl className="space-y-3">
            {SKILLS.map(s => (
              <div key={s.label} className="sm:flex sm:gap-4">
                <dt className="text-sm font-semibold text-foreground sm:w-48 sm:shrink-0">
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
