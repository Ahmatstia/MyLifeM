// Production repositories and hooks; SQLite memory and controlled React/native boundaries.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { harness, tick } = require('./check-progress.cjs');
let checks = 0, failures = 0;
async function check(name, work) {
  try { await work(); checks++; console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error); }
}
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
const weeklyInput = { title: 'Weekly batch', startTime: '08:00', endTime: '09:00', scheduleType: 'ROUTINE' };
async function weeklyCase(work) {
  const e = environment();
  try { await e.client.initDatabase(); await work(e, e.load('src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts').weeklyScheduleRepository); }
  finally { e.close(); }
}
function settingsHook(repo, publications = []) {
  const h = harness({
    'react-native': { Alert: {}, Platform: { OS: 'android' } },
    '@/db/data-revision': { notifyDataRestored() {} },
    '@/features/agenda/data/services/agenda-notification.service': {},
    '../../data/repositories/settings.repository.impl': { settingsRepository: repo },
    '../../data/services/backup-file.service': { readRecoveryBackup: async () => null },
    '@/features/prayer-times/data/prayer-location-store': { setPrayerLocation: value => publications.push(value) },
  });
  const hook = h.load('src/features/settings/presentation/hooks/use-settings.ts').useSettings;
  const defaults = h.load('src/features/settings/domain/entities/settings.entity.ts').DEFAULT_SETTINGS;
  return { h, render: () => h.render(hook), defaults };
}
async function main() {
  await check('a failed second day rolls back the entire weekly selection; retry creates exactly two rows', () => weeklyCase(async (e, repo) => {
    const h = harness({ '../../data/repositories/weekly-schedule.repository.impl': { weeklyScheduleRepository: repo } });
    try {
      const hook = h.load('src/features/agenda/presentation/hooks/use-weekly-schedules.ts').useWeeklySchedules;
      h.render(hook); await tick();
      e.raw.execSync("CREATE TEMP TRIGGER fail_second_day BEFORE INSERT ON weekly_schedules WHEN NEW.day_of_week = 2 BEGIN SELECT RAISE(ABORT, 'Injected second day failure'); END;");
      const before = e.state(); assert.equal(await h.render(hook).addSchedulesForDays([1, 2], weeklyInput), false);
      assert.equal(e.state(), before); assert.ok(h.render(hook).error);
      e.raw.execSync('DROP TRIGGER fail_second_day;');
      assert.equal(await h.render(hook).addSchedulesForDays([1, 2], weeklyInput), true);
      assert.deepEqual((await repo.getAllWeeklySchedules()).map(row => row.dayOfWeek), [1, 2]);
    } finally { h.close(); }
  }));
  for (const days of [[], [1, 1], [0, 2], [8], [1.5], [1, '2']]) {
    await check('invalid weekly selection rejects without writes: ' + JSON.stringify(days), () => weeklyCase(async (e, repo) => {
      const before = e.state(); await assert.rejects(repo.createWeeklySchedulesForDays(days, weeklyInput)); assert.equal(e.state(), before);
    }));
  }
  for (const reminderMinutes of [null, 0]) {
    await check('all seven days retain explicit reminder ' + reminderMinutes, () => weeklyCase(async (e, repo) => {
      const rows = await repo.createWeeklySchedulesForDays([1, 2, 3, 4, 5, 6, 7], { ...weeklyInput, reminderMinutes });
      assert.equal(rows.length, 7); assert.equal(new Set(rows.map(row => row.id)).size, 7);
      assert.ok((await repo.getAllWeeklySchedules()).every(row => row.reminderMinutes === reminderMinutes));
    }));
  }
  await check('failure on any of seven selected days leaves no partial weekly rows', () => weeklyCase(async (e, repo) => {
    const days = [1, 2, 3, 4, 5, 6, 7];
    for (const day of days) {
      e.raw.execSync(`CREATE TEMP TRIGGER fail_day BEFORE INSERT ON weekly_schedules WHEN NEW.day_of_week = ${day} BEGIN SELECT RAISE(ABORT, 'Injected day failure'); END;`);
      const before = e.state(); await assert.rejects(repo.createWeeklySchedulesForDays(days, weeklyInput)); assert.equal(e.state(), before);
      e.raw.execSync('DROP TRIGGER fail_day;');
    }
    assert.equal((await repo.createWeeklySchedulesForDays(days, weeklyInput)).length, 7);
  }));
  await check('weekly batch also rolls back if commit fails', () => weeklyCase(async (e, repo) => {
    const before = e.state();
    e.fault(sql => { if (/^commit/i.test(sql)) throw new Error('Injected weekly commit failure'); });
    await assert.rejects(repo.createWeeklySchedulesForDays([1, 2], weeklyInput));
    e.fault(() => {}); assert.equal(e.state(), before);
  }));
  await check('single-day create remains compatible and a committed batch is successful even if reload fails', () => weeklyCase(async (e, repo) => {
    const row = await repo.createWeeklySchedule({ ...weeklyInput, dayOfWeek: 3 }); assert.equal(row.dayOfWeek, 3);
    const h = harness({ '../../data/repositories/weekly-schedule.repository.impl': { weeklyScheduleRepository: {
      createWeeklySchedulesForDays: (...args) => repo.createWeeklySchedulesForDays(...args),
      getAllWeeklySchedules: async () => { throw new Error('Injected refresh failure'); },
    } } });
    try {
      const hook = h.load('src/features/agenda/presentation/hooks/use-weekly-schedules.ts').useWeeklySchedules;
      h.render(hook); await tick(); assert.equal(await h.render(hook).addSchedulesForDays([4, 5], weeklyInput), true);
      assert.equal((await repo.getAllWeeklySchedules()).length, 3); assert.match(h.render(hook).error, /refresh/);
    } finally { h.close(); }
  }));
  for (const failure of ['second write', 'read after write', 'commit']) {
    await check('settings rollback and prayer location remain unchanged on ' + failure, async () => {
      const publications = [], e = environment({ '@/features/prayer-times/data/prayer-location-store': { setPrayerLocation: value => publications.push(value) } });
      try {
        await e.client.initDatabase(); const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
        await repo.saveSettings({ prayerCity: 'Before', prayerLatitude: -6, prayerLongitude: 106 });
        const before = e.state(), published = publications.length; let writes = 0;
        e.fault(sql => {
          if (/^insert into "user_settings"/i.test(sql)) { writes++; if (failure === 'second write' && writes === 2) throw new Error('Injected second write'); }
          if (failure === 'read after write' && writes && /^select .* from "user_settings"/i.test(sql)) throw new Error('Injected read after write');
          if (failure === 'commit' && /^commit/i.test(sql)) throw new Error('Injected commit');
        });
        await assert.rejects(repo.saveSettings({ prayerCity: 'After', prayerLatitude: -8, prayerLongitude: 110 }));
        e.fault(() => {}); assert.equal(e.state(), before); assert.equal(publications.length, published);
      } finally { e.close(); }
    });
  }
  await check('settings read errors propagate instead of returning defaults as success', async () => {
    const e = environment();
    try {
      await e.client.initDatabase(); const repo = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
      e.fault(sql => { if (/^select .* from "user_settings"/i.test(sql)) throw new Error('Injected read failure'); });
      await assert.rejects(repo.getSettings());
    } finally { e.close(); }
  });
  await check('a pending or failed settings save preserves committed values and reports failure', async () => {
    const pending = deferred(), publications = [];
    const t = settingsHook({ getSettings: async () => ({ ...t.defaults, prayerCity: 'Before' }), getDatabaseStats: async () => ({}), saveSettings: () => pending.promise }, publications);
    try {
      t.render(); await tick(); const saving = t.render().updateSetting({ prayerCity: 'After' }); await tick();
      assert.equal(t.render().settings.prayerCity, 'Before'); assert.equal(t.render().isSavingSettings, true); assert.equal(publications.length, 0);
      pending.reject(new Error('Injected save failure')); assert.equal(await saving, false);
      assert.equal(t.render().settings.prayerCity, 'Before'); assert.match(t.render().settingsError, /save failure/); assert.equal(t.render().isSavingSettings, false);
    } finally { t.h.close(); }
  });
  await check('rapid partial settings saves run in order and retain both committed changes', async () => {
    let committed, calls = 0; const first = deferred();
    const t = settingsHook({ getSettings: async () => committed, getDatabaseStats: async () => ({}), saveSettings: async partial => {
      calls++; if (calls === 1) await first.promise; committed = { ...committed, ...partial }; return { ...committed };
    } }); committed = { ...t.defaults };
    try {
      t.render(); await tick(); const a = t.render().updateSetting({ pomodoroMinutes: 45 }), b = t.render().updateSetting({ hapticsEnabled: false });
      await tick(); assert.equal(calls, 1); first.resolve(); assert.deepEqual(await Promise.all([a, b]), [true, true]);
      assert.equal(t.render().settings.pomodoroMinutes, 45); assert.equal(t.render().settings.hapticsEnabled, false); assert.equal(t.render().isSavingSettings, false);
    } finally { t.h.close(); }
  });
  for (const fails of [false, true]) {
    await check('a delayed initial settings read cannot overwrite a newer save ' + (fails ? 'failure' : 'success'), async () => {
      const old = deferred();
      const t = settingsHook({ getSettings: () => old.promise, getDatabaseStats: async () => ({}), saveSettings: async partial => {
        if (fails) throw new Error('Latest failure'); return { ...t.defaults, ...partial };
      } });
      try {
        t.render(); const saved = await t.render().updateSetting({ pomodoroMinutes: 45 }); assert.equal(saved, !fails);
        old.resolve({ ...t.defaults, pomodoroMinutes: 15 }); await tick();
        assert.equal(t.render().settings.pomodoroMinutes, fails ? t.defaults.pomodoroMinutes : 45);
        if (fails) assert.match(t.render().settingsError, /Latest failure/);
      } finally { t.h.close(); }
    });
  }
  await check('initial settings load failure is visible', async () => {
    const t = settingsHook({ getSettings: async () => { throw new Error('Injected initial read failure'); }, getDatabaseStats: async () => ({}) });
    try { t.render(); await tick(); assert.match(t.render().settingsError, /initial read failure/); }
    finally { t.h.close(); }
  });
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} weekly/settings checks, ${failures} failures; no user database accessed.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
