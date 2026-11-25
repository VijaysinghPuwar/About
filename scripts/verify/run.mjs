// Runs every check against the production build. `npm run verify`.
//
// Builds, serves the build with `vite preview`, starts a headless Chrome, runs
// the suites in turn and exits non-zero if any of them failed. Nothing is
// installed: the browser is driven over the DevTools protocol with Node's own
// WebSocket (see cdp.mjs), so it needs Node 22 or newer and Chrome.
//
//   npm run verify                      build, serve, test
//   BASE=https://vijaysinghpuwar.com npm run verify      test a deployed site instead
//
// Run it before every push. The repository's main branch is what the live
// site serves.
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const here = p => fileURLToPath(new URL(p, import.meta.url));
const children = [];
const stop = () => { for (const c of children) { try { c.kill(); } catch { /* already gone */ } } };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

let base = process.env.BASE;
if (!base) {
  const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
  children.push(preview);
  base = 'http://localhost:4173';
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await sleep(250);
  }
}

const { proc } = await launch({ profile: here('./.out/chrome-profile') });
children.push(proc);

const suites = [
  ['terminal, desktop', 'terminal-test.mjs', '1440x900'],
  ['terminal, short laptop', 'terminal-test.mjs', '1024x600'],
  ['terminal, tablet', 'terminal-test.mjs', '768x1024m'],
  ['terminal, phone', 'terminal-test.mjs', '375x812m'],
  ['terminal, small phone', 'terminal-test.mjs', '320x568m'],
  ['navigation, dialogs, palette, menu, hero figure', 'site-test.mjs'],
  ['sign-in state and backend requests', 'auth-test.mjs'],
  ['layout sweep, every route at every width', 'layout-sweep.mjs'],
];

const failed = [];
for (const [title, file, ...args] of suites) {
  console.log(`\n━━ ${title}`);
  const run = spawnSync(process.execPath, [here(`./${file}`), ...args], {
    stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, BASE: base }, encoding: 'utf8',
  });
  // Only the failures and the totals: a passing run is a few lines long.
  const lines = run.stdout.split('\n');
  const keep = lines.filter(l => /^(FAIL|BROKEN|\s+(overflow|spill|clipped|errors):)|passed,|clean\./.test(l));
  console.log(keep.join('\n'));
  if (run.status !== 0) failed.push(title);
}

console.log(failed.length ? `\nFAILED: ${failed.join('; ')}` : '\nAll suites passed.');
stop();
process.exit(failed.length ? 1 : 0);
