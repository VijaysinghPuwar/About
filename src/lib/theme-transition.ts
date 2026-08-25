/*
  Theme switch as a shutter, not a cross-fade.

  Vertical plates ratchet across the viewport in alternating directions, hold it
  closed for a little over two seconds, then clear the far side. The class swap
  happens inside that closed beat, so the reader never watches colours crawl
  from green to red — they watch the site shut, reconfigure and reopen in the
  other stance.

  The whole cue runs about three and a half seconds on purpose. A 200ms wipe is
  something you notice afterwards, not something you feel, and the sealed beat
  is sequenced around the text rather than the other way round: the plates seal,
  the mode name resolves out of noise, it sits still for a beat and a half so it
  can actually be read, and only then do the plates continue. Most of the
  duration is that hold — the plates themselves move quickly at either end.

  Written against the flat palette: plates are painted in `--background` with a
  single hairline `--primary` leading edge. No glow, no coloured shadow, no
  second hue — the same rules the rest of the design keeps.

  The overlay is `position: fixed`, anchored to the viewport rather than to any
  scrolled ancestor, so the plates cover what the reader is actually looking at
  no matter how far down the page they are.

  `prefers-reduced-motion` skips all of it — plates and audio both — and commits
  the swap immediately.
*/

const DUR = 3200;
const STAGGER = 40;

/** Six columns below this width, nine at or above it. */
const NARROW = 640;

/*
  Each plate crosses in over the first 12% of its run, holds until 88%, then
  crosses out — see the `theme-plate-*` keyframes in `index.css`. Because plate
  n starts n * STAGGER late, the viewport is only fully covered between the last
  plate's arrival and the first plate's departure, and everything timed below
  has to land inside that window.
*/
const CLOSE = 0.12;
const OPEN = 0.88;

function plateCount() {
  return window.innerWidth < NARROW ? 6 : 9;
}

/** How long the mode name takes to resolve out of noise. */
const SCRAMBLE_STEPS = 14;
const SCRAMBLE_STEP = 34;
const SCRAMBLE_MS = SCRAMBLE_STEPS * SCRAMBLE_STEP;

function marks(plates: number) {
  const tail = (plates - 1) * STAGGER;
  const label = 0.24 * DUR;
  return {
    /** Last plate lands; the viewport is now sealed. */
    sealed: CLOSE * DUR + tail,
    /** Class swap, just inside the seal. */
    commit: 0.14 * DUR + tail,
    /** The mode name starts resolving, in step with the label fading up. */
    label,
    /** The name has landed. Everything after this is reading time. */
    resolved: label + SCRAMBLE_MS,
    /** Colour transitions come back; plates have not lifted yet. */
    reveal: 0.82 * DUR,
    /** First plate starts to clear. */
    opening: OPEN * DUR,
    teardown: DUR + tail + 40,
  };
}

const SOUND_KEY = 'theme-transition-sound';

let running = false;
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'off';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, muted ? 'off' : 'on');
  } catch {
    /* private mode — the preference just doesn't persist */
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/*
  The cue is synthesized rather than shipped as a file: the whole thing is under
  a kilobyte of code and needs no network round trip on the one frame where the
  page is already busy animating. The context is created on the click that
  starts the sweep — a user gesture — which is the only moment a browser will
  let it start unsuspended.
*/
function audio(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  const frames = Math.floor(ctx.sampleRate * 0.8);
  noise = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** Attack/decay envelope. Exponential ramps cannot reach zero, hence the floor. */
function envelope(ac: AudioContext, at: number, peak: number, attack: number, len: number) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  return g;
}

/** Air moving past the plates: broadband noise swept through a bandpass. */
function air(
  ac: AudioContext,
  out: AudioNode,
  at: number,
  peak: number,
  from: number,
  to: number,
  len: number,
) {
  if (!noise) return;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const band = ac.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.1;
  band.frequency.setValueAtTime(from, at);
  band.frequency.exponentialRampToValueAtTime(to, at + len);
  src.connect(band).connect(envelope(ac, at, peak, 0.02, len)).connect(out);
  src.start(at);
  src.stop(at + len + 0.05);
}

/** One plate seating, or one glyph landing: a dry tick. */
function tick(ac: AudioContext, out: AudioNode, at: number, peak: number, hz = 1700) {
  if (!noise) return;
  const src = ac.createBufferSource();
  src.buffer = noise;
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = hz;
  src.connect(hp).connect(envelope(ac, at, peak, 0.002, 0.035)).connect(out);
  src.start(at);
  src.stop(at + 0.08);
}

/**
 * A low bed under the sealed beat. Without it the second and a half where the
 * plates just sit there reads as the audio having failed rather than as the
 * machine thinking.
 */
function bed(ac: AudioContext, out: AudioNode, at: number, len: number) {
  if (!noise) return;
  const src = ac.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(0.03, at + 0.18);
  g.gain.setValueAtTime(0.03, at + len - 0.25);
  g.gain.linearRampToValueAtTime(0.0001, at + len);
  src.connect(lp).connect(g).connect(out);
  src.start(at);
  src.stop(at + len + 0.05);
}

/** The shutter bottoming out: a low body thump you feel more than hear. */
function thump(ac: AudioContext, out: AudioNode, at: number) {
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(130, at);
  osc.frequency.exponentialRampToValueAtTime(52, at + 0.3);
  osc.connect(envelope(ac, at, 0.32, 0.006, 0.34)).connect(out);
  osc.start(at);
  osc.stop(at + 0.4);
}

/**
 * A struck note: triangle body with a quiet octave on top. Security sits a
 * fourth above pentest, so the two directions are audibly different without
 * either sounding like an error.
 */
function lock(
  ac: AudioContext,
  out: AudioNode,
  at: number,
  hz: number,
  peak = 0.17,
  len = 0.55,
) {
  const body = ac.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(hz, at);
  body.connect(envelope(ac, at, peak, 0.008, len)).connect(out);
  body.start(at);
  body.stop(at + len + 0.05);

  const shine = ac.createOscillator();
  shine.type = 'sine';
  shine.frequency.setValueAtTime(hz * 2, at + 0.02);
  shine.connect(envelope(ac, at + 0.02, peak * 0.32, 0.006, len * 0.55)).connect(out);
  shine.start(at + 0.02);
  shine.stop(at + len * 0.6 + 0.05);
}

function playCue(toPentest: boolean, plates: number, m: ReturnType<typeof marks>) {
  if (isSoundMuted()) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();

  const out = ac.createGain();
  out.gain.value = 0.9;
  out.connect(ac.destination);

  const t = ac.currentTime + 0.02;
  const root = toPentest ? 349.23 : 523.25;

  // Close: rushing air, one tick per plate as it seats, then the bottom-out.
  air(ac, out, t, 0.17, 3200, 260, (m.sealed + 120) / 1000);
  for (let i = 0; i < plates; i++) {
    tick(ac, out, t + (CLOSE * DUR + i * STAGGER) / 1000, 0.075);
  }
  thump(ac, out, t + m.sealed / 1000);

  // Sealed: the mode's own note over a low bed, then a blip per glyph as the
  // name resolves — the sound of a readout settling, not of nothing happening.
  lock(ac, out, t + (m.commit + 60) / 1000, root);
  bed(ac, out, t + m.sealed / 1000, (m.opening - m.sealed) / 1000);
  const blips = 7;
  for (let i = 0; i < blips; i++) {
    tick(ac, out, t + (m.label + (i * SCRAMBLE_MS) / blips) / 1000, 0.05, 2800);
  }

  // The name has landed: a fifth above the mode note confirms it, and the
  // reading beat runs on the bed alone from here.
  lock(ac, out, t + m.resolved / 1000, root * 1.5, 0.09, 0.4);

  // Release, then open the other way.
  tick(ac, out, t + (m.opening - 60) / 1000, 0.1, 900);
  air(ac, out, t + m.opening / 1000, 0.13, 300, 3600, 0.7);
}

function plate(index: number, plates: number): HTMLDivElement {
  const el = document.createElement('div');
  const down = index % 2 === 0;
  el.style.cssText = [
    'position:absolute',
    'top:0',
    'height:100%',
    `width:${100 / plates + 0.1}%`,
    `left:${(index * 100) / plates}%`,
    'background:hsl(var(--background))',
    'will-change:transform',
    `${down ? 'border-bottom' : 'border-top'}:1.5px solid hsl(var(--primary))`,
    `animation:theme-plate-${down ? 'down' : 'up'} ${DUR}ms both`,
    `animation-delay:${index * STAGGER}ms`,
  ].join(';');
  return el;
}

/**
 * The mode name resolves out of noise left to right, so it reads as a value
 * being decided rather than a caption being shown. Returns the interval id.
 */
function scramble(el: HTMLElement, word: string): number {
  const junk = '#$%&/\\<>=+*10';
  const steps = SCRAMBLE_STEPS;
  el.textContent = word.replace(/./g, ' ');
  let tick = 0;
  return window.setInterval(() => {
    tick++;
    const locked = Math.floor((tick / steps) * word.length);
    el.textContent = word
      .split('')
      .map((c, i) => (i < locked ? c : junk[(Math.random() * junk.length) | 0]))
      .join('');
    if (tick >= steps) el.textContent = word;
  }, SCRAMBLE_STEP);
}

/**
 * Run the shutter and commit the theme inside it.
 *
 * `commit` is what actually swaps the class; it is called once, mid-sweep.
 * Returns immediately — the caller does not await the animation.
 */
export function runThemeSweep(next: 'default' | 'pentest', commit: () => void) {
  if (prefersReducedMotion()) {
    commit();
    return;
  }
  if (running) return;
  running = true;

  const plates = plateCount();
  const m = marks(plates);

  const root = document.documentElement;
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText =
    'position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;contain:strict';

  for (let i = 0; i < plates; i++) wrap.appendChild(plate(i, plates));

  const label = document.createElement('div');
  label.style.cssText =
    'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;gap:14px;padding:0 20px;text-align:center;' +
    `font-family:'IBM Plex Mono',monospace;animation:theme-plate-label ${DUR}ms linear both`;

  const kicker = document.createElement('div');
  kicker.textContent = 'RECALIBRATING';
  kicker.style.cssText =
    'font-size:clamp(9px,2.4vw,10.5px);font-weight:500;letter-spacing:.4em;' +
    'text-indent:.4em;color:hsl(var(--muted-foreground-dim))';

  const word = document.createElement('div');
  word.style.cssText =
    'font-size:clamp(24px,4.4vw,42px);font-weight:600;letter-spacing:.16em;' +
    'text-indent:.16em;color:hsl(var(--primary));white-space:nowrap';

  const seam = document.createElement('div');
  seam.style.cssText =
    'width:min(280px,62vw);height:1px;background:hsl(var(--primary));transform:scaleX(0);' +
    `animation:theme-plate-seam ${DUR}ms cubic-bezier(.62,0,.3,1) both`;

  label.append(kicker, word, seam);
  wrap.appendChild(label);
  document.body.appendChild(wrap);

  playCue(next === 'pentest', plates, m);

  // Colour transitions are suppressed while the plates are down, so the new
  // palette is already settled by the time anything is visible again.
  root.setAttribute('data-theme-sweep', '');

  let iv = 0;
  window.setTimeout(commit, m.commit);
  window.setTimeout(() => {
    iv = scramble(word, next === 'pentest' ? 'PENTEST' : 'SECURITY');
  }, m.label);
  window.setTimeout(() => root.removeAttribute('data-theme-sweep'), m.reveal);
  window.setTimeout(() => {
    window.clearInterval(iv);
    wrap.remove();
    running = false;
  }, m.teardown);
}
