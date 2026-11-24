import {
  emitFilterSkill,
  emitOpenProject,
  scrollToSection,
} from '@/lib/portfolio-events';

/**
 * The command set behind the hero terminal.
 *
 * Every command does something the visitor could otherwise only do by
 * scrolling and clicking. There are no jokes or fake shells here.
 *
 * The intro transcript types out `whoami`, `cat role.txt`, `ls defense/` and
 * `./connect.sh`, so those are the first four things a visitor tries. They all
 * resolve, including the last one, which for a long time did not: a shell that
 * prints a command in its own banner and then answers `command not found` to
 * it reads as broken.
 *
 * Output is structured, not pre-formatted. A command returns lines, key/value
 * rows and word lists, and the renderer lays them out with CSS. Rows used to
 * be padded to a 56-character budget with spaces, which is wider than the card
 * on any phone (about 38 characters), so every table scrolled sideways and a
 * truncated cell knocked the column after it out of line. Nothing here knows
 * how wide the terminal is, and nothing has to.
 */

export interface TerminalProject {
  id: string;
  title: string;
  year: string;
  category: string;
  tech: string[];
}

export interface CommandContext {
  projects: TerminalProject[];
  isAuthed: boolean;
  clear: () => void;
  /** Everything entered this session, oldest first. Survives `clear`. */
  history: string[];
  isPentest: boolean;
  setPentest: (on: boolean) => void;
  /** No Tab, arrows or Ctrl to advertise: the tap row stands in for them. */
  touch: boolean;
}

export type OutputTone = 'default' | 'muted' | 'accent' | 'success' | 'error';

/**
 * One printed line.
 *
 * - text: prose. Wraps to whatever width it is given.
 * - row:  a key, a value and an optional trailing note. Keys in one block
 *         share `keyWidth` (in characters) so the values line up; on a card
 *         too narrow for both, the value drops under its key instead of
 *         pushing the row sideways.
 * - list: short words set out in as many columns as fit, the way `ls` does.
 */
export type OutputLine =
  | { kind?: 'text'; text: string; tone?: OutputTone }
  | { kind: 'row'; cells: [string, string, string?]; keyWidth: number }
  | { kind: 'list'; items: string[] };

/**
 * What running one line produced.
 *
 * `silent` is how `clear` gets out of the way: it empties the log itself, so
 * the line that ran it must not be appended afterwards. The command says so
 * itself, and every alias of it inherits that.
 */
export interface CommandResult {
  output: OutputLine[];
  silent?: boolean;
}

export interface CommandSpec {
  name: string;
  /** Extra names that run this command but stay out of `help`. */
  aliases?: string[];
  /** Shown by `help`. */
  usage: string;
  summary: string;
  run: (args: string[], ctx: CommandContext) => OutputLine[] | CommandResult;
}

const muted = (text: string): OutputLine => ({ text, tone: 'muted' });
const plain = (text: string): OutputLine => ({ text });
const accent = (text: string): OutputLine => ({ text, tone: 'accent' });
const error = (text: string): OutputLine => ({ text, tone: 'error' });
const blank: OutputLine = { text: '' };
const list = (items: readonly string[]): OutputLine => ({ kind: 'list', items: [...items] });

/** A block of rows whose values start in the same column. */
function rows(data: [string, string, string?][]): OutputLine[] {
  // Capped: one very long key should break its own row, not push every other
  // value in the block across the card.
  const keyWidth = Math.min(24, Math.max(...data.map(r => r[0].length)));
  return data.map(cells => ({ kind: 'row', cells, keyWidth }));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * What a project is, without repeating what it is called. Titles are written
 * `Name: what it is`, and the id beside it already carries the name.
 */
const tagline = (title: string) => {
  const cut = title.indexOf(': ');
  return cut > 0 ? title.slice(cut + 2) : title;
};

/** Display names, so `skills aws` reports AWS rather than the typed string. */
const SKILL_LABELS: Record<string, string> = {
  python: 'Python', typescript: 'TypeScript', aws: 'AWS', docker: 'Docker',
  linux: 'Linux', cisco: 'Cisco', nmap: 'Nmap', powershell: 'PowerShell',
  fastapi: 'FastAPI', react: 'React / Next.js', jwt: 'JWT', oauth: 'OAuth 2.0',
};

const SKILL_ALIASES: Record<string, string[]> = {
  python: ['python'],
  typescript: ['typescript'],
  aws: ['aws', 'ec2', 'vpc'],
  docker: ['docker'],
  linux: ['linux', 'ubuntu', 'wsl'],
  cisco: ['cisco', 'packet tracer', 'pvst'],
  nmap: ['nmap'],
  powershell: ['powershell'],
  fastapi: ['fastapi'],
  react: ['react', 'next.js'],
  jwt: ['jwt', 'jose'],
  oauth: ['oauth', 'nextauth', 'auth.js'],
};

/* The two toolsets. The intro prints from this list and `ls defense/` answers
   from it, so the banner and the command cannot drift apart. */
export const TOOLSETS = {
  defense: [
    'SIEM-detection', 'Incident-Response', 'Endpoint-Hardening', 'Secure-Coding',
    'Active-Directory', 'IAM', 'MFA-GPO', 'Encryption-at-Rest', 'Firewalls', 'PowerShell',
  ],
  offense: [
    'Nmap', 'Wireshark', 'OWASP-Top-10', 'Vulnerability-Assessment', 'Session-JWT-Testing',
    'RBAC-Review', 'Privilege-Paths', 'TCP/IP', 'Python', 'Bash',
  ],
} as const;

export const MISSION =
  'I secure enterprise infrastructure, automate security operations, and build detection pipelines that catch threats before they escalate.';

/** The readable files, so `cat` and `ls` agree on what exists. */
const FILES: Record<string, (ctx: CommandContext) => OutputLine[]> = {
  'role.txt': () => [
    plain('Cybersecurity Engineer, New York, NY'),
    muted('M.S. Cybersecurity, Pace University'),
  ],
  'mission.txt': () => [plain(MISSION)],
  'skills.txt': ctx => [
    muted(ctx.isPentest ? 'offense/' : 'defense/'),
    list(ctx.isPentest ? TOOLSETS.offense : TOOLSETS.defense),
  ],
  'contact.txt': ctx => [
    plain('github.com/vijaysinghpuwar'),
    plain('linkedin.com/in/vijaysinghpuwar'),
    ctx.isAuthed ? plain('Email is shown in the contact section.')
                 : muted('Email is shown after sign-in. Run: contact'),
  ],
};

/** The page sections `ls` with no argument reports, and what each one jumps to. */
const SECTIONS = ['projects/', 'experience/', 'skills/', 'contact/'];

export const COMMANDS: CommandSpec[] = [
  {
    name: 'help',
    aliases: ['?', 'man', 'commands'],
    usage: 'help',
    summary: 'List these commands.',
    run: (_args, ctx) => [
      muted('Available commands'),
      ...rows(COMMANDS.map(c => [c.usage, c.summary])),
      blank,
      muted(
        ctx.touch
          ? 'Tap a shortcut below, or type a command.'
          : 'Tab completes · ↑↓ history · Ctrl+C cancel · Ctrl+L clear',
      ),
    ],
  },
  {
    name: 'whoami',
    aliases: ['about', 'id'],
    usage: 'whoami',
    summary: 'Who I am and what I do.',
    run: () => [
      plain('Vijaysingh Puwar, Cybersecurity Engineer, New York'),
      muted('IT Network Intern at the MTA, Jun to Aug 2026.'),
      muted('M.S. Cybersecurity at Pace (GPA 3.92).'),
      muted('Security+, CySA+, CCNA.'),
    ],
  },
  {
    name: 'ls',
    aliases: ['dir', 'll'],
    usage: 'ls [dir]',
    summary: 'List a section, or a toolset.',
    run: (args, ctx) => {
      const target = (args[0] ?? '').toLowerCase().replace(/^\.\//, '').replace(/\/+$/, '');

      if (!target || target === '.') {
        return [
          list([...SECTIONS, ...Object.keys(FILES)]),
          blank,
          muted('Try: ls defense/ · cat role.txt · projects'),
        ];
      }
      if (target === 'defense') return [list(TOOLSETS.defense)];
      if (target === 'offense') return [list(TOOLSETS.offense)];
      if (target === 'projects') {
        return [
          list(ctx.projects.slice(0, 12).map(p => p.id)),
          blank,
          muted(`${ctx.projects.length} total. Details with: projects`),
        ];
      }
      // The other three sections are listed by `ls`, so `ls skills/` has to be
      // an answer rather than "no such directory".
      const section = SECTIONS.find(s => s.replace('/', '') === target);
      if (section) return [muted(`${section} is a section of this page. Jump to it with: ${target}`)];

      const hit = BY_NAME.get(target);
      if (hit) return [muted(`${target} is a command, not a directory. Run: ${hit.name}`)];
      return [error(`ls: ${args[0]}: no such directory`), muted('Run ls for what is here.')];
    },
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    summary: 'Print role, mission or skills.',
    run: (args, ctx) => {
      const name = (args[0] ?? '').toLowerCase().replace(/^\.\//, '');
      const files = muted(`Files: ${Object.keys(FILES).join('  ')}`);
      if (!name) return [error('Usage: cat <file>'), files];
      // `cat role` is what people actually type; only the site has extensions.
      const file = FILES[name] ?? FILES[`${name}.txt`];
      if (!file) return [error(`cat: ${args[0]}: no such file`), files];
      return file(ctx);
    },
  },
  {
    name: 'projects',
    aliases: ['work', 'ps'],
    usage: 'projects [filter]',
    summary: 'List shipped projects.',
    run: (args, ctx) => {
      const q = args.join(' ').toLowerCase();
      const matches = q
        ? ctx.projects.filter(p =>
            `${p.id} ${p.title} ${p.category} ${p.tech.join(' ')}`.toLowerCase().includes(q),
          )
        : ctx.projects;

      if (!matches.length) {
        return [error(`No project matches "${q}".`), muted('Run projects for all of them.')];
      }

      const shown = matches.slice(0, 8);
      return [
        muted(`${plural(matches.length, 'project')}${q ? ` matching "${q}"` : ''}`),
        ...rows(shown.map(p => [p.id, tagline(p.title)])),
        ...(matches.length > shown.length
          ? [muted(`and ${matches.length - shown.length} more. Narrow it with: projects <filter>`)]
          : []),
        blank,
        muted('Open one with: open <id>'),
      ];
    },
  },
  {
    name: 'open',
    aliases: ['cd'],
    usage: 'open <id>',
    summary: 'Open a project and jump to it.',
    run: (args, ctx) => {
      const q = args.join(' ').trim();
      if (!q) return [error('Usage: open <id>'), muted('Run projects for the ids.')];

      const needle = q.toLowerCase();
      const hit =
        ctx.projects.find(p => p.id.toLowerCase() === needle) ??
        ctx.projects.find(p => p.id.toLowerCase().includes(needle)) ??
        ctx.projects.find(p => p.title.toLowerCase().includes(needle));

      if (!hit) {
        // A miss is nearly always a half-remembered id, so answer with the
        // closest ones rather than sending the reader back to a list of 30.
        const near = ctx.projects
          .filter(p => needle.split('').every(ch => p.id.includes(ch)))
          .slice(0, 3)
          .map(p => p.id);
        return [
          error(`No project matches "${q}".`),
          muted(near.length ? `Did you mean: ${near.join('  ')}` : 'Run projects for the list.'),
        ];
      }

      emitOpenProject({ query: hit.id });
      return [accent(`Opening ${hit.title}`)];
    },
  },
  {
    name: 'skills',
    usage: 'skills [tech]',
    summary: 'What I use, or filter the work.',
    run: (args, ctx) => {
      const q = args.join(' ').toLowerCase().trim();
      const uses = (aliases: string[]) =>
        ctx.projects.filter(p =>
          p.tech.some(t => aliases.some(a => t.toLowerCase().includes(a))),
        ).length;

      if (!q) {
        const counts = Object.entries(SKILL_ALIASES)
          .map(([name, aliases]) => ({ name: SKILL_LABELS[name] ?? name, n: uses(aliases) }))
          .filter(s => s.n > 0)
          .sort((a, b) => b.n - a.n);

        return [
          muted('Used across shipped projects'),
          ...rows(counts.map(s => [s.name, plural(s.n, 'project')])),
          blank,
          muted('Filter the work with: skills <tech>'),
        ];
      }

      const aliases = SKILL_ALIASES[q] ?? [q];
      const label = SKILL_LABELS[q] ?? q;
      const n = uses(aliases);

      if (!n) return [error(`Nothing here uses "${q}".`), muted('Run skills for the list.')];

      emitFilterSkill({ label, aliases });
      return [accent(`${plural(n, 'project')} ${n === 1 ? 'uses' : 'use'} ${label}. Filtering below.`)];
    },
  },
  {
    name: 'experience',
    aliases: ['exp', 'cv', 'journey'],
    usage: 'experience',
    summary: 'Jump to roles and education.',
    run: () => {
      scrollToSection('experience');
      return [accent('Experience and education')];
    },
  },
  {
    name: 'resume',
    usage: 'resume',
    summary: 'Download my resume.',
    // The PDF is a public file and the button under this prompt downloads it
    // without an account. This command used to send the same visitor to
    // sign-in for it.
    run: () => {
      const a = document.createElement('a');
      a.href = '/resume.pdf';
      a.download = '';
      a.click();
      return [{ text: 'Downloading resume.pdf', tone: 'success' }];
    },
  },
  {
    name: 'contact',
    // `./connect.sh` is the last line of the banner, so it is the command a
    // visitor is most likely to copy. It runs this.
    aliases: ['./connect.sh', 'connect.sh', 'connect', 'email'],
    usage: 'contact',
    summary: 'How to reach me.',
    run: (_args, ctx) => {
      scrollToSection('contact');
      return ctx.isAuthed
        ? [accent('Contact'), muted('Email, GitHub and LinkedIn are below.')]
        : [accent('Contact'), muted('GitHub and LinkedIn are open. Email is shown after sign-in.')];
    },
  },
  {
    name: 'theme',
    aliases: ['mode'],
    usage: 'theme [mode]',
    summary: 'Switch defense / offense.',
    run: (args, ctx) => {
      const want = (args[0] ?? '').toLowerCase();
      const current = ctx.isPentest ? 'offense' : 'defense';

      if (!want) {
        return [
          plain(`mode: ${current}`),
          muted('Switch with: theme offense · theme defense'),
        ];
      }
      const on = ['offense', 'pentest', 'red', 'attack'].includes(want);
      const off = ['defense', 'defence', 'security', 'blue', 'default'].includes(want);
      if (!on && !off) {
        return [error(`theme: unknown mode "${args[0]}"`), muted('Modes: defense  offense')];
      }
      if ((on && ctx.isPentest) || (off && !ctx.isPentest)) {
        return [muted(`Already in ${current} mode.`)];
      }
      ctx.setPentest(on);
      return [accent(`Switching to ${on ? 'offense' : 'defense'} mode`)];
    },
  },
  {
    name: 'history',
    usage: 'history',
    summary: 'Commands run this session.',
    run: (_args, ctx) => {
      // The line running `history` is not in it yet, which is what a real shell
      // shows too. The entry is written when the command returns.
      if (!ctx.history.length) return [muted('No commands yet.')];
      return rows(ctx.history.map((h, i) => [String(i + 1), h]));
    },
  },
  {
    name: 'clear',
    aliases: ['cls', 'reset'],
    usage: 'clear',
    summary: 'Clear the screen.',
    run: (_args, ctx) => {
      ctx.clear();
      return { output: [], silent: true };
    },
  },
];

const BY_NAME = new Map<string, CommandSpec>();
for (const cmd of COMMANDS) {
  BY_NAME.set(cmd.name, cmd);
  for (const alias of cmd.aliases ?? []) BY_NAME.set(alias, cmd);
}

/** Edit distance, only ever used to rank a handful of short names. */
function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let corner = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const carry = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        corner + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      corner = carry;
    }
  }
  return prev[b.length];
}

/** The closest command name to a typo, or null if nothing is close enough. */
function suggest(name: string): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const cmd of COMMANDS) {
    const d = distance(name, cmd.name);
    if (d < bestScore) { bestScore = d; best = cmd.name; }
  }
  // Two edits on a short name is already a different word.
  return best && bestScore <= Math.max(1, Math.floor(name.length / 3) + 1) ? best : null;
}

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { output: [] };

  const cmd = BY_NAME.get(name.toLowerCase());
  if (!cmd) {
    const near = suggest(name.toLowerCase());
    return {
      output: [
        error(`command not found: ${name}`),
        muted(near ? `Did you mean "${near}"? Run help for the list.` : 'Run help for the list.'),
      ],
    };
  }

  try {
    const result = cmd.run(args, ctx);
    return Array.isArray(result) ? { output: result } : result;
  } catch (err) {
    // A command that throws costs one red line; the shell is still there
    // afterwards.
    if (import.meta.env.DEV) console.error(`terminal: ${cmd.name} failed`, err);
    return { output: [error(`${cmd.name}: command failed`), muted('Run help for the list.')] };
  }
}

export interface Completion {
  /** The draft with the unambiguous part filled in. */
  value: string;
  /** Everything still matching, when more than one thing does. */
  candidates: string[];
}

/** The longest prefix every candidate shares, which is what Tab fills in. */
function commonPrefix(items: string[]): string {
  if (!items.length) return '';
  let prefix = items[0];
  for (const item of items.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < item.length && prefix[i] === item[i]) i++;
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

/**
 * Completions for Tab.
 *
 * A single match is filled in and a space added. Several matches fill in as far
 * as they agree and hand back the list to print, which is what bash does.
 */
export function complete(input: string, projects: TerminalProject[]): Completion | null {
  // Only the visible command names complete; aliases exist to be forgiving
  // about what is typed, not to double the length of every candidate list.
  const parts = input.trimStart().split(/\s+/);
  const head = parts[0].toLowerCase();

  if (parts.length <= 1) {
    const hits = COMMANDS.map(c => c.name).filter(n => n.startsWith(head));
    if (!hits.length) return null;
    if (hits.length === 1) return { value: hits[0] + ' ', candidates: [] };
    return { value: commonPrefix(hits), candidates: hits };
  }

  const cmd = BY_NAME.get(head);
  const partial = parts.slice(1).join(' ').toLowerCase();
  const pool =
    cmd?.name === 'open' ? projects.map(p => p.id)
      : cmd?.name === 'skills' ? Object.keys(SKILL_ALIASES)
      : cmd?.name === 'cat' ? Object.keys(FILES)
      : cmd?.name === 'ls' ? ['defense/', 'offense/', 'projects/']
      : cmd?.name === 'theme' ? ['defense', 'offense']
      : null;

  if (!pool) return null;
  const hits = pool.filter(id => id.startsWith(partial));
  if (!hits.length) return null;
  if (hits.length === 1) return { value: `${parts[0]} ${hits[0]}`, candidates: [] };
  return { value: `${parts[0]} ${commonPrefix(hits)}`, candidates: hits };
}
