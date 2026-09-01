import { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { GraduationCap, Briefcase, ChevronDown } from 'lucide-react';
import { useRef } from 'react';

/* ── timeline data ── */
interface TimelineEntry {
  id: string;
  type: 'education' | 'work';
  title: string;
  subtitle: string;
  period: string;
  expandedContent: React.ReactNode;
}

const highlightMetric = (text: string) => (
  <span className="text-primary font-semibold">{text}</span>
);

const entries: TimelineEntry[] = [
  {
    id: 'ms-cyber',
    type: 'education',
    title: 'M.S. Cybersecurity',
    subtitle: 'Pace University, Seidenberg School of CSIS — New York, NY',
    period: 'Expected Dec 2026',
    expandedContent: (
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {/* Degree audit 2026-07-19: 30 required, 39 applied — 36 completed plus
              the 3-credit capstone in progress. Stated as completed/in-progress
              because "39 credits applied" reads as 39 finished. */}
          GPA: {highlightMetric('3.92')} · {highlightMetric('36')} credits completed, {highlightMetric('3')} in progress
        </p>
        <p className="text-xs text-muted-foreground mb-3 font-mono">
          Seidenberg School of Computer Science & Information Systems
        </p>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          Completed Coursework
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[
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
          ].map(c => (
            <span key={c} className="rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          In Progress
        </p>
        <div className="flex flex-wrap gap-1.5">
          {/* Degree audit 2026-07-19: CYB 691 is the only course still IP.
              IS 680 completed Summer 2026. */}
          {['Cybersecurity Capstone Project'].map(c => (
            <span key={c} className="text-xs px-2.5 py-1 rounded-full border border-primary/40 text-primary">
              {c}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'mta-sirtoa',
    type: 'work',
    title: 'IT Emerging Talent Intern',
    subtitle: 'Metropolitan Transportation Authority (MTA) — Staten Island Railway (SIRTOA) · IT Infrastructure & Network Operations · New York City',
    period: 'June 2026 – Present',
    expandedContent: (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Supporting enterprise IT infrastructure, network operations, endpoint systems, and secure technology services for MTA Staten Island Railway, focusing on system reliability, troubleshooting, and operational efficiency.
        </p>
        <ul className="space-y-2 mb-5">
          {[
            <>Configure Cisco Catalyst switching — VLANs, access and trunk ports — and support OSPF and BGP routing on production network devices.</>,
            <>Administer zero-trust and identity access: Zscaler ZPA application groups, DUO multi-factor enrollment, Active Directory groups, and provisioning and revocation as staff join, move, and leave.</>,
            <>Own incidents end to end in ServiceNow from triage through closure, maintain a daily System Verification Log, and deploy endpoint hardware at remote facilities.</>,
            <>Designed a Power Automate and SharePoint intake application and root-caused a trigger-versus-Compose defect in testing; deployed a Python NTP clock-correction service for a Rail Control Center workstation.</>,
          ].map((bullet, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          Security Alignment
        </p>
        <p className="text-sm text-muted-foreground mb-5">
          Supported secure infrastructure operations through endpoint management, access control, system verification, and enterprise technology support.
        </p>
        {[
          { label: 'Networking', items: ['TCP/IP', 'LAN Troubleshooting', 'Enterprise Networks'] },
          { label: 'Systems', items: ['Windows Administration', 'Active Directory', 'Microsoft 365', 'Endpoint Management'] },
          { label: 'Security', items: ['Access Management', 'Endpoint Security', 'System Verification'] },
          { label: 'Tools', items: ['ServiceNow', 'ArcGIS', 'HxGN EAM'] },
        ].map(group => (
          <div key={group.label} className="mb-3 last:mb-0">
            <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map(item => (
                <span key={item} className="rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'rs-infotech',
    type: 'work',
    title: 'System Engineer',
    subtitle: 'R.S. Infotech',
    period: 'Feb 2023 – Aug 2024',
    expandedContent: (
      <ul className="space-y-2">
        {[
          <>Automated recurring operational workflows across a {highlightMetric('150+')} Windows and Linux environment in Python, SQL, PowerShell and Bash — log processing, inventory, uptime monitoring, account lifecycle, configuration compliance, data reconciliation and reporting — replacing manual process with reusable, maintainable tooling rather than one-off scripts</>,
          <>Delivered solutions end to end with stakeholders: identified the problem, investigated it, designed and built the solution, tested, deployed and documented the expected behaviour so other engineers could support it, maintained through Git-based development</>,
          <>Root-caused defects across applications, system services, authentication, data and networking using Splunk, operating-system logs, event data and network evidence, then validated each fix; supported AWS and Microsoft Azure alongside on-premises infrastructure</>,
        ].map((bullet, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'be-mech',
    type: 'education',
    title: 'B.E. Mechanical Engineering',
    subtitle: 'G H Patel College of Engineering and Technology — Anand, India',
    period: 'Completed Jan 2024',
    expandedContent: (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          CGPA: {highlightMetric('7.11 / 10')}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          Engineering foundation in systems thinking, design, and problem solving — later pivoted to cybersecurity.
        </p>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          Selected Coursework
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Programming for Problem Solving',
            'Operation Research',
            'Quality & Reliability Engineering',
            'Industry 4.0',
            'Computer Aided Design & Manufacturing',
            'Engineering Mathematics',
          ].map(c => (
            <span key={c} className="rounded-md border border-border bg-card-elevated px-2.5 py-1 text-[12px] text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
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

/* ── Pointer Arrow ── */
function PointerArrow({ side }: { side: 'left' | 'right' }) {
  // Points toward the center line
  if (side === 'right') {
    // Card is on right, arrow points left
    return (
      <div className="absolute top-5 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-card" />
    );
  }
  // Card is on left, arrow points right
  return (
    <div className="absolute top-5 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-card" />
  );
}

/* ── Timeline Node ── */
function TimelineNode({ entry, index, expandedId, onToggle }: {
  entry: TimelineEntry;
  index: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isExpanded = expandedId === entry.id;
  const isLeft = index % 2 === 1; // 0→right, 1→left, 2→right...
  const Icon = entry.type === 'education' ? GraduationCap : Briefcase;
  const isDimmed = expandedId !== null && !isExpanded;

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr] md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-8 items-start">
      {/* Left content (desktop only) */}
      <div className="hidden md:block">
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: isDimmed ? 0.4 : 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: index * 0.15 }}
          >
            <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} pointerSide="left" />
          </motion.div>
        )}
      </div>

      {/* Center dot */}
      <div className="hidden md:flex flex-col items-center">
        <motion.button
          onClick={() => onToggle(entry.id)}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${entry.title}`}
          aria-expanded={isExpanded}
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.15 }}
          className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            isExpanded
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-primary hover:border-primary'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Right content (desktop only) */}
      <div className="hidden md:block">
        {!isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: isDimmed ? 0.4 : 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: index * 0.15 }}
          >
            <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} pointerSide="right" />
          </motion.div>
        )}
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex gap-4">
        <div className="flex flex-col items-center">
          <motion.button
            onClick={() => onToggle(entry.id)}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${entry.title}`}
            aria-expanded={isExpanded}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.15 }}
            className={`tap-44 relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
              isExpanded
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-primary'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
          {index < entries.length - 1 && (
            <div className="w-[2px] flex-1 min-h-[20px] timeline-line-gradient" />
          )}
        </div>
        <motion.div
          className="flex-1 pb-8"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: isDimmed ? 0.4 : 1, x: 0 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: index * 0.15 }}
        >
          <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} pointerSide="right" />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Node Card ── */
function NodeCard({ entry, isExpanded, onToggle, pointerSide }: {
  entry: TimelineEntry;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  pointerSide?: 'left' | 'right';
}) {
  return (
    <div
      onClick={() => onToggle(entry.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(entry.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      className={`relative cursor-pointer rounded-lg border bg-card p-5 transition-colors ${
        isExpanded ? 'border-primary' : 'border-border hover:border-border-strong'
      }`}
    >
      {/* Pointer arrow (desktop only) */}
      {pointerSide && <div className="hidden md:block"><PointerArrow side={pointerSide} /></div>}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-tight tracking-[-0.014em] text-foreground">{entry.title}</h3>
          <p className="mt-1 text-[14px] text-muted-foreground">{entry.subtitle}</p>
          <p className="mt-2 font-mono text-[11.5px] text-muted-dim">{entry.period}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4">
              {entry.expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
  Certification card.

  It used to flip on hover to reveal the issuing body — an animation to hide a
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="mt-12">
      {/* Timeline

          `overflow-x-clip`: the cards slide in from 50px outside their own
          column, and the right-hand column ends at the container edge — so
          until they land, they hold the document open wider than the viewport
          and the whole page can be dragged sideways. Clipping contains the
          entry animation without making this a scroll container. */}
      <div className="relative overflow-x-clip">
        {/* Center line (desktop) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] timeline-line-gradient" />

        <div className="space-y-6 md:space-y-10">
          {entries.map((entry, i) => (
            <TimelineNode
              key={entry.id}
              entry={entry}
              index={i}
              expandedId={expandedId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="mt-16">
        <p className="section-heading mb-6 text-center">Certifications</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {certifications.map(cert => (
            <CertCard key={cert.name} {...cert} />
          ))}
        </div>
      </div>
    </div>
  );
}
