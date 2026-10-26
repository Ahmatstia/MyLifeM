// Production repositories/helpers with disposable SQLite and deterministic device/notification mocks.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { loader } = require('./check-backup.cjs');
const load = loader();
const dates = load('src/shared/utils/local-date.ts');
const agendaTime = load('src/features/agenda/domain/agenda-time.ts');
const originalTZ = process.env.TZ;
let checks = 0;
function passed(name) { checks++; console.log('PASS:', name); }
async function repositoryChecks() {
  for (const zone of ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']) {
    process.env.TZ = zone;
    const env = environment(); await env.client.initDatabase();
    const agenda = env.load('src/features/agenda/data/repositories/agenda.repository.impl.ts').agendaRepository;
    const focus = env.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    const make = (startTime, endTime, extra = {}) => agenda.createEvent({ title: 'Study', startTime, endTime, reminderMinutes: null, ...extra });
    const early = await make('2026-10-26T00:30:00', '2026-10-26T01:30:00');
    assert.equal(early.startTime, dates.localTimeToIso('2026-10-26', '00:30'));
    assert.equal((await agenda.getEventsForDate('2026-10-26')).length, 1);
    assert.equal((await agenda.getEventsForDate('2026-10-25')).length, 0);
    const overnight = await make('2026-10-25T23:30:00', '2026-10-26T01:00:00');
    assert.ok((await agenda.getEventsForDate('2026-10-25')).some(event => event.id === overnight.id));
    assert.ok((await agenda.getEventsForDate('2026-10-26')).some(event => event.id === overnight.id));
    const midnightEnd = await make('2026-10-25T23:00:00', '2026-10-26T00:00:00');
    assert.ok(!(await agenda.getEventsForDate('2026-10-26')).some(event => event.id === midnightEnd.id));
    const nextDay = await make('2026-10-27T00:00:00', '2026-10-27T01:00:00');
    assert.ok(!(await agenda.getEventsForDate('2026-10-26')).some(event => event.id === nextDay.id));
    passed(zone + ': local 00:30, overnight overlap and exclusive midnight boundaries');
    const allDay = await make('2026-10-26', '2026-10-27', { isAllDay: true, reminderMinutes: 0 });
    assert.equal(allDay.startTime, '2026-10-26'); assert.equal(allDay.reminderMinutes, null);
    assert.ok((await agenda.getEventsForDate('2026-10-26')).some(event => event.id === allDay.id));
    assert.ok(!(await agenda.getEventsForDate('2026-10-27')).some(event => event.id === allDay.id));
    env.raw.runSync('UPDATE agenda_events SET start_time = ?, end_time = ? WHERE id = ?', ['2026-10-26T00:00:00.000Z', '2026-10-26T23:59:59.000Z', allDay.id]);
    assert.ok((await agenda.getEventsForDate('2026-10-26')).some(event => event.id === allDay.id));
    assert.ok(!(await agenda.getEventsForDate('2026-10-27')).some(event => event.id === allDay.id));
    const rawBefore = env.raw.getFirstSync('SELECT start_time, end_time FROM agenda_events WHERE id = ?', allDay.id);
    await agenda.getEventsForDate('2026-10-26');
    assert.deepEqual(env.raw.getFirstSync('SELECT start_time, end_time FROM agenda_events WHERE id = ?', allDay.id), rawBefore);
    passed(zone + ': date-only and legacy UTC all-day records stay on their intended calendar date without rewriting');
    env.raw.runSync('UPDATE agenda_events SET start_time = ?, end_time = ? WHERE id = ?', ['2026-10-25T23:30:00', '2026-10-26T01:00:00', overnight.id]);
    assert.ok((await agenda.getEventsForDate('2026-10-26')).some(event => event.id === overnight.id));
    passed(zone + ': offset-less legacy wall times remain readable across midnight');
    await focus.saveFocusSession({ taskId: null, mode: 'POMODORO', startedAt: dates.localTimeToIso('2026-10-26', '00:30'), endedAt: dates.localTimeToIso('2026-10-26', '01:00'), durationMinutes: 30 });
    await focus.saveFocusSession({ taskId: null, mode: 'POMODORO', startedAt: dates.localTimeToIso('2026-10-25', '23:30'), endedAt: dates.localTimeToIso('2026-10-26', '00:15'), durationMinutes: 45 });
    assert.equal(await focus.getTodayCompletedMinutes('2026-10-26'), 30);
    assert.equal(await focus.getTodayCompletedMinutes('2026-10-25'), 45);
    passed(zone + ': focus minutes follow local session start day, including cross-midnight sessions');
    const disabled = await make('2099-10-26T09:00:00', '2099-10-26T10:00:00', { reminderMinutes: null });
    const zero = await make('2099-10-26T09:00:00', '2099-10-26T10:00:00', { reminderMinutes: 0 });
    const defaulted = await make('2099-10-26T09:00:00', '2099-10-26T10:00:00', { reminderMinutes: undefined });
    assert.deepEqual([disabled.reminderMinutes, zero.reminderMinutes, defaulted.reminderMinutes], [null, 0, 10]);
    assert.ok(!(await agenda.getReminderEvents()).some(event => event.id === disabled.id || event.id === allDay.id));
    passed(zone + ': null, zero and default reminders survive storage/read without conflation');
    env.close();
  }
  process.env.TZ = 'Asia/Jakarta';
  const env = environment(); await env.client.initDatabase();
  const agenda = env.load('src/features/agenda/data/repositories/agenda.repository.impl.ts').agendaRepository;
  const valid = { title: 'Valid', startTime: '2026-10-26T09:00:00+07:00', endTime: '2026-10-26T10:00:00+07:00' };
  for (const patch of [{ title: ' ' }, { startTime: '2026-02-30T09:00:00Z' }, { startTime: '2026-10-26T24:00:00' }, { endTime: valid.startTime }, { endTime: '2026-10-26T08:00:00+07:00' }, { eventType: 'MAGIC' }, ...[-1, 1.5, NaN, Infinity].map(reminderMinutes => ({ reminderMinutes })), { isAllDay: true }]) {
    await assert.rejects(agenda.createEvent({ ...valid, ...patch }));
    assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM agenda_events').n, 0);
  }
  await assert.rejects(agenda.getEventsForDate('2026-02-30'));
  passed('invalid title, calendar, clock, ranges, event type, reminder values and query dates fail before writes');
  const focus = env.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
  await assert.rejects(focus.createQuickTask('bad date', '2026-02-30'));
  await assert.rejects(focus.saveFocusSession({ mode: 'POMODORO', startedAt: '2026-10-26', endedAt: '2026-10-27', durationMinutes: 30 }));
  await assert.rejects(focus.saveFocusSession({ mode: 'POMODORO', startedAt: '2026-10-26T10:00:00Z', endedAt: '2026-10-26T09:00:00Z', durationMinutes: 30 }));
  assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM tasks').n, 0); assert.equal(env.raw.getFirstSync('SELECT count(*) n FROM focus_sessions').n, 0);
  passed('daily priorities and focus timestamps reject impossible dates/missing clocks/reversed sessions before committing');
  const offset = await agenda.createEvent(valid);
  assert.equal(offset.startTime, '2026-10-26T02:00:00.000Z');
  const allDay = await agenda.createEvent({ title: 'Whole day', isAllDay: true, startTime: '2026-10-26', endTime: '2026-10-27' });
  process.env.TZ = 'America/New_York';
  assert.ok((await agenda.getEventsForDate('2026-10-26')).some(event => event.id === allDay.id));
  assert.ok((await agenda.getEventsForDate('2026-10-25')).some(event => event.id === offset.id));
  passed('travelling zones moves timed instants while all-day calendar dates stay fixed');
  assert.equal(dates.localDayBounds('2026-03-08').end - dates.localDayBounds('2026-03-08').start, 23 * 3600_000);
  assert.equal(dates.localDayBounds('2026-11-01').end - dates.localDayBounds('2026-11-01').start, 25 * 3600_000);
  assert.throws(() => dates.localTimeToIso('2026-03-08', '02:30'));
  assert.equal(dates.localTimeToIso('2026-11-01', '01:30'), '2026-11-01T05:30:00.000Z');
  assert.equal(dates.shiftDate('2028-02-28', 1), '2028-02-29');
  assert.equal(dates.shiftDate('2026-12-31', 1), '2027-01-01');
  assert.deepEqual(agendaTime.allDayDates('2026-10-26T00:00:00+07:00', '2026-10-27T00:00:00+07:00'), { start: '2026-10-26', end: '2026-10-27' });
  passed('23/25-hour DST days, nonexistent clocks, repeated clocks, leap day and year rollover');
  const row = { ...offset, isCompleted: false };
  const timed = (id, hour, endHour) => ({ ...row, id, startTime: `2026-10-26T${hour}:00:00Z`, endTime: `2026-10-26T${endHour}:00:00Z` });
  assert.deepEqual([...agendaTime.conflictingEventIds([timed('a', '01', '02'), timed('b', '02', '03')])], []);
  assert.deepEqual([...agendaTime.conflictingEventIds([timed('a', '01', '05'), timed('b', '02', '03'), timed('c', '03', '04')])].sort(), ['a', 'b', 'c']);
  assert.equal(agendaTime.conflictingEventIds([{ ...timed('a', '01', '05'), isCompleted: true }, timed('b', '02', '03'), allDay]).size, 0);
  passed('overlap flags nesting/chains, excludes completed/all-day events and allows adjacent boundaries');
  env.close();
}
function nativeMock(status = 'granted', os = 'android') {
  const scheduled = new Map([['unrelated', { identifier: 'unrelated' }], ['agenda-old', { identifier: 'agenda-old' }]]);
  const calls = [];
  let permission = { status, canAskAgain: true }, exact = { granted: true, canAskAgain: true }, handler;
  const notifications = {
    setNotificationHandler: value => { handler = value; },
    setNotificationChannelAsync: async () => { calls.push('channel'); }, AndroidImportance: { DEFAULT: 3 }, IosAuthorizationStatus: { PROVISIONAL: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
    getPermissionsAsync: async () => { calls.push('permission'); return permission; },
    requestPermissionsAsync: async () => { calls.push('request'); return permission; },
    getExactAlarmPermissionsAsync: async () => exact,
    requestExactAlarmPermissionsAsync: async () => { calls.push('exact settings'); return exact; },
    getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
    cancelScheduledNotificationAsync: async id => { scheduled.delete(id); calls.push('cancel ' + id); },
    scheduleNotificationAsync: async input => { scheduled.set(input.identifier, input); return input.identifier; },
  };
  const service = loader({ 'react-native': { Platform: { OS: os } }, 'expo-notifications': notifications })('src/features/agenda/data/services/agenda-notification.service.ts').AgendaNotificationService;
  return { service, notifications, scheduled, calls, permission: value => { permission = value; }, exact: value => { exact = value; }, handler: () => handler };
}
async function notificationChecks() {
  const event = { id: 'new', title: 'Study', isAllDay: false, isCompleted: false, startTime: '2099-10-26T03:00:00Z', reminderMinutes: 0 };
  const mock = nativeMock();
  assert.equal(await mock.service.reconcileReminders(async () => [event]), true);
  assert.ok(mock.scheduled.has('unrelated') && !mock.scheduled.has('agenda-old'));
  const request = mock.scheduled.get('agenda-new');
  assert.equal(request.trigger.date.getTime(), Date.parse(event.startTime)); assert.equal(request.trigger.channelId, 'agenda');
  assert.ok(request.content.body.includes('dimulai sekarang'));
  assert.equal((await mock.handler().handleNotification()).shouldShowBanner, true);
  assert.equal(mock.calls.includes('request'), false);
  passed('zero-minute scheduling, Android channel, foreground presentation and selective reconciliation');
  const denied = nativeMock('denied');
  assert.equal(await denied.service.reconcileReminders(async () => [event]), false); assert.equal(denied.calls.includes('request'), false);
  assert.equal(await denied.service.reconcileReminders(async () => [event], true), false);
  assert.ok(denied.calls.indexOf('channel') < denied.calls.indexOf('request'));
  denied.permission({ status: 'denied', canAskAgain: false }); denied.calls.length = 0;
  assert.equal(await denied.service.scheduleReminder('blocked', '', event.startTime, 0), null); assert.equal(denied.calls.includes('request'), false);
  passed('denial is not mistaken for iOS provisional permission; passive refresh never prompts, permanently denied permission is respected');
  const ios = nativeMock('denied', 'ios'); ios.permission({ status: 'denied', canAskAgain: false, ios: { status: 3 } });
  assert.equal(await ios.service.requestPermissions(false), true); assert.equal(ios.calls.includes('channel'), false);
  mock.exact({ granted: false, canAskAgain: true });
  assert.equal(await mock.service.reconcileReminders(async () => [event]), false);
  assert.ok(mock.scheduled.has('agenda-new')); assert.equal(mock.calls.includes('exact settings'), false);
  await mock.service.requestExactAlarmPermission(); assert.ok(mock.calls.includes('exact settings'));
  mock.exact({ granted: true, canAskAgain: true });
  passed('iOS provisional permission is accepted; Android approximate delivery reports a warning and opens exact-alarm settings only on explicit request');
  for (const minutes of [null, -1, NaN, Infinity, 1.5]) assert.equal(await mock.service.scheduleReminder('invalid', '', event.startTime, minutes), null);
  assert.equal(await mock.service.scheduleReminder('invalid-time', '', 'not a date', 0), null);
  assert.equal(await mock.service.scheduleReminder('past', '', '2000-01-01T00:00:00Z', 0), null);
  assert.equal(await mock.service.reconcileReminders(async () => [{ ...event, reminderMinutes: null }, { ...event, isCompleted: true }]), true);
  assert.ok(!mock.scheduled.has('agenda-new'));
  passed('disabled, invalid and past reminders are skipped, completion cancels pending reminders');
  const web = loader({ 'react-native': { Platform: { OS: 'web' } } })('src/features/agenda/data/services/agenda-notification.service.ts').AgendaNotificationService;
  assert.equal(await web.reconcileReminders(async () => [event]), false); assert.equal(await web.reconcileReminders(async () => []), true);
  const unavailable = loader({ 'react-native': { Platform: { OS: 'android' } }, 'expo-notifications': null })('src/features/agenda/data/services/agenda-notification.service.ts').AgendaNotificationService;
  assert.equal(await unavailable.reconcileReminders(async () => [event]), false);
  assert.equal(await mock.service.reconcileReminders(async () => { throw new Error('read failure'); }), false);
  passed('web, unavailable native modules and reconciliation errors report failure without throwing into a save');
  let release; const gate = new Promise(resolve => { release = resolve; });
  const first = mock.service.reconcileReminders(async () => { await gate; return [event]; });
  const second = mock.service.reconcileReminders(async () => []);
  release(); await Promise.all([first, second]);
  assert.ok(!mock.scheduled.has('agenda-new') && mock.scheduled.has('unrelated'));
  passed('serialized reconciliation lets the later deletion win over a stale in-flight schedule');
  const many = Array.from({ length: 60 }, (_, i) => ({ ...event, id: 'bulk-' + i, startTime: new Date(Date.parse(event.startTime) + i * 60_000).toISOString() }));
  assert.equal(await mock.service.reconcileReminders(async () => [...many].reverse()), false);
  assert.equal([...mock.scheduled.keys()].filter(key => key.startsWith('agenda-')).length, 50);
  assert.ok(mock.scheduled.has('agenda-bulk-0') && !mock.scheduled.has('agenda-bulk-59'));
  passed('large imports schedule only 50 nearest reminders and report partial coverage instead of overloading native limits');
}

function hookHarness(stubs = {}) {
  const values = [], dependencies = [], cleanups = [], effects = [];
  let index = 0;
  const React = {
    useState(initial) { const i = index++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], value => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; },
    useRef(initial) { const i = index++; return values[i] ??= { current: initial }; },
    useCallback(callback, next) { const i = index++; if (!dependencies[i] || next.some((value, j) => value !== dependencies[i][j])) { values[i] = callback; dependencies[i] = next; } return values[i]; },
    useEffect(callback, next) { const i = index++; if (!dependencies[i] || next.some((value, j) => value !== dependencies[i][j])) { effects.push(() => { cleanups[i]?.(); cleanups[i] = callback(); }); dependencies[i] = next; } },
  };
  const load = loader({ react: React, 'expo-router': { useFocusEffect: callback => React.useEffect(callback, [callback]) }, ...stubs });
  return { load, render(hook) { index = 0; const result = hook(); while (effects.length) effects.shift()(); return result; }, cleanup() { cleanups.forEach(cleanup => cleanup?.()); } };
}
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
async function hookChecks() {
  let calendar = { date: '2026-10-26', key: '26', zone: 'Asia/Jakarta' };
  const pending = new Map();
  const harness = hookHarness({ '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => calendar },
    '../../data/repositories/daily-focus.repository.impl': { dailyFocusRepository: {
      getTodayFocusItems: date => new Promise(resolve => pending.set(date, resolve)), getTodayCompletedMinutes: async () => 0, getAvailableTasks: async () => [],
    } } });
  const hook = harness.load('src/features/today-focus/presentation/hooks/use-today-focus.ts').useTodayFocus;
  const first = harness.render(hook);
  calendar = { ...calendar, date: '2026-10-27', key: '27' }; harness.render(hook);
  pending.get('2026-10-27')(['new']); await tick(); pending.get('2026-10-26')(['old']); await tick();
  assert.deepEqual(harness.render(hook).focusItems, ['new']); await first.refresh();
  assert.deepEqual(harness.render(hook).focusItems, ['new']); harness.cleanup();
  passed('Today reloads after rollover and ignores late requests/mutations from the previous date');

  calendar = { date: '2026-10-26', key: '26', zone: 'Asia/Jakarta' };
  let saved = 0, throws = false, failsWrite = false; const calls = [];
  const agendaPending = new Map(); let defer = false;
  const a = hookHarness({ '@/shared/hooks/use-device-calendar': { useDeviceCalendar: () => calendar },
    '../../data/repositories/agenda.repository.impl': { agendaRepository: {
      getEventsForDate: async date => defer ? new Promise(resolve => agendaPending.set(date, resolve)) : [], getReminderEvents: async () => [],
      createEvent: async input => { if (failsWrite) throw new Error('disk full'); saved++; return { ...input, id: 'new', isCompleted: false, isAllDay: false }; },
      deleteEvent: async () => { calls.push('delete'); }, toggleEventCompletion: async (_id, completed) => { calls.push('toggle ' + completed); },
    } },
    '../../data/services/agenda-notification.service': { AgendaNotificationService: { reconcileReminders: async () => { calls.push('sync'); if (throws) throw new Error('native failure'); return true; } } },
  });
  const agendaHook = a.load('src/features/agenda/presentation/hooks/use-agenda.ts').useAgenda;
  a.render(agendaHook); await tick(); calendar = { ...calendar, date: '2026-10-27', key: '27' }; a.render(agendaHook); a.render(agendaHook); await tick();
  assert.equal(a.render(agendaHook).selectedDate, '2026-10-27');
  a.render(agendaHook).setSelectedDate('2026-10-20'); a.render(agendaHook);
  calendar = { ...calendar, date: '2026-10-28', key: '28' }; a.render(agendaHook); await tick();
  assert.equal(a.render(agendaHook).selectedDate, '2026-10-20');
  passed('Agenda follows midnight only when viewing today and preserves a deliberately browsed date');
  defer = true; a.render(agendaHook).setSelectedDate('2026-10-21'); a.render(agendaHook);
  a.render(agendaHook).setSelectedDate('2026-10-22'); a.render(agendaHook);
  agendaPending.get('2026-10-22')(['new']); await tick(); agendaPending.get('2026-10-21')(['old']); await tick();
  assert.deepEqual(a.render(agendaHook).events, ['new']); defer = false;
  throws = true;
  assert.equal(await a.render(agendaHook).addEvent({ title: 'saved', startTime: '2099-10-26T03:00:00Z', endTime: '2099-10-26T04:00:00Z', reminderMinutes: 0 }), true);
  assert.equal(saved, 1); assert.match(a.render(agendaHook).reminderWarning, /Agenda tetap tersimpan/);
  failsWrite = true; assert.equal(await a.render(agendaHook).addEvent({}), false); assert.equal(saved, 1); assert.equal(a.render(agendaHook).error, 'disk full');
  passed('late Agenda responses are ignored; a committed save succeeds despite notification failure, a failed write stays failed');
  calls.length = 0; await a.render(agendaHook).removeEvent('new'); assert.deepEqual(calls.slice(0, 2), ['delete', 'sync']);
  calls.length = 0; await a.render(agendaHook).toggleEvent('new', true); assert.deepEqual(calls.slice(0, 2), ['toggle false', 'sync']);
  a.cleanup(); passed('delete/reopen commit before reconciling reminders');
}
function clockChecks() {
  process.env.TZ = 'Asia/Jakarta';
  const OriginalDate = globalThis.Date, set = globalThis.setTimeout, clear = globalThis.clearTimeout;
  let now = OriginalDate.parse('2026-10-26T23:59:59+07:00'), active, removed = false, sequence = 0;
  const timers = new Map();
  try {
    globalThis.Date = class extends OriginalDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
    globalThis.setTimeout = (callback, delay) => { const id = ++sequence; timers.set(id, { callback, delay }); return id; };
    globalThis.clearTimeout = id => timers.delete(id);
    const h = hookHarness({ 'react-native': { AppState: { addEventListener: (_event, callback) => { active = callback; return { remove: () => { removed = true; } }; } } } });
    const hook = h.load('src/shared/hooks/use-device-calendar.ts').useDeviceCalendar;
    const first = h.render(hook); assert.equal(first.date, '2026-10-26'); assert.ok([...timers.values()][0].delay < 2000);
    now += 2000; [...timers.values()][0].callback(); assert.equal(h.render(hook).date, '2026-10-27');
    const before = h.render(hook).key; active('active'); assert.notEqual(h.render(hook).key, before);
    process.env.TZ = 'Asia/Makassar'; active('active'); assert.equal(h.render(hook).offset, -480);
    h.cleanup(); assert.ok(removed); assert.equal(timers.size, 0);
    passed('device calendar updates at midnight, on resume/time-zone change, and cleans timers/listeners');
  } finally { globalThis.Date = OriginalDate; globalThis.setTimeout = set; globalThis.clearTimeout = clear; }
}
async function main() { await repositoryChecks(); await notificationChecks(); await hookChecks(); clockChecks(); console.log(`PASS: ${checks} calendar/agenda checks. No user database or native notifications accessed.`); }
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { if (originalTZ === undefined) delete process.env.TZ; else process.env.TZ = originalTZ; });
