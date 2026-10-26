// Real timer persistence, session transactions and controlled-clock native effects; no user data.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { harness, tick } = require('./check-progress.cjs');
let checks = 0;
function passed(name) { checks++; console.log('PASS:', name); }
const start = Date.parse('2026-10-27T03:00:00.000Z');

async function repositories() {
  const e = environment();
  try {
    await e.client.initDatabase();
    const repo = e.load('src/features/today-focus/data/repositories/focus-timer.repository.ts').focusTimerRepository;
    const domain = e.load('src/features/today-focus/domain/focus-timer.ts');
    const focus = e.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    const task = await focus.createQuickTask('Belajar Python', '2026-10-27');
    let s = repo.start('POMODORO', 45, task.id, start);
    assert.throws(() => repo.start('STOPWATCH', 0, null, start), /Masih/);
    assert.equal(repo.load(start + 1000).id, s.id);
    s = repo.transition(s.id, 'pause', start + 45_000);
    assert.equal(s.elapsedMs, 45_000);
    s = repo.transition(s.id, 'resume', start + 600_000);
    assert.equal(domain.elapsedAt(s, start + 635_000), 80_000);
    s = repo.transition(s.id, 'pause', start + 635_000);
    s = repo.transition(s.id, 'finish', start + 900_000);
    assert.equal(s.elapsedMs, 80_000);
    assert.equal(e.raw.getFirstSync('SELECT duration_minutes n FROM focus_sessions WHERE id = ?', s.id).n, 1);
    assert.equal(e.raw.getFirstSync('SELECT actual_minutes n FROM tasks WHERE id = ?', task.id).n, 1);
    for (let i = 0; i < 3; i++) { repo.transition(s.id, 'finish', start + 1_000_000); repo.load(start + 1_000_000); }
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 1);
    assert.equal(e.raw.getFirstSync('SELECT actual_minutes n FROM tasks WHERE id = ?', task.id).n, 1);
    passed('one persistent session, pause/resume excludes breaks, early finish records actual minutes and repeated finish is idempotent');
    repo.dismiss(s.id);
    assert.equal(repo.load(start), null); assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 1);
    passed('skipping reflection leaves the committed session and task minutes intact');
    s = repo.start('DEEP_FLOW', 1, task.id, start);
    s = repo.load(start + 86_400_000);
    assert.equal(s.status, 'COMPLETED'); assert.equal(s.elapsedMs, 60_000);
    assert.equal(s.endedAt, new Date(start + 60_000).toISOString());
    assert.equal(e.raw.getFirstSync('SELECT duration_minutes n FROM focus_sessions WHERE id = ?', s.id).n, 1);
    repo.dismiss(s.id, { rating: 5, obstacle: ' test ', nextAction: ' next ' });
    assert.equal(e.raw.getFirstSync('SELECT obstacle FROM focus_sessions WHERE id = ?', s.id).obstacle, 'test');
    passed('restart after countdown deadline caps duration/end at the deadline; reflection updates instead of inserting');
    s = repo.start('STOPWATCH', 0, null, start);
    const before = e.state();
    for (const trigger of ['insert into "focus_sessions"', 'insert into "user_settings"']) {
      e.fault(sql => { if (sql.startsWith(trigger)) throw new Error('disk full'); });
      assert.throws(() => repo.transition(s.id, 'finish', start + 120_000), /disk full/);
      e.fault(() => {}); assert.equal(e.state(), before);
    }
    s = repo.transition(s.id, 'finish', start + 59_000);
    assert.equal(e.raw.getFirstSync('SELECT duration_minutes n FROM focus_sessions WHERE id = ?', s.id).n, 0);
    passed('finalization/state-write failure rolls back everything; sub-minute sessions never invent a minute');
    let saved = e.state();
    e.fault(sql => { if (sql.startsWith('delete from "user_settings"')) throw new Error('reflection failure'); });
    assert.throws(() => repo.dismiss(s.id, { rating: 3, obstacle: 'keep' }), /reflection failure/);
    e.fault(() => {}); assert.equal(e.state(), saved);
    assert.throws(() => repo.dismiss(s.id, { rating: 6 }), /1–5/);
    repo.dismiss(s.id, { rating: 3 }); repo.dismiss(s.id, { rating: 3 });
    assert.equal(e.raw.getFirstSync('SELECT rating FROM focus_sessions WHERE id = ?', s.id).rating, 3);
    passed('reflection failure retains pending state; retry/duplicate submission do not duplicate activity');
    s = repo.start('STOPWATCH', 0, task.id, start);
    saved = e.state(); e.fault(sql => { if (sql.startsWith('update "tasks"')) throw new Error('minutes failure'); });
    assert.throws(() => repo.transition(s.id, 'finish', start + 120_000), /minutes failure/);
    e.fault(() => {}); assert.equal(e.state(), saved);
    await focus.toggleTaskCompletion(task.id, true);
    assert.throws(() => repo.transition('wrong-id', 'finish', start), /berubah/);
    e.raw.runSync('DELETE FROM tasks WHERE id = ?', task.id);
    s = repo.transition(s.id, 'finish', start + 90_000);
    const recorded = e.raw.getFirstSync('SELECT * FROM focus_sessions WHERE id = ?', s.id);
    assert.equal(recorded.task_id, null); assert.equal(recorded.task_title, 'Belajar Python'); repo.dismiss(s.id);
    passed('task-minutes failure rolls back; a deleted task preserves the original session label with detached FK');
    const completed = await focus.createQuickTask('Completed', '2026-10-27'); await focus.toggleTaskCompletion(completed.id, true);
    assert.throws(() => repo.start('STOPWATCH', 0, completed.id, start), /aktif/);
    assert.throws(() => repo.start('POMODORO', 0, null, start));
    assert.throws(() => repo.start('UNKNOWN', 2, null, start));
    s = repo.start('STOPWATCH', 0, null, start); s = repo.transition(s.id, 'pause', start + 90_000);
    s = repo.transition(s.id, 'resume', start - 100_000);
    assert.ok(domain.elapsedAt(s, start - 50_000) >= 0);
    s = repo.transition(s.id, 'finish', start - 50_000);
    assert.equal(domain.parseTimer(JSON.stringify(s)).status, 'COMPLETED');
    repo.dismiss(s.id);
    passed('invalid modes/durations/completed tasks fail; backward clock changes cannot create negative or reversed sessions');
    s = repo.start('POMODORO', 25, null, start);
    let data = e.store.readBackupData(e.raw);
    const json = e.format.serializeBackup(data); const backup = e.format.parseBackup(json);
    assert.equal(domain.parseTimer(backup.data.userSettings.find(row => row.key === domain.TIMER_KEY).value).id, s.id);
    const other = environment();
    try { await other.client.initDatabase(); other.store.replaceBackupData(other.raw, backup.data); assert.equal(other.load('src/features/today-focus/data/repositories/focus-timer.repository.ts').focusTimerRepository.load(start + 1000).id, s.id); }
    finally { other.close(); }
    const invalid = JSON.parse(json); invalid.data.userSettings.find(row => row.key === domain.TIMER_KEY).value = '{bad';
    assert.throws(() => e.format.parseBackup(JSON.stringify(invalid)), /timer/);
    const missing = JSON.parse(json); const fakeDone = domain.finishTimerState(s, start + 60_000);
    missing.data.userSettings.find(row => row.key === domain.TIMER_KEY).value = JSON.stringify(fakeDone);
    assert.throws(() => e.format.parseBackup(JSON.stringify(missing)), /timer/);
    s = repo.transition(s.id, 'finish', start + 25 * 60_000);
    data = e.store.readBackupData(e.raw); assert.equal(e.format.parseBackup(e.format.serializeBackup(data)).data.focusSessions.length, data.focusSessions.length);
    passed('active and pending-reflection states round trip in existing backup format; malformed/inconsistent timer data is rejected');
    repo.dismiss(s.id); e.raw.runSync('INSERT INTO user_settings (key,value,updated_at) VALUES (?,?,?)', domain.TIMER_KEY, '{broken', new Date(start).toISOString());
    const broken = e.state(); assert.throws(() => repo.load(start)); assert.equal(e.state(), broken);
    passed('corrupt persisted timer is reported without deletion or overwriting its raw data');
  } finally { e.close(); }
}

async function controller() {
  const e = environment(), OriginalDate = globalThis.Date, set = globalThis.setInterval, clear = globalThis.clearInterval;
  let now = start, seq = 0; const timers = new Map(), native = []; let appState;
  globalThis.Date = class extends OriginalDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  globalThis.setInterval = callback => { const id = ++seq; timers.set(id, callback); return id; }; globalThis.clearInterval = id => timers.delete(id);
  try {
    await e.client.initDatabase();
    const repo = e.load('src/features/today-focus/data/repositories/focus-timer.repository.ts').focusTimerRepository;
    const settings = e.load('src/features/settings/data/repositories/settings.repository.impl.ts').settingsRepository;
    await settings.saveSettings({ pomodoroMinutes: 45, deepFlowMinutes: 90, hapticsEnabled: false, keepAwakeEnabled: false });
    let notifications = 0, nativeFails = false;
    const onSessionRecorded = () => { notifications++; };
    const make = () => {
      const h = harness({
        '../../data/repositories/focus-timer.repository': { focusTimerRepository: repo },
        '@/features/settings/data/repositories/settings.repository.impl': { settingsRepository: settings },
        'react-native': { AppState: { currentState: 'active', addEventListener: (_type, callback) => { appState = callback; return { remove() { native.push('remove'); } }; } } },
        'expo-keep-awake': { activateKeepAwakeAsync: async tag => { native.push(['awake', tag]); if (nativeFails) throw new Error('unsupported'); }, deactivateKeepAwake: async tag => { native.push(['sleep', tag]); } },
        'expo-haptics': { ImpactFeedbackStyle: { Light: 'light' }, impactAsync: async () => { native.push('haptic'); if (nativeFails) throw new Error('unsupported'); } },
      });
      const useTimer = h.load('src/features/today-focus/presentation/hooks/use-focus-timer.ts').useFocusTimer;
      return { h, render: () => h.render(() => useTimer({ onSessionRecorded })) };
    };
    let ui = make(); ui.render(); await tick(); let timer = ui.render();
    assert.equal(timer.selectedMinutes, 45); assert.equal(timer.ready, true);
    timer.startTimer(); timer.startTimer(); timer = ui.render(); assert.equal(timer.isRunning, true);
    assert.equal(native.includes('haptic'), false); assert.equal(native.some(item => Array.isArray(item) && item[0] === 'awake'), false);
    now += 60_000; timer.pauseTimer(); timer = ui.render(); assert.equal(timer.secondsLeft, 44 * 60);
    timer.changeMode('STOPWATCH'); timer.setActiveTask(null); timer.resetTimer(); assert.ok(ui.render().error);
    assert.equal(ui.render().mode, 'POMODORO'); ui.h.close(); assert.equal(timers.size, 0);
    ui = make(); ui.render(); await tick(); timer = ui.render(); assert.equal(timer.secondsLeft, 44 * 60); assert.equal(timer.isRunning, false);
    now += 300_000; timer.startTimer(); timer = ui.render(); now += 30_000; timer.finishTimer(); timer.finishTimer();
    timer = ui.render(); await tick(); assert.equal(timer.reflection.elapsedMs, 90_000); assert.equal(notifications, 1);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 1);
    timer.dismissReflection(); assert.equal(ui.render().hasSession, false);
    ui.render().changeMode('DEEP_FLOW'); ui.render().resetTimer(); assert.equal(ui.render().mode, 'DEEP_FLOW');
    ui.render().changeMode('POMODORO');
    passed('hook restores a paused timer, respects custom duration/disabled effects, locks changes and records once before reflection');
    await settings.saveSettings({ pomodoroMinutes: 1, keepAwakeEnabled: true, hapticsEnabled: true });
    ui.h.focus(false); ui.render(); ui.h.focus(true); ui.render(); await tick(); timer = ui.render();
    timer.startTimer(); timer = ui.render(); await tick();
    assert.ok(native.includes('haptic')); assert.ok(native.some(item => Array.isArray(item) && item[0] === 'awake'));
    appState('background'); ui.render(); await tick(); assert.equal(timers.size, 0);
    now += 90_000; appState('active'); timer = ui.render(); await tick();
    assert.equal(timer.reflection.elapsedMs, 60_000); assert.equal(timer.isRunning, false);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 2);
    assert.ok(native.some(item => Array.isArray(item) && item[0] === 'sleep'));
    ui.h.close(); assert.equal(timers.size, 0);
    passed('preferences refresh on route return; foreground wake lock releases and background deadline completes on resume');
    ui = make(); ui.render(); await tick(); timer = ui.render(); assert.ok(timer.reflection);
    await timer.saveReflection({ rating: 5, nextAction: 'Next' }); assert.equal(ui.render().reflection, null);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 2);
    passed('pending reflection survives a remount; saving it never inserts another session');
    timer = ui.render(); nativeFails = true; timer.startTimer(); timer = ui.render(); await tick();
    let attempts = 0;
    e.fault(sql => { if (sql.startsWith('insert into "focus_sessions"')) { attempts++; throw new Error('full disk'); } });
    now += 60_000; [...timers.values()].forEach(callback => callback()); timer = ui.render(); await tick();
    assert.match(timer.error, /full disk/); assert.equal(timer.reflection, null);
    [...timers.values()].forEach(callback => callback()); assert.equal(attempts, 1);
    e.fault(() => {}); timer.retry(); timer = ui.render(); await tick();
    assert.ok(timer.reflection); assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 3);
    timer.dismissReflection(); ui.h.close();
    passed('failed auto-save retains the timer without a retry loop; explicit retry commits once despite native effect failures');
  } finally { globalThis.Date = OriginalDate; globalThis.setInterval = set; globalThis.clearInterval = clear; e.close(); }
}
async function main() { await repositories(); await controller(); console.log(`PASS: ${checks} timer/session checks. No user database or native effects accessed.`); }
main().catch(error => { console.error(error); process.exitCode = 1; });
