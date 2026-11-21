// Real startup/restore on disposable SQLite; never opens a user's database.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { fixture } = require('./check-backup.cjs');
let checks = 0;
async function check(name, work) { await work(); checks++; console.log('PASS:', name); }
async function setup(work) {
  const e = environment();
  try { await e.client.initDatabase(); await work(e, e.load('src/db/project-consolidation.ts')); }
  finally { e.close(); }
}
function seed(e) { const data = fixture(); e.raw.withTransactionSync(() => e.store.replaceBackupData(e.raw, data)); return data; }
function converted(e, module, id = 'projects') { const targetId = module.getConvertedProjectTarget(e.raw, id); assert.ok(targetId); return targetId; }
async function main() {
  await check('fresh install has no converted target or legacy marker', () => setup(async (e, m) => {
    assert.equal(m.hasPendingProjects(e.raw), false); assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM targets').n, 0);
  }));
  await check('startup preserves IDs/history and converts stages, overlapping milestones, loose and milestone-only tasks', () => setup(async (e, m) => {
    const data = seed(e);
    e.raw.runSync('INSERT INTO tasks (id, project_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', 'loose', 'projects', 'Loose task', 'IN_PROGRESS', data.projects[0].createdAt, data.projects[0].updatedAt);
    e.raw.runSync('INSERT INTO tasks (id, project_id, milestone_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', 'milestone-only', 'projects', 'milestones', 'Milestone task', 'CANCELLED', data.projects[0].createdAt, data.projects[0].updatedAt);
    const sessions = e.raw.getAllSync('SELECT * FROM focus_sessions'), priorities = e.raw.getAllSync('SELECT * FROM daily_focus_items');
    await e.retry(); const id = converted(e, m), target = e.raw.getFirstSync('SELECT * FROM targets WHERE id = ?', id);
    assert.equal(target.title, data.projects[0].title); assert.equal(target.priority, 'HIGH'); assert.equal(target.category_id, 'categories');
    assert.ok(target.description.includes(data.targets[0].title)); assert.equal(target.created_at, data.projects[0].createdAt);
    assert.equal(e.raw.getFirstSync('SELECT target_id FROM tasks WHERE id = ?', 'tasks').target_id, id);
    assert.equal(e.raw.getFirstSync('SELECT stage_id FROM tasks WHERE id = ?', 'tasks').stage_id, 'stages');
    assert.equal(e.raw.getFirstSync('SELECT status FROM tasks WHERE id = ?', 'tasks').status, 'DONE');
    for (const task of e.raw.getAllSync('SELECT * FROM tasks')) {
      assert.equal(task.project_id, null); assert.equal(task.milestone_id, null); assert.ok(task.stage_id);
      assert.equal(e.raw.getFirstSync('SELECT target_id FROM stages WHERE id = ?', task.stage_id).target_id, id);
    }
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM stages WHERE target_id = ?', id).n, 3);
    assert.deepEqual(e.raw.getAllSync('SELECT sort_order FROM stages WHERE target_id = ? ORDER BY sort_order', id).map(row => row.sort_order), [0, 1, 2]);
    assert.equal(e.raw.getFirstSync('SELECT target_id FROM agenda_events').target_id, id);
    assert.equal(e.raw.getFirstSync('SELECT project_id FROM agenda_events').project_id, null);
    assert.deepEqual(e.raw.getAllSync('SELECT * FROM focus_sessions'), sessions); assert.deepEqual(e.raw.getAllSync('SELECT * FROM daily_focus_items'), priorities);
    assert.equal(e.raw.getFirstSync('SELECT title FROM projects').title, data.projects[0].title);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM milestones').n, 1);
    assert.ok(JSON.parse(e.archive()).tables.find(table => table.name === 'tasks').rows.some(task => task.project_id === 'projects'));
    assert.deepEqual(e.raw.getAllSync('PRAGMA foreign_key_check'), []);
    const focus = e.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    assert.equal((await focus.getTodayFocusItems('2026-10-26'))[0].task.targetId, id);
    assert.equal((await e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository.getTargetById(id)).totalTasks, 2);
  }));
  for (const [oldStatus, status] of [['ACTIVE', 'ACTIVE'], ['ON_HOLD', 'PAUSED'], ['COMPLETED', 'COMPLETED'], ['PLANNING', 'ACTIVE']]) {
    await check('project status and dates preserved: ' + oldStatus, () => setup(async (e, m) => {
      const data = seed(e); e.raw.runSync('UPDATE projects SET status = ?, target_date = ?, completed_at = ?', oldStatus, '2027-01-01', oldStatus === 'COMPLETED' ? data.projects[0].createdAt : null);
      await e.retry(); const target = e.raw.getFirstSync('SELECT * FROM targets WHERE id = ?', converted(e, m));
      assert.equal(target.status, status); assert.equal(target.target_date, '2027-01-01');
      assert.equal(target.completed_at, oldStatus === 'COMPLETED' ? data.projects[0].createdAt : null);
      if (oldStatus === 'PLANNING') assert.ok(target.description.includes('Rencana'));
    }));
  }
  await check('standalone projects keep no invented category and ID collisions preserve existing targets', () => setup(async (e, m) => {
    seed(e); e.raw.execSync("UPDATE projects SET target_id = NULL; INSERT INTO targets (id, title, start_date, created_at, updated_at) VALUES ('target-from-project-projects', 'Keep me', '2026-01-01', '2026-01-01', '2026-01-01');");
    await e.retry(); const id = converted(e, m); assert.notEqual(id, 'target-from-project-projects');
    assert.equal(e.raw.getFirstSync('SELECT category_id FROM targets WHERE id = ?', id).category_id, null);
    assert.equal(e.raw.getFirstSync('SELECT title FROM targets WHERE id = ?', 'target-from-project-projects').title, 'Keep me');
  }));
  await check('startup/reimport is idempotent; deleting a converted target does not resurrect it', () => setup(async (e, m) => {
    seed(e); await e.retry(); const id = converted(e, m), before = e.state();
    await e.retry(); assert.equal(e.state(), before);
    const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    const exported = await repo.exportBackupJson(); await repo.restoreBackupJson(exported, exported);
    assert.deepEqual(e.store.readBackupData(e.raw), e.format.parseBackup(exported).data);
    await e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository.deleteTarget(id);
    const deleted = e.state(); await e.retry(); assert.equal(e.state(), deleted); assert.equal(m.getConvertedProjectTarget(e.raw, 'projects'), null);
  }));
  for (const pattern of [/^INSERT INTO targets/, /^UPDATE tasks SET stage_id/, /^UPDATE stages SET parent_type/, /^INSERT INTO stages/, /^UPDATE tasks SET project_id/, /^UPDATE agenda_events/, /^INSERT INTO user_settings/, /^COMMIT$/]) {
    await check('conversion rolls back on ' + pattern, () => setup(async (e, m) => {
      seed(e); const before = e.state(); let fired = false;
      e.fault(sql => { if (pattern.test(sql)) { fired = true; throw new Error('Injected conversion failure'); } });
      assert.throws(() => e.raw.withTransactionSync(() => m.consolidateProjects(e.raw)));
      e.fault(() => {}); assert.equal(fired, true); assert.equal(e.state(), before);
    }));
  }
  await check('safety archive failure blocks conversion without modifying the original data', () => setup(async (e, m) => {
    seed(e); const before = e.state(); e.save(async () => { throw new Error('Archive unavailable'); });
    await assert.rejects(e.retry(), /Archive unavailable/); assert.equal(e.state(), before); assert.equal(m.hasPendingProjects(e.raw), true);
    e.save(async () => {}); await e.retry(); converted(e, m);
  }));
  await check('a concurrent edit while saving the safety archive is retained and prevents conversion', () => setup(async (e) => {
    seed(e); e.save(async () => { e.raw.execSync("UPDATE categories SET name = 'Latest edit'"); });
    await assert.rejects(e.retry(), /Data berubah/); assert.equal(e.raw.getFirstSync('SELECT name FROM categories').name, 'Latest edit');
    assert.equal(e.raw.getFirstSync('SELECT project_id FROM tasks').project_id, 'projects');
  }));
  await check('legacy backup restore converts atomically; exported converted data parses and restores again', () => setup(async (e, m) => {
    const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    const old = e.format.serializeBackup(fixture()); await repo.restoreBackupJson(old, await repo.exportBackupJson());
    const id = converted(e, m); assert.equal(e.raw.getFirstSync('SELECT target_id FROM tasks').target_id, id);
    const exported = await repo.exportBackupJson(); e.format.parseBackup(exported);
    await repo.restoreBackupJson(exported, exported); assert.deepEqual(e.store.readBackupData(e.raw), e.format.parseBackup(exported).data);
  }));
  await check('active restore conversion failure rolls back both imported rows and new targets', () => setup(async (e) => {
    const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    const safety = await repo.exportBackupJson(), before = e.state();
    e.fault(sql => { if (/^INSERT INTO targets/.test(sql)) throw new Error('Conversion unavailable'); });
    await assert.rejects(repo.restoreBackupJson(e.format.serializeBackup(fixture()), safety)); e.fault(() => {}); assert.equal(e.state(), before);
  }));
  await check('an inconsistent conversion marker cannot hide remaining project-owned tasks', () => setup(async (e) => {
    seed(e); e.raw.runSync('INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?)', 'project_target_v1:projects', 'missing', '2026-01-01');
    const before = e.state(); await assert.rejects(e.retry(), /tidak sesuai/); assert.equal(e.state(), before);
  }));
  await check('failure on the second project rolls back both conversions', () => setup(async (e, m) => {
    seed(e); e.raw.execSync("INSERT INTO projects (id, title, created_at, updated_at) VALUES ('project-two', 'Second project', '2026-10-26', '2026-10-26');");
    const before = e.state(); let targets = 0;
    e.fault(sql => { if (/^INSERT INTO targets/.test(sql) && ++targets === 2) throw new Error('Second project failure'); });
    assert.throws(() => e.raw.withTransactionSync(() => m.consolidateProjects(e.raw))); e.fault(() => {}); assert.equal(e.state(), before);
    await e.retry(); assert.ok(m.getConvertedProjectTarget(e.raw, 'project-two')); assert.ok(m.getConvertedProjectTarget(e.raw, 'projects'));
  }));
  await check('schemaVersion 1 backups convert and their safety archives remain importable', () => setup(async (e, m) => {
    const input = JSON.parse(e.format.serializeBackup(fixture())); input.schemaVersion = 1;
    for (const stage of input.data.stages) { delete stage.targetId; delete stage.projectId; }
    for (const session of input.data.focusSessions) delete session.taskTitle;
    input.data.tasks[0].targetId = 'targets';
    const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    await repo.restoreBackupJson(JSON.stringify(input), await repo.exportBackupJson()); converted(e, m);
    seed(e); await e.retry();
    const archive = e.archive(); assert.equal(e.format.parseBackup(archive).schemaVersion, 2);
    const incomplete = JSON.parse(archive); incomplete.tables.pop();
    assert.throws(() => e.format.parseBackup(JSON.stringify(incomplete)), /tidak lengkap/);
    await repo.restoreBackupJson(archive, await repo.exportBackupJson()); converted(e, m);
  }));
  console.log(`PASS: ${checks} project consolidation checks; SQLite memory only.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
