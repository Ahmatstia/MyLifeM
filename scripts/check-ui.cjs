/* global __dirname */
// Runs UI regressions against production components, using isolated fixture hooks (no database).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const native = require('react-native-web');
const root = path.resolve(__dirname, '..');
const originalLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'react-native') return native;
  if (id === 'react-native-svg') return originalLoad.call(this, path.join(root, 'node_modules/react-native-svg/lib/commonjs/elements.web.js'), ...args);
  return originalLoad.call(this, id, ...args);
};
const icons = new Proxy({}, { get(_, name) {
  const aliases = { CheckCircle: 'circle-check-big', CheckCircle2: 'circle-check', AlertOctagon: 'octagon-alert', AlertCircle: 'circle-alert', AlertTriangle: 'triangle-alert', Trash2: 'trash', MoreHorizontal: 'ellipsis' };
  const file = aliases[name] || name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase();
  return require(path.join(root, 'node_modules/lucide-react-native/dist/cjs/icons', file + '.js')).default;
} });
const noop = () => {};
let width = 360;
let fontScale = 1;
let todayState;
const now = '2026-10-26T03:00:00.000Z';
const task = { id: 'task', title: 'Latihan Python: fungsi dan list', name: 'Latihan Python: fungsi dan list', description: null,
  priority: 'HIGH', status: 'TODO', estimatedMinutes: 30, estimatedHours: 0.5, actualMinutes: 0, isCompleted: false, stageId: 'stage', createdAt: now, updatedAt: now };
const target = { id: 'target', title: 'Siap menjadi AI Engineer', categoryId: 'learning', categoryName: 'Belajar',
  description: 'Belajar, bangun portofolio, dan dokumentasikan hasilnya.', status: 'ACTIVE', priority: 'HIGH', totalTasks: 8, completedTasks: 3, progressPercent: 38, totalEstimatedHours: 12 };
const stage = { id: 'stage', name: 'Bangun baseline', description: 'Mulai dari model sederhana.', status: 'IN_PROGRESS', tasks: [task], completedTasks: 0, totalTasks: 1 };
const categories = [{ id: 'learning', name: 'Belajar', targetCount: 1 }, { id: 'career', name: 'Karier', targetCount: 0 }];
const base = { isLoading: false, error: null, refresh: noop, addTarget: noop, addProject: noop, addStage: noop, editStage: noop,
  removeStage: noop, reorderStage: noop, addTask: noop, editTask: noop, removeTask: noop, toggleTaskStatus: noop, deleteThisTarget: noop, deleteThisProject: noop };
const focus = { ...base, focusItems: [{ id: 'daily', taskId: task.id, task, isCompleted: false }], availableTasks: [task], completedMinutes: 45,
  toggleTask: noop, addQuickTask: noop, addTaskToToday: noop, removeFromToday: noop, recordSession: noop };
todayState = focus;
const events = [{ id: 'event', title: 'Ruang belajar Python', eventType: 'LEARNING', startTime: '2026-10-26T19:30:00', endTime: '2026-10-26T20:00:00', isAllDay: false, isCompleted: false, location: 'Rumah' }];
const stubs = {
  'expo-haptics': { selectionAsync: noop, impactAsync: noop, notificationAsync: noop, ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' } },
  'expo-image': { Image: native.Image },
  'expo-router': { router: { canGoBack: () => true, replace: noop, push: noop, back: noop, navigate: noop, setParams: noop }, useFocusEffect: noop, useLocalSearchParams: () => ({}) },
  'expo-router/react-navigation': { PlatformPressable: native.Pressable },
  'expo-status-bar': { StatusBar: () => null },
  'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) },
  'lucide-react-native': icons,
  '@/shared/hooks/use-open-add-from-param': { useOpenAddFromParam: noop },
  '@/features/today-focus/presentation/hooks/use-today-focus': { useTodayFocus: () => todayState },
  '@/features/today-focus/presentation/hooks/use-focus-timer': { useFocusTimer: () => ({ mode: 'POMODORO', formattedTime: '25:00', isRunning: false, activeTask: null, progressRatio: 0, changeMode: noop, startTimer: noop, pauseTimer: noop, resetTimer: noop, setActiveTask: noop }) },
  '@/features/targets/presentation/hooks/use-targets': { useTargets: () => ({ ...base, targets: [target], categories, selectedCategoryId: null, setSelectedCategoryId: noop }) },
  '@/features/targets/presentation/hooks/use-target-detail': { useTargetDetail: () => ({ ...base, target, stages: [stage] }) },
  '@/features/agenda/presentation/hooks/use-agenda': { useAgenda: () => ({ ...base, selectedDate: '2026-10-26', setSelectedDate: noop, events, weeklyOccurrences: [], addEvent: noop, toggleEvent: noop, removeEvent: noop, toggleWeeklyOccurrence: noop, toggleWeeklyOccurrenceCancellation: noop }) },
  '@/features/agenda/presentation/hooks/use-weekly-schedules': { useWeeklySchedules: () => ({ ...base, schedules: [], schedulesByDay: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, selectedDay: 1, setSelectedDay: noop, addSchedule: noop, editSchedule: noop, removeSchedule: noop }) },
  '@/features/agenda/presentation/hooks/use-next-schedule': { useNextSchedule: () => ({ nextSchedule: null, refreshNextSchedule: noop }) },
  '@/features/settings/presentation/hooks/use-settings': { useSettings: () => ({ ...base, settings: { pomodoroMinutes: 25, deepFlowMinutes: 50, hapticsEnabled: true, keepAwakeEnabled: true }, stats: { targetsCount: 1, projectsCount: 1, tasksCount: 8, focusSessionsCount: 2, agendaEventsCount: 1 }, backupBusy: null, pendingBackup: null, closeBackup: noop, updateSetting: noop, exportBackup: noop, inspectBackup: noop, restoreBackup: noop, exportRecovery: noop }) },
  '@/features/categories/presentation/hooks/use-categories': { useCategories: () => ({ ...base, categories, addCategory: noop, editCategory: noop, removeCategory: noop }) },
  '@/features/targets/data/repositories/target.repository.impl': { targetRepository: { getTargets: async () => [target] } },
};

function createLoader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(root, file);
    const key = '@/' + path.relative(path.join(root, 'src'), filename).replaceAll(path.sep, '/').replace(/\.tsx?$/, '');
    if (Object.hasOwn(overrides, key)) return overrides[key];
    if (Object.hasOwn(stubs, key)) return stubs[key];
    if (cache.has(filename)) return cache.get(filename).exports;
    const moduleRecord = { exports: {} };
    cache.set(filename, moduleRecord);
    const resolve = (specifier) => {
      if (Object.hasOwn(overrides, specifier)) return overrides[specifier];
      if (Object.hasOwn(stubs, specifier)) return stubs[specifier];
      if (specifier === 'react-native') return {
        ...native,
        AppState: { currentState: 'active', addEventListener: () => ({ remove: noop }) },
        useWindowDimensions: () => ({ width, height: 844, fontScale, scale: 1 }),
        Text: fontScale === 1 ? native.Text : props => {
          const style = native.StyleSheet.flatten(props.style) || {};
          return React.createElement(native.Text, { ...props, style: [props.style, { fontSize: (style.fontSize || 14) * fontScale, lineHeight: (style.lineHeight || 20) * fontScale }] });
        },
        Modal: ({ visible, children }) => visible ? React.createElement(native.View, { style: { position: 'absolute', inset: 0, zIndex: 10 } }, children) : null,
      };
      if (specifier === '@/db/client') throw new Error('UI tests must never access the real database.');
      if (specifier.startsWith('@/') || specifier.startsWith('.')) {
        const targetPath = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
        if (/\.(png|jpg|jpeg|webp)$/i.test(targetPath)) return targetPath;
        const resolved = [targetPath + '.tsx', targetPath + '.ts', path.join(targetPath, 'index.ts')].find(candidate => fs.existsSync(candidate));
        assert.ok(resolved, specifier);
        return load(resolved);
      }
      return require(specifier);
    };
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', source)(resolve, moduleRecord, moduleRecord.exports);
    return moduleRecord.exports;
  }
  return load;
}
const load = createLoader();
const { colors } = load('src/theme/colors.ts');
function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(a, b) { const values = [luminance(a), luminance(b)].sort((x, y) => x - y); return (values[1] + 0.05) / (values[0] + 0.05); }
assert.equal(contrast('#000000', '#FFFFFF'), 21);
for (const [text, surface] of [['clockInk', 'clockCase'], ['clockTick', 'clockFace'], ['onSurfaceVariant', 'clockCase'], ['onSurfaceVariant', 'folderLilac'], ['onSurfaceVariant', 'folderMint'], ['onSurfaceVariant', 'folderPeach'], ['onPrimary', 'primary'], ['onHero', 'hero'], ['onHeroMuted', 'hero'], ['onSurface', 'background'], ['onSurfaceVariant', 'background'], ['onSurfaceSubtle', 'surfaceContainerLowest'], ['onPrimaryContainer', 'primaryContainer'], ['onSecondaryContainer', 'secondaryContainer'], ['onHighlight', 'highlight'], ['onError', 'error'], ['onErrorContainer', 'errorContainer'], ['success', 'surfaceContainerLowest']]) {
  assert.ok(contrast(colors[text], colors[surface]) >= 4.5, text + '/' + surface);
}
for (const color of Object.values(colors.pillars)) assert.ok(contrast(color, colors.primaryContainer) >= 4.5, color);

const { formatLocalDate } = load('src/shared/utils/local-date.ts');
const initialTZ = process.env.TZ;
for (const [zone, offset] of [['Asia/Jakarta', '+07:00'], ['Asia/Makassar', '+08:00'], ['Asia/Jayapura', '+09:00']]) {
  process.env.TZ = zone;
  assert.equal(formatLocalDate(new Date('2026-10-26T00:30:00' + offset)), '2026-10-26');
}
if (initialTZ === undefined) delete process.env.TZ; else process.env.TZ = initialTZ;

// Drive the actual form hooks: editing category must preserve the user's draft.
const state = [], dependencies = [];
let stateIndex = 0, effectIndex = 0;
const effects = [];
const fakeReact = { ...React,
  useState(initial) { const index = stateIndex++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
  useRef(initial) { const index = stateIndex++; return state[index] ??= { current: initial }; },
  useEffect(callback, next) { const index = effectIndex++; if (!dependencies[index] || next.some((value, i) => value !== dependencies[index][i])) effects.push(callback); dependencies[index] = next; },
};
const formLoader = createLoader({ react: fakeReact });
const { AddTargetModal } = formLoader('src/features/targets/presentation/components/add-target-modal.tsx');
const renderForm = () => { stateIndex = 0; effectIndex = 0; const element = AddTargetModal({ visible: true, categories, onClose: noop, onSubmit: noop }); while (effects.length) effects.shift()(); return element; };
function descendants(element) { return element && typeof element === 'object' ? [element, ...React.Children.toArray(element.props?.children).flatMap(descendants)] : []; }
const { DateStripHeader } = formLoader('src/features/agenda/presentation/components/date-strip-header.tsx');
let selectedDay;
const renderCalendar = props => { stateIndex = 0; return DateStripHeader(props); };
const calendar = renderCalendar({ selectedDate: '2026-12-31', onSelectDate: value => { selectedDay = value; } });
descendants(calendar).find(element => element.props?.accessibilityLabel === 'Minggu berikutnya').props.onPress();
assert.equal(selectedDay, '2027-01-07', 'Week navigation must cross the year boundary.');
descendants(calendar).find(element => element.props?.accessibilityLabel === 'Minggu sebelumnya').props.onPress();
assert.equal(selectedDay, '2026-12-24');
assert.ok(descendants(calendar).some(element => element.props?.accessibilityLabel?.startsWith('2027-01-03')), 'The displayed week may span two years.');
assert.equal(descendants(calendar).filter(el => /^\d{4}-\d{2}-\d{2}/.test(el.props?.accessibilityLabel || '')).length, 7);
descendants(calendar).find(el => el.props?.accessibilityLabel === 'Tampilkan satu bulan').props.onPress();
for (const [date, next] of [['2024-01-31', '2024-02-29'], ['2026-01-31', '2026-02-28'], ['2026-12-31', '2027-01-31']]) {
  const month = renderCalendar({ selectedDate: date, onSelectDate: day => { selectedDay = day; } });
  descendants(month).find(el => el.props?.accessibilityLabel === 'Bulan berikutnya').props.onPress();
  assert.equal(selectedDay, next);
}
for (const year of [2024, 2026, 2027]) for (let month = 1; month <= 12; month++) {
  const date = `${year}-${String(month).padStart(2, '0')}-21`;
  const grid = renderCalendar({ selectedDate: date, onSelectDate: noop });
  const dates = descendants(grid).map(element => element.props?.accessibilityLabel?.slice(0, 10)).filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value || ''));
  assert.equal(dates.length, new Set(dates).size, 'Calendar dates must never be duplicated.');
  assert.ok([28, 35, 42].includes(dates.length));
  for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) assert.ok(dates.includes(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`), 'Missing month date: ' + date + '/' + day);
}
state.length = 0; stateIndex = 0;
renderForm();
let form = renderForm();
descendants(form).find(element => element.type === native.TextInput && element.props.value === '').props.onChangeText('My draft goal');
form = renderForm();
const buttons = descendants(form).filter(element => element.type === native.Pressable);
buttons[1].props.onPress();
form = renderForm();
assert.ok(descendants(form).some(element => element.type === native.TextInput && element.props.value === 'My draft goal'));
assert.ok(form.props.footer, 'Form actions must remain outside the scroll content.');

state.length = 0;
const settingsFixture = stubs['@/features/settings/presentation/hooks/use-settings'].useSettings();
const { SettingsScreen: RestoreSettings } = createLoader({ react: fakeReact,
  '@/features/settings/presentation/hooks/use-settings': { useSettings: () => ({ ...settingsFixture,
    pendingBackup: { summary: { exportedAt: now, total: 11, targets: 1, projects: 1, tasks: 1, categories: 1, stages: 1, sessions: 1, agenda: 1 } },
  }) },
})('src/features/settings/presentation/screens/settings-screen.tsx');
const renderRestore = () => { stateIndex = 0; return RestoreSettings(); };
let restoreDialog = descendants(renderRestore()).find(element => element.props?.title === 'Pulihkan cadangan?');
assert.equal(restoreDialog.props.footer.props.disabled, true, 'Replacement requires explicit typed confirmation.');
descendants(restoreDialog).find(element => element.type === native.TextInput).props.onChangeText('PULIHKAN');
restoreDialog = descendants(renderRestore()).find(element => element.props?.title === 'Pulihkan cadangan?');
assert.equal(restoreDialog.props.footer.props.disabled, false);

const screenSpecs = [
  ['today', 'today-focus', 'today-focus-screen', 'TodayFocusScreen', {}],
  ['targets', 'targets', 'target-list-screen', 'TargetListScreen', {}],
  ['agenda', 'agenda', 'agenda-screen', 'AgendaScreen', {}],
  ['settings', 'settings', 'settings-screen', 'SettingsScreen', {}],
  ['target-detail', 'targets', 'target-detail-screen', 'TargetDetailScreen', { targetId: 'target' }],
];
const previews = [];
for (const scale of [1, 2]) {
  fontScale = scale; width = 320;
  const Timer = createLoader()('src/features/today-focus/presentation/components/focus-timer-widget.tsx').FocusTimerWidget;
  for (const running of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(Timer, { mode: 'POMODORO', formattedTime: '44:00', isRunning: running,
      hasSession: true, ready: true, selectedMinutes: 45, preferences: { pomodoroMinutes: 45, deepFlowMinutes: 90 }, activeTask: task, progressRatio: 1 / 45,
      onFinish: noop, onChangeMode: noop, onStart: noop, onPause: noop, onReset: noop }));
    assert.ok(html.includes('Pomodoro 45m') && html.includes('Deep Flow 90m') && html.includes('Akhiri &amp; catat'));
    assert.ok(html.includes('Mode dan tugas dikunci'));
    previews.push(['timer-' + (running ? 'running' : 'paused') + (scale === 2 ? '-large-text' : ''), 320, html]);
  }
  const PausedScreen = createLoader({
    '@/features/today-focus/presentation/hooks/use-focus-timer': { useFocusTimer: () => ({ mode: 'STOPWATCH', formattedTime: '01:30', hasSession: true, isRunning: false, activeTask: null, ready: true }) },
    '@/features/today-focus/presentation/hooks/use-today-focus': { useTodayFocus: () => ({ ...focus, focusItems: [], availableTasks: [] }) },
  })('src/features/today-focus/presentation/screens/today-focus-screen.tsx').TodayFocusScreen;
  const pausedHtml = renderToStaticMarkup(React.createElement(PausedScreen));
  assert.ok(pausedHtml.includes('Sesi dijeda') && pausedHtml.includes('Lihat sesi fokus'));
  previews.push(['timer-paused-independent' + (scale === 2 ? '-large-text' : ''), 320, pausedHtml]);
}
fontScale = 1;
// Exercise cancellation and an empty plan through actual screens, including large text.
for (const scale of [1, 2]) {
  fontScale = scale; width = 320;
  const cancelled = { ...task, status: 'CANCELLED' };
  const emptySummary = { totalTasks: 0, completedTasks: 0, progressPercent: 0, totalEstimatedHours: 0 };
  const emptyTarget = { ...target, ...emptySummary };
  const cancelledStage = { ...stage, status: 'NO_TASKS', tasks: [cancelled], completedTasks: 0, totalTasks: 0 };
  const scenarios = createLoader({
    '@/features/targets/presentation/hooks/use-targets': { useTargets: () => ({ ...base, targets: [emptyTarget], categories, selectedCategoryId: 'learning', setSelectedCategoryId: noop }) },
    '@/features/targets/presentation/hooks/use-target-detail': { useTargetDetail: () => ({ ...base, target: emptyTarget, stages: [cancelledStage] }) },
    '@/features/today-focus/presentation/hooks/use-today-focus': { useTodayFocus: () => ({ ...focus, focusItems: [{ id: 'daily', taskId: task.id, task: cancelled, isCompleted: false }], availableTasks: [] }) },
  });
  for (const [name, feature, file, exported, props] of screenSpecs.filter(spec => ['targets', 'target-detail', 'today'].includes(spec[0]))) {
    const Component = scenarios(`src/features/${feature}/presentation/screens/${file}.tsx`)[exported];
    const html = renderToStaticMarkup(React.createElement(Component, props));
    if (name.includes('detail')) assert.ok(html.includes('Dibatalkan') && html.includes('Buka kembali'));
    if (name.startsWith('target')) assert.ok(html.includes('Belum ada rencana'));
    if (name === 'today') { assert.ok(html.includes('aria-checked="false"')); assert.ok(html.includes('Dibatalkan') && html.includes('Buka kembali')); assert.ok(!html.includes('Fokus pada tugas ini')); }
    previews.push([name + '-cancelled-plan' + (scale === 2 ? '-large-text' : ''), 320, html]);
  }
}
fontScale = 1;
for (const viewport of [320, 360, 412]) {
  width = viewport;
  for (const [name, feature, file, exported, props] of screenSpecs) {
    const Component = load('src/features/' + feature + '/presentation/screens/' + file + '.tsx')[exported];
    const html = renderToStaticMarkup(React.createElement(Component, props));
    assert.ok(html.length > 1000, name);
    previews.push([name, viewport, html]);
  }
}
fontScale = 2;
const largeTextLoader = createLoader();
for (const viewport of [320, 360, 412]) {
  width = viewport;
  for (const [name, feature, file, exported, props] of screenSpecs) {
    const Component = largeTextLoader('src/features/' + feature + '/presentation/screens/' + file + '.tsx')[exported];
    const html = renderToStaticMarkup(React.createElement(Component, props));
    assert.ok(html.length > 1000, name);
    previews.push([name + '-large-text', viewport, html]);
  }
}
fontScale = 1;
const forms = [
  ['form-target', 'targets/presentation/components/add-target-modal.tsx', 'AddTargetModal', { categories }],
  ['form-stage', 'stages/presentation/components/add-edit-stage-modal.tsx', 'AddEditStageModal', {}],
  ['form-task', 'stages/presentation/components/add-edit-task-modal.tsx', 'AddEditTaskModal', { stageId: 'stage', stageName: 'Bangun baseline' }],
  ['form-agenda', 'agenda/presentation/components/add-event-modal.tsx', 'AddEventModal', { selectedDate: '2026-10-26' }],
];
const restorePreviewElement = () => {
  state.length = 0; stateIndex = 0;
  const PreviewSettings = createLoader({ react: fakeReact,
  '@/features/settings/presentation/hooks/use-settings': { useSettings: () => ({ ...settingsFixture,
    pendingBackup: { summary: { exportedAt: now, total: 11, targets: 1, projects: 1, tasks: 1, categories: 1, stages: 1, sessions: 1, agenda: 1 } },
  }) },
  })('src/features/settings/presentation/screens/settings-screen.tsx').SettingsScreen;
  // Native Modal portals out of the screen; isolate its sheet in this SSR fixture too.
  return descendants(PreviewSettings()).find(element => element.props?.title === 'Pulihkan cadangan?');
};
for (const scale of [1, 2]) {
  fontScale = scale;
  for (const [name, file, exported, props] of forms) {
    width = 320;
    const Component = (scale === 1 ? load : largeTextLoader)('src/features/' + file)[exported];
    const html = renderToStaticMarkup(React.createElement(Component, { ...props, visible: true, onClose: noop, onSubmit: noop }));
    assert.ok(html.includes('button'), name);
    if (name === 'form-task') assert.ok(html.includes('aria-checked="true"'), 'Selected task status must be exposed to web assistive technology.');
    previews.push([name + (scale === 2 ? '-large-text' : ''), 320, html]);
  }
  const restoreHtml = renderToStaticMarkup(restorePreviewElement());
  assert.ok(restoreHtml.includes('Pulihkan cadangan?') && restoreHtml.includes('Ganti data &amp; pulihkan'));
  previews.push(['form-restore' + (scale === 2 ? '-large-text' : ''), 320, restoreHtml]);
}
fontScale = 1;
for (const scale of [1, 2]) {
  fontScale = scale; width = 320;
  const specialEvents = [...events,
    { ...events[0], id: 'overnight', title: 'Sesi lintas malam', startTime: '2026-10-25T23:30:00', endTime: '2026-10-26T01:00:00' },
    { ...events[0], id: 'overlap', title: 'Waktu yang bertumpuk', startTime: '2026-10-26T00:30:00', endTime: '2026-10-26T02:00:00' },
    { ...events[0], id: 'all-day', title: 'Sepanjang hari', isAllDay: true, startTime: '2026-10-26', endTime: '2026-10-27' },
  ];
  const AgendaWarning = createLoader({ '@/features/agenda/presentation/hooks/use-agenda': { useAgenda: () => ({ ...base,
    selectedDate: '2026-10-26', todayDate: '2026-10-26', timeZone: 'Asia/Jakarta', setSelectedDate: noop, events: specialEvents,
    reminderWarning: 'Agenda tetap tersimpan. Pengingat belum aktif; periksa izin notifikasi.', retryReminders: noop, addEvent: noop, toggleEvent: noop, removeEvent: noop,
  }) } })('src/features/agenda/presentation/screens/agenda-screen.tsx').AgendaScreen;
  const html = renderToStaticMarkup(React.createElement(AgendaWarning));
  assert.ok(html.includes('Waktu bertumpuk') && html.includes('Berlanjut dari hari sebelumnya') && !html.includes('aria-label="Notifikasi') && !html.includes('Agenda tetap tersimpan. Pengingat belum aktif'));
  previews.push(['agenda-overlap-warning' + (scale === 2 ? '-large-text' : ''), 320, html]);
}
fontScale = 1;
todayState = { ...focus, focusItems: [], error: 'Load failed' };
const { TodayFocusScreen } = load('src/features/today-focus/presentation/screens/today-focus-screen.tsx');
const errorHtml = renderToStaticMarkup(React.createElement(TodayFocusScreen));
assert.ok(errorHtml.includes('Load failed') && !errorHtml.includes('Pilih prioritas'), 'Load failure must not look like an empty plan.');
todayState = focus;

if (process.argv.includes('--preview')) {
  const output = path.join(root, '.expo/ui-preview');
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(output, 'fonts'), { recursive: true });
  const weights = ['400Regular', '500Medium', '600SemiBold', '700Bold'];
  const fonts = weights.map(weight => {
    const filename = 'PlusJakartaSans_' + weight + '.ttf';
    fs.copyFileSync(path.join(root, 'node_modules/@expo-google-fonts/plus-jakarta-sans', weight, filename), path.join(output, 'fonts', filename));
    return '@font-face{font-family:PlusJakartaSans_' + weight + ';src:url(fonts/' + filename + ')}';
  }).join('');
  const css = native.StyleSheet.getSheet().textContent;
  const shell = (sections, viewport = 360) => '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MyLife UI fixtures</title><style>' + css + fonts + '</style><style>body{margin:0;padding:24px;background:#eee;font-family:system-ui}main{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap}.phone{position:relative;width:' + viewport + 'px;height:844px;display:flex;overflow:auto;background:' + colors.background + '}h2{font-size:16px}header{margin-bottom:24px}</style><header>Production components · fixture data · React Native Web render · not native-device QA</header><main>' + sections + '</main></html>';
  const sections = previews.filter(([, viewport]) => viewport === 360).map(([name, , html]) => '<article><h2>' + name + '</h2><div class="phone">' + html + '</div></article>').join('');
  fs.writeFileSync(path.join(output, 'index.html'), shell(sections));
  for (const [name, viewport, html] of previews) fs.writeFileSync(path.join(output, name + '-' + viewport + '.html'), shell('<div class="phone">' + html + '</div>', viewport));
  console.log('UI preview: ' + path.join(output, 'index.html'));
}
async function checkReflection() {
  state.length = 0;
  dependencies.length = 0;
  let closed = false;
  let fail = true;
  const { SessionReflectionModal } = formLoader('src/features/today-focus/presentation/components/session-reflection-modal.tsx');
  const render = () => {
    stateIndex = 0; effectIndex = 0;
    return SessionReflectionModal({ visible: true, durationMinutes: 25, onClose: () => { closed = true; }, onSubmit: async () => { if (fail) throw new Error('Storage failure'); } });
  };
  let dialog = render();
  descendants(dialog).find(element => element.type === native.TextInput).props.onChangeText('Keep this note');
  dialog = render();
  await dialog.props.footer.props.onPress();
  dialog = render();
  assert.equal(closed, false, 'A failed save must keep reflection open.');
  assert.ok(descendants(dialog).some(element => element.props?.value === 'Keep this note'), 'Failed save must retain the note.');
  assert.ok(descendants(dialog).some(element => element.props?.message?.includes('belum tersimpan')));
  fail = false;
  await dialog.props.footer.props.onPress();
  assert.equal(closed, true, 'Only a completed save closes reflection.');
  state.length = 0; let release, calls = 0; closed = false;
  const pending = new Promise(resolve => { release = resolve; });
  const busyRender = () => { stateIndex = 0; return SessionReflectionModal({ visible: true, durationMinutes: 0,
    onClose: () => { closed = true; }, onSubmit: async () => { calls++; await pending; } }); };
  dialog = busyRender(); const first = dialog.props.footer.props.onPress(); const duplicate = dialog.props.footer.props.onPress();
  busyRender().props.onClose(); assert.equal(closed, false); assert.equal(calls, 1);
  release(); await Promise.all([first, duplicate]); assert.equal(closed, true);
}
async function checkStartup() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let fails = true;
  const Alarm = () => null;
  const CalendarSync = () => null;
  const Stack = () => null; Stack.Screen = function TestStackScreen() { return null; };
  const { default: RootLayout } = createLoader({
    react: { ...fakeReact, useMemo: work => work(), useCallback: work => work },
    'expo-router': { Stack, ThemeProvider: function TestThemeProvider() { return null; }, DefaultTheme: { colors: {} } },
    'expo-splash-screen': { preventAutoHideAsync: async () => {}, hideAsync: async () => {} },
    '@expo-google-fonts/fredoka/500Medium': { Fredoka_500Medium: 1 },
    'expo-font': { useFonts: () => [true, null] },
    '@expo-google-fonts/plus-jakarta-sans/400Regular': { PlusJakartaSans_400Regular: 1 },
    '@expo-google-fonts/plus-jakarta-sans/500Medium': { PlusJakartaSans_500Medium: 1 },
    '@expo-google-fonts/plus-jakarta-sans/600SemiBold': { PlusJakartaSans_600SemiBold: 1 },
    '@expo-google-fonts/plus-jakarta-sans/700Bold': { PlusJakartaSans_700Bold: 1 },
    '@/db/client': { initDatabase: async () => { if (fails) throw new Error('Relasi legacy bermasalah'); } },
    '@/db/data-revision': { useDataRevision: () => 0 },
    '@/features/settings/data/services/backup-file.service': {},
    '@/features/task-manager/presentation/components/alarm-ringing-modal': { AlarmRingingModal: Alarm },
    '@/features/task-manager/presentation/components/managed-alarm-sync': { ManagedAlarmSync: () => null },
    '@/features/agenda/presentation/components/calendar-reminder-sync': { CalendarReminderSync: CalendarSync },
  })('src/app/_layout.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return RootLayout(); };
  render(); while (effects.length) effects.shift()();
  await Promise.resolve(); await Promise.resolve();
  const blocked = render();
  assert.ok(!descendants(blocked).some(element => element.type === Stack), 'Failed migration must never mount CRUD navigation.');
  assert.ok(!descendants(blocked).some(element => element.type === Alarm), 'Alarm polling waits for a ready database.');
  assert.ok(!descendants(blocked).some(element => element.type === CalendarSync), 'Reminder reads wait for a ready database.');
  assert.ok(descendants(blocked).some(element => element.props?.children === 'Relasi legacy bermasalah'));
  assert.ok(descendants(blocked).some(element => element.props?.title === 'Simpan salinan pemulihan'));
  fails = false;
  await descendants(blocked).find(element => element.props?.title === 'Coba lagi').props.onPress();
  assert.ok(descendants(render()).some(element => element.type === Stack), 'Successful retry opens navigation.');
  assert.equal(descendants(render()).filter(element => element.type === Alarm).length, 1, 'The app shell mounts one alarm controller.');
  assert.equal(descendants(render()).filter(element => element.type === CalendarSync).length, 1, 'The app shell mounts one calendar reminder controller.');
}
async function checkAgendaForm() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let closed = false, attempts = 0, lastInput, fail = true, release;
  const { AddEventModal } = formLoader('src/features/agenda/presentation/components/add-event-modal.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return AddEventModal({ visible: true, selectedDate: '2026-10-26', onClose: () => { closed = true; },
    onSubmit: async input => { attempts++; lastInput = input; if (release) await new Promise(resolve => { release = resolve; }); if (fail) throw new Error('Storage unavailable'); return true; } }); };
  const field = (dialog, label) => descendants(dialog).find(element => element.type === native.TextInput && element.props.accessibilityLabel === label);
  const submit = dialog => React.Children.toArray(dialog.props.footer.props.children).find(element => element.props.title === 'Jadwalkan').props.onPress();
  let dialog = render(); field(dialog, 'Judul agenda').props.onChangeText('Keep this agenda');
  field(dialog, 'Jam mulai').props.onChangeText('29:00'); dialog = render(); await submit(dialog);
  assert.equal(attempts, 0); assert.equal(closed, false); assert.ok(descendants(render()).some(element => element.props?.children?.includes?.('Jam harus valid')));
  dialog = render(); field(dialog, 'Jam mulai').props.onChangeText('23:30'); field(dialog, 'Jam selesai').props.onChangeText('01:00');
  dialog = render(); await submit(dialog); assert.equal(attempts, 0, 'End before start is never silently moved.');
  dialog = render(); descendants(dialog).find(element => element.props?.accessibilityLabel === 'Selesai besok').props.onPress();
  const off = descendants(render()).find(element => element.props?.accessibilityRole === 'button' && descendants(element).some(child => child.props?.children === 'Nonaktif'));
  off.props.onPress(); await submit(render());
  assert.equal(closed, false); assert.equal(lastInput.reminderMinutes, null);
  assert.equal(lastInput.endTime, new Date('2026-10-27T01:00:00').toISOString());
  assert.equal(field(render(), 'Judul agenda').props.value, 'Keep this agenda');
  fail = false; release = true;
  const pending = submit(render());
  await submit(render()); assert.equal(attempts, 2, 'Double tap must not create a second agenda.');
  render().props.onClose(); assert.equal(closed, false, 'Saving cannot be dismissed while awaiting completion.');
  release(); await pending; assert.equal(closed, true);
}
async function checkAlarmControls() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  const originalTimers = { setTimeout, clearTimeout, setInterval, clearInterval };
  const timers = new Map(), events = [], alerts = [];
  let nextId = 0, listener, appStateListener, releaseSave, rejectSave, writes = 0;
  globalThis.setTimeout = (fn, ms) => { const id = ++nextId; timers.set(id, { fn, ms }); return id; };
  globalThis.setInterval = globalThis.setTimeout;
  globalThis.clearTimeout = globalThis.clearInterval = id => timers.delete(id);
  const save = () => { events.push('save'); writes++; return new Promise((resolve, reject) => { releaseSave = resolve; rejectSave = reject; }); };
  const { AlarmRingingModal } = createLoader({
    react: fakeReact,
    'react-native': { ...native, useWindowDimensions: () => ({ width: 360, height: 800, fontScale: 1, scale: 1 }), AppState: { currentState: 'active', addEventListener: (_event, callback) => { appStateListener = callback; return { remove: noop }; } }, Alert: { alert: (...args) => alerts.push(args) } },
    '@/features/task-manager/data/repositories/managed-task.repository': {
      subscribeRingingAlarm: fn => { listener = fn; fn(null, false); return () => { listener = null; }; },
      clearRingingAlarm: () => { events.push('clear'); listener?.(null, false); },
      managedTaskRepository: { checkDueAlarmsNow: async () => null,
        dismissTaskAlarm: save, snoozeTaskAlarm: save, toggleTaskCompletion: save },
    },
    '@/features/task-manager/data/services/task-alarm-audio.service': { TaskAlarmAudioService: {
      startAlarmRinging: async () => { events.push('start'); }, stopAlarmRinging: () => { events.push('stop'); },
    } },
  })('src/features/task-manager/presentation/components/alarm-ringing-modal.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return AlarmRingingModal(); };
  const alarmTask = { ...task, executionDate: '2026-11-21', executionTime: '09:00', deadlineDate: '2026-11-22',
    deadlineTime: '23:59', estimatedMinutes: 30, alarmTrackName: 'Test', alarmTrackUri: 'file://test.wav' };
  let cleanup;
  try {
    render(); while (effects.length) cleanup = effects.shift()();
    listener(alarmTask, true);
    let dialog = render();
    assert.equal(descendants(dialog).filter(element => element.type === native.Pressable).length, 1);
    events.length = 0;
    await descendants(dialog).find(element => element.props?.accessibilityLabel === 'Hentikan tes alarm').props.onPress();
    assert.equal(render(), null); assert.equal(writes, 0); assert.deepEqual(events.slice(0, 2), ['stop', 'clear']);
    listener(alarmTask, true); dialog = render(); await dialog.props.onRequestClose();
    assert.equal(render(), null); assert.equal(writes, 0, 'Back during a test must never change task metadata.');
    listener(alarmTask, true);
    const timeout = [...timers.values()].find(timer => timer.ms === 10_000);
    assert.ok(timeout, 'A test has a ten-second safety timeout.'); timeout.fn();
    assert.equal(render(), null); assert.equal(writes, 0);

    listener(alarmTask, false); events.length = 0; appStateListener('background'); assert.equal(events.at(-1), 'stop');
    appStateListener('active'); assert.equal(events.at(-1), 'start'); listener(null, false);

    for (const label of ['Matikan alarm', 'Tandai tugas sudah selesai', 'Tunda alarm 5 menit', 'Tunda alarm 10 menit', 'Tunda alarm 15 menit', 'Mulai kerjakan tugas sekarang']) {
      listener(alarmTask, false); dialog = render(); events.length = 0;
      const button = descendants(dialog).find(element => element.props?.accessibilityLabel === label);
      const before = writes, pending = button.props.onPress();
      assert.equal(render(), null, label + ' must close immediately, before storage finishes.');
      assert.deepEqual(events.slice(0, 2), ['stop', 'clear']);
      assert.ok(events.indexOf('save') > events.indexOf('stop'), 'Audio must stop before any storage work.');
      await button.props.onPress(); assert.equal(writes, before + 1, 'Repeated taps cannot toggle completion twice.');
      rejectSave(new Error('Injected storage failure')); await pending;
      assert.equal(render(), null); assert.ok(alerts.at(-1)[1].includes('Injected storage failure'));
    }
    listener(alarmTask, false); dialog = render();
    const saved = dialog.props.onRequestClose(); releaseSave(); await saved;
    assert.equal(render(), null, 'Hardware back must stop a real alarm too.');
    listener(alarmTask, true); cleanup(); cleanup = null;
    assert.equal(listener, null); assert.equal(timers.size, 0, 'Unmount cancels polling and the test timeout.');
    assert.equal(events.at(-2), 'stop');
  } finally { cleanup?.(); Object.assign(globalThis, originalTimers); }
}
async function checkWeeklyForm() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let closed = false, calls = 0, mode = 'false', release, received;
  const { AddEditWeeklyScheduleModal } = formLoader('src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0;
    const dialog = AddEditWeeklyScheduleModal({ visible: true, onClose: () => { closed = true; }, onSubmit: async (input, days) => {
      calls++; received = { input, days };
      if (mode === 'false') return false;
      if (mode === 'throw') throw new Error('Injected weekly failure');
      return new Promise(resolve => { release = resolve; });
    } }); while (effects.length) effects.shift()(); return dialog;
  };
  const submit = dialog => descendants(dialog).find(element => element.props?.title === 'Buat Jadwal Tetap').props.onPress();
  render(); let dialog = render();
  descendants(dialog).find(element => element.props?.placeholder === 'Masukkan nama kegiatan').props.onChangeText('Keep this weekly draft');
  descendants(dialog).find(element => element.props?.accessibilityLabel === 'Selasa').props.onPress();
  await submit(render()); assert.equal(closed, false);
  assert.ok(descendants(render()).some(element => element.props?.value === 'Keep this weekly draft'));
  assert.deepEqual(received.days, [1, 2]);
  assert.ok(descendants(render()).some(element => element.props?.children?.includes?.('belum tersimpan')));
  mode = 'throw'; await submit(render()); assert.equal(closed, false);
  assert.ok(descendants(render()).some(element => element.props?.children === 'Injected weekly failure'));
  mode = 'pending'; dialog = render(); const before = calls, pending = submit(dialog);
  await submit(dialog); assert.equal(calls, before + 1, 'Weekly double tap must not submit a second batch.');
  render().props.onClose(); assert.equal(closed, false, 'Weekly draft cannot be dismissed while saving.');
  release(true); await pending; assert.equal(closed, true);
}
async function checkSafeDeleteAndHonestSummary() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  const calls = []; let options;
  const managed = { id: 'mtask-delete', title: 'Delete safely', categoryType: 'WORK', courseOrContext: 'Work', estimatedMinutes: 30,
    executionDate: '2026-11-22', executionTime: '09:00', deadlineDate: '2026-11-24', deadlineTime: '10:00', isCompleted: false,
    alertMode: 'NONE', subtasks: [], notes: null, alarmTrackName: 'Default' };
  const { TaskManagerScreen } = createLoader({ react: fakeReact,
    'lucide-react-native': require('lucide-react-native'),
    'react-native': { ...native, Alert: { alert: (_title, message, buttons) => { options = buttons; assert.ok(message.includes('Catatan sesi fokus tetap disimpan')); } } },
    '@/features/task-manager/presentation/hooks/use-managed-tasks': { useManagedTasks: () => ({ ...base, tasks: [managed], alarmTracks: [], todayDate: '2026-11-22',
      deleteTask: async id => calls.push(id), alarmWarning: null,
    }) },
  })('src/features/task-manager/presentation/screens/task-manager-screen.tsx');
  stateIndex = 0; effectIndex = 0; const screen = TaskManagerScreen();
  descendants(screen).find(element => element.props?.accessibilityLabel === 'Hapus tugas Delete safely').props.onPress();
  assert.deepEqual(calls, []); assert.ok(options.find(option => option.text === 'Batal'));
  await options.find(option => option.style === 'destructive').onPress(); assert.deepEqual(calls, ['mtask-delete']);
  const html = renderToStaticMarkup(React.createElement(load('src/features/targets/presentation/screens/target-list-screen.tsx').TargetListScreen));
  assert.ok(html.includes('Progres tugas') && html.includes('38%')); assert.ok(!html.includes('Produktivitasmu') && !html.includes('+38%'));
  console.log('PASS: destructive task deletion requires explicit confirmation; target summary uses factual progress.');
}
async function checkWeeklyReminderFeedback() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let retries = 0;
  const { AgendaScreen } = createLoader({ react: fakeReact,
    '@/features/agenda/presentation/hooks/use-weekly-schedules': { useWeeklySchedules: () => ({ ...base,
      reminderWarning: 'Jadwal tetap tersimpan. Pengingat belum aktif.', retryReminders: () => { retries++; },
    }) },
  })('src/features/agenda/presentation/screens/agenda-screen.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return AgendaScreen(); };
  descendants(render()).find(element => element.props?.options?.some(option => option.value === 'WEEKLY_MASTER')).props.onChange('WEEKLY_MASTER');
  const elements = descendants(render());
  assert.ok(!elements.some(element => element.props?.message?.includes('28 hari ke depan, maksimal 50')));
  assert.ok(!elements.some(element => element.props?.message === 'Jadwal tetap tersimpan. Pengingat belum aktif.'));
  assert.equal(retries, 0);
  const { useNotificationStore } = load('src/shared/notifications/notification-store.ts');
  const store = useNotificationStore;
  const notice = { id: 'calendar-reminders', title: 'Periksa kalender', message: 'Izin belum aktif', kind: 'calendar' };
  store.getState().publish(notice, notice.id);
  assert.equal(store.getState().notices.length, 1);
  store.getState().markRead(notice.id);
  store.getState().publish(notice, notice.id);
  assert.equal(store.getState().notices.length, 1);
  assert.equal(store.getState().notices[0].read, true, 'Repeated status must not recreate unread warnings');
  store.getState().publish({ ...notice, message: 'Status berubah' }, notice.id);
  assert.equal(store.getState().notices[0].read, false);
  store.getState().publish(null, notice.id);
  assert.equal(store.getState().notices.length, 0);
  console.log('PASS: calendar warning banners moved to inbox; notices deduplicate, retain read state, refresh on change and resolve.');
}
async function checkQuickTaskForm() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let mode = 'false', calls = 0, selected = 0, backs = 0, received, release;
  const { CreatePriorityScreen } = createLoader({ react: fakeReact,
    'expo-router': { router: { canGoBack: () => true, back: () => { backs++; } } },
    '@/features/today-focus/presentation/hooks/use-today-focus': { useTodayFocus: () => ({ ...focus,
      addQuickTask: async (...args) => { calls++; received = args; if (mode === 'throw') throw new Error('Quick task disk failure');
        if (mode === 'pending') return new Promise(resolve => { release = resolve; }); return false; },
      addTaskToToday: async () => { selected++; return true; },
    }) },
  })('src/features/today-focus/presentation/screens/create-priority-screen.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return CreatePriorityScreen(); };
  const find = predicate => descendants(render()).find(predicate);
  const save = () => find(element => element.props?.title === 'Simpan').props.onPress();
  find(element => element.type === native.TextInput).props.onChangeText('Keep quick draft');
  find(element => element.props?.label === 'Kerja').props.onPress();
  find(element => element.props?.accessibilityLabel === '45 menit').props.onPress();
  assert.equal(find(element => element.props?.accessibilityLabel === '45 menit').props.accessibilityState.selected, true);
  await save(); assert.equal(backs, 0);
  assert.deepEqual(received, ['Keep quick draft', undefined, { category: 'Kerja', estimatedMinutes: 45 }]);
  assert.equal(find(element => element.type === native.TextInput).props.value, 'Keep quick draft');
  assert.equal(find(element => element.props?.label === 'Kerja').props.selected, true);
  mode = 'throw'; await save(); assert.equal(backs, 0);
  assert.ok(find(element => element.props?.children === 'Quick task disk failure'));
  mode = 'pending'; const before = calls, pending = save(); await save();
  // The saved-task card shares the same submission guard as the quick-task button.
  const card = descendants(render()).find(element => String(element.key).endsWith(task.id) && element.props?.onPress);
  assert.ok(card); await card.props.onPress(); assert.equal(selected, 0);
  find(element => element.props?.onBack).props.onBack(); assert.equal(backs, 0);
  assert.equal(calls, before + 1); release(true); await pending; assert.equal(backs, 1);
  console.log('PASS: quick task form forwards category/duration, preserves failed drafts, guards duplicate/cross-action saves and back during pending.');
}
async function checkSettingsSaveFeedback() {
  state.length = 0; dependencies.length = 0; effects.length = 0;
  let settingsError = null, saving = false, succeeds = false, pendingSave = false, release;
  const { SettingsScreen } = createLoader({ react: fakeReact,
    '@/features/settings/presentation/hooks/use-settings': { useSettings: () => ({ ...settingsFixture, settingsError, isSavingSettings: saving,
      updateSetting: async () => {
        saving = true;
        if (pendingSave) await new Promise(resolve => { release = resolve; });
        saving = false; settingsError = succeeds ? null : 'Lokasi belum tersimpan. Injected failure'; return succeeds;
      },
    }) },
  })('src/features/settings/presentation/screens/settings-screen.tsx');
  const render = () => { stateIndex = 0; effectIndex = 0; return SettingsScreen(); };
  const sheet = () => descendants(render()).find(element => element.props?.title === 'Pilih Lokasi Jadwal Azan');
  const open = () => descendants(render()).find(element => element.props?.accessibilityLabel === 'Lokasi jadwal azan').props.onPress();
  const customField = placeholder => descendants(sheet()).find(element => element.props?.placeholder === placeholder);
  const saveCustom = () => descendants(sheet()).find(element => element.props?.title === 'Simpan Lokasi Kustom').props.onPress();
  open(); customField('Masukkan nama kota atau kabupaten').props.onChangeText('My city draft');
  customField('Masukkan latitude').props.onChangeText('-6.2'); customField('Masukkan longitude').props.onChangeText('106.8');
  await saveCustom(); assert.equal(sheet().props.visible, true);
  assert.equal(customField('Masukkan nama kota atau kabupaten').props.value, 'My city draft');
  assert.ok(descendants(sheet()).some(element => element.props?.message === settingsError));
  const preset = () => descendants(sheet()).find(element => element.type === native.Pressable && element.props.accessibilityLabel?.startsWith('Pilih kota '));
  await preset().props.onPress(); assert.equal(sheet().props.visible, true, 'Preset failure keeps location picker open too.');
  succeeds = true; await preset().props.onPress(); assert.equal(sheet().props.visible, false);
  open(); pendingSave = true; const pending = saveCustom();
  assert.equal(sheet().props.visible, true); assert.equal(customField('Masukkan latitude').props.editable, false);
  sheet().props.onClose(); assert.equal(sheet().props.visible, true, 'Pending location save retains its draft.');
  release(); await pending; assert.equal(sheet().props.visible, false);
}
function checkTargetNavigation() {
  const pushed = [], replaced = [], selected = [], failures = [];
  let checked = 0;
  const verify = (name, work) => { checked++; try { work(); } catch (error) { failures.push(new Error(name, { cause: error })); console.error('FAIL navigation:', name, error.message); } };
  const reset = () => { state.length = 0; dependencies.length = 0; effects.length = 0; stateIndex = 0; effectIndex = 0; pushed.length = 0; replaced.length = 0; selected.length = 0; };
  const Tabs = () => null; Tabs.Screen = function TestTabScreen() { return null; };
  const Redirect = () => null;
  let oldProjectId = 'old-project';
  const navLoader = createLoader({ react: fakeReact,
    'expo-router': { ...stubs['expo-router'], Tabs, Redirect, useLocalSearchParams: () => ({ id: oldProjectId }), router: { canGoBack: () => true, push: route => pushed.push(route), replace: route => replaced.push(route), back: noop } },
    '@/db/connection': { getSqliteDb: () => ({}) },
    '@/db/project-consolidation': { getConvertedProjectTarget: (_db, id) => id === 'old-project' ? 'converted-target' : null },
    '@/features/today-focus/presentation/hooks/use-focus-timer': { useFocusTimer: () => ({
      mode: 'POMODORO', formattedTime: '25:00', isRunning: false, hasSession: false, ready: true,
      activeTask: null, progressRatio: 0, setActiveTask: value => selected.push(value),
    }) },
  });
  verify('The focus clock skips finished and cancelled tasks when switching', () => {
    reset();
    const next = { ...task, id: 'next', title: 'Tugas berikutnya', estimatedMinutes: 15 };
    todayState = { ...focus, focusItems: [
      focus.focusItems[0],
      { id: 'complete', taskId: 'done', task: { ...task, id: 'done' }, isCompleted: true },
      { id: 'cancel', taskId: 'gone', task: { ...task, id: 'gone', status: 'CANCELLED' }, isCompleted: false },
      { id: 'second', taskId: next.id, task: next, isCompleted: false },
    ] };
    const screen = navLoader('src/features/today-focus/presentation/screens/today-focus-screen.tsx').TodayFocusScreen();
    descendants(screen).find(el => el.props?.accessibilityLabel === 'Ganti tugas fokus').props.onPress();
    assert.deepEqual(selected, [next]);
    todayState = focus;
  });
  verify('Menu tab opens the drawer', () => {
    reset(); const TabLayout = navLoader('src/app/(tabs)/_layout.tsx').default;
    let shell = TabLayout(), prevented = false;
    assert.equal(descendants(shell).filter(element => element.type === Tabs.Screen)[0].props.name, 'index');
    descendants(shell).find(element => element.props?.options?.title === 'Menu').props.listeners.tabPress({ preventDefault() { prevented = true; } });
    stateIndex = 0; effectIndex = 0; shell = TabLayout();
    assert.equal(prevented, true); assert.equal(descendants(shell).find(element => element.props?.onClose).props.visible, true);
    assert.equal(descendants(shell).find(element => element.props?.name === 'projects').props.options.href, null);
    assert.equal(descendants(shell).find(element => element.props?.options?.title === 'Menu').props.name, 'menu');
  });
  verify('Only Target is offered in the drawer; it closes before navigating', () => {
    reset(); let closed = false;
    const Drawer = navLoader('src/shared/ui/app-sidebar-drawer.tsx').AppSidebarDrawer;
    const items = descendants(Drawer({ visible: true, onClose: () => { closed = true; } }));
    assert.ok(!items.some(element => element.props?.title === 'Proyek'));
    const item = items.find(element => element.props?.title === 'Target & Peta Jalan');
    assert.ok(item); assert.equal(item.type(item.props).props.accessibilityLabel, 'Target & Peta Jalan');
    const original = globalThis.setTimeout; let navigate;
    try { globalThis.setTimeout = callback => { navigate = callback; return 1; }; item.props.onPress(); }
    finally { globalThis.setTimeout = original; }
    assert.equal(closed, true); assert.equal(pushed.length, 0); navigate(); assert.deepEqual(pushed, ['/(tabs)/targets']);
  });
  verify('Quick Add retains target/task/agenda actions without a separate project choice', () => {
    reset(); const QuickAdd = navLoader('src/features/quick-add/presentation/screens/quick-add-screen.tsx').QuickAddScreen;
    const buttons = descendants(QuickAdd()).filter(element => element.type === native.Pressable);
    assert.ok(!buttons.some(element => element.props.accessibilityLabel === 'Proyek'));
    for (const [label, route] of [['Tugas Hari Ini', '/today/new'], ['Tugas & Alarm', '/task-manager/new'], ['Target Hidup', '/targets/new'], ['Agenda & Kalender', '/agenda/new']]) {
      const item = buttons.find(element => element.props.accessibilityLabel === label); assert.ok(item, label); item.props.onPress(); assert.equal(replaced.at(-1), route);
    }
  });
  const Today = navLoader('src/features/today-focus/presentation/screens/today-focus-screen.tsx').TodayFocusScreen;
  for (const [name, fields, route, prefix] of [
    ['converted task', { targetId: 'converted-target', targetTitle: 'My former project' }, { pathname: '/targets/[id]', params: { id: 'converted-target' } }, 'Target, My former project'],
    ['target without title', { targetId: 't-two' }, { pathname: '/targets/[id]', params: { id: 't-two' } }, 'Dari Target'],
    ['cancelled target task', { targetId: 't-three', status: 'CANCELLED' }, { pathname: '/targets/[id]', params: { id: 't-three' } }, 'Dari Target'],
    ['completed target task', { targetId: 't-four', status: 'COMPLETED', isCompleted: true }, { pathname: '/targets/[id]', params: { id: 't-four' } }, 'Dari Target'],
    ['direct target task', { targetId: 't-one', targetTitle: 'Target' }, { pathname: '/targets/[id]', params: { id: 't-one' } }, 'Target, Target'],
    ['managed task', { id: 'mtask-one' }, '/task-manager', 'Tugas terjadwal'],
  ]) verify('Today opens the correct owner: ' + name, () => {
    reset(); const fixture = { ...task, targetId: null, projectId: null, ...fields };
    todayState = { ...focus, focusItems: [{ id: 'navigation-item', taskId: fixture.id, task: fixture, isCompleted: fixture.isCompleted }] };
    const row = descendants(Today()).find(element => element.type === native.Pressable && element.props.accessibilityLabel?.endsWith(': ' + fixture.title));
    assert.ok(row); row.props.onPress(); assert.deepEqual(pushed, [route]);
    assert.equal(descendants(row).filter(element => element.type === native.Pressable).length, 1, 'Navigation must not wrap other interactive controls.');
    assert.equal(row.props.accessibilityLabel, `Buka ${prefix}: ${fixture.title}`); assert.equal(selected.length, 0);
  });
  verify('An independent quick task still starts the timer without opening a project', () => {
    reset(); todayState = focus;
    descendants(Today()).find(element => element.type === native.Pressable && element.props.accessibilityLabel?.endsWith(': ' + task.title)).props.onPress();
    assert.deepEqual(pushed, []); assert.equal(selected[0].id, task.id);
  });
  verify('Old project links redirect to Target and missing/deleted conversions return to the list', () => {
    reset();
    assert.equal(navLoader('src/app/(tabs)/projects.tsx').default().props.href, '/(tabs)/targets');
    assert.equal(navLoader('src/app/projects/new.tsx').default().props.href, '/targets/new');
    const Detail = navLoader('src/app/projects/[id].tsx').default;
    assert.deepEqual(Detail().props.href, { pathname: '/targets/[id]', params: { id: 'converted-target' } });
    oldProjectId = 'deleted-project'; assert.equal(Detail().props.href, '/(tabs)/targets');
  });
  reset(); todayState = focus;
  if (failures.length) throw new AggregateError(failures, `${failures.length}/${checked} target navigation checks failed`);
  console.log(`PASS: ${checked} unified target navigation checks; native router and hooks are mocked.`);
}
checkReflection().then(checkAgendaForm).then(checkStartup).then(checkAlarmControls).then(checkWeeklyForm).then(checkSafeDeleteAndHonestSummary).then(checkWeeklyReminderFeedback).then(checkQuickTaskForm).then(checkSettingsSaveFeedback).then(checkTargetNavigation).then(() => console.log('PASS: contrast, local dates WIB/WITA/WIT, target draft/navigation, error state, async reflection retry, agenda validation/overnight/off reminder/save retry/double tap, restore confirmation, startup migration failure/retry, alarm test/auto-stop/all actions/storage failure/double tap/back/unmount, weekly draft/failure/retry/double tap, settings location draft/preset/failure/pending/success, 30 screen renders + 6 timer states + 6 cancellation/empty-plan scenarios + 2 agenda warning scenarios (simulated text 100/200%) and 10 form renders. Native layout is not covered.')).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { Module._load = originalLoad; });
