import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, X, ExternalLink, Shield, ArrowRight, Columns2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

const categoryColors: Record<string, string> = {
  'Security Automation': 'from-red-500 to-orange-500',
  'Cloud Security': 'from-blue-500 to-cyan-500',
  'Network Security': 'from-green-500 to-emerald-500',
  'Application Security': 'from-purple-500 to-pink-500',
  'Application Development': 'from-amber-500 to-yellow-500',
  'Research': 'from-indigo-500 to-violet-500',
  'Automation': 'from-orange-500 to-red-500',
  'Python Tools': 'from-yellow-500 to-amber-500',
};

const enrichedData: Record<string, { description: string; features: string[] }> = {
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

const filterCategories = [
  'All', 'Security Automation', 'Cloud Security', 'Network Security',
  'Application Security', 'Research', 'Automation', 'Application Development',
];

const featuredIds = new Set([
  'win-dev-sec-bootstrap', 'automating-infosec', 'aws-cloud-security',
  'cs601c-capstone', 'secure-ubuntu-fleet', 'http-hardening-nmap-nse',
]);

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter || (activeFilter === 'Application Security' && p.category === 'Python Tools'));

  const featured = filtered.filter(p => featuredIds.has(p.id));
  const secondary = filtered.filter(p => !featuredIds.has(p.id));

  const closeModal = useCallback(() => setSelectedProject(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    if (selectedProject) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedProject, closeModal]);

  const getGradient = (category: string) => categoryColors[category] || 'from-primary to-primary';
  const getEnriched = (id: string) => enrichedData[id];

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {filterCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === cat
                ? 'gradient-btn'
                : 'glass-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {featured.map(project => (
              <ProjectCard key={project.id} project={project} gradient={getGradient(project.category)}
                onClick={() => setSelectedProject(project)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Secondary Projects */}
      {secondary.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <AnimatePresence mode="popLayout">
            {secondary.map(project => (
              <ProjectCardCompact key={project.id} project={project} gradient={getGradient(project.category)}
                onClick={() => setSelectedProject(project)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No projects found in this category.</div>
      )}

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 py-5 mt-4 rounded-lg glass-card"
      >
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm text-muted-foreground">18+ public repositories</span>
        </div>
        <a
          href="https://github.com/vijaysinghpuwar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium gradient-btn"
        >
          View All on GitHub <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              layoutId={`card-${selectedProject.id}`}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl glass-card border border-border/60 p-6 sm:p-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={closeModal}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>

              {/* Gradient accent */}
              <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${getGradient(selectedProject.category)} mb-6`} />

              <h3 className="text-2xl font-bold text-foreground mb-3">{selectedProject.title}</h3>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs text-primary border-primary/20">
                  {selectedProject.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedProject.year}</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {getEnriched(selectedProject.id)?.description || selectedProject.description}
              </p>

              {/* Tech */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedProject.tech.map(t => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full glass-card text-foreground border border-border/40">
                    {t}
                  </span>
                ))}
              </div>

              {/* Features */}
              {getEnriched(selectedProject.id)?.features && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Key Features</h4>
                  <ul className="space-y-1.5">
                    {getEnriched(selectedProject.id)!.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.links.github && (
                <a
                  href={selectedProject.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium gradient-btn"
                >
                  <Github className="w-4 h-4" /> View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Card Components ── */

function ProjectCard({ project, gradient, onClick }: { project: Project; gradient: string; onClick: () => void }) {
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="group cursor-pointer rounded-lg glass-card border border-border/30 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.12)] flex flex-col overflow-hidden"
    >
      {/* Top accent */}
      <div className={`h-0.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-5 flex flex-col flex-1 relative">
        {/* GitHub link */}
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-4 right-4 text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
            {project.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{project.year}</span>
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors pr-8">
          {project.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-1 mb-3 flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {project.tech.slice(0, 4).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full glass-card text-muted-foreground">
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full glass-card text-muted-foreground">
              +{project.tech.length - 4}
            </span>
          )}
        </div>

        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          View Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

function ProjectCardCompact({ project, gradient, onClick }: { project: Project; gradient: string; onClick: () => void }) {
  return (
    <motion.div
      layoutId={`card-${project.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="group cursor-pointer rounded-lg glass-card border border-border/30 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.08)] overflow-hidden"
    >
      <div className={`h-0.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
            {project.category}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{project.year}</span>
        </div>
        <h3 className="font-semibold text-foreground text-xs mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {project.tech.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full glass-card text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
