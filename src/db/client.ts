import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

export const DB_NAME = 'mylife.db';

let _activeSqliteDb: SQLite.SQLiteDatabase | null = null;

/**
 * Memastikan koneksi native SQLite aktif dan tidak berstatus closed resource.
 * Jika koneksi tertutup (misal saat Fast Refresh atau reload Expo di Android),
 * fungsi ini membuka ulang koneksi secara transparan.
 */
function isHandleAlive(dbInstance: SQLite.SQLiteDatabase | null): boolean {
  if (!dbInstance) return false;
  try {
    dbInstance.execSync('SELECT 1;');
    return true;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('closed resource') || msg.includes('Access to closed') || msg.includes('NullPointer')) {
      return false;
    }
    return true;
  }
}

export function getSqliteDb(): SQLite.SQLiteDatabase {
  if (!_activeSqliteDb || !isHandleAlive(_activeSqliteDb)) {
    if (_activeSqliteDb) {
      console.warn('[Database] Native SQLite connection was closed. Reopening...');
    }
    const freshDb = SQLite.openDatabaseSync(DB_NAME);
    try {
      freshDb.execSync('PRAGMA foreign_keys = ON;');
    } catch {
      // Ignored if PRAGMA fails
    }
    _activeSqliteDb = freshDb;
    return freshDb;
  }
  return _activeSqliteDb;
}

// Proxy transparan yang selalu mendelegasikan ke koneksi native aktif
export const sqliteDb: SQLite.SQLiteDatabase = new Proxy({} as SQLite.SQLiteDatabase, {
  get(_target, prop) {
    const active = getSqliteDb();
    const val = (active as any)[prop];
    if (typeof val === 'function') {
      return val.bind(active);
    }
    return val;
  },
  set(_target, prop, value) {
    const active = getSqliteDb();
    (active as any)[prop] = value;
    return true;
  },
});

// Initialize Drizzle ORM dengan proxy yang resilient
export const db = drizzle(sqliteDb, { schema });


/**
 * SQL DDL Statements for 9 tables
 * Ensures the database schema is created cleanly on first launch
 */
const TABLES_DDL = `
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS life_pillars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    pillar_id TEXT,
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
    target_id TEXT,
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
    id TEXT PRIMARY KEY,
    parent_type TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    due_date TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    stage_id TEXT,
    project_id TEXT,
    target_id TEXT,
    milestone_id TEXT,
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
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_focus_items (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    task_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT,
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
    target_id TEXT,
    project_id TEXT,
    task_id TEXT,
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
`;

const INDEXES_DDL = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_unique ON categories(name);
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
CREATE INDEX IF NOT EXISTS idx_focus_sessions_task ON focus_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_started_at ON focus_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_time_range ON agenda_events(start_time, end_time);
`;

const SEED_CATEGORIES_SQL = `
INSERT OR IGNORE INTO categories (id, name, created_at, updated_at) VALUES
('cat-belajar', 'Belajar', datetime('now'), datetime('now')),
('cat-karier', 'Karier', datetime('now'), datetime('now')),
('cat-olahraga', 'Olahraga', datetime('now'), datetime('now')),
('cat-pribadi', 'Pribadi', datetime('now'), datetime('now'));
`;

const SEED_PILLARS_SQL = `
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

let _isInitialized = false;

/**
 * Initialize Database tables and insert seed data
 */
export async function initDatabase(): Promise<void> {
  if (_isInitialized) {
    return;
  }
  try {
    const rawDb = getSqliteDb();

    // 1. Temporarily turn off foreign keys during table creation & migration
    rawDb.execSync('PRAGMA foreign_keys = OFF;');

    // 2. Create tables if not existing
    rawDb.execSync(TABLES_DDL);

    // 3. Safe column migrations for existing database instances (before indexes are created!)
    const migrations = [
      'ALTER TABLE targets ADD COLUMN category_id TEXT;',
      'ALTER TABLE tasks ADD COLUMN stage_id TEXT;',
      'ALTER TABLE tasks ADD COLUMN name TEXT;',
      'ALTER TABLE tasks ADD COLUMN estimated_hours REAL DEFAULT 1.0;',
      'ALTER TABLE tasks ADD COLUMN sort_order INTEGER DEFAULT 0;',
    ];
    for (const sql of migrations) {
      try {
        rawDb.execSync(sql);
      } catch {
        // Column already exists
      }
    }

    // 4. Create all indexes safely now that all columns are guaranteed to exist
    rawDb.execSync(INDEXES_DDL);

    // 5. Re-enable foreign keys
    rawDb.execSync('PRAGMA foreign_keys = ON;');

    // 6. Seed default categories and pillars if empty
    rawDb.execSync(SEED_CATEGORIES_SQL);
    rawDb.execSync(SEED_PILLARS_SQL);

    // 7. Ensure data backfill for existing records
    try {
      rawDb.execSync("UPDATE targets SET category_id = 'cat-karier' WHERE category_id IS NULL;");
      rawDb.execSync('UPDATE tasks SET name = title WHERE name IS NULL;');
    } catch {
      // Ignore if no update needed
    }

    _isInitialized = true;
    console.log('[Database] SQLite initialized and seeded successfully.');
  } catch (error) {
    console.error('[Database] Initialization error:', error);
    throw error;
  }
}
