const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
let checks = 0, failures = 0;
async function check(name, work) {
  try { await work(); checks++; console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error.message); }
}
async function setup(work) {
  const e = environment();
  try { await e.client.initDatabase(); await work(e, e.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository); }
  finally { e.close(); }
}
async function main() {
  for (const category of ['Belajar', 'Kesehatan', 'Kerja', 'Hobi']) await check('selected duration/category survive refresh and priority removal: ' + category, () => setup(async (e, repo) => {
    const task = await repo.createQuickTask('  My task  ', '2026-11-22', undefined, { estimatedMinutes: 45, category });
    assert.equal(task.estimatedMinutes, 45); assert.equal(task.quickCategory, category); assert.equal(task.focusMinutes, 45);
    let item = (await repo.getTodayFocusItems('2026-11-22'))[0];
    assert.equal(item.task.quickCategory, category); assert.equal(item.task.focusMinutes, 45);
    await repo.removeFocusItem(item.id); item = (await repo.getAvailableTasks()).find(row => row.id === task.id);
    assert.equal(item.quickCategory, category); assert.equal(item.estimatedMinutes, 45);
    await repo.addFocusItem('2026-11-22', task.id); assert.equal((await repo.getTodayFocusItems('2026-11-22'))[0].task.focusMinutes, 45);
  }));
  await check('legacy quick task calls retain default estimate and do not override focus preferences', () => setup(async (e, repo) => {
    const task = await repo.createQuickTask('Legacy', '2026-11-22');
    assert.equal(task.estimatedMinutes, 25); assert.equal(task.focusMinutes, null); assert.equal(task.quickCategory, null);
    assert.equal(e.raw.getFirstSync("SELECT count(*) n FROM user_settings WHERE key GLOB 'quick_task_details_v1:*'").n, 0);
  }));
  await check('a category without explicit duration keeps the default focus preference', () => setup(async (e, repo) => {
    const task = await repo.createQuickTask('Default duration', '2026-11-22', undefined, { category: 'Kerja' });
    assert.equal(task.quickCategory, 'Kerja'); assert.equal(task.estimatedMinutes, 25); assert.equal(task.focusMinutes, null);
  }));
  for (const estimatedMinutes of [0, -1, 1.5, NaN, Infinity, '45', 1441]) await check('invalid duration rejects without writes: ' + String(estimatedMinutes), () => setup(async (e, repo) => {
    const before = e.state(); await assert.rejects(repo.createQuickTask('Invalid', '2026-11-22', undefined, { estimatedMinutes })); assert.equal(e.state(), before);
  }));
  for (const category of ['Unknown', ['Belajar'], 1]) await check('invalid category rejects without writes: ' + JSON.stringify(category), () => setup(async (e, repo) => {
    const before = e.state(); await assert.rejects(repo.createQuickTask('Invalid', '2026-11-22', undefined, { category })); assert.equal(e.state(), before);
  }));
  for (const pattern of [/^insert into "user_settings"/i, /^insert into "daily_focus_items"/i]) await check('task/details/priority roll back together on ' + pattern, () => setup(async (e, repo) => {
    const before = e.state(); let fired = false;
    e.fault(sql => { if (pattern.test(sql)) { fired = true; throw new Error('Injected write failure'); } });
    await assert.rejects(repo.createQuickTask('Atomic', '2026-11-22', undefined, { estimatedMinutes: 60, category: 'Hobi' }));
    e.fault(() => {}); assert.ok(fired); assert.equal(e.state(), before);
  }));
  await check('a sixth priority can be selected without a hard daily cap', () => setup(async (e, repo) => {
    for (let i = 0; i < 5; i++) await repo.createQuickTask('Task ' + i, '2026-11-22', undefined, { category: 'Belajar' });
    await repo.createQuickTask('Sixth', '2026-11-22', undefined, { category: 'Kerja' }); assert.equal((await repo.getTodayFocusItems('2026-11-22')).length,6);
  }));
  await check('backup and restore retain quick task details; invalid/orphan metadata is rejected', () => setup(async (e, repo) => {
    const task = await repo.createQuickTask('Round trip', '2026-11-22', undefined, { estimatedMinutes: 30, category: 'Kesehatan' });
    const settings = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    const json = await settings.exportBackupJson(); await settings.restoreBackupJson(json, json);
    assert.equal((await repo.getAvailableTasks()).find(row => row.id === task.id).quickCategory, 'Kesehatan');
    for (const value of ['{', JSON.stringify({ category: 'Unknown', focusMinutes: 30 }), JSON.stringify({ category: 'Belajar', focusMinutes: -1 })]) {
      const bad = JSON.parse(json); bad.data.userSettings.find(row => row.key === 'quick_task_details_v1:' + task.id).value = value;
      assert.throws(() => e.format.parseBackup(JSON.stringify(bad)));
    }
    const orphan = JSON.parse(json); orphan.data.userSettings.find(row => row.key.startsWith('quick_task_details_v1:')).key = 'quick_task_details_v1:missing';
    assert.throws(() => e.format.parseBackup(JSON.stringify(orphan)));
  }));
  for (const deletion of ['task', 'stage', 'target', 'legacy-target-api']) await check('deleting ' + deletion + ' removes its quick task details atomically', () => setup(async (e, repo) => {
    const target = await e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository.createTarget({ title: 'Owner', categoryId: e.raw.getFirstSync('SELECT id FROM categories LIMIT 1').id });
    const stages = e.load('src/features/stages/data/repositories/stage.repository.impl.ts').stageRepository;
    const stage = await stages.createStage({ parentType: 'TARGET', parentId: target.id, name: 'Step' });
    const task = await repo.createQuickTask('Delete', '2026-11-22', target.id, { category: 'Kerja', estimatedMinutes: 15 });
    e.raw.runSync('UPDATE tasks SET stage_id = ? WHERE id = ?', stage.id, task.id);
    assert.ok(e.raw.getFirstSync('SELECT value FROM user_settings WHERE key = ?', 'quick_task_details_v1:' + task.id));
    const remove = () => deletion === 'task' ? stages.deleteTask(task.id) : deletion === 'stage' ? stages.deleteStage(stage.id)
      : deletion === 'legacy-target-api' ? e.load('src/db/repositories/target.repo.ts').targetRepo.deleteTarget(target.id)
      : e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository.deleteTarget(target.id);
    const before = e.state();
    e.fault(sql => { if (/^delete from "user_settings"/i.test(sql)) throw new Error('Injected metadata cleanup failure'); });
    await assert.rejects(remove()); e.fault(() => {}); assert.equal(e.state(), before);
    await remove();
    assert.equal(e.raw.getFirstSync('SELECT value FROM user_settings WHERE key = ?', 'quick_task_details_v1:' + task.id), null);
  }));
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} quick-task checks, ${failures} failures; SQLite memory only.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
