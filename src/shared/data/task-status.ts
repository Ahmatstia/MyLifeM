import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tasks, dailyFocusItems } from '@/db/schema';
import { taskStatusFields, type TaskStatus } from '@/shared/domain/task-status';

/** Call inside the caller's transaction so compatibility flags cannot commit separately. */
export function writeTaskStatus(tx: Pick<typeof db, 'select' | 'update'>, id: string, status: TaskStatus, now: string) {
  const existing = tx.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!existing) throw new Error('Tugas tidak ditemukan.');
  const fields = taskStatusFields(status, now);
  if (status === 'COMPLETED' && ['COMPLETED', 'DONE'].includes(existing.status) && existing.completedAt) fields.completedAt = existing.completedAt;
  tx.update(tasks).set(fields).where(eq(tasks.id, id)).run();
  tx.update(dailyFocusItems).set({ isCompleted: fields.isCompleted }).where(eq(dailyFocusItems.taskId, id)).run();
}
