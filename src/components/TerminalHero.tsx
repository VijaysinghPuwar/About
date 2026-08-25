import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { loginHref } from '@/lib/auth-redirect';
import {
  complete,
  runCommand,
  type OutputLine,
  type TerminalProject,
} from '@/lib/terminal-commands';

/*
  The terminal is the identity of this site, so it stays: the intro still types
  itself out character by character, and it still becomes a real shell
  afterwards (help, tab-completion, arrow-key history, ctrl-c / ctrl-l).

  What changed is the chrome around it. The card is a solid panel with a
  hairline border instead of a blurred glass sheet; the name is set in the sans
  face at hero scale rather than as monospace output; and the role line is one
  solid colour instead of a blue-to-violet gradient fill.

  The intro copy is derived from the active mode, so switching to pentest
  rewrites the mission and the listed toolset. Lines are held by index rather
  than copied into state, which means a mode switch re-renders the finished
  transcript in place — it does not replay the animation at the reader.
*/

interface TerminalLine {
  type: 'command' | 'output';
  text: string;
  style?: 'default' | 'name' | 'role' | 'skills' | 'mission';
  speed?: number;
  pauseAfter?: number;
}

function introLines(isPentest: boolean): TerminalLine[] {
  // One paragraph, not pre-broken lines. The intro used to ship the mission as
  // three hardcoded strings, which wrapped a second time on a phone and left a
  // ragged two-word orphan under each. Only commands are typed out, so the
  // paragraph costs nothing in animation and wraps to the column it is given.
  const mission = isPentest
    ? 'I test the systems I defend — mapping attack surface, proving which paths are reachable, and closing them before someone else finds them.'
    : 'I secure enterprise infrastructure, automate security operations, and build detection pipelines that catch threats before they escalate.';

  const listing = isPentest ? '$ ls offense/' : '$ ls defense/';
  const tools = isPentest
    ? 'Nmap  Wireshark  OWASP-Top-10  Vulnerability-Assessment  Session-JWT-Testing  RBAC-Review  Privilege-Paths  TCP/IP  Python  Bash'
    : 'SIEM-detection  Incident-Response  Endpoint-Hardening  Secure-Coding  Active-Directory  IAM  MFA-GPO  Encryption-at-Rest  Firewalls  PowerShell';

  return [
    { type: 'command', text: '$ whoami', speed: 40, pauseAfter: 300 },
    { type: 'output', text: 'Vijaysingh Puwar', style: 'name', pauseAfter: 400 },
    { type: 'output', text: '', pauseAfter: 100 },
    { type: 'command', text: '$ cat role.txt', speed: 40, pauseAfter: 300 },
    { type: 'output', text: 'Cybersecurity Engineer', style: 'role', pauseAfter: 400 },
    { type: 'output', text: '', pauseAfter: 100 },
    { type: 'command', text: '$ cat mission.txt', speed: 40, pauseAfter: 300 },
    { type: 'output', text: mission, style: 'mission', pauseAfter: 400 },
    { type: 'output', text: '', pauseAfter: 100 },
    { type: 'command', text: listing, speed: 40, pauseAfter: 300 },
    { type: 'output', text: tools, style: 'skills', pauseAfter: 400 },
    { type: 'output', text: '', pauseAfter: 100 },
    { type: 'command', text: '$ ./connect.sh', speed: 40, pauseAfter: 200 },
  ];
}

interface TerminalHeroProps {
  /** Backs `projects`, `open` and `skills`. */
  projects: TerminalProject[];
}

/** One entered command and everything it printed. */
interface HistoryEntry {
  input: string;
  output: OutputLine[];
}

export function TerminalHero({ projects }: TerminalHeroProps) {
  const { user } = useAuth();
  const { isPentest } = useTheme();
  const navigate = useNavigate();

  // Recomputed on a mode switch. The typing state indexes into it, so lines
  // already printed simply adopt the new copy.
  const lines = useMemo(() => introLines(isPentest), [isPentest]);

  /* ── interactive shell (starts once the intro has typed out) ── */
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [recall, setRecall] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const submitted = entries.map(e => e.input);

  const submit = useCallback(() => {
    const input = draft.trim();
    setDraft('');
    setRecall(null);
    if (!input) return;
    const output = runCommand(input, {
      projects,
      isAuthed: Boolean(user),
      goToLogin: () => navigate(loginHref()),
      clear: () => setEntries([]),
    });
    // `clear` empties the log itself, so don't re-append the command that ran it.
    if (input.trim().toLowerCase() === 'clear') return;
    setEntries(prev => [...prev, { input, output }]);
  }, [draft, projects, user, navigate]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); return; }

    if (e.key === 'Tab') {
      e.preventDefault();
      const filled = complete(draft, projects);
      if (filled) setDraft(filled);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!submitted.length) return;
      const next = recall === null ? submitted.length - 1 : Math.max(0, recall - 1);
      setRecall(next);
      setDraft(submitted[next]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (recall === null) return;
      const next = recall + 1;
      if (next >= submitted.length) { setRecall(null); setDraft(''); return; }
      setRecall(next);
      setDraft(submitted[next]);
      return;
    }

    if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); setDraft(''); setRecall(null); return; }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setEntries([]); }
  }, [draft, projects, recall, submit, submitted]);

  // Keep the newest output in view without moving the page itself.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  /* ── typewriter intro ── */
  // How many lines have finished printing. Storing a count rather than copies
  // is what lets a mode switch re-render the transcript without a replay.
  const [printed, setPrinted] = useState(0);
  const [currentTyping, setCurrentTyping] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'done'>('typing');
  const [showButtons, setShowButtons] = useState(false);

  const lineIndex = printed;
  const currentLine = lineIndex < lines.length ? lines[lineIndex] : null;

  const advanceLine = useCallback(() => {
    if (!currentLine) return;
    setCurrentTyping('');
    setCharIndex(0);
    setPrinted(n => n + 1);

    if (lineIndex + 1 >= lines.length) {
      setPhase('done');
      setTimeout(() => setShowButtons(true), 300);
    } else {
      setPhase('pause');
    }
  }, [currentLine, lineIndex, lines.length]);

  useEffect(() => {
    if (!currentLine) return;

    if (phase === 'pause') {
      const prev = lines[lineIndex - 1];
      const timer = setTimeout(() => setPhase('typing'), prev?.pauseAfter || 200);
      return () => clearTimeout(timer);
    }

    if (phase !== 'typing') return;

    // Output lines appear instantly; only commands are typed out.
    if (currentLine.type === 'output') {
      advanceLine();
      return;
    }

    if (charIndex < currentLine.text.length) {
      const timer = setTimeout(() => {
        setCurrentTyping(currentLine.text.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, currentLine.speed || 40);
      return () => clearTimeout(timer);
    }
    advanceLine();
  }, [phase, charIndex, currentLine, lineIndex, lines, advanceLine]);

  const renderLine = (line: TerminalLine, i: number) => {
    if (!line.text) return <div key={i} className="h-4" />;

    // Commands print the `$` in the accent and the command itself dim, which is
    // how a real prompt reads — the previous version coloured the whole line.
    if (line.type === 'command') {
      const body = line.text.replace(/^\$\s*/, '');
      return (
        <div key={i} className="font-mono text-[13px] leading-[1.7] text-muted-dim">
          <span className="text-primary">$</span> {body}
        </div>
      );
    }

    switch (line.style) {
      case 'name':
        return (
          <div
            key={i}
            className="mb-[18px] mt-1.5 text-[32px] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[44px]"
          >
            {line.text}
          </div>
        );
      case 'role':
        return (
          <div key={i} className="mb-[18px] mt-1 text-[19px] font-medium tracking-[-0.012em] text-foreground">
            {line.text} <span className="font-normal text-muted-dim">— New York, NY</span>
          </div>
        );
      case 'mission':
        return (
          <div key={i} className="max-w-[52ch] text-[15px] leading-[1.6] text-muted-foreground">
            {line.text}
          </div>
        );
      case 'skills':
        return (
          <div key={i} className="my-1 font-mono text-[12.5px] leading-[1.7] text-muted-foreground">
            {line.text}
          </div>
        );
      default:
        return (
          <div key={i} className="font-mono text-[13px] leading-[1.7] text-foreground">
            {line.text}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Chrome bar. The lit dot is the accent, so the window title and the
            mode agree; the other two stay inert because they do nothing. */}
        <div className="flex items-center gap-3 border-b border-border bg-card-elevated px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-border-strong" />
            <span className="h-2 w-2 rounded-full bg-border-strong" />
          </span>
          <span className="select-none font-mono text-[11.5px] text-muted-dim">
            vijaysingh@{isPentest ? 'offense' : 'defense'}:~$
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          // No max-height. The intro is a fixed length and clipping it behind
          // an inner scrollbar hid the CTAs on short viewports; the card grows
          // with the shell instead, which is how a terminal behaves anyway.
          className="flex min-h-[300px] flex-col justify-start px-5 py-5 sm:min-h-[420px] sm:px-7 sm:py-7"
        >
          {lines.slice(0, printed).map((line, i) => renderLine(line, i))}

          {/* Currently typing line */}
          {phase === 'typing' && currentLine?.type === 'command' && (
            <div className="font-mono text-[13px] leading-[1.7] text-muted-dim">
              <span className="text-primary">$</span> {currentTyping.replace(/^\$\s*/, '')}
              <span className="animate-terminal-blink text-primary">▊</span>
            </div>
          )}

          {/* Interactive shell, once the intro has finished typing. */}
          {phase === 'done' && (
            <>
              <div role="log" aria-live="polite" aria-label="Terminal output">
                {entries.map((entry, i) => (
                  <div key={i} className="mt-2 first:mt-1">
                    <div className="break-all font-mono text-[13px] text-foreground">
                      <span className="text-primary">$</span> {entry.input}
                    </div>
                    {entry.output.map((line, j) => (
                      <div
                        key={j}
                        className={
                          'whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.7] ' +
                          (line.tone === 'muted' ? 'text-muted-dim'
                            : line.tone === 'accent' ? 'text-primary'
                            : line.tone === 'success' ? 'text-primary'
                            : line.tone === 'error' ? 'text-destructive'
                            : 'text-muted-foreground')
                        }
                      >
                        {line.text || ' '}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-2.5 font-mono text-[13px]">
                <span className="shrink-0 text-primary" aria-hidden="true">$</span>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Terminal input — type help for available commands"
                  placeholder={entries.length ? '' : "type 'help'"}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[13px] text-foreground outline-none placeholder:text-muted-dim focus:ring-0"
                />
                <span className="h-[15px] w-[7px] shrink-0 animate-terminal-blink bg-primary" aria-hidden="true" />
              </div>
            </>
          )}

          {/* CTAs */}
          {showButtons && (
            <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5 sm:flex-row">
              <button
                onClick={() => {
                  const el = document.getElementById('projects');
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 72;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
                className="gradient-btn inline-flex h-11 items-center justify-center gap-2.5 rounded-md px-[18px] text-[14.5px]"
              >
                View my work <span className="font-mono" aria-hidden="true">&#8594;</span>
              </button>
              {/* Public. A recruiter should never have to make an account to read
                  a resume — the direct contact details stay gated instead. */}
              <a
                href="/resume.pdf"
                download
                className="btn-outline inline-flex h-11 items-center justify-center gap-2.5 rounded-md px-[18px] text-[14.5px] font-medium"
              >
                Download résumé <span className="font-mono text-[11px] text-muted-dim">PDF</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
