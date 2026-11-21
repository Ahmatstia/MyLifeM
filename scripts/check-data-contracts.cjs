// Production repositories and backup parser; every database is disposable SQLite memory.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
let checks = 0, failures = 0;
const managedFile = 'src/features/task-manager/data/repositories/managed-task.repository.ts';
const focusFile = 'src/features/today-focus/data/repositories/daily-focus.repository.impl.ts';
const weeklyFile = 'src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts';
const categoryFile = 'src/features/categories/data/repositories/category.repository.impl.ts';
function input(e, extra = {}) {
  return { title: 'Contract task', executionDate: e.load('src/shared/utils/local-date.ts').formatLocalDate(new Date()),
    executionTime: '09:00', deadlineDate: '2099-12-31', deadlineTime: '23:59', alertMode: 'NONE',
    alarmTrackId: 'builtin-siren-energize', alarmTrackName: 'Built in', subtasks: ['Step'], ...extra };
}
const stored = e => JSON.parse(e.raw.getFirstSync("SELECT value FROM user_settings WHERE key = 'managed_tasks_v1'").value);
async function check(name, work) {
  const e = environment();
  try { await e.client.initDatabase(); await work(e); checks++; console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error); }
  finally { e.close(); }
}
async function main() {
  for (const patch of [
    { executionDate: '2026-02-30' }, { deadlineDate: '2025-02-29' }, { executionTime: '24:00' },
    { deadlineTime: '99:99' }, { title: ' ' }, { estimatedMinutes: -1 }, { snoozeMinutes: 0 },
    { alertMode: 'MAGIC' }, { priority: 'MAGIC' }, { categoryType: 'MAGIC' },
  ]) {
    await check(`managed create rejects ${JSON.stringify(patch)} before any write`, async e => {
      const before = e.state();
      await assert.rejects(e.load(managedFile).managedTaskRepository.createTask(input(e, patch)));
      assert.equal(e.state(), before);
    });
  }
  await check('valid leap dates, midnight and late execution retain compatibility and backup round-trip', async e => {
    await e.load(managedFile).managedTaskRepository.createTask(input(e, {
      executionDate: '2028-02-29', executionTime: '00:00', deadlineDate: '2028-02-28',
      deadlineTime: '23:59', estimatedMinutes: 0, autoAddToToday: false,
    }));
    const data = e.store.readBackupData(e.raw);
    assert.deepEqual(e.format.parseBackup(e.format.serializeBackup(data)).data, data);
    const legacy = JSON.parse(e.format.serializeBackup(data));
    legacy.schemaVersion = 1;
    assert.deepEqual(e.format.parseBackup(JSON.stringify(legacy)).data, data);
  });
  for (const [name, corrupt] of [
    ['null entry', () => [null]], ['object instead of list', () => ({})],
    ['duplicate task ID', list => [list[0], list[0]]],
    ['invalid date', list => [{ ...list[0], executionDate: '2026-02-30' }]],
    ['invalid clock', list => [{ ...list[0], deadlineTime: '99:99' }]],
    ['invalid subtask flag', list => [{ ...list[0], subtasks: [{ ...list[0].subtasks[0], isCompleted: 'yes' }] }]],
    ['invalid exclusion date', list => [{ ...list[0], excludedFocusDates: ['2026-02-30'] }]],
    ...['categoryType', 'priority', 'alertMode'].map(field => [
      `${field} array instead of string`, list => [{ ...list[0], [field]: [list[0][field]] }],
    ]),
  ]) {
    await check(`backup rejects managed ${name} before replacing data`, async e => {
      await e.load(managedFile).managedTaskRepository.createTask(input(e));
      const before = e.state(), data = e.store.readBackupData(e.raw);
      const row = data.userSettings.find(row => row.key === 'managed_tasks_v1');
      row.value = JSON.stringify(corrupt(JSON.parse(row.value)));
      const json = e.format.serializeBackup(data);
      assert.throws(() => e.format.parseBackup(json), /Cadangan tidak valid/);
      const settings = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
      await assert.rejects(settings.restoreBackupJson(json, await settings.exportBackupJson()));
      assert.equal(e.state(), before);
    });
  }
  for (const patch of [
    { startTime: '24:00', endTime: '25:00' }, { startTime: '08:60' }, { startTime: '8:00' },
    { dayOfWeek: 1.5 }, { scheduleType: 'MAGIC' }, { reminderMinutes: -1 },
  ]) {
    await check(`weekly create/update reject ${JSON.stringify(patch)} without writes`, async e => {
      const repo = e.load(weeklyFile).weeklyScheduleRepository;
      const valid = { title: 'Routine', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', scheduleType: 'ROUTINE' };
      const task = await repo.createWeeklySchedule(valid), before = e.state();
      await assert.rejects(repo.createWeeklySchedule({ ...valid, ...patch }));
      await assert.rejects(repo.updateWeeklySchedule(task.id, patch));
      assert.equal(e.state(), before);
    });
  }
  await check('weekly backup and valid midnight projection use the same clock contract', async e => {
    const repo = e.load(weeklyFile).weeklyScheduleRepository;
    await repo.createWeeklySchedule({ title: 'Midnight', dayOfWeek: 1, startTime: '00:00', endTime: '23:59', scheduleType: 'ROUTINE', reminderMinutes: 0 });
    assert.equal((await repo.getProjectedSchedulesForDate('2026-11-23')).length, 1);
    const data = e.store.readBackupData(e.raw);
    assert.deepEqual(e.format.parseBackup(e.format.serializeBackup(data)).data, data);
    data.weeklySchedules[0].startTime = '24:00'; data.weeklySchedules[0].endTime = '25:00';
    assert.throws(() => e.format.parseBackup(e.format.serializeBackup(data)), /Cadangan tidak valid/);
  });
  await check('case-insensitive concurrent category create/update preserves backup compatibility', async e => {
    const repo = e.load(categoryFile).categoryRepository;
    const creates = await Promise.allSettled([repo.create({ name: 'ContractCase' }), repo.create({ name: ' CONTRACTCASE ' })]);
    assert.equal(creates.filter(result => result.status === 'fulfilled').length, 1);
    const a = await repo.create({ name: 'Different A' }), b = await repo.create({ name: 'Different B' });
    const updates = await Promise.allSettled([repo.update(a.id, { name: 'RenamedCase' }), repo.update(b.id, { name: ' RENAMEDCASE ' })]);
    assert.equal(updates.filter(result => result.status === 'fulfilled').length, 1);
    const data = e.store.readBackupData(e.raw);
    assert.deepEqual(e.format.parseBackup(e.format.serializeBackup(data)).data, data);
  });
  await check('legacy target keeps a null category and is not assigned to the career filter', async e => {
    const repo = e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository;
    const category = e.raw.getFirstSync('SELECT id FROM categories LIMIT 1');
    const target = await repo.createTarget({ title: 'Uncategorized legacy', categoryId: category.id });
    e.raw.runSync('UPDATE targets SET category_id = NULL WHERE id = ?', target.id);
    const item = await repo.getTargetById(target.id);
    assert.equal(item.categoryId, null); assert.equal(item.categoryName, 'Umum');
    assert.ok((await repo.getTargets()).some(t => t.id === target.id));
    assert.ok(!(await repo.getTargets({ categoryId: 'cat-karier' })).some(t => t.id === target.id));
  });
  await check('removed managed priority stays removed across refresh and a fresh repository instance', async e => {
    const { managedTaskRepository: managed, ManagedTaskRepository } = e.load(managedFile);
    const focus = e.load(focusFile).dailyFocusRepository;
    const task = await managed.createTask(input(e)), today = input(e).executionDate;
    const row = e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id);
    await focus.removeFocusItem(row.id);
    await managed.syncWithCoreTasksAndToday(); await new ManagedTaskRepository().syncWithCoreTasksAndToday();
    assert.ok(!(await focus.getTodayFocusItems(today)).some(item => item.taskId === task.id));
    assert.ok(stored(e)[0].excludedFocusDates.includes(today));
    assert.ok(e.raw.getFirstSync('SELECT id FROM tasks WHERE id = ?', task.id));
  });
  await check('explicit add clears the opt-out and a later removal restores it', async e => {
    const managed = e.load(managedFile).managedTaskRepository, focus = e.load(focusFile).dailyFocusRepository;
    const task = await managed.createTask(input(e)), today = input(e).executionDate;
    const rowId = () => e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id;
    await focus.removeFocusItem(rowId());
    await focus.addFocusItem(today, task.id);
    assert.ok(!stored(e)[0].excludedFocusDates.includes(today));
    await focus.removeFocusItem(rowId()); await managed.syncWithCoreTasksAndToday();
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items WHERE task_id = ?', task.id).n, 0);
  });
  await check('opt-out survives backup/restore and respects the five-priority limit', async e => {
    const managed = e.load(managedFile).managedTaskRepository, focus = e.load(focusFile).dailyFocusRepository;
    const task = await managed.createTask(input(e)), today = input(e).executionDate;
    await focus.removeFocusItem(e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id);
    const settings = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    const json = await settings.exportBackupJson();
    await focus.addFocusItem(today, task.id);
    await settings.restoreBackupJson(json, await settings.exportBackupJson());
    await managed.syncWithCoreTasksAndToday();
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items WHERE task_id = ?', task.id).n, 0);
    for (let i = 0; i < 5; i++) await focus.createQuickTask('Other ' + i, today);
    const before = e.state(); await assert.rejects(focus.addFocusItem(today, task.id), /5/);
    assert.equal(e.state(), before); await managed.syncWithCoreTasksAndToday();
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items WHERE date = ?', today).n, 5);
  });
  for (const sql of [/^insert into "user_settings"/i, /^delete from "daily_focus_items"/i]) {
    await check(`priority removal rolls back both exclusion and relation when ${sql} fails`, async e => {
      const task = await e.load(managedFile).managedTaskRepository.createTask(input(e));
      const focus = e.load(focusFile).dailyFocusRepository;
      const id = e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id;
      const before = e.state();
      e.fault(statement => { if (sql.test(statement)) throw new Error('Injected exclusion failure'); });
      try { await assert.rejects(focus.removeFocusItem(id)); }
      finally { e.fault(() => {}); }
      assert.equal(e.state(), before);
    });
  }
  await check('concurrent removal/refresh cannot re-add the excluded priority', async e => {
    const managed = e.load(managedFile).managedTaskRepository, focus = e.load(focusFile).dailyFocusRepository;
    const task = await managed.createTask(input(e));
    const id = e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id;
    await Promise.all([focus.removeFocusItem(id), managed.syncWithCoreTasksAndToday()]);
    await managed.syncWithCoreTasksAndToday();
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items WHERE task_id = ?', task.id).n, 0);
  });
  await check('failed explicit re-add preserves the opt-out and rolls back the new priority', async e => {
    const task = await e.load(managedFile).managedTaskRepository.createTask(input(e));
    const focus = e.load(focusFile).dailyFocusRepository, today = input(e).executionDate;
    await focus.removeFocusItem(e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id);
    const before = e.state();
    e.fault(sql => { if (/^insert into "user_settings"/i.test(sql)) throw new Error('Injected clear exclusion failure'); });
    try { await assert.rejects(focus.addFocusItem(today, task.id)); }
    finally { e.fault(() => {}); }
    assert.equal(e.state(), before);
  });
  await check('removing a regular quick-task priority does not exclude a managed task', async e => {
    const managed = e.load(managedFile).managedTaskRepository, focus = e.load(focusFile).dailyFocusRepository;
    const task = await managed.createTask(input(e)), today = input(e).executionDate;
    const quick = await focus.createQuickTask('Regular task', today), before = stored(e);
    await focus.removeFocusItem(e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', quick.id).id);
    assert.deepEqual(stored(e), before);
    assert.ok((await focus.getTodayFocusItems(today)).some(item => item.taskId === task.id));
    assert.ok(e.raw.getFirstSync('SELECT id FROM tasks WHERE id = ?', quick.id));
  });
  await check('excluding today leaves the overdue task eligible on the following day', async e => {
    const RealDate = Date; let now = new RealDate('2026-11-21T12:00:00').getTime();
    globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
    try {
      const managed = e.load(managedFile).managedTaskRepository, focus = e.load(focusFile).dailyFocusRepository;
      const task = await managed.createTask(input(e));
      await focus.removeFocusItem(e.raw.getFirstSync('SELECT id FROM daily_focus_items WHERE task_id = ?', task.id).id);
      now = new RealDate('2026-11-22T12:00:00').getTime();
      const items = await focus.getTodayFocusItems('2026-11-22');
      assert.ok(items.some(item => item.taskId === task.id));
      assert.ok(!stored(e)[0].excludedFocusDates.includes('2026-11-22'));
    } finally { globalThis.Date = RealDate; }
  });
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} data-contract checks, ${failures} failures; no user database accessed.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
