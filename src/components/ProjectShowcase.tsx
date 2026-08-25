import { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, X, ExternalLink, ArrowRight, Columns2, Search } from 'lucide-react';
import { onOpenProject, scrollToSection } from '@/lib/portfolio-events';

const IMPACT_DIFFS: Record<string, { before: string[]; after: string[] }> = {
  'secure-ubuntu-fleet': {
    before: [
      'SSH: default port 22 exposed',
      'Root login: enabled via password',
      'Firewall: UFW inactive, all ports open',
      'System updates: manual, months behind',
      'File permissions: world-readable defaults',
      'Logging: minimal syslog only',
    ],
    after: [
      'SSH: custom port, key-only authentication',
      'Root login: disabled, sudo with audit trail',
      'Firewall: UFW active, deny-by-default policy',
      'System updates: automated unattended-upgrades',
      'File permissions: CIS benchmark hardened',
      'Logging: centralized with rsyslog forwarding',
    ],
  },
  'http-hardening-nmap-nse': {
    before: [
      'X-Frame-Options: missing',
      'Content-Security-Policy: not set',
      'HSTS: not enforced',
      'Server header: version exposed',
      'X-Content-Type-Options: missing',
      'Cookies: no Secure/HttpOnly flags',
    ],
    after: [
      'X-Frame-Options: DENY enforced',
      'Content-Security-Policy: strict policy applied',
      'HSTS: max-age=31536000 with preload',
      'Server header: stripped/generic',
      'X-Content-Type-Options: nosniff set',
      'Cookies: Secure, HttpOnly, SameSite=Strict',
    ],
  },
  'win-dev-sec-bootstrap': {
    before: [
      'Setup time: 4-6 hours manual config',
      'Environment: inconsistent across machines',
      'Security tools: manually downloaded',
      'WSL2: requires multi-step install',
      'Docker: separate installer needed',
      'Reproducibility: none, tribal knowledge',
    ],
    after: [
      'Setup time: single command, under 30 min',
      'Environment: identical on every machine',
      'Security tools: auto-installed and configured',
      'WSL2: provisioned automatically',
      'Docker: installed and integrated with WSL2',
      'Reproducibility: idempotent, version-controlled',
    ],
  },
  'aws-cloud-security': {
    before: [
      'Security groups: allow all inbound (0.0.0.0/0)',
      'IAM: root account used for daily operations',
      'Monitoring: no CloudWatch alarms set',
      'VPC: default VPC, no subnet isolation',
      'Encryption: EBS volumes unencrypted',
      'Logging: CloudTrail not enabled',
    ],
    after: [
      'Security groups: least-privilege, port-specific rules',
      'IAM: role-based access, MFA enforced, no root usage',
      'Monitoring: CloudWatch alarms on all critical metrics',
      'VPC: custom VPC with public/private subnet isolation',
      'Encryption: EBS encryption enabled by default',
      'Logging: CloudTrail enabled with S3 log archival',
    ],
  },
};

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tech: string[];
  year: string;
  status: string;
  featured: boolean;
  keyResults: string[];
  links: { github: string | null; writeup: string | null; demo: string | null };
  image: string;
  tags: string[];
}

interface ProjectShowcaseProps {
  projects: Project[];
  /** Set when a skill in the matrix above is selected. */
  skillFilter?: { label: string; aliases: string[] } | null;
  onClearSkillFilter?: () => void;
}


const enrichedData: Record<string, { description: string; features: string[] }> = {
  'vaultsnake-platform': {
    description: 'Cybersecurity Master’s final project. A full-stack security platform where users authenticate via Google OAuth, store Fernet-encrypted secrets in a personal vault, and monitor account security events, while admins get platform-wide visibility. Implements defense-in-depth: server-side JWT validation on every endpoint, encryption at rest, role-enforced backend middleware, and an automated threat engine that derives a dynamic 24h risk score.',
    features: ['Google OAuth + server-side JWT', 'Fernet-encrypted vault at rest', 'RBAC user/admin dashboards', 'Automated threat detection & 24h risk score'],
  },
  'cutmox': {
    description: 'A browser-based audio tool built on WebAssembly for fast, fully client-side processing. Built on the TanStack Start template with Vite and deployed via Cloudflare Workers (wrangler). Currently in active build — Phase 1 proved WASM viability, Phase 2 adds settings and upload. No user audio is ever uploaded to a server.',
    features: ['Fully client-side WASM processing', 'No server upload of audio', 'TanStack Start + Vite', 'Cloudflare Workers deploy'],
  },
  'iptables-hardening': {
    description: 'CYB623 Network Security term project (Pace University, Spring 2026). A two-VM VirtualBox host-only lab — Kali attacker vs Ubuntu defender — building and quantitatively measuring three defensive layers: SSH brute-force defense with the recent module, ICMP/SYN flood mitigation with the limit module, and DNAT port forwarding for service hiding. All steps scripted, idempotent, and shellcheck-linted in CI.',
    features: ['SSH brute-force defense (recent module)', 'ICMP/SYN flood mitigation (limit module)', 'DNAT :80 → internal :8080', 'Idempotent scripts, shellcheck CI'],
  },
  'win-dev-sec-bootstrap': {
    description: 'Idempotent PowerShell bootstrap for provisioning complete Windows development and security environments. One command sets up security tools, WSL2, Docker, and all development dependencies from scratch.',
    features: ['One-command setup', 'Idempotent execution', 'WSL2 + Docker config', 'Security tool chain'],
  },
  'automating-infosec': {
    description: 'Comprehensive course repository for CYB 631: Automating Information Security with Python and Shell Scripting. Covers real-world automation scenarios for security operations teams.',
    features: ['Python security scripts', 'Shell automation', 'Lab exercises', 'Documentation'],
  },
  'aws-cloud-security': {
    description: 'Hands-on cloud security project configuring Amazon EC2 instances with layered network security including VPCs, security groups, CloudWatch monitoring, and IAM policies.',
    features: ['EC2 hardening', 'VPC architecture', 'CloudWatch alerts', 'IAM least-privilege'],
  },
  'cs601c-capstone': {
    description: 'Reproducible analytics pipeline for CS601C graduate capstone. Applied computational statistics to model cybersecurity investment costs and ROI across enterprise scenarios.',
    features: ['Statistical modeling', 'Cost-benefit analysis', 'Reproducible pipeline', '64-page report'],
  },
  'secure-ubuntu-fleet': {
    description: 'Automated toolkit for fleet-wide Ubuntu server hardening. Enforces SSH security baselines, configures UFW firewalls, and applies CIS benchmark-aligned configurations.',
    features: ['SSH hardening', 'Firewall automation', 'CIS benchmarks', 'Fleet deployment'],
  },
  'http-hardening-nmap-nse': {
    description: 'Custom Nmap NSE scripts that automate HTTP security header analysis and hardening verification. Identifies missing headers and validates compliance against OWASP guidelines.',
    features: ['Custom NSE scripts', 'Header analysis', 'OWASP compliance', 'Automated scanning'],
  },
  'rapid-pvst-campus-lab': {
    description: 'Advanced Cisco Packet Tracer lab implementing Rapid-PVST with dual-homed access, per-VLAN root load-balancing, PortFast, BPDU Guard, and Root Guard.',
    features: ['Secure multi-switch topology', 'Per-VLAN root balancing', 'BPDU Guard'],
  },
  'inter-vlan-roas-lab': {
    description: 'Packet Tracer exercise demonstrating Router-on-a-Stick configuration for inter-VLAN routing and network segmentation.',
    features: ['Trunk links & subinterfaces', 'Inter-VLAN routing', 'Network segmentation'],
  },
  'vaultsnake': {
    description: 'Secure login GUI using Tkinter with encrypted credentials storage and a classic Snake game reward for authenticated users.',
    features: ['Encrypted credential storage', 'User authentication', 'Gamified security'],
  },
  'kokorotts': {
    description: 'Desktop app for offline Kokoro TTS (ONNX) with 4 voices, speed control, play/stop, and WAV export. Windows-ready with one-click installers.',
    features: ['Offline TTS', '4 voice options', 'WAV export', 'Windows installer'],
  },
  'toc-extractor': {
    description: 'GUI tool to extract chapter pages from a Table of Contents using Playwright + Tkinter with headful browser support for authentication.',
    features: ['Automated TOC extraction', 'GUI interface', 'Auth support'],
  },
  'x86-64-assembly-lab': {
    description: 'Hands-on lab for NASM on Ubuntu 24.04 containing three beginner x86-64 programs with detailed documentation and Makefile.',
    features: ['Three x86-64 programs', 'Detailed documentation', 'Reusable Makefile'],
  },
};

// Database rows and projects.json label the same kind of work differently
// ('Automation' vs 'Security Automation', 'Python Tools' as its own bucket),
// which produced eight filter chips with near-duplicates. Collapse the synonyms
// at render time so the taxonomy stays clean without a data migration.
const CATEGORY_ALIASES: Record<string, string> = {
  'Automation': 'Security Automation',
  'Python Tools': 'Security Automation',
};
const normalizeCategory = (category: string) => CATEGORY_ALIASES[category] ?? category;

/** True on a device driven by a mouse or trackpad rather than a finger. */
const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches;

/** How many case-study cards render inline. The rest live in the index modal. */
const FEATURED_LIMIT = 6;

// Declaration order is the display order of the featured grid, so the headline
// project leads regardless of where it came from (database rows or projects.json).
const FEATURED_ORDER = [
  'recap-verse',
  'vaultsnake-platform', 'cutmox', 'iptables-hardening',
  'win-dev-sec-bootstrap', 'automating-infosec', 'aws-cloud-security',
  'cs601c-capstone', 'secure-ubuntu-fleet', 'http-hardening-nmap-nse',
];
const featuredIds = new Set(FEATURED_ORDER);
const featuredRank = (id: string) => {
  const i = FEATURED_ORDER.indexOf(id);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

/** Featured cards lead with an outcome; index rows carry only a state. */
const STATUS_LABEL: Record<string, string> = {
  completed: 'SHIPPED',
  'in-progress': 'IN PROGRESS',
};
const statusLabel = (s: string) => STATUS_LABEL[s] ?? s.replace(/-/g, ' ').toUpperCase();

/** One metadata row inside a card. Label left, value right, hairline under. */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2">
      <dt className="meta-label shrink-0">{label}</dt>
      <dd className="text-right text-[13px] text-muted-foreground">{value}</dd>
    </div>
  );
}

export function ProjectShowcase({ projects, skillFilter, onClearSkillFilter }: ProjectShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [indexQuery, setIndexQuery] = useState('');

  // Reset diff view when project changes
  useEffect(() => { setShowDiff(false); }, [selectedProject]);

  // Filters follow the data, so a new category in the database shows up on its
  // own and one that disappears stops being offered. Busiest category first.
  const filterCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const c = normalizeCategory(p.category);
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return ['All', ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)];
  }, [projects]);

  const bySkill = skillFilter
    ? projects.filter(p =>
        (p.tech || []).some(t =>
          skillFilter.aliases.some(a => t.toLowerCase().includes(a)),
        ),
      )
    : projects;

  const filtered = activeFilter === 'All'
    ? bySkill
    : bySkill.filter(p => normalizeCategory(p.category) === activeFilter);

  const featuredAll = filtered
    .filter(p => featuredIds.has(p.id))
    .sort((a, b) => featuredRank(a.id) - featuredRank(b.id));
  const featured = featuredAll.slice(0, FEATURED_LIMIT);

  // Everything in the current filter, case studies first, then the rest. This
  // is what the index modal lists — the page itself no longer carries it.
  const indexAll = [
    ...featuredAll,
    ...filtered.filter(p => !featuredIds.has(p.id)),
  ];

  const needle = indexQuery.trim().toLowerCase();
  const indexRows = needle
    ? indexAll.filter(p =>
        p.title.toLowerCase().includes(needle) ||
        normalizeCategory(p.category).toLowerCase().includes(needle) ||
        (p.tech || []).some(t => t.toLowerCase().includes(needle)),
      )
    : indexAll;

  const closeModal = useCallback(() => setSelectedProject(null), []);
  const closeIndex = useCallback(() => { setIndexOpen(false); setIndexQuery(''); }, []);

  /** From the index into one project's detail. */
  const openFromIndex = useCallback((p: Project) => {
    setIndexOpen(false);
    setIndexQuery('');
    setSelectedProject(p);
  }, []);

  useEffect(() => onOpenProject(({ query }) => {
    const needle = query.toLowerCase();
    const hit =
      projects.find(p => p.id.toLowerCase() === needle) ??
      projects.find(p => p.title.toLowerCase().includes(needle));
    if (!hit) return;
    setActiveFilter('All');
    setIndexOpen(false);
    setSelectedProject(hit);
    scrollToSection('projects');
  }), [projects]);

  // Escape closes whichever layer is on top, and the page behind an open layer
  // stops scrolling — the wheel used to scroll the section under the overlay.
  useEffect(() => {
    if (!selectedProject && !indexOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedProject) closeModal();
      else closeIndex();
    };
    window.addEventListener('keydown', handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProject, indexOpen, closeModal, closeIndex]);

  const getEnriched = (id: string) => enrichedData[id];

  const hasDiff = selectedProject ? selectedProject.id in IMPACT_DIFFS : false;
  const diffData = selectedProject ? IMPACT_DIFFS[selectedProject.id] : null;

  return (
    <div>
      {/* Skill cross-link state, stated plainly. This is the site's best
          interaction, so the filtered state is spelled out rather than implied
          by a pill that could be mistaken for decoration. */}
      {skillFilter && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3.5 font-mono text-[11.5px]">
          <span className="text-muted-dim">FILTERED BY</span>
          <span className="text-primary">{skillFilter.label}</span>
          <span className="text-muted-dim">
            {filtered.length} of {projects.length} indexed projects
          </span>
          <button
            onClick={onClearSkillFilter}
            className="tap-44 rounded-[5px] border border-border-strong px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Clear the ${skillFilter.label} filter`}
          >
            CLEAR
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-7 flex flex-wrap justify-center gap-2">
        {filterCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={activeFilter === cat}
            className={
              'tap-44 rounded-md border px-3.5 py-2 text-[12.5px] transition-colors ' +
              (activeFilter === cat
                ? 'border-primary bg-primary-bg text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground')
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tier one: deeply presented, two per row. */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {featured.map(project => (
              <FeaturedCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tier two lives behind a button.

          Rendering all twenty-five as rows under the cards made the section
          feel endless — you scrolled past a wall of hairlines to reach the next
          heading. The full set now opens as a searchable index over the page,
          so the section has a bottom again and nothing is buried. */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">No projects found in this category.</div>
      )}

      {/* One footer row, two exits.

          This used to be a centred button, then a full-width bordered panel
          reading "18+ public repositories" with a second button inside it —
          three stacked blocks closing a section that was already long. Both
          exits sit on one line now and the repository count rides on the link
          that goes there. */}
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {indexAll.length > featured.length && (
          <button
            onClick={() => setIndexOpen(true)}
            className="btn-outline inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-md px-5 text-[14px] font-medium sm:w-auto"
          >
            Browse all {indexAll.length} projects
            <span className="font-mono text-[11px] text-muted-dim">INDEX</span>
            <span className="font-mono" aria-hidden="true">&#8594;</span>
          </button>
        )}
        <a
          href="https://github.com/vijaysinghpuwar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md px-5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-primary sm:w-auto"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          18+ repositories on GitHub
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {/* Index modal — the full set, searchable, one row per project.

          Portalled to <body>. The router's <main> carries `relative z-[1]`,
          which opens a stacking context: a `z-50` overlay rendered inside it
          still resolves under the `z-50` fixed navigation, so the nav sat on
          top of the dialog, undimmed and clickable. Escaping to the body puts
          both layers back in the same stacking context. */}
      {createPortal(
        <AnimatePresence>
          {indexOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4"
            onClick={closeIndex}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="All projects"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="panel relative flex h-full w-full flex-col rounded-none md:h-auto md:max-h-[80vh] md:w-full md:max-w-3xl md:rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:px-7">
                <div>
                  <div className="meta-label">Project index</div>
                  <h3 className="mt-2 text-[21px] font-semibold tracking-[-0.02em] text-foreground">
                    All {indexAll.length} projects
                  </h3>
                </div>
                <button
                  onClick={closeIndex}
                  aria-label="Close index"
                  className="tap-44 -mr-1.5 -mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 border-b border-border px-5 py-3 sm:px-7">
                <Search className="h-4 w-4 shrink-0 text-muted-dim" aria-hidden="true" />
                <input
                  /* Focus the filter on a mouse, never on a finger. On a phone
                     autoFocus threw the software keyboard up the instant the
                     index opened, which covered the list the reader had just
                     asked to see — before they had typed anything. */
                  autoFocus={hasFinePointer()}
                  value={indexQuery}
                  onChange={e => setIndexQuery(e.target.value)}
                  placeholder="Filter by name, category or tech…"
                  aria-label="Filter projects"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] text-foreground outline-none placeholder:text-muted-dim focus:ring-0"
                />
                <span className="shrink-0 font-mono text-[11px] text-muted-dim">
                  {indexRows.length}/{indexAll.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7">
                {indexRows.map(project => (
                  <IndexRow
                    key={project.id}
                    project={project}
                    onClick={() => openFromIndex(project)}
                  />
                ))}
                {indexRows.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Nothing matches “{indexQuery}”.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Detail modal — portalled for the same reason as the index above. */}
      {createPortal(
        <AnimatePresence>
          {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4"
            onClick={closeModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selectedProject.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              /* `h-full w-full`, not `h-screen w-screen`. The overlay is a
                 padded flex box, so a 100vh child did not fit its 100vh−32px
                 content box: measured on a 390px phone the dialog ran to 708px
                 against a 700px viewport, hanging 8px off the bottom and
                 leaving no backdrop above or below to tap the dialog shut. The
                 index dialog above always sized itself this way; this matches. */
              className="panel relative flex h-full w-full flex-col overflow-hidden rounded-none md:h-auto md:max-h-[85vh] md:w-full md:max-w-2xl md:rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              {/* Header in flow, with the body scrolling under it, so the close
                  button stays put. It used to be `absolute` inside the element
                  that scrolls — which means it scrolled with the content: at
                  the bottom of a long project the X measured 68px above the top
                  of the screen. On a phone, with no Escape key and (see above)
                  no backdrop left to tap, getting out meant scrolling back up
                  first. The title also gets its full width back: it used to
                  hold 96px open (`pr-24`) for a cluster that never sat on the
                  same line as it, so the reservation only cost it wrapping. */}
              <div className="flex items-start justify-between gap-3 border-b border-border p-6 sm:p-8 sm:pb-6">
                <div className="min-w-0">
                  <div className="meta-label">{normalizeCategory(selectedProject.category)}</div>
                  <h3 className="mt-3 text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[24px]">
                    {selectedProject.title}
                  </h3>
                  <div className="mt-2 font-mono text-[11.5px] text-muted-dim">
                    {selectedProject.year} · {statusLabel(selectedProject.status)}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="tap-44 -mr-1.5 -mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6 pt-6 sm:p-8">
                {/* The impact toggle switches what the body says, so it reads
                    with the body rather than from the corner of the header. It
                    also scrolled away with the close button it sat beside. */}
                {hasDiff && (
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    aria-pressed={showDiff}
                    className={
                      'tap-44 mb-6 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11.5px] transition-colors ' +
                      (showDiff
                        ? 'border-primary bg-primary-bg text-primary'
                        : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground')
                    }
                  >
                    <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {showDiff ? 'Show details' : 'Show impact'}
                  </button>
                )}
                {!showDiff ? (
                  <div>
                    <p className="text-[14.5px] leading-[1.65] text-muted-foreground">
                      {getEnriched(selectedProject.id)?.description || selectedProject.description}
                    </p>

                    {selectedProject.keyResults?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="meta-label">What it does</h4>
                        <ul className="mt-3 flex flex-col gap-2.5">
                          {selectedProject.keyResults.map(r => (
                            <li key={r} className="flex gap-3 text-[14px] leading-[1.55] text-muted-foreground">
                              <span className="shrink-0 text-primary" aria-hidden="true">—</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <dl className="mt-6 border-t border-border">
                      <MetaRow label="Stack" value={selectedProject.tech.join(' · ')} />
                      <MetaRow label="Year" value={selectedProject.year} />
                      <MetaRow label="Status" value={statusLabel(selectedProject.status)} />
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {selectedProject.links.demo && (
                        <a
                          href={selectedProject.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px] font-medium"
                        >
                          Visit site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {/* Repository links are public. links.github is only ever set for
                          repositories that are public on GitHub — private ones carry null
                          and render nothing, so there is no repo to gate and no private
                          URL in the shipped data. Those projects lead with their live site. */}
                      {selectedProject.links.github && (
                        <a
                          href={selectedProject.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gradient-btn inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px]"
                        >
                          <Github className="h-4 w-4" aria-hidden="true" /> View source
                        </a>
                      )}
                    </div>
                  </div>
                ) : diffData ? (
                  <DiffView before={diffData.before} after={diffData.after} />
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

/* ── Diff View ── */

/**
 * Before/after, in the theme's own colours. It previously hardcoded #f43f5e and
 * #22c55e, so the "after" column stayed green even in pentest mode where green
 * means nothing, and both columns ignored the token layer entirely.
 */
function DiffView({ before, after }: { before: string[]; after: string[] }) {
  const column = (title: string, rows: string[], sign: string, good: boolean) => (
    <div className="overflow-x-auto rounded-md border border-border bg-card-elevated p-4">
      <span className={`meta-label ${good ? 'text-primary' : 'text-destructive'}`}>{title}</span>
      <div className="mt-3 flex flex-col gap-1.5">
        {rows.map(line => (
          <div key={line} className="flex items-start gap-2 font-mono text-[11.5px] leading-[1.5]">
            <span className={`shrink-0 ${good ? 'text-primary' : 'text-destructive'}`}>{sign}</span>
            <span className="text-muted-foreground">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {column('Before', before, '−', false)}
      {column('After', after, '+', true)}
    </div>
  );
}

/* ── Cards ── */

/**
 * Tier one.
 *
 * The old card gave title, description, tech tags, year and status roughly the
 * same weight, so nothing led. This one has a single focal point: the first key
 * result, set brighter and marked with an accent rule. That is the outcome, and
 * it is the reason to keep reading. Everything else is support.
 *
 * Stack and status used to be two full definition rows with a hairline each,
 * which cost about seventy vertical pixels a card and gave a stack list the same
 * structural weight as the outcome. They are one mono line and one word now.
 * The card is also `h-full` with the action row pushed down by `mt-auto`, so a
 * two-line title next to a one-line title no longer leaves a hole in the shorter
 * card — every footer in a row lands on the same baseline.
 */
const FeaturedCard = forwardRef<HTMLDivElement, { project: Project; onClick: () => void }>(
  function FeaturedCard({ project, onClick }, ref) {
    const outcome = project.keyResults?.[0];
    const inProgress = project.status === 'in-progress';

    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
        className="panel panel-hover flex h-full cursor-pointer flex-col rounded-lg p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="meta-label truncate">{normalizeCategory(project.category)}</span>
          <span className={`shrink-0 font-mono text-[10.5px] ${inProgress ? 'text-primary' : 'text-muted-dim'}`}>
            {project.year} · {statusLabel(project.status)}
          </span>
        </div>

        <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground">
          {project.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-muted-foreground">
          {project.description}
        </p>

        {outcome && (
          <p className="mt-3.5 line-clamp-2 border-l-2 border-primary pl-3 text-[13px] leading-[1.5] text-foreground">
            {outcome}
          </p>
        )}

        <p className="mt-3.5 truncate font-mono text-[11px] text-muted-dim">
          {project.tech.slice(0, 4).join(' · ')}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-3.5 text-[13.5px] font-medium">
          <span className="flex items-center gap-2 text-primary">
            View details <span className="font-mono" aria-hidden="true">&#8594;</span>
          </span>
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label={`${project.title} source on GitHub`}
              className="tap-44 text-muted-dim transition-colors hover:text-primary"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </motion.article>
    );
  });

/**
 * Tier two: name, stack, state. Three columns, one hairline, no card chrome.
 */
const IndexRow = forwardRef<HTMLButtonElement, { project: Project; onClick: () => void }>(
  function IndexRow({ project, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="grid w-full grid-cols-1 items-center gap-1 border-b border-border py-3.5 text-left transition-colors hover:bg-card sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_130px] sm:gap-5"
      >
        <span className="text-[15px] font-medium text-foreground">{project.title}</span>
        <span className="truncate font-mono text-[11.5px] text-muted-dim">
          {project.tech.slice(0, 3).join(' · ')}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground sm:text-right">
          {statusLabel(project.status)}
        </span>
      </button>
    );
  });
