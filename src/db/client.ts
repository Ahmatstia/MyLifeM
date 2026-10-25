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
    freshDb.execSync('PRAGMA foreign_keys = ON;');
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


export { TABLES_DDL, INDEXES_DDL } from './schema-sql';
export { initDatabase } from './migrations';
