import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { tasks, taskProfiles, taskSteps, dailyFocusItems, agendaEvents, dayPlans, dayReviews, taskActions, targets, stages, focusSessions } from '@/db/schema';
import { normalizeTaskStatus, type TaskStatus } from '@/shared/domain/task-status';
import { writeTaskStatus } from '@/shared/data/task-status';
import { formatLocalDate, isDateOnly, isTimeOnly, localTimeToIso, shiftDate } from '@/shared/utils/local-date';
import { syncCalendarReminders } from '@/features/agenda/data/services/calendar-reminder.service';
import { managedTaskRepository } from '@/features/task-manager/data/repositories/managed-task.repository';

export const taskId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'task-'+Date.now()+'-'+Math.random().toString(36).slice(2);
export type PlanningState = 'INBOX' | 'READY' | 'SOMEDAY' | 'WAITING';
export interface TaskDraft { title:string; description?:string; targetId?:string|null; nextAction?:string; estimatedMinutes?:number|null; dueDate?:string|null; deadlineTime?:string|null; priority?:'LOW'|'MEDIUM'|'HIGH'|'URGENT' }
export type UnifiedTask = Awaited<ReturnType<typeof taskService.list>>[number];
const now = () => new Date().toISOString();
function date(value:string) { if (!isDateOnly(value)) throw new Error('Tanggal harus valid dalam format TTTT-BB-HH.'); }
function validate(input:TaskDraft) {
 if (!input.title.trim()) throw new Error('Nama tugas belum diisi.');
 if (input.title.length>500) throw new Error('Nama tugas maksimal 500 karakter.');
 if (input.estimatedMinutes != null && (!Number.isSafeInteger(input.estimatedMinutes)||input.estimatedMinutes<1||input.estimatedMinutes>1440)) throw new Error('Estimasi harus 1–1440 menit atau kosong.');
 if (input.dueDate) date(input.dueDate);
 if (input.deadlineTime && (!input.dueDate || !isTimeOnly(input.deadlineTime))) throw new Error('Jam tenggat memerlukan tanggal dan format HH:mm.');
 if (input.priority && !['LOW','MEDIUM','HIGH','URGENT'].includes(input.priority)) throw new Error('Prioritas tidak valid.');
}
function action(tx:Pick<typeof db, 'select'|'insert'>,id:string,kind:string,day=formatLocalDate()) {
 const task=tx.select().from(tasks).where(eq(tasks.id,id)).get();
 if (!task) throw new Error('Tugas tidak ditemukan.');
 tx.insert(taskActions).values({id:taskId(),taskId:id,taskTitle:task.title,date:day,action:kind,createdAt:now()}).run();
}
async function sync() { await managedTaskRepository.syncAlarms(); await syncCalendarReminders(); }
export const taskService = {
 async list() {
  const profiles=new Map(db.select().from(taskProfiles).all().map(p=>[p.id,p]));
  const targetMap=new Map(db.select().from(targets).all().map(t=>[t.id,t.title]));
  const stageMap=new Map(db.select().from(stages).all().map(t=>[t.id,t.targetId]));
  const selected=db.select().from(dailyFocusItems).all();
  return db.select().from(tasks).orderBy(desc(tasks.updatedAt)).all().map(task=>{
   const profile=profiles.get(task.id);
   const owner=task.targetId ?? (task.stageId ? stageMap.get(task.stageId) : null);
   return {...task,status:normalizeTaskStatus(task.status),profile,planningState:(profile?.planningState ?? 'READY') as PlanningState,
    estimate:profile ? profile.estimateKnown ? task.estimatedMinutes : null : task.estimatedMinutes,
    targetName:owner ? targetMap.get(owner) ?? null : null, owner:owner ?? null,
    selectedDates:selected.filter(p=>p.taskId===task.id).map(p=>p.date)};
  });
 },
 async create(input:TaskDraft,day?:string) {
  validate(input); if(day)date(day); const id=taskId();
  db.transaction(tx=>{
   if(input.targetId&&!tx.select().from(targets).where(eq(targets.id,input.targetId)).get())throw new Error('Target tidak ditemukan.');
   tx.insert(tasks).values({id,title:input.title.trim(),name:input.title.trim(),description:input.description?.trim()||null,targetId:input.targetId||null,
    priority:input.priority??'MEDIUM',estimatedMinutes:input.estimatedMinutes??0,estimatedHours:(input.estimatedMinutes??0)/60,dueDate:input.dueDate||null,createdAt:now(),updatedAt:now()}).run();
   tx.insert(taskProfiles).values({id,planningState:day?'READY':'INBOX',nextAction:input.nextAction?.trim()||null,estimateKnown:Number(input.estimatedMinutes!=null),deadlineTime:input.deadlineTime||null}).run();
   if(day){tx.insert(dailyFocusItems).values({id:taskId(),taskId:id,date:day,sortOrder:tx.select().from(dailyFocusItems).where(eq(dailyFocusItems.date,day)).all().length,createdAt:now()}).run();action(tx,id,'SELECT',day);}
  }); return id;
 },
 async update(id:string,input:TaskDraft) {
  validate(input);
  db.transaction(tx=>{
   const current=tx.select().from(tasks).where(eq(tasks.id,id)).get();if(!current)throw new Error('Tugas tidak ditemukan.');
   if(input.targetId&&!tx.select().from(targets).where(eq(targets.id,input.targetId)).get())throw new Error('Target tidak ditemukan.');
   const stage=current.stageId?tx.select().from(stages).where(eq(stages.id,current.stageId)).get():null;
   const owner=current.targetId??stage?.targetId;
   tx.update(tasks).set({title:input.title.trim(),name:input.title.trim(),description:input.description?.trim()||null,targetId:input.targetId||null,
    stageId:owner===(input.targetId||null)?current.stageId:null,priority:input.priority??current.priority,estimatedMinutes:input.estimatedMinutes??0,
    estimatedHours:(input.estimatedMinutes??0)/60,dueDate:input.dueDate||null,updatedAt:now()}).where(eq(tasks.id,id)).run();
   const fields={id,planningState:'READY',nextAction:input.nextAction?.trim()||null,estimateKnown:Number(input.estimatedMinutes!=null),deadlineTime:input.deadlineTime||null};
   tx.insert(taskProfiles).values(fields).onConflictDoUpdate({target:taskProfiles.id,set:fields}).run();
   tx.update(agendaEvents).set({title:input.title.trim(),updatedAt:now()}).where(eq(agendaEvents.taskId,id)).run();
  }); await sync();
 },
 async select(id:string,day=formatLocalDate()) {
  date(day);db.transaction(tx=>{
   const task=tx.select().from(tasks).where(eq(tasks.id,id)).get();if(!task||!['TODO','IN_PROGRESS'].includes(normalizeTaskStatus(task.status)))throw new Error('Pilih tugas aktif.');
   if(tx.select().from(dailyFocusItems).where(and(eq(dailyFocusItems.taskId,id),eq(dailyFocusItems.date,day))).get())return;
   tx.insert(dailyFocusItems).values({id:taskId(),taskId:id,date:day,sortOrder:tx.select().from(dailyFocusItems).where(eq(dailyFocusItems.date,day)).all().length,createdAt:now()}).run();
   tx.insert(taskProfiles).values({id,planningState:'READY',estimateKnown:1}).onConflictDoUpdate({target:taskProfiles.id,set:{planningState:'READY'}}).run();action(tx,id,'SELECT',day);
  });
 },
 async moveDay(id:string,from:string,to:string) {
  date(from);date(to);if(from===to)return;
  db.transaction(tx=>{
   const task=tx.select().from(tasks).where(eq(tasks.id,id)).get();if(!task||!['TODO','IN_PROGRESS'].includes(normalizeTaskStatus(task.status)))throw new Error('Pilih tugas aktif.');
   if(!tx.select().from(dailyFocusItems).where(and(eq(dailyFocusItems.taskId,id),eq(dailyFocusItems.date,to))).get()){
    tx.insert(dailyFocusItems).values({id:taskId(),taskId:id,date:to,sortOrder:tx.select().from(dailyFocusItems).where(eq(dailyFocusItems.date,to)).all().length,createdAt:now()}).run();
    action(tx,id,'SELECT',to);
   }
   tx.delete(dailyFocusItems).where(and(eq(dailyFocusItems.taskId,id),eq(dailyFocusItems.date,from))).run();action(tx,id,'REMOVE',from);
  });
 },
 async removeFromDay(id:string,day=formatLocalDate()) {
  date(day);db.transaction(tx=>{action(tx,id,'REMOVE',day);tx.delete(dailyFocusItems).where(and(eq(dailyFocusItems.taskId,id),eq(dailyFocusItems.date,day))).run();});
 },
 async setStatus(id:string,status:TaskStatus) {
  if(!['TODO','IN_PROGRESS','COMPLETED','CANCELLED'].includes(status))throw new Error('Status tidak valid.');
  db.transaction(tx=>{writeTaskStatus(tx,id,status,now());});await sync();
 },
 async park(id:string,state:PlanningState) {
  if(!['INBOX','READY','SOMEDAY','WAITING'].includes(state))throw new Error('Pilihan tidak valid.');
  db.transaction(tx=>{
   action(tx,id,state==='SOMEDAY'?'SOMEDAY':state==='WAITING'?'WAITING':'REMOVE');
   tx.insert(taskProfiles).values({id,planningState:state,estimateKnown:1}).onConflictDoUpdate({target:taskProfiles.id,set:{planningState:state}}).run();
   tx.delete(dailyFocusItems).where(and(eq(dailyFocusItems.taskId,id),sql`${dailyFocusItems.date} >= ${formatLocalDate()}`)).run();
   tx.delete(agendaEvents).where(and(eq(agendaEvents.taskId,id),sql`julianday(${agendaEvents.startTime}) > julianday(${now()})`)).run();
   tx.update(taskProfiles).set({executionDate:null,executionTime:null,alertMode:'NONE',snoozedUntilIso:null}).where(eq(taskProfiles.id,id)).run();
  }); await sync();
 },
 async steps(id:string){return db.select().from(taskSteps).where(eq(taskSteps.taskId,id)).orderBy(taskSteps.sortOrder).all();},
 async addStep(id:string,title:string){if(!title.trim())throw new Error('Isi langkahnya terlebih dahulu.');db.insert(taskSteps).values({id:taskId(),taskId:id,title:title.trim(),sortOrder:db.select().from(taskSteps).where(eq(taskSteps.taskId,id)).all().length}).run();},
 async toggleStep(id:string){const step=db.select().from(taskSteps).where(eq(taskSteps.id,id)).get();if(!step)throw new Error('Langkah tidak ditemukan.');db.update(taskSteps).set({isCompleted:step.isCompleted?0:1}).where(eq(taskSteps.id,id)).run();},
 async blocks(id:string){return db.select().from(agendaEvents).where(eq(agendaEvents.taskId,id)).orderBy(agendaEvents.startTime).all();},
 async schedule(id:string,day:string,start:string,endDay:string,end:string,reminder:number|null,blockId?:string,loud=false){
  date(day);date(endDay);if(!isTimeOnly(start)||!isTimeOnly(end))throw new Error('Jam harus HH:mm.');
  if(reminder!==null&&(!Number.isSafeInteger(reminder)||reminder<0))throw new Error('Pengingat tidak valid.');
  const startTime=localTimeToIso(day,start),endTime=localTimeToIso(endDay,end);
  if(Date.parse(endTime)<=Date.parse(startTime))throw new Error('Waktu selesai harus setelah mulai.');
  db.transaction(tx=>{
   const task=tx.select().from(tasks).where(eq(tasks.id,id)).get();if(!task)throw new Error('Tugas tidak ditemukan.');
   if(['COMPLETED','CANCELLED'].includes(normalizeTaskStatus(task.status)))throw new Error('Aktifkan tugas sebelum menjadwalkan.');
   const old=blockId?tx.select().from(agendaEvents).where(eq(agendaEvents.id,blockId)).get():null;
   if(blockId&&old?.taskId!==id)throw new Error('Blok bukan milik tugas ini.');
   const alarmMode=tx.select().from(taskProfiles).where(eq(taskProfiles.id,id)).get()?.alertMode==='BOTH'?'BOTH':'ALARM';
   const fields={title:task.title,startTime,endTime,reminderMinutes:loud?null:reminder,isCompleted:Number(normalizeTaskStatus(task.status)==='COMPLETED'),updatedAt:now()};
   if(loud && blockId!=='task-block-legacy-'+id && tx.select().from(agendaEvents).where(eq(agendaEvents.id,'task-block-legacy-'+id)).get())throw new Error('Ubah blok alarm utama yang sudah ada.');
   if(blockId)tx.update(agendaEvents).set({...fields,...(loud?{id:'task-block-legacy-'+id}:{})}).where(eq(agendaEvents.id,blockId)).run();
   else {
    if(loud && tx.select().from(agendaEvents).where(eq(agendaEvents.id,'task-block-legacy-'+id)).get()) throw new Error('Satu alarm utama per tugas. Ubah blok alarm utama yang sudah ada.');
    tx.insert(agendaEvents).values({...fields,id:loud?'task-block-legacy-'+id:taskId(),taskId:id,eventType:'WORK',createdAt:now()}).run();
   }
   if(loud){const profile={id,planningState:'READY',estimateKnown:Number(task.estimatedMinutes>0),executionDate:day,executionTime:start,alertMode:alarmMode,snoozedUntilIso:null,lastAlarmFiredKey:null};tx.insert(taskProfiles).values(profile).onConflictDoUpdate({target:taskProfiles.id,set:{executionDate:day,executionTime:start,alertMode:alarmMode,snoozedUntilIso:null,lastAlarmFiredKey:null}}).run();}
   // Legacy loud alarms move with their original block, never with a different work session.
   if(blockId==='task-block-legacy-'+id)tx.update(taskProfiles).set({executionDate:loud?day:null,executionTime:loud?start:null,alertMode:loud?alarmMode:'NONE',snoozedUntilIso:null,lastAlarmFiredKey:null}).where(eq(taskProfiles.id,id)).run();
   tx.insert(taskProfiles).values({id,planningState:'READY',estimateKnown:Number(task.estimatedMinutes>0)}).onConflictDoUpdate({target:taskProfiles.id,set:{planningState:'READY'}}).run();
   action(tx,id,'SCHEDULE',day);
  }); await sync();
 },
 async deleteBlock(id:string){db.transaction(tx=>{const block=tx.select().from(agendaEvents).where(eq(agendaEvents.id,id)).get();if(!block)throw new Error('Blok tidak ditemukan.');tx.delete(agendaEvents).where(eq(agendaEvents.id,id)).run();if(block.taskId&&id==='task-block-legacy-'+block.taskId)tx.update(taskProfiles).set({executionDate:null,executionTime:null,alertMode:'NONE',snoozedUntilIso:null}).where(eq(taskProfiles.id,block.taskId)).run();});await sync();},
 async plan(day=formatLocalDate()){date(day);return db.select().from(dayPlans).where(eq(dayPlans.id,day)).get()?.availableMinutes??120;},
 async setCapacity(minutes:number,day=formatLocalDate()){date(day);if(!Number.isSafeInteger(minutes)||minutes<0||minutes>1440)throw new Error('Waktu tersedia harus 0–1440 menit.');db.insert(dayPlans).values({id:day,availableMinutes:minutes}).onConflictDoUpdate({target:dayPlans.id,set:{availableMinutes:minutes}}).run();},
 async review(day=formatLocalDate()){
  date(day);const start=shiftDate(day,-6);
  return {note:db.select().from(dayReviews).where(eq(dayReviews.id,day)).get(),
   actions:db.select().from(taskActions).where(sql`${taskActions.date} BETWEEN ${start} AND ${day}`).orderBy(desc(taskActions.createdAt)).all(),
   completed:db.select().from(tasks).where(sql`${tasks.completedAt} IS NOT NULL`).all().filter(t=>{const local=formatLocalDate(new Date(t.completedAt!));return local>=start&&local<=day;}),
   sessions:db.select().from(focusSessions).all().filter(t=>{const local=formatLocalDate(new Date(t.startedAt));return local>=start&&local<=day;})};
 },
 async saveReview(day:string,accomplishment:string,obstacle:string,nextAction:string){date(day);const fields={id:day,accomplishment,obstacle,nextAction,updatedAt:now()};db.insert(dayReviews).values(fields).onConflictDoUpdate({target:dayReviews.id,set:fields}).run();},
 async setTargetStatus(id:string,completed:boolean){db.update(targets).set({status:completed?'COMPLETED':'ACTIVE',completedAt:completed?now():null,updatedAt:now()}).where(eq(targets.id,id)).run();},
 async targets(){return db.select().from(targets).all();},
};
