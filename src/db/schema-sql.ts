export const TABLES_DDL = `
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS life_pillars (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
    pillar_id TEXT REFERENCES life_pillars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'MILESTONE_BASED',
    target_value REAL NOT NULL DEFAULT 100.0,
    current_value REAL NOT NULL DEFAULT 0.0,
    unit TEXT NOT NULL DEFAULT '%',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    start_date TEXT NOT NULL,
    target_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    target_id TEXT REFERENCES targets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    target_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY NOT NULL,
    parent_type TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    target_id TEXT REFERENCES targets(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK ((parent_type = 'TARGET' AND target_id IS NOT NULL AND parent_id = target_id AND project_id IS NULL) OR (parent_type = 'PROJECT' AND project_id IS NOT NULL AND parent_id = project_id AND target_id IS NULL))
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    stage_id TEXT REFERENCES stages(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    target_id TEXT REFERENCES targets(id) ON DELETE CASCADE,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    name TEXT,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'TODO',
    estimated_hours REAL DEFAULT 1.0,
    estimated_minutes INTEGER NOT NULL DEFAULT 25,
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (project_id IS NULL OR target_id IS NULL),
    CHECK (estimated_minutes >= 0 AND actual_minutes >= 0),
    CHECK (is_completed IN (0,1))
);

CREATE TABLE IF NOT EXISTS daily_focus_items (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    task_title TEXT,
    mode TEXT NOT NULL DEFAULT 'POMODORO',
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    rating INTEGER,
    obstacle TEXT,
    next_action TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agenda_events (
    id TEXT PRIMARY KEY NOT NULL,
    target_id TEXT REFERENCES targets(id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_all_day INTEGER NOT NULL DEFAULT 0,
    event_type TEXT NOT NULL DEFAULT 'WORK',
    location TEXT,
    reminder_minutes INTEGER DEFAULT 10,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
`;

export const INDEXES_DDL = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_unique ON categories(name);
CREATE INDEX IF NOT EXISTS idx_targets_category_status ON targets(category_id, status);
CREATE INDEX IF NOT EXISTS idx_stages_target_id ON stages(target_id);
CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_parent ON stages(parent_type, parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_targets_pillar_status ON targets(pillar_id, status);
CREATE INDEX IF NOT EXISTS idx_targets_updated_at ON targets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_target_id ON projects(target_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_target_id ON tasks(target_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_id ON tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_focus_unique ON daily_focus_items(date, task_id);
CREATE INDEX IF NOT EXISTS idx_daily_focus_date ON daily_focus_items(date);
CREATE INDEX IF NOT EXISTS idx_daily_focus_task ON daily_focus_items(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_time_range ON agenda_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_agenda_task ON agenda_events(task_id);
CREATE INDEX IF NOT EXISTS idx_agenda_project ON agenda_events(project_id);
CREATE INDEX IF NOT EXISTS idx_agenda_target ON agenda_events(target_id);
`;

export const SEED_CATEGORIES_SQL = `
INSERT OR IGNORE INTO categories (id, name, created_at, updated_at) VALUES
('cat-belajar', 'Belajar', datetime('now'), datetime('now')),
('cat-karier', 'Karier', datetime('now'), datetime('now')),
('cat-olahraga', 'Olahraga', datetime('now'), datetime('now')),
('cat-pribadi', 'Pribadi', datetime('now'), datetime('now'));
`;

export const SEED_PILLARS_SQL = `
INSERT OR IGNORE INTO life_pillars (id, name, icon, color, sort_order) VALUES
('career', 'Karier & Bisnis', 'briefcase', '#2EA39B', 1),
('finance', 'Finansial & Aset', 'wallet', '#E28743', 2),
('health', 'Kesehatan & Fisik', 'heart-pulse', '#E25252', 3),
('growth', 'Pengembangan Diri', 'book-open', '#8A5BE0', 4),
('personal', 'Pribadi & Hubungan', 'users', '#3A7BD5', 5);
UPDATE life_pillars SET color = '#2EA39B' WHERE id = 'career';
UPDATE life_pillars SET color = '#E28743' WHERE id = 'finance';
UPDATE life_pillars SET color = '#E25252' WHERE id = 'health';
UPDATE life_pillars SET color = '#8A5BE0' WHERE id = 'growth';
UPDATE life_pillars SET color = '#3A7BD5' WHERE id = 'personal';
`;

