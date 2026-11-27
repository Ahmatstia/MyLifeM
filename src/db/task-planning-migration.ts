import { localTimeToIso } from '@/shared/utils/local-date';
import type { SQLiteDatabase } from 'expo-sqlite';
import { MANAGED_TASKS_KEY, parseManagedTasks } from '@/features/task-manager/domain/managed-task-validation';
import { normalizeTaskStatus } from '@/shared/domain/task-status';

type Connection = Pick<SQLiteDatabase, 'getFirstSync' | 'runSync'>;
/** Caller owns the transaction. Old JSON is archived, never used as an active task source again. */
export function migrateTaskPlanning(connection: Connection) {
  const legacy = connection.getFirstSync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', MANAGED_TASKS_KEY);
  if (!legacy) return;
  for (const item of parseManagedTasks(legacy.value)) {
    const core = connection.getFirstSync<{ id: string; status: string }>('SELECT id,status FROM tasks WHERE id = ?', item.id);
    if (!core) connection.runSync(`INSERT INTO tasks(id,title,name,description,priority,status,estimated_minutes,actual_minutes,sort_order,due_date,is_completed,completed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      item.id,item.title,item.title,item.notes,item.priority,item.isCompleted ? 'COMPLETED' : 'TODO',item.estimatedMinutes,0,0,item.deadlineDate,Number(item.isCompleted),item.completedAt,item.createdAt,item.updatedAt);
    const status = normalizeTaskStatus(core?.status ?? (item.isCompleted ? 'COMPLETED' : 'TODO'));
    connection.runSync(`INSERT OR IGNORE INTO task_profiles(id,planning_state,estimate_known,context,category_type,execution_date,execution_time,deadline_time,alert_mode,alarm_track_id,alarm_track_name,alarm_track_uri,snooze_minutes,snoozed_until_iso,last_alarm_fired_key) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      item.id,'READY',1,item.courseOrContext,item.categoryType,item.executionDate,item.executionTime,item.deadlineTime,item.alertMode,item.alarmTrackId,item.alarmTrackName,item.alarmTrackUri,item.snoozeMinutes,item.snoozedUntilIso,item.lastAlarmFiredKey);
    item.subtasks.forEach((step,index) => {
      const existing=connection.getFirstSync<{task_id:string}>('SELECT task_id FROM task_steps WHERE id=?',step.id);
      const id=existing&&existing.task_id!==item.id?'legacy-'+item.id+'-'+step.id:step.id;
      connection.runSync('INSERT OR IGNORE INTO task_steps(id,task_id,title,is_completed,sort_order) VALUES(?,?,?,?,?)',id,item.id,step.title,Number(step.isCompleted),index);
    });
    // Preserve the original occurrence as a calendar block without creating another task.
    const start = new Date(localTimeToIso(item.executionDate,item.executionTime));
    const end = new Date(start.getTime() + Math.max(5,item.estimatedMinutes)*60000);
    connection.runSync(`INSERT OR IGNORE INTO agenda_events(id,task_id,title,start_time,end_time,is_all_day,event_type,reminder_minutes,is_completed,created_at,updated_at) VALUES(?,?,?,?,?,0,'WORK',NULL,?,?,?)`,
      'task-block-legacy-'+item.id,item.id,item.title,start.toISOString(),end.toISOString(),Number(status === 'COMPLETED'),item.createdAt,item.updatedAt);
  }
  connection.runSync('INSERT OR REPLACE INTO user_settings(key,value,updated_at) VALUES(?,?,?)','legacy_managed_tasks_v1',legacy.value,new Date().toISOString());
  connection.runSync('DELETE FROM user_settings WHERE key = ?',MANAGED_TASKS_KEY);
}
