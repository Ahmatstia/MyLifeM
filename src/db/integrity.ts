/** Cross-row ownership cannot be expressed by a row CHECK. */
export const INTEGRITY_DDL = `
CREATE TRIGGER IF NOT EXISTS task_owner_insert BEFORE INSERT ON tasks BEGIN
  SELECT RAISE(ABORT, 'Pemilik tugas berbeda dari tahapan') WHERE NEW.stage_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM stages s WHERE s.id = NEW.stage_id AND s.target_id IS NEW.target_id AND s.project_id IS NEW.project_id);
  SELECT RAISE(ABORT, 'Milestone berasal dari proyek lain') WHERE NEW.milestone_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM milestones m WHERE m.id = NEW.milestone_id AND m.project_id IS NEW.project_id);
END;
CREATE TRIGGER IF NOT EXISTS task_owner_update BEFORE UPDATE OF stage_id, target_id, project_id, milestone_id ON tasks BEGIN
  SELECT RAISE(ABORT, 'Pemilik tugas berbeda dari tahapan') WHERE NEW.stage_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM stages s WHERE s.id = NEW.stage_id AND s.target_id IS NEW.target_id AND s.project_id IS NEW.project_id);
  SELECT RAISE(ABORT, 'Milestone berasal dari proyek lain') WHERE NEW.milestone_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM milestones m WHERE m.id = NEW.milestone_id AND m.project_id IS NEW.project_id);
END;
CREATE TRIGGER IF NOT EXISTS stage_owner_update BEFORE UPDATE OF target_id, project_id, parent_type, parent_id ON stages
WHEN EXISTS (SELECT 1 FROM tasks WHERE stage_id = OLD.id)
 AND (NEW.target_id IS NOT OLD.target_id OR NEW.project_id IS NOT OLD.project_id OR NEW.parent_type IS NOT OLD.parent_type OR NEW.parent_id IS NOT OLD.parent_id)
BEGIN SELECT RAISE(ABORT, 'Tahapan berisi tugas tidak dapat dipindah induk'); END;
CREATE TRIGGER IF NOT EXISTS milestone_owner_update BEFORE UPDATE OF project_id ON milestones
WHEN NEW.project_id IS NOT OLD.project_id AND EXISTS (SELECT 1 FROM tasks WHERE milestone_id = OLD.id)
BEGIN SELECT RAISE(ABORT, 'Milestone berisi tugas tidak dapat dipindah proyek'); END;
CREATE TRIGGER IF NOT EXISTS task_history_delete BEFORE DELETE ON tasks
BEGIN UPDATE focus_sessions SET task_title = COALESCE(task_title, OLD.title) WHERE task_id = OLD.id; END;
`;
