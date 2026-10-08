import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ProtectedEmail } from '@/components/ProtectedEmail';

/**
 * Web resume.
 *
 * Content is transcribed from the canonical PDF at /resume.pdf (2026-10-08) and
 * must not drift from it: a recruiter who reads this page and then downloads
 * the PDF should find the same claims. Nothing here is inferred or generated.
 *
 * The phone number is public by decision; the email stays behind sign-in via
 * ProtectedEmail, as everywhere else on the site.
 */

const PROFILE =
  'Cybersecurity engineer with three years in systems and network operations. At the MTA, handles access requests and incidents on a 24/7 rail network. Outside work, builds and runs two production web platforms and fixes their security issues. CompTIA Security+, CompTIA CySA+, and Cisco CCNA certified.';

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
    period: 'Jun 2026 – Present',
    location: 'New York, NY',
    bullets: [
      'Review Active Directory, DUO MFA, and Zscaler ZPA access requests with the security team against policy.',
      'Handle incidents in ServiceNow and escalate to senior staff or vendors such as Dell, HP, and Solari.',
      'Inventoried every device on the railway network and traced each one to its switch port.',
      'Troubleshoot Cisco Catalyst switches and OSPF and BGP routing at sites across the railway.',
      'Built the SIR IT request intake system in Power Automate and SharePoint and wrote its runbook.',
      'Wrote and deployed a Python service that corrects clock drift over NTP on a Rail Control Center workstation.',
    ],
  },
  {
    org: 'R.S. Infotech',
    title: 'System Engineer',
    period: 'Feb 2023 – Mar 2026',
    location: 'Vadodara, India',
    bullets: [
      'Ran 150+ Windows and Linux systems on premises and on AWS and Azure, including patching and scheduled changes.',
      'Managed Active Directory and Group Policy: MFA enrollment, privileged group reviews, onboarding, and offboarding.',
      'Investigated incidents in Splunk and tuned IDS/IPS and firewall rules to cut false positives.',
      'Triaged SonarQube, OWASP ZAP, Burp Suite, and Nessus findings and added security checks to GitLab CI.',
      'Wrote Python, PowerShell, and Bash scripts for compliance checks, log review, and inventory.',
      'Tested backup and disaster recovery, and prepared evidence for audits and client security questionnaires.',
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
    name: 'Web Audio TV',
    descriptor: 'Audiobook streaming platform, about 1,000 users',
    stack: 'TypeScript, React, PostgreSQL, Supabase, Cloudflare Workers',
    href: 'https://webaudiotv.com',
    label: 'webaudiotv.com',
    bullets: [
      'Found and fixed three production security flaws: an email queue the public API key could call, a storage bucket anyone could download from, and a leaderboard farming exploit.',
      'Found the farming account with SQL over raw listening events (credited 16 to 21 hours a day) and added daily caps.',
      'Moved audio behind a Cloudflare Worker that serves a file only with a valid signed ticket.',
      'Verify every database role’s permissions against the real migrations with a 48-check access matrix.',
    ],
  },
  {
    name: 'Recap Verse',
    descriptor: 'AI video SaaS with paying subscribers',
    stack: 'Python, FastAPI, Next.js, MongoDB, Redis, Google Cloud Run',
    href: 'https://recapverse.com',
    label: 'recapverse.com',
    bullets: [
      'Built and run it alone: 398 deployments and 2,019 automated tests.',
      'Encrypt stored user API keys with AES-GCM and check resource ownership on every route.',
      'Remediated a leaked API key and added gitleaks secret scanning to CI.',
    ],
  },
  {
    name: 'AWS Cloud Security Lab',
    stack: 'Terraform, AWS EC2, VPC, KMS, Systems Manager, Checkov',
    href: 'https://github.com/VijaysinghPuwar/Configuring-Cloud-Security-in-Amazon-Web-Services',
    label: 'github.com/VijaysinghPuwar/Configuring-Cloud-Security-in-Amazon-Web-Services',
    bullets: [
      'Audited an earlier console build: SSH open to the internet, a NACL deny rule that never matched, and a dead CPU alarm.',
      'Rebuilt it in Terraform with no inbound SSH, IMDSv2 required, and KMS-encrypted VPC flow logs.',
      'Gated every push on TFLint, Checkov (121 passed, 0 failed), and 10 plan-time tests.',
    ],
  },
  {
    name: 'TrustKart',
    descriptor: 'Online store',
    stack: 'Java 21, Spring Boot, Spring Security, PostgreSQL, Redis, React',
    href: 'https://github.com/VijaysinghPuwar/TrustKart',
    label: 'github.com/VijaysinghPuwar/TrustKart',
    bullets: [
      'Made checkout a single transaction that cannot duplicate orders, oversell, or deadlock under 100 concurrent shoppers.',
      'Secured accounts with Argon2id hashing, rotating refresh tokens, CSRF protection, and Redis rate limits.',
    ],
  },
  {
    name: 'Dual ISP Network Assessment',
    stack: 'Nmap, Wireshark, PowerShell, Python',
    href: 'https://github.com/VijaysinghPuwar/Dual-ISP-Network-Assessment-and-Subnet-Remediation',
    label: 'github.com/VijaysinghPuwar/Dual-ISP-Network-Assessment-and-Subnet-Remediation',
    bullets: [
      'Traced conflicting device inventories to two ISP routers on the same subnet; one gateway IP answered from two MACs.',
      'Moved one LAN to its own subnet and confirmed one gateway MAC, one DHCP server, and no duplicate addresses.',
    ],
  },
  {
    name: 'x86-64 Binary Hardening Lab',
    stack: 'NASM, ELF, gdb, readelf, GitHub Actions',
    href: 'https://github.com/VijaysinghPuwar/x86-64-assembly-intro-lab',
    label: 'github.com/VijaysinghPuwar/x86-64-assembly-intro-lab',
    bullets: [
      'Found an executable stack and a stack alignment bug in working programs, then rebuilt them with NX, PIE, and full RELRO.',
      'Added a CI check that fails any binary missing those protections, tested against deliberately broken binaries.',
    ],
  },
  {
    name: 'Hardened Static Page',
    stack: 'Content Security Policy, security headers, gitleaks, GitHub Actions',
    href: 'https://github.com/VijaysinghPuwar/hardened-static-page',
    label: 'github.com/VijaysinghPuwar/hardened-static-page',
    bullets: [
      'Set a strict CSP and nine security headers, and wrote a CI test that injects an inline script and fails if it runs.',
    ],
  },
  {
    name: 'spoonstill',
    descriptor: 'Open source video renderer',
    stack: 'Rust, GitHub Actions, macOS and Windows',
    href: 'https://github.com/VijaysinghPuwar/spoonstill',
    label: 'github.com/VijaysinghPuwar/spoonstill',
    bullets: [
      'Shipped 21 releases; CI runs 776 tests and cargo audit, and the installers verify SHA-256 before installing.',
    ],
  },
];

const EDUCATION = [
  {
    school: 'Pace University, Seidenberg School of CSIS',
    degree: 'M.S. Cybersecurity | GPA 3.92',
    detail: 'Relevant coursework: Network Security and Defense, Ethical Hacking and Penetration Testing, Cyber Intelligence Analysis',
    period: 'Jan 2025 – Present',
  },
  {
    school: 'G H Patel College of Engineering and Technology',
    degree: 'B.E. Mechanical Engineering',
    detail: null,
    period: 'May 2023',
  },
];

const SKILLS: { label: string; items: string }[] = [
  { label: 'Security', items: 'Splunk, IDS/IPS, firewalls, Burp Suite, OWASP ZAP, Nessus, SonarQube, Checkov, gitleaks, Wireshark, Nmap' },
  { label: 'Identity', items: 'Active Directory, Group Policy, DUO MFA, Zscaler ZPA' },
  { label: 'Cloud and Systems', items: 'AWS, Azure, Google Cloud Run, Cloudflare, Terraform, Ansible, Docker, Linux, Windows Server' },
  { label: 'Networking', items: 'TCP/IP, DNS, DHCP, VLANs, OSPF, BGP, VPN, Cisco Catalyst, Cisco IOS' },
  { label: 'Languages', items: 'Python, Java, TypeScript, SQL, PowerShell, Bash, C#, Rust, R' },
  { label: 'Databases', items: 'PostgreSQL, MongoDB, Redis' },
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
          content="Resume of Vijaysingh Puwar, cybersecurity engineer in New York. Access and incident work on the MTA rail network, three years in systems and network operations, and two production web platforms. CompTIA Security+, CySA+, Cisco CCNA."
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
            Cybersecurity Engineer: networks, systems, and the software on top
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

        {/* ── Skills ── */}
        <section>
          <SectionHeading>Skills</SectionHeading>
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
