// Actual audio/repository code with controlled players, timers and disposable SQLite only.
const assert = require('node:assert/strict');
const { loader } = require('./check-backup.cjs');
const { environment } = require('./check-integrity.cjs');
const tick = async () => { for (let i = 0; i < 15; i++) await Promise.resolve(); };
let checks = 0, failures = 0;
async function check(name, work) {
  try { await work(); checks++; console.log('PASS:', name); }
  catch (error) { failures++; console.error('FAIL:', name, error); }
}
async function audioCase(work, options = {}) {
  const original = { setTimeout, clearTimeout, setInterval, clearInterval };
  const timers = new Map(), callbacks = [], players = []; let id = 0, impacts = 0;
  globalThis.setTimeout = (fn, ms) => { const key = ++id; timers.set(key, { fn, ms, interval: false }); callbacks.push(fn); return key; };
  globalThis.setInterval = (fn, ms) => { const key = ++id; timers.set(key, { fn, ms, interval: true }); return key; };
  globalThis.clearTimeout = globalThis.clearInterval = key => timers.delete(key);
  const load = loader({
    'react-native': { Platform: { OS: 'android' } },
    'expo-haptics': {
      NotificationFeedbackType: { Success: 'success', Warning: 'warning' }, ImpactFeedbackStyle: { Heavy: 'heavy' },
      notificationAsync: options.haptic || (async () => {}), impactAsync: async () => { impacts++; },
    },
    'expo-file-system': { File: class { constructor(...parts) { this.uri = parts.join('/'); this.exists = !(options.missingFile && parts[0] === 'file://missing.wav'); } write() { this.exists = true; } }, Paths: { document: 'file://test/', cache: 'file://cache' } },
    'expo-audio': {
      setAudioModeAsync: options.configure || (async () => {}),
      createAudioPlayer(uri) {
        const player = { uri, loop: false, volume: 1, playing: false, removed: false,
          play() { this.playing = true; if (options.playThrows) throw new Error('Injected play failure'); },
          pause() { if (options.pauseThrows) throw new Error('Injected pause failure'); this.playing = false; },
          remove() { this.playing = false; this.removed = true; },
        };
        players.push(player); return player;
      },
    },
  });
  const service = load('src/features/task-manager/data/services/task-alarm-audio.service.ts').TaskAlarmAudioService;
  try { await work({ service, players, timers, callbacks, impacts: () => impacts }); }
  finally { service.stopPreview(); service.stopAlarmRinging(); Object.assign(globalThis, original); }
}
async function repositoryCase(work) {
  const RealDate = Date; let now = new RealDate('2026-11-21T09:00:00').getTime();
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  const e = environment();
  try {
    await e.client.initDatabase();
    const module = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts');
    const repo = module.managedTaskRepository;
    const task = await repo.createTask({ title: 'Alarm test', executionDate: '2026-11-21', executionTime: '09:00',
      deadlineDate: '2026-11-22', deadlineTime: '23:59', alertMode: 'ALARM', alarmTrackId: 'test', alarmTrackName: 'Test', alarmTrackUri: 'file://test.wav' });
    await work({ e, module, repo, task, advance(minutes) { now += minutes * 60_000; } });
  } finally { e.close(); globalThis.Date = RealDate; }
}
async function main() {
  await check('a missing custom file falls back to the bundled/generated alarm instead of retaining a broken URI', () => audioCase(async ({ service, players }) => {
    await service.startAlarmRinging('file://missing.wav'); assert.equal(players.length, 1);
    assert.ok(players[0].uri.includes('file://cache')); service.stopAlarmRinging(); assert.ok(players[0].removed);
  }, { missingFile: true }));
  await check('two simultaneous alarm starts leave no orphan player or vibration loop after stop', async () => {
    const releases = [];
    await audioCase(async ({ service, players, timers }) => {
      const a = service.startAlarmRinging('file://a.wav'), b = service.startAlarmRinging('file://b.wav');
      releases.forEach(release => release()); await Promise.all([a, b]);
      service.stopAlarmRinging();
      assert.ok(players.every(player => !player.playing && player.removed));
      assert.equal(timers.size, 0);
    }, { configure: () => new Promise(resolve => releases.push(resolve)) });
  });
  await check('stop while audio configuration is pending prevents a later alarm start', async () => {
    let release;
    await audioCase(async ({ service, players, timers }) => {
      const pending = service.startAlarmRinging('file://a.wav');
      service.stopAlarmRinging(); release(); await pending;
      assert.equal(players.length, 0); assert.equal(timers.size, 0);
    }, { configure: () => new Promise(resolve => { release = resolve; }) });
  });
  await check('stop preview while loading prevents it from starting after the stop', async () => {
    let release;
    await audioCase(async ({ service, players, timers }) => {
      const pending = service.previewTrack({ id: 'preview', name: 'Preview', uri: 'file://preview.wav', isBuiltIn: false });
      await tick(); service.stopPreview(); release();
      assert.equal(await pending, false); assert.equal(players.length, 0); assert.equal(timers.size, 0);
    }, { haptic: () => new Promise(resolve => { release = resolve; }) });
  });
  await check('player removal still runs when pause throws', () => audioCase(async ({ service, players, timers }) => {
    await service.startAlarmRinging('file://a.wav'); service.stopAlarmRinging();
    assert.ok(players.every(player => player.removed && !player.playing)); assert.equal(timers.size, 0);
  }, { pauseThrows: true }));
  await check('a player that fails during play is released', () => audioCase(async ({ service, players }) => {
    await assert.rejects(service.startAlarmRinging('file://a.wav'), /belum dapat diputar/); service.stopAlarmRinging();
    assert.ok(players.every(player => player.removed && !player.playing));
  }, { playThrows: true }));
  await check('a queued haptic callback cannot vibrate after stop', () => audioCase(async ({ service, callbacks, impacts }) => {
    await service.startAlarmRinging('file://a.wav'); service.stopAlarmRinging();
    callbacks.forEach(callback => callback()); await tick(); assert.equal(impacts(), 0);
  }));
  await check('alarm takes ownership from an in-flight preview', async () => {
    let releasePreview;
    await audioCase(async ({ service, players }) => {
      const pending = service.previewTrack({ id: 'preview', name: 'Preview', uri: 'file://preview.wav', isBuiltIn: false });
      await tick(); await service.startAlarmRinging('file://alarm.wav');
      releasePreview(); await pending; service.stopAlarmRinging();
      assert.ok(players.every(player => player.removed && !player.playing));
    }, { haptic: kind => kind === 'success' ? new Promise(resolve => { releasePreview = resolve; }) : Promise.resolve() });
  });
  await check('a pending alarm cannot be mixed with a new preview', async () => {
    const releases = [];
    await audioCase(async ({ service, players }) => {
      const alarm = service.startAlarmRinging('file://alarm.wav');
      const preview = service.previewTrack({ id: 'preview', name: 'Preview', uri: 'file://preview.wav', isBuiltIn: false });
      releases.forEach(release => release()); await Promise.all([alarm, preview]);
      assert.equal(await preview, false); assert.equal(players.length, 1);
    }, { configure: () => new Promise(resolve => releases.push(resolve)) });
  });
  await check('future snooze does not fall back to the original scheduled minute', () => repositoryCase(async ({ module, repo, task, advance }) => {
    assert.equal((await repo.checkDueAlarmsNow()).id, task.id);
    module.clearRingingAlarm(); await repo.snoozeTaskAlarm(task.id, 5);
    assert.equal(await repo.checkDueAlarmsNow(), null);
    advance(5); assert.equal((await repo.checkDueAlarmsNow()).id, task.id);
  }));
  await check('silencing is immediate and survives a database failure for the current occurrence', () => repositoryCase(async ({ e, module, repo, task }) => {
    await repo.checkDueAlarmsNow(); module.clearRingingAlarm();
    e.fault(sql => { if (/^insert into "task_profiles"/i.test(sql)) throw new Error('Injected dismiss failure'); });
    try { await assert.rejects(repo.dismissTaskAlarm(task.id)); } finally { e.fault(() => {}); }
    assert.equal(await repo.checkDueAlarmsNow(), null);
  }));
  await check('test mode is distinguishable and clearing it does not mute the real scheduled alarm', () => repositoryCase(async ({ e, module, repo, task }) => {
    const states = [], unsubscribe = module.subscribeRingingAlarm((value, isTest) => states.push({ value, isTest }));
    try {
      const before = e.state(); module.triggerAlarmNow(task);
      assert.equal(states.at(-1).isTest, true);
      module.clearRingingAlarm(); assert.equal(e.state(), before);
      assert.equal((await repo.checkDueAlarmsNow()).id, task.id);
      assert.equal(states.at(-1).isTest, false);
    } finally { unsubscribe(); }
  }));
  await check('cancelled tasks do not ring', () => repositoryCase(async ({ e, repo, task }) => {
    e.raw.runSync("UPDATE tasks SET status = 'CANCELLED' WHERE id = ?", task.id);
    assert.equal(await repo.checkDueAlarmsNow(), null);
  }));
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} alarm checks, ${failures} failures; native audio and device alarms are mocked.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
