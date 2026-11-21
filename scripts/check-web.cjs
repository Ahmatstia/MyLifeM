/* global __dirname */
// Requires a task-owned Expo server; browser context is always new and isolated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let playwright;
try { playwright = require(process.env.MYLIFE_PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright'); }
async function main() {
  const target = process.env.MYLIFE_TEST_URL || 'http://127.0.0.1:8098';
  assert.ok(/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(target));
  const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
  const evidence = { platform: 'Fresh Chromium context; production application, actual SQLite web worker/OPFS', target, checks: [], errors: [], consoleErrors: [] };
  const output = path.resolve(__dirname, '../.expo/remaining-web'); fs.mkdirSync(output, { recursive: true });
  try {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
    const page = await context.newPage(); page.on('pageerror', error => evidence.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') evidence.consoleErrors.push(message.text()); });
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
    assert.equal(response.headers()['cross-origin-opener-policy'], 'same-origin'); assert.equal(response.headers()['cross-origin-embedder-policy'], 'credentialless');
    assert.equal(await page.evaluate(() => crossOriginIsolated), true); evidence.checks.push('Real Metro isolation headers and SharedArrayBuffer enabled');
    await page.waitForFunction(() => !document.body.innerText.includes('Bundling...') && (document.body.innerText.includes('Data belum dapat') || document.body.innerText.length > 250), { timeout: 120000 });
    assert.ok(!(await page.locator('body').innerText()).includes('Data belum dapat dibuka')); evidence.checks.push('Cold startup reaches the actual application');
    await page.goto(target + '/today/new', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const title = 'Audit web ' + Date.now();
    await page.getByRole('textbox', { name: 'Nama tugas', exact: true }).fill(title, { timeout: 120000 });
    await page.getByRole('button', { name: 'Kerja', exact: true }).click();
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Pilih durasi fokus', exact: true }).click();
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page.waitForURL(url => !url.pathname.endsWith('/today/new'), { timeout: 30000 });
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByText(title, { exact: true }).waitFor({ timeout: 120000 });
    assert.equal(await page.getByText(title, { exact: true }).count(), 1); evidence.checks.push('Quick task writes through the actual web database without duplicates');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByText(title, { exact: true }).waitFor({ timeout: 120000 });
    assert.ok((await page.locator('body').innerText()).includes('Kerja')); evidence.checks.push('Task/category persist across a full page reload');
    const label = await page.getByRole('checkbox').evaluateAll(elements => elements.map(el => el.getAttribute('aria-label')));
    const own = label.find(value => value?.includes(title));
    assert.ok(own); await page.getByRole('checkbox', { name: own, exact: true }).click();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('checkbox', { name: new RegExp(title) }).waitFor({ timeout: 120000 });
    assert.equal(await page.getByRole('checkbox', { name: new RegExp(title) }).getAttribute('aria-checked'), 'true'); evidence.checks.push('Completion update persists across reload');
    await page.goto(target + '/task-manager/new', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const managedTitle = 'Managed web ' + Date.now();
    await page.getByRole('textbox', { name: 'Nama tugas', exact: true }).fill(managedTitle, { timeout: 120000 });
    for (const [name, value] of [['Tanggal tenggat', '2099-01-02'], ['Jam tenggat', '10:00'], ['Tanggal pengerjaan', '2099-01-01'], ['Jam pengerjaan', '09:00']]) await page.getByRole('textbox', { name, exact: true }).fill(value);
    await page.getByRole('button', { name: 'Simpan Tugas & Aktifkan Alarm', exact: true }).click();
    await page.waitForURL(url => !url.pathname.endsWith('/task-manager/new'), { timeout: 30000 });
    await page.goto(target + '/task-manager', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const remove = page.getByRole('button', { name: 'Hapus tugas ' + managedTitle, exact: true });
    await remove.waitFor({ timeout: 120000 });
    page.once('dialog', dialog => dialog.dismiss()); await remove.click(); assert.equal(await remove.count(), 1);
    page.once('dialog', dialog => dialog.accept()); await remove.click(); await remove.waitFor({ state: 'hidden', timeout: 30000 });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: 'Tambah Tugas Terjadwal Baru' }).waitFor({ timeout: 120000 });
    assert.equal(await remove.count(), 0); evidence.checks.push('Managed task create, cancel deletion, confirm deletion and persistent removal');
    await page.screenshot({ path: path.join(output, 'persisted-task.png'), fullPage: true });
    assert.deepEqual(evidence.errors, []);
    assert.deepEqual(evidence.consoleErrors, [], 'Web console must not report invalid HTML or hydration errors.');
    console.log('PASS: actual web startup, SQLite create/read/update/reload and isolation headers; fresh browser only.');
  } finally {
    await browser.close(); fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(evidence, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
