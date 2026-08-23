import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Cloud, Network, Terminal, ArrowRight } from 'lucide-react';

/**
 * Skills as evidence, not self-assessment.
 *
 * The previous version was a radar chart of hand-written proficiency scores
 * (Identity 90, Automation 85, ...). Numbers nobody can verify tell a recruiter
 * nothing, and the animated SVG cost more to render than it returned. Here each
 * skill instead carries the number of shipped projects that actually use it,
 * counted from the project data, and clicking one filters the work below to
 * exactly those projects. A skill with no project behind it still appears —
 * it just doesn't claim a number.
 */

interface SkillMatrixProps {
  projects: { tech: string[] }[];
  /** Filters the projects section to the clicked skill. */
  onSelectSkill: (aliases: string[], label: string) => void;
  activeSkill: string | null;
}

interface Skill {
  /** Shown to the reader. */
  label: string;
  /** Tech strings that count as this skill. Matched case-insensitively as a
   *  substring, which absorbs the "Next.js" / "Next.js 16" style drift in the
   *  project data without needing the source rows cleaned up first. */
  match?: string[];
}

const GROUPS: { key: string; label: string; icon: typeof Shield; blurb: string; skills: Skill[] }[] = [
  {
    key: 'secops',
    label: 'Security Operations',
    icon: Shield,
    blurb: 'Detection, triage, and response on enterprise systems.',
    skills: [
      { label: 'SIEM / Splunk', match: ['splunk', 'siem'] },
      { label: 'Detection Engineering' },
      { label: 'Incident Response' },
      { label: 'Vulnerability Assessment', match: ['nmap', 'nse'] },
      { label: 'IDS / IPS' },
      { label: 'Endpoint Hardening', match: ['hardening', 'iptables', 'ufw'] },
      { label: 'OWASP', match: ['owasp'] },
    ],
  },
  {
    key: 'identity',
    label: 'Identity & Access',
    icon: KeyRound,
    blurb: 'Who gets in, to what, and with how little privilege.',
    skills: [
      { label: 'Active Directory', match: ['active directory', 'ldap'] },
      { label: 'IAM', match: ['iam'] },
      { label: 'OAuth 2.0 / OIDC', match: ['oauth', 'nextauth', 'auth.js'] },
      { label: 'JWT & Session Security', match: ['jwt', 'jose'] },
      { label: 'MFA & GPO' },
      { label: 'RBAC', match: ['rbac'] },
      { label: 'Encryption at Rest', match: ['fernet', 'aes', 'cryptography'] },
    ],
  },
  {
    key: 'cloud',
    label: 'Cloud & Infrastructure',
    icon: Cloud,
    blurb: 'Running and securing workloads in cloud and on Windows/Linux.',
    skills: [
      { label: 'AWS', match: ['aws', 'ec2', 'vpc'] },
      { label: 'Google Cloud Run', match: ['cloud run', 'gcp'] },
      { label: 'Docker', match: ['docker'] },
      { label: 'Kubernetes', match: ['kubernetes', 'k8s'] },
      { label: 'Linux', match: ['linux', 'ubuntu', 'wsl'] },
      { label: 'Windows Administration', match: ['windows'] },
      { label: 'ServiceNow' },
    ],
  },
  {
    key: 'network',
    label: 'Networking',
    icon: Network,
    blurb: 'Enterprise routing, segmentation, and traffic analysis.',
    skills: [
      { label: 'TCP/IP', match: ['tcp'] },
      { label: 'Cisco Routing & Switching', match: ['cisco', 'packet tracer', 'pvst'] },
      { label: 'VLANs & Segmentation', match: ['vlan', 'subnet'] },
      { label: 'Firewalls', match: ['firewall', 'iptables', 'nat'] },
      { label: 'Wireshark', match: ['wireshark'] },
      { label: 'Nmap', match: ['nmap'] },
    ],
  },
  {
    key: 'build',
    label: 'Automation & Engineering',
    icon: Terminal,
    blurb: 'The code behind the tooling and the platforms I ship.',
    skills: [
      { label: 'Python', match: ['python'] },
      { label: 'PowerShell', match: ['powershell'] },
      { label: 'Bash / Shell', match: ['bash', 'shell'] },
      { label: 'Ansible', match: ['ansible'] },
      { label: 'FastAPI', match: ['fastapi'] },
      { label: 'TypeScript', match: ['typescript'] },
      { label: 'React / Next.js', match: ['react', 'next.js'] },
      { label: 'SQL & NoSQL', match: ['postgres', 'mongodb', 'sqlalchemy', 'redis'] },
    ],
  },
];

export function SkillMatrix({ projects, onSelectSkill, activeSkill }: SkillMatrixProps) {
  // Evidence counts come from the real project rows, so they cannot drift away
  // from the work on display.
  const counts = useMemo(() => {
    const tech = projects.map(p => (p.tech || []).map(t => t.toLowerCase()));
    const out = new Map<string, number>();
    for (const group of GROUPS) {
      for (const skill of group.skills) {
        if (!skill.match) continue;
        const n = tech.filter(list =>
          list.some(t => skill.match!.some(m => t.includes(m))),
        ).length;
        if (n > 0) out.set(skill.label, n);
      }
    }
    return out;
  }, [projects]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {GROUPS.map((group, gi) => {
        const Icon = group.icon;
        return (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: Math.min(gi * 0.06, 0.24) }}
            className="glass-card rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <h3 className="font-semibold text-foreground text-sm">{group.label}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{group.blurb}</p>

            <ul className="flex flex-wrap gap-1.5">
              {group.skills.map(skill => {
                const n = counts.get(skill.label) ?? 0;
                const isActive = activeSkill === skill.label;
                const clickable = n > 0;
                return (
                  <li key={skill.label}>
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && onSelectSkill(skill.match!, skill.label)}
                      aria-pressed={isActive}
                      title={
                        clickable
                          ? `Show the ${n} project${n === 1 ? '' : 's'} using ${skill.label}`
                          : undefined
                      }
                      className={[
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors',
                        isActive
                          ? 'border-primary/60 bg-primary/10 text-foreground'
                          : clickable
                            ? 'border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer'
                            : 'border-border/30 text-muted-foreground/70 cursor-default',
                      ].join(' ')}
                    >
                      {skill.label}
                      {n > 0 && (
                        <span
                          className="font-mono text-[10px] text-primary tabular-nums"
                          aria-label={`${n} project${n === 1 ? '' : 's'}`}
                        >
                          {n}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}

      {/* Reading key: the number is the only claim being made, so say what it means. */}
      <div className="md:col-span-2 xl:col-span-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
          The number on a skill is how many projects below actually use it.
          Select one to filter the work.
          <ArrowRight className="inline w-3 h-3 ml-1 -mt-0.5" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
