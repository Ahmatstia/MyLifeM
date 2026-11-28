# Spesifikasi Fitur: Manajemen Tugas Terjadwal & Alarm Keras (`task-manager`)

> **Direktori**: `src/features/task-manager/`  
> **Komponen Global di `RootLayout`**: `<ManagedAlarmSync />`, `<AlarmRingingModal />`  
> **Rute Terkait**: `/task-manager` (redirect ke `/(tabs)/tasks`), `/task-manager/new` (`TaskEditorScreen`)

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/managed-task.entity.ts`: `TaskAlertMode` (`'ALARM' | 'NOTIFICATION' | 'BOTH' | 'NONE'`), `TaskCategoryType` (`'COLLEGE' | 'WORK' | 'PROJECT' | 'PERSONAL'`), `BUILT_IN_ALARM_TRACKS` (3 nada bawaan `builtin://*`), `computeDeadlineBufferInfo` (`safe`, `tight`, `critical`, `overdue`, `done`), `ManagedTaskEntity`.
  - `managed-task-validation.ts`: `validateManagedTaskTiming`, `validateManagedTask`, `parseManagedTasks`.
- **`data/`**:
  - `repositories/managed-task.repository.ts`: `managedTaskRepository` — membaca/menulis jadwal pengerjaan dari `tasks`, `task_profiles`, `task_steps`, serta daftar lagu kustom di `user_settings` (`custom_alarm_tracks_v1`). Menyediakan `checkDueAlarmsNow()`, `triggerAlarmNow()`, `snoozeTaskAlarm()`, `dismissTaskAlarm()`, dan `openAlarmFromNotification()`.
  - `services/task-alarm-audio.service.ts`: `TaskAlarmAudioService` — menyintesis file WAV PCM 16-bit untuk track `builtin://`, memilih & menyalin lagu kustom ke `Paths.document`, memutar preview (maks 8 detik), serta memutar audio loop + getaran haptik saat alarm berbunyi.
  - `services/task-alarm-notification.service.ts`: `TaskAlarmNotificationService` — mengelola channel Android `task-alarm-loud` (`MAX`, `bypassDnd: true`) dan `task-reminder-std` (`HIGH`), menjadwalkan hingga 50 notifikasi (`managed-task-prep-*` H-15 menit & `managed-task-exec-*`), serta mempublikasikan status izin ke `useNotificationStore`.
- **`presentation/`**:
  - `hooks/use-managed-tasks.ts`
  - `screens/task-manager-screen.tsx`, `create-managed-task-screen.tsx`
  - `components/add-managed-task-modal.tsx`, `alarm-ringing-modal.tsx`, `managed-alarm-sync.tsx`

---

## 2. User Flow Alarm Keras

1. **Penjadwalan Dual-Date**: Tugas memiliki tanggal/jam tenggat (`due_date`, `deadline_time`) terpisah dari jadwal pengerjaan (`execution_date`, `execution_time`) pada `task_profiles`.
2. **Pemicuan Alarm**:
   - **Saat App Aktif**: `AlarmRingingModal` memeriksa `checkDueAlarmsNow()` setiap 6 detik (jendela pengejaran keterlambatan maksimal 5 menit) dan `ManagedAlarmSync` memeriksa saat ada perubahan tugas/hari. Jika jatuh tempo, modal layar penuh muncul dan `TaskAlarmAudioService.startAlarmRinging()` berbunyi.
   - **Saat App di Background/Tertutup**: Notifikasi OS `expo-notifications` (`managed-task-exec-<id>`) berbunyi; saat diketuk, `ManagedAlarmSync` memanggil `openAlarmFromNotification()`.
3. **Aksi di `AlarmRingingModal`**:
   - **Mulai Kerjakan Sekarang**: Mematikan alarm (`dismissTaskAlarm`) dan menavigasi ke `/tasks/[id]`.
   - **Tunda (Snooze)**: Memperbarui `snoozed_until_iso` sesuai `snooze_minutes` (5/10/15 menit) dan menjadwalkan ulang notifikasi.
   - **Tandai Sudah Selesai**: Menandai tugas `COMPLETED` dan membatalkan alarm tersisa.
   - **Matikan Alarm**: Mencatat `last_alarm_fired_key` agar occurrence yang sama tidak berdering ulang.
   - **Tes Alarm**: Mode uji otomatis berhenti setelah 10 detik.
