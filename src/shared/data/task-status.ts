import { notifyTaskChanges } from './task-changes';
import { formatLocalDate } from '@/shared/utils/local-date';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tasks, dailyFocusItems, agendaEvents, taskActions } from '@/db/schema';
import { taskStatusFields, type TaskStatus } from '@/shared/domain/task-status';

/** Call inside the caller's transaction so compatibility flags cannot commit separately. */
export function writeTaskStatus(tx: Pick<typeof db, 'select' | 'update' | 'insert'>, id: string, status: TaskStatus, now: string) {
  const existing = tx.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!existing) throw new Error('Tugas tidak ditemukan.');
  const fields = taskStatusFields(status, now);
  queueMicrotask(notifyTaskChanges);
  if (status === 'COMPLETED' && ['COMPLETED', 'DONE'].includes(existing.status) && existing.completedAt) fields.completedAt = existing.completedAt;
  if(existing.status !== status) tx.insert(taskActions).values({id:'action-'+id+'-'+Date.now()+'-'+Math.random().toString(36).slice(2),taskId:id,taskTitle:existing.title,date:formatLocalDate(new Date(now)),action:status==='COMPLETED'?'COMPLETE':status==='CANCELLED'?'CANCEL':'REOPEN',createdAt:now}).run();
  tx.update(tasks).set(fields).where(eq(tasks.id, id)).run();
  tx.update(agendaEvents).set({ isCompleted: fields.isCompleted, updatedAt: now }).where(eq(agendaEvents.taskId, id)).run();
  tx.update(dailyFocusItems).set({ isCompleted: fields.isCompleted }).where(eq(dailyFocusItems.taskId, id)).run();
}
