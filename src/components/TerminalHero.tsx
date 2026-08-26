import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { loginHref } from '@/lib/auth-redirect';
import { sweepHold } from '@/lib/theme-transition';
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
  rewrites the mission and the listed toolset — and the terminal types the new
  transcript out again rather than swapping it in place. The switch is the site
  changing its stance; the terminal restating that stance in its own voice is
  most of the reason the mode has a terminal at all. Lines are still held by
  index rather than copied into state, so the replay is a counter going back to
  zero, not a second copy of the transcript.

  It replays only when the intro is all there is. Once the reader has run a
  command of their own, the intro is history sitting above their session and
  retyping it would talk over them, so that case reconciles the counter and
  leaves the transcript alone.
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
  //
  // Pentest mode prints no mission at all: `ls offense/` is the claim, and a
  // paragraph in front of it was restating the tools in prose.
  const mission = isPentest
    ? null
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
    ...(mission
      ? ([
          { type: 'command', text: '$ cat mission.txt', speed: 40, pauseAfter: 300 },
          { type: 'output', text: mission, style: 'mission', pauseAfter: 400 },
          { type: 'output', text: '', pauseAfter: 100 },
        ] as TerminalLine[])
      : []),
    { type: 'command', text: listing, speed: 40, pauseAfter: 300 },
    { type: 'output', text: tools, style: 'skills', pauseAfter: 400 },
    { type: 'output', text: '', pauseAfter: 100 },
    { type: 'command', text: '$ ./connect.sh', speed: 40, pauseAfter: 200 },
  ];
}

/**
 * True below Tailwind's `sm`, which is where the terminal switches to its phone
 * layout. Written against `matchMedia` rather than a width read so it costs one
 * listener and cannot disagree with the CSS.
 */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const sync = () => setNarrow(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);
  return narrow;
}

/*
  The tap row under the prompt on phones. `help` first because it explains the
  rest, `clear` last because it undoes them; the four in between are the ones
  that go somewhere.
*/
const SHORTCUTS = ['help', 'projects', 'skills', 'experience', 'contact', 'clear'] as const;

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
  const reduced = useReducedMotion();
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

  /* Where the block caret is drawn: the cursor's column, and how far the field
     has scrolled once the line outgrows it. */
  const [caret, setCaret] = useState({ col: 0, scrollLeft: 0 });
  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    setCaret({ col: el.selectionStart ?? el.value.length, scrollLeft: el.scrollLeft });
  }, []);

  const submitted = entries.map(e => e.input);

  /* Running a command is separate from submitting the field, because the phone
     shortcut row runs commands that were never typed into it. */
  const run = useCallback((raw: string) => {
    const input = raw.trim();
    setRecall(null);
    if (!input) return;
    const output = runCommand(input, {
      projects,
      isAuthed: Boolean(user),
      goToLogin: () => navigate(loginHref()),
      clear: () => setEntries([]),
    });
    // `clear` empties the log itself, so don't re-append the command that ran it.
    if (input.toLowerCase() === 'clear') return;
    setEntries(prev => [...prev, { input, output }]);
  }, [projects, user, navigate]);

  const submit = useCallback(() => {
    const input = draft;
    setDraft('');
    run(input);
  }, [draft, run]);

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

  /*
    ── the prompt and the on-screen keyboard ──

    A phone keyboard does not resize the page. It draws itself over the bottom
    of the layout viewport, and the line you tapped to open it ends up
    underneath. Scrolling the page to compensate is the obvious answer and it is
    the wrong one on iOS: Safari is scrolling too — it moves the visual viewport
    inside the layout viewport rather than moving the document — so a scroll of
    our own either fights it or is undone by it, and the prompt lands off screen
    anyway.

    So the prompt does not chase the keyboard. When the keyboard is up and the
    field has focus, the prompt row is taken out of the card and pinned to the
    bottom of the layout viewport, offset by exactly the height the keyboard
    covers. `position: fixed` is measured against the layout viewport, which the
    keyboard does not change, so the row sits on top of the keyboard no matter
    what either scroller is doing. A spacer holds its place in the card so
    nothing below it jumps, and it drops back in on blur.

    `visualViewport` is what the keyboard leaves visible; the difference between
    that and `innerHeight` is the keyboard. The 90px floor keeps a retracting
    URL bar — which moves the same numbers by a much smaller amount — from
    reading as a keyboard.
  */
  const promptRef = useRef<HTMLDivElement>(null);
  /* The gap the docked prompt left behind in the card — the point in the
     transcript the reader is actually typing at. */
  const anchorRef = useRef<HTMLDivElement>(null);
  const flowHeight = useRef(0);
  const [keyboard, setKeyboard] = useState(0);
  const [visible, setVisible] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const measure = () => {
      const covered = window.innerHeight - (vv.height + vv.offsetTop);
      setKeyboard(covered > 90 ? Math.round(covered) : 0);
      setVisible(Math.round(vv.height));
    };
    measure();
    vv.addEventListener('resize', measure);
    vv.addEventListener('scroll', measure);
    return () => {
      vv.removeEventListener('resize', measure);
      vv.removeEventListener('scroll', measure);
    };
  }, []);

  /* The bar is a phone affordance; from `sm` up there is no keyboard covering
     anything and the prompt stays where it was written. */
  const narrow = useNarrow();
  const docked = narrow && focused && keyboard > 0;
  /* A phone in landscape can be left with barely two hundred points above the
     keyboard. The bar earns its place there only if what it covers is worth
     less than what it shows, so the shortcut row drops out and the prompt
     alone is docked. */
  const roomForShortcuts = !docked || visible >= 320;

  // The height to hold open in the card, remeasured whenever it is in the flow.
  useEffect(() => {
    if (!docked && promptRef.current) flowHeight.current = promptRef.current.offsetHeight;
  });

  /*
    Docking pins the prompt, not the transcript. The card can be left showing
    its opening lines while the reader types at the bottom of the screen, so the
    page is scrolled once, to put the end of the transcript directly above the
    bar. Safari has nothing to fight over here — the focused field is fixed, so
    it is already in view as far as the browser is concerned.

    Undocked, it is the other way round: the prompt is in the flow and can be
    pushed under the fold by its own output, so it is walked back up.
  */
  const alignToKeyboard = useCallback(() => {
    const vv = window.visualViewport;
    const bar = promptRef.current;
    if (!bar) return;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;

    if (docked) {
      const anchor = anchorRef.current;
      if (!anchor) return;
      // `visibleBottom` is already the keyboard's top edge; the bar sits on it,
      // and the transcript should end where the prompt used to be — directly
      // above it, whether that means scrolling down to it or back up to it.
      const room = visibleBottom - bar.offsetHeight;
      // The gap's *top* is where the transcript now ends, and that is the edge
      // worth putting against the bar; the rest of the gap can sit behind it.
      const shift = anchor.getBoundingClientRect().top - room;
      if (Math.abs(shift) > 2) window.scrollBy({ top: shift, behavior: 'instant' as ScrollBehavior });
      return;
    }

    const overlap = bar.getBoundingClientRect().bottom + 12 - visibleBottom;
    if (overlap > 1) window.scrollBy({ top: overlap, behavior: 'instant' as ScrollBehavior });
  }, [docked]);

  // The bar lands after the keyboard has finished animating, so this runs on the
  // state that says it landed rather than on the focus that started it.
  useEffect(() => {
    if (docked) requestAnimationFrame(alignToKeyboard);
  }, [docked, alignToKeyboard]);

  // Keep the newest output in view without moving the page itself — and, if the
  // keyboard is up, keep it above the bar the command just printed behind.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (docked || document.activeElement === inputRef.current) {
      requestAnimationFrame(alignToKeyboard);
    }
  }, [entries, docked, alignToKeyboard]);

  // `onSelect` covers typing, clicking and the arrow keys, but not the times
  // the draft is rewritten from under the field — tab-completion, history
  // recall, ctrl-c. Re-read the cursor after any of those land.
  useEffect(() => { syncCaret(); }, [draft, syncCaret]);

  /* ── typewriter intro ── */
  // How many lines have finished printing. Storing a count rather than copies
  // is what lets a mode switch re-render the transcript without a replay.
  const [printed, setPrinted] = useState(0);
  const [currentTyping, setCurrentTyping] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  // `sealed` is the replay waiting out the theme shutter: transcript emptied,
  // nothing drawn, no caret — the panel is behind the plates for that beat.
  const [phase, setPhase] = useState<'sealed' | 'typing' | 'pause' | 'done'>('typing');
  const [showButtons, setShowButtons] = useState(false);

  const lineIndex = printed;
  const currentLine = lineIndex < lines.length ? lines[lineIndex] : null;

  /*
    A new transcript arrived, which only ever means the mode changed. Type it
    out again from the top — after the shutter, so the retype is watched rather
    than spent behind the plates.

    Two cases skip it: a shell the reader has already used (see the note at the
    top of this file), and reduced motion, where there is no shutter and no
    replay. Both still have to reconcile the counter, because the two modes no
    longer print the same number of lines — pentest has no mission paragraph.
  */
  const holdMs = useRef(0);
  const firstTranscript = useRef(true);
  useEffect(() => {
    if (firstTranscript.current) {
      firstTranscript.current = false;
      return;
    }

    if (entries.length > 0 || reduced) {
      if (phase === 'done' || printed >= lines.length) {
        setPrinted(lines.length);
        setPhase('done');
        setShowButtons(true);
      }
      return;
    }

    holdMs.current = sweepHold();
    setPrinted(0);
    setCurrentTyping('');
    setCharIndex(0);
    setShowButtons(false);
    setPhase('sealed');
    // Keyed to the transcript changing, not to the typing state it resets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

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

    if (phase === 'sealed') {
      const timer = setTimeout(() => setPhase('typing'), holdMs.current);
      return () => clearTimeout(timer);
    }

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
              {/* Command output is laid out in padded columns. Wrapping those
                  at phone width breaks every row mid-column and the alignment
                  stops meaning anything, so below `sm` the log scrolls
                  sideways instead — which is what a terminal does. */}
              <div
                role="log"
                aria-live="polite"
                aria-label="Terminal output"
                className="term-scroll -mx-1 overflow-x-auto px-1 sm:mx-0 sm:overflow-x-visible sm:px-0"
              >
                {entries.map((entry, i) => (
                  <div key={i} className="mt-2 first:mt-1">
                    <div className="break-all font-mono text-[13px] text-foreground">
                      <span className="text-primary">$</span> {entry.input}
                    </div>
                    {entry.output.map((line, j) => (
                      <div
                        key={j}
                        className={
                          'whitespace-pre font-mono text-[13px] leading-[1.7] sm:whitespace-pre-wrap sm:break-words ' +
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

              {/* The caret sits on the cursor's own column.

                  It used to be a sibling *after* an input carrying `flex-1`:
                  the input claimed the whole row, so the block was pushed to
                  the far right edge of the card while the real text cursor
                  stayed back at the prompt — two carets, several hundred
                  pixels apart, and only one of them where you were typing.
                  The block is now placed off `selectionStart`. The face is
                  monospace, so a column is exactly `1ch` and nothing has to be
                  measured; `scrollLeft` keeps it honest once the line is long
                  enough to scroll, and the input's own caret is hidden so
                  there is only ever one. */}
              {/* 16px on a phone, 13px from `sm` up. Anything under 16px makes
                  iOS Safari zoom the whole page the moment the field takes
                  focus, and it never zooms back out. The row carries the size
                  so the input and the block caret stay in step — the caret is
                  positioned in `ch` and sized in `em`, both of which follow
                  whatever the row is set to. */}
              {/* Docked, this is the bar sitting on top of the keyboard: full
                  width, the card's own surface, a hairline to separate it from
                  whatever it is covering. In the flow it is just the next line
                  of the terminal. */}
              <div
                ref={promptRef}
                className={
                  docked
                    ? 'fixed inset-x-0 z-40 border-t border-border bg-card px-5 pb-3 pt-1'
                    : undefined
                }
                style={docked ? { bottom: keyboard } : undefined}
              >
                <div className="mt-2.5 flex items-center gap-2.5 font-mono text-[16px] sm:text-[13px]">
                  <span className="shrink-0 text-primary" aria-hidden="true">$</span>
                  <span className="relative flex min-w-0 flex-1 items-center overflow-hidden">
                    <input
                      ref={inputRef}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      onSelect={syncCaret}
                      onScroll={syncCaret}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      spellCheck={false}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      inputMode="text"
                      enterKeyHint="go"
                      aria-label="Terminal input — type help for available commands"
                      placeholder={entries.length ? '' : "type 'help'"}
                      className="w-full min-w-0 border-0 bg-transparent p-0 font-mono text-[1em] text-foreground caret-transparent outline-none placeholder:text-muted-dim focus:ring-0"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 h-[1.15em] w-[0.6em] -translate-y-1/2 animate-terminal-blink bg-primary"
                      style={{ left: `calc(${caret.col}ch - ${caret.scrollLeft}px)` }}
                    />
                  </span>
                </div>

                {/* A phone keyboard has no Tab, no arrow keys and no Ctrl, which
                    is every affordance this shell has for finding its way around.
                    These are the replacement: the commands worth reaching without
                    typing, one tap each. `stopPropagation` keeps the tap off the
                    body's focus handler, so running one does not also throw the
                    keyboard up over the output it just printed. */}
                <div
                  className={
                    !roomForShortcuts
                      ? 'hidden'
                      : docked
                        ? // Above the keyboard there is no room to wrap: one row
                          // that scrolls, the way a keyboard accessory bar does.
                          'term-scroll mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1'
                        : 'mt-3.5 flex flex-wrap gap-1.5 sm:hidden'
                  }
                >
                  {SHORTCUTS.map(cmd => (
                    <button
                      key={cmd}
                      type="button"
                      // Preventing the default on mousedown is what stops the tap
                    // taking focus off the field, which on a phone is what
                    // stops the keyboard closing under the reader every time
                    // they run a command from this row.
                    onMouseDown={e => e.preventDefault()}
                    onClick={e => { e.stopPropagation(); run(cmd); }}
                      className="min-h-[38px] shrink-0 rounded-[4px] border border-border px-3 font-mono text-[12px] tracking-[0.04em] text-muted-dim active:border-primary active:text-primary"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Holds the prompt's place in the card while it is docked, so the
                  shortcut row and the CTAs below it do not jump up by a line the
                  moment the keyboard opens. */}
              {docked && (
                <div ref={anchorRef} style={{ height: flowHeight.current }} aria-hidden="true" />
              )}
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
