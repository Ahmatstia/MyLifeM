// Production managed-task code; disposable SQLite and explicit notification/React mocks only.
const assert = require('node:assert/strict');
const { environment } = require('./check-integrity.cjs');
const { harness, tick } = require('./check-progress.cjs');
let checks = 0, failures = 0;
const repositoryFile = 'src/features/task-manager/data/repositories/managed-task.repository.ts';
const notificationStub = service => ({ '../services/task-alarm-notification.service': { TaskAlarmNotificationService: service } });
function input(e, title = 'Managed task') {
  return { title, executionDate: e.load('src/shared/utils/local-date.ts').formatLocalDate(new Date()), executionTime: '09:00',
    deadlineDate: '2099-12-31', deadlineTime: '23:59', alertMode: 'NONE', alarmTrackId: 'builtin-siren-energize',
    alarmTrackName: 'Built in', subtasks: ['Read', 'Write'] };
}
const metadata = e => e.raw.getAllSync('SELECT t.*,p.* FROM tasks t JOIN task_profiles p ON t.id=p.id').map(row=>({...row,isCompleted:['COMPLETED','DONE'].includes(row.status),snoozedUntilIso:row.snoozed_until_iso,subtasks:e.raw.getAllSync('SELECT id,title,is_completed FROM task_steps WHERE task_id=?',row.id).map(step=>({...step,isCompleted:!!step.is_completed}))}));
async function check(name, work, overrides) {
  const e = environment(overrides);
  try {
    await e.client.initDatabase();
    await work(e, e.load(repositoryFile).managedTaskRepository);
    checks++; console.log('PASS:', name);
  } catch (error) {
    failures++; console.error('FAIL:', name, error);
  } finally { e.close(); }
}
async function main() {
  for (const status of ['TODO', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED', 'DONE']) {
    await check(`refresh preserves authoritative ${status} status and completion flags`, async (e, repo) => {
      const task = await repo.createTask(input(e));
      const completed = ['COMPLETED', 'DONE'].includes(status);
      e.raw.runSync('UPDATE tasks SET status = ?, is_completed = ? WHERE id = ?', status, completed ? 0 : 1, task.id);
      if (status === 'CANCELLED') e.raw.runSync('DELETE FROM daily_focus_items WHERE task_id = ?', task.id);
      await repo.syncWithCoreTasksAndToday();
      const core = e.raw.getFirstSync('SELECT status, is_completed FROM tasks WHERE id = ?', task.id);
      assert.equal(core.status, status);
      assert.equal((await repo.getAllTasks())[0].isCompleted, completed);
      assert.equal((await repo.getAllTasks())[0].isCompleted, completed);
      const focus = e.raw.getAllSync('SELECT is_completed FROM daily_focus_items WHERE task_id = ?', task.id);
      if (status === 'CANCELLED') assert.equal(focus.length, 0);
      else assert.equal(focus.length, 0, 'Refresh must not auto-select a task');
    });
  }
  await check('explicit managed completion/reopen updates core, metadata and priorities on every date', async (e, repo) => {
    const task = await repo.createTask(input(e));
    const focus = e.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    await focus.addFocusItem('2099-01-01', task.id);
    for (const done of [true, false]) {
      await repo.toggleTaskCompletion(task.id);
      const core = e.raw.getFirstSync('SELECT status, is_completed, completed_at FROM tasks WHERE id = ?', task.id);
      assert.equal(core.status, done ? 'COMPLETED' : 'TODO');
      assert.equal(core.is_completed, done ? 1 : 0);
      assert.equal(Boolean(core.completed_at), done);
      assert.equal(metadata(e)[0].isCompleted, done);
      assert.ok(e.raw.getAllSync('SELECT is_completed FROM daily_focus_items WHERE task_id = ?', task.id).every(row => row.is_completed === (done ? 1 : 0)));
    }
  });
  await check('completion from Today is read before a metadata mutation and survives refresh', async (e, repo) => {
    const task = await repo.createTask(input(e));
    const focus = e.load('src/features/today-focus/data/repositories/daily-focus.repository.impl.ts').dailyFocusRepository;
    await focus.toggleTaskCompletion(task.id, true);
    await repo.toggleSubtask(task.id, task.subtasks[0].id);
    await repo.syncWithCoreTasksAndToday();
    assert.equal(metadata(e)[0].isCompleted, true);
    assert.equal(e.raw.getFirstSync('SELECT status FROM tasks WHERE id = ?', task.id).status, 'COMPLETED');
  });
  await check('two concurrent creates retain both metadata entries, core tasks and priorities', async (e, repo) => {
    const tasks = await Promise.all([repo.createTask(input(e, 'A')), repo.createTask(input(e, 'B'))]);
    assert.equal(new Set(tasks.map(task => task.id)).size, 2);
    assert.equal(metadata(e).length, 2);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM tasks').n, 2);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items').n, 0);
  });
  await check('concurrent subtask, snooze and create mutations retain every change', async (e, repo) => {
    const task = await repo.createTask(input(e));
    await Promise.all([repo.toggleSubtask(task.id, task.subtasks[0].id), repo.snoozeTaskAlarm(task.id, 10), repo.createTask(input(e, 'Second'))]);
    const list = metadata(e);
    assert.equal(list.length, 2);
    assert.equal(list.find(item => item.id === task.id).subtasks[0].isCompleted, true);
    assert.ok(list.find(item => item.id === task.id).snoozedUntilIso);
  });
  await check('concurrent delete/create leaves no orphan or resurrected metadata', async (e, repo) => {
    const task = await repo.createTask(input(e));
    const [, created] = await Promise.all([repo.deleteTask(task.id), repo.createTask(input(e, 'Retained'))]);
    assert.deepEqual(metadata(e).map(item => item.id), [created.id]);
    assert.deepEqual(e.raw.getAllSync('SELECT id FROM tasks').map(row => row.id), [created.id]);
    assert.equal(e.raw.getFirstSync('SELECT count(*) n FROM daily_focus_items WHERE task_id = ?', task.id).n, 0);
  });
  for (const [label, sql, action] of [
    ['core insert', /^insert into "tasks"/i, (repo, e) => repo.createTask(input(e, 'Failure'))],
    ['metadata write', /^insert into "task_profiles"/i, (repo, e) => repo.createTask(input(e, 'Failure'))],
    ['step insert', /^insert into "task_steps"/i, (repo, e) => repo.createTask(input(e, 'Failure'))],
    ['core status update', /^update "tasks"/i, (repo, _e, task) => repo.toggleTaskCompletion(task.id)],
    ['priority status update', /^update "daily_focus_items"/i, (repo, _e, task) => repo.toggleTaskCompletion(task.id)],
    ['core delete', /^delete from "tasks"/i, (repo, _e, task) => repo.deleteTask(task.id)],
    ['commit', /^commit$/i, (repo, e) => repo.createTask(input(e, 'Failure'))],
    ['metadata read', /from "task_profiles"/i, (repo, e) => repo.createTask(input(e, 'Failure'))],
  ]) {
    let notifications = 0;
    await check(`${label} failure rejects and rolls back the entire managed mutation`, async (e, repo) => {
      const task = await repo.createTask(input(e));
      const before = e.state(), notificationCount = notifications;
      let published = 0;
      const unsubscribe = e.load(repositoryFile).subscribeManagedTasksChange(() => published++);
      try {
        e.fault(statement => { if (sql.test(statement)) throw new Error('Injected ' + label); });
        await assert.rejects(action(repo, e, task), error => {
          assert.match(error.cause?.message || error.message, /Injected/);
          return true;
        });
        e.fault(() => {});
        assert.equal(e.state(), before);
        assert.equal(notifications, notificationCount);
        assert.equal(published, 0);
      } finally { unsubscribe(); e.fault(() => {}); }
    }, notificationStub({ reconcileTaskAlarms: async () => { notifications++; } }));
  }
  for (const invalid of ['{', '{}', '[null]']) {
    await check(`unreadable managed metadata ${invalid} is preserved instead of overwritten`, async (e, repo) => {
      await repo.createTask(input(e));
      e.raw.runSync("INSERT INTO user_settings(key,value,updated_at) VALUES('managed_tasks_v1',?,?)", invalid,new Date().toISOString());
      const before = e.state();
      assert.throws(()=>e.raw.withTransactionSync(()=>e.load('src/db/task-planning-migration.ts').migrateTaskPlanning(e.raw)));
      assert.equal(e.state(), before);
    });
  }
  await check('notification failure after commit does not report a failed save', async (e, repo) => {
    const task = await repo.createTask(input(e));
    assert.equal(metadata(e)[0].id, task.id);
    assert.equal(e.raw.getFirstSync('SELECT id FROM tasks WHERE id = ?', task.id).id, task.id);
  }, notificationStub({ reconcileTaskAlarms: async () => { throw new Error('Injected notification failure'); } }));
  {
    const snapshots = []; let release, active = 0, maxActive = 0;
    await check('notification reconciliations are serialized and finish with the latest committed tasks', async (e, repo) => {
      const first = repo.createTask(input(e, 'First'));
      await tick();
      const firstTask = (await repo.getAllTasks())[0];
      const second = repo.createTask(input(e, 'Second'));
      const deleted = repo.deleteTask(firstTask.id);
      release();
      const [, secondTask] = await Promise.all([first, second, deleted]);
      assert.equal(maxActive, 1);
      assert.deepEqual(snapshots.at(-1), [secondTask.id]);
    }, notificationStub({ reconcileTaskAlarms: async list => {
      active++; maxActive = Math.max(active, maxActive);
      try {
        snapshots.push(list.map(item => item.id));
        if (snapshots.length === 1) await new Promise(resolve => { release = resolve; });
      } finally { active--; }
    } }));
  }
  await check('managed hook exposes save/toggle/subtask/delete errors without rejecting UI event promises', async () => {
    const fail = async () => { throw new Error('Write failed'); };
    let releaseRead;
    const h = harness({
      '../../data/repositories/managed-task.repository': { managedTaskRepository: {
        syncWithCoreTasksAndToday: async () => {}, getAllTasks: () => new Promise(resolve => { releaseRead = resolve; }), getAllAlarmTracks: async () => [],
        createTask: fail, toggleTaskCompletion: fail, toggleSubtask: fail, deleteTask: fail,
      }, subscribeManagedTasksChange: () => () => {} },
      '../../data/services/task-alarm-notification.service': { TaskAlarmNotificationService: {}, subscribeTaskAlarmStatus: () => () => {} },
      '../../data/services/task-alarm-audio.service': { TaskAlarmAudioService: { stopPreview: () => {} } },
    });
    const hook = h.load('src/features/task-manager/presentation/hooks/use-managed-tasks.ts').useManagedTasks;
    try {
      h.render(hook); await tick();
      assert.equal(await h.render(hook).addTask({}), false);
      assert.match(h.render(hook).error, /Write failed/);
      releaseRead([]); await tick();
      assert.match(h.render(hook).error, /Write failed/, 'An older successful load must not hide a newer mutation error.');
      for (const action of ['toggleTask', 'toggleSubtask', 'deleteTask']) {
        await assert.doesNotReject(h.render(hook)[action]('task', 'subtask'));
        assert.match(h.render(hook).error, /Write failed/);
      }
    } finally { h.close(); }
  });
  console.log(`${failures ? 'FAIL' : 'PASS'}: ${checks} managed-task checks, ${failures} failures; no user database or native notifications accessed.`);
  if (failures) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
