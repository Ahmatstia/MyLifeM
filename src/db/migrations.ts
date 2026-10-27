import { getSqliteDb } from './connection';
import { TABLES_DDL, INDEXES_DDL, SEED_CATEGORIES_SQL, SEED_PILLARS_SQL } from './schema-sql';
import { INTEGRITY_DDL } from './integrity';
import { TABLE_SPECS, parseBackup, checkBackupSize } from '@/features/settings/data/backup-format';
import { readBackupData, replaceBackupData } from '@/features/settings/data/backup-store';
import { saveMigrationBackup } from '@/features/settings/data/services/backup-file.service';
import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;
let initialized = false;
let initialization: Promise<void> | null = null;

function snapshot(connection: SQLiteDatabase): string {
  const tables = connection.getAllSync<{ name: string; sql: string }>("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if (tables.some(table => !TABLE_SPECS.some(spec => spec.name === table.name))) throw new Error('Database memuat tabel yang belum dikenal. Migrasi dibatalkan.');
  return JSON.stringify({ format: 'mylife-migration-snapshot', version: connection.getFirstSync<{ user_version: number }>('PRAGMA user_version')!.user_version,
    objects: connection.getAllSync("SELECT type, name, sql FROM sqlite_master WHERE type != 'table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY name"),
    tables: tables.map(table => ({ ...table, rows: connection.getAllSync(`SELECT * FROM "${table.name}" ORDER BY rowid`) })) });
}

async function initialize(): Promise<void> {
  const connection = getSqliteDb();
  connection.execSync('PRAGMA foreign_keys = ON;');
  if (connection.getFirstSync<{ foreign_keys: number }>('PRAGMA foreign_keys')?.foreign_keys !== 1) throw new Error('Perlindungan relasi database belum aktif. Database tidak diubah.');
  const version = connection.getFirstSync<{ user_version: number }>('PRAGMA user_version')!.user_version;
  if (version > DATABASE_VERSION) throw new Error('Database berasal dari versi aplikasi lebih baru. Gunakan versi aplikasi yang sesuai.');
  if (version === DATABASE_VERSION) {
    if (connection.getAllSync('PRAGMA foreign_key_check').length) throw new Error('Relasi database tidak utuh. Database tidak diubah.');
    // Reading every expected column detects an incomplete/tampered schema before mounting CRUD.
    readBackupData(connection);
    const foreignKeys = TABLE_SPECS.reduce((sum, spec) => sum + connection.getAllSync(`PRAGMA foreign_key_list("${spec.name}")`).length, 0);
    if (foreignKeys !== 15 || connection.getAllSync("SELECT name FROM sqlite_master WHERE type = 'trigger' AND name IN ('task_owner_insert', 'task_owner_update', 'stage_owner_update', 'milestone_owner_update', 'task_history_delete')").length !== 5) throw new Error('Constraint database belum lengkap. Database tidak diubah.');
    return;
  }
  let before = '';
  connection.withTransactionSync(() => { before = snapshot(connection); });
  const fresh = JSON.parse(before).tables.length === 0;
  const archive = JSON.stringify({ ...JSON.parse(before), capturedAt: new Date().toISOString() });
  if (!fresh) {
    checkBackupSize(new Blob([archive]).size);
    await saveMigrationBackup(archive);
    const objects = JSON.parse(before).objects as { type: string; name: string }[];
    if (objects.some(object => object.type !== 'index' || !INDEXES_DDL.includes('IF NOT EXISTS ' + object.name + ' '))) throw new Error('Objek skema legacy belum dikenal. Arsip disimpan; database asli tidak diubah.');
  }
  const data = fresh ? null : parseBackup(archive).data;
  connection.execSync('PRAGMA foreign_keys = OFF;');
  try {
    connection.withTransactionSync(() => {
      if (snapshot(connection) !== before) throw new Error('Data berubah selama penyimpanan salinan pra-migrasi. Silakan coba lagi.');
      for (const spec of [...TABLE_SPECS].reverse()) connection.execSync(`DROP TABLE IF EXISTS "${spec.name}";`);
      connection.execSync(TABLES_DDL + INDEXES_DDL);
      if (data) replaceBackupData(connection, data);
      else connection.execSync(SEED_CATEGORIES_SQL + SEED_PILLARS_SQL);
      connection.execSync(INTEGRITY_DDL);
      if (connection.getAllSync('PRAGMA foreign_key_check').length || connection.getFirstSync<{ integrity_check: string }>('PRAGMA integrity_check')?.integrity_check !== 'ok') throw new Error('Integritas hasil migrasi gagal. Semua perubahan dibatalkan.');
      connection.execSync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    });
  } finally {
    connection.execSync('PRAGMA foreign_keys = ON;');
    if (connection.getFirstSync<{ foreign_keys: number }>('PRAGMA foreign_keys')?.foreign_keys !== 1) throw new Error('Perlindungan relasi database belum dapat diaktifkan kembali. Coba lagi sebelum melanjutkan.');
  }
}

export async function initDatabase(): Promise<void> {
  if (initialized) return;
  if (!initialization) initialization = initialize().then(() => { initialized = true; }).finally(() => { initialization = null; });
  return initialization;
}
