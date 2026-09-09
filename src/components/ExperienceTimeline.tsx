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
          /* Lifted above its neighbours while it grows, since at 1.5x it
             crosses them, and grown with a transform so the rows of chips
             never reflow under the cursor. The accent comes from the mode
             token, so the same hover reads green in defensive mode and red in
             offensive without a second rule. */
          className="relative origin-left rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground transition-[transform,color,border-color] duration-300 ease-out hover:z-10 hover:scale-150 hover:border-primary hover:text-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
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
  /* Correctness before animation.

     Three attempts at animating this open failed in ways that left the panel
     shut: `0fr` to `1fr` resolved to zero in an auto-height grid, and a
     measured `max-height` reported zero at some widths even when set inline.
     A disclosure that sometimes refuses to open is a worse fault than one that
     opens without sliding, so the height is no longer animated at all: the
     content mounts when open and fades in. The chevron still turns, and
     nothing can clip a chip because nothing clips. */
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
              'mt-0.5 shrink-0 text-[14px] text-muted-dim transition-transform duration-500 ease-out motion-reduce:transition-none',
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
      </button>

      {open && (
        <div id={panelId} className="animate-disclose text-left">
          <div className="mt-3.5 border-t border-border px-5 pb-[18px] pt-3.5 wide:px-[38px]">
            <ul className="flex flex-col gap-2">
              {row.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-[1.55] text-muted-foreground">
                  {/* Box-drawing rather than a dot. The last item closes the
                      branch, so four lines read as one group instead of four
                      unrelated sentences, and it speaks the same monospace
                      language as the terminal at the top of the page. */}
                  <span
                    className="mt-[3px] shrink-0 font-mono text-[13px] leading-none text-muted-dim"
                    aria-hidden="true"
                  >
                    {i === row.bullets.length - 1 ? '└─' : '├─'}
                  </span>
                  {/* Justified, with hyphenation on. Justification without it
                      opens rivers of white space in a measure this narrow,
                      because the browser can only stretch the spaces it has. */}
                  <span className="hyphens-auto text-justify">{bullet}</span>
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
        </div>
      )}
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
  Certifications as a ruled index.

  Two earlier attempts failed for opposite reasons. Five equal cards in a grid
  gave the chrome as much weight as the credential. Replacing them with names
  at 42px was worse: it left two thirds of the measure empty on the right, said
  nothing a reader did not already know from the name, and mistook size for
  design.

  This is the row the site already uses everywhere else, in the hero facts, in
  the tooling column of the timeline, in the project index. Name on the left,
  issuer and state on the right, a hairline between. It fills the measure
  because it has something to put at both ends of it.

  The hover is the one from the design's timeline artboard: a 2px accent rule
  wipes down the left edge from `scaleY(0)`, the surface lifts to `card`, and
  the name moves 2px right into the space the rule just made. It reads as the
  row acknowledging the cursor rather than as decoration, and it is the same
  gesture on all five.
*/
function CertRow({ name, org, earned }: { name: string; org: string; earned: boolean }) {
  return (
    <li className="group relative hover:z-10">
      {/* Scaled rather than sized, so the wipe costs no layout. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-primary transition-transform duration-[220ms] ease-[cubic-bezier(.2,.8,.3,1)] group-hover:scale-y-100 motion-reduce:transition-none"
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-md px-0 py-[18px] transition-colors duration-200 group-hover:bg-card wide:px-[18px]">
        <span className="flex min-w-0 items-baseline gap-3">
          {/* The gutter is present on every row, so the names keep one left
              edge whether or not there is a mark to put in front of them. */}
          <span className="flex w-6 shrink-0 translate-y-[5px] justify-center" aria-hidden="true">
            {!earned && (
              <svg viewBox="0 0 14 14" className="h-6 w-6 animate-spin [animation-duration:2.2s] motion-reduce:animate-none">
                <circle cx="7" cy="7" r="5.6" fill="none" stroke="hsl(var(--border-strong))" strokeWidth="1.5" />
                <circle
                  cx="7"
                  cy="7"
                  r="5.6"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="9 26"
                />
              </svg>
            )}
          </span>
          <span
          className={cn(
            /* The colour change is the wipe; see `.cert-wipe` in index.css.

               Grown with a transform rather than a larger font size, so the
               row height stays put and sweeping down the list does not shunt
               the rows below the cursor around. `origin-left` grows the name
               into the empty measure on its right instead of off the page. At
               this magnification it necessarily crosses its neighbours, which
               is why the row lifts above them while hovered. */
            /* No `transition-*` utility here. That utility is a `transition:`
               shorthand too, and being a utility it beat `.cert-wipe` in the
               cascade: it replaced the background-position transition with a
               transform one at the default 150ms, so the wipe never animated
               and the zoom ran six times too fast. Both timings live together
               in the one rule in index.css now. */
            'cert-wipe origin-left text-[clamp(20px,2.4vw,28px)] font-semibold leading-[1.25] tracking-[-0.02em]',
            'group-hover:scale-[2]',
            'motion-reduce:group-hover:scale-100',
          )}
          >
            {name}
          </span>
        </span>
        <span
          className={cn(
            'font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors duration-200',
            earned ? 'text-muted-dim group-hover:text-muted-foreground' : 'text-primary',
          )}
        >
          {org} · {earned ? 'Certified' : 'In progress'}
        </span>
      </div>
    </li>
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
      <div className="mt-16">
        <p className="section-heading mb-5">
          <span className="text-primary">~/</span>CERTIFICATIONS
        </p>
        <ul className="flex flex-col">
          {certifications.map(cert => (
            <CertRow key={cert.name} {...cert} />
          ))}
        </ul>
      </div>
    </div>
  );
}
