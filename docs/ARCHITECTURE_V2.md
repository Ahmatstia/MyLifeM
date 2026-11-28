# Arsitektur Sistem MyLife (v2)

> Dokumen arsitektur teknis aktual berdasarkan `src/` per 28 November 2026.

---

## 1. Tech Stack

- **Framework**: Expo `~58.0.19` (`expo-router ~58.0.32`), React `19.3.0`, React Native `0.88.1`, TypeScript `~6.0.3`.
- **Database & ORM**: `expo-sqlite ~58.0.18` + `drizzle-orm ^0.45.4` (mode Web menggunakan output `"server"` dengan header COEP `credentialless` & COOP `same-origin` di `app.json` untuk SQLite WASM/OPFS worker).
- **State & UI**: `zustand ^5.0.16` (untuk store notifikasi), `nativewind ^4.2.7`, `lucide-react-native ^1.61.0`, `react-native-reanimated 4.7.1`, `@expo-google-fonts/fredoka`, `@expo-google-fonts/plus-jakarta-sans`.
- **Perangkat & Layanan**: `expo-notifications ~58.1.9`, `expo-audio ~58.0.12`, `expo-file-system ~58.0.11`, `expo-sharing ~58.0.23`, `expo-haptics ~58.0.8`, `expo-keep-awake ~58.0.3`, `adhan ^4.4.6`.

---

## 2. Arsitektur Layer (`src/`)

Aplikasi menerapkan **Feature-Based Clean Architecture** dengan **Expo Router thin route adapters**:

```text
src/
├── app/          # Rute Expo Router (adapter tipis ke screens/ atau <Redirect>)
├── features/     # 10 modul fitur aktif (domain / data / presentation)
├── db/           # Koneksi SQLite, skema Drizzle (18 tabel), migrasi, integritas
├── shared/       # Komponen UI bersama, notification-store, task-status, hooks, utils
└── theme/        # Palet Kertas Hangat (today.ts, colors.ts) & design tokens (tokens.ts)
```

### 2.1 Routing Layer (`src/app/`)
- **`_layout.tsx` (`RootLayout`)**: Menahan `SplashScreen`, memanggil `initDatabase()` dengan UI pemulihan bila gagal, merender `<Stack key={dataRevision}>` bersama 3 komponen global: `<AlarmRingingModal />`, `<CalendarReminderSync />`, dan `<ManagedAlarmSync />`.
- **`(tabs)/_layout.tsx` (`TabLayout`)**: Floating pill bottom bar dengan 5 slot (`index` -> Hari Ini, `tasks` -> Tugas, `add` -> `<TabFabButton />` ke `/quick-add`, `agenda` -> Kalender, `menu` -> membuka `<AppSidebarDrawer />`) plus tab tersembunyi `projects` (`href: null`).
- **Rute Stack & Modal**:
  - `quick-add.tsx` (`transparentModal`) -> `QuickAddScreen`
  - `tasks/new.tsx`, `tasks/[id].tsx`, `task-manager/new.tsx` -> `TaskEditorScreen` / `TaskDetailScreen`
  - `targets/index.tsx`, `targets/new.tsx`, `targets/[id].tsx` -> `TargetListScreen` / `CreateTargetScreen` / `TargetDetailScreen`
  - `agenda/new.tsx` -> `CreateAgendaScreen`
  - `review.tsx`, `settings.tsx`, `notifications.tsx`, `reminders.tsx`
  - Redirect kompatibilitas: `task-manager.tsx` -> `/(tabs)/tasks`; `today/new.tsx` -> `/tasks/new?today=1`; `(tabs)/projects.tsx` & `projects/new.tsx` -> `/targets*`; `projects/[id].tsx` -> `/targets/[id]` via `getConvertedProjectTarget`.

### 2.2 Feature Modules (`src/features/`)
1. `today-focus/` — Fokus harian, Focus Timer persisten (`focus_timer_v1`), refleksi sesi.
2. `tasks/` — Layanan tugas terpadu (`task.service.ts`), kotak masuk, checklist langkah, blok kerja, kapasitas harian, tinjauan 7 hari.
3. `task-manager/` — Manajemen tugas terjadwal Dual-Date, alarm keras (`AlarmRingingModal`), audio synthesizer WAV & lagu kustom (`TaskAlarmAudioService`), penjadwal notifikasi alarm (`TaskAlarmNotificationService`).
4. `quick-add/` — Bottom sheet launcher (`/quick-add`).
5. `targets/` — Target hidup & kalkulasi progres terpadu.
6. `stages/` — Tahapan peta jalan milik Target & reordering atomik.
7. `categories/` — Kategori Target dengan proteksi hapus.
8. `agenda/` — Agenda harian, master jadwal rutin mingguan (`weekly_schedules` + `weekly_schedule_logs`), proyeksi pengingat 28 hari (`AgendaNotificationService`, `CalendarReminderSync`).
9. `prayer-times/` — Kalkulasi jadwal salat metode `CalculationMethod.Singapore()` (`adhan`) & store lokasi in-memory (`prayer-location-store.ts`).
10. `settings/` — Preferensi fokus & lokasi azan, statistik DB, serta ekspor/impor JSON (`backup-format.ts`, `backup-store.ts`, `backup-file.service*.ts`).

*(Catatan: folder `src/features/projects/` sudah kosong/tidak aktif.)*

### 2.3 Shared Layer (`src/shared/`)
- **`shared/domain/task-status.ts` & `shared/data/task-status.ts`**: Normalisasi status (`DONE` -> `COMPLETED`), `summarizeTasks()`, dan `writeTaskStatus()` yang menyinkronkan `tasks`, `agenda_events`, `daily_focus_items`, `task_actions`, lalu memanggil `notifyTaskChanges()`.
- **`shared/notifications/notification-store.ts`**: Store Zustand `useNotificationStore` untuk notifikasi in-app (`calendar`, `tasks`).
- **`shared/hooks/`**: `useFocusedResource` (refetch saat fokus dengan guard race-condition), `useDeviceCalendar`, `useReducedMotion`, `useOpenAddFromParam`.
- **`shared/utils/local-date.ts`**: Utilitas tanggal/jam lokal bebas bug UTC (`formatLocalDate`, `shiftDate`, `localDayBounds`, `localTimeToIso`).

---

## 3. Skema Database SQLite (`src/db/`)

`DATABASE_VERSION = 2` pada `mylife.db` dengan `PRAGMA foreign_keys = ON`. Total **18 tabel**, **19 foreign keys**, dan **5 trigger integritas** (`src/db/schema.ts`, `schema-sql.ts`, `integrity.ts`):

| Kelompok | Tabel | Peran Utama |
|---|---|---|
| **Organisasi & Target** | `categories` | Kategori Target (unik case-insensitive, `ON DELETE RESTRICT` dari `targets`) |
| | `life_pillars` | Tabel pilar legacy/kompatibilitas |
| | `targets` | Target hidup (`MILESTONE_BASED`, `NUMERIC`, `MAINTENANCE`) |
| | `stages` | Tahapan di bawah Target (`parent_type = 'TARGET'`) |
| **Tugas & Perencanaan** | `tasks` | Sumber kebenaran tunggal semua tugas |
| | `task_profiles` | Ekstensi 1:1 `tasks` (`planning_state`, `next_action`, `execution_date/time`, `deadline_time`, `alert_mode`, `alarm_track_*`, `snooze_*`) |
| | `task_steps` | Checklist sub-langkah per tugas |
| | `daily_focus_items` | Tugas yang dipilih untuk tanggal tertentu (unik `date, task_id`) |
| | `day_plans` | Kapasitas menit fokus per tanggal |
| | `day_reviews` | Catatan refleksi harian (`accomplishment`, `obstacle`, `next_action`) |
| | `task_actions` | Log riwayat aksi tugas (`SELECT`, `REMOVE`, `SCHEDULE`, status) |
| **Fokus & Kalender** | `focus_sessions` | Riwayat sesi timer (`POMODORO`, `DEEP_FLOW`, `STOPWATCH`) + refleksi |
| | `agenda_events` | Agenda harian & blok kerja tugas (`task_id`) |
| | `weekly_schedules` | Master jadwal rutin mingguan (Senin–Minggu, `1..7`) |
| | `weekly_schedule_logs` | Status selesai/libur per tanggal untuk jadwal mingguan |
| **Sistem & Legacy** | `user_settings` | Key-value pengaturan, timer (`focus_timer_v1`), detail quick-task, lagu alarm kustom (`custom_alarm_tracks_v1`), pemetaan migrasi |
| | `projects`, `milestones` | Tabel kompatibilitas legacy/backup (dikonversi otomatis oleh `consolidateProjects`) |

### Trigger Integritas (`src/db/integrity.ts`)
- `task_owner_insert` & `task_owner_update`: Memastikan `tasks.stage_id` dan `tasks.milestone_id` konsisten dengan pemiliknya.
- `stage_owner_update` & `milestone_owner_update`: Mencegah pemindahan induk jika masih ada tugas terkait.
- `task_history_delete`: Menyimpan snapshot `OLD.title` ke `focus_sessions.task_title` dan menandai `agenda_events` terkait selesai sebelum baris `tasks` dihapus.

---

## 4. Sinkronisasi Latar Belakang & Pemulihan Data

1. **Sinkronisasi Pengingat & Alarm**:
   - `ManagedAlarmSync` berlangganan `notifyTaskChanges()` dan pergantian hari kalender (`useDeviceCalendar`), lalu memanggil `managedTaskRepository.syncAlarms()`, `syncCalendarReminders()`, dan `checkDueAlarmsNow()`.
   - `CalendarReminderSync` mengobservasi tap notifikasi agenda/mingguan dan menerbitkan status peringatan izin ke `useNotificationStore`.
   - `AlarmRingingModal` melakukan polling 6 detik saat app di foreground untuk memicu alarm yang jatuh tempo dalam jendela 5 menit.
2. **Migrasi & Restore**:
   - `initDatabase()` membuat snapshot pra-migrasi, memverifikasi `PRAGMA integrity_check` & `PRAGMA foreign_key_check`, serta menjalankan `migrateTaskPlanning` & `consolidateProjects`.
   - Saat restore backup (`schemaVersion: 3`), sistem menguji JSON pada SQLite `:memory:`, menyimpan cadangan pengaman (`mylife-sebelum-pemulihan.json` / `localStorage`), melakukan penggantian atomik via `replaceIfUnchanged`, dan memanggil `notifyDataRestored()` agar `RootLayout` me-remount seluruh navigasi dan komponen sync.
