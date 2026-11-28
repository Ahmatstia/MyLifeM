# Spesifikasi Fitur: Pengaturan, Privasi, & Backup-Restore (`settings`)

> **Direktori**: `src/features/settings/`  
> **Rute Terkait**: `/settings` (`SettingsScreen`, diakses dari `AppSidebarDrawer`)

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/settings.entity.ts`: `UserSettingsEntity` (`pomodoroMinutes`, `deepFlowMinutes`, `hapticsEnabled`, `keepAwakeEnabled`, `prayerCity`, `prayerLatitude`, `prayerLongitude`), `DEFAULT_SETTINGS`, `DatabaseStats`.
  - `repositories/settings.repository.ts`: Interface `SettingsRepository`.
- **`data/`**:
  - `repositories/settings.repository.impl.ts`: `SettingsRepositoryImpl` (`settingsRepository`).
  - `backup-format.ts`: `BACKUP_TABLES` (18 tabel), `MAX_BACKUP_BYTES` (10 MB), `MAX_BACKUP_ROWS` (50.000), `BackupDocument` (`format: 'mylife-backup'`, `formatVersion: 1`, `schemaVersion: 3`), `serializeBackup`, `parseBackup`, `summarizeBackup`.
  - `backup-store.ts`: `readBackupData`, `replaceBackupData`, `replaceIfUnchanged`.
  - `services/backup-file.service.ts` (Native) & `backup-file.service.web.ts` (Web).
- **`presentation/`**:
  - `hooks/use-settings.ts`
  - `screens/settings-screen.tsx`

---

## 2. User Flow & Keamanan Backup/Restore

1. **Preferensi & Lokasi**:
   - Mengatur **Lokasi & Jadwal Azan** (pilih dari `INDONESIA_PRAYER_CITIES` dengan filter WIB/WITA/WIT atau koordinat kustom -> langsung memperbarui `prayer-location-store`), **Kategori target** (`CategoryManagerModal`), dan **Preferensi fokus** (keep-awake, durasi Pomodoro `[15, 25, 45, 60]`, durasi Deep Flow `[45, 50, 60, 90]`, getaran haptik).
   - Perubahan disimpan secara sekuensial lewat antrean `settingsSaveQueue`.
2. **Statistik Lokal (`DatabaseStats`)**:
   - Menampilkan jumlah baris aktual pada tabel `targets`, `tasks`, `focus_sessions`, dan `agenda_events`.
3. **Ekspor Cadangan JSON**:
   - `exportBackupJson()` membaca seluruh **18 tabel** dalam satu transaksi sinkron dan mengekspornya sebagai berkas `.json` (`schemaVersion: 3`).
4. **Pemulihan Aman (Safe Restore)**:
   - `inspectBackup` memvalidasi berkas via `parseBackup` (mendukung upgrade dari `schemaVersion` 1 & 2 serta snapshot migrasi) dan menampilkan ringkasan isi di bottom sheet konfirmasi.
   - Pengguna wajib mengetik **`PULIHKAN`** untuk mengaktifkan tombol pemulihan.
   - Proses restore: menyimpan salinan pengaman kondisi saat ini (`mylife-sebelum-pemulihan.json` di native / `localStorage` di web) -> menguji restore di SQLite `:memory:` (`PRAGMA foreign_keys = ON`, `PRAGMA integrity_check`, `PRAGMA foreign_key_check`) -> menerapkan ke DB utama secara atomik lewat `replaceIfUnchanged` (termasuk `consolidateProjects` & `migrateTaskPlanning`) -> memanggil `notifyDataRestored()`, me-reset navigasi ke `/(tabs)`, dan menyelaraskan ulang alarm & pengingat kalender.
   - Catatan penting: Berkas audio lagu alarm kustom disimpan di folder dokumen perangkat dan **tidak ikut dalam cadangan JSON**; sistem menampilkan peringatan agar pengguna memilih ulang lagu kustom setelah pemulihan.
