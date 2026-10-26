/* global __dirname */
// Production backup code, disposable SQLite only. Never opens mylife.db on disk.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let checks = 0;
function check(name, action) { action(); checks++; console.log('PASS:', name); }
function connection() {
  const sqlite = new DatabaseSync(':memory:');
  return {
    execSync: sql => sqlite.exec(sql),
    getAllSync: (sql, ...params) => sqlite.prepare(sql).all(...params.flat()).map(row => ({ ...row })),
    getFirstSync: (sql, ...params) => sqlite.prepare(sql).get(...params.flat()) ?? null,
    runSync: (sql, ...params) => sqlite.prepare(sql).run(...params.flat()),
    closeSync: () => sqlite.close(),
    withTransactionSync(work) {
      sqlite.exec('BEGIN');
      try { work(); sqlite.exec('COMMIT'); } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
}
function loader(stubs = {}) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const record = { exports: {} };
    cache.set(filename, record);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    function resolve(id) {
      if (Object.hasOwn(stubs, id)) return stubs[id];
      if (id.startsWith('@/') || id.startsWith('.')) {
        const target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(filename), id);
        return load(target + '.ts');
      }
      return require(id);
    }
    new Function('require', 'module', 'exports', source)(resolve, record, record.exports);
    return record.exports;
  }
  return load;
}
const active = connection();
const isolated = [];
const nativeSQLite = { openDatabaseSync(name) {
  if (name !== ':memory:') { assert.equal(name, 'mylife.db'); return active; }
  const staged = connection(); isolated.push(staged); return staged;
} };
const stubs = { 'expo-sqlite': nativeSQLite, 'drizzle-orm/expo-sqlite': { drizzle: () => ({}) }, '@/features/settings/data/services/backup-file.service': { saveMigrationBackup: async () => {} } };
const load = loader(stubs);
const client = load('src/db/client.ts');
const format = load('src/features/settings/data/backup-format.ts');
const store = load('src/features/settings/data/backup-store.ts');
const { settingsRepository: repository } = load('src/features/settings/data/repositories/settings.repository.impl.ts');
const now = '2026-10-26T03:00:00.000Z';
function fixture() {
  const data = Object.fromEntries(format.TABLE_SPECS.map(spec => [spec.key, [Object.fromEntries(spec.columns.map(column => [column.key,
    column.key === spec.primaryKey ? spec.key : !column.notNull ? null : column.type === 'number' ? 0
      : /(?:At|Date|Time)$/.test(column.key) ? now : column.key === 'date' ? '2026-10-26' : 'Custom ' + column.key,
  ]))]]));
  Object.assign(data.targets[0], { categoryId: 'categories', pillarId: 'lifePillars', type: 'MILESTONE_BASED', status: 'ACTIVE', priority: 'HIGH', targetValue: 100 });
  Object.assign(data.projects[0], { targetId: 'targets', status: 'ACTIVE', priority: 'HIGH' });
  Object.assign(data.stages[0], { parentType: 'PROJECT', parentId: 'projects', projectId: 'projects', targetId: null });
  Object.assign(data.milestones[0], { projectId: 'projects' });
  Object.assign(data.tasks[0], { stageId: 'stages', projectId: 'projects', targetId: null, milestoneId: 'milestones', title: "Baca 'SQL'; DROP TABLE tasks; -- 🧠", name: null, status: 'DONE', priority: 'HIGH' });
  Object.assign(data.dailyFocusItems[0], { taskId: 'tasks' });
  Object.assign(data.focusSessions[0], { taskId: 'tasks', mode: 'POMODORO', durationMinutes: 25, rating: 4, endedAt: '2026-10-26T04:00:00.000Z' });
  Object.assign(data.agendaEvents[0], { taskId: 'tasks', projectId: 'projects', targetId: 'targets', startTime: '2099-10-26T03:00:00.000Z', endTime: '2099-10-26T04:00:00.000Z', eventType: 'LEARNING', reminderMinutes: 0 });
  Object.assign(data.userSettings[0], { key: 'pomodoro_minutes', value: '45' });
  return data;
}
async function main() {
  await client.initDatabase();
  const source = fixture();
  active.withTransactionSync(() => store.replaceBackupData(active, source));
  const json = await repository.exportBackupJson();
  const legacy = JSON.parse(json);
  legacy.schemaVersion = 1;
  for (const row of legacy.data.stages) { delete row.targetId; delete row.projectId; }
  for (const row of legacy.data.focusSessions) delete row.taskTitle;
  legacy.data.tasks[0].targetId = 'targets';
  check('previous complete v1 backups upgrade to one owner, stage FKs and session labels', () => {
    const upgraded = format.parseBackup(JSON.stringify(legacy));
    assert.equal(upgraded.schemaVersion, 2);
    assert.equal(upgraded.data.tasks[0].targetId, null);
    assert.equal(upgraded.data.stages[0].projectId, 'projects');
    assert.equal(upgraded.data.focusSessions[0].taskTitle, source.tasks[0].title);
  });
  check('all 11 tables round trip, including custom labels, nulls, legacy status and quoted SQL text', () => {
    assert.deepEqual(format.parseBackup(json).data, JSON.parse(JSON.stringify(source)));
    assert.equal(Object.keys(format.parseBackup(json).data).length, 11);
  });
  const invalid = (name, mutate) => check('reject ' + name, () => {
    const input = JSON.parse(json); mutate(input);
    assert.throws(() => format.parseBackup(JSON.stringify(input)), /Cadangan tidak valid|10 MB/);
  });
  invalid('unknown version', input => { input.formatVersion = 2; });
  invalid('old incomplete snapshot', input => { delete input.data.categories; delete input.data.stages; });
  invalid('extra tables', input => { input.data.sql = []; });
  invalid('extra columns', input => { input.data.tasks[0].sql = 'DROP TABLE tasks'; });
  invalid('missing columns', input => { delete input.data.tasks[0].name; });
  invalid('duplicate IDs', input => { input.data.tasks.push(input.data.tasks[0]); });
  invalid('empty ID', input => { input.data.tasks[0].id = ''; });
  invalid('orphan references', input => { input.data.tasks[0].stageId = 'missing'; });
  invalid('wrong stage owner', input => { input.data.stages[0].parentType = 'TARGET'; input.data.stages[0].parentId = 'targets'; input.data.tasks[0].targetId = null; });
  invalid('two task owners', input => { input.data.tasks[0].targetId = 'targets'; });
  invalid('invalid type', input => { input.data.tasks[0].actualMinutes = '10'; });
  invalid('invalid boolean', input => { input.data.tasks[0].isCompleted = 2; });
  invalid('invalid date', input => { input.data.tasks[0].createdAt = '2026-02-30T00:00:00Z'; });
  invalid('invalid date-only', input => { input.data.dailyFocusItems[0].date = now; });
  invalid('duplicate daily priority', input => { input.data.dailyFocusItems.push({ ...input.data.dailyFocusItems[0], id: 'duplicate' }); });
  invalid('negative duration', input => { input.data.tasks[0].estimatedMinutes = -1; });
  invalid('unknown status', input => { input.data.tasks[0].status = 'MAGIC'; });
  invalid('rating outside range', input => { input.data.focusSessions[0].rating = 6; });
  invalid('reversed session', input => { input.data.focusSessions[0].endedAt = '2025-10-26T03:00:00Z'; });
  invalid('session without a clock', input => { input.data.focusSessions[0].startedAt = '2026-10-26'; });
  invalid('timed agenda without a clock', input => { input.data.agendaEvents[0].startTime = '2099-10-26'; });
  invalid('reversed agenda', input => { input.data.agendaEvents[0].endTime = input.data.agendaEvents[0].startTime; });
  invalid('empty label', input => { input.data.tasks[0].title = ' '; });
  invalid('invalid preferences', input => { input.data.userSettings[0].value = '0'; });
  invalid('duplicate category names', input => { input.data.categories.push({ ...input.data.categories[0], id: 'duplicate', name: input.data.categories[0].name.toUpperCase() }); });
  check('invalid JSON and BOM, byte and row limits', () => {
    assert.throws(() => format.parseBackup('{'), /JSON/);
    assert.deepEqual(format.parseBackup('\uFEFF' + json).data, source);
    assert.throws(() => format.parseBackup(' '.repeat(format.MAX_BACKUP_BYTES + 1)), /10 MB/);
    assert.throws(() => format.serializeBackup({ ...source, tasks: Array(format.MAX_BACKUP_ROWS + 1).fill(source.tasks[0]) }), /50.000/);
    assert.throws(() => format.checkBackupSize(0));
  });
  let safety = await repository.exportBackupJson();
  active.runSync('UPDATE tasks SET title = ? WHERE id = ?', ['Original data', 'tasks']);
  safety = await repository.exportBackupJson();
  await repository.restoreBackupJson(json, safety);
  check('repository restores every table through staging and active transaction', () => assert.deepEqual(store.readBackupData(active), source));
  let before = store.readBackupData(active);
  const stageCount = isolated.length;
  await assert.rejects(repository.restoreBackupJson('{}', safety));
  check('invalid input never opens staging or changes active data', () => {
    assert.equal(isolated.length, stageCount); assert.deepEqual(store.readBackupData(active), before);
  });
  safety = await repository.exportBackupJson();
  active.runSync('UPDATE tasks SET title = ? WHERE id = ?', ['Newer edit while saving safety copy', 'tasks']);
  before = store.readBackupData(active);
  await assert.rejects(repository.restoreBackupJson(json, safety), /Data berubah/);
  check('concurrent edits survive without replacement', () => assert.deepEqual(store.readBackupData(active), before));
  safety = await repository.exportBackupJson();
  const run = active.runSync;
  active.runSync = (sql, ...params) => { if (sql.startsWith('INSERT INTO "tasks"')) throw new Error('disk full'); return run(sql, ...params); };
  await assert.rejects(repository.restoreBackupJson(json, safety), /disk full/);
  active.runSync = run;
  check('failure after deletes and partial inserts rolls everything back', () => assert.deepEqual(store.readBackupData(active), before));
  const first = active.getFirstSync;
  active.getFirstSync = (sql, ...params) => sql === 'PRAGMA integrity_check' ? { integrity_check: 'corrupt' } : first(sql, ...params);
  await assert.rejects(repository.restoreBackupJson(json, safety), /Integritas/);
  active.getFirstSync = first;
  check('integrity failure rolls back replacement', () => assert.deepEqual(store.readBackupData(active), before));
  await loader(stubs)('src/db/client.ts').initDatabase();
  check('restart does not resurrect defaults or overwrite restored nulls/colors', () => assert.deepEqual(store.readBackupData(active), before));
  const empty = Object.fromEntries(format.TABLE_SPECS.map(spec => [spec.key, []]));
  active.withTransactionSync(() => store.replaceBackupData(active, empty));
  await loader(stubs)('src/db/client.ts').initDatabase();
  check('an intentionally empty restored database stays empty', () => assert.deepEqual(store.readBackupData(active), empty));
  // An incomplete current-version schema must fail closed instead of guessing repairs.
  active.execSync('DROP TABLE stages;');
  const retry = loader(stubs)('src/db/client.ts');
  await assert.rejects(retry.initDatabase(), /stages/);
  check('failed startup rolls back newly created tables', () => assert.equal(active.getFirstSync("SELECT name FROM sqlite_master WHERE name = 'stages'"), null));
  active.execSync(client.TABLES_DDL);
  active.execSync(load('src/db/integrity.ts').INTEGRITY_DDL);
  await retry.initDatabase();
  check('startup can retry after a migration failure', () => assert.ok(active.getFirstSync("SELECT name FROM sqlite_master WHERE name = 'stages'")));
  await fileChecks(json);
  await notificationChecks(source.agendaEvents);
  await hookChecks(json);
  active.closeSync();
  console.log(`PASS: ${checks} backup checks. No user database accessed. Native dialogs are not covered.`);
}
async function fileChecks(json) {
  const files = new Map(); let partial = false; let selected = { canceled: true, result: null }; let reads = 0;
  class File {
    constructor(...parts) { this.uri = parts.join('/'); }
    get size() { return new Blob([files.get(this.uri) || '']).size; }
    get exists() { return files.has(this.uri); }
    create() { files.set(this.uri, ''); }
    async write(value) { files.set(this.uri, partial ? value.slice(0, 2) : value); }
    async text() { reads++; return files.get(this.uri); }
    static async pickFileAsync() { return selected; }
  }
  const service = loader({ 'expo-file-system': { File, Paths: { document: 'internal' } }, 'expo-sharing': { isAvailableAsync: async () => true, shareAsync: async () => {} } })('src/features/settings/data/services/backup-file.service.ts');
  assert.equal(await service.pickBackupFile(), null);
  await service.saveRecoveryBackup(json);
  assert.equal(await service.readRecoveryBackup(), json);
  checks++; console.log('PASS: canceled picker and verified recovery file');
  partial = true;
  await assert.rejects(service.saveRecoveryBackup(json), /tidak tersimpan utuh/);
  selected = { canceled: false, result: { size: format.MAX_BACKUP_BYTES + 1, text: async () => { reads++; return ''; } } };
  const previousReads = reads;
  await assert.rejects(service.pickBackupFile(), /10 MB/);
  assert.equal(reads, previousReads);
  checks++; console.log('PASS: partial safety writes rejected and oversized files never read');
  const previousStorage = globalThis.localStorage;
  try {
    let saved;
    globalThis.localStorage = { setItem: (_key, value) => { saved = value; }, getItem: () => saved };
    const web = loader()('src/features/settings/data/services/backup-file.service.web.ts');
    await web.saveRecoveryBackup(json);
    assert.equal(await web.readRecoveryBackup(), json);
    globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    await assert.rejects(web.saveRecoveryBackup(json), /Tidak ada data diganti/);
    assert.equal(await web.readRecoveryBackup(), json);
    checks++; console.log('PASS: web recovery verifies persistence and quota failure preserves the earlier safety copy');
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
  }
}
async function notificationChecks(events) {
  const canceled = [], scheduled = [];
  const notifications = {
    setNotificationHandler: () => {},
    setNotificationChannelAsync: async () => {},
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
    getAllScheduledNotificationsAsync: async () => [{ identifier: 'agenda-old' }, { identifier: 'unrelated' }],
    cancelScheduledNotificationAsync: async id => canceled.push(id),
    getPermissionsAsync: async () => ({ status: 'granted' }),
    getExactAlarmPermissionsAsync: async () => ({ granted: true }),
    scheduleNotificationAsync: async input => { scheduled.push(input); return input.identifier; },
  };
  const { AgendaNotificationService: service } = loader({ 'react-native': { Platform: { OS: 'android' } }, expo: { isRunningInExpoGo: () => false }, 'expo-notifications': notifications })('src/features/agenda/data/services/agenda-notification.service.ts');
  assert.equal(await service.reconcileAfterRestore(events), true);
  assert.deepEqual(canceled, ['agenda-old']);
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].trigger.date.getTime(), Date.parse(events[0].startTime));
  assert.equal(await service.scheduleReminder('past', '', '2020-01-01T00:00:00Z', 0), null);
  checks++; console.log('PASS: old agenda reminders canceled, unrelated reminders retained, zero-minute restored reminder scheduled');
}
async function hookChecks(json) {
  const values = []; let index = 0; const calls = []; let failSafety = true; let failRestore = false;
  let releaseExport;
  const React = {
    useState(initial) { const i = index++; if (!(i in values)) values[i] = initial; return [values[i], value => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; },
    useRef(initial) { const i = index++; return values[i] ??= { current: initial }; },
    useEffect() {}, useCallback: work => work,
  };
  const files = {
    pickBackupFile: async () => json,
    saveBackupFile: async () => { calls.push('export file'); await new Promise(resolve => { releaseExport = resolve; }); },
    readRecoveryBackup: async () => null,
    saveRecoveryBackup: async () => { calls.push('save safety'); if (failSafety) throw new Error('Storage full'); },
  };
  const { useSettings } = loader({
    react: React,
    'react-native': { Platform: { OS: 'android' }, Alert: { alert: (...args) => calls.push(args.join(': ')) } },
    'expo-router': { router: { replace: () => calls.push('navigate') } },
    '@/db/data-revision': { notifyDataRestored: () => calls.push('remount') },
    '@/features/agenda/data/services/agenda-notification.service': { AgendaNotificationService: { reconcileAfterRestore: async () => { calls.push('reminders'); throw new Error('Permission unavailable'); } } },
    '../../data/services/backup-file.service': files,
    '../../data/repositories/settings.repository.impl': { settingsRepository: {
      exportBackupJson: async () => { calls.push('snapshot'); return json; },
      restoreBackupJson: async () => { calls.push('commit'); if (failRestore) throw new Error('disk full'); },
    } },
  })('src/features/settings/presentation/hooks/use-settings.ts');
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Drives the hook with an isolated React state mock.
  const render = () => { index = 0; return useSettings(); };
  await render().inspectBackup();
  await render().restoreBackup();
  assert.deepEqual(calls, ['snapshot', 'save safety']);
  assert.match(render().backupError, /Storage full/);
  assert.ok(render().pendingBackup);
  checks++; console.log('PASS: safety-file failure stops before any active restore and keeps the confirmation');
  failSafety = false; failRestore = true; calls.length = 0;
  await render().restoreBackup();
  assert.deepEqual(calls, ['snapshot', 'save safety', 'commit']);
  assert.match(render().backupError, /disk full/);
  checks++; console.log('PASS: failed restore never remounts or reschedules reminders');
  failRestore = false; calls.length = 0;
  await render().restoreBackup();
  assert.deepEqual(calls.slice(0, 6), ['snapshot', 'save safety', 'commit', 'navigate', 'remount', 'reminders']);
  assert.equal(render().backupError, null);
  assert.ok(calls[6].includes('Data berhasil dipulihkan') && calls[6].includes('Pengingat belum'));
  checks++; console.log('PASS: successful commit resets stale screens before reminders, reminder failure is reported as a warning');
  calls.length = 0;
  const exporting = render().exportBackup();
  await Promise.resolve();
  await render().exportBackup();
  releaseExport(); await exporting;
  assert.deepEqual(calls, ['snapshot', 'export file']);
  checks++; console.log('PASS: rapid duplicate backup actions are locked');
}
module.exports = { loader, connection, fixture };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
