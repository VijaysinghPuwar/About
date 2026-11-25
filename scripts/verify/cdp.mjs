// Minimal Chrome DevTools Protocol driver: no dependencies, Node's own
// WebSocket and fetch. Enough to load a page at an exact viewport, emulate
// touch, type real key events, measure and screenshot.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Set CHROME to the browser binary on anything that is not a Mac with Chrome
// in /Applications.
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** The DevTools port every script here attaches to. */
export const PORT = Number(process.env.CDP_PORT ?? 9333);
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch({ port = PORT, profile }) {
  const proc = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars=false',
    '--disable-extensions',
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: 'ignore', detached: false });

  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return { proc, port };
    } catch { /* not up yet */ }
    await sleep(150);
  }
  throw new Error('chrome did not start');
}

export class Page {
  constructor(ws, targetId, port) {
    this.ws = ws; this.targetId = targetId; this.port = port;
    this.id = 0; this.pending = new Map(); this.listeners = new Map();
    this.console = []; this.errors = [];
    ws.addEventListener('message', e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
        return;
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        this.console.push({ type: msg.params.type, text: msg.params.args.map(a => a.value ?? a.description ?? '').join(' ') });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        this.errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
      }
      for (const fn of this.listeners.get(msg.method) ?? []) fn(msg.params);
    });
  }

  static async open(port = PORT) {
    const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    const page = new Page(ws, t.id, port);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    return page;
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }

  async viewport({ width, height, dpr = 2, mobile = false }) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: dpr, mobile,
      screenWidth: width, screenHeight: height,
    });
    await this.send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
    await this.send('Emulation.setEmitTouchEventsForMouse', { enabled: mobile, configuration: mobile ? 'mobile' : 'desktop' });
    this.vp = { width, height, mobile };
  }

  async goto(url, { settle = 1200 } = {}) {
    const loaded = new Promise(res => {
      const fn = () => res();
      this.on('Page.loadEventFired', fn);
    });
    await this.send('Page.navigate', { url });
    await Promise.race([loaded, sleep(15000)]);
    await sleep(settle);
  }

  async eval(expression, { awaitPromise = true } = {}) {
    const r = await this.send('Runtime.evaluate', {
      expression, awaitPromise, returnByValue: true, userGesture: true,
    });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    }
    return r.result.value;
  }

  async shot(path, { full = false } = {}) {
    mkdirSync(dirname(path), { recursive: true });
    const params = { format: 'png', captureBeyondViewport: full };
    if (full) {
      const m = await this.send('Page.getLayoutMetrics');
      const s = m.cssContentSize;
      params.clip = { x: 0, y: 0, width: s.width, height: Math.min(s.height, 12000), scale: 1 };
    }
    const r = await this.send('Page.captureScreenshot', params);
    writeFileSync(path, Buffer.from(r.data, 'base64'));
    return path;
  }

  async key(key, { code, text, modifiers = 0, vk } = {}) {
    const base = { key, code: code ?? key, modifiers, windowsVirtualKeyCode: vk ?? KEYS[key] ?? key.toUpperCase().charCodeAt(0) };
    await this.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...base, ...(text ? { text } : {}) });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  }

  async type(str, { delay = 0 } = {}) {
    for (const ch of str) {
      // A virtual key code only for letters, digits and space. For punctuation
      // the character code is some other key entirely ('.' is 46, which is
      // Delete), so those go by `key` and `text` alone.
      const vk = /[a-z0-9 ]/i.test(ch) ? { windowsVirtualKeyCode: ch.toUpperCase().charCodeAt(0) } : {};
      await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, ...vk });
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch, ...vk });
      if (delay) await sleep(delay);
    }
  }

  async click(x, y) {
    if (this.vp?.mobile) {
      await this.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await this.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      return;
    }
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  async close() {
    try { await fetch(`http://127.0.0.1:${this.port}/json/close/${this.targetId}`); } catch { /* gone */ }
    try { this.ws.close(); } catch { /* gone */ }
  }
}

const KEYS = { Enter: 13, Tab: 9, Escape: 27, ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Backspace: 8, ' ': 32 };
