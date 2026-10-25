import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { checkBackupSize } from '../backup-format';

const recoveryFile = () => new File(Paths.document, 'mylife-sebelum-pemulihan.json');

async function read(file: File): Promise<string> {
  checkBackupSize(file.size);
  return file.text();
}

async function write(file: File, json: string): Promise<void> {
  file.create({ overwrite: true });
  await file.write(json);
  if (await read(file) !== json) throw new Error('Berkas cadangan tidak tersimpan utuh. Pemulihan dibatalkan.');
}

export async function saveBackupFile(json: string): Promise<void> {
  if (!await Sharing.isAvailableAsync()) throw new Error('Menu berbagi berkas tidak tersedia pada perangkat ini.');
  const file = new File(Paths.document, 'mylife-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  await write(file, json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Simpan cadangan MyLife' });
}

export async function pickBackupFile(): Promise<string | null> {
  const selected = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', 'application/octet-stream'] });
  return selected.canceled ? null : read(selected.result);
}

export async function saveRecoveryBackup(json: string): Promise<void> {
  // Keep the most recent pre-restore copy until the next explicit restore.
  await write(recoveryFile(), json);
}

export async function readRecoveryBackup(): Promise<string | null> {
  const file = recoveryFile();
  return file.exists ? read(file) : null;
}

export async function saveMigrationBackup(json: string): Promise<void> {
  await write(new File(Paths.document, 'mylife-sebelum-migrasi.json'), json);
}

export async function readMigrationBackup(): Promise<string | null> {
  const file = new File(Paths.document, 'mylife-sebelum-migrasi.json');
  return file.exists ? read(file) : null;
}
