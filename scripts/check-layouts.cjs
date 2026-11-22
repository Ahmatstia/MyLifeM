/* global __dirname */
// Production UI with fixture hooks; fresh Chromium only, no app or user database.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const requireProject = require('node:module').createRequire(path.join(root, 'package.json'));
let playwright;
try { playwright = require(process.env.MYLIFE_PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright'); }
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const fixture = fs.readFileSync(path.join(root, 'scripts/check-ui.cjs'), 'utf8');
const prefix = fixture.slice(0, fixture.indexOf('const load = createLoader();'));
const toolkit = new Function('require', 'module', 'exports', '__dirname', prefix + '\nreturn { createLoader, native, target, task, categories, base, setViewport(w,s){width=w;fontScale=s;}, restore(){Module._load=originalLoad;} };')(
  requireProject, { exports: {} }, {}, path.join(root, 'scripts'));
const output = path.resolve(root, process.env.MYLIFE_LAYOUT_OUTPUT || '.expo/remaining-ui');
fs.mkdirSync(path.join(output, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
let fonts = '';
for (const [pkg, weights] of [['plus-jakarta-sans', ['400Regular', '500Medium', '600SemiBold', '700Bold']]]) {
  for (const weight of weights) {
    const base = path.join(root, 'node_modules/@expo-google-fonts', pkg, weight);
    const file = fs.readdirSync(base).find(file => file.endsWith('.ttf'));
    fs.copyFileSync(path.join(base, file), path.join(output, 'fonts', file));
    fonts += '@font-face{font-family:' + file.slice(0, -4) + ';src:url(fonts/' + file + ')}';
  }
}
for (const file of fs.readdirSync(path.join(root, 'assets/images/mascot'))) fs.copyFileSync(path.join(root, 'assets/images/mascot', file), path.join(output, 'assets', file));
const specs = [
  ['today', 'today-focus/presentation/screens/today-focus-screen.tsx', 'TodayFocusScreen'],
  ['targets', 'targets/presentation/screens/target-list-screen.tsx', 'TargetListScreen'],
  ['agenda', 'agenda/presentation/screens/agenda-screen.tsx', 'AgendaScreen'],
  ['target-detail', 'targets/presentation/screens/target-detail-screen.tsx', 'TargetDetailScreen', { targetId: 'target' }],
  ['settings', 'settings/presentation/screens/settings-screen.tsx', 'SettingsScreen'],
  ['create-target', 'targets/presentation/screens/create-target-screen.tsx', 'CreateTargetScreen'],
  ['create-priority', 'today-focus/presentation/screens/create-priority-screen.tsx', 'CreatePriorityScreen'],
  ['create-agenda', 'agenda/presentation/screens/create-agenda-screen.tsx', 'CreateAgendaScreen'],
  ['task-manager', 'task-manager/presentation/screens/task-manager-screen.tsx', 'TaskManagerScreen'],
  ['create-managed-task', 'task-manager/presentation/screens/create-managed-task-screen.tsx', 'CreateManagedTaskScreen'],
  ['quick-add', 'quick-add/presentation/screens/quick-add-screen.tsx', 'QuickAddScreen'],
  ['timer', 'today-focus/presentation/components/focus-timer-widget.tsx', 'FocusTimerWidget', {
    mode: 'POMODORO', formattedTime: '24:59', isRunning: true, hasSession: true,
    activeTask: { id: 'fixture', title: 'Selesaikan satu langkah yang berarti' }, progressRatio: 0.2,
    onChangeMode() {}, onStart() {}, onPause() {}, onReset() {}, onFinish() {},
  }],
];
const noop = () => {};
const tracks = [{ id: 'builtin', name: 'Alarm bawaan', uri: 'builtin://siren-energize', isBuiltIn: true }];
const managed = { id: 'mtask-fixture', title: 'Selesaikan laporan praktikum dan tinjau hasil', courseOrContext: 'Pemrograman', categoryType: 'COLLEGE', notes: 'Catatan fixture', priority: 'HIGH', estimatedMinutes: 60,
  executionDate: '2026-11-22', executionTime: '19:00', deadlineDate: '2026-11-24', deadlineTime: '23:59', alertMode: 'ALARM', alarmTrackId: 'builtin', alarmTrackName: tracks[0].name, alarmTrackUri: tracks[0].uri,
  snoozeMinutes: 10, autoAddToToday: true, subtasks: [{ id: 'sub', title: 'Tinjau data', isCompleted: false }], isCompleted: false, completedAt: null };
const overrides = {
  'lucide-react-native': requireProject('lucide-react-native'),
  'expo-image': { Image: props => React.createElement(toolkit.native.Image, { ...props, source: typeof props.source === 'string' ? { uri: 'assets/' + path.basename(props.source) } : props.source }) },
  '@/features/categories/data/repositories/category.repository.impl': { categoryRepository: { getAll: async () => toolkit.categories } },
  '@/features/task-manager/presentation/hooks/use-managed-tasks': { useManagedTasks: () => ({ tasks: [managed], alarmTracks: tracks, isLoading: false, error: null, todayDate: '2026-11-22', previewingTrackId: null, refresh: noop, addTask: noop, toggleTask: noop, toggleSubtask: noop, deleteTask: noop, pickAndSaveCustomSong: noop, togglePreviewTrack: noop, stopPreview: noop, simulateAlarm: noop }) },
};
async function main() {
  const cases = [];
  try {
    for (const fontScale of [1, 2]) for (const width of [320, 360, 412, 768]) {
      toolkit.setViewport(width, fontScale);
      const load = toolkit.createLoader(overrides);
      for (const [name, file, exported, props = {}] of specs) {
        const markup = renderToStaticMarkup(React.createElement(load('src/features/' + file)[exported], props));
        const filename = `${name}-${width}-${fontScale}x.html`;
        const css = toolkit.native.StyleSheet.getSheet().textContent;
        fs.writeFileSync(path.join(output, filename), '<!doctype html><html lang="id"><meta charset="utf-8"><style>' + fonts + css + 'body{margin:0}.phone{position:relative;width:' + width + 'px;height:844px;display:flex;overflow:auto;background:#F1F4F8}</style><body><main class="phone">' + markup + '</main></body></html>');
        cases.push({ name, width, fontScale, file: filename });
      }
    }
  } finally { toolkit.restore(); }
  const server = http.createServer((req, res) => {
    const file = path.resolve(output, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(output + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.ttf') ? 'font/ttf' : 'image/png');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser; const results = [];
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
    for (const item of cases) {
      await page.setViewportSize({ width: item.width, height: 844 });
      await page.goto(`http://127.0.0.1:${server.address().port}/${item.file}`);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => {
        const phone = document.querySelector('.phone'), bounds = phone.getBoundingClientRect();
        const inScroller = element => { for (let p = element.parentElement; p && p !== phone; p = p.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(p).overflowX) && p.scrollWidth > p.clientWidth + 1) return true; return false; };
        return [...phone.querySelectorAll('button,input,textarea,[role="button"],[role="checkbox"],div')].filter(el => !el.closest('svg') && (el.matches('input,textarea,button,[role="button"],[role="checkbox"]') || (!el.children.length && el.textContent.trim()))).flatMap(el => {
          const r = el.getBoundingClientRect(), style = getComputedStyle(el);
          if (!r.width || !r.height || style.display === 'none' || style.visibility === 'hidden' || inScroller(el) || (r.left >= bounds.left - 1 && r.right <= bounds.right + 1)) return [];
          return [{ text: (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent).trim().slice(0, 80), left: Math.round(r.left), right: Math.round(r.right) }];
        });
      });
      results.push({ ...item, overflow });
      if (item.name === 'quick-add') {
        const close = page.getByRole('button', { name: 'Tutup', exact: true });
        const bounds = await close.boundingBox();
        assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 844, 'Quick Add close control must stay visible at large font sizes');
        const lastAction = page.getByRole('button', { name: 'Agenda & Kalender', exact: true });
        await lastAction.scrollIntoViewIfNeeded();
        assert.ok(await lastAction.isVisible(), 'Last Quick Add action must remain reachable by scrolling');
        await page.evaluate(() => { for (const el of document.querySelectorAll('div')) if (el.scrollTop) el.scrollTop = 0; });
      }
      if ((item.width === 320 && item.fontScale === 2) || (item.width === 360 && item.fontScale === 1)) {
        await page.screenshot({ path: path.join(output, `${item.name}-${item.width}-${item.fontScale}x.png`), fullPage: true });
      }
    }
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ platform: 'Chromium SSR fixtures; no hydration/native/keyboard proof', cases: results }, null, 2));
  const failed = results.filter(item => item.overflow.length);
  console.log(JSON.stringify({ cases: results.length, failed: failed.map(item => ({ name: item.name, width: item.width, scale: item.fontScale, overflow: item.overflow })) }));
  assert.equal(failed.length, 0, 'Visible controls/text exceed the fixture width; see .expo/remaining-ui/results.json');
  console.log(`PASS: ${results.length} browser layout cases, no horizontal overflow; native layout unverified.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
