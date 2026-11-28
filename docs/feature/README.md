# Indeks Dokumentasi Fitur MyLife

Dokumentasi teknis dan fungsional untuk seluruh **10 modul fitur aktif** di `src/features/`, disusun sesuai implementasi aktual di kode sumber.

---

## Daftar Modul Fitur

| Fitur | Direktori Sumber | Peran Utama | Spesifikasi |
|---|---|---|---|
| **Hari Ini & Focus Timer** | `src/features/today-focus/` | Prioritas harian, Focus Timer persisten, refleksi sesi | [today-focus.md](./today-focus/today-focus.md) |
| **Tugas & Tinjauan** | `src/features/tasks/` | `taskService`, Kotak Masuk, langkah tugas, kapasitas harian, tinjauan 7 hari | [tasks.md](./tasks/tasks.md) |
| **Manajemen Alarm Tugas** | `src/features/task-manager/` | Tugas terjadwal Dual-Date, alarm keras & lagu kustom, modal berdering | [task-manager.md](./task-manager/task-manager.md) |
| **Tambah Cepat** | `src/features/quick-add/` | Modal bottom sheet `/quick-add` untuk memilih jenis entri baru | [quick-add.md](./quick-add/quick-add.md) |
| **Target Hidup** | `src/features/targets/` | Daftar & detail Target, filter kategori, progres terpadu | [targets.md](./targets/targets.md) |
| **Tahapan Target** | `src/features/stages/` | Tahapan peta jalan milik Target, reordering atomik, tugas tahap | [stages.md](./stages/stages.md) |
| **Kategori Target** | `src/features/categories/` | CRUD kategori Target dengan proteksi hapus | [categories.md](./categories/categories.md) |
| **Kalender & Jadwal Rutin** | `src/features/agenda/` | Kalender harian, master jadwal mingguan, deteksi bentrok, pengingat 28 hari | [agenda.md](./agenda/agenda.md) |
| **Jadwal Salat** | `src/features/prayer-times/` | Kalkulasi waktu salat (`adhan`) & lokasi azan | [prayer-times.md](./prayer-times/prayer-times.md) |
| **Pengaturan & Backup** | `src/features/settings/` | Preferensi fokus, lokasi azan, statistik DB, ekspor/restore JSON 18 tabel | [settings.md](./settings/settings.md) |

---

## Standar Arsitektur Fitur

1. **Pemisahan Layer**: Setiap fitur memisahkan `domain/` (entities, interfaces, pure logic), `data/` (implementasi repository/service ke SQLite/Drizzle & layanan perangkat), dan `presentation/` (hooks, screens, components).
2. **Thin Route Adapters**: File di `src/app/` hanya merender screen dari `src/features/*` atau melakukan `<Redirect>`.
3. **Single Source of Truth**: Perubahan status tugas wajib melalui `writeTaskStatus` (`src/shared/data/task-status.ts`) agar `tasks`, `agenda_events`, `daily_focus_items`, `task_actions`, dan sinkronisasi alarm/kalender tetap konsisten.
4. **Tema & Desain**: Menggunakan token **Kertas Hangat MyLife** (`src/theme/today.ts`, `colors.ts`, `tokens.ts`).
