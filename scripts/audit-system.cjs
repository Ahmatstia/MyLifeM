/* eslint-disable @typescript-eslint/no-require-imports */
// Audit-only reproduction: runs production repositories against disposable in-memory SQLite.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');
const { drizzle } = require('drizzle-orm/sqlite-proxy');

const root = path.resolve(__dirname, '..');
const sqlite = new DatabaseSync(':memory:');
const client = fs.readFileSync(path.join(root, 'src/db/client.ts'), 'utf8');
const ddl = client.match(/const TABLES_DDL = `([\s\S]*?)`;/);
assert.ok(ddl, 'Production DDL was not found; update this audit harness.');
sqlite.exec(ddl[1]);
const indexes = client.match(/const INDEXES_DDL = `([\s\S]*?)`;/);
assert.ok(indexes, 'Production indexes were not found; update this audit harness.');
sqlite.exec(indexes[1]);
sqlite.exec('PRAGMA foreign_keys = ON;');
const db = drizzle(async (query, params, method) => {
  const statement = sqlite.prepare(query);
  if (method === 'run') {
    statement.run(...params);
    return { rows: [] };
  }
  statement.setReturnArrays(true);
  const rows = statement.all(...params);
  return { rows: method === 'get' ? rows[0] : rows };
});

const cache = new Map();
function load(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const moduleRecord = { exports: {} };
  cache.set(filename, moduleRecord);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier === '@/db/client') return { db };
    if (specifier.startsWith('@/')) return load('src/' + specifier.slice(2) + '.ts');
    if (specifier.startsWith('.')) {
      return load(path.relative(root, path.resolve(path.dirname(filename), specifier + '.ts')));
    }
    return require(specifier);
  };
  new Function('require', 'module', 'exports', source)(localRequire, moduleRecord, moduleRecord.exports);
  return moduleRecord.exports;
}

const observed = [];
function finding(id, message, actual, expected) {
  assert.deepEqual(actual, expected, `Reproduction ${id} changed; re-audit before updating the report.`);
  observed.push({ id, message, observed: actual });
}

async function main() {
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  finding('A01', 'Fresh database has no foreign keys', tables.reduce((count, table) =>
    count + sqlite.prepare(`PRAGMA foreign_key_list(${table.name})`).all().length, 0), 0);
  finding('A04', '00:30 WIB is assigned to yesterday by UTC date slicing',
    new Date('2026-10-26T00:30:00+07:00').toISOString().split('T')[0], '2026-10-25');

  const { targetRepository } = load('src/features/targets/data/repositories/target.repository.impl.ts');
  const { projectRepository } = load('src/features/projects/data/repositories/project.repository.impl.ts');
  const { stageRepository } = load('src/features/stages/data/repositories/stage.repository.impl.ts');
  const { dailyFocusRepository } = load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts');
  const { agendaRepository } = load('src/features/agenda/data/repositories/agenda.repository.impl.ts');
  const { settingsRepository } = load('src/features/settings/data/repositories/settings.repository.impl.ts');
  const target = await targetRepository.createTarget({ title: 'Audit goal', categoryId: 'audit-category' });
  const project = await projectRepository.createProject({ title: 'Audit project', targetId: target.id });
  const stage = await stageRepository.createStage({ name: 'Audit stage', parentType: 'PROJECT', parentId: project.id });
  const task = await stageRepository.createTask({ stageId: stage.id, name: 'Audit task', estimatedHours: 1 });
  await dailyFocusRepository.addFocusItem('2026-10-26', task.id);
  await stageRepository.setTaskStatus(task.id, 'DONE');
  finding('A05', 'Finished project-stage task is absent from its target progress',
    (await targetRepository.getTargetById(target.id)).totalTasks, 0);
  const focus = await dailyFocusRepository.getTodayFocusItems('2026-10-26');
  finding('A06', 'Today checkbox disagrees with the completed task',
    { focus: focus[0].isCompleted, task: focus[0].task.isCompleted }, { focus: false, task: true });
  await dailyFocusRepository.addFocusItem('2026-10-26', 'audit-missing-task');
  finding('A01-orphan', 'Invalid task reference is accepted',
    sqlite.prepare('SELECT count(*) AS n FROM daily_focus_items WHERE task_id = ?').get('audit-missing-task').n, 1);
  const backup = JSON.parse(await settingsRepository.exportBackupJson());
  finding('A02', 'Backup omits categories and stages',
    { categories: Object.hasOwn(backup.data, 'categories'), stages: Object.hasOwn(backup.data, 'stages') },
    { categories: false, stages: false });
  await projectRepository.deleteProject(project.id);
  finding('A01-delete', 'Deleting a project leaves a dangling daily-focus link',
    sqlite.prepare('SELECT count(*) AS n FROM daily_focus_items WHERE task_id = ?').get(task.id).n, 1);
  await agendaRepository.createEvent({ title: 'Audit midnight event',
    startTime: '2026-10-25T23:30:00.000Z', endTime: '2026-10-26T01:30:00.000Z' });
  finding('A09-overlap', 'An ongoing timed event is absent from the next UTC day query',
    (await agendaRepository.getEventsForDate('2026-10-26')).length, 0);
  const empty = await agendaRepository.createEvent({ title: '   ',
    startTime: '2026-10-26T11:00:00', endTime: '2026-10-26T09:00:00' });
  finding('A09-validation', 'Repository accepts blank title and reversed times', empty.title, '');

  console.log(JSON.stringify({ purpose: 'Known-bug reproductions, NOT a healthy-system test suite',
    storage: ':memory: only', tableCount: tables.length, reproduced: observed }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => sqlite.close());
