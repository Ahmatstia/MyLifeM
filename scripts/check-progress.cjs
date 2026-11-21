// Production repositories on disposable SQLite; controlled hooks without a native runtime.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { loader } = require('./check-backup.cjs');
let checks = 0;
function passed(name) { checks++; console.log('PASS:', name); }
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

async function repositories() {
  const env = environment();
  try {
    await env.client.initDatabase();
    const stage = env.load('src/features/stages/data/repositories/stage.repository.impl.ts').stageRepository;
    const focus = env.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    const target = env.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository;
    const domain = env.load('src/shared/domain/task-status.ts');
    const categoryId = env.raw.getFirstSync('SELECT id FROM categories LIMIT 1').id;
    const t = await target.createTarget({ title: 'AI Engineer', categoryId });
    const s = await stage.createStage({ parentType: 'TARGET', parentId: t.id, name: 'Baseline' });
    const direct = await stage.createStage({ parentType: 'TARGET', parentId: t.id, name: 'Dasar' });
    const a = await stage.createTask({ stageId: s.id, name: 'Model', estimatedHours: 0.5 });
    const b = await stage.createTask({ stageId: direct.id, name: 'Python', estimatedHours: 0.25 });
    await focus.addFocusItem('2026-10-27', a.id); await focus.addFocusItem('2026-10-28', a.id);
    async function expectProgress(done, total) {
      const item = await target.getTargetById(t.id);
      assert.equal(item.completedTasks, done); assert.equal(item.totalTasks, total);
      assert.equal(item.progressPercent, total ? Math.round(done / total * 100) : 0);
    }
    const readStage = async () => (await stage.getStagesWithTasks('TARGET', t.id)).find(item => item.id === s.id);
    await stage.setTaskStatus(a.id, 'COMPLETED'); await expectProgress(1, 2);
    assert.equal((await readStage()).status, 'COMPLETED');
    for (const date of ['2026-10-27', '2026-10-28']) assert.equal((await focus.getTodayFocusItems(date))[0].isCompleted, true);
    assert.ok(!(await focus.getAvailableTasks()).some(task => task.id === a.id));
    assert.equal(env.raw.getFirstSync('SELECT sum(is_completed) n FROM daily_focus_items').n, 2);
    passed('stage completion reaches its Target, every daily priority and available tasks');
    await stage.setTaskStatus(a.id, 'TODO'); await expectProgress(0, 2);
    assert.equal((await focus.getTodayFocusItems('2026-10-27'))[0].isCompleted, false);
    assert.equal(env.raw.getFirstSync('SELECT completed_at FROM tasks WHERE id = ?', a.id).completed_at, null);
    await focus.toggleTaskCompletion(a.id, true); await expectProgress(1, 2);
    assert.equal((await readStage()).tasks[0].status, 'COMPLETED');
    passed('stage and Today writers reopen/complete the same task with matching flags');
    const completedAt = env.raw.getFirstSync('SELECT completed_at FROM tasks WHERE id = ?', a.id).completed_at;
    await stage.updateTask(a.id, { name: 'Model diperbaiki', status: 'COMPLETED' });
    assert.equal(env.raw.getFirstSync('SELECT completed_at FROM tasks WHERE id = ?', a.id).completed_at, completedAt);
    assert.equal((await focus.getTodayFocusItems('2026-10-27'))[0].task.title, 'Model diperbaiki');
    passed('editing a completed task preserves completion time and updates its shared title');
    await stage.setTaskStatus(a.id, 'CANCELLED'); await expectProgress(0, 1);
    const cancelled = (await focus.getTodayFocusItems('2026-10-27'))[0];
    assert.equal(cancelled.task.status, 'CANCELLED'); assert.equal(cancelled.isCompleted, false);
    assert.ok(!(await focus.getAvailableTasks()).some(task => task.id === a.id));
    await assert.rejects(focus.addFocusItem('2026-10-29', a.id), /aktif/);
    assert.equal((await readStage()).totalTasks, 0);
    await stage.setTaskStatus(b.id, 'CANCELLED'); await expectProgress(0, 0);
    await stage.setTaskStatus(a.id, 'TODO'); await expectProgress(0, 1);
    assert.ok((await focus.getAvailableTasks()).some(task => task.id === a.id));
    passed('cancelled tasks leave progress/estimates/picker and can reopen');
    env.raw.runSync("UPDATE tasks SET status = 'DONE', is_completed = 0 WHERE id = ?", a.id);
    assert.equal((await focus.getTodayFocusItems('2026-10-27'))[0].isCompleted, true); await expectProgress(1, 1);
    env.raw.runSync("UPDATE tasks SET status = 'IN_PROGRESS', is_completed = 1 WHERE id = ?", a.id);
    assert.equal((await focus.getTodayFocusItems('2026-10-27'))[0].isCompleted, false);
    assert.equal((await readStage()).tasks[0].status, 'IN_PROGRESS'); await expectProgress(0, 1);
    assert.equal(env.store.readBackupData(env.raw).tasks.find(task => task.id === a.id).isCompleted, 1);
    passed('status wins over contradictory legacy flags without rewriting raw backup');
    assert.deepEqual(domain.summarizeTasks([{ id: 'a', status: 'DONE', estimatedMinutes: 25 }, { id: 'a', status: 'DONE', estimatedMinutes: 25 }, { id: 'b', status: 'CANCELLED', estimatedMinutes: 90 }, { id: 'c', status: 'TODO', estimatedMinutes: 5 }]),
      { totalTasks: 2, completedTasks: 1, progressPercent: 50, totalEstimatedHours: 0.5 });
    passed('progress deduplicates IDs, excludes cancellation and keeps fractional estimates');
    for (const writer of [() => focus.toggleTaskCompletion(a.id, true), () => stage.setTaskStatus(a.id, 'COMPLETED'), () => stage.updateTask(a.id, { name: 'lost', status: 'COMPLETED' })]) {
      const before = env.state(); env.fault(sql => { if (sql.startsWith('update "daily_focus_items"')) throw new Error('write failure'); });
      await assert.rejects(writer(), /write failure/); env.fault(() => {}); assert.equal(env.state(), before);
    }
    await assert.rejects(stage.setTaskStatus(a.id, 'DONE'), /valid/); await assert.rejects(stage.setTaskStatus(a.id, 'UNKNOWN'), /valid/);
    await assert.rejects(focus.toggleTaskCompletion('missing', true), /ditemukan/);
    passed('all status writers roll back task/metadata/flags; invalid and missing writes fail');
    const other = await target.createTarget({ title: 'Other', categoryId });
    const loose = await focus.createQuickTask('Independent', '2026-11-01', other.id);
    await focus.toggleTaskCompletion(loose.id, true); await expectProgress(0, 1);
    const c = await focus.createQuickTask('Direct Target task', '2026-11-01', t.id); await focus.toggleTaskCompletion(c.id, true);
    await expectProgress(1, 2);
    assert.equal((await target.getTargets({ categoryId })).find(item => item.id === t.id).totalTasks, 2);
    assert.equal((await target.getTargetById(t.id)).status, 'ACTIVE');
    await stage.deleteTask(c.id); await expectProgress(0, 1);
    passed('direct and stage tasks roll up once; unrelated targets, filters and deletion stay scoped');
  } finally { env.close(); }
}

function harness(stubs) {
  const values = [], dependencies = [], cleanups = [], effects = []; let index = 0, focused = true;
  const React = {
    useState(initial) { const i = index++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], value => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; },
    useRef(initial) { const i = index++; return values[i] ??= { current: initial }; },
    useMemo(factory, next) { const i = index++; if (!dependencies[i] || next.some((v, j) => v !== dependencies[i][j])) { values[i] = factory(); dependencies[i] = next; } return values[i]; },
    useCallback(callback, next) { const i = index++; if (!dependencies[i] || next.some((v, j) => v !== dependencies[i][j])) { values[i] = callback; dependencies[i] = next; } return values[i]; },
    useEffect(callback, next) { const i = index++; if (!dependencies[i] || next.some((v, j) => v !== dependencies[i][j])) { effects.push(() => { cleanups[i]?.(); cleanups[i] = callback(); }); dependencies[i] = next; } },
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Controlled test focus changes trigger explicit harness renders.
  const load = loader({ react: React, 'expo-router': { useFocusEffect: callback => React.useEffect(() => focused ? callback() : undefined, [callback, focused]) }, ...stubs });
  return { load, focus(value) { focused = value; }, render(hook) { index = 0; const result = hook(); while (effects.length) effects.shift()(); return result; }, close() { cleanups.forEach(fn => fn?.()); } };
}
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }

async function hooks() {
  const race = harness({});
  const useResource = race.load('src/shared/hooks/use-focused-resource.ts').useFocusedResource;
  const delayed = deferred();
  const read = () => delayed.promise;
  const Resource = () => useResource('one', read, 'read failed');
  race.render(Resource); race.render(Resource).setError('Status belum tersimpan.');
  delayed.resolve('stale success'); await tick();
  assert.match(race.render(Resource).error, /belum tersimpan/);
  assert.equal(race.render(Resource).isLoading, false); race.close();
  passed('an older successful read cannot clear a newer mutation failure');
  for (const kind of ['targets', 'target-detail', 'today-focus']) {
    let id = 'old', defer = true, version = 'old', fail = false; const pending = [];
    const get = async () => { if (fail) throw new Error('read failed'); if (!defer) return { id: version }; const item = deferred(); pending.push(item); return item.promise; };
    const stubs = {
      '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => ({ date: id, key: id }) },
      '../../data/repositories/target.repository.impl': { targetRepository: { getTargets: async () => [await get()], getPillars: async () => [], getTargetById: get } },
      '@/features/categories/data/repositories/category.repository.impl': { categoryRepository: { getAll: async () => [] } },
      '@/features/stages/data/repositories/stage.repository.impl': { stageRepository: { getStagesWithTasks: async () => [] } },
      '../../data/repositories/daily-focus.repository.impl': { dailyFocusRepository: { getTodayFocusItems: async () => [await get()], getTodayCompletedMinutes: async () => 0, getAvailableTasks: async () => [] } },
    };
    const h = harness(stubs), feature = kind.startsWith('target') ? 'targets' : 'today-focus';
    const name = { targets: 'useTargets', 'target-detail': 'useTargetDetail', 'today-focus': 'useTodayFocus' }[kind];
    const fn = h.load(`src/features/${feature}/presentation/hooks/use-${kind}.ts`)[name];
    const hook = () => fn(id), data = state => (state.targets || state.projects || state.focusItems)?.[0] || state.target || state.project;
    const first = h.render(hook);
    id = 'new';
    if (kind === 'targets') first.setSelectedCategoryId('new');
    h.render(hook); assert.equal(pending.length, 2);
    pending[1].resolve({ id: 'new' }); await tick(); pending[0].reject(new Error('stale failure')); await tick();
    assert.equal(data(h.render(hook)).id, 'new'); assert.equal(h.render(hook).error, null);
    await first.refresh(); assert.equal(pending.length, 2);
    defer = false; version = 'after-return'; h.focus(false); h.render(hook); h.focus(true); h.render(hook); await tick();
    assert.equal(data(h.render(hook)).id, 'after-return');
    fail = true; await h.render(hook).refresh(); assert.match(h.render(hook).error, /read failed/);
    fail = false; version = 'retry'; await h.render(hook).refresh(); assert.equal(data(h.render(hook)).id, 'retry');
    defer = true; const inFlight = h.render(hook).refresh(); const beforeBlur = data(h.render(hook));
    h.focus(false); h.render(hook); pending.at(-1).resolve({ id: 'after-blur' }); await inFlight;
    assert.equal(data(h.render(hook)), beforeBlur);
    h.close(); passed(`${kind}: refocus refresh, obsolete key/failure/mutation callback, blur and retry`);
  }
  let value = { id: 'one' }, saved = 0;
  const h = harness({ '../../data/repositories/target.repository.impl': { targetRepository: {
    getTargetById: async () => value,
  } }, '@/features/stages/data/repositories/stage.repository.impl': { stageRepository: {
    getStagesWithTasks: async () => [], setTaskStatus: async () => { throw new Error('disk full'); },
    createTask: async () => { saved++; value = null; },
  } } });
  const fn = h.load('src/features/targets/presentation/hooks/use-target-detail.ts').useTargetDetail, hook = () => fn('one');
  h.render(hook); await tick(); await h.render(hook).toggleTaskStatus('task', 'TODO');
  assert.match(h.render(hook).error, /belum tersimpan/);
  assert.equal(await h.render(hook).addTask({}), true); assert.equal(saved, 1);
  assert.match(h.render(hook).error, /tidak ditemukan/); assert.equal(h.render(hook).target, null);
  h.close(); passed('mutation failure is visible; committed save remains successful if subsequent reload fails');
}
async function main() { await repositories(); await hooks(); console.log(`PASS: ${checks} status/progress/refresh checks. No user database accessed.`); }
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { harness, tick };
