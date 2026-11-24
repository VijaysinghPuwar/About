import { memo, useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { sweepHold } from '@/lib/theme-transition';
import {
  complete,
  runCommand,
  MISSION,
  TOOLSETS,
  type OutputLine,
  type TerminalProject,
} from '@/lib/terminal-commands';

/*
  The terminal is the identity of this site: the intro types itself out, and it
  becomes a real shell afterwards (help, tab-completion, arrow-key history,
  ctrl-c / ctrl-l).

  ── the rule the layout is built on ──

  The window does not change size. Not while the intro types, and not when a
  command prints.

  It used to do both. The card started at its minimum height and grew a line at
  a time as the intro printed, so the first three seconds of the page were the
  hero resizing six times and everything below it being pushed down by a couple
  of hundred pixels. Then the first command opened a separate log between the
  intro and the prompt, the card grew by another 340px, and the page was
  scrolled by the same amount to keep the prompt under the reader's hand, which
  slid the name off the top of the screen.

  Now the transcript is one scrolling screen, like the thing it is imitating:

    - Its height is the height of the finished intro. An invisible copy of the
      intro sits in normal flow and sizes the box; the real transcript is laid
      over it and scrolls. That is the whole mechanism. There is no measuring
      and no resize handler, so it is right at every width, after a font swap
      and after a rotation.
    - The intro types into space that is already reserved.
    - Output is appended to the same screen, which scrolls itself. The prompt
      sits under it, outside the scroller, so it cannot move.
    - The page is never scrolled by the terminal. (One exception, on a phone
      with the keyboard up; see the docking note below.)

  The intro copy is derived from the active mode, so switching to pentest
  rewrites the listed toolset, and the terminal types the new transcript out
  again rather than swapping it in place. It replays only when the intro is all
  there is: once the reader has run a command the intro is history sitting above
  their session, and retyping it would talk over them.
*/

interface IntroLine {
  type: 'command' | 'output' | 'gap';
  /** For a command, what is typed after the `$`. */
  text: string;
  style?: 'name' | 'role' | 'mission' | 'tools';
  items?: readonly string[];
  /** How long the line sits before the next one starts. */
  pauseAfter: number;
}

/*
  Typing speed. The banner is the thing standing between a visitor and a shell
  they can use, so it is paced to be watched once, not admired: ~18ms a
  character and a beat between lines, which lands the whole intro in about
  three seconds.
*/
const CHAR_MS = 18;
const BEAT = 150;
const HOLD = 220;
const GAP = 60;

function introLines(isPentest: boolean): IntroLine[] {
  const gap: IntroLine = { type: 'gap', text: '', pauseAfter: GAP };

  return [
    { type: 'command', text: 'whoami', pauseAfter: HOLD },
    { type: 'output', text: 'Vijaysingh Puwar', style: 'name', pauseAfter: HOLD },
    gap,
    { type: 'command', text: 'cat role.txt', pauseAfter: HOLD },
    { type: 'output', text: 'Cybersecurity Engineer', style: 'role', pauseAfter: HOLD },
    gap,
    // Pentest mode prints no mission: `ls offense/` is the claim, and a
    // paragraph in front of it was restating the tools in prose.
    ...(isPentest
      ? []
      : ([
          { type: 'command', text: 'cat mission.txt', pauseAfter: BEAT },
          { type: 'output', text: MISSION, style: 'mission', pauseAfter: HOLD },
          gap,
        ] as IntroLine[])),
    { type: 'command', text: isPentest ? 'ls offense/' : 'ls defense/', pauseAfter: BEAT },
    {
      type: 'output',
      text: '',
      style: 'tools',
      items: isPentest ? TOOLSETS.offense : TOOLSETS.defense,
      pauseAfter: HOLD,
    },
    gap,
    { type: 'command', text: './connect.sh', pauseAfter: BEAT },
  ];
}

/** Where the intro has got to: lines fully printed, and characters of the next. */
interface Cursor {
  printed: number;
  typed: number;
}

/*
  The whole intro as a list of moments. The typewriter used to be a chain of
  timeouts, one per character, each scheduled by the render the last one caused:
  a busy main thread stretched every gap, so the pace wandered and the intro
  ran long exactly when the page was still loading. With the timeline worked out
  up front, one animation-frame loop reads the clock and shows whatever should
  be on screen by now. A dropped frame skips a character; it does not delay the
  ones after it.
*/
function timeline(lines: IntroLine[]): { at: number; cursor: Cursor }[] {
  const out: { at: number; cursor: Cursor }[] = [];
  let at = 0;
  lines.forEach((line, i) => {
    if (line.type === 'command') {
      for (let c = 1; c <= line.text.length; c++) {
        at += CHAR_MS;
        out.push({ at, cursor: { printed: i, typed: c } });
      }
    }
    out.push({ at, cursor: { printed: i + 1, typed: 0 } });
    at += line.pauseAfter;
  });
  return out;
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

/** Enough to scroll back through; not so much that a long session costs anything. */
const MAX_ENTRIES = 50;

/** Ease-out over this long when the screen moves to show a new answer. */
const GLIDE_MS = 170;

interface TerminalHeroProps {
  /** Backs `projects`, `open` and `skills`. */
  projects: TerminalProject[];
}

/** One entered command and everything it printed. */
interface HistoryEntry {
  id: number;
  input: string;
  output: OutputLine[];
  /** Ctrl+C: the line was abandoned rather than run. */
  aborted?: boolean;
}

const MONO = 'font-mono text-[13px] leading-[1.7]';

const toneClass = (tone: 'default' | 'muted' | 'accent' | 'success' | 'error' | undefined) =>
  tone === 'muted' ? 'text-muted-dim'
    : tone === 'accent' || tone === 'success' ? 'text-primary'
    : tone === 'error' ? 'text-destructive'
    : 'text-muted-foreground';

function OutputRow({ line }: { line: OutputLine }) {
  if (line.kind === 'row') {
    const [key, value, note] = line.cells;
    // A key longer than its column gets the line to itself and its value is
    // set underneath, back in the value column, the way a man page handles a
    // long option. The indent only applies while the other rows in the block
    // are side by side: `100cqw` is the screen's width, and the clamp is zero
    // below the width at which their values have already wrapped under their
    // keys, where an indent would only narrow the text for no alignment.
    const overlong = key.length > line.keyWidth;
    const column = line.keyWidth + 2;
    return (
      // The key holds a fixed column so values line up down the block. When
      // the card is too narrow for a key and a readable value side by side,
      // the value wraps to its own line: that is `flex-wrap` and the value's
      // 18-character basis, not a breakpoint.
      <div className={`flex flex-wrap gap-x-[2ch] ${MONO}`}>
        <span
          className="max-w-full shrink-0 text-foreground [overflow-wrap:anywhere]"
          style={{ minWidth: `${line.keyWidth}ch` }}
        >
          {key}
        </span>
        <span
          className={`min-w-0 flex-1 text-muted-foreground [overflow-wrap:anywhere] ${overlong ? 'basis-full' : 'basis-[18ch]'}`}
          style={
            overlong
              ? { paddingLeft: `clamp(0px, calc((100cqw - ${column + 18}ch) * 9999), ${column}ch)` }
              : undefined
          }
        >
          {value}
        </span>
        {note && <span className="shrink-0 text-muted-dim">{note}</span>}
      </div>
    );
  }

  if (line.kind === 'list') {
    const widest = Math.max(...line.items.map(item => item.length));
    return (
      <div
        className={`grid gap-x-[2ch] text-muted-foreground ${MONO}`}
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${widest}ch, 100%), 1fr))` }}
      >
        {line.items.map(item => (
          <span key={item} className="[overflow-wrap:anywhere]">{item}</span>
        ))}
      </div>
    );
  }

  return (
    <div className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${MONO} ${toneClass(line.tone)}`}>
      {line.text || ' '}
    </div>
  );
}

/* Memoised: typing a character re-renders the prompt, and should not walk
   every line the session has printed to find that none of them changed. */
const SessionLog = memo(function SessionLog({ entries }: { entries: HistoryEntry[] }) {
  if (!entries.length) return null;
  return (
    <div role="log" aria-live="polite" aria-atomic="false" aria-label="Terminal output">
      {entries.map(entry => (
        <div key={entry.id} data-entry className="pt-3">
          <div className={`text-foreground [overflow-wrap:anywhere] ${MONO}`}>
            <span className="text-primary">$</span> {entry.input}
            {entry.aborted && <span className="text-muted-dim">^C</span>}
          </div>
          {entry.output.map((line, i) => <OutputRow key={i} line={line} />)}
        </div>
      ))}
    </div>
  );
});

function IntroRow({ line }: { line: IntroLine }) {
  if (line.type === 'gap') return <div className="h-4" />;

  // The `$` in the accent and the command itself dim, which is how a real
  // prompt reads.
  if (line.type === 'command') {
    return (
      <div className={`text-muted-dim ${MONO}`}>
        <span className="text-primary">$</span> {line.text}
      </div>
    );
  }

  switch (line.style) {
    case 'name':
      return (
        <div className="mb-[18px] mt-1.5 text-[clamp(32px,4.2vw,48px)] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground">
          {line.text}
        </div>
      );
    case 'role':
      return (
        // The location wraps as one piece. The dot between the two is only
        // drawn when they share a line (`.term-sep`, a container query on the
        // screen): on a phone the location drops to its own line, and a row
        // that opens with a separator reads as a bullet.
        <div className="mb-[18px] mt-1 text-[19px] font-medium tracking-[-0.012em] text-foreground">
          {line.text}{' '}
          <span className="whitespace-nowrap font-normal text-muted-dim">
            <span className="term-sep" aria-hidden="true">· </span>New York, NY
          </span>
        </div>
      );
    case 'mission':
      return (
        <div className="max-w-[52ch] text-[16px] leading-[1.6] text-muted-foreground">
          {line.text}
        </div>
      );
    case 'tools':
      // Each tool is one unbreakable word. Set as a single string the line
      // broke at the hyphens, so `Secure-Coding` ended one row on `Secure-`
      // and started the next on `Coding`.
      return (
        <div className="my-1 flex flex-wrap gap-x-[1.6ch] font-mono text-[12.5px] leading-[1.7] text-muted-foreground">
          {line.items?.map(item => <span key={item} className="whitespace-nowrap">{item}</span>)}
        </div>
      );
    default:
      return <div className={`text-foreground ${MONO}`}>{line.text}</div>;
  }
}

/* The intro never changes between keystrokes, so it is not re-rendered by them. */
const Intro = memo(function Intro({ lines, upTo }: { lines: IntroLine[]; upTo: number }) {
  return <>{lines.slice(0, upTo).map((line, i) => <IntroRow key={i} line={line} />)}</>;
});

export function TerminalHero({ projects }: TerminalHeroProps) {
  const { user } = useAuth();
  const { isPentest, toggleTheme } = useTheme();
  const reduced = useReducedMotion();

  // Recomputed on a mode switch.
  const lines = useMemo(() => introLines(isPentest), [isPentest]);

  /* ── interactive shell (starts once the intro has typed out) ── */
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  /* Kept apart from `entries` so `clear` wipes the screen and not the history,
     which is what every shell does and what the arrow keys are for. */
  const [history, setHistory] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [recall, setRecall] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const print = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    setEntries(prev => [...prev, { ...entry, id: nextId.current++ }].slice(-MAX_ENTRIES));
  }, []);

  /* Where the block caret is drawn: the cursor's column, and how far the field
     has scrolled once the line outgrows it. */
  const [caret, setCaret] = useState({ col: 0, scrollLeft: 0 });
  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const col = el.selectionStart ?? el.value.length;
    const scrollLeft = el.scrollLeft;
    // Same object back when nothing moved, so React skips the render. This
    // runs on every select, scroll and draft change, most of which are no-ops.
    setCaret(prev => (prev.col === col && prev.scrollLeft === scrollLeft ? prev : { col, scrollLeft }));
  }, []);

  /* Touch affordances answer a touch keyboard, not a narrow window, so they key
     off the pointer; the width stays in the test so a phone whose browser lies
     about its pointer is still covered. */
  const narrow = useMedia('(max-width: 639px)');
  const coarse = useMedia('(pointer: coarse)');
  const touch = coarse || narrow;

  /* Running a command is separate from submitting the field, because the touch
     shortcut row runs commands that were never typed into it. */
  const run = useCallback((raw: string) => {
    const input = raw.trim();
    setRecall(null);
    if (!input) return;

    // Consecutive repeats are noise in the arrow-key walk, so collapse them.
    setHistory(prev => (prev[prev.length - 1] === input ? prev : [...prev, input]));

    const { output, silent } = runCommand(input, {
      projects,
      isAuthed: Boolean(user),
      clear: () => setEntries([]),
      history,
      isPentest,
      setPentest: (on: boolean) => { if (on !== isPentest) toggleTheme(); },
      touch,
    });

    if (!silent) print({ input, output });
  }, [projects, user, history, isPentest, toggleTheme, touch, print]);

  const submit = useCallback(() => {
    const input = draft;
    setDraft('');
    run(input);
  }, [draft, run]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); return; }

    if (e.key === 'Tab') {
      // Shift+Tab is how a keyboard user gets back out of the field.
      if (e.shiftKey) return;
      e.preventDefault();
      const hit = complete(draft, projects);
      if (!hit) return;
      setDraft(hit.value);
      // Several things still match: print them the way bash does, so a second
      // Tab is an answer rather than a key that appears not to work.
      if (hit.candidates.length > 1) {
        print({ input: draft, output: [{ kind: 'list', items: hit.candidates }] });
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

    // The screen scrolls itself but has no tab stop of its own, so the field
    // pages it. This is also what a terminal does.
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      const el = screenRef.current;
      if (!el) return;
      e.preventDefault();
      el.scrollBy({ top: (e.key === 'PageUp' ? -1 : 1) * el.clientHeight * 0.85 });
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      // Echo the abandoned line rather than swallowing it, so Ctrl+C reads as
      // something that happened instead of the field silently emptying.
      if (draft.trim()) print({ input: draft, output: [], aborted: true });
      setDraft('');
      setRecall(null);
      return;
    }

    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setEntries([]); }
  }, [draft, projects, recall, submit, history, print]);

  /*
    ── the prompt and the on-screen keyboard ──

    A phone keyboard does not resize the page. It draws itself over the bottom
    of the layout viewport, and the line you tapped to open it ends up
    underneath. Scrolling the page to compensate is the obvious answer and it is
    the wrong one on iOS: Safari is scrolling too (it moves the visual viewport
    inside the layout viewport rather than moving the document) so a scroll of
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
    URL bar (which moves the same numbers by a much smaller amount) from
    reading as a keyboard.
  */
  const promptRef = useRef<HTMLDivElement>(null);
  /* The gap the docked prompt left behind in the card, the point in the
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
    bar. Safari has nothing to fight over here. The focused field is fixed, so
    it is already in view as far as the browser is concerned.

    This is the only place the terminal moves the page.
  */
  const alignToKeyboard = useCallback(() => {
    if (!docked) return;
    const vv = window.visualViewport;
    const bar = promptRef.current;
    const anchor = anchorRef.current;
    if (!bar || !anchor) return;

    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    // `visibleBottom` is already the keyboard's top edge; the bar sits on it,
    // and the transcript should end where the prompt used to be, directly
    // above it, whether that means scrolling down to it or back up to it.
    const room = visibleBottom - bar.offsetHeight;
    const shift = anchor.getBoundingClientRect().top - room;
    if (Math.abs(shift) > 2) window.scrollBy({ top: shift, behavior: 'instant' as ScrollBehavior });
  }, [docked]);

  // The bar lands after the keyboard has finished animating, so this runs on the
  // state that says it landed rather than on the focus that started it.
  useEffect(() => {
    if (docked) requestAnimationFrame(alignToKeyboard);
  }, [docked, alignToKeyboard]);

  /*
    Which edges of the screen have more transcript beyond them.

    The screen's height is whatever the intro came to, not a whole number of
    lines, so wherever it is scrolled to, one edge or the other falls through
    the middle of a row of text. Left as a hard cut that reads as a rendering
    fault, directly above the prompt. The stylesheet fades the last few pixels
    at an edge that has more behind it (`.term-screen[data-above]` and
    `[data-below]`), which hides the cut and is also the only cue, on a
    platform with overlay scrollbars, that there is anything to scroll to.

    Written straight to the element. It changes as the reader scrolls, and
    nothing React renders depends on it.
  */
  const markEdges = useCallback(() => {
    const el = screenRef.current;
    if (!el) return;
    el.toggleAttribute('data-above', el.scrollTop > 1);
    el.toggleAttribute('data-below', el.scrollTop < el.scrollHeight - el.clientHeight - 1);
  }, []);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    markEdges();
    el.addEventListener('scroll', markEdges, { passive: true });
    // The intro re-wraps on a resize, which moves the edges without a scroll.
    const resized = new ResizeObserver(markEdges);
    resized.observe(el);
    return () => {
      el.removeEventListener('scroll', markEdges);
      resized.disconnect();
    };
  }, [markEdges]);

  /*
    Bring the newest answer into view inside the screen.

    A short answer ends at the bottom edge, above the prompt. One taller than
    the screen is shown from its first line instead, with the rest below it to
    scroll to: landing on the tail of a long list hid the command that produced
    it and the start of what it said.

    The move is eased over a few frames so the transcript is seen to travel
    rather than being swapped for a different one. It is still short enough to
    be over before a second key can be pressed. Layout effect, so the first
    frame of it is the frame the output arrives in.
  */
  const glide = useRef(0);
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    cancelAnimationFrame(glide.current);

    const all = el.querySelectorAll<HTMLElement>('[data-entry]');
    const last = all[all.length - 1];
    const end = el.scrollHeight - el.clientHeight;
    const target = Math.max(0, last ? Math.min(end, last.offsetTop) : end);
    const from = el.scrollTop;

    if (reduced || Math.abs(target - from) < 2) {
      el.scrollTop = target;
      // No scroll event fires when the position does not change, but the
      // content under it may have (a `clear`, a first short answer).
      markEdges();
      return;
    }

    const started = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / GLIDE_MS);
      el.scrollTop = from + (target - from) * (1 - (1 - p) ** 3);
      if (p < 1) glide.current = requestAnimationFrame(step);
    };
    glide.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(glide.current);
  }, [entries, reduced, markEdges]);

  // `onSelect` covers typing, clicking and the arrow keys, but not the times
  // the draft is rewritten from under the field: tab-completion, history
  // recall, ctrl-c. Re-read the cursor after any of those land.
  useEffect(() => { syncCaret(); }, [draft, syncCaret]);

  /* ── typewriter intro ── */
  // `sealed` is the replay waiting out the theme shutter: transcript emptied,
  // nothing drawn, no caret. The panel is behind the plates for that beat.
  const [phase, setPhase] = useState<'sealed' | 'typing' | 'done'>(() => (reduced ? 'done' : 'typing'));
  // Reduced motion starts on the finished transcript, so not even the first
  // frame shows it typing.
  const [cursor, setCursor] = useState<Cursor>(() => ({ printed: reduced ? lines.length : 0, typed: 0 }));
  const ready = phase === 'done';

  /* The banner is not the point of the terminal, so anything that says the
     reader is ready to use it (a click on the card, a keystroke, reduced
     motion) puts the whole transcript up at once. */
  const finishIntro = useCallback(() => {
    setCursor({ printed: lines.length, typed: 0 });
    setPhase('done');
  }, [lines.length]);

  useEffect(() => {
    if (reduced) finishIntro();
  }, [reduced, finishIntro]);

  // Any key ends it. Modifier-only presses are not an intent to skip, and Tab
  // is someone moving through the page.
  useEffect(() => {
    if (phase !== 'typing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Shift' || e.key === 'Tab') return;
      finishIntro();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, finishIntro]);

  /*
    A new transcript arrived, which only ever means the mode changed. Type it
    out again from the top, after the shutter, so the retype is watched rather
    than spent behind the plates.

    Two cases skip it: a shell the reader has already used, and reduced motion,
    where there is no shutter and no replay. Both still have to reconcile the
    counter, because the two modes do not print the same number of lines.
  */
  const holdMs = useRef(0);
  const firstTranscript = useRef(true);
  const used = entries.length > 0;
  useEffect(() => {
    if (firstTranscript.current) {
      firstTranscript.current = false;
      return;
    }
    if (used || reduced) {
      finishIntro();
      return;
    }
    holdMs.current = sweepHold();
    setCursor({ printed: 0, typed: 0 });
    setPhase('sealed');
    // Keyed to the transcript changing, not to the state it resets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  useEffect(() => {
    if (phase === 'sealed') {
      const timer = setTimeout(() => setPhase('typing'), holdMs.current);
      return () => clearTimeout(timer);
    }
    if (phase !== 'typing') return;

    const moments = timeline(lines);
    const started = performance.now();
    let shown = 0;
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - started;
      let next = shown;
      while (next < moments.length && moments[next].at <= elapsed) next++;
      if (next !== shown) {
        shown = next;
        setCursor(moments[next - 1].cursor);
      }
      if (shown >= moments.length) { setPhase('done'); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, lines]);

  /*
    Typing anywhere on the page starts a command.

    The field used to need a click first, which is the one step a terminal
    never asks for. With a keyboard and no touch screen, a printable key
    pressed while nothing else has focus goes to the prompt, as long as the
    terminal is on screen to receive it. Focus moves during `keydown`, so the
    character that caused it lands in the field as well.

    Space is left alone (it scrolls the page), and so is anything with a
    modifier, anything typed into another control, and anything typed while a
    dialog is open over the page.
  */
  useEffect(() => {
    if (!ready || touch) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      if (e.key.length !== 1 || e.key === ' ') return;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      if (document.querySelector('[role="dialog"]')) return;
      const card = cardRef.current;
      if (!card) return;
      const box = card.getBoundingClientRect();
      if (box.bottom < 120 || box.top > window.innerHeight - 120) return;
      inputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, touch]);

  /*
    Clicking the card puts the cursor in the field, but only when the click was
    not aimed at something else. A click on a CTA, a link or a shortcut button
    used to focus the input on its way past, which on a phone threw the keyboard
    up over the thing that had just been tapped; a click that ends a text
    selection used to do the same to anyone copying a line out.
  */
  const focusInput = useCallback((e: React.MouseEvent) => {
    if (phase === 'typing') { finishIntro(); return; }
    if (!ready) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, [role="button"]')) return;
    if (!window.getSelection()?.isCollapsed) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [phase, ready, finishIntro]);

  const typing = phase === 'typing' ? lines[cursor.printed] : undefined;

  return (
    <div className="w-full">
      <div ref={cardRef} className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Chrome bar. The lit dot is the accent, so the window title and the
            mode agree; the other two stay inert because they do nothing. */}
        <div className="flex items-center gap-3 border-b border-border bg-card-elevated px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-border-strong" />
            <span className="h-2 w-2 rounded-full bg-border-strong" />
          </span>
          <span className="select-none font-mono text-[11.5px] text-muted-dim">
            vijaysingh@{isPentest ? 'offense' : 'defense'}:~$
          </span>
        </div>

        <div onClick={focusInput} className="px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-7">
          {/* The screen. See the note at the top of this file: the hidden copy
              sizes it, the layer over it scrolls. Both reserve the same
              scrollbar gutter, so on a platform whose scrollbars take up room
              the two wrap their text at the same width; the negative margin
              gives that gutter back out of the card's own padding. */}
          <div className="relative -mr-1.5">
            <div
              aria-hidden="true"
              data-nosnippet
              className="term-screen term-scroll invisible overflow-hidden [scrollbar-gutter:stable]"
            >
              <Intro lines={lines} upTo={lines.length} />
            </div>

            <div
              ref={screenRef}
              className="term-screen term-scroll absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
            >
              <Intro lines={lines} upTo={cursor.printed} />

              {/* The line being typed. The caret is solid: a blink is what a
                  prompt does when it is waiting, and this one is not. */}
              {typing?.type === 'command' && (
                <div className={`text-muted-dim ${MONO}`}>
                  <span className="text-primary">$</span> {typing.text.slice(0, cursor.typed)}
                  <span
                    aria-hidden="true"
                    className="ml-px inline-block h-[1.15em] w-[0.6em] translate-y-[0.2em] bg-primary"
                  />
                </div>
              )}

              <SessionLog entries={entries} />
            </div>
          </div>

          {/* The prompt. It is in the layout from the first frame, hidden until
              the intro is done, so its arrival does not move anything either. */}
          <div className={ready ? undefined : 'invisible'}>
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
              {/* 16px wherever there is a touch keyboard, 13px otherwise.
                  Anything under 16px makes iOS Safari zoom the whole page the
                  moment the field takes focus, and it never zooms back out.
                  The row carries the size so the input and the block caret
                  stay in step: the caret is positioned in `ch` and sized in
                  `em`, both of which follow whatever the row is set to. It is
                  keyed off the same test as the rest of the touch affordances;
                  keyed off width alone, a tablet got a 16px field (forced by
                  the global rule) over a 13px caret grid, and the block drifted
                  further behind the text with every character. */}
              <div className={`mt-2.5 flex items-center gap-2.5 font-mono ${touch ? 'text-[16px]' : 'text-[13px]'}`}>
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
                    aria-label="Terminal input. Type help for available commands"
                    placeholder={entries.length ? '' : "type 'help'"}
                    className="w-full min-w-0 border-0 bg-transparent p-0 font-mono text-[1em] text-foreground caret-transparent outline-none placeholder:text-muted-dim focus:ring-0"
                  />
                  {/* The block caret, on the cursor's own column. The face is
                      monospace, so a column is exactly `1ch` and nothing has
                      to be measured; `scrollLeft` keeps it honest once the
                      line is long enough to scroll, and the input's own caret
                      is hidden so there is only ever one.

                      Keyed on where it is, so every keystroke restarts the
                      blink from "on". Left to run, the blink carried on at its
                      own pace while the reader typed and the caret spent half
                      of that time invisible.

                      Not drawn over the placeholder: idle and empty, the block
                      landed on the first letter of the hint. */}
                  {(focused || draft.length > 0) && (
                    <span
                      key={`${caret.col}:${draft.length}`}
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
                  typing, one tap each. */}
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
                      onClick={() => run(cmd)}
                      className="min-h-[40px] shrink-0 rounded-[4px] border border-border px-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground active:border-primary active:text-primary"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Holds the prompt's place in the card while it is docked. */}
            {docked && (
              <div ref={anchorRef} style={{ height: flowHeight.current }} aria-hidden="true" />
            )}
          </div>

          {/* What `./connect.sh` connects to. Reserved like the prompt, and
              faded rather than popped in. */}
          <div
            className={
              'mt-5 flex flex-col gap-2.5 border-t border-border pt-5 transition-opacity duration-200 sm:flex-row ' +
              (ready ? 'opacity-100' : 'invisible opacity-0')
            }
          >
            <button
              type="button"
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
                a resume. */}
            <a
              href="/resume.pdf"
              download
              className="btn-outline inline-flex h-11 items-center justify-center gap-2.5 rounded-md px-[18px] text-[14.5px] font-medium"
            >
              Download résumé <span className="font-mono text-[11px] text-muted-dim">PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
