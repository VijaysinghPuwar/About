import { useMemo } from 'react';

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

const GROUPS: { key: string; label: string; blurb: string; skills: Skill[] }[] = [
  {
    key: 'secops',
    label: 'Security Operations',
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {GROUPS.map(group => {
        return (
          <div key={group.key} className="panel flex flex-col rounded-lg p-[22px]">
            <div className="flex items-center gap-2.5">
              {/* One mark for all five groups. Five different lucide glyphs
                  implied five different kinds of thing; they are all just
                  groupings of skills. */}
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true" className="shrink-0">
                <path
                  d="M7 .9 L13 4.4 L13 11.6 L7 15.1 L1 11.6 L1 4.4 Z"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-foreground">{group.label}</h3>
            </div>
            <p className="mt-2 text-[13.5px] text-muted-dim">{group.blurb}</p>

            <ul className="mt-4 flex flex-wrap gap-[7px]">
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
                        'inline-flex items-center gap-[7px] rounded-md border px-2.5 py-1.5 text-[12.5px] leading-[1.3] transition-colors',
                        isActive
                          ? 'border-primary bg-primary-bg text-primary'
                          : clickable
                            ? 'cursor-pointer border-border bg-card-elevated text-muted-foreground hover:border-border-strong hover:text-foreground'
                            : 'cursor-default border-border text-muted-dim',
                      ].join(' ')}
                    >
                      {skill.label}
                      {n > 0 && (
                        <span
                          className="font-mono text-[11px] tabular-nums text-primary"
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
          </div>
        );
      })}
    </div>
  );
}
