import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProtectedEmail } from '@/components/ProtectedEmail';

/**
 * Web resume.
 *
 * Content is transcribed from the canonical PDF at /resume.pdf and must not
 * drift from it: a recruiter who reads this page and then downloads the PDF
 * should find the same claims, in the same order. Nothing here is inferred or
 * generated. Since 2026-11-16 that PDF is the LaTeX resume supplied as-is;
 * scripts/resume/resume.html no longer produces it.
 *
 * The phone number is public by decision; the email stays behind sign-in via
 * ProtectedEmail, as everywhere else on the site.
 */

const PROFILE =
  'Software and Systems Engineer with 4.5+ years of non-internship experience building backend automation, data pipelines, REST API integrations, and cloud infrastructure across AWS and Azure, alongside production applications in Java, C# (.NET), Python, Go, and Rust. Designed and shipped multi-tiered web services, multi-threaded workload engines, media streaming pipelines, and GPU neural inference software backed by 3,000+ automated tests and 500+ CI/CD deployments. Finishing an M.S. in Cybersecurity at Pace University (Dec 2026, 3.92 GPA).';

const SKILLS: { label: string; items: string }[] = [
  { label: 'Languages', items: 'Java 21, C# (.NET 10), Python, Go, Rust, TypeScript, SQL, Bash, PowerShell' },
  { label: 'Architecture & Backend', items: 'Distributed Systems, Multi-Tiered Architecture, Multi-Threaded Concurrency, Spring Boot, FastAPI, REST APIs, React, Tokio' },
  { label: 'Databases, Caching & Media', items: 'PostgreSQL (RLS), MongoDB, Redis, CDN & Media Streaming, FFmpeg' },
  { label: 'AWS, Cloud & CI/CD', items: 'AWS (EC2, S3, VPC, CloudWatch), Microsoft Azure, Docker, Terraform, Linux, GitHub Actions, GitLab CI' },
  { label: 'AI Inference, Testing & Ops', items: 'LLM & ONNX Runtime, NVIDIA CUDA & cuDNN, JUnit 5, Testcontainers, PyTest, Playwright, Splunk' },
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
      'Built a Python NTP clock-correction service for a 24/7 Rail Control Center workstation with dry-run mode, privilege checks, and rotating logs.',
      'Built an automated IT request intake system on Microsoft Forms, Power Automate, and SharePoint (form, workflow, and data layers), caught a defect writing wrong values before release, and wrote the operator runbook.',
      'Debugged live incidents in ServiceNow for a 24/7 rail operation across the application, network path, access policy, and host, and ran daily System Verification Logs that caught degrading components before outages.',
    ],
  },
  {
    org: 'R. S. Infotech',
    title: 'System Engineer II',
    period: 'Feb 2023 – Aug 2024',
    location: 'Vadodara, India (Hybrid)',
    bullets: [
      'Built and maintained SQL data pipelines with reconciliation checks, REST API integrations, and Python and PowerShell automation tools across 150+ Linux and Windows hosts on AWS, Azure, and on-premises.',
      'Added automated security and build checks to GitLab CI pipelines, triaging and resolving application and infrastructure findings from SonarQube, OWASP ZAP, Burp Suite, and Nessus before release.',
      'Scoped technical projects and KPIs with operations teams, analyzed large log and uptime datasets in Splunk to isolate production bottlenecks, and tuned IDS/IPS and firewall rules to cut false positives.',
    ],
  },
  {
    org: 'R. S. Infotech',
    title: 'System Engineer I',
    period: 'Feb 2020 – Jan 2023',
    location: 'Vadodara, India (Hybrid)',
    bullets: [
      'Developed reusable Python, PowerShell, Bash, and SQL scripts for log parsing, system inventory, and operational reporting, and wrote custom Splunk SPL queries to detect failed logins and suspicious activity.',
      'Maintained Linux and Windows build baselines, administered DNS and DHCP, handled OS imaging and scheduled production changes, and tested backup and disaster recovery.',
    ],
  },
];

interface ResumeProject {
  name: string;
  /** The PDF gives either a stack or a date range on the title row. */
  stack?: string;
  period?: string;
  /** Not in the PDF, which carries no links; taken from src/data/projects.json. */
  links: { href: string; label: string }[];
  bullets: string[];
}

const PROJECTS: ResumeProject[] = [
  {
    name: 'TrustKart – Multi-Tiered Java Store & Transactional Checkout API',
    stack: 'Java 21, Spring Boot 4, PostgreSQL 17, Redis, Docker, React',
    links: [{ href: 'https://github.com/VijaysinghPuwar/TrustKart', label: 'github.com/VijaysinghPuwar/TrustKart' }],
    bullets: [
      'Built a modular Spring Boot 4 and React 19 store (101 deployments on Vercel CDN) with single-transaction ACID checkout, one-time order keys, fixed-order stock locking to prevent deadlocks, Argon2id auth, and Redis rate limiting.',
      'Verified zero overselling and exact wallet ledgers across 100 simultaneous checkouts using Python stress tests, 120+ JUnit 5 and Testcontainers integration tests, and Playwright E2E suites in GitHub Actions.',
    ],
  },
  {
    name: 'TOC Extractor – Multi-Threaded C# .NET Workload Engine',
    stack: 'C#, .NET 10, Avalonia, Playwright, Python',
    links: [{ href: 'https://github.com/VijaysinghPuwar/TOC_Extractor', label: 'github.com/VijaysinghPuwar/TOC_Extractor' }],
    bullets: [
      'Built a multi-threaded C# and .NET 10 desktop and CLI engine on macOS, Windows, and Linux with lock-protected shared progress state, per-site rate limiters, self-healing browser workers, and shared C#/Python conformance tests.',
      'Profiled and tuned memory-aware worker scaling across 40 concurrent jobs (2,000 chapters), cutting average CPU usage from 272% to 142% and peak memory from 8.2 GB to 7.1 GB without slowing runtime.',
    ],
  },
  {
    name: 'Recap Verse & Web Audio TV – Multi-Tiered AI & Streaming Platforms',
    period: 'Sep 2024 – Present',
    links: [
      { href: 'https://recapverse.com', label: 'recapverse.com' },
      { href: 'https://webaudiotv.com', label: 'webaudiotv.com' },
    ],
    bullets: [
      'Designed, built, and ran Recap Verse, an AI video and multi-provider LLM platform with paying subscribers in Python, FastAPI, and MongoDB across 17 routers, 28 services, 398 deployments, and 2,019 automated tests.',
      'Built security controls into the app: AES-GCM encrypted secrets, per-route authorization, PostgreSQL row-level security, short-lived signed media URLs, CI secret scanning, and deduplicated Stripe and PayPal webhooks.',
      'Operated streaming app Web Audio TV (1,000+ users, 1,671 tracks), moving media delivery off the main host to cut hosting costs by 90% and drop start latency to 0.35s, and tuned an 8.05s PostgreSQL timeout down to 0.49s.',
    ],
  },
  {
    name: 'SetupTTS – GPU Neural Inference & Streaming Audio Engine',
    stack: 'Python 3.12, NVIDIA CUDA 13, cuDNN 9, ONNX Runtime',
    links: [{ href: 'https://github.com/VijaysinghPuwar/setuptts', label: 'github.com/VijaysinghPuwar/setuptts' }],
    bullets: [
      'Built a neural speech inference engine (935 passing tests) running Kokoro-82M ONNX models on SHA-256-pinned CUDA 13 and cuDNN 9, rendering 29 hours of audio in under 4 hours at flat 2.4 GB RAM.',
      'Ran GPU speed checks in a child process with mid-job CPU fallback on driver faults, used full-precision weights to fix silent NaN outputs, and streamed sections in parallel with atomic fsync writes to cut batch runtime from 128s to 18s.',
    ],
  },
  {
    name: 'R2Dock, BreachScope & AWS Infrastructure Hardening',
    stack: 'Rust, Tokio, Go, PostgreSQL, Terraform, AWS',
    links: [
      { href: 'https://github.com/VijaysinghPuwar/R2Dock', label: 'github.com/VijaysinghPuwar/R2Dock' },
      { href: 'https://github.com/VijaysinghPuwar/BreachScope', label: 'github.com/VijaysinghPuwar/BreachScope' },
    ],
    bullets: [
      'Built R2Dock, a 6-crate async Rust/Tokio S3 client with parallel checksummed multipart uploads, FFmpeg AV1 compression, and crash-safe journals; load-tested BreachScope (Go/PostgreSQL) at 20,000 requests with zero errors; and hardened AWS EC2 in Terraform (Security Groups, NACLs, VPC Flow Logs, IMDSv2, CloudWatch).',
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
          content="Resume of Vijaysingh Puwar, software and systems engineer in New York. Backend automation, data pipelines and cloud infrastructure at R. S. Infotech and the MTA, and production applications in Java, C#, Python, Go and Rust. M.S. Cybersecurity, Pace University. CompTIA Security+, CySA+, Cisco CCNA."
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
            Software and Systems Engineer | M.S. Cybersecurity, Pace University
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
                <EntryHead
                  left={<h3 className="text-base font-semibold text-foreground">{p.name}</h3>}
                  right={p.period ? <div>{p.period}</div> : null}
                />
                {p.stack && <p className="mt-0.5 text-xs text-muted-foreground font-mono">{p.stack}</p>}
                {/* Links get their own lines: the GitHub URLs are too long to
                    share a row with the stack without squeezing it. */}
                <div className="flex flex-wrap gap-x-4">
                  {p.links.map(l => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-primary hover:underline underline-offset-4 break-all"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
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
