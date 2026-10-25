import type { SQLiteDatabase } from 'expo-sqlite';
import { TABLE_SPECS, type BackupData, type BackupRow } from './backup-format';

export type BackupConnection = Pick<SQLiteDatabase, 'getAllSync' | 'getFirstSync' | 'execSync' | 'runSync' | 'withTransactionSync'>;

/** All SQL identifiers come from the application's schema, never from an imported file. */
export function readBackupData(connection: BackupConnection): BackupData {
  return Object.fromEntries(TABLE_SPECS.map(spec => [spec.key, connection.getAllSync(
    `SELECT ${spec.columns.map(column => `"${column.name}" AS "${column.key}"`).join(', ')} FROM "${spec.name}" ORDER BY "${spec.primaryKey}"`
  )])) as BackupData;
}

/** Caller owns the transaction so validation and replacement commit together. */
export function replaceBackupData(connection: BackupConnection, data: BackupData): void {
  for (const spec of [...TABLE_SPECS].reverse()) connection.execSync(`DELETE FROM "${spec.name}";`);
  for (const spec of TABLE_SPECS) {
    const statement = `INSERT INTO "${spec.name}" (${spec.columns.map(column => `"${column.name}"`).join(', ')}) VALUES (${spec.columns.map(() => '?').join(', ')})`;
    for (const row of data[spec.key]) connection.runSync(statement, spec.columns.map(column => (row as BackupRow)[column.key]));
  }
  if (connection.getFirstSync<{ integrity_check: string }>('PRAGMA integrity_check')?.integrity_check !== 'ok'
    || connection.getAllSync('PRAGMA foreign_key_check').length > 0) {
    throw new Error('Integritas database tidak lolos pemeriksaan. Pemulihan dibatalkan.');
  }
  for (const spec of TABLE_SPECS) {
    const count = connection.getFirstSync<{ count: number }>(`SELECT count(*) AS count FROM "${spec.name}"`)?.count;
    if (count !== data[spec.key].length) throw new Error('Jumlah catatan hasil pemulihan tidak sesuai.');
  }
}

export function replaceIfUnchanged(connection: BackupConnection, data: BackupData, safetyJson: string): void {
  const safety = JSON.parse(safetyJson) as { data?: unknown };
  connection.withTransactionSync(() => {
    if (JSON.stringify(readBackupData(connection)) !== JSON.stringify(safety.data)) {
      throw new Error('Data berubah saat cadangan pengaman disimpan. Tidak ada data diganti; silakan ulangi pemulihan.');
    }
    replaceBackupData(connection, data);
  });
}
