// Fresh browser profile only: never reads an existing user's browser/app database.
const fs = require('node:fs');
const path = require('node:path');
const bundled = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const { chromium } = require(path.join(bundled, 'playwright'));
const out = __dirname;
const shots = path.join(out, 'screenshots');
fs.mkdirSync(shots, { recursive: true });
const target = process.env.MYLIFE_AUDIT_URL || 'http://127.0.0.1:8085';
const useAuditHeaders = process.env.MYLIFE_AUDIT_COI === '1';
const mode = target.includes(':8086') ? 'fixture' : useAuditHeaders ? 'application-audit-headers' : 'application';
const evidence = { date: '2026-11-21', mode, target, platform: 'Chromium, React Native Web, fresh context; not Android/iOS', console: [], pageErrors: [], requestsFailed: [], checks: [] };
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (!['localhost', '127.0.0.1'].includes(url.hostname) && !['data:', 'blob:'].includes(url.protocol)) return route.abort();
      if (useAuditHeaders && ['http:', 'https:'].includes(url.protocol)) {
        const response = await route.fetch({ timeout: 120000 });
        return route.fulfill({ response, headers: { ...response.headers(), 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' } });
      }
      return route.continue();
    });
    const page = await context.newPage();
    const pending = new Set();
    page.on('request', req => pending.add(req.url()));
    page.on('requestfinished', req => pending.delete(req.url()));
    page.on('requestfailed', req => pending.delete(req.url()));
    page.on('console', msg => { if (['error','warning'].includes(msg.type())) evidence.console.push({ type: msg.type(), text: msg.text().slice(0, 1800) }); });
    page.on('pageerror', err => evidence.pageErrors.push(err.message));
    page.on('requestfailed', req => evidence.requestsFailed.push({ url: req.url(), failure: req.failure() }));
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 90000 });
    for (let attempt = 0; attempt < 4; attempt++) {
      await page.waitForFunction(() => document.body.innerText.length > 50, { timeout: 30000 }).catch(() => {});
      const bodyLength = await page.locator('body').innerText().then(text => text.length);
      console.log(JSON.stringify({ attempt: attempt + 1, bodyLength, pending: [...pending] }));
      if (bodyLength > 50) break;
    }
    await page.waitForTimeout(2000);
    evidence.checks.push({ name: 'initial-load', status: response.status(), headers: await response.allHeaders(), title: await page.title(), url: page.url(), pendingRequests: [...pending], body: (await page.locator('body').innerText()).slice(0, 10000), crossOriginIsolated: await page.evaluate(() => crossOriginIsolated), scripts: await page.evaluate(() => [...document.scripts].map(s => ({ src: s.src, type: s.type }))) });
    await page.screenshot({ path: path.join(shots, mode + '-initial-360.png'), fullPage: true });
    console.log(JSON.stringify(evidence.checks[0], null, 2));
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'browser-' + mode + '-evidence.json'), JSON.stringify(evidence, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
