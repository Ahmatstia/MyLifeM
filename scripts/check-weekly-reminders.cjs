const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { loader } = require('./check-backup.cjs');
const { harness, tick } = require('./check-progress.cjs');
let checks = 0, failures = 0;
async function check(name, work) { try { await work(); checks++; console.log('PASS:', name); } catch (error) { failures++; console.error('FAIL:', name, error.message); } }
const schedule = { id: 'weekly-one', title: 'Class', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', scheduleType: 'COLLEGE', isActive: true, reminderMinutes: 15 };
async function project(work, zone = 'Asia/Jakarta') {
  const old = process.env.TZ; process.env.TZ = zone;
  try { const load = loader(); await work(load('src/features/agenda/domain/weekly-reminders.ts').projectWeeklyReminders); }
  finally { if (old === undefined) delete process.env.TZ; else process.env.TZ = old; }
}
function native() {
  const scheduled = new Map([['agenda-old', { identifier: 'agenda-old' }], ['weekly-old', { identifier: 'weekly-old' }], ['managed-task-keep', { identifier: 'managed-task-keep' }]]);
  let status = 'granted', requests = 0;
  const notifications = {
    setNotificationHandler() {}, setNotificationChannelAsync: async () => {}, AndroidImportance: { DEFAULT: 3 }, IosAuthorizationStatus: { PROVISIONAL: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date' }, getPermissionsAsync: async () => ({ status, canAskAgain: true }),
    requestPermissionsAsync: async () => { requests++; status = 'granted'; return { status }; },
    getExactAlarmPermissionsAsync: async () => ({ granted: true }), getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
    cancelScheduledNotificationAsync: async id => scheduled.delete(id), scheduleNotificationAsync: async request => { scheduled.set(request.identifier, request); return request.identifier; },
  };
  const service = loader({ 'react-native': { Platform: { OS: 'android' } }, expo: { requireOptionalNativeModule: () => ({}) }, 'expo-notifications': notifications })('src/features/agenda/data/services/agenda-notification.service.ts').AgendaNotificationService;
  return { service, scheduled, deny() { status = 'denied'; }, requests: () => requests };
}
async function controllerChecks() {
  await check('shared coordinator reads both repositories afresh and publishes native failure/recovery to all screens', async () => {
    let agenda = [{ id: 'agenda-current' }], weekly = [{ id: 'weekly-current' }], ready = false, throws = false;
    const reads = [], warnings = [], other = [];
    const shared = loader({
      '../repositories/agenda.repository.impl': { agendaRepository: { getReminderEvents: async () => agenda } },
      '../repositories/weekly-schedule.repository.impl': { weeklyScheduleRepository: { getReminderEvents: async () => weekly } },
      './agenda-notification.service': { AgendaNotificationService: { reconcileReminders: async (read, ask) => { reads.push([await read(), ask]); if (throws) throw new Error('native unavailable'); return ready; } } },
    })('src/features/agenda/data/services/calendar-reminder.service.ts');
    const unsubscribe = shared.subscribeCalendarReminderStatus(value => warnings.push(value));
    const brokenListener = shared.subscribeCalendarReminderStatus(value => { if (value) throw new Error('Unmounted screen'); });
    shared.subscribeCalendarReminderStatus(value => other.push(value));
    assert.equal(await shared.syncCalendarReminders(), false); assert.match(warnings.at(-1), /Jadwal tetap tersimpan/);
    assert.deepEqual(reads[0], [[...agenda, ...weekly], false]); assert.deepEqual(other, warnings);
    throws = true; assert.equal(await shared.syncCalendarReminders(), false);
    throws = false; ready = true; agenda = []; weekly = [{ id: 'restored-weekly' }];
    assert.equal(await shared.syncCalendarReminders(true), true); assert.deepEqual(reads.at(-1), [[...weekly], true]); assert.equal(warnings.at(-1), null);
    unsubscribe(); brokenListener(); const before = warnings.length; await shared.syncCalendarReminders(); assert.equal(warnings.length, before);
  });
  await check('weekly writes reconcile only after commit; failed native delivery remains a successful save with shared warning', async () => {
    const calls = []; let failsWrite = false, listener;
    const write = name => async () => { calls.push(name); if (failsWrite) throw new Error('disk full'); };
    const h = harness({
      '../../data/repositories/weekly-schedule.repository.impl': { weeklyScheduleRepository: {
        getAllWeeklySchedules: async () => [], createWeeklySchedule: write('create'), createWeeklySchedulesForDays: write('batch'),
        updateWeeklySchedule: write('edit'), deleteWeeklySchedule: write('delete'),
      } },
      '../../data/services/calendar-reminder.service': {
        subscribeCalendarReminderStatus: callback => { listener = callback; callback(null); return () => {}; },
        syncCalendarReminders: async (ask = false) => { calls.push('sync ' + ask); listener('Jadwal tetap tersimpan. Izin ditolak.'); return false; },
      },
      '../../data/services/agenda-notification.service': { AgendaNotificationService: { requestExactAlarmPermission: async () => { calls.push('exact'); } } },
    });
    try {
      const hook = h.load('src/features/agenda/presentation/hooks/use-weekly-schedules.ts').useWeeklySchedules;
      h.render(hook); await tick(); failsWrite = true;
      assert.equal(await h.render(hook).addSchedule(schedule), false); assert.deepEqual(calls, ['create']);
      failsWrite = false; calls.length = 0;
      assert.equal(await h.render(hook).addSchedule(schedule), true);
      assert.equal(await h.render(hook).addSchedulesForDays([1, 2], schedule), true);
      assert.equal(await h.render(hook).editSchedule(schedule.id, { reminderMinutes: null }), true);
      assert.equal(await h.render(hook).removeSchedule(schedule.id), true);
      assert.deepEqual(calls, ['create', 'sync true', 'batch', 'sync true', 'edit', 'sync true', 'delete', 'sync false']);
      assert.match(h.render(hook).reminderWarning, /tetap tersimpan/);
      await h.render(hook).retryReminders(); assert.deepEqual(calls.slice(-2), ['exact', 'sync true']);
    } finally { h.close(); }
  });
  await check('occurrence completion/cancellation commits before resync and a failed write never changes notification state', async () => {
    const calls = []; let fails = false;
    const h = harness({
      '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => ({ date: '2026-11-23', key: 'one' }) },
      '../../data/repositories/agenda.repository.impl': { agendaRepository: { getEventsForDate: async () => [] } },
      '../../data/repositories/weekly-schedule.repository.impl': { weeklyScheduleRepository: {
        getProjectedSchedulesForDate: async () => [],
        setOccurrenceCompletion: async (...args) => { calls.push(['complete', ...args]); if (fails) throw new Error('disk full'); },
        setOccurrenceCancellation: async (...args) => { calls.push(['cancel', ...args]); if (fails) throw new Error('disk full'); },
      } },
      '../../data/services/calendar-reminder.service': { subscribeCalendarReminderStatus: () => () => {}, syncCalendarReminders: async () => { calls.push('sync'); return true; } },
      '../../data/services/agenda-notification.service': { AgendaNotificationService: {} },
    });
    try {
      const hook = h.load('src/features/agenda/presentation/hooks/use-agenda.ts').useAgenda; h.render(hook); await tick();
      await h.render(hook).toggleWeeklyOccurrence('w', false);
      await h.render(hook).toggleWeeklyOccurrenceCancellation('w', true);
      assert.deepEqual(calls, [['complete', 'w', '2026-11-23', true], 'sync', ['cancel', 'w', '2026-11-23', false], 'sync']);
      calls.length = 0; fails = true; await h.render(hook).toggleWeeklyOccurrence('w', true); await h.render(hook).toggleWeeklyOccurrenceCancellation('w', false);
      assert.equal(calls.includes('sync'), false); assert.ok(h.render(hook).error);
    } finally { h.close(); }
  });
  await check('the root controller renews reminders on launch and calendar/resume changes without prompting permission', async () => {
    const calls = []; let calendar = { key: 'initial' };
    const h = harness({
      '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => calendar },
      'expo-router': { router: {push() {}} },
      '../../data/services/agenda-notification.service': { AgendaNotificationService: {observeResponses: () => () => {}} },
      '@/features/task-manager/data/services/task-alarm-notification.service': {subscribeTaskAlarmStatus: () => () => {}},
      '@/shared/notifications/notification-store': {useNotificationStore:{getState:()=>({publish(){}})}},
      '../../data/services/calendar-reminder.service': { subscribeCalendarReminderStatus: () => () => {}, syncCalendarReminders: async (...args) => { calls.push(args); return true; } },
    });
    try {
      const component = h.load('src/features/agenda/presentation/components/calendar-reminder-sync.tsx').CalendarReminderSync;
      assert.equal(h.render(component), null); h.render(component); assert.equal(calls.length, 1);
      for (const key of ['midnight', 'resumed', 'zone-change']) { calendar = { key }; h.render(component); }
      assert.deepEqual(calls, [[], [], [], []]);
    } finally { h.close(); }
  });
}
async function main() {
  await check('weekly projection covers four weeks with unique, stable occurrence IDs', () => project(fn => {
    const now = new Date('2026-11-22T08:00:00'), a = fn([schedule], [], now), b = fn([schedule], [], now);
    assert.equal(a.length, 4); assert.deepEqual(a, b); assert.equal(new Set(a.map(row => row.id)).size, 4);
    assert.ok(a.every(row => row.kind === 'weekly')); assert.ok(a[0].id.includes('2026-11-23'));
    assert.equal(new Date(a[0].startTime).getHours(), 9);
  }));
  for (const zone of ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']) await check('weekly wall clock is local in ' + zone, () => project(fn => {
    const rows = fn([schedule], [], new Date('2026-11-22T08:00:00'));
    assert.equal(new Date(rows[0].startTime).getHours(), 9); assert.equal(new Date(rows[0].startTime).getDay(), 1);
  }, zone));
  await check('a reminder before midnight uses the next day occurrence and the previous day delivery', () => project(fn => {
    const rows = fn([{ ...schedule, startTime: '00:05', endTime: '01:00' }], [], new Date('2026-11-22T23:45:00'));
    const trigger = new Date(Date.parse(rows[0].startTime) - rows[0].reminderMinutes * 60_000);
    assert.equal(trigger.getDay(), 0); assert.equal(trigger.getHours(), 23); assert.equal(trigger.getMinutes(), 50);
    assert.ok(rows[0].id.includes('2026-11-23'));
  }));
  await check('completed/cancelled occurrences are excluded without disabling later weeks', () => project(fn => {
    const rows = fn([schedule], [{ scheduleId: schedule.id, date: '2026-11-23', isCompleted: true, isCancelled: false },
      { scheduleId: schedule.id, date: '2026-11-30', isCompleted: false, isCancelled: true }], new Date('2026-11-22T08:00:00'));
    assert.equal(rows.length, 2); assert.ok(rows[0].id.includes('2026-12-07'));
  }));
  await check('disabled schedules and disabled reminders produce no events; zero-minute reminders work', () => project(fn => {
    const now = new Date('2026-11-22T08:00:00');
    assert.deepEqual(fn([{ ...schedule, isActive: false }, { ...schedule, id: 'off', reminderMinutes: null }], [], now), []);
    assert.equal(fn([{ ...schedule, reminderMinutes: 0 }], [], now)[0].reminderMinutes, 0);
  }));
  await check('long reminder lead times are projected by delivery window, without silently dropping them', () => project(fn => {
    const rows = fn([{ ...schedule, reminderMinutes: 7 * 1440 }], [], new Date('2026-11-22T08:00:00'));
    assert.equal(rows.length, 4); assert.ok(rows[0].id.includes('2026-11-30'));
  }));
  await check('repository uses persisted dates and completion/cancellation logs for reminder projection', async () => {
    const old = process.env.TZ; process.env.TZ = 'Asia/Jakarta'; const e = environment();
    try {
      await e.client.initDatabase(); const repo = e.load('src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts').weeklyScheduleRepository;
      const saved = await repo.createWeeklySchedule(schedule); await repo.setOccurrenceCancellation(saved.id, '2026-11-23', true);
      let rows = await repo.getReminderEvents(new Date('2026-11-22T08:00:00')); assert.equal(rows.length, 3);
      await repo.setOccurrenceCancellation(saved.id, '2026-11-23', false); rows = await repo.getReminderEvents(new Date('2026-11-22T08:00:00')); assert.equal(rows.length, 4);
      await repo.updateWeeklySchedule(saved.id, { reminderMinutes: null }); assert.deepEqual(await repo.getReminderEvents(new Date('2026-11-22T08:00:00')), []);
    } finally { e.close(); if (old === undefined) delete process.env.TZ; else process.env.TZ = old; }
  });
  await check('calendar reconciliation schedules both namespaces and preserves managed-task alarms', async () => {
    const n = native(), event = { id: 'one', title: 'Meeting', startTime: '2099-01-01T10:00:00Z', reminderMinutes: 0, isAllDay: false, isCompleted: false };
    assert.equal(await n.service.reconcileReminders(async () => [event, { ...event, id: 'class|2099-01-02', kind: 'weekly' }]), true);
    assert.ok(n.scheduled.has('agenda-one')); assert.ok(n.scheduled.has('weekly-class|2099-01-02'));
    assert.ok(!n.scheduled.has('weekly-old') && !n.scheduled.has('agenda-old')); assert.ok(n.scheduled.has('managed-task-keep'));
    const request = n.scheduled.get('weekly-class|2099-01-02'); assert.ok(request.content.title.includes('Rutin'));
    await n.service.reconcileReminders(async () => []); assert.deepEqual([...n.scheduled.keys()], ['managed-task-keep']);
  });
  await check('permission denial is a reminder warning; passive sync never prompts, explicit retry can recover', async () => {
    const n = native(); n.deny(); const rows = [{ id: 'w', kind: 'weekly', title: 'Class', startTime: '2099-01-01T10:00:00Z', reminderMinutes: 0, isAllDay: false, isCompleted: false }];
    assert.equal(await n.service.reconcileReminders(async () => rows), false); assert.equal(n.requests(), 0);
    assert.equal(await n.service.reconcileReminders(async () => rows, true), true); assert.equal(n.requests(), 1); assert.ok(n.scheduled.has('weekly-w'));
  });
  await check('agenda and weekly reminders share one nearest-50 budget', async () => {
    const n = native(); const rows = Array.from({ length: 60 }, (_, i) => ({ id: 'event-' + i, kind: i % 2 ? 'weekly' : 'agenda', title: 'Item',
      startTime: new Date(Date.UTC(2099, 0, 1, 0, i)).toISOString(), reminderMinutes: 0, isAllDay: false, isCompleted: false }));
    assert.equal(await n.service.reconcileReminders(async () => rows.reverse()), false);
    assert.equal([...n.scheduled.keys()].filter(id => id.startsWith('agenda-') || id.startsWith('weekly-')).length, 49);
    assert.ok(n.scheduled.has('agenda-event-0')); assert.ok(!n.scheduled.has('weekly-event-59'));
  });
  await check('a queued deletion wins over an older pending weekly reminder read', async () => {
    const n = native(); let release; const gate = new Promise(resolve => { release = resolve; });
    const first = n.service.reconcileReminders(async () => { await gate; return [{ id: 'old', kind: 'weekly', title: 'Old', startTime: '2099-01-01T10:00:00Z', reminderMinutes: 0, isAllDay: false, isCompleted: false }]; });
    const last = n.service.reconcileReminders(async () => []); release(); await Promise.all([first, last]);
    assert.deepEqual([...n.scheduled.keys()], ['managed-task-keep']);
  });
  await controllerChecks();
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} weekly reminder checks, ${failures} failures; native notifications mocked.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
