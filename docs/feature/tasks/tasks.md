# Spesifikasi Fitur: Tugas, Perencanaan Harian, & Tinjauan (`tasks`)

> **Direktori**: `src/features/tasks/`  
> **Rute Terkait**: `/(tabs)/tasks` (`TaskListScreen`), `/tasks/new` & `/task-manager/new` (`TaskEditorScreen`), `/tasks/[id]` (`TaskDetailScreen`), `/review` (`ReviewScreen`)

---

## 1. Struktur Modul

- **`domain/`**:
  - `deadline.ts`: `isTaskOverdue(date, time, status, now)` — validasi tenggat lokal (tugas bertanggal tanpa jam berlaku sepanjang hari lokal tersebut).
- **`data/`**:
  - `task.service.ts`: `taskService`, `PlanningState` (`'INBOX' | 'READY' | 'SOMEDAY' | 'WAITING'`), `TaskDraft`, `UnifiedTask`.
- **`presentation/`**:
  - `task-list-screen.tsx`: Daftar tugas dengan quick-capture ke `INBOX`, pencarian, dan filter (`INBOX`, `TODAY`, `ALL`, `SOMEDAY`, `WAITING`, `DONE`, `CANCELLED`).
  - `task-editor-screen.tsx`: Form layar penuh buat/ubah tugas (judul wajib, `nextAction`, `description`, `targetId`, `estimatedMinutes`, `dueDate`, `deadlineTime`, `priority`).
  - `task-detail-screen.tsx`: Detail tugas, aksi status, aksi Hari Ini ("Mulai fokus" -> pilih ke hari ini & navigasi ke `/(tabs)?focusTask=<id>`), checklist `task_steps`, dan manajemen blok waktu `agenda_events` (termasuk opsi alarm keras `loud`).
  - `day-plan-panel.tsx`: Panel di `TodayFocusScreen` untuk mengatur kapasitas menit harian (`day_plans`), membandingkan kapasitas vs estimasi tugas terpilih, memilih hingga 3 saran tugas aktif, dan membuka `/review`.
  - `review-screen.tsx`: Tinjauan 7 hari terakhir (`focus_sessions`, tugas selesai, `task_actions`), tindak lanjut rencana belum selesai ("Lanjut besok", "Atur ulang/pecah langkah", "Simpan untuk nanti"), dan form refleksi harian (`day_reviews`).

---

## 2. Tabel SQLite Terkait & Sinkronisasi

`taskService` mengelola `tasks`, `task_profiles`, `task_steps`, `daily_focus_items`, `day_plans`, `day_reviews`, dan `task_actions`:
- **Status Tugas**: Menggunakan `writeTaskStatus()` (`src/shared/data/task-status.ts`), lalu memanggil `sync()` (`managedTaskRepository.syncAlarms()` + `syncCalendarReminders()`).
- **Parkir Tugas (`park(id, state)`)**: Mengubah `planning_state` (mis. `SOMEDAY` / `WAITING`), menghapus `daily_focus_items` & `agenda_events` dari hari ini ke depan, serta mengosongkan jadwal alarm di `task_profiles`.
- **Blok Kerja & Alarm**: Menjadwalkan blok waktu melalui `schedule(...)` menulis ke `agenda_events` (`eventType: 'WORK'`). Jika `loud = true`, menggunakan ID `'task-block-legacy-' + id` dan menyinkronkan `execution_date`, `execution_time`, serta `alert_mode` di `task_profiles`.
- **Checklist Langkah (`task_steps`)**: Menambah/mencentang sub-langkah tidak otomatis menutup tugas induk.
