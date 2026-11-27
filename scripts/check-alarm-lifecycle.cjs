const assert = require('node:assert/strict');
const { loader } = require('./check-backup.cjs');
const { environment } = require('./check-integrity.cjs');
const { harness, tick } = require('./check-progress.cjs');
let checks = 0;
function native(os = 'android') {
  const scheduled = new Map([['managed-task-exec-old', {}], ['agenda-keep', {}]]);
  let permission = 'granted', requests = 0, exact = true, responseListener, last = null, clears = 0, removed = false, fails = false;
  const notifications = {
    setNotificationHandler() {}, AndroidImportance: { MAX: 5, HIGH: 4 }, IosAuthorizationStatus: { PROVISIONAL: 3 }, SchedulableTriggerInputTypes: { DATE: 'date' },
    DEFAULT_ACTION_IDENTIFIER: 'default', setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ status: permission, canAskAgain: true }), requestPermissionsAsync: async () => { requests++; return { status: permission }; },
    getExactAlarmPermissionsAsync: async () => ({ granted: exact, canAskAgain: true }), requestExactAlarmPermissionsAsync: async () => { exact = true; },
    getAllScheduledNotificationsAsync: async () => [...scheduled].map(([identifier]) => ({ identifier })),
    cancelScheduledNotificationAsync: async id => scheduled.delete(id),
    scheduleNotificationAsync: async request => { if (fails) throw new Error('Native scheduling failed'); scheduled.set(request.identifier, request); return request.identifier; },
    getLastNotificationResponse: () => last, clearLastNotificationResponse: () => { clears++; last = null; },
    addNotificationResponseReceivedListener: callback => { responseListener = callback; return { remove: () => { removed = true; } }; },
  };
  const mod = loader({ 'react-native': { Platform: { OS: os } }, expo: { requireOptionalNativeModule: name => name === 'ExpoNotificationScheduler' ? {} : null }, 'expo-notifications': notifications })('src/features/task-manager/data/services/task-alarm-notification.service.ts');
  return { ...mod, scheduled, requests: () => requests, deny: () => { permission = 'denied'; }, exact: value => { exact = value; }, fail: () => { fails = true; },
    setLast: value => { last = value; }, emit: value => responseListener(value), clears: () => clears, removed: () => removed };
}
const task = { id: 'mtask-test', title: 'Work', executionDate: '2099-01-01', executionTime: '09:00', deadlineDate: '2099-01-02', deadlineTime: '10:00',
  alertMode: 'BOTH', isCompleted: false, snoozedUntilIso: null };
async function main() {
  let n = native(); const status = []; n.subscribeTaskAlarmStatus(value => status.push(value));
  assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), true);
  assert.equal(n.scheduled.size, 3); assert.ok(n.scheduled.has('agenda-keep') && !n.scheduled.has('managed-task-exec-old'));
  assert.equal(n.scheduled.get('managed-task-exec-mtask-test').content.data.occurrence, '2099-01-01T09:00'); checks++;
  await n.TaskAlarmNotificationService.reconcileTaskAlarms([{ ...task, lastAlarmFiredKey: '2099-01-01T09:00|dismissed' }]);
  assert.deepEqual([...n.scheduled.keys()], ['agenda-keep']); checks++;
  await n.TaskAlarmNotificationService.reconcileTaskAlarms([{ ...task, snoozedUntilIso: '2099-01-01T09:05:00Z', lastAlarmFiredKey: '2099-01-01T09:00' }]);
  assert.equal(n.scheduled.get('managed-task-exec-mtask-test').content.data.occurrence, 'snooze:2099-01-01T09:05:00Z'); checks++;
  n.deny(); assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), false); assert.equal(n.requests(), 0);
  await n.TaskAlarmNotificationService.reconcileTaskAlarms([task], true); assert.equal(n.requests(), 1); assert.match(status.at(-1), /Tugas tersimpan/); checks++;
  n = native(); n.exact(false); assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), false);
  await n.TaskAlarmNotificationService.requestExactAlarmPermission(); assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), true); checks++;
  n.fail(); assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), false); checks++;
  n = native('web'); assert.equal(await n.TaskAlarmNotificationService.reconcileTaskAlarms([task]), false); checks++;
  n = native();
  const response = { actionIdentifier: 'default', notification: { date: 1, request: { identifier: 'managed-task-exec-mtask-test', content: { data: { managedTaskId: task.id, isTaskAlarm: true, occurrence: '2099-01-01T09:00' } } } } };
  n.setLast(response); const opened = [];
  const stop = n.TaskAlarmNotificationService.observeResponses(async value => { opened.push(value); }); await tick();
  n.emit(response); await tick(); assert.equal(opened.length, 1); assert.equal(n.clears(), 1); checks++;
  n.emit({ ...response, notification: { ...response.notification, date: 2 } }); await tick(); assert.equal(opened.length, 2); checks++;
  stop(); assert.ok(n.removed()); n.emit({ ...response, notification: { ...response.notification, date: 3 } }); await tick(); assert.equal(opened.length, 2); checks++;
  const e = environment(), RealDate = Date; let now = new RealDate('2026-11-22T09:02:00').getTime();
  globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  try {
    await e.client.initDatabase();
    const mod = e.load('src/features/task-manager/data/repositories/managed-task.repository.ts'), repo = mod.managedTaskRepository;
    const saved = await repo.createTask({ title: 'Delayed alarm', executionDate: '2026-11-22', executionTime: '09:00', deadlineDate: '2026-11-23', deadlineTime: '10:00', alertMode: 'ALARM' });
    assert.equal((await repo.checkDueAlarmsNow()).id, saved.id); mod.clearRingingAlarm(); await repo.dismissTaskAlarm(saved.id);
    assert.equal(await repo.checkDueAlarmsNow(), null); assert.equal(await repo.openAlarmFromNotification(saved.id, '2026-11-22T09:00'), false); checks++;
    const other = await repo.createTask({ title: 'Notification', executionDate: '2026-11-22', executionTime: '09:01', deadlineDate: '2026-11-23', deadlineTime: '10:00', alertMode: 'ALARM' });
    assert.equal(await repo.openAlarmFromNotification(other.id, '2026-11-22T09:00'), false);
    assert.equal(await repo.openAlarmFromNotification(other.id, '2026-11-22T09:01'), true); mod.clearRingingAlarm(); checks++;
    await repo.toggleTaskCompletion(other.id); assert.equal(await repo.openAlarmFromNotification(other.id, '2026-11-22T09:01'), false); checks++;
    const firstTrack = { id: 'custom-1', name: 'One', uri: 'file://one.wav', isBuiltIn: false };
    const secondTrack = { id: 'custom-2', name: 'Two', uri: 'file://two.wav', isBuiltIn: false };
    await Promise.all([repo.addCustomAlarmTrack(firstTrack), repo.addCustomAlarmTrack(secondTrack)]);
    assert.equal((await repo.getAllAlarmTracks()).filter(track => !track.isBuiltIn).length, 2); checks++;
    const before = e.state();
    e.fault(sql => { if (/^insert into "user_settings"/i.test(sql)) throw new Error('Custom song disk failure'); });
    await assert.rejects(repo.addCustomAlarmTrack({ ...firstTrack, id: 'lost' }), /disk failure/);
    e.fault(() => {}); assert.equal(e.state(), before); checks++;
    now += 2 * 86_400_000; assert.equal(await repo.checkDueAlarmsNow(), null); checks++;
  } finally { globalThis.Date = RealDate; e.close(); }
  let calendar = { key: 'launch' }, received, disposed = false; const calls = [];
  const h = harness({
    'expo-router': { router: { push: value => calls.push(value) } },
    '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => calendar },
    '../../data/repositories/managed-task.repository': { managedTaskRepository: { syncAlarms: async () => { calls.push('managed'); }, checkDueAlarmsNow: async () => { calls.push('due'); }, openAlarmFromNotification: async () => true } },
    '../../data/services/task-alarm-notification.service': { TaskAlarmNotificationService: { observeResponses: callback => { received = callback; return () => { disposed = true; }; } } },
    '@/features/agenda/data/services/calendar-reminder.service': { syncCalendarReminders: async () => { calls.push('calendar'); } },
  });
  const component = h.load('src/features/task-manager/presentation/components/managed-alarm-sync.tsx').ManagedAlarmSync;
  h.render(component); await tick(); assert.deepEqual(calls, ['managed', 'calendar', 'due']); checks++;
  calls.length = 0; calendar = { key: 'resume' }; h.render(component); await tick(); assert.deepEqual(calls, ['managed', 'calendar', 'due']);
  await received({ taskId: 'one', occurrence: null, isAlarm: false }); assert.deepEqual(calls.at(-1), {pathname:'/tasks/[id]',params:{id:'one'}}); h.close(); assert.ok(disposed); checks++;
  console.log(`PASS: ${checks} managed-alarm lifecycle checks; native mocked, SQLite memory only.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
