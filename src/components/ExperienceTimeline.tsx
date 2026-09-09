import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
  Experience and education as an alternating sequence.

  Entries hang off a single centre rule, one to a side, each behind its own
  disclosure. The mark on the rule is the site's own hexagon rather than a
  lucide glyph per entry type: a mortar board next to "M.S. Cybersecurity" and
  a briefcase next to "System Engineer" told a reader nothing the title had not
  already said, and a stock icon set is the first thing anyone points at when
  they call a page generated. One mark, used consistently, reads as a mark.

  The centre column collapses below 980px, the same width the nav and hero
  switch on. Cards move to a single left-aligned column with the rule and its
  marks running down the left edge, because two columns of alternating cards on
  a phone is one column of cards with half the width wasted.
*/

const highlightMetric = (text: string) => (
  <span className="font-semibold text-primary">{text}</span>
);

/** Reference chips shared by the coursework and skill-group disclosures. */
function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span
          key={item}
          className="rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function DetailHeading({ children }: { children: ReactNode }) {
  return (
    <p className="meta-label mb-2 mt-4 first:mt-0">{children}</p>
  );
}

interface Row {
  id: string;
  /** Left column. `place` and `kind` are omitted rather than guessed. */
  dates: string;
  place?: string;
  kind?: string;
  /** Marks the row that is still running. */
  now?: boolean;
  title: string;
  org: string;
  bullets: ReactNode[];
  metaLabel?: string;
  meta?: string[];
  /** Reference depth, one disclosure per row. */
  detail?: ReactNode;
}

const rows: Row[] = [
  {
    id: 'mta-sirtoa',
    dates: 'JUN 2026 → NOW',
    place: 'New York, NY',
    kind: 'Internship',
    now: true,
    title: 'IT Infrastructure & Network Operations',
    org: 'Metropolitan Transportation Authority · Staten Island Railway (SIRTOA) · title of record: IT Emerging Talent Intern',
    bullets: [
      <>Configure Cisco Catalyst switching (VLANs, access and trunk ports) and support OSPF and BGP routing on production network devices.</>,
      <>Administer zero-trust and identity access: Zscaler ZPA application groups, DUO multi-factor enrollment, Active Directory groups, and provisioning and revocation as staff join, move, and leave.</>,
      <>Own incidents end to end in ServiceNow from triage through closure, maintain a daily System Verification Log, and deploy endpoint hardware at remote facilities.</>,
      <>Designed a Power Automate and SharePoint intake application and root-caused a trigger-versus-Compose defect in testing; deployed a Python NTP clock-correction service for a Rail Control Center workstation.</>,
    ],
    metaLabel: 'Working with',
    meta: ['Active Directory', 'Microsoft 365', 'ServiceNow', 'Cisco / TCP-IP', 'Windows Server'],
    detail: (
      <div>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
          Supporting enterprise IT infrastructure, network operations, endpoint systems, and secure
          technology services for MTA Staten Island Railway, focusing on system reliability,
          troubleshooting, and operational efficiency.
        </p>
        {[
          { label: 'Networking', items: ['TCP/IP', 'LAN Troubleshooting', 'Enterprise Networks'] },
          { label: 'Systems', items: ['Windows Administration', 'Active Directory', 'Microsoft 365', 'Endpoint Management'] },
          { label: 'Security', items: ['Access Management', 'Endpoint Security', 'System Verification'] },
          { label: 'Tools', items: ['ServiceNow', 'ArcGIS', 'HxGN EAM'] },
        ].map(group => (
          <div key={group.label}>
            <DetailHeading>{group.label}</DetailHeading>
            <Chips items={group.items} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ms-cyber',
    dates: 'EXPECTED DEC 2026',
    place: 'New York, NY',
    kind: 'M.S.',
    title: 'M.S. Cybersecurity',
    org: 'Pace University · Seidenberg School of Computer Science and Information Systems',
    bullets: [
      <>
        GPA {highlightMetric('3.92')}, with {highlightMetric('36')} credits completed and{' '}
        {highlightMetric('3')} in progress.
      </>,
      <>Coursework in security automation, network defense, ethical hacking and secure software development.</>,
    ],
    metaLabel: 'Concentration',
    meta: ['Security automation', 'Network defense', 'Detection engineering'],
    detail: (
      <div>
        {/* Degree audit 2026-07-19: 30 required, 39 applied (36 completed plus
            the 3-credit capstone in progress). Stated as completed/in-progress
            because "39 credits applied" reads as 39 finished. */}
        <DetailHeading>Completed coursework</DetailHeading>
        <Chips
          items={[
            'Introduction to Cybersecurity',
            'Operating Systems Theory & Administration',
            'Information Security Management',
            'Network Security & Defense',
            'Ethical Hacking & Penetration Testing',
            'Automating InfoSec with Python & Shell',
            'Cyber Intelligence Analysis & Modeling',
            'Data Science I: Intro to Data',
            'Computational Statistics',
            'Algorithms & Computing Theory',
            'Business Data Communications',
            'Introduction to Coding',
          ]}
        />
        {/* Degree audit 2026-07-19: CYB 691 is the only course still IP.
            IS 680 completed Summer 2026. */}
        <DetailHeading>In progress</DetailHeading>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-primary/40 px-2.5 py-1 text-[12px] text-primary">
            Cybersecurity Capstone Project
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'rs-infotech',
    dates: 'FEB 2023 → AUG 2024',
    kind: 'Full-time',
    title: 'System Engineer',
    org: 'R.S. Infotech',
    /* Bullets rewritten on main (db181cb) while this redesign was in flight.
       Kept verbatim in substance, with the parenthetical set off by brackets
       rather than by the em dashes the rest of the site no longer uses. */
    bullets: [
      <>Automated recurring operational workflows across a {highlightMetric('150+')} Windows and Linux environment in Python, SQL, PowerShell and Bash (log processing, inventory, uptime monitoring, account lifecycle, configuration compliance, data reconciliation and reporting), replacing manual process with reusable, maintainable tooling rather than one-off scripts.</>,
      <>Delivered solutions end to end with stakeholders: identified the problem, investigated it, designed and built the solution, tested, deployed and documented the expected behaviour so other engineers could support it, maintained through Git-based development.</>,
      <>Root-caused defects across applications, system services, authentication, data and networking using Splunk, operating-system logs, event data and network evidence, then validated each fix; supported AWS and Microsoft Azure alongside on-premises infrastructure.</>,
    ],
    metaLabel: 'Working with',
    meta: ['Windows Server', 'Linux', 'Python / SQL', 'PowerShell / Bash', 'Splunk', 'AWS / Azure', 'Git'],
  },
  {
    id: 'be-mech',
    dates: 'COMPLETED JAN 2024',
    place: 'Anand, India',
    kind: 'B.E.',
    title: 'B.E. Mechanical Engineering',
    org: 'G H Patel College of Engineering and Technology',
    bullets: [
      <>CGPA {highlightMetric('7.11 / 10')}.</>,
      <>Engineering foundation in systems thinking, design, and problem solving. Later pivoted to cybersecurity.</>,
    ],
    detail: (
      <div>
        <DetailHeading>Selected coursework</DetailHeading>
        <Chips
          items={[
            'Programming for Problem Solving',
            'Operation Research',
            'Quality & Reliability Engineering',
            'Industry 4.0',
            'Computer Aided Design & Manufacturing',
            'Engineering Mathematics',
          ]}
        />
      </div>
    ),
  },
];

const certifications = [
  { name: 'CompTIA Security+', org: 'CompTIA', earned: true },
  { name: 'CompTIA CySA+', org: 'CompTIA', earned: true },
  { name: 'Cisco CCNA', org: 'Cisco', earned: true },
  { name: 'Google AI Essentials', org: 'Google', earned: true },
  { name: 'Cisco CCNP Enterprise', org: 'Cisco', earned: false },
];

/* ── One entry ── */
function TimelineEntry({ row, index }: { row: Row; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `${row.id}-panel`;
  /* Odd entries sit left of the rule, even entries right. Below the
     breakpoint every card takes the single content column instead. */
  const onLeft = index % 2 === 0;

  /* One card element, placed by grid column.

     It was briefly rendered twice, once for the narrow layout and once for the
     wide one, with CSS hiding the wrong copy. That put every role in the
     document twice: a screen reader read the whole timeline through, then read
     it again. Placement is a class, not a second copy. */
  const card = (
    <div
      className={cn(
        'col-start-2 row-start-1 pb-[26px]',
        onLeft
          ? 'wide:col-start-1 wide:text-right'
          : 'wide:col-start-3',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full rounded-[10px] border border-border bg-card px-5 py-[18px] text-left transition-colors [text-align:inherit] hover:border-border-strong"
      >
        <div className={cn('flex gap-3.5', onLeft && 'wide:flex-row-reverse')}>
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 shrink-0 text-[14px] text-muted-dim transition-transform',
              open && 'rotate-180',
            )}
          >
            ⌄
          </span>
          <div className="min-w-0 flex-1">
            <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', onLeft && 'wide:justify-end')}>
              <h3 className="text-[17px] font-semibold tracking-[-0.014em] text-foreground">
                {row.title}
              </h3>
              {row.now && (
                <span className="inline-flex items-center gap-[7px] font-mono text-[11px] tracking-[0.14em] text-primary">
                  CURRENT
                  <span className="h-3 w-1.5 animate-pulse bg-primary motion-reduce:animate-none" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="mt-1 text-[14px] leading-[1.5] text-muted-foreground">{row.org}</div>
            <div className="mt-2 font-mono text-[11.5px] tracking-[0.04em] text-muted-dim">
              {[row.dates, row.place, row.kind].filter(Boolean).join('  ·  ')}
            </div>
          </div>
        </div>

        {open && (
          <div id={panelId} className="mt-3.5 border-t border-border pt-3.5 text-left">
            <ul className="flex flex-col gap-2">
              {row.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-[1.55] text-muted-foreground">
                  <span className="shrink-0 text-primary" aria-hidden="true">·</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {row.meta && row.meta.length > 0 && (
              <div className="mt-4">
                <div className="meta-label">{row.metaLabel}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px] text-muted-foreground">
                  {row.meta.map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            )}

            {row.detail && <div className="mt-4">{row.detail}</div>}
          </div>
        )}
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-4 wide:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] wide:gap-x-0">
      {/* The rule and its mark. One column on a phone, the centre on desktop. */}
      <div className="col-start-1 row-start-1 flex flex-col items-center wide:col-start-2">
        <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true" className="mt-5 shrink-0">
          <path
            d="M10 1.2 L18.2 6 L18.2 16 L10 20.8 L1.8 16 L1.8 6 Z"
            fill="hsl(var(--background))"
            stroke={row.now ? 'hsl(var(--primary))' : 'hsl(var(--border-strong))'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="w-px flex-1 bg-border" aria-hidden="true" />
      </div>

      {card}
    </div>
  );
}

/*
  Certification card.

  It used to flip on hover to reveal the issuing body, an animation to hide a
  single word, on a card that had room for it. Now issuer and state are both on
  the face, and the outline colour separates earned from in-progress, so the
  status is readable without hovering five cards one at a time.

  These are also the site's only certification block. A scrolling marquee of the
  same five names used to run in the skills section below; it has been removed.
*/
function CertCard({ name, org, earned }: { name: string; org: string; earned: boolean }) {
  return (
    <div className="panel flex flex-col items-center gap-3 rounded-lg px-[18px] py-[22px] text-center">
      <svg width="26" height="29" viewBox="0 0 26 29" aria-hidden="true">
        <path
          d="M13 1.6 L23.8 7.8 L23.8 20.2 L13 26.4 L2.2 20.2 L2.2 7.8 Z"
          fill="none"
          stroke={earned ? 'hsl(var(--primary))' : 'hsl(var(--border-strong))'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-[14.5px] font-medium leading-[1.35] text-foreground">{name}</div>
      <div className="font-mono text-[10px] tracking-[0.1em] text-muted-dim">
        {org.toUpperCase()} · {earned ? 'CERTIFIED' : 'IN PROGRESS'}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function ExperienceTimeline() {
  return (
    <div className="mt-10">
      <div className="relative">
        {rows.map((row, i) => (
          <TimelineEntry key={row.id} row={row} index={i} />
        ))}
      </div>

      {/* Certifications */}
      <div className="mt-14">
        <p className="section-heading mb-6 text-center">Certifications</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 wide:grid-cols-5">
          {certifications.map(cert => (
            <CertCard key={cert.name} {...cert} />
          ))}
        </div>
      </div>
    </div>
  );
}
