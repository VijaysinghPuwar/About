import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePauseOffscreen } from '@/hooks/usePauseOffscreen';

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
          className="relative origin-left rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground transition-[transform,color,border-color] duration-300 ease-out hover:z-10 hover:scale-150 hover:border-primary hover:text-primary reduced:transition-none reduced:hover:scale-100"
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
    dates: 'JUN 2026 → AUG 2026',
    place: 'New York, NY',
    kind: 'Internship',
    title: 'IT Network Intern',
    org: 'Metropolitan Transportation Authority · Staten Island Railway',
    bullets: [
      <>Resolved incidents and service requests in ServiceNow for a 24/7 rail operation, isolating faults across the application, network path, access policy and host.</>,
      <>Built an IT request intake system with Microsoft Forms, Power Automate and SharePoint, and caught a defect writing incorrect values before release.</>,
      <>Processed access requests for Active Directory groups, Duo MFA and Zscaler ZPA against policy.</>,
      <>Supported Cisco Catalyst switching: VLANs, access and trunk ports; mapped devices and verified addressing and port assignments.</>,
      <>Built a Python NTP clock-correction service for a Rail Control Center workstation with dry-run mode, elevation checks and rotating logs.</>,
      <>Wrote the operator runbook the team now works from.</>,
    ],
    metaLabel: 'Working with',
    meta: ['Active Directory', 'ServiceNow', 'Cisco Catalyst', 'Power Automate', 'Python'],
    detail: (
      <div>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
          IT network and infrastructure support for MTA Staten Island Railway: incidents, access
          control, switching, and the hardware itself, as servers, thin clients and telephony
          equipment were installed, cabled and decommissioned.
        </p>
        {[
          { label: 'Networking', items: ['Cisco Catalyst', 'VLANs', 'Access & trunk ports', 'IP addressing'] },
          { label: 'Identity & access', items: ['Active Directory', 'Duo MFA', 'Zscaler ZPA'] },
          { label: 'Tools', items: ['ServiceNow', 'Microsoft Forms', 'Power Automate', 'SharePoint', 'Python'] },
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
    dates: 'JAN 2025 → DEC 2026',
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
    place: 'Vadodara, India',
    kind: 'Full-time',
    title: 'System Engineer',
    org: 'R. S. Infotech',
    bullets: [
      <>Ran {highlightMetric('150+')} Windows and Linux systems on premises and on AWS and Azure.</>,
      <>Managed Active Directory: Group Policy, privileged group reviews, MFA enrollment, onboarding and offboarding.</>,
      <>Investigated incidents in Splunk, correlating Windows event logs and network traffic, and tuned IDS/IPS and firewall rules to cut false positives.</>,
      <>Wrote Splunk SPL queries for failed authentication and suspicious activity.</>,
      <>Automated compliance checks, log review and inventory in Python, PowerShell and Bash.</>,
      <>Patched Windows and Linux servers, handled OS imaging, build baselines, and DNS and DHCP administration, and tested backup and disaster recovery.</>,
      <>Triaged SonarQube, OWASP ZAP, Burp Suite and Nessus findings and added security checks to GitLab CI.</>,
      <>Prepared evidence for audits and client security questionnaires.</>,
    ],
    metaLabel: 'Working with',
    meta: ['Windows Server', 'Linux', 'Active Directory', 'Splunk', 'AWS / Azure', 'DNS / DHCP', 'Python / PowerShell / Bash', 'GitLab CI'],
  },
  {
    id: 'be-mech',
    dates: 'JUN 2019 → AUG 2023',
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
  {
    id: 'lt-sargent-lundy',
    dates: 'JAN 2023 → APR 2023',
    place: 'Vadodara, India',
    kind: 'Internship',
    title: 'Systems Intern',
    org: 'L&T-Sargent & Lundy Limited',
    bullets: [
      <>Performed HVAC heat load calculations and duct sizing for engineering projects.</>,
      <>Designed duct layouts and produced technical drawings in AutoCAD.</>,
      <>Wrote detailed technical reports for stakeholders, turning calculations into clear recommendations.</>,
    ],
    metaLabel: 'Working with',
    meta: ['AutoCAD', 'HVAC design', 'Technical reporting'],
  },
  {
    id: 'elecon',
    dates: 'JUN 2022 → JUL 2022',
    place: 'Anand, India',
    kind: 'Internship',
    title: 'Design Intern',
    org: 'Elecon Engineering Company',
    bullets: [
      <>Produced AutoCAD drawings and bills of materials for gear manufacturing.</>,
      <>Ran quality control checks against drawing specifications and tolerances.</>,
      <>Wrote technical reports for stakeholders on design and production findings.</>,
    ],
    metaLabel: 'Working with',
    meta: ['AutoCAD', 'Bills of materials', 'Quality control'],
  },
];

const certifications = [
  { name: 'CompTIA Security+', org: 'CompTIA', earned: true },
  { name: 'CompTIA CySA+', org: 'CompTIA', earned: true },
  { name: 'Cisco CCNA', org: 'Cisco', earned: true },
  { name: 'Google Cybersecurity Certificate', org: 'Google', earned: true },
  { name: 'Google AI Essentials', org: 'Google', earned: true },
  { name: 'Cisco CCNP Enterprise', org: 'Cisco', earned: false },
];

/* ── One entry ── */
function TimelineEntry({ row, index, last }: { row: Row; index: number; last: boolean }) {
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
          {/* Drawn, and boxed to one line of the title.

              This was the `⌄` character in a span with no size of its own. As
              a flex item it stretched to the full height of the card, so
              "rotate 180 degrees" turned it about the middle of the card: the
              mark left the title and reappeared at the bottom corner whenever
              an entry was opened. A fixed box turns about its own centre. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={cn(
              'mt-[5px] h-3 w-3 shrink-0 self-start text-muted-dim transition-transform duration-150 ease-out',
              open && 'rotate-180',
            )}
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="min-w-0 flex-1">
            <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', onLeft && 'wide:justify-end')}>
              <h3 className="text-[17px] font-semibold tracking-[-0.014em] text-foreground">
                {row.title}
              </h3>
              {row.now && (
                <span className="inline-flex items-center gap-[7px] font-mono text-[11px] tracking-[0.14em] text-primary">
                  CURRENT
                  <span className="h-3 w-1.5 animate-pulse bg-primary reduced:animate-none" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="mt-1 text-[14px] leading-[1.5] text-muted-foreground">{row.org}</div>
            {/* Each part is unbreakable and the line breaks between them. Set
                as one string it broke wherever it ran out of room, which on a
                phone was inside the place name: "Vadodara," on one line and
                "India" on the next.

                The dot belongs to the part that follows it. Below the desktop
                breakpoint the row is pulled left by the width of one dot and
                clipped, so a part that starts a line leaves its dot outside
                the box instead of opening the line with a stray separator. On
                desktop the line never wraps and can be right-aligned, so the
                first part simply has none. */}
            <div className="mt-2 overflow-hidden font-mono text-[11.5px] tracking-[0.04em] text-muted-dim">
              <div className={cn('-ml-[4ch] flex flex-wrap gap-y-0.5 wide:ml-0', onLeft && 'wide:justify-end')}>
                {[row.dates, row.place, row.kind].filter(Boolean).map(part => (
                  <span
                    key={part}
                    className="whitespace-nowrap before:inline-block before:w-[4ch] before:text-center before:content-['·'] wide:first:before:hidden"
                  >
                    {part}
                  </span>
                ))}
              </div>
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
                  {/* Ragged right. These were justified with hyphenation on,
                      which holds up in a wide column and falls apart in a
                      narrow one: on a phone the measure is about thirty
                      characters, and a line of four long words was stretched
                      edge to edge with gaps wider than the words. */}
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
        {/* The rule joins this mark to the next one, so the last entry has
            none: it used to hang on into the gap above the certifications. */}
        {!last && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
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
        className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-primary transition-transform duration-200 ease-out group-hover:scale-y-100"
      />
      {/* Stacked on a phone, one line from `sm` up. It used to `flex-wrap`,
          which put the issuer beside a short name and under a long one, so the
          list changed shape from row to row. */}
      <div className="flex flex-col gap-1 rounded-md px-0 py-[18px] transition-colors duration-200 group-hover:bg-card sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-6 wide:px-[18px]">
        <span className="flex min-w-0 items-baseline gap-3">
          {/* The gutter is present on every row, so the names keep one left
              edge whether or not there is a mark to put in front of them. */}
          <span className="flex w-6 shrink-0 translate-y-[5px] justify-center" aria-hidden="true">
            {!earned && (
              /* A part-drawn ring, standing still. It used to spin, and a
                 spinner means "wait, this is loading": on a line of a résumé
                 it said the page was stuck. */
              <svg viewBox="0 0 14 14" className="h-6 w-6 -rotate-90">
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

               That is the whole hover, with the rule and the lifted surface.
               The name also used to grow to twice its size, across the rows
               above and below it and past the section heading in scale. It
               was the loudest thing on the page and it was a list item.

               No `transition-*` utility here: that utility is a `transition:`
               shorthand, and being a utility it would replace the one
               `.cert-wipe` declares. */
            'cert-wipe text-[clamp(20px,2.4vw,28px)] font-semibold leading-[1.25] tracking-[-0.02em]',
          )}
          >
            {name}
          </span>
        </span>
        <span
          className={cn(
            /* `pl-9` is the mark gutter plus its gap, so the stacked issuer
               lines up under the name rather than under the spinner. */
            'pl-9 font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors duration-200 sm:shrink-0 sm:pl-0',
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
  const pauseRef = usePauseOffscreen<HTMLDivElement>();
  return (
    <div ref={pauseRef} className="mt-10">
      <div className="relative">
        {rows.map((row, i) => (
          <TimelineEntry key={row.id} row={row} index={i} last={i === rows.length - 1} />
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
