import { checkBackupSize } from '../backup-format';

const RECOVERY_KEY = 'mylife-before-restore-v1';

export async function saveBackupFile(json: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mylife-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json,text/plain';
    input.addEventListener('cancel', () => { input.remove(); resolve(null); }, { once: true });
    input.addEventListener('change', async () => {
      try {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        checkBackupSize(file.size);
        resolve(await file.text());
      } catch (error) { reject(error); }
      finally { input.remove(); }
    }, { once: true });
    input.click();
  });
}

export async function saveRecoveryBackup(json: string): Promise<void> {
  // shortcut: browser quota bounds the one recovery copy; reject before replacing data if storage is full.
  try { localStorage.setItem(RECOVERY_KEY, json); }
  catch { throw new Error('Penyimpanan browser tidak cukup untuk cadangan pengaman. Tidak ada data diganti.'); }
  if (localStorage.getItem(RECOVERY_KEY) !== json) throw new Error('Cadangan pengaman browser gagal diverifikasi.');
}

export async function readRecoveryBackup(): Promise<string | null> {
  return localStorage.getItem(RECOVERY_KEY);
}

export async function saveMigrationBackup(json: string): Promise<void> {
  try { localStorage.setItem('mylife-before-migration-v1', json); }
  catch { throw new Error('Penyimpanan browser tidak cukup untuk salinan pra-migrasi. Database tidak diubah.'); }
  if (localStorage.getItem('mylife-before-migration-v1') !== json) throw new Error('Salinan pra-migrasi gagal diverifikasi.');
}

export async function readMigrationBackup(): Promise<string | null> {
  return localStorage.getItem('mylife-before-migration-v1');
}
