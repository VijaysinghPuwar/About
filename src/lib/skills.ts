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
   *  project data without needing the source rows cleaned up first.
   *
   *  An alias written with a leading `=` has to match a whole word instead.
   *  Short names need it: as substrings, `go` is in "Google" and "MongoDB",
   *  `java` is in "JavaScript" and `rust` is in anything with "trust" in it. */
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
      { label: 'Azure' },
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
      { label: 'OSPF & BGP', match: ['ospf', 'bgp'] },
      { label: 'VLANs & Segmentation', match: ['vlan', 'subnet'] },
      { label: 'Firewalls', match: ['firewall', 'iptables', 'nat'] },
      { label: 'Wireshark', match: ['wireshark'] },
      { label: 'Nmap', match: ['nmap'] },
    ],
  },
  {
    key: 'automation',
    label: 'Automation',
    skills: [
      { label: 'Python', match: ['python'] },
      { label: 'PowerShell', match: ['powershell'] },
      { label: 'Bash / Shell', match: ['bash', 'shell'] },
      { label: 'Terraform', match: ['terraform'] },
      { label: 'CI/CD', match: ['github actions', 'gitlab ci'] },
    ],
  },
  /* The languages and frameworks the work is written in. This group did not
     exist: TypeScript, React and FastAPI sat under "Automation & Engineering",
     and Go, Rust, C# and Java were not on the page at all, though four of the
     projects below are built in them and the résumé's first skills line names
     them. They count projects like every other skill here. */
  {
    key: 'software',
    label: 'Software Engineering',
    skills: [
      { label: 'TypeScript', match: ['typescript'] },
      { label: 'React / Next.js', match: ['react', 'next.js'] },
      { label: 'Rust', match: ['=rust', 'tauri'] },
      { label: 'Go', match: ['=go'] },
      { label: 'C# / .NET', match: ['c#', '.net'] },
      { label: 'Java / Spring Boot', match: ['=java', 'spring'] },
      { label: 'FastAPI', match: ['fastapi'] },
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

/** One alias against one tech string; see `Skill.match` for the `=` form. */
function matchesAlias(tech: string, alias: string): boolean {
  if (!alias.startsWith('=')) return tech.includes(alias);
  const word = alias.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(tech);
}

/**
 * True when any of a project's tech strings matches one of the aliases.
 *
 * Everything that asks "does this project use that skill" comes through here:
 * the skills section, the command palette, the terminal's `skills` command and
 * the filter on the projects section. The last two each had a copy of the
 * substring test, so a rule added here would not have reached them.
 */
export function usesSkill(tech: readonly string[] | null | undefined, aliases: readonly string[]): boolean {
  return (tech || []).some(t => {
    const lower = t.toLowerCase();
    return aliases.some(a => matchesAlias(lower, a));
  });
}

/** Distinct projects that use the skill: a project listing "Python" twice counts once. */
export function countProjectsUsing(projects: readonly { tech: string[] }[], aliases: readonly string[]): number {
  return projects.filter(p => usesSkill(p.tech, aliases)).length;
}
