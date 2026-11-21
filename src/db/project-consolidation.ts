import type { SQLiteDatabase } from 'expo-sqlite';

type Connection = Pick<SQLiteDatabase, 'getAllSync' | 'getFirstSync' | 'runSync'>;
export const PROJECT_TARGET_PREFIX = 'project_target_v1:';
type LegacyProject = { id: string; target_id: string | null; title: string; description: string | null;
  status: string; priority: string; target_date: string | null; completed_at: string | null; created_at: string; updated_at: string };

export function hasPendingProjects(connection: Connection): boolean {
  return connection.getFirstSync<{ id: string }>(
    `SELECT p.id FROM projects p WHERE NOT EXISTS (SELECT 1 FROM user_settings s WHERE s.key = ? || p.id)
      OR EXISTS (SELECT 1 FROM tasks WHERE project_id = p.id) OR EXISTS (SELECT 1 FROM stages WHERE project_id = p.id)
      OR EXISTS (SELECT 1 FROM agenda_events WHERE project_id = p.id) LIMIT 1`, PROJECT_TARGET_PREFIX
  ) !== null;
}

function unusedId(connection: Connection, table: 'targets' | 'stages', base: string): string {
  let id = base, suffix = 0;
  while (connection.getFirstSync(`SELECT id FROM ${table} WHERE id = ?`, id)) id = base + '-' + ++suffix;
  return id;
}

/** Caller owns the transaction. Original project/milestone rows remain as backup compatibility records. */
export function consolidateProjects(connection: Connection): void {
  const projects = connection.getAllSync<LegacyProject>('SELECT * FROM projects ORDER BY id');
  for (const project of projects) {
    const key = PROJECT_TARGET_PREFIX + project.id;
    const marker = connection.getFirstSync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', key);
    if (marker) {
      // Deleting a converted target must not recreate it on the next launch/import.
      if (connection.getFirstSync('SELECT id FROM tasks WHERE project_id = ? UNION ALL SELECT id FROM stages WHERE project_id = ? UNION ALL SELECT id FROM agenda_events WHERE project_id = ? LIMIT 1', project.id, project.id, project.id)) {
        throw new Error('Catatan pemindahan proyek tidak sesuai dengan relasi data. Pemindahan dibatalkan.');
      }
      continue;
    }
    const parent = project.target_id ? connection.getFirstSync<{ title: string; category_id: string | null; pillar_id: string | null }>(
      'SELECT title, category_id, pillar_id FROM targets WHERE id = ?', project.target_id
    ) : null;
    const targetId = unusedId(connection, 'targets', 'target-from-project-' + project.id);
    const context = parent ? 'Sebelumnya bagian dari target: ' + parent.title + '.' : '';
    const description = [project.description, context, project.status === 'PLANNING' ? 'Status sebelumnya: Rencana.' : ''].filter(Boolean).join('\n\n') || null;
    const status = project.status === 'ON_HOLD' ? 'PAUSED' : project.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE';
    connection.runSync(`INSERT INTO targets (id, category_id, pillar_id, title, description, status, priority, start_date, target_date, completed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, targetId, parent?.category_id ?? null, parent?.pillar_id ?? null,
      project.title, description, status, project.priority, project.created_at, project.target_date, project.completed_at, project.created_at, project.updated_at);
    const tasks = connection.getAllSync<{ id: string; stage_id: string | null; milestone_id: string | null; description: string | null }>(
      'SELECT id, stage_id, milestone_id, description FROM tasks WHERE project_id = ? ORDER BY id', project.id
    );
    // Detach without deleting tasks so ownership triggers and session/priority IDs stay intact.
    connection.runSync('UPDATE tasks SET stage_id = NULL, milestone_id = NULL WHERE project_id = ?', project.id);
    connection.runSync("UPDATE stages SET parent_type = 'TARGET', parent_id = ?, target_id = ?, project_id = NULL WHERE project_id = ?", targetId, targetId, project.id);
    const milestones = connection.getAllSync<{ id: string; title: string; sort_order: number; is_completed: number; due_date: string | null; created_at: string }>(
      'SELECT * FROM milestones WHERE project_id = ? ORDER BY sort_order, id', project.id
    );
    const milestoneStages = new Map<string, string>();
    const milestoneNotes = new Map<string, string>();
    let nextSort = (connection.getFirstSync<{ last: number | null }>('SELECT max(sort_order) AS last FROM stages WHERE target_id = ?', targetId)?.last ?? -1) + 1;
    for (const milestone of milestones) {
      const id = unusedId(connection, 'stages', 'stage-from-milestone-' + milestone.id);
      const note = 'Milestone sebelumnya: ' + milestone.title + '. Status: ' + (milestone.is_completed ? 'Selesai' : 'Belum selesai')
        + (milestone.due_date ? '. Tenggat: ' + milestone.due_date : '') + '.';
      connection.runSync(`INSERT INTO stages (id, parent_type, parent_id, target_id, name, description, sort_order, created_at, updated_at)
        VALUES (?, 'TARGET', ?, ?, ?, ?, ?, ?, ?)`, id, targetId, targetId, milestone.title, note, nextSort++, milestone.created_at, milestone.created_at);
      milestoneStages.set(milestone.id, id); milestoneNotes.set(milestone.id, note);
    }
    let looseStage: string | null = null;
    for (const task of tasks) {
      let stageId = task.stage_id || (task.milestone_id ? milestoneStages.get(task.milestone_id) : null);
      if (!stageId) {
        if (!looseStage) {
          looseStage = unusedId(connection, 'stages', 'stage-from-project-' + project.id);
          connection.runSync(`INSERT INTO stages (id, parent_type, parent_id, target_id, name, sort_order, created_at, updated_at)
            VALUES (?, 'TARGET', ?, ?, 'Tugas', ?, ?, ?)`, looseStage, targetId, targetId, nextSort++, project.created_at, project.updated_at);
        }
        stageId = looseStage;
      }
      const note = task.stage_id && task.milestone_id ? milestoneNotes.get(task.milestone_id) : null;
      const taskDescription = note ? [task.description, note].filter(Boolean).join('\n\n') : task.description;
      connection.runSync('UPDATE tasks SET project_id = NULL, target_id = ?, stage_id = ?, description = ? WHERE id = ?', targetId, stageId, taskDescription, task.id);
    }
    connection.runSync('UPDATE agenda_events SET project_id = NULL, target_id = ? WHERE project_id = ?', targetId, project.id);
    connection.runSync('INSERT INTO user_settings (key, value, updated_at) VALUES (?, ?, ?)', key, targetId, project.updated_at);
  }
}

export function getConvertedProjectTarget(connection: Connection, projectId: string): string | null {
  return connection.getFirstSync<{ id: string }>(
    'SELECT t.id FROM targets t JOIN user_settings s ON s.value = t.id WHERE s.key = ?', PROJECT_TARGET_PREFIX + projectId
  )?.id ?? null;
}
