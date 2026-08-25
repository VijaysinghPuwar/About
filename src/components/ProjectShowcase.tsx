import { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, X, ExternalLink, ArrowRight, Columns2, ChevronDown } from 'lucide-react';
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

/** How many projects stay visible before the reader asks for the rest. */
const FEATURED_LIMIT = 6;
const SECONDARY_PREVIEW = 8;

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
  const [showAll, setShowAll] = useState(false);

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
  const secondaryAll = [
    ...featuredAll.slice(FEATURED_LIMIT),
    ...filtered.filter(p => !featuredIds.has(p.id)),
  ];

  // A filtered view is already small, so only the unfiltered wall collapses.
  const collapsible = activeFilter === 'All' && !skillFilter && !showAll;
  const secondary = collapsible ? secondaryAll.slice(0, SECONDARY_PREVIEW) : secondaryAll;
  const hiddenCount = secondaryAll.length - secondary.length;

  const closeModal = useCallback(() => setSelectedProject(null), []);

  useEffect(() => onOpenProject(({ query }) => {
    const needle = query.toLowerCase();
    const hit =
      projects.find(p => p.id.toLowerCase() === needle) ??
      projects.find(p => p.title.toLowerCase().includes(needle));
    if (!hit) return;
    setActiveFilter('All');
    setShowAll(true);          // it may be one of the collapsed entries
    setSelectedProject(hit);
    scrollToSection('projects');
  }), [projects]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    if (selectedProject) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedProject, closeModal]);

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
            className="rounded-[5px] border border-border-strong px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Clear the ${skillFilter.label} filter`}
          >
            CLEAR
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-9 flex flex-wrap justify-center gap-2">
        {filterCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={activeFilter === cat}
            className={
              'rounded-md border px-3.5 py-2 text-[12.5px] transition-colors ' +
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
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      {/* Tier two: an index, not more cards. Twenty-five projects rendered as
          twenty-five cards is a directory; as rows it is something a hiring
          manager can actually scan. */}
      {secondary.length > 0 && (
        <div className="mt-9">
          <div className="flex items-baseline justify-between border-b border-border-strong pb-2.5">
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted-dim">PROJECT INDEX</span>
            <span className="font-mono text-[11px] text-muted-dim">
              {secondary.length} of {secondaryAll.length} shown
            </span>
          </div>
          {secondary.map(project => (
            <IndexRow
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* Every project stays reachable; the full set is opt-in so the default
          view is not a wall of cards. */}
      {(hiddenCount > 0 || showAll) && activeFilter === 'All' && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(v => !v)}
            aria-expanded={showAll}
            className="btn-outline inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 text-[13.5px] font-medium"
          >
            {showAll ? 'Show fewer projects' : `Show all ${projects.length} projects`}
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">No projects found in this category.</div>
      )}

      {/* Bottom strip */}
      <div className="panel mt-9 flex flex-col items-center justify-between gap-4 rounded-lg px-6 py-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Github className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-mono text-[13px] text-muted-foreground">18+ public repositories</span>
        </div>
        <a
          href="https://github.com/vijaysinghpuwar"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px] font-medium"
        >
          View all on GitHub <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {/* Modal */}
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
              className="panel relative h-screen w-screen overflow-y-auto rounded-none p-6 sm:p-8 md:h-auto md:max-h-[85vh] md:w-full md:max-w-2xl md:rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute right-4 top-4 flex items-center gap-2">
                {hasDiff && (
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className={
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[11.5px] transition-colors ' +
                      (showDiff
                        ? 'border-primary bg-primary-bg text-primary'
                        : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground')
                    }
                  >
                    <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {showDiff ? 'Show details' : 'Show impact'}
                  </button>
                )}
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="meta-label">{normalizeCategory(selectedProject.category)}</div>
              <h3 className="mt-3 pr-24 text-[24px] font-semibold tracking-[-0.02em] text-foreground">
                {selectedProject.title}
              </h3>
              <div className="mt-2 font-mono text-[11.5px] text-muted-dim">
                {selectedProject.year} · {statusLabel(selectedProject.status)}
              </div>

              <div className="mt-6">
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
      </AnimatePresence>
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
 */
const FeaturedCard = forwardRef<HTMLDivElement, { project: Project; onClick: () => void }>(
  function FeaturedCard({ project, onClick }, ref) {
    const outcome = project.keyResults?.[0];

    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
        className="panel panel-hover flex cursor-pointer flex-col rounded-lg p-6"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="meta-label">{normalizeCategory(project.category)}</span>
          <span className="font-mono text-[10.5px] text-muted-dim">{project.year}</span>
        </div>

        <h3 className="mt-3 text-[21px] font-semibold tracking-[-0.02em] text-foreground">
          {project.title}
        </h3>

        <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.58] text-muted-foreground">
          {project.description}
        </p>

        {outcome && (
          <p className="mt-4 border-l-2 border-primary pl-3.5 text-[13.5px] leading-[1.5] text-foreground">
            {outcome}
          </p>
        )}

        <dl className="mt-4 border-t border-border">
          <MetaRow label="Stack" value={project.tech.slice(0, 4).join(' · ')} />
          <MetaRow label="Status" value={statusLabel(project.status)} />
        </dl>

        <div className="mt-4 flex items-center gap-5 text-[14px] font-medium">
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
              className="ml-auto text-muted-dim transition-colors hover:text-primary"
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
