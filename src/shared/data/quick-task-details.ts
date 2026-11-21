import type { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { tasks, userSettings } from '@/db/schema';
import { QUICK_TASK_DETAILS_PREFIX, parseQuickTaskDetails } from '@/features/today-focus/domain/quick-task';

export function readQuickTaskDetails(connection: Pick<typeof db, 'select'>) {
  const rows = connection.select().from(userSettings).where(
    sql`substr(${userSettings.key}, 1, ${QUICK_TASK_DETAILS_PREFIX.length}) = ${QUICK_TASK_DETAILS_PREFIX}`
  ).all();
  return new Map(rows.map(row => [row.key.slice(QUICK_TASK_DETAILS_PREFIX.length), parseQuickTaskDetails(row.value)]));
}

/** Called in the same transaction as task/cascade deletion. */
export function removeOrphanQuickTaskDetails(connection: Pick<typeof db, 'delete'>): void {
  connection.delete(userSettings).where(sql`substr(${userSettings.key}, 1, ${QUICK_TASK_DETAILS_PREFIX.length}) = ${QUICK_TASK_DETAILS_PREFIX}
    AND NOT EXISTS (SELECT 1 FROM ${tasks} WHERE ${tasks.id} = substr(${userSettings.key}, ${QUICK_TASK_DETAILS_PREFIX.length + 1}))`).run();
}
