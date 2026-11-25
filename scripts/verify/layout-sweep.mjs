// Every route at every width: horizontal overflow, text spilling out of its box,
// clipped text and console errors fail the run. Undersized tap targets and tiny
// text are reported as notes. A full-page screenshot of each is kept to look at.
//
//   node scripts/verify/layout-sweep.mjs            against http://localhost:4173
//   BASE=https://… ROUTES=/,/resume WIDTHS=375x812m,1440x900 node …
import { Page, sleep } from './cdp.mjs';
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = new URL('./.out/', import.meta.url).pathname;
const TAG = process.env.TAG ?? 'sweep';

const ROUTES = (process.env.ROUTES ?? [
  '/', '/resume', '/videos', '/videos/r2dock-security', '/videos/ospf-course', '/books', '/books/r2dock',
  '/books/spoonstill', '/books/inside-the-projects', '/environment', '/login', '/blocked',
  '/this-page-does-not-exist', '/videos/nope', '/books/nope',
].join(',')).split(',');

const VIEWPORTS = (process.env.WIDTHS ?? '320x568m,375x812m,414x896m,768x1024m,1024x768,1280x800,1440x900,1920x1080')
  .split(',').map(s => {
    const m = /^(\d+)x(\d+)(m?)$/.exec(s);
    return { width: +m[1], height: +m[2], mobile: m[3] === 'm' };
  });

// Runs in the page. Returns what is wrong with the layout as it stands.
const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth;
  const clips = el => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) return p;
    }
    return null;
  };
  const label = el => {
    const cls = (el.getAttribute('class') || '').split(/\\s+/).slice(0, 6).join('.');
    const txt = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 50);
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : '') + (txt ? ' "' + txt + '"' : '');
  };
  const visible = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const overflow = [];
  const seen = new Set();
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    if (el.closest('[data-audit-skip]')) continue;
    const s = getComputedStyle(el);
    if (s.position === 'fixed' && el.getAttribute('aria-hidden') === 'true') continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1.5 || r.left < -1.5) {
      if (clips(el)) continue;              // an ancestor scrolls or clips it on purpose
      if (el.parentElement && seen.has(el.parentElement)) { seen.add(el); continue; }
      seen.add(el);
      overflow.push({ el: label(el), left: Math.round(r.left), right: Math.round(r.right), vw });
    }
  }

  // Text that is cut off without saying so.
  const clipped = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    if (!/(hidden|clip)/.test(s.overflowX)) continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    if (s.textOverflow === 'ellipsis') continue;
    if (!el.innerText || !el.innerText.trim()) continue;
    if (el.tagName === 'INPUT') continue;
    clipped.push({ el: label(el), scrollW: el.scrollWidth, clientW: el.clientWidth });
  }

  // Text that runs out of its own box (an unbreakable word, a long hash). The
  // box stays inside the viewport, so the rectangle test above cannot see it;
  // the root clips the spill, which is how it goes unnoticed.
  const spill = [];
  for (const el of document.body.querySelectorAll('p, li, dd, dt, h1, h2, h3, span, a, div')) {
    if (!visible(el)) continue;
    if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
    const s = getComputedStyle(el);
    if (s.overflowX !== 'visible' || s.display === 'inline') continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const r = el.getBoundingClientRect();
    if (r.left + el.scrollWidth <= vw + 1 && !clips(el)) { /* spills, but still on screen */ }
    spill.push({ el: label(el), scrollW: el.scrollWidth, clientW: el.clientWidth, right: Math.round(r.left + el.scrollWidth), vw });
  }

  // Sideways scrollers: fine when intended, worth knowing about either way.
  const scrollers = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    if (!/(auto|scroll)/.test(s.overflowX)) continue;
    if (el.scrollWidth > el.clientWidth + 1) scrollers.push({ el: label(el), scrollW: el.scrollWidth, clientW: el.clientWidth });
  }

  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = [];
  if (coarse) {
    for (const el of document.body.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const grown = el.classList.contains('tap-44');
      const w = grown ? Math.max(r.width, 44) : r.width, h = grown ? Math.max(r.height, 44) : r.height;
      if (w < 32 || h < 32) small.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }

  const tiny = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el) || el.children.length) continue;
    if (!el.innerText || !el.innerText.trim()) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 10.5) tiny.push({ el: label(el), fs });
  }

  return {
    vw, docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth,
    height: document.documentElement.scrollHeight,
    overflow: overflow.slice(0, 12), clipped: clipped.filter(c => !/sr-only/.test(c.el)).slice(0, 12), spill: spill.slice(0, 12),
    scrollers: scrollers.slice(0, 8), small: small.slice(0, 15), tiny: tiny.slice(0, 10),
  };
})()`;

const report = [];
const page = await Page.open();

for (const vp of VIEWPORTS) {
  await page.viewport(vp);
  for (const route of ROUTES) {
    page.console = []; page.errors = [];
    await page.goto(BASE + route, { settle: 900 });
    // Earlier tests leave the profile in whichever mode they finished in.
    if (await page.eval(`localStorage.getItem('vj-mode') === 'pentest'`)) {
      await page.eval(`localStorage.setItem('vj-mode', 'security')`);
      await page.goto(BASE + route, { settle: 900 });
    }
    // Finish the typed intro, then walk the page so every reveal and lazy
    // section has mounted before anything is measured.
    await page.key('Escape');
    await sleep(300);
    const h = await page.eval('document.documentElement.scrollHeight');
    for (let y = 0; y < h; y += Math.round(vp.height * 0.8)) {
      await page.eval(`window.scrollTo({top:${y},behavior:'instant'})`);
      await sleep(120);
    }
    await sleep(400);
    await page.eval(`window.scrollTo({top:0,behavior:'instant'})`);
    await sleep(700);

    const audit = await page.eval(AUDIT);
    const name = (route === '/' ? 'home' : route.slice(1).replace(/\//g, '_')) + `-${vp.width}`;
    await page.shot(`${OUT}${TAG}/${name}.png`, { full: true });
    const errs = [...page.errors, ...page.console.filter(c => c.type === 'error').map(c => c.text)];
    report.push({ route, vp: `${vp.width}x${vp.height}${vp.mobile ? 'm' : ''}`, ...audit, errors: errs.slice(0, 6) });

    const flags = [];
    if (audit.overflow.length) flags.push(`OVERFLOW×${audit.overflow.length}`);
    if (audit.docW > audit.vw + 1) flags.push(`docW ${audit.docW}>${audit.vw}`);
    if (audit.clipped.length) flags.push(`clipped×${audit.clipped.length}`);
    if (audit.spill.length) flags.push(`SPILL×${audit.spill.length}`);
    if (audit.small.length) flags.push(`smallTap×${audit.small.length}`);
    if (audit.tiny.length) flags.push(`tinyText×${audit.tiny.length}`);
    if (errs.length) flags.push(`errors×${errs.length}`);
    console.log(`${vp.width.toString().padStart(4)} ${route.padEnd(30)} h=${String(audit.height).padStart(5)}  ${flags.join('  ') || 'ok'}`);
  }
}

writeFileSync(`${OUT}${TAG}/report.json`, JSON.stringify(report, null, 1));
await page.close();

// Small tap targets and tiny text are notes to read; these four are failures.
const broken = report.filter(r => r.overflow.length || r.spill.length || r.clipped.length || r.errors.length || r.docW > r.vw + 1);
for (const r of broken) {
  console.log(`\nBROKEN ${r.vp} ${r.route}`);
  for (const k of ['overflow', 'spill', 'clipped', 'errors']) for (const item of r[k]) console.log(`  ${k}: ${JSON.stringify(item).slice(0, 200)}`);
}
console.log(`\n${report.length - broken.length} of ${report.length} route and width combinations clean. Screenshots: ${OUT}${TAG}/`);
process.exit(broken.length ? 1 : 0);
