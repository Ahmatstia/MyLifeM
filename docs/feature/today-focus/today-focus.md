# Spesifikasi Fitur: Hari Ini & Focus Timer (`today-focus`)

> **Direktori**: `src/features/today-focus/`  
> **Rute Terkait**: `/(tabs)` (`TodayFocusScreen`), `/today/new` (redirect ke `/tasks/new?today=1`)

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/daily-focus.entity.ts`: `FocusTimerMode` (`'POMODORO' | 'DEEP_FLOW' | 'STOPWATCH'`), `TIMER_PRESETS`, `TaskEntity`, `DailyFocusItemEntity`, `FocusSessionEntity`, `SaveSessionInput`.
  - `repositories/daily-focus.repository.ts`: Interface `DailyFocusRepository`.
  - `focus-timer.ts`: `TIMER_KEY = 'focus_timer_v1'`, `TimerState`, `parseTimer`, `elapsedAt`, `timerDue`, `finishTimerState`.
  - `quick-task.ts`: `QUICK_TASK_CATEGORIES`, `QUICK_TASK_DETAILS_PREFIX = 'quick_task_details_v1:'`, `validateQuickTaskOptions`, `parseQuickTaskDetails`.
- **`data/`**:
  - `repositories/daily-focus.repository.impl.ts`: `DailyFocusRepositoryImpl` (`dailyFocusRepository`).
  - `repositories/focus-timer.repository.ts`: `focusTimerRepository` (persistensi timer di tabel `user_settings`).
- **`presentation/`**:
  - `hooks/`: `use-today-focus.ts`, `use-focus-timer.ts`.
  - `screens/`: `today-focus-screen.tsx`, `create-priority-screen.tsx`.
  - `components/`: `focus-timer-widget.tsx`, `minute-dial.tsx`, `session-reflection-modal.tsx`, `add-priority-modal.tsx`, `priority-task-card.tsx`.

---

## 2. User Flow & Perilaku Aktual

1. **Layar Utama (`TodayFocusScreen`)**:
   - Menampilkan header tanggal, tombol lonceng notifikasi (`/notifications`), `PrayerTimesWidget`, hero card **Focus Timer**, `DayPlanPanel` (dari `features/tasks`), dan daftar terpadu hari ini (filter `ALL`, `OPEN`, `DONE`) yang menggabungkan `daily_focus_items`, `agenda_events` non-tugas, dan `weeklyOccurrences`.
   - Tidak ada batas keras 5 tugas prioritas harian dan tidak ada *auto-rollover* dari hari sebelumnya.
   - Menekan item tugas dari `task-manager` (`id.startsWith('mtask-')` tanpa `targetId`) menavigasi ke `/task-manager`.
2. **Focus Timer Persisten (`useFocusTimer` + `focusTimerRepository`)**:
   - Mendukung 3 mode: **Pomodoro** (default dari `settingsRepository`, preset `[25, 50]`), **Deep Flow** (`[50, 90]`), dan **Stopwatch** (`[0]`), serta opsi cepat **"Mulai kecil: siapkan 5 menit"**.
   - State timer disimpan di `user_settings` (`focus_timer_v1`) dengan `runStartedAt` dan `elapsedMs` agar akurat meski aplikasi ditutup atau berpindah ke background (`AppState` listener).
   - Mendukung `expo-keep-awake` dan `expo-haptics` sesuai pengaturan pengguna.
   - Saat selesai manual (`finish`) atau waktu habis (`timerDue`), `focusTimerRepository` otomatis menyimpan baris ke `focus_sessions` dan menambah `tasks.actual_minutes` dalam satu transaksi SQLite. Menyelesaikan sesi timer tidak otomatis menandai tugas induk sebagai `COMPLETED`.
3. **Refleksi Sesi (`SessionReflectionModal`)**:
   - Setelah sesi selesai, modal refleksi muncul untuk mengisi rating (1–5 bintang), hambatan (`obstacle`), dan langkah berikutnya (`nextAction`). Menutup modal tetap mempertahankan sesi yang sudah tersimpan.
4. **Tugas Cepat**:
   - `createQuickTask` menyisipkan baris ke `tasks`, detail kategori/durasi opsional ke `user_settings` (`quick_task_details_v1:<taskId>`), dan langsung menautkannya ke `daily_focus_items`.
