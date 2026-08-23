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
  /** Sends the visitor to sign-in, preserving where they were. */
  goToLogin: () => void;
  clear: () => void;
}

export type OutputTone = 'default' | 'muted' | 'accent' | 'success' | 'error';

export interface OutputLine {
  text: string;
  tone?: OutputTone;
}

export interface CommandSpec {
  name: string;
  /** Shown by `help`. */
  usage: string;
  summary: string;
  run: (args: string[], ctx: CommandContext) => OutputLine[];
}

const muted = (text: string): OutputLine => ({ text, tone: 'muted' });
const plain = (text: string): OutputLine => ({ text });
const accent = (text: string): OutputLine => ({ text, tone: 'accent' });
const error = (text: string): OutputLine => ({ text, tone: 'error' });

/** Pads to a column width without pulling in a dependency. */
const pad = (text: string, width: number) =>
  text.length >= width ? text : text + ' '.repeat(width - text.length);

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

export const COMMANDS: CommandSpec[] = [
  {
    name: 'help',
    usage: 'help',
    summary: 'List the available commands.',
    run: () => [
      muted('Available commands:'),
      ...COMMANDS.map(c => plain(`  ${pad(c.usage, 22)}${c.summary}`)),
      muted(''),
      muted('Tab completes, up/down walks history, Ctrl+C cancels a line.'),
    ],
  },
  {
    name: 'whoami',
    usage: 'whoami',
    summary: 'Who I am and what I do.',
    run: () => [
      plain('Vijaysingh Puwar — Cybersecurity Engineer, New York'),
      muted('IT Emerging Talent Intern at the MTA. M.S. Cybersecurity at Pace (GPA 3.92).'),
      muted('Security+, CySA+, CCNA.'),
    ],
  },
  {
    name: 'projects',
    usage: 'projects [filter]',
    summary: 'List shipped projects, optionally filtered.',
    run: (args, ctx) => {
      const q = args.join(' ').toLowerCase();
      const matches = q
        ? ctx.projects.filter(p =>
            `${p.id} ${p.title} ${p.category} ${p.tech.join(' ')}`.toLowerCase().includes(q),
          )
        : ctx.projects;

      if (!matches.length) return [error(`No project matches "${q}".`)];

      const shown = matches.slice(0, 8);
      return [
        muted(`${matches.length} project${matches.length === 1 ? '' : 's'}${q ? ` matching "${q}"` : ''}:`),
        ...shown.map(p =>
          plain(`  ${pad(p.id, 24)}${pad(p.title.slice(0, 38), 40)}${p.year}`),
        ),
        ...(matches.length > shown.length
          ? [muted(`  ...and ${matches.length - shown.length} more. Narrow with: projects <filter>`)]
          : []),
        muted(''),
        muted('Open one with: open <id>'),
      ];
    },
  },
  {
    name: 'open',
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

      if (!hit) return [error(`No project matches "${q}". Try: projects`)];

      emitOpenProject({ query: hit.id });
      return [accent(`Opening ${hit.title}`)];
    },
  },
  {
    name: 'skills',
    usage: 'skills [tech]',
    summary: 'Show what I work with, or filter projects by one.',
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
      return [accent(`${n} project${n === 1 ? '' : 's'} use ${label} — filtering the work below`)];
    },
  },
  {
    name: 'experience',
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
    name: 'clear',
    usage: 'clear',
    summary: 'Clear the terminal.',
    run: (_args, ctx) => {
      ctx.clear();
      return [];
    },
  },
];

const BY_NAME = new Map(COMMANDS.map(c => [c.name, c]));

export function runCommand(input: string, ctx: CommandContext): OutputLine[] {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return [];

  const cmd = BY_NAME.get(name.toLowerCase());
  if (!cmd) {
    return [error(`command not found: ${name}`), muted('Run help for the list.')];
  }
  return cmd.run(args, ctx);
}

/** Completions for Tab: command names first, then project ids for `open`. */
export function complete(input: string, projects: TerminalProject[]): string | null {
  const parts = input.split(/\s+/);
  if (parts.length <= 1) {
    const hits = COMMANDS.map(c => c.name).filter(n => n.startsWith(parts[0].toLowerCase()));
    return hits.length === 1 ? hits[0] + ' ' : null;
  }
  if (parts[0].toLowerCase() === 'open') {
    const partial = parts.slice(1).join(' ').toLowerCase();
    const hits = projects.map(p => p.id).filter(id => id.startsWith(partial));
    return hits.length === 1 ? `open ${hits[0]}` : null;
  }
  return null;
}
