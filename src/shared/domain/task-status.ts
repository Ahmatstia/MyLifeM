export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/** Status is authoritative; DONE is a read-only legacy alias. */
export function normalizeTaskStatus(status: string): TaskStatus {
  if (status === 'DONE') return 'COMPLETED';
  if (['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) return status as TaskStatus;
  throw new Error('Status tugas tidak dikenal.');
}

export function taskStatusFields(status: TaskStatus, now: string) {
  if (!['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) throw new Error('Status tugas tidak valid.');
  return { status, isCompleted: status === 'COMPLETED' ? 1 : 0, completedAt: status === 'COMPLETED' ? now : null, updatedAt: now };
}

export function summarizeTasks<T extends { id: string; status: string; estimatedHours?: number | null; estimatedMinutes?: number }>(tasks: T[]) {
  const active = [...new Map(tasks.map(task => [task.id, task])).values()].filter(task => normalizeTaskStatus(task.status) !== 'CANCELLED');
  const totalTasks = active.length;
  const completedTasks = active.filter(task => normalizeTaskStatus(task.status) === 'COMPLETED').length;
  const totalEstimatedHours = Math.round(active.reduce((sum, task) => sum + (task.estimatedHours ?? (task.estimatedMinutes ?? 0) / 60), 0) * 10) / 10;
  return { totalTasks, completedTasks, progressPercent: totalTasks ? Math.round(completedTasks / totalTasks * 100) : 0, totalEstimatedHours };
}
