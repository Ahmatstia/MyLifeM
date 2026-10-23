import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DB_NAME = 'mylife.db';

// Open native SQLite database
export const sqliteDb = SQLite.openDatabaseSync(DB_NAME);

// Initialize Drizzle ORM
export const db = drizzle(sqliteDb, { schema });

/**
 * SQL DDL Statements for 9 tables and their indexes
 * Ensures the database schema is created cleanly on first launch
 */
const INITIAL_DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS life_pillars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    pillar_id TEXT NOT NULL REFERENCES life_pillars(id) ON DELETE RESTRICT,
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
    id TEXT PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    target_id TEXT REFERENCES targets(id) ON DELETE SET NULL,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'TODO',
    estimated_minutes INTEGER NOT NULL DEFAULT 25,
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_focus_items (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
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
    id TEXT PRIMARY KEY,
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
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Indexes for 60 FPS performance
CREATE INDEX IF NOT EXISTS idx_targets_pillar_status ON targets(pillar_id, status);
CREATE INDEX IF NOT EXISTS idx_targets_updated_at ON targets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_target_id ON projects(target_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_target_id ON tasks(target_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_focus_unique ON daily_focus_items(date, task_id);
CREATE INDEX IF NOT EXISTS idx_daily_focus_date ON daily_focus_items(date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_time_range ON agenda_events(start_time, end_time);
`;

const SEED_PILLARS_SQL = `
INSERT OR IGNORE INTO life_pillars (id, name, icon, color, sort_order) VALUES
('career', 'Karier & Bisnis', 'briefcase', '#14b8a6', 1),
('finance', 'Finansial & Aset', 'wallet', '#f59e0b', 2),
('health', 'Kesehatan & Fisik', 'heart-pulse', '#ef4444', 3),
('growth', 'Pengembangan Diri', 'book-open', '#8b5cf6', 4),
('personal', 'Pribadi & Hubungan', 'users', '#3b82f6', 5);
`;

/**
 * Initialize Database tables and insert seed data
 */
export async function initDatabase(): Promise<void> {
  try {
    // Enable Foreign Keys
    sqliteDb.execSync('PRAGMA foreign_keys = ON;');
    
    // Execute DDL batch
    sqliteDb.execSync(INITIAL_DDL);
    
    // Seed default life pillars if empty
    sqliteDb.execSync(SEED_PILLARS_SQL);

    console.log('[Database] SQLite initialized and seeded successfully.');
  } catch (error) {
    console.error('[Database] Initialization error:', error);
    throw error;
  }
}
