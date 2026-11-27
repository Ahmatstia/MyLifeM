const assert=require('node:assert/strict');
const {environment}=require('./check-integrity.cjs');
(async()=>{
 const env=environment({'@/features/agenda/data/services/calendar-reminder.service':{syncCalendarReminders:async()=>false}});
 try {
 await env.client.initDatabase();
 const {taskService:s}=env.load('src/features/tasks/data/task.service.ts');
 const {formatLocalDate,shiftDate}=env.load('src/shared/utils/local-date.ts');const today=formatLocalDate();
 const id=await s.create({title:'  Riset laporan  '});let task=(await s.list()).find(t=>t.id===id);
 assert.equal(task.title,'Riset laporan');assert.equal(task.estimate,null);assert.equal(task.dueDate,null);assert.equal(task.planningState,'INBOX');assert.deepEqual(task.selectedDates,[]);
 await assert.rejects(s.create({title:' '}));
 await assert.rejects(s.create({title:'X',estimatedMinutes:-1}));
 await assert.rejects(s.create({title:'X',deadlineTime:'13:00'}));
 await s.update(id,{title:'Laporan',estimatedMinutes:30,nextAction:'Tulis kerangka',dueDate:'2099-01-20'});
 await s.select(id,today);await s.select(id,today);task=(await s.list()).find(t=>t.id===id);assert.deepEqual(task.selectedDates,[today]);
 const beforeMove=env.state();env.fault(sql=>{if(sql.startsWith('delete from "daily_focus_items"'))throw new Error('Injected day move failure');});await assert.rejects(s.moveDay(id,today,shiftDate(today,1)));env.fault(()=>{});assert.equal(env.state(),beforeMove);
 await s.select(id,shiftDate(today,1));assert.equal((await s.list()).find(t=>t.id===id).selectedDates.length,2);
 for(let i=0;i<7;i++) await s.create({title:'Prioritas '+i},today);
 assert.equal((await s.list()).filter(t=>t.selectedDates.includes(today)).length,8);
 await s.schedule(id,'2099-01-01','10:00','2099-01-01','10:30',0);
 await s.schedule(id,'2099-01-02','23:30','2099-01-03','00:30',null);
 let blocks=await s.blocks(id);assert.equal(blocks.length,2);assert.equal((await s.list()).find(t=>t.id===id).dueDate,'2099-01-20');
 await s.schedule(id,'2099-01-03','11:00','2099-01-03','11:30',null,blocks[0].id);
 assert.equal((await s.blocks(id)).length,2);assert.equal((await s.list()).find(t=>t.id===id).dueDate,'2099-01-20');
 await assert.rejects(s.schedule(id,'2099-01-01','11:00','2099-01-01','10:00',0));
 await s.addStep(id,'Tulis judul');await s.toggleStep((await s.steps(id))[0].id);assert.equal((await s.list()).find(t=>t.id===id).status,'TODO');
 await s.setStatus(id,'COMPLETED');assert.ok((await s.blocks(id)).every(b=>b.isCompleted===1));
 await s.setStatus(id,'TODO');assert.ok((await s.blocks(id)).every(b=>b.isCompleted===0));
 await s.removeFromDay(id,today);assert.ok((await s.list()).find(t=>t.id===id));assert.deepEqual((await s.list()).find(t=>t.id===id).selectedDates,[shiftDate(today,1)]);
 await s.park(id,'SOMEDAY');assert.equal((await s.list()).find(t=>t.id===id).planningState,'SOMEDAY');
 assert.equal((await s.list()).find(t=>t.id===id).selectedDates.filter(d=>d>=today).length,0);
 await s.setCapacity(90);assert.equal(await s.plan(),90);await assert.rejects(s.setCapacity(-1));
 await s.saveReview(today,'Kerangka selesai','Waktu berubah','Lanjut pembahasan');assert.equal((await s.review()).note.nextAction,'Lanjut pembahasan');assert.ok((await s.review()).actions.length);
 assert.equal((await s.blocks(id)).length,0,'Parking cancels future blocks without removing the task');
 const {isTaskOverdue}=env.load('src/features/tasks/domain/deadline.ts');
 assert.equal(isTaskOverdue('2026-11-27',null,'TODO',new Date('2026-11-27T23:59:00')),false);
 assert.equal(isTaskOverdue('2026-11-27','10:00','TODO',new Date('2026-11-27T10:01:00')),true);
 const alarmId=await s.create({title:'Opt in alarm'});
 await s.schedule(alarmId,'2099-01-01','09:00','2099-01-01','09:30',0,undefined,true);
 assert.equal((await s.list()).find(t=>t.id===alarmId).dueDate,null);
 await s.schedule(alarmId,'2099-01-02','09:00','2099-01-02','09:30',null,'task-block-legacy-'+alarmId,true);
 assert.equal((await s.list()).find(t=>t.id===alarmId).profile.executionDate,'2099-01-02');
 await s.deleteBlock('task-block-legacy-'+alarmId);
 assert.equal((await s.list()).find(t=>t.id===alarmId).profile.alertMode,'NONE');
 const deleted=await s.create({title:'Deleted owner'});await s.schedule(deleted,'2099-01-01','08:00','2099-01-01','08:30',0);const deletedBlock=(await s.blocks(deleted))[0];
 env.raw.runSync('DELETE FROM tasks WHERE id=?',deleted);const retainedBlock=env.raw.getFirstSync('SELECT task_id,reminder_minutes,is_completed FROM agenda_events WHERE id=?',deletedBlock.id);
 assert.equal(retainedBlock.task_id,null);assert.equal(retainedBlock.reminder_minutes,null);assert.equal(retainedBlock.is_completed,1);
 const format=env.format,store=env.store;const backup=format.serializeBackup(store.readBackupData(env.raw));assert.equal(format.parseBackup(backup).schemaVersion,3);
 const decoded=format.parseBackup(backup);env.raw.withTransactionSync(()=>store.replaceBackupData(env.raw,decoded.data));assert.equal((await s.blocks(id)).length,0);assert.equal((await s.steps(id)).length,1);assert.equal((await s.review()).note.accomplishment,'Kerangka selesai');
 console.log('PASS: capture, validation, explicit daily selection, no hard cap, multiple work blocks, deadlines, steps, shared status, planning capacity, review/actions, backup v3 round-trip.');
 }finally{env.close();}
 await migrationCases();
})().catch(e=>{console.error(e);process.exitCode=1;});

async function migrationCases(){
 for(const fail of [false,true]){
  const e=environment();
  try{
   await e.client.initDatabase();
   const repo=e.load('src/features/task-manager/data/repositories/managed-task.repository.ts').managedTaskRepository;
   const record=await repo.createTask({title:'Legacy alarm',executionDate:'2099-01-01',executionTime:'09:00',deadlineDate:'2099-01-02',deadlineTime:'12:00',alertMode:'ALARM',alarmTrackId:'builtin-morning-chime',alarmTrackName:'Harmoni',subtasks:['Step']});
   const second={...record,id:'second-legacy',title:'Second legacy'};
   e.raw.runSync('INSERT INTO user_settings(key,value,updated_at) VALUES(?,?,?)','managed_tasks_v1',JSON.stringify([record,second]),new Date().toISOString());
   for(const table of ['task_actions','task_steps','task_profiles','day_reviews','day_plans'])e.raw.execSync('DROP TABLE '+table);
   e.raw.execSync('PRAGMA user_version=1');const before=e.state();
   if(fail)e.fault(sql=>{if(sql.startsWith('INSERT OR IGNORE INTO task_profiles'))throw new Error('Injected migration failure');});
   if(fail){await assert.rejects(e.retry());assert.equal(e.state(),before);e.fault(()=>{});}
   await e.retry();
   assert.equal(e.version(),2);assert.equal(e.raw.getAllSync('SELECT * FROM task_profiles').length,2);assert.equal(e.raw.getAllSync('SELECT * FROM task_steps').length,2);
   assert.ok(e.raw.getFirstSync('SELECT id FROM tasks WHERE id=?',record.id));
   assert.equal(e.raw.getFirstSync('SELECT value FROM user_settings WHERE key=?','managed_tasks_v1'),null);
   assert.ok(e.raw.getFirstSync('SELECT value FROM user_settings WHERE key=?','legacy_managed_tasks_v1'));
   const snapshot=e.state();await e.retry();assert.equal(e.state(),snapshot);
   const backup=e.format.serializeBackup(e.store.readBackupData(e.raw));assert.equal(e.format.parseBackup(backup).data.taskProfiles.length,2);
  }finally{e.close();}
 }
 console.log('PASS: v1 upgrade, rollback/retry, preserved task IDs/alarms, cross-task step-ID collisions, archived legacy data, idempotency and backup of migrated profiles.');
}
