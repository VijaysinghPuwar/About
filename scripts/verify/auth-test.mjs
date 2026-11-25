// What sign-in state costs. A signed-out visitor must not download the backend
// client or send the backend a single request; a signed-in page view must read
// the profile and role once and write nothing; a sign-in is recorded once.
//
// Nobody is signed in to run this and nothing reaches the real backend: every
// request to the backend host is blocked in the browser and counted as an
// attempt, and the "session" is a fabricated one placed in localStorage.
import { Page, sleep } from './cdp.mjs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const REF = 'xyhyqukvfcshqwengxth';
const KEY = `sb-${REF}-auth-token`;
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '   → ' + detail}`); };

async function open() {
  const page = await Page.open();
  await page.viewport({ width: 1440, height: 900, dpr: 1 });
  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.send('Network.setBlockedURLs', { urls: [`*${REF}.supabase.co*`] });
  page.attempts = [];
  page.files = [];
  page.on('Network.requestWillBeSent', e => {
    const u = e.request.url;
    if (u.includes('supabase.co')) page.attempts.push(`${e.request.method} ${new URL(u).pathname}`);
    else if (u.startsWith(BASE)) page.files.push(u.replace(BASE, ''));
  });
  return page;
}
const reset = p => { p.attempts = []; p.files = []; p.errors = []; p.console = []; };
const loadedClient = p => p.files.some(f => /supabase-vendor/.test(f));
const tally = list => { const t = {}; for (const a of list) t[a] = (t[a] ?? 0) + 1; return t; };

// ── a visitor who has never signed in
let p = await open();
await p.goto(BASE + '/blocked', { settle: 300 });
await p.eval(`localStorage.clear(); sessionStorage.clear(); 1`);

reset(p);
await p.goto(BASE + '/', { settle: 2500 });
check('signed out, home: backend client not downloaded', !loadedClient(p), p.files.filter(f => /vendor/.test(f)).join(' '));
check('signed out, home: no request to the backend', p.attempts.length === 0, JSON.stringify(p.attempts));
check('signed out, home: email card is locked', await p.eval(`/Sign in to view/.test(document.querySelector('#contact')?.innerText ?? '')`));
check('signed out, home: address is nowhere in the page', await p.eval(`!/@vijaysinghpuwar\\.com/.test(document.documentElement.outerHTML)`));

for (const route of ['/resume', '/videos', '/books', '/books/r2dock', '/environment']) {
  reset(p);
  await p.goto(BASE + route, { settle: 1800 });
  check(`signed out, ${route}: no client, no backend request`, !loadedClient(p) && p.attempts.length === 0, JSON.stringify({ client: loadedClient(p), attempts: p.attempts }));
}

reset(p);
await p.goto(BASE + '/login', { settle: 2500 });
check('/login: backend client is loaded there', loadedClient(p));
check('/login: page renders', await p.eval(`/Sign in/.test(document.querySelector('h1')?.innerText ?? '') && !!document.querySelector('#email')`));
check('/login: nothing written or logged for a visitor who has not signed in', !p.attempts.some(a => /PATCH|log-auth-event/.test(a)), JSON.stringify(p.attempts));

for (const route of ['/admin', '/books/r2dock/read/ch002']) {
  reset(p);
  await p.goto(BASE + route, { settle: 2500 });
  const at = await p.eval(`location.pathname + location.search`);
  check(`signed out, ${route}: sent to sign-in with the way back kept`, at.startsWith('/login') && decodeURIComponent(at).includes(route), at);
}

// SPA navigation from a public page into the sign-in page
reset(p);
await p.goto(BASE + '/', { settle: 2000 });
await p.key('Escape');
await p.eval(`[...document.querySelectorAll('#contact button')].find(b => /Sign in to view/.test(b.innerText)).click(), 1`);
await sleep(2000);
check('email card → sign-in page loads the client on arrival', (await p.eval(`location.pathname`)) === '/login' && loadedClient(p));
check('signed out: no console errors', p.errors.length === 0, JSON.stringify(p.errors.slice(0, 3)));
await p.close();

// ── a returning visitor with a stored session (a fabricated one; the backend is blocked)
p = await open();
await p.goto(BASE + '/blocked', { settle: 300 });
const now = Math.floor(Date.now() / 1000);
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const fakeJwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: '00000000-0000-4000-8000-000000000001', role: 'authenticated', aud: 'authenticated', exp: now + 3600, iat: now })}.sig`;
const session = {
  access_token: fakeJwt, refresh_token: 'not-a-real-refresh-token', token_type: 'bearer',
  expires_in: 3600, expires_at: now + 3600,
  user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'reader@example.test',
    app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z', last_sign_in_at: '2026-11-24T10:00:00Z' },
};
await p.eval(`localStorage.clear(); localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(session))}); 1`);

reset(p);
await p.goto(BASE + '/', { settle: 4500 });
let t = tally(p.attempts);
console.log('   first load with a stored session, attempted:', JSON.stringify(t));
check('stored session: backend client is loaded', loadedClient(p));
const reads = (t['GET /rest/v1/profiles'] ?? 0);
check('stored session: profile read once (plus its one retry, since the backend is blocked)', reads >= 1 && reads <= 2, String(reads));
check('stored session: role read once', (t['GET /rest/v1/user_roles'] ?? 0) === 1, String(t['GET /rest/v1/user_roles']));
check('first load after a sign-in: last_login_at written once', (t['PATCH /rest/v1/profiles'] ?? 0) === 1, String(t['PATCH /rest/v1/profiles']));
check('first load after a sign-in: audit function invoked once', (t['POST /functions/v1/log-auth-event'] ?? 0) === 1, String(t['POST /functions/v1/log-auth-event']));
// The address itself is not written here: this repository is public, and the
// site keeps it out of plain text on purpose (see src/lib/contact-email.ts).
check('signed in: the contact card shows an address at the site domain', await p.eval(`/[a-z]+@vijaysinghpuwar\\.com/.test(document.querySelector('#contact')?.innerText ?? '') && !/Sign in to view/.test(document.querySelector('#contact')?.innerText ?? '')`), 'the card is still locked');
check('signed in: account avatar is in the bar', await p.eval(`!!document.querySelector('nav [class*="rounded-full"]')`));

reset(p);
await p.goto(BASE + '/', { settle: 4500 });
t = tally(p.attempts);
console.log('   second load, same session, attempted:', JSON.stringify(t));
check('page view by the same signed-in person: nothing written', !(t['PATCH /rest/v1/profiles']), String(t['PATCH /rest/v1/profiles']));
check('page view by the same signed-in person: audit function not invoked', !(t['POST /functions/v1/log-auth-event']), String(t['POST /functions/v1/log-auth-event']));
check('page view by the same signed-in person: role read once', (t['GET /rest/v1/user_roles'] ?? 0) === 1, String(t['GET /rest/v1/user_roles']));

// a new sign-in is a new last_sign_in_at
session.user.last_sign_in_at = '2026-11-25T09:00:00Z';
await p.eval(`localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(session))}); 1`);
reset(p);
await p.goto(BASE + '/', { settle: 4500 });
t = tally(p.attempts);
check('a later sign-in is recorded again, once', (t['POST /functions/v1/log-auth-event'] ?? 0) === 1 && (t['PATCH /rest/v1/profiles'] ?? 0) === 1, JSON.stringify(t));

await p.eval(`localStorage.clear(); 1`);
await p.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
