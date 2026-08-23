import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { loginHref } from '@/lib/auth-redirect';
import { scrollToSection } from '@/lib/portfolio-events';
import {
  COMMANDS,
  complete,
  runCommand,
  type OutputLine,
  type TerminalProject,
} from '@/lib/terminal-commands';

interface TerminalLine {
  type: 'command' | 'output';
  text: string;
  style?: 'default' | 'name' | 'role' | 'skills' | 'mission';
  speed?: number; // ms per char (commands only)
  pauseAfter?: number; // ms to wait after this line
}

const lines: TerminalLine[] = [
  { type: 'command', text: '$ whoami', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Vijaysingh Puwar', style: 'name', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ cat role.txt', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Cybersecurity Engineer', style: 'role', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ cat mission.txt', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'I secure enterprise infrastructure, automate security', style: 'mission', pauseAfter: 50 },
  { type: 'output', text: 'operations, and build detection pipelines that catch', style: 'mission', pauseAfter: 50 },
  { type: 'output', text: 'threats before they escalate.', style: 'mission', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ ls skills/', speed: 40, pauseAfter: 300 },
  { type: 'output', text: 'Python  PowerShell  Active-Directory  Splunk  AWS  Docker  Linux  Nmap  Wireshark  SIEM  Ansible  IAM  Cisco  Firewalls', style: 'skills', pauseAfter: 400 },
  { type: 'output', text: '', pauseAfter: 100 },
  { type: 'command', text: '$ ./connect.sh', speed: 40, pauseAfter: 200 },
];

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
  const navigate = useNavigate();

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

  // visibleLines: array of { text, type, style } that are fully rendered
  const [visibleLines, setVisibleLines] = useState<{ text: string; type: string; style: string }[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'done'>('typing');
  const [showButtons, setShowButtons] = useState(false);

  const currentLine = lineIndex < lines.length ? lines[lineIndex] : null;

  // Advance to next line
  const advanceLine = useCallback(() => {
    if (!currentLine) return;
    // Push completed line
    setVisibleLines(prev => [...prev, {
      text: currentLine.text,
      type: currentLine.type,
      style: currentLine.style || 'default',
    }]);
    setCurrentTyping('');
    setCharIndex(0);

    if (lineIndex + 1 >= lines.length) {
      setPhase('done');
      setTimeout(() => setShowButtons(true), 300);
    } else {
      setPhase('pause');
    }
  }, [currentLine, lineIndex]);

  useEffect(() => {
    if (!currentLine) return;

    if (phase === 'pause') {
      const prev = lines[lineIndex];
      const timer = setTimeout(() => {
        setLineIndex(i => i + 1);
        setPhase('typing');
      }, prev?.pauseAfter || 200);
      return () => clearTimeout(timer);
    }

    if (phase !== 'typing') return;

    // Output lines appear instantly
    if (currentLine.type === 'output') {
      advanceLine();
      return;
    }

    // Typewriter for commands
    if (charIndex < currentLine.text.length) {
      const timer = setTimeout(() => {
        setCurrentTyping(currentLine.text.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, currentLine.speed || 40);
      return () => clearTimeout(timer);
    } else {
      advanceLine();
    }
  }, [phase, charIndex, currentLine, lineIndex, advanceLine]);

  const renderLine = (line: { text: string; type: string; style: string }, i: number) => {
    if (!line.text) return <div key={i} className="h-3" />;

    let className = 'font-mono text-sm leading-relaxed ';
    switch (line.style) {
      case 'name':
        className += 'text-foreground text-xl sm:text-3xl font-bold break-words';
        break;
      case 'role':
        className += 'gradient-text text-lg sm:text-xl font-semibold';
        break;
      case 'skills':
        className += 'text-success text-xs sm:text-sm';
        break;
      case 'mission':
        className += 'text-foreground/80 text-sm';
        break;
      default:
        className += line.type === 'command' ? 'text-primary' : 'text-foreground';
    }

    return (
      <div key={i} className={className}>
        {line.text}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Terminal window */}
      <div className="glass-card rounded-xl overflow-hidden border border-border/40">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-2 select-none">
            vijaysingh@security:~$
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="px-4 sm:px-6 py-4 sm:py-5 min-h-[260px] sm:min-h-[380px] max-h-[70vh] overflow-y-auto flex flex-col justify-start"
        >
          {visibleLines.map((line, i) => renderLine(line, i))}

          {/* Currently typing line */}
          {phase === 'typing' && currentLine?.type === 'command' && (
            <div className="font-mono text-sm text-primary">
              {currentTyping}
              <span className="animate-terminal-blink">▊</span>
            </div>
          )}

          {/* Interactive shell, once the intro has finished typing. */}
          {phase === 'done' && (
            <>
              <div role="log" aria-live="polite" aria-label="Terminal output">
                {entries.map((entry, i) => (
                  <div key={i} className="mt-2 first:mt-1">
                    <div className="font-mono text-sm text-primary break-all">
                      <span className="text-muted-foreground">$ </span>{entry.input}
                    </div>
                    {entry.output.map((line, j) => (
                      <div
                        key={j}
                        className={
                          'font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words ' +
                          (line.tone === 'muted' ? 'text-muted-foreground'
                            : line.tone === 'accent' ? 'text-primary'
                            : line.tone === 'success' ? 'text-success'
                            : line.tone === 'error' ? 'text-destructive'
                            : 'text-foreground/90')
                        }
                      >
                        {line.text || '\u00a0'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2 font-mono text-sm">
                <span className="text-muted-foreground shrink-0" aria-hidden="true">$</span>
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
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-primary placeholder:text-muted-foreground/50 font-mono text-sm p-0 focus:ring-0"
                />
              </div>
            </>
          )}

          {/* CTA buttons */}
          <AnimatePresence>
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-border/20"
              >
                <button
                  onClick={() => {
                    const el = document.getElementById('projects');
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 64;
                      window.scrollTo({ top, behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium gradient-btn"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />View My Work
                </button>
                {/* Public. A recruiter should never have to make an account to read
                    a resume — the direct contact details stay gated instead. */}
                <a
                  href="/resume.pdf"
                  download
                  className="inline-flex items-center justify-center h-10 px-6 rounded-md text-sm font-medium border border-border/60 text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />Download Resume
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
