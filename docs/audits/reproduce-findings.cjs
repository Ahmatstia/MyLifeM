/* Read-only audit of application files. All databases are disposable memory. */
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const fs = require('node:fs');
const crypto = require('node:crypto');
const root = process.env.MYLIFE_AUDIT_ROOT || (fs.existsSync(path.resolve(__dirname, '../../package.json')) ? path.resolve(__dirname, '../..') : 'D:/IT/Software Engineer/mobile/MyLife');
const inheritedTZ = process.env.TZ;
process.env.TZ = 'Asia/Jakarta';
const originalLoad = Module._load;
Module._load = function (id, parent, ...args) {
  if (id === 'react-native') return { Platform: { OS: 'web' } };
  if (id === 'expo') return { requireOptionalNativeModule: () => null };
  return originalLoad.call(this, id, parent, ...args);
};
const { environment } = require(path.join(root, 'scripts/check-integrity.cjs'));
const results = [];
function inventory() {
  const ts = require(path.join(root, 'node_modules/typescript'));
  function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]); }
  return walk(path.join(root, 'src')).map(file => {
    const source = fs.readFileSync(file, 'utf8');
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const kind = relative.startsWith('src/app/') ? 'route' : relative.includes('/presentation/screens/') ? 'screen' : relative.endsWith('.tsx') ? 'component' : 'module';
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const fields = [], interactive = [], exports = [], styles = [];
    const line = n => parsed.getLineAndCharacterOfPosition(n.getStart(parsed)).line + 1;
    function visit(node) {
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))) {
        const name = node.tagName.getText(parsed);
        const props = Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(a => [a.name.getText(parsed), a.initializer?.getText(parsed).slice(0, 500) || 'true']));
        if (name === 'TextInput') fields.push({ line: line(node), ...props });
        if (['Pressable', 'Switch', 'Button', 'SunButton'].includes(name)) interactive.push({ line: line(node), type: name, ...Object.fromEntries(Object.entries(props).filter(([k]) => /^(onPress|onValueChange|accessibility|aria-|title|disabled|loading)/.test(k))) });
      }
      if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) for (const d of node.declarationList.declarations) exports.push(d.name.getText(parsed));
      if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) exports.push(node.name?.text || 'default');
      if (ts.isCallExpression(node) && node.expression.getText(parsed) === 'StyleSheet.create' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        for (const item of node.arguments[0].properties) if (ts.isPropertyAssignment(item)) styles.push({ name: item.name.getText(parsed), line: line(item), value: item.initializer.getText(parsed) });
      }
      ts.forEachChild(node, visit);
    }
    visit(parsed);
    return { file: relative, sha256: crypto.createHash('sha256').update(source).digest('hex'), lines: source.split('\n').length, kind, exports, fields, interactive, styles };
  });
}
async function check(id, work) {
  const e = environment();
  try {
    await e.client.initDatabase();
    results.push({ id, reproduced: true, evidence: await work(e) });
  } finally { e.close(); }
}
function input(title, overrides = {}) {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  return { title, executionDate: date, executionTime: '09:00', deadlineDate: date,
    deadlineTime: '23:59', alertMode: 'NONE', alarmTrackId: 'builtin-siren-energize',
    alarmTrackName: 'Built in', estimatedMinutes: 30, ...overrides };
}
async function main() {
  await check('F01-routine-backup', async e => {
    const weekly = e.load('src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts').weeklyScheduleRepository;
    await weekly.createWeeklySchedule({ title: 'Rutinitas sah dari UI', dayOfWeek: 1, startTime: '05:00', endTime: '06:00', scheduleType: 'ROUTINE' });
    const json = e.format.serializeBackup(e.store.readBackupData(e.raw));
    let failure; try { e.format.parseBackup(json); } catch (error) { failure = error.message; }
    assert.match(failure, /scheduleType/);
    return { rowsSaved: 1, exportSucceeds: true, importError: failure };
  });
  await check('F02-managed-status-reset', async e => {
    const repo = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
    const task = await repo.createTask(input('Tugas status'));
    const statuses = [];
    for (const status of ['IN_PROGRESS', 'CANCELLED']) {
      e.raw.runSync('UPDATE tasks SET status = ?, is_completed = 0 WHERE id = ?', status, task.id);
      await repo.syncWithCoreTasksAndToday();
      const after = e.raw.getFirstSync('SELECT status FROM tasks WHERE id = ?', task.id).status;
      assert.equal(after, 'TODO'); statuses.push({ before: status, after });
    }
    return statuses;
  });
  await check('F03-managed-concurrent-create', async e => {
    const repo = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
    await Promise.all([repo.createTask(input('Task A')), repo.createTask(input('Task B'))]);
    const stored = JSON.parse(e.raw.getFirstSync("SELECT value FROM user_settings WHERE key = 'managed_tasks_v1'").value);
    const coreCount = e.raw.getFirstSync('SELECT count(*) AS n FROM tasks').n;
    assert.equal(stored.length, 1); assert.equal(coreCount, 2);
    return { managedCount: stored.length, coreCount, result: 'One task loses scheduling/alarm metadata.' };
  });
  await check('F04-managed-silent-write-failure', async e => {
    const repo = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
    e.fault(sql => { if (/^insert into "tasks"/i.test(sql)) throw new Error('AUDIT simulated disk full'); });
    const created = await repo.createTask(input('Core insert fails'));
    e.fault(() => {});
    const coreCount = e.raw.getFirstSync('SELECT count(*) AS n FROM tasks').n;
    assert.equal(coreCount, 0);
    return { createReportedSuccess: Boolean(created.id), coreCount, managedCount: (await repo.getAllTasks()).length };
  });
  await check('F05-priority-removal-reversed', async e => {
    const repo = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
    const task = await repo.createTask(input('Removed priority'));
    e.raw.runSync('DELETE FROM daily_focus_items WHERE task_id = ?', task.id);
    const before = e.raw.getFirstSync('SELECT count(*) AS n FROM daily_focus_items').n;
    await repo.syncWithCoreTasksAndToday();
    const after = e.raw.getFirstSync('SELECT count(*) AS n FROM daily_focus_items').n;
    assert.equal(before, 0); assert.equal(after, 1);
    return { beforeRefresh: before, afterRefresh: after };
  });
  await check('F06-managed-invalid-date-poisons-backup', async e => {
    const repo = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
    await repo.createTask(input('Impossible date', { executionDate: '2026-02-30', deadlineDate: '2026-02-30', executionTime: '99:99', autoAddToToday: false }));
    const json = e.format.serializeBackup(e.store.readBackupData(e.raw));
    let failure; try { e.format.parseBackup(json); } catch (error) { failure = error.message; }
    assert.match(failure, /tanggal tasks.dueDate/);
    return { createSucceeds: true, exportSucceeds: true, importError: failure };
  });
  await check('F07-weekly-invalid-clock', async e => {
    const repo = e.load('src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts').weeklyScheduleRepository;
    await repo.createWeeklySchedule({ title: 'Invalid restored clock', dayOfWeek: 1, startTime: '24:00', endTime: '25:00', scheduleType: 'WORK' });
    const json = e.format.serializeBackup(e.store.readBackupData(e.raw));
    assert.ok(e.format.parseBackup(json));
    let failure; try { await repo.getProjectedSchedulesForDate('2026-11-23'); } catch (error) { failure = error.message; }
    assert.match(failure, /Jam harus valid/);
    return { repositoryAccepts: true, backupAccepts: true, projectionError: failure, uiHasStricterValidation: true };
  });
  await check('F08-legacy-target-category-invented', async e => {
    const now = new Date().toISOString();
    e.raw.runSync('INSERT INTO targets (id,title,category_id,start_date,created_at,updated_at) VALUES (?,?,?,?,?,?)', 'legacy-null', 'Legacy null', null, now, now, now);
    const repo = e.load('src/features/targets/data/repositories/target.repository.impl.ts').targetRepository;
    const target = await repo.getTargetById('legacy-null');
    const filtered = await repo.getTargets({ categoryId: target.categoryId });
    assert.equal(target.categoryId, 'cat-karier'); assert.equal(target.categoryName, 'Umum');
    assert.equal(filtered.some(x => x.id === target.id), false);
    return { storedCategory: null, returnedCategory: target.categoryId, returnedLabel: target.categoryName, visibleUnderReturnedCategory: false };
  });
  await check('F09-opaque-managed-settings', async e => {
    const data = e.store.readBackupData(e.raw);
    data.userSettings.push({ key: 'managed_tasks_v1', value: '[null]', updatedAt: new Date().toISOString() });
    const parsed = e.format.parseBackup(e.format.serializeBackup(data));
    assert.equal(parsed.data.userSettings.find(x => x.key === 'managed_tasks_v1').value, '[null]');
    return { malformedManagedPayloadAccepted: true, payload: '[null]' };
  });
  await check('F10-project-query-count', async e => {
    const repo = e.load('src/features/projects/data/repositories/project.repository.impl.ts').projectRepository;
    const now = new Date().toISOString();
    e.raw.runSync('INSERT INTO targets (id,title,start_date,created_at,updated_at) VALUES (?,?,?,?,?)', 'target', 'Target', now, now, now);
    const ids = [];
    for (let i = 0; i < 30; i++) ids.push((await repo.createProject({ title: 'Project ' + i, targetId: 'target' })).id);
    const queries = [];
    e.fault(sql => { if (/^select/i.test(sql)) queries.push(sql); });
    const one = await repo.getProjectById(ids[0]);
    e.fault(() => {});
    assert.ok(one); assert.ok(queries.length >= 63);
    const livenessProbes = queries.filter(sql => /^SELECT 1;?$/i.test(sql.trim())).length;
    assert.equal(queries.length - livenessProbes, 63);
    return { projectsInDb: 30, requestedProjects: 1, applicationSelects: queries.length - livenessProbes, livenessProbes, totalSelects: queries.length, timingBenchmark: false };
  });
  const { loader } = require(path.join(root, 'scripts/check-backup.cjs'));
  const RealDate = Date;
  const frozen = RealDate.parse('2026-11-21T05:00:00+07:00');
  global.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [frozen])); } static now() { return frozen; } };
  try {
    const prayer = loader()('src/features/prayer-times/data/services/prayer-times.service.ts');
    const schedule = prayer.getTodayPrayerTimes(new Date(), -6.2088, 106.8456, 'Jakarta (WIB)');
    const localToday = schedule.prayers[0].time.getTime();
    assert.ok(schedule.nextPrayer.time.getTime() - localToday > 20 * 60 * 60 * 1000);
    results.push({ id: 'F11-prayer-before-sunrise', reproduced: true, evidence: { frozen: new Date().toISOString(), returnedNext: schedule.nextPrayer.name, nextInstant: schedule.nextPrayer.time.toISOString(), prayers: schedule.prayers.map(p => ({ name: p.name, time: p.time.toISOString() })), expectedNextObligatoryPrayer: 'Dzuhur today' } });
  } finally { global.Date = RealDate; }
  const sourceInventory = inventory();
  function luminance(hex) { const c = hex.match(/\w\w/g).map(x => parseInt(x, 16)/255).map(v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4); return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722; }
  const contrastPairs = [['inkSubtle on card','#7A867F','#FFFDF8'],['inkSubtle on input','#7A867F','#FFFDF8'],['inkSubtle on cream','#7A867F','#FAF6EC'],['body ink on cream','#1F3B34','#FAF6EC']].map(([name,foreground,background]) => { const a=luminance(foreground), b=luminance(background); return { name,foreground,background,ratio: +((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)).toFixed(2) }; });
  const evidence = { date: '2026-11-21', root, isolation: 'node:sqlite :memory:, React Native Platform web stub; no user DB or source mutation', results, contrastPairs, sourceInventory };
  if (process.argv.includes('--json')) console.log(JSON.stringify(evidence, null, 2));
  else console.log(JSON.stringify({ ...evidence, sourceInventory: { files: sourceInventory.length, screens: sourceInventory.filter(x=>x.kind==='screen').map(x=>x.file), routes: sourceInventory.filter(x=>x.kind==='route').map(x=>x.file), componentFiles: sourceInventory.filter(x=>x.kind==='component').length, formFiles: sourceInventory.filter(x=>x.fields.length).map(x=>({file:x.file,fields:x.fields.length})), inputInstances: sourceInventory.reduce((n,x)=>n+x.fields.length,0) } }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  Module._load = originalLoad;
  if (inheritedTZ === undefined) delete process.env.TZ; else process.env.TZ = inheritedTZ;
});
