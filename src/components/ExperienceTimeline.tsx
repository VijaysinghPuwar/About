import { useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { GraduationCap, Briefcase, ChevronDown, Shield } from 'lucide-react';
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
    subtitle: 'Pace University — New York, NY',
    period: 'Expected Dec 2026',
    expandedContent: (
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          GPA: {highlightMetric('4.00')}
        </p>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          Selected Coursework
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Computational Statistics', 'Introduction to Cybersecurity',
            'Information Security Management', 'Network Security & Defense',
            'Ethical Hacking & Penetration Testing', 'Automating InfoSec with Python & Shell',
            'Cyber Intelligence Analysis & Modeling', 'Operating Systems Theory & Administration',
          ].map(c => (
            <span key={c} className="text-xs px-2.5 py-1 rounded-full glass-card text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
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
          <>Secured {highlightMetric('150+')} enterprise endpoints with group policies, antivirus, and patch management</>,
          <>Managed Active Directory identity hygiene and enforced MFA via PowerShell automation</>,
          <>Automated log analysis and reporting with Python, reducing manual effort by {highlightMetric('70%')}</>,
          <>Maintained firewalls, IDS/IPS, reducing security breaches by {highlightMetric('20%')}</>,
          <>Provided Tier 1/2 incident response and escalation support</>,
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
    id: 'lt-sargent',
    type: 'work',
    title: 'Systems Intern',
    subtitle: 'L&T-Sargent & Lundy',
    period: 'Jan 2023 – Apr 2023',
    expandedContent: (
      <ul className="space-y-2">
        <li className="text-sm text-muted-foreground flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span>Designed and optimized HVAC systems with {highlightMetric('100%')} adherence to ASHRAE standards compliance</span>
        </li>
      </ul>
    ),
  },
  {
    id: 'be-mech',
    type: 'education',
    title: 'B.E. Mechanical Engineering',
    subtitle: 'G.H. Patel College of Engineering & Technology — Gujarat, India',
    period: 'Completed Aug 2023',
    expandedContent: (
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          CGPA: {highlightMetric('7.11')}
        </p>
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider font-mono">
          Selected Coursework
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Engineering Design & Analysis', 'Manufacturing Systems',
            'Thermodynamics & Fluid Mechanics', 'Technical Documentation',
          ].map(c => (
            <span key={c} className="text-xs px-2.5 py-1 rounded-full glass-card text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'elecon',
    type: 'work',
    title: 'Design Intern',
    subtitle: 'Elecon Engineering',
    period: 'Jan 2022 – Jun 2022',
    expandedContent: (
      <ul className="space-y-2">
        <li className="text-sm text-muted-foreground flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span>CAD modeling and engineering documentation for industrial systems</span>
        </li>
      </ul>
    ),
  },
];

const certifications = [
  { name: 'CompTIA Security+', org: 'CompTIA' },
  { name: 'CompTIA CySA+', org: 'CompTIA' },
  { name: 'Cisco CCNA', org: 'Cisco' },
  { name: 'ISC2 Candidate', org: 'ISC2' },
  { name: 'Google AI Essentials', org: 'Google' },
];

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
  const isLeft = index % 2 === 0;
  const Icon = entry.type === 'education' ? GraduationCap : Briefcase;

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr] md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-8 items-start">
      {/* Left content (desktop only) */}
      <div className={`hidden md:block ${isLeft ? '' : 'order-3'}`}>
        {isLeft && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
          >
            <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} />
          </motion.div>
        )}
      </div>

      {/* Center dot */}
      <div className="hidden md:flex flex-col items-center order-2">
        <button
          onClick={() => onToggle(entry.id)}
          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.7)] scale-110'
              : 'bg-card border-2 border-primary/40 hover:border-primary/80'
          }`}
        >
          <Icon className={`w-4 h-4 ${isExpanded ? 'text-primary-foreground' : 'text-primary'}`} />
          {isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </button>
      </div>

      {/* Right content (desktop only) */}
      <div className={`hidden md:block ${isLeft ? 'order-3' : ''}`}>
        {!isLeft && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
          >
            <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} />
          </motion.div>
        )}
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex gap-4">
        <div className="flex flex-col items-center">
          <button
            onClick={() => onToggle(entry.id)}
            className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isExpanded
                ? 'bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.7)]'
                : 'bg-card border-2 border-primary/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isExpanded ? 'text-primary-foreground' : 'text-primary'}`} />
          </button>
          {index < entries.length - 1 && (
            <div className="w-[2px] flex-1 min-h-[20px] timeline-line-gradient" />
          )}
        </div>
        <motion.div
          className="flex-1 pb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
        >
          <NodeCard entry={entry} isExpanded={isExpanded} onToggle={onToggle} />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Node Card ── */
function NodeCard({ entry, isExpanded, onToggle }: {
  entry: TimelineEntry;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onToggle(entry.id)}
      className={`glass-card rounded-lg p-5 cursor-pointer transition-all duration-300 ${
        isExpanded
          ? 'border border-primary/40 shadow-[0_0_24px_hsl(var(--primary)/0.12)]'
          : 'border border-transparent hover:border-primary/20 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.08)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-foreground text-lg leading-tight">{entry.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{entry.subtitle}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">{entry.period}</p>
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
            <div className="pt-4 border-t border-border/40 mt-4">
              {entry.expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Certification Flip Card ── */
function CertCard({ name, org }: { name: string; org: string }) {
  return (
    <div className="flip-card group">
      <div className="flip-card-inner">
        <div className="flip-card-front glass-card rounded-lg flex flex-col items-center justify-center gap-2.5 p-4 border border-transparent group-hover:border-primary/30 transition-colors">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm text-foreground font-medium text-center leading-tight">{name}</span>
        </div>
        <div className="flip-card-back glass-card rounded-lg flex flex-col items-center justify-center gap-2 p-4 border border-primary/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Issued by</span>
          <span className="text-base font-bold gradient-text">{org}</span>
        </div>
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
      {/* Timeline */}
      <div className="relative">
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
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono mb-6">
          Certifications
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {certifications.map(cert => (
            <CertCard key={cert.name} name={cert.name} org={cert.org} />
          ))}
        </div>
      </div>
    </div>
  );
}
