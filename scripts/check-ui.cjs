/* eslint-disable @typescript-eslint/no-require-imports */
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
  const aliases = { CheckCircle: 'circle-check-big', CheckCircle2: 'circle-check', AlertOctagon: 'octagon-alert', AlertCircle: 'circle-alert', Trash2: 'trash', MoreHorizontal: 'ellipsis' };
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
const project = { id: 'project', title: 'Demo klasifikasi teks', targetTitle: target.title, description: 'Baseline dan evaluasi yang bisa dijelaskan.',
  status: 'ACTIVE', priority: 'HIGH', stagesCount: 1, milestonesCount: 0, taskSummary: { totalTasks: 8, completedTasks: 3, progressPercent: 38, totalEstimatedHours: 12 } };
const stage = { id: 'stage', name: 'Bangun baseline', description: 'Mulai dari model sederhana.', status: 'IN_PROGRESS', tasks: [task], completedTasks: 0, totalTasks: 1 };
const categories = [{ id: 'learning', name: 'Belajar', targetCount: 1 }, { id: 'career', name: 'Karier', targetCount: 0 }];
const base = { isLoading: false, error: null, refresh: noop, addTarget: noop, addProject: noop, addStage: noop, editStage: noop,
  removeStage: noop, reorderStage: noop, addTask: noop, editTask: noop, removeTask: noop, toggleTaskStatus: noop, deleteThisTarget: noop, deleteThisProject: noop };
const focus = { ...base, focusItems: [{ id: 'daily', taskId: task.id, task, isCompleted: false }], availableTasks: [task], completedMinutes: 45,
  toggleTask: noop, addQuickTask: noop, addTaskToToday: noop, removeFromToday: noop, recordSession: noop };
todayState = focus;
const events = [{ id: 'event', title: 'Ruang belajar Python', eventType: 'LEARNING', startTime: '2026-10-26T19:30:00', endTime: '2026-10-26T20:00:00', isAllDay: false, isCompleted: false, location: 'Rumah' }];
const stubs = {
  'expo-router': { router: { push: noop, back: noop, navigate: noop, setParams: noop }, useFocusEffect: noop, useLocalSearchParams: () => ({}) },
  'expo-status-bar': { StatusBar: () => null },
  'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) },
  'lucide-react-native': icons,
  '@/shared/hooks/use-open-add-from-param': { useOpenAddFromParam: noop },
  '@/features/today-focus/presentation/hooks/use-today-focus': { useTodayFocus: () => todayState },
  '@/features/today-focus/presentation/hooks/use-focus-timer': { useFocusTimer: () => ({ mode: 'POMODORO', formattedTime: '25:00', isRunning: false, activeTask: null, progressRatio: 0, changeMode: noop, startTimer: noop, pauseTimer: noop, resetTimer: noop, setActiveTask: noop }) },
  '@/features/targets/presentation/hooks/use-targets': { useTargets: () => ({ ...base, targets: [target], categories, selectedCategoryId: null, setSelectedCategoryId: noop }) },
  '@/features/projects/presentation/hooks/use-projects': { useProjects: () => ({ ...base, projects: [project], statusFilter: null, setStatusFilter: noop }) },
  '@/features/targets/presentation/hooks/use-target-detail': { useTargetDetail: () => ({ ...base, target, stages: [stage] }) },
  '@/features/projects/presentation/hooks/use-project-detail': { useProjectDetail: () => ({ ...base, project, stages: [stage] }) },
  '@/features/agenda/presentation/hooks/use-agenda': { useAgenda: () => ({ ...base, selectedDate: '2026-10-26', setSelectedDate: noop, events, addEvent: noop, toggleEvent: noop, removeEvent: noop }) },
  '@/features/settings/presentation/hooks/use-settings': { useSettings: () => ({ ...base, settings: { pomodoroMinutes: 25, deepFlowMinutes: 50, hapticsEnabled: true, keepAwakeEnabled: true }, stats: { targetsCount: 1, projectsCount: 1, tasksCount: 8, focusSessionsCount: 2, agendaEventsCount: 1 }, backupJson: null, setBackupJson: noop, updateSetting: noop, exportBackup: noop }) },
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
for (const [text, surface] of [['onPrimary', 'primary'], ['onHero', 'hero'], ['onHeroMuted', 'hero'], ['onSurface', 'background'], ['onSurfaceVariant', 'background'], ['onSurfaceSubtle', 'surfaceContainerLowest'], ['onPrimaryContainer', 'primaryContainer'], ['onSecondaryContainer', 'secondaryContainer'], ['onHighlight', 'highlight'], ['onError', 'error'], ['onErrorContainer', 'errorContainer'], ['success', 'surfaceContainerLowest']]) {
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

const { ProjectCard } = load('src/features/projects/presentation/components/project-card.tsx');
assert.ok(!renderToStaticMarkup(React.createElement(ProjectCard, { project: { ...project, taskSummary: { ...project.taskSummary, progressPercent: 100 } }, onPress: noop })).includes('line-through'), '100% checklist must not cross out an ACTIVE project.');

// Drive the actual form hooks: editing category must preserve the user's draft.
const state = [], dependencies = [];
let stateIndex = 0, effectIndex = 0;
const effects = [];
const fakeReact = { ...React,
  useState(initial) { const index = stateIndex++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
  useEffect(callback, next) { const index = effectIndex++; if (!dependencies[index] || next.some((value, i) => value !== dependencies[index][i])) effects.push(callback); dependencies[index] = next; },
};
const formLoader = createLoader({ react: fakeReact });
const { AddTargetModal } = formLoader('src/features/targets/presentation/components/add-target-modal.tsx');
const renderForm = () => { stateIndex = 0; effectIndex = 0; const element = AddTargetModal({ visible: true, categories, onClose: noop, onSubmit: noop }); while (effects.length) effects.shift()(); return element; };
function descendants(element) { return element && typeof element === 'object' ? [element, ...React.Children.toArray(element.props?.children).flatMap(descendants)] : []; }
const { DateStripHeader } = load('src/features/agenda/presentation/components/date-strip-header.tsx');
let selectedDay;
const calendar = DateStripHeader({ selectedDate: '2026-12-31', onSelectDate: value => { selectedDay = value; } });
descendants(calendar).find(element => element.props?.accessibilityLabel === 'Minggu berikutnya').props.onPress();
assert.equal(selectedDay, '2027-01-07', 'Week navigation must cross the year boundary.');
descendants(calendar).find(element => element.props?.accessibilityLabel === 'Minggu sebelumnya').props.onPress();
assert.equal(selectedDay, '2026-12-24');
assert.ok(descendants(calendar).some(element => element.props?.accessibilityLabel?.startsWith('2027-01-03')), 'The displayed week may span two years.');
renderForm();
let form = renderForm();
descendants(form).find(element => element.type === native.TextInput && element.props.value === '').props.onChangeText('My draft goal');
form = renderForm();
const buttons = descendants(form).filter(element => element.type === native.Pressable);
buttons[1].props.onPress();
form = renderForm();
assert.ok(descendants(form).some(element => element.type === native.TextInput && element.props.value === 'My draft goal'));
assert.ok(form.props.footer, 'Form actions must remain outside the scroll content.');

const screenSpecs = [
  ['today', 'today-focus', 'today-focus-screen', 'TodayFocusScreen', {}],
  ['targets', 'targets', 'target-list-screen', 'TargetListScreen', {}],
  ['projects', 'projects', 'project-list-screen', 'ProjectListScreen', {}],
  ['agenda', 'agenda', 'agenda-screen', 'AgendaScreen', {}],
  ['settings', 'settings', 'settings-screen', 'SettingsScreen', {}],
  ['target-detail', 'targets', 'target-detail-screen', 'TargetDetailScreen', { targetId: 'target' }],
  ['project-detail', 'projects', 'project-detail-screen', 'ProjectDetailScreen', { projectId: 'project' }],
];
const previews = [];
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
  ['form-project', 'projects/presentation/components/add-project-modal.tsx', 'AddProjectModal', {}],
  ['form-stage', 'stages/presentation/components/add-edit-stage-modal.tsx', 'AddEditStageModal', {}],
  ['form-task', 'stages/presentation/components/add-edit-task-modal.tsx', 'AddEditTaskModal', { stageId: 'stage', stageName: 'Bangun baseline' }],
  ['form-agenda', 'agenda/presentation/components/add-event-modal.tsx', 'AddEventModal', { selectedDate: '2026-10-26' }],
];
for (const scale of [1, 2]) {
  fontScale = scale;
  for (const [name, file, exported, props] of forms) {
    width = 320;
    const Component = (scale === 1 ? load : largeTextLoader)('src/features/' + file)[exported];
    const html = renderToStaticMarkup(React.createElement(Component, { ...props, visible: true, onClose: noop, onSubmit: noop }));
    assert.ok(html.includes('button'), name);
    previews.push([name + (scale === 2 ? '-large-text' : ''), 320, html]);
  }
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
}
checkReflection().then(() => console.log('PASS: contrast, local dates WIB/WITA/WIT, target draft, project lifecycle, error state, async reflection retry, 42 screen renders (3 widths, simulated text 100/200%) and 10 form renders. Native layout is not covered.')).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { Module._load = originalLoad; });
