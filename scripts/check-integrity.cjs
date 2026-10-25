/* eslint-disable @typescript-eslint/no-require-imports */
// Real production migrations and Drizzle Expo repositories; every database is disposable memory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { loader, fixture, connection } = require('./check-backup.cjs');
const legacyDDL = fs.readFileSync(path.join(__dirname, 'fixtures/legacy-v0.sql'), 'utf8');
let checks = 0;
function passed(name) { checks++; console.log('PASS:', name); }
function environment() {
  const sqlite = new DatabaseSync(':memory:');
  let fault = () => {};
  let archive = null;
  let save = async json => { archive = json; };
  const plain = rows => rows.map(row => ({ ...row }));
  const raw = {
    execSync(sql) { fault(sql); sqlite.exec(sql); },
    getAllSync(sql, ...params) { return plain(sqlite.prepare(sql).all(...params.flat())); },
    getFirstSync(sql, ...params) { return raw.getAllSync(sql, ...params)[0] ?? null; },
    runSync(sql, ...params) { fault(sql); return sqlite.prepare(sql).run(...params.flat()); },
    withTransactionSync(work) { sqlite.exec('BEGIN'); try { work(); fault('COMMIT'); sqlite.exec('COMMIT'); } catch (error) { sqlite.exec('ROLLBACK'); throw error; } },
    prepareSync(sql) {
      return {
        executeSync(params) {
          fault(sql); const stmt = sqlite.prepare(sql);
          if (stmt.columns().length) {
            const rows = plain(stmt.all(...params)); return { getAllSync: () => rows, getFirstSync: () => rows[0] };
          }
          const result = stmt.run(...params); return { changes: result.changes, lastInsertRowId: Number(result.lastInsertRowid) };
        },
        executeForRawResultSync(params) {
          fault(sql); const stmt = sqlite.prepare(sql); stmt.setReturnArrays(true);
          return { getAllSync: () => stmt.all(...params) };
        },
      };
    },
  };
  const stubs = { 'expo-sqlite': { openDatabaseSync: name => { if (name === ':memory:') return connection(); assert.equal(name, 'mylife.db'); return raw; } },
    'drizzle-orm/expo-sqlite': require(path.join(__dirname, '../node_modules/drizzle-orm/expo-sqlite/driver.cjs')),
    '@/features/settings/data/services/backup-file.service': { saveMigrationBackup: json => save(json) } };
  const load = loader(stubs);
  const client = load('src/db/client.ts');
  const format = load('src/features/settings/data/backup-format.ts');
  const store = load('src/features/settings/data/backup-store.ts');
  const version = () => raw.getFirstSync('PRAGMA user_version').user_version;
  const state = () => JSON.stringify(raw.getAllSync("SELECT name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name"))
    + JSON.stringify(format.TABLE_SPECS.filter(spec => raw.getFirstSync("SELECT name FROM sqlite_master WHERE name = ?", spec.name)).map(spec => [spec.name, raw.getAllSync(`SELECT * FROM ${spec.name} ORDER BY rowid`)])) + version();
  function seedLegacy(data = fixture(), oldColumns = false) {
    raw.execSync(legacyDDL);
    for (const spec of format.TABLE_SPECS) {
      const columns = spec.columns.filter(column => raw.getAllSync(`PRAGMA table_info(${spec.name})`).some(existing => existing.name === column.name));
      for (const source of data[spec.key]) {
        const row = { ...source };
        if (spec.key === 'tasks' && row.projectId) row.targetId = data.projects.find(project => project.id === row.projectId)?.targetId ?? null;
        raw.runSync(`INSERT INTO ${spec.name} (${columns.map(column => column.name)}) VALUES (${columns.map(() => '?')})`, columns.map(column => row[column.key]));
      }
    }
    if (oldColumns) {
      for (const column of ['stage_id', 'name', 'estimated_hours', 'sort_order']) raw.execSync('ALTER TABLE tasks DROP COLUMN ' + column);
      raw.execSync('ALTER TABLE targets DROP COLUMN category_id');
    }
  }
  return { sqlite, raw, load, client, format, store, version, state, seedLegacy, archive: () => archive,
    fault: callback => { fault = callback; }, save: callback => { save = callback; },
    retry: () => loader(stubs)('src/db/client.ts').initDatabase(), close: () => sqlite.close() };
}
async function migrations() {
  let env = environment();
  await Promise.all([env.client.initDatabase(), env.client.initDatabase()]);
  assert.equal(env.version(), 1);
  assert.equal(env.raw.getAllSync('PRAGMA foreign_key_list(tasks)').length, 4);
  assert.equal(env.raw.getAllSync('PRAGMA foreign_key_list(stages)').length, 2);
  const fresh = env.state(); await env.retry(); assert.equal(env.state(), fresh);
  passed('fresh schema has actual FKs, one initialization, version 1 and repeatable startup'); env.close();
  env = environment(); env.seedLegacy(); const before = env.state();
  await env.client.initDatabase();
  assert.ok(env.archive().includes('mylife-migration-snapshot'));
  assert.equal(JSON.parse(env.archive()).version, 0);
  assert.equal(env.raw.getFirstSync('SELECT target_id FROM tasks').target_id, null);
  assert.equal(env.raw.getFirstSync('SELECT project_id FROM stages').project_id, 'projects');
  assert.equal(env.raw.getFirstSync('SELECT task_title FROM focus_sessions').task_title, fixture().tasks[0].title);
  const expected = fixture(); expected.focusSessions[0].taskTitle = expected.tasks[0].title;
  assert.deepEqual(env.store.readBackupData(env.raw), expected);
  assert.deepEqual(env.raw.getAllSync('PRAGMA foreign_key_check'), []);
  assert.equal(env.version(), 1);
  for (const spec of env.format.TABLE_SPECS) assert.equal(env.raw.getFirstSync(`SELECT count(*) AS n FROM ${spec.name}`).n, 1);
  const upgraded = env.state(); await env.retry(); assert.equal(env.state(), upgraded);
  assert.notEqual(before, upgraded);
  passed('v0 full dataset upgrades losslessly; redundant ownership resolves through project, stage FKs and session label survive'); env.close();
  env = environment(); env.seedLegacy(); await env.client.initDatabase();
  const settings = env.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
  const archived = JSON.parse(env.archive());
  archived.tables[0].sql = 'DROP TABLE tasks'; archived.objects = [{ sql: 'DROP TABLE targets' }];
  const archiveJson = JSON.stringify(archived);
  await settings.restoreBackupJson(archiveJson, await settings.exportBackupJson());
  assert.deepEqual(env.store.readBackupData(env.raw), env.format.parseBackup(archiveJson).data);
  assert.equal(env.version(), 1); assert.deepEqual(env.raw.getAllSync('PRAGMA foreign_key_check'), []);
  passed('pre-migration archive restores through the current repository without executing any archived SQL'); env.close();
  env = environment(); env.seedLegacy(fixture(), true); await env.client.initDatabase();
  assert.equal(env.raw.getFirstSync('SELECT category_id FROM targets').category_id, null);
  assert.equal(env.raw.getFirstSync('SELECT name FROM tasks').name, null);
  assert.equal(env.version(), 1); passed('older columns upgrade with explicit defaults without inventing a career category'); env.close();
  for (const problem of ['orphan', 'conflict', 'unknown', 'object', 'storage', 'copy', 'index', 'version', 'commit', 'changed', 'future']) {
    env = environment(); env.seedLegacy();
    if (problem === 'orphan') env.raw.execSync("UPDATE tasks SET stage_id = 'missing'");
    if (problem === 'conflict') env.raw.execSync("UPDATE tasks SET target_id = 'missing'");
    if (problem === 'future') env.raw.execSync('PRAGMA user_version = 99');
    if (problem === 'unknown') env.raw.execSync('ALTER TABLE tasks ADD COLUMN unrecognized_data TEXT');
    if (problem === 'object') env.raw.execSync('CREATE TRIGGER custom_rule BEFORE DELETE ON tasks BEGIN SELECT 1; END;');
    if (problem === 'storage') env.save(async () => { throw new Error('Storage full'); });
    if (problem === 'changed') env.save(async () => { env.raw.execSync("UPDATE categories SET name = 'Newer edit'"); });
    let once = true, advancing = false;
    env.fault(sql => {
      if (sql.startsWith('PRAGMA user_version =')) advancing = true;
      if (once && ((problem === 'copy' && sql.startsWith('INSERT INTO "tasks"')) || (problem === 'index' && sql.includes('CREATE UNIQUE INDEX')) || (problem === 'version' && advancing) || (problem === 'commit' && advancing && sql === 'COMMIT'))) {
        once = false; throw new Error('Injected migration failure');
      }
    });
    const original = env.state(); await assert.rejects(env.client.initDatabase());
    if (problem === 'changed') assert.equal(env.raw.getFirstSync('SELECT name FROM categories').name, 'Newer edit');
    else assert.equal(env.state(), original, problem);
    assert.equal(env.raw.getFirstSync('PRAGMA foreign_keys').foreign_keys, 1);
    if (problem !== 'future') assert.equal(env.version(), 0);
    if (['copy', 'index', 'version', 'commit'].includes(problem)) { env.fault(() => {}); await env.client.initDatabase(); assert.equal(env.version(), 1); }
    passed(problem + ' prevents partial migration and schema-version advancement; FK restored'); env.close();
  }
  env = environment(); env.seedLegacy(); let failEnable = true;
  env.fault(sql => { if (failEnable && sql === 'PRAGMA foreign_keys = ON;' && env.version() === 1) { failEnable = false; throw new Error('Cannot enable FK'); } });
  await assert.rejects(env.client.initDatabase(), /Cannot enable FK/);
  assert.equal(env.version(), 1);
  await env.client.initDatabase(); assert.equal(env.raw.getFirstSync('PRAGMA foreign_keys').foreign_keys, 1);
  passed('post-commit FK activation failure blocks startup and retry re-enables protection'); env.close();
}
async function repositories() {
  const env = environment(); await env.client.initDatabase();
  const { stageRepository: stage } = env.load('src/features/stages/data/repositories/stage.repository.impl.ts');
  const { projectRepository: project } = env.load('src/features/projects/data/repositories/project.repository.impl.ts');
  const { targetRepository: target } = env.load('src/features/targets/data/repositories/target.repository.impl.ts');
  const { dailyFocusRepository: focus } = env.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts');
  const { settingsRepository: settings } = env.load('src/features/settings/data/repositories/settings.repository.impl.ts');
  const data = fixture();
  const reset = () => env.raw.withTransactionSync(() => env.store.replaceBackupData(env.raw, data));
  reset();
  assert.throws(() => env.raw.execSync("DELETE FROM categories WHERE id = 'categories'"), /FOREIGN KEY/);
  await assert.rejects(stage.createStage({ parentType: 'PROJECT', parentId: 'missing', name: 'bad' }));
  await assert.rejects(focus.addFocusItem('2026-10-27', 'missing'));
  assert.throws(() => env.raw.execSync("UPDATE tasks SET target_id = 'targets'"));
  assert.throws(() => env.raw.execSync("UPDATE tasks SET project_id = NULL"));
  assert.throws(() => env.raw.execSync("UPDATE stages SET parent_type = 'TARGET', parent_id = 'targets', target_id = 'targets', project_id = NULL"));
  passed('actual SQL and repository writes reject orphan references and ownership conflicts');
  for (const deletion of ['task', 'stage', 'project', 'target']) {
    reset();
    if (deletion === 'task') await stage.deleteTask('tasks');
    if (deletion === 'stage') await stage.deleteStage('stages');
    if (deletion === 'project') await project.deleteProject('projects');
    if (deletion === 'target') {
      const direct = await stage.createStage({ parentType: 'TARGET', parentId: 'targets', name: 'direct' });
      await stage.createTask({ stageId: direct.id, name: 'direct task', estimatedHours: 1 });
      await target.deleteTarget('targets');
    }
    const keepsTask = deletion === 'target';
    assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM tasks').n, keepsTask ? 1 : 0);
    assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items').n, keepsTask ? 1 : 0);
    const session = env.raw.getFirstSync('SELECT * FROM focus_sessions');
    assert.equal(session.task_id, keepsTask ? 'tasks' : null);
    if (!keepsTask) assert.equal(session.task_title, data.tasks[0].title);
    assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM agenda_events').n, 1);
    assert.equal(env.raw.getFirstSync('SELECT task_id FROM agenda_events').task_id, keepsTask ? 'tasks' : null);
    assert.deepEqual(env.raw.getAllSync('PRAGMA foreign_key_check'), []);
    if (keepsTask) assert.equal(env.raw.getFirstSync('SELECT target_id FROM projects').target_id, null);
    passed(deletion + ' deletion applies cascade/set-null policy and preserves focus/agenda history');
  }
  reset();
  env.raw.execSync("CREATE TRIGGER fail_delete BEFORE DELETE ON tasks BEGIN SELECT RAISE(ABORT, 'disk failure'); END;");
  let original = env.state(); await assert.rejects(project.deleteProject('projects')); assert.equal(env.state(), original);
  env.raw.execSync('DROP TRIGGER fail_delete'); passed('failed cascading delete leaves aggregate and every dependent unchanged');
  reset();
  for (let i = 0; i < 4; i++) await focus.createQuickTask('extra ' + i, '2026-10-26');
  original = env.state(); await assert.rejects(focus.createQuickTask('sixth', '2026-10-26'), /Maksimal/); assert.equal(env.state(), original);
  passed('sixth priority rolls back its quick task, leaving no hidden orphan');
  reset();
  const otherStage = await stage.createStage({ parentType: 'PROJECT', parentId: 'projects', name: 'second' });
  original = env.state(); let swaps = 0;
  env.fault(sql => { if (sql.startsWith('update "stages"') && ++swaps === 2) throw new Error('swap failure'); });
  await assert.rejects(stage.reorderStage(otherStage.id, 'UP')); env.fault(() => {}); assert.equal(env.state(), original);
  passed('second reorder write fails without leaving half a swap');
  reset(); original = env.state(); let settingsWrites = 0;
  env.fault(sql => { if (sql.startsWith('insert into "user_settings"') && ++settingsWrites === 2) throw new Error('settings failure'); });
  await assert.rejects(settings.saveSettings({ pomodoroMinutes: 30, deepFlowMinutes: 60 }));
  env.fault(() => {}); assert.equal(env.state(), original); passed('second preference write fails without saving half the settings');
  reset(); original = env.state();
  env.fault(sql => { if (sql.startsWith('update "daily_focus_items"')) throw new Error('checkbox failure'); });
  await assert.rejects(focus.toggleTaskCompletion('tasks', true));
  env.fault(() => {}); assert.equal(env.state(), original); passed('checkbox failure rolls back both task and daily-priority update');
  reset(); original = env.state();
  env.fault(sql => { if (sql.startsWith('update "tasks"')) throw new Error('minutes failure'); });
  await assert.rejects(focus.saveFocusSession({ taskId: 'tasks', mode: 'POMODORO', startedAt: '2026-10-26T03:00:00Z', endedAt: '2026-10-26T04:00:00Z', durationMinutes: 30 }));
  env.fault(() => {}); assert.equal(env.state(), original); passed('failed task-minutes write rolls back the new focus session');
  const saved = await focus.saveFocusSession({ taskId: 'tasks', mode: 'POMODORO', startedAt: '2026-10-26T03:00:00Z', endedAt: '2026-10-26T04:00:00Z', durationMinutes: 30 });
  assert.equal(env.raw.getFirstSync('SELECT actual_minutes FROM tasks').actual_minutes, 30);
  env.raw.execSync("UPDATE tasks SET title = 'Renamed'"); await stage.deleteTask('tasks');
  assert.equal(env.raw.getFirstSync('SELECT task_title FROM focus_sessions WHERE id = ?', saved.id).task_title, data.tasks[0].title);
  passed('session saves its original task label and survives rename/deletion');
  reset(); await project.createProjectTask('projects', 'direct project task');
  assert.equal(env.raw.getFirstSync("SELECT target_id FROM tasks WHERE title = 'direct project task'").target_id, null);
  assert.equal((await target.getTargetById('targets')).totalTasks, 2);
  passed('project tasks keep one owner and continue contributing to target progress');
  env.close();
}
async function main() { await migrations(); await repositories(); console.log(`PASS: ${checks} integrity/migration checks; no user database accessed.`); }
module.exports = { environment };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
