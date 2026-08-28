import {
  emitFilterSkill,
  emitOpenProject,
  scrollToSection,
} from '@/lib/portfolio-events';

/**
 * The command set behind the hero terminal.
 *
 * Every command does something the visitor could otherwise only do by
 * scrolling and clicking — there are no jokes or fake shells here. Commands
 * that would need an account say so rather than pretending to work.
 *
 * The intro transcript types out `whoami`, `cat role.txt`, `ls defense/` and
 * `./connect.sh`, so those are the first four things a visitor tries. They all
 * work. A shell that demonstrates a command in its own banner and then answers
 * `command not found` reads as broken, which is most of what "the terminal
 * feels unstable" turned out to mean.
 *
 * Output is laid out in fixed columns and is never re-wrapped by the renderer,
 * so every row here has to fit the narrowest card the terminal is drawn in.
 * `COLUMNS` is that budget; keep new rows inside it.
 */

/** Characters a row may use before the log has to scroll sideways. */
const COLUMNS = 56;

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
  /** Sends the visitor to sign-in, preserving where they were. */
  goToLogin: () => void;
  clear: () => void;
  /** Everything entered this session, oldest first. Survives `clear`. */
  history: string[];
  isPentest: boolean;
  setPentest: (on: boolean) => void;
}

export type OutputTone = 'default' | 'muted' | 'accent' | 'success' | 'error';

export interface OutputLine {
  text: string;
  tone?: OutputTone;
}

/**
 * What running one line produced.
 *
 * `silent` is how `clear` gets out of the way: it empties the log itself, so
 * the line that ran it must not be appended afterwards. Reading that off the
 * raw input meant `clear` worked and `clear all` left a stray prompt behind —
 * the command now says so itself, and every alias of it inherits that.
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

/**
 * Pads to a column width without pulling in a dependency, and marks anything it
 * had to cut — a title that simply stops mid-word reads as a rendering fault
 * rather than as a column doing its job.
 */
const pad = (text: string, width: number) =>
  text.length >= width
    ? text.slice(0, width - 2).trimEnd() + '\u2026 '
    : text + ' '.repeat(width - text.length);

/** Wraps prose to the column budget so paragraphs never need a sideways scroll. */
function wrap(text: string, width = COLUMNS, indent = ''): OutputLine[] {
  const room = width - indent.length;
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (!line.length) line = word;
    else if (line.length + 1 + word.length <= room) line += ' ' + word;
    else { out.push(line); line = word; }
  }
  if (line) out.push(line);
  return out.map(l => plain(indent + l));
}

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

/* The two toolsets the intro lists, kept here so `ls defense/` answers with
   exactly what the banner printed rather than a second copy that can drift. */
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

/** The readable files, so `cat` and `ls` agree on what exists. */
const FILES: Record<string, (ctx: CommandContext) => OutputLine[]> = {
  'role.txt': () => [
    plain('Cybersecurity Engineer — New York, NY'),
    muted('IT Emerging Talent Intern, MTA (Staten Island Railway)'),
  ],
  'mission.txt': () =>
    wrap('I secure enterprise infrastructure, automate security operations, and build detection pipelines that catch threats before they escalate.'),
  'skills.txt': ctx => [
    muted(ctx.isPentest ? 'offense/' : 'defense/'),
    ...columns([...(ctx.isPentest ? TOOLSETS.offense : TOOLSETS.defense)]),
  ],
  'contact.txt': ctx => [
    plain('github.com/vijaysinghpuwar'),
    plain('linkedin.com/in/vijaysinghpuwar'),
    ctx.isAuthed ? plain('Email unlocked — see the contact section')
                 : muted('Email unlocks after sign-in. Run: contact'),
  ],
};

/** Lays a word list out across the column budget, the way `ls` does. */
function columns(items: string[]): OutputLine[] {
  const width = Math.max(...items.map(i => i.length)) + 2;
  const perRow = Math.max(1, Math.floor(COLUMNS / width));
  const rows: OutputLine[] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(plain(items.slice(i, i + perRow).map(t => pad(t, width)).join('').trimEnd()));
  }
  return rows;
}

/** The page sections `ls` with no argument reports, and what each one jumps to. */
const SECTIONS = ['projects/', 'experience/', 'skills/', 'contact/'];

export const COMMANDS: CommandSpec[] = [
  {
    name: 'help',
    aliases: ['?', 'man', 'commands'],
    usage: 'help',
    summary: 'List these commands.',
    run: () => [
      muted('Available commands:'),
      ...COMMANDS.map(c => plain(`  ${pad(c.usage, 20)}${c.summary}`)),
      muted(''),
      muted('Tab completes  ↑↓ history  Ctrl+C cancel  Ctrl+L clear'),
    ],
  },
  {
    name: 'whoami',
    aliases: ['about', 'id'],
    usage: 'whoami',
    summary: 'Who I am and what I do.',
    run: () => [
      plain('Vijaysingh Puwar — Cybersecurity Engineer, New York'),
      muted('IT Emerging Talent Intern at the MTA.'),
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
      const target = (args[0] ?? '').toLowerCase().replace(/\/+$/, '');

      if (!target) {
        return [
          ...columns([...SECTIONS, ...Object.keys(FILES)]),
          muted(''),
          muted('Try: ls defense/   cat role.txt   projects'),
        ];
      }
      if (target === 'defense') return columns([...TOOLSETS.defense]);
      if (target === 'offense') return columns([...TOOLSETS.offense]);
      if (target === 'projects') {
        return [
          ...columns(ctx.projects.slice(0, 12).map(p => p.id)),
          muted(''),
          muted(`${ctx.projects.length} total. Details with: projects`),
        ];
      }
      const hit = COMMANDS.find(c => c.name === target);
      if (hit) return [muted(`${target} is a command, not a directory. Run: ${target}`)];
      return [error(`ls: ${args[0]}: no such directory`), muted('Run ls for what is here.')];
    },
  },
  {
    name: 'cat',
    usage: 'cat <file>',
    summary: 'Print role, mission or skills.',
    run: (args, ctx) => {
      const name = (args[0] ?? '').toLowerCase();
      if (!name) return [error('Usage: cat <file>'), muted(`Files: ${Object.keys(FILES).join('  ')}`)];
      // `cat role` is what people actually type; only the site has extensions.
      const key = FILES[name] ? name : `${name}.txt`;
      const file = FILES[key];
      if (!file) {
        return [error(`cat: ${args[0]}: no such file`), muted(`Files: ${Object.keys(FILES).join('  ')}`)];
      }
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
        muted(`${matches.length} project${matches.length === 1 ? '' : 's'}${q ? ` matching "${q}"` : ''}:`),
        ...shown.map(p => plain(`  ${pad(p.id, 22)}${pad(p.title, 27)}${p.year}`)),
        ...(matches.length > shown.length
          ? [muted(`  ...and ${matches.length - shown.length} more — projects <filter>`)]
          : []),
        muted(''),
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
      if (!q) return [error('Usage: open <id>   (try: projects)')];

      const needle = q.toLowerCase();
      const hit =
        ctx.projects.find(p => p.id.toLowerCase() === needle) ??
        ctx.projects.find(p => p.id.toLowerCase().includes(needle)) ??
        ctx.projects.find(p => p.title.toLowerCase().includes(needle));

      if (!hit) {
        // A miss is nearly always a half-remembered id, so answer with the
        // closest ones rather than sending the reader back to a list of 25.
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

      if (!q) {
        const counts = Object.entries(SKILL_ALIASES)
          .map(([name, aliases]) => {
            const n = ctx.projects.filter(p =>
              p.tech.some(t => aliases.some(a => t.toLowerCase().includes(a))),
            ).length;
            return { name: SKILL_LABELS[name] ?? name, n };
          })
          .filter(s => s.n > 0)
          .sort((a, b) => b.n - a.n);

        return [
          muted('Used across shipped projects:'),
          ...counts.map(s => plain(`  ${pad(s.name, 16)}${s.n} project${s.n === 1 ? '' : 's'}`)),
          muted(''),
          muted('Filter the work with: skills <tech>'),
        ];
      }

      const aliases = SKILL_ALIASES[q] ?? [q];
      const label = SKILL_LABELS[q] ?? q;
      const n = ctx.projects.filter(p =>
        p.tech.some(t => aliases.some(a => t.toLowerCase().includes(a))),
      ).length;

      if (!n) return [error(`Nothing here uses "${q}". Run skills for the list.`)];

      emitFilterSkill({ label, aliases });
      return [accent(`${n} project${n === 1 ? '' : 's'} use ${label} — filtering below`)];
    },
  },
  {
    name: 'experience',
    aliases: ['exp', 'cv'],
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
    run: (_args, ctx) => {
      if (!ctx.isAuthed) {
        ctx.goToLogin();
        return [muted('The resume is gated. Sending you to sign-in.')];
      }
      const a = document.createElement('a');
      a.href = '/resume.pdf';
      a.download = '';
      a.click();
      return [{ text: 'Downloading resume.pdf', tone: 'success' }];
    },
  },
  {
    name: 'contact',
    usage: 'contact',
    summary: 'How to reach me.',
    run: (_args, ctx) => {
      scrollToSection('contact');
      return ctx.isAuthed
        ? [accent('Contact — email is unlocked below')]
        : [accent('Contact'), muted('Email unlocks after sign-in; GitHub and LinkedIn are open.')];
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
          muted('Switch with: theme offense   theme defense'),
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
      // shows too — the entry is written when the command returns.
      if (!ctx.history.length) return [muted('No commands yet.')];
      return ctx.history.map((h, i) => plain(`  ${pad(String(i + 1), 5)}${h}`));
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

/** Edit distance, capped — only ever used to rank a handful of short names. */
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
    // A command that throws used to take the whole hero down with it. It now
    // costs one red line, and the shell is still there afterwards.
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
 * as they agree and hand back the list to print — which is what bash does, and
 * what the previous version did not do at all: it returned nothing unless
 * exactly one command matched, so Tab on `c` or `s` looked like a dead key.
 */
export function complete(input: string, projects: TerminalProject[]): Completion | null {
  // Only the visible command names complete; aliases exist to be forgiving
  // about what is typed, not to double the length of every candidate list.
  const parts = input.split(/\s+/);
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
