// Navigation, dialogs, the command palette, the mobile menu, and the hero
// figure's layout at each breakpoint. Everything here broke at least once.
//
//   node scripts/verify/site-test.mjs                   against http://localhost:4173
import { Page, sleep } from './cdp.mjs';
const BASE = process.env.BASE ?? 'http://localhost:4173';
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '   → ' + detail}`); };
const centerOf = (page, js) => page.eval(`(() => { const el = ${js}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const wheel = (page, x, y, dy) => page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy });

// ── desktop
let page = await Page.open();
await page.viewport({ width: 1440, height: 900, dpr: 1 });
await page.goto(BASE + '/', { settle: 800 });
await page.eval(`localStorage.setItem('vj-mode','security')`);
await page.goto(BASE + '/', { settle: 800 });
await page.key('Escape'); await sleep(300);

// nav highlight clears at the top
await page.eval(`window.scrollTo({top: document.getElementById('skills').offsetTop, behavior:'instant'})`); await sleep(500);
let cur = await page.eval(`[...document.querySelectorAll('nav [aria-current="true"]')].map(e => e.textContent.trim())`);
check('nav: highlights the section in view', cur.includes('Capabilities'), JSON.stringify(cur));
await page.eval(`window.scrollTo({top: 0, behavior:'instant'})`); await sleep(500);
cur = await page.eval(`[...document.querySelectorAll('nav [aria-current="true"]')].map(e => e.textContent.trim())`);
check('nav: nothing highlighted back at the top', cur.length === 0, JSON.stringify(cur));

// project dialog locks the page
await page.eval(`window.scrollTo({top: document.getElementById('projects').offsetTop - 70, behavior:'instant'})`); await sleep(500);
let c = await centerOf(page, `document.querySelector('[aria-label^="View details: R2Dock"]')`);
await page.click(c.x, c.y); await sleep(700);
let y0 = await page.eval('scrollY');
await wheel(page, 100, 450, 600); await sleep(400);
let y1 = await page.eval('scrollY');
check('project dialog: page does not scroll behind it', Math.abs(y1 - y0) < 2, `${y0} → ${y1}`);
await page.key('Escape'); await sleep(500);
await wheel(page, 100, 450, 300); await sleep(400);
let y2 = await page.eval('scrollY');
check('project dialog: page scrolls again after closing', y2 > y1 + 50, `${y1} → ${y2}`);

// keyboard reaches a featured card
await page.eval(`document.querySelector('[aria-label^="View details: Recap Verse"]').focus()`);
await page.key('Enter', { text: '\r' }); await sleep(700);
check('featured card opens from the keyboard', await page.eval(`!!document.querySelector('[role="dialog"]')`));
await page.key('Escape'); await sleep(400);

// route change resets scroll; back restores
await page.eval(`window.scrollTo({top: 2500, behavior:'instant'})`); await sleep(300);
c = await centerOf(page, `document.querySelector('nav a[href="/videos"]')`);
await page.click(c.x, c.y); await sleep(1200);
let st = await page.eval(`({ p: location.pathname, y: Math.round(scrollY) })`);
check('route change: new page opens at the top', st.p === '/videos' && st.y === 0, JSON.stringify(st));
await page.eval(`window.scrollTo({top: 700, behavior:'instant'})`); await sleep(200);
c = await centerOf(page, `document.querySelector('a[href^="/videos/"]')`);
await page.eval(`document.querySelector('a[href="/videos/ospf-course"]').click()`); await sleep(1200);
st = await page.eval(`({ p: location.pathname, y: Math.round(scrollY) })`);
check('route change: video page opens at the top, no glide', st.p === '/videos/ospf-course' && st.y === 0, JSON.stringify(st));
await page.eval(`history.back()`); await sleep(1200);
st = await page.eval(`({ p: location.pathname, y: Math.round(scrollY) })`);
check('back: returns to where the reader was', st.p === '/videos' && st.y > 400, JSON.stringify(st));

// footer "Contact" from another page lands on the section
await page.goto(BASE + '/books', { settle: 800 });
await page.eval(`[...document.querySelectorAll('footer button')].find(b => b.textContent.trim() === 'Journey').click()`); await sleep(2800);
st = await page.eval(`({ p: location.pathname + location.hash, top: Math.round(document.getElementById('experience')?.getBoundingClientRect().top ?? -1) })`);
check('footer section link from another page lands on the section', st.p === '/#experience' && st.top > 40 && st.top < 120, JSON.stringify(st));

// palette
await page.goto(BASE + '/', { settle: 800 }); await page.key('Escape'); await sleep(300);
await page.key('k', { modifiers: 2 }); await sleep(500);
check('palette opens on Ctrl+K', await page.eval(`!!document.querySelector('[aria-label="Command palette"]')`));
for (const q of ['journey', 'capabilities', 'work', 'résumé', 'environment', 'pentest']) {
  await page.eval(`(() => { const i = document.querySelector('[aria-label="Search commands"]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, ${JSON.stringify(q)}); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(200);
  const n = await page.eval(`document.querySelectorAll('[aria-label="Command palette"] [data-idx]').length`);
  check(`palette finds "${q}"`, n > 0, String(n));
}
y0 = await page.eval('scrollY');
await wheel(page, 700, 700, 500); await sleep(300);
check('palette: page does not scroll behind it', Math.abs((await page.eval('scrollY')) - y0) < 2);
const ring = await page.eval(`getComputedStyle(document.querySelector('[aria-label="Search commands"]')).outlineColor`);
check('palette: no permanent focus box on the field', /rgba\(0, 0, 0, 0\)|transparent/.test(ring), ring);
await page.key('Escape'); await sleep(400);
check('palette closes on Escape', !(await page.eval(`!!document.querySelector('[aria-label="Command palette"]')`)));
check('desktop: no console errors', page.errors.length === 0, JSON.stringify(page.errors.slice(0, 3)));
await page.close();

// ── phone
page = await Page.open();
await page.viewport({ width: 375, height: 812, dpr: 2, mobile: true });
await page.goto(BASE + '/', { settle: 800 }); await page.key('Escape'); await sleep(300);
check('phone: no icon-only mode button in the bar', await page.eval(`[...document.querySelectorAll('nav > div:first-child button')].filter(b => b.getBoundingClientRect().width > 0).length === 2`), 'expected logo + menu only');
c = await centerOf(page, `document.querySelector('[aria-controls="mobile-menu"]')`);
await page.click(c.x, c.y); await sleep(400);
check('phone menu opens', await page.eval(`!!document.getElementById('mobile-menu')`));
await page.shot(new URL('./.out/verify/menu-375.png', import.meta.url).pathname);
check('phone menu: mode control names both modes', await page.eval(`/SECURITY/.test(document.getElementById('mobile-menu').innerText) && /PENTEST/.test(document.getElementById('mobile-menu').innerText)`));
check('phone menu: root is locked', await page.eval(`getComputedStyle(document.documentElement).overflowY === 'hidden'`));
// a tap below the panel closes it and does not reach the page
const below = await page.eval(`(() => { const r = document.getElementById('mobile-menu').getBoundingClientRect(); return { x: 180, y: Math.min(innerHeight - 30, r.bottom + 60) }; })()`);
const hitBefore = await page.eval(`(() => { const el = document.elementFromPoint(${below.x}, ${below.y}); return el && el.getAttribute('aria-hidden') === 'true' && el.className.includes('fixed'); })()`);
check('phone menu: a scrim covers the page under it', hitBefore);
await page.click(below.x, below.y); await sleep(400);
st = await page.eval(`({ open: !!document.getElementById('mobile-menu'), path: location.pathname, dialog: !!document.querySelector('[role="dialog"]'), lock: getComputedStyle(document.documentElement).overflowY })`);
check('phone menu: tap outside closes it without activating the page', !st.open && st.path === '/' && !st.dialog, JSON.stringify(st));
check('phone menu: lock released on close', st.lock !== 'hidden', st.lock);
// Search row opens the palette
c = await centerOf(page, `document.querySelector('[aria-controls="mobile-menu"]')`);
await page.click(c.x, c.y); await sleep(400);
c = await centerOf(page, `[...document.querySelectorAll('#mobile-menu button')].find(b => /^Search/.test(b.textContent.trim()))`);
await page.click(c.x, c.y); await sleep(900);
check('phone menu: Search opens the command palette', await page.eval(`!!document.querySelector('[aria-label="Command palette"]')`));
await page.shot(new URL('./.out/verify/palette-375.png', import.meta.url).pathname);
await page.key('Escape'); await sleep(400);
// route change from the menu resets scroll
await page.eval(`window.scrollTo({top: 1500, behavior:'instant'})`); await sleep(300);
c = await centerOf(page, `document.querySelector('[aria-controls="mobile-menu"]')`);
await page.click(c.x, c.y); await sleep(400);
c = await centerOf(page, `document.querySelector('#mobile-menu a[href="/books"]')`);
await page.click(c.x, c.y); await sleep(1200);
st = await page.eval(`({ p: location.pathname, y: Math.round(scrollY), open: !!document.getElementById('mobile-menu') })`);
check('phone menu: Books opens at the top with the menu closed', st.p === '/books' && st.y === 0 && !st.open, JSON.stringify(st));
check('phone: no console errors', page.errors.length === 0, JSON.stringify(page.errors.slice(0, 3)));
await page.close();

// ── the hero figure: absent on a phone, centred under the terminal on a
//    tablet, the full column beside the terminal on a desktop.
//
//    It shipped on tablets pushed against the left edge with a strip of
//    nothing beside it. "Centred" is measured on the network's dashed boundary,
//    because that is what a person sees as the diagram: the drawing's own box
//    is wider on one side (the Internet node hangs off the top right), and a
//    centred box still left the hexagon visibly off the page's axis.
for (const [w, h, mobile, expect] of [
  [375, 812, true, 'hidden'], [640, 900, true, 'centred'], [768, 1024, true, 'centred'], [820, 1180, true, 'centred'],
  [979, 800, false, 'centred'], [980, 800, false, 'column'], [1032, 1376, true, 'column'], [1440, 900, false, 'column'],
]) {
  page = await Page.open();
  await page.viewport({ width: w, height: h, dpr: 1, mobile });
  await page.goto(BASE + '/', { settle: 800 });
  await page.key('Escape'); await sleep(300);
  const f = await page.eval(`(() => {
    const fig = document.querySelector('[data-hero-figure]');
    if (!fig || getComputedStyle(fig).display === 'none') return { shown: false };
    const col = fig.parentElement.getBoundingClientRect();
    const svg = fig.querySelector('svg').getBoundingClientRect();
    const hex = fig.querySelector('[data-trust-boundary]').getBoundingClientRect();
    const labels = [...fig.querySelectorAll('svg text')].map(t => t.getBoundingClientRect());
    const caption = fig.lastElementChild.firstElementChild.getBoundingClientRect();
    const terminal = document.querySelector('.term-screen').getBoundingClientRect();
    const mid = r => r.left + r.width / 2;
    return {
      shown: true,
      hexOffAxis: +(mid(hex) - mid(col)).toFixed(1),
      captionOffHex: +(mid(caption) - mid(hex)).toFixed(1),
      captionLeftOfColumn: +(caption.left - col.left).toFixed(1),
      svgFillsColumn: Math.abs(svg.left - col.left) <= 1 && Math.abs(svg.right - col.right) <= 1,
      svgWidth: Math.round(svg.width), column: Math.round(col.width),
      labelsInColumn: labels.every(l => l.left >= col.left - 1 && l.right <= col.right + 1),
      labelPx: +(9.5 * svg.width / 496).toFixed(1),
      besideTerminal: svg.left > terminal.right && svg.top < terminal.bottom && svg.bottom > terminal.top,
    };
  })()`);
  const detail = JSON.stringify(f);
  if (expect === 'hidden') {
    check(`hero figure @${w}: not drawn on a phone`, !f.shown, detail);
  } else if (expect === 'centred') {
    check(`hero figure @${w}: the network is centred in the column`, f.shown && Math.abs(f.hexOffAxis) <= 1.5, detail);
    check(`hero figure @${w}: its caption is centred under it`, f.shown && Math.abs(f.captionOffHex) <= 1.5, detail);
    check(`hero figure @${w}: capped, every label inside the column and at least 9px`, f.shown && f.svgWidth <= 545 && f.labelsInColumn && f.labelPx >= 9, detail);
  } else {
    check(`hero figure @${w}: fills its column beside the terminal`, f.shown && f.svgFillsColumn && f.besideTerminal && f.labelsInColumn, detail);
    check(`hero figure @${w}: its caption starts at the column's left edge`, f.shown && Math.abs(f.captionLeftOfColumn) <= 1, detail);
  }
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
