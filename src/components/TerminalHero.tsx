import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
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

  ── two rules the layout is built on ──

  1. The prompt does not move when a command prints. The session log is a
     bounded, self-scrolling region between the intro and the prompt, so output
     accumulates *inside* the card instead of growing it without limit. The
     terminal used to answer every command by scrolling the whole page down to
     chase a prompt that had just been pushed under the fold, which is what
     reading a result felt like standing on.
  2. Nothing waits for the intro. It types out about three times faster than it
     did, a click or a keystroke finishes it immediately, and reduced motion
     never sees it type at all.
*/

interface TerminalLine {
  type: 'command' | 'output';
  text: string;
  style?: 'default' | 'name' | 'role' | 'skills' | 'mission';
  speed?: number;
  pauseAfter?: number;
}

/*
  Typing speed. The banner is the thing standing between a visitor and a shell
  they can use, so it is paced to be watched once, not admired: ~18ms a
  character and a beat between lines, which lands the whole intro in about
  three seconds instead of fourteen.
*/
const CHAR_MS = 18;
const BEAT = 150;
const HOLD = 220;

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
    { type: 'command', text: '$ whoami', speed: CHAR_MS, pauseAfter: HOLD },
    { type: 'output', text: 'Vijaysingh Puwar', style: 'name', pauseAfter: HOLD },
    { type: 'output', text: '', pauseAfter: 60 },
    { type: 'command', text: '$ cat role.txt', speed: CHAR_MS, pauseAfter: HOLD },
    { type: 'output', text: 'Cybersecurity Engineer', style: 'role', pauseAfter: HOLD },
    { type: 'output', text: '', pauseAfter: 60 },
    ...(mission
      ? ([
          { type: 'command', text: '$ cat mission.txt', speed: CHAR_MS, pauseAfter: BEAT },
          { type: 'output', text: mission, style: 'mission', pauseAfter: HOLD },
          { type: 'output', text: '', pauseAfter: 60 },
        ] as TerminalLine[])
      : []),
    { type: 'command', text: listing, speed: CHAR_MS, pauseAfter: BEAT },
    { type: 'output', text: tools, style: 'skills', pauseAfter: HOLD },
    { type: 'output', text: '', pauseAfter: 60 },
    { type: 'command', text: '$ ./connect.sh', speed: CHAR_MS, pauseAfter: BEAT },
  ];
}

/** One `matchMedia` query as a boolean, kept in step with the CSS. */
function useMedia(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia(query).matches
      : false,
  );
  useEffect(() => {
    if (!('matchMedia' in window)) return;
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

/*
  The tap row under the prompt on touch devices. `help` first because it
  explains the rest, `clear` last because it undoes them; the ones in between
  are the ones that go somewhere.
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
  /** Ctrl+C: the line was abandoned rather than run. */
  aborted?: boolean;
}

export function TerminalHero({ projects }: TerminalHeroProps) {
  const { user } = useAuth();
  const { isPentest, toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const navigate = useNavigate();

  // Recomputed on a mode switch. The typing state indexes into it, so lines
  // already printed simply adopt the new copy.
  const lines = useMemo(() => introLines(isPentest), [isPentest]);

  /* ── interactive shell (starts once the intro has typed out) ── */
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  /* Kept apart from `entries` so `clear` wipes the screen and not the history,
     which is what every shell does and what the arrow keys are for. */
  const [history, setHistory] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [recall, setRecall] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* Where the block caret is drawn: the cursor's column, and how far the field
     has scrolled once the line outgrows it. */
  const [caret, setCaret] = useState({ col: 0, scrollLeft: 0 });
  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    setCaret({ col: el.selectionStart ?? el.value.length, scrollLeft: el.scrollLeft });
  }, []);

  /*
    The prompt's distance from the top of the viewport, captured before an
    output change and restored after it. Printing a result moves the log, and
    the log sits above the prompt — without this, every command shoves the
    prompt (and, on a phone, the shortcut button still under the reader's
    thumb) down the screen by however tall the answer was.
  */
  const promptRef = useRef<HTMLDivElement>(null);
  const pin = useRef<number | null>(null);
  const capturePin = useCallback(() => {
    pin.current = promptRef.current?.getBoundingClientRect().top ?? null;
  }, []);

  /* Running a command is separate from submitting the field, because the touch
     shortcut row runs commands that were never typed into it. */
  const run = useCallback((raw: string) => {
    const input = raw.trim();
    setRecall(null);
    if (!input) return;

    capturePin();
    // Consecutive repeats are noise in the arrow-key walk, so collapse them.
    setHistory(prev => (prev[prev.length - 1] === input ? prev : [...prev, input]));

    const { output, silent } = runCommand(input, {
      projects,
      isAuthed: Boolean(user),
      goToLogin: () => navigate(loginHref()),
      clear: () => setEntries([]),
      history,
      isPentest,
      setPentest: (on: boolean) => { if (on !== isPentest) toggleTheme(); },
    });

    if (silent) return;
    setEntries(prev => [...prev, { input, output }]);
  }, [projects, user, navigate, history, isPentest, toggleTheme, capturePin]);

  const submit = useCallback(() => {
    const input = draft;
    setDraft('');
    run(input);
  }, [draft, run]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); return; }

    if (e.key === 'Tab') {
      e.preventDefault();
      const hit = complete(draft, projects);
      if (!hit) return;
      setDraft(hit.value);
      // Several things still match: print them the way bash does, so a second
      // Tab is an answer rather than a key that appears not to work.
      if (hit.candidates.length > 1) {
        capturePin();
        setEntries(prev => [
          ...prev,
          { input: draft, output: [{ text: hit.candidates.join('  '), tone: 'muted' }] },
        ]);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = recall === null ? history.length - 1 : Math.max(0, recall - 1);
      setRecall(next);
      setDraft(history[next]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (recall === null) return;
      const next = recall + 1;
      if (next >= history.length) { setRecall(null); setDraft(''); return; }
      setRecall(next);
      setDraft(history[next]);
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      // Echo the abandoned line rather than swallowing it, so Ctrl+C reads as
      // something that happened instead of the field silently emptying.
      if (draft.trim()) {
        capturePin();
        setEntries(prev => [...prev, { input: draft, output: [], aborted: true }]);
      }
      setDraft('');
      setRecall(null);
      return;
    }

    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); capturePin(); setEntries([]); }
  }, [draft, projects, recall, submit, history, capturePin]);

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

  /*
    The tap row and the docking are answers to a touch keyboard, not to a narrow
    window. Keying them off `sm` meant a tablet — which has exactly the same
    keyboard covering exactly the same prompt — got neither, and a desktop
    window dragged narrow got a tap row it had no use for. `pointer: coarse` is
    the question actually being asked; the width stays in the test so a phone
    whose browser lies about its pointer is still covered.
  */
  const narrow = useMedia('(max-width: 639px)');
  const coarse = useMedia('(pointer: coarse)');
  const touch = coarse || narrow;
  const docked = touch && focused && keyboard > 0;
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

    This is the only place the terminal moves the page. Undocked it does not:
    output goes into a bounded log that scrolls itself, so there is never a
    prompt under the fold to walk back up to.
  */
  const alignToKeyboard = useCallback(() => {
    if (!docked) return;
    const vv = window.visualViewport;
    const bar = promptRef.current;
    const anchor = anchorRef.current;
    if (!bar || !anchor) return;

    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    // `visibleBottom` is already the keyboard's top edge; the bar sits on it,
    // and the transcript should end where the prompt used to be — directly
    // above it, whether that means scrolling down to it or back up to it.
    const room = visibleBottom - bar.offsetHeight;
    // The gap's *top* is where the transcript now ends, and that is the edge
    // worth putting against the bar; the rest of the gap can sit behind it.
    const shift = anchor.getBoundingClientRect().top - room;
    if (Math.abs(shift) > 2) window.scrollBy({ top: shift, behavior: 'instant' as ScrollBehavior });
  }, [docked]);

  // The bar lands after the keyboard has finished animating, so this runs on the
  // state that says it landed rather than on the focus that started it.
  useEffect(() => {
    if (docked) requestAnimationFrame(alignToKeyboard);
  }, [docked, alignToKeyboard]);

  /* Keep the newest output in view inside the log, and give the prompt back the
     screen position it had before the log changed size. Layout effect, so both
     land in the same frame the output does and nothing is seen to jump. */
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;

    const want = pin.current;
    pin.current = null;
    if (want == null || docked) return;
    const bar = promptRef.current;
    if (!bar) return;
    const delta = bar.getBoundingClientRect().top - want;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior });
  }, [entries, docked]);

  useEffect(() => {
    if (docked) requestAnimationFrame(alignToKeyboard);
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

  /* The banner is not the point of the terminal, so anything that says the
     reader is ready to use it — a click on the card, a keystroke, reduced
     motion — puts the whole transcript up at once. */
  const finishIntro = useCallback(() => {
    setPrinted(lines.length);
    setCurrentTyping('');
    setCharIndex(0);
    setPhase('done');
    setShowButtons(true);
  }, [lines.length]);

  // `sealed` is the beat the theme shutter is closed over the panel; skipping
  // there would show the replay to a viewport that is covered anyway.
  const skipIntro = useCallback(() => {
    if (phase === 'typing' || phase === 'pause') finishIntro();
  }, [phase, finishIntro]);

  // Reduced motion never watches it type — not on the first load either, which
  // is the case the mode-switch guard alone used to miss.
  useEffect(() => {
    if (reduced) finishIntro();
  }, [reduced, finishIntro]);

  // Any key ends it. The field does not exist yet at that point, so the
  // listener is on the window; modifier-only presses are not an intent to skip.
  useEffect(() => {
    if (phase === 'done') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Shift' || e.key === 'Tab') return;
      skipIntro();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, skipIntro]);

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
      finishIntro();
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
      setTimeout(() => setShowButtons(true), 200);
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
      const timer = setTimeout(() => setPhase('typing'), prev?.pauseAfter || BEAT);
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
      }, currentLine.speed || CHAR_MS);
      return () => clearTimeout(timer);
    }
    advanceLine();
  }, [phase, charIndex, currentLine, lineIndex, lines, advanceLine]);

  /*
    Clicking the card puts the cursor in the field — but only when the click was
    not aimed at something else. A click on a CTA, a link or a shortcut button
    used to focus the input on its way past, which on a phone threw the keyboard
    up over the thing that had just been tapped; a click that ends a text
    selection used to do the same to anyone copying a line out.
  */
  const focusInput = useCallback((e: React.MouseEvent) => {
    if (phase !== 'done') { skipIntro(); return; }
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, [role="button"]')) return;
    if (!window.getSelection()?.isCollapsed) return;
    inputRef.current?.focus();
  }, [phase, skipIntro]);

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

  const toneClass = (tone: OutputLine['tone']) =>
    tone === 'muted' ? 'text-muted-dim'
      : tone === 'accent' || tone === 'success' ? 'text-primary'
      : tone === 'error' ? 'text-destructive'
      : 'text-muted-foreground';

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
          onClick={focusInput}
          // No max-height on the card itself. The intro is a fixed length and
          // clipping it behind an inner scrollbar hid the CTAs on short
          // viewports; what is bounded is the session log below, which is the
          // only part that grows.
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
              {/* The session log.

                  Bounded and self-scrolling: output collects here instead of
                  growing the card, so the prompt below keeps its place on the
                  page no matter how much has been run. Command output is laid
                  out in padded columns and is never re-wrapped — wrapping
                  broke every row mid-column and the alignment stopped meaning
                  anything — so it scrolls sideways when it has to, which is
                  what a terminal does. */}
              {entries.length > 0 && (
                <div
                  ref={logRef}
                  role="log"
                  aria-live="polite"
                  aria-atomic="false"
                  aria-label="Terminal output"
                  className="term-scroll -mx-1 mt-1 overflow-auto px-1"
                  style={{ maxHeight: 'min(46vh, 340px)' }}
                >
                  {entries.map((entry, i) => (
                    <div key={i} className="mt-2 first:mt-0">
                      <div className="whitespace-pre font-mono text-[13px] text-foreground">
                        <span className="text-primary">$</span> {entry.input}
                        {entry.aborted && <span className="text-muted-dim">^C</span>}
                      </div>
                      {entry.output.map((line, j) => (
                        <div
                          key={j}
                          className={`whitespace-pre font-mono text-[13px] leading-[1.7] ${toneClass(line.tone)}`}
                        >
                          {line.text || ' '}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

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
                    {/* Not drawn over the placeholder. Idle and empty, the
                        block landed on column zero — on top of the first
                        letter of `type 'help'` — and the hint read as a typo. */}
                    {(focused || draft.length > 0) && (
                      <span
                        aria-hidden="true"
                        className={
                          'pointer-events-none absolute top-1/2 h-[1.15em] w-[0.6em] -translate-y-1/2 bg-primary ' +
                          (focused ? 'animate-terminal-blink' : 'opacity-40')
                        }
                        style={{ left: `calc(${caret.col}ch - ${caret.scrollLeft}px)` }}
                      />
                    )}
                  </span>
                </div>

                {/* A touch keyboard has no Tab, no arrow keys and no Ctrl, which
                    is every affordance this shell has for finding its way around.
                    These are the replacement: the commands worth reaching without
                    typing, one tap each. `stopPropagation` keeps the tap off the
                    body's focus handler, so running one does not also throw the
                    keyboard up over the output it just printed. */}
                {touch && (
                  <div
                    className={
                      !roomForShortcuts
                        ? 'hidden'
                        : docked
                          ? // Above the keyboard there is no room to wrap: one row
                            // that scrolls, the way a keyboard accessory bar does.
                            'term-scroll mt-2 flex flex-nowrap gap-1.5 overflow-x-auto pb-1'
                          : 'mt-3.5 flex flex-wrap gap-1.5'
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
                )}
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
