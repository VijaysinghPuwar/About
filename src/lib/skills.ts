/**
 * The skill catalogue shared by the skills section and the command palette.
 *
 * Both used to count "projects using Python" their own way: the section counted
 * distinct projects through these aliases, the palette counted raw tech strings
 * with no aliases, so the same skill showed 9 in one place and 10 in the other.
 * There is now one definition and one counter.
 */

export interface Skill {
  /** Shown to the reader. */
  label: string;
  /** Tech strings that count as this skill. Matched case-insensitively as a
   *  substring, which absorbs the "Next.js" / "Next.js 16" style drift in the
   *  project data without needing the source rows cleaned up first. */
  match?: string[];
}

export const SKILL_GROUPS: { key: string; label: string; skills: Skill[] }[] = [
  {
    key: 'secops',
    label: 'Security Operations',
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
    skills: [
      { label: 'AWS', match: ['aws', 'ec2', 'vpc'] },
      { label: 'Google Cloud Run', match: ['cloud run', 'gcp'] },
      { label: 'Docker', match: ['docker'] },
      { label: 'Linux', match: ['linux', 'ubuntu', 'wsl'] },
      { label: 'Windows Administration', match: ['windows'] },
      { label: 'ServiceNow' },
    ],
  },
  {
    key: 'network',
    label: 'Networking',
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

/** Looks a skill up by its label across every group. */
export function findSkill(label: string): Skill | undefined {
  for (const group of SKILL_GROUPS) {
    const hit = group.skills.find(s => s.label === label);
    if (hit) return hit;
  }
  return undefined;
}

/** True when any of a project's tech strings matches one of the aliases. */
export function usesSkill(tech: readonly string[] | null | undefined, aliases: readonly string[]): boolean {
  return (tech || []).some(t => {
    const lower = t.toLowerCase();
    return aliases.some(a => lower.includes(a));
  });
}

/** Distinct projects that use the skill: a project listing "Python" twice counts once. */
export function countProjectsUsing(projects: readonly { tech: string[] }[], aliases: readonly string[]): number {
  return projects.filter(p => usesSkill(p.tech, aliases)).length;
}
