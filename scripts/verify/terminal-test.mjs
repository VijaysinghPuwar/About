// Functional test of the hero terminal: every command, every key, and the
// invariants the layout promises (the card never resizes, the page never
// scrolls or shifts, nothing scrolls sideways).
//
//   node scripts/verify/terminal-test.mjs 1440x900
//   node scripts/verify/terminal-test.mjs 375x812m      m = touch emulation
import { Page, sleep } from './cdp.mjs';

const [size = '1440x900'] = process.argv.slice(2);
const m = /^(\d+)x(\d+)(m?)$/.exec(size);
const vp = { width: +m[1], height: +m[2], mobile: m[3] === 'm', dpr: 1 };
const BASE = process.env.BASE ?? 'http://localhost:4173';

const page = await Page.open();
await page.viewport(vp);
await page.send('Browser.setDownloadBehavior', { behavior: 'deny' }).catch(() => {});
// Every layout shift the browser reports, with what moved. Installed before
// any page script. `__fontsAt` marks when the web fonts have settled: on a
// first visit the fallback face is swapped for IBM Plex about 150ms in, which
// moves right-aligned text (the nav links) a few pixels once. That is the
// font arriving, not the terminal, and it only exists with a cold cache, so it
// is not held against the intro.
await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__shifts = []; window.__fontsAt = Infinity;
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__shifts.push({
      t: e.startTime, v: e.value,
      src: e.sources.map(s => ({ w: Math.round(s.currentRect.width), h: Math.round(s.currentRect.height), y: Math.round(s.currentRect.y),
        node: s.node && s.node.nodeType === 1 ? s.node.tagName + '.' + String(s.node.className && s.node.className.baseVal !== undefined ? s.node.className.baseVal : s.node.className).slice(0, 48) : 'text' })),
    }); }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
  addEventListener('load', () => document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => { window.__fontsAt = performance.now(); }))));
` });
await page.goto(BASE + '/', { settle: 600 });

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '   → ' + detail}`);
};

const S = () => page.eval(`(() => {
  const input = document.querySelector('#home input');
  const sc = document.querySelector('#home .term-scroll.absolute');
  const card = document.querySelector('#home .rounded-lg.border');
  const entries = [...sc.querySelectorAll('[data-entry]')];
  const last = entries[entries.length - 1];
  const caret = input.parentElement.querySelector('span[aria-hidden]');
  return {
    draft: input.value, focused: document.activeElement === input,
    ready: getComputedStyle(input).visibility === 'visible',
    n: entries.length, last: last ? last.innerText : '',
    cardH: Math.round(card.getBoundingClientRect().height),
    promptY: Math.round(input.getBoundingClientRect().top),
    scrollY: Math.round(scrollY),
    top: Math.round(sc.scrollTop), sh: sc.scrollHeight, ch: sc.clientHeight, sw: sc.scrollWidth, cw: sc.clientWidth,
    caretLeft: caret ? Math.round(caret.getBoundingClientRect().left - input.getBoundingClientRect().left) : null,
    inputW: Math.round(input.getBoundingClientRect().width),
    theme: document.documentElement.className,
    dialog: !!document.querySelector('[role="dialog"]'),
    filtered: /FILTERED BY/.test(document.body.innerText),
    introVisible: sc.innerText.includes('Vijaysingh Puwar'),
  };
})()`);

const enter = () => page.key('Enter', { text: '\r' });
const run = async (cmd, wait = 380) => { await page.type(cmd); await enter(); await sleep(wait); return S(); };

// ── intro
let s = await S();
check('intro: prompt hidden while typing', !s.ready, JSON.stringify(s.ready));
const h0 = s.cardH;
await sleep(3800);
s = await S();
check('intro: finishes on its own in under ~3.5s', s.ready);
check('intro: card height unchanged from first frame', s.cardH === h0, `${h0} → ${s.cardH}`);
check('intro: screen fits the transcript exactly (no inner scroll)', s.sh === s.ch, `${s.sh} vs ${s.ch}`);
// The caret is an 8 by 15 pixel block that steps one character right per
// letter, and the browser counts each step. Anything larger moving is the
// layout: the card growing, a section pushed down, a line arriving late.
const shifts = await page.eval(`(() => {
  const after = window.__shifts.filter(e => e.t > window.__fontsAt).flatMap(e => e.src);
  return { fontsAt: Math.round(window.__fontsAt), caretSteps: after.filter(s => s.w * s.h <= 24 * 24).length, moved: after.filter(s => s.w * s.h > 24 * 24).slice(0, 4) };
})()`);
// The first two conditions are the check checking itself: if the observer
// never ran or the font mark was never set, "nothing moved" would be vacuous.
check('intro: nothing but the caret moved while it typed',
  Number.isFinite(shifts.fontsAt) && shifts.caretSteps > 0 && shifts.moved.length === 0, JSON.stringify(shifts));
if (process.env.DEBUG) console.log('   shifts', JSON.stringify(shifts));
// On a screen shorter than the card the prompt starts below the fold. Bring it
// into view the way a reader would before tapping it, and measure from there.
await page.eval(`(() => { const r = document.querySelector('#home input').getBoundingClientRect(); if (r.bottom > innerHeight - 40) window.scrollTo({ top: scrollY + r.top - innerHeight * 0.55, behavior: 'instant' }); })()`);
await sleep(300);
const base = await S();

// ── type anywhere (desktop only)
if (!vp.mobile) {
  await page.type('whoami');
  s = await S();
  check('type-anywhere: keystrokes with nothing focused reach the prompt', s.focused && s.draft === 'whoami', JSON.stringify({ f: s.focused, d: s.draft }));
  await enter(); await sleep(380);
  s = await S();
  check('whoami prints', s.last.includes('Cybersecurity Engineer') && s.draft === '', s.last.slice(0, 80));
} else {
  const box = await page.eval(`(() => { const r = document.querySelector('#home input').getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 }; })()`);
  await page.click(box.x, box.y); await sleep(250);
  s = await run('whoami');
  check('whoami prints', s.last.includes('Cybersecurity Engineer'), s.last.slice(0, 80));
}

const invariant = (label, st) => {
  check(`${label}: card height constant`, st.cardH === base.cardH, `${base.cardH} → ${st.cardH}`);
  check(`${label}: prompt did not move`, st.promptY === base.promptY, `${base.promptY} → ${st.promptY}`);
  check(`${label}: page not scrolled`, st.scrollY === base.scrollY, `${base.scrollY} → ${st.scrollY}`);
  check(`${label}: no sideways overflow`, st.sw <= st.cw, `${st.sw} > ${st.cw}`);
};
invariant('after whoami', s);

// ── commands
s = await run('help');
check('help lists commands', /projects \[filter\]/.test(s.last) && /clear/.test(s.last), s.last.slice(0, 60));
check('help: long answer starts at its first line or ends at the bottom', s.top > 0);
invariant('after help', s);

s = await run('projects');
check('projects lists ids with taglines', /recap-verse/.test(s.last) && /Production Multi-LLM AI Platform/.test(s.last), s.last.slice(0, 80));
invariant('after projects', s);

s = await run('projects rust');
check('projects <filter> narrows', /matching "rust"/.test(s.last) && /r2dock/.test(s.last), s.last.slice(0, 80));
s = await run('projects zzzz');
check('projects <no match> errors', /No project matches/.test(s.last), s.last);

s = await run('ls');
check('ls lists sections and files', /projects\//.test(s.last) && /role\.txt/.test(s.last), s.last.slice(0, 80));
s = await run('ls defense/');
check('ls defense/ lists the toolset', /SIEM-detection/.test(s.last) && /PowerShell/.test(s.last), s.last.slice(0, 80));
s = await run('ls skills/');
check('ls <section> is answered, not "no such directory"', /section of this page/.test(s.last), s.last);
s = await run('ls nope');
check('ls <unknown> errors', /no such directory/.test(s.last), s.last);

s = await run('cat role.txt');
check('cat role.txt', /Cybersecurity Engineer/.test(s.last), s.last);
s = await run('cat mission');
check('cat mission (no extension)', /identity, infrastructure, and code/.test(s.last), s.last);
s = await run('cat nothing');
check('cat <unknown> errors and lists files', /no such file/.test(s.last) && /role\.txt/.test(s.last), s.last);

s = await run('skills');
check('skills lists counts', /Python/.test(s.last) && /projects?/.test(s.last), s.last.slice(0, 80));
s = await run('history');
check('history lists earlier commands', /whoami/.test(s.last) && /help/.test(s.last), s.last.slice(0, 80));
s = await run('hlep');
check('typo gets "did you mean"', /Did you mean "help"/.test(s.last), s.last);
invariant('after a dozen commands', s);

// ── keys
await page.type('pro'); await page.key('Tab'); await sleep(150);
s = await S();
check('Tab completes a unique prefix', s.draft === 'projects ', JSON.stringify(s.draft));
check('caret sits at the end of the draft', s.caretLeft !== null && Math.abs(s.caretLeft - 9 * (vp.mobile ? 9.6 : 7.8)) < 3, String(s.caretLeft));
for (let i = 0; i < 10; i++) await page.key('Backspace');
await sleep(120);
await page.type('c'); await page.key('Tab'); await sleep(200);
s = await S();
check('Tab with several matches prints the candidates', /cat/.test(s.last) && /contact/.test(s.last) && /clear/.test(s.last) && s.draft === 'c', JSON.stringify({ d: s.draft, l: s.last }));
await page.key('Backspace'); await sleep(80);
await page.type('open r2'); await page.key('Tab'); await sleep(150);
s = await S();
check('Tab completes an argument', s.draft === 'open r2dock', JSON.stringify(s.draft));
await page.key('c', { modifiers: 2 }); await sleep(200);
s = await S();
check('Ctrl+C abandons the line and echoes it', s.draft === '' && /open r2dock\^C/.test(s.last.replace(/\s+/g, ' ').replace(' ^C', '^C')), JSON.stringify({ d: s.draft, l: s.last }));

await page.key('ArrowUp'); await sleep(120);
s = await S();
check('ArrowUp recalls the last command', s.draft === 'hlep', JSON.stringify(s.draft));
await page.key('ArrowUp'); await sleep(120);
s = await S();
check('ArrowUp again walks further back', s.draft === 'history', JSON.stringify(s.draft));
await page.key('ArrowDown'); await page.key('ArrowDown'); await sleep(120);
s = await S();
check('ArrowDown past the end clears the line', s.draft === '', JSON.stringify(s.draft));

const before = (await S()).top;
await page.key('PageUp', { vk: 33 }); await sleep(400);
s = await S();
check('PageUp scrolls the screen back', s.top < before, `${before} → ${s.top}`);

// long line: the caret must stay inside the field
await page.type('x'.repeat(90)); await sleep(200);
s = await S();
check('long line: caret stays inside the field', s.caretLeft !== null && s.caretLeft <= s.inputW + 1 && s.caretLeft >= 0, `${s.caretLeft} of ${s.inputW}`);
await page.key('c', { modifiers: 2 }); await sleep(150);

// ── clear
await page.key('l', { modifiers: 2 }); await sleep(300);
s = await S();
check('Ctrl+L clears the screen and shows the intro again', s.n === 0 && s.top === 0 && s.introVisible && s.sh === s.ch, JSON.stringify({ n: s.n, top: s.top, sh: s.sh, ch: s.ch }));
s = await run('ls'); s = await run('clear');
check('clear clears the screen', s.n === 0 && s.top === 0, JSON.stringify({ n: s.n, top: s.top }));
await page.key('ArrowUp'); await sleep(100);
s = await S();
check('history survives clear', s.draft === 'clear', JSON.stringify(s.draft));
await page.key('c', { modifiers: 2 }); await sleep(100);
invariant('after clear', await S());

// ── commands that act on the page
s = await run('skills go');
check('skills go counts Go projects only (not Google or MongoDB)', /^.*1 project uses Go\./m.test(s.last), s.last);
s = await run('skills c#');
check('skills c# resolves to C# / .NET', /C# \/ \.NET/.test(s.last), s.last);
s = await run('skills cobol');
check('skills <unused> says so with what was typed', /Nothing here uses "cobol"/.test(s.last), s.last);
s = await run('skills python', 1400);
check('skills <tech> filters the projects', s.filtered && /Filtering below/.test(s.last), s.last);
s = await run('open r2dock', 1500);
check('open <id> opens the project', s.dialog, s.last);
await page.key('Escape'); await sleep(600);
s = await S();
check('Escape closes the project', !s.dialog);
await page.eval(`window.scrollTo({top:${base.scrollY},behavior:'instant'})`); await sleep(300);
const box2 = await page.eval(`(() => { const r = document.querySelector('#home input').getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 }; })()`);
await page.click(box2.x, box2.y); await sleep(200);

s = await run('./connect.sh', 1400);
check('./connect.sh (the banner\'s own last line) resolves', /Contact/.test(s.last) && !/not found/.test(s.last), s.last);
check('./connect.sh scrolls to the contact section', s.scrollY > 500, String(s.scrollY));
await page.eval(`window.scrollTo({top:${base.scrollY},behavior:'instant'})`); await sleep(300);
await page.click(box2.x, box2.y); await sleep(200);

s = await run('theme offense', 3500);
check('theme offense switches the mode', /theme-pentest/.test(s.theme), s.theme);
check('mode switch with a used shell does not retype over the session', s.ready && s.n > 0, JSON.stringify({ ready: s.ready, n: s.n }));
s = await run('theme offense');
check('theme offense again reports already there', /Already in offense/.test(s.last), s.last);
s = await run('theme defense', 3500);
check('theme defense switches back', /theme-security/.test(s.theme), s.theme);
s = await run('theme purple');
check('theme <unknown> errors', /unknown mode/.test(s.last), s.last);

const errs = [...page.errors, ...page.console.filter(c => c.type === 'error').map(c => c.text)];
check('no console errors', errs.length === 0, JSON.stringify(errs.slice(0, 3)));

console.log(`\n${pass} passed, ${fail} failed  (${size})`);
await page.close();
process.exit(fail ? 1 : 0);
