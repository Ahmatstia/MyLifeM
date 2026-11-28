# Spesifikasi Fitur: Kalender Harian & Jadwal Rutin (`agenda`)

> **Direktori**: `src/features/agenda/`  
> **Rute Terkait**: `/(tabs)/agenda` (`AgendaScreen`), `/agenda/new` (`CreateAgendaScreen`), serta `<CalendarReminderSync />` di `RootLayout`

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/agenda.entity.ts`: `AgendaEventType` (`'WORK' | 'PERSONAL' | 'LEARNING' | 'MEETING'`), `AgendaEventEntity`, `CreateAgendaInput`.
  - `entities/weekly-schedule.entity.ts`: `WEEKLY_SCHEDULE_TYPES` (`'COLLEGE' | 'WORK' | 'STUDY' | 'PERSONAL' | 'ROUTINE'`), `validateWeeklySchedule`, `isDailyRoutine`, `isCommitment`, `ProjectedWeeklyOccurrence`, `DAY_NAMES`, `getDayOfWeekFromDate`.
  - `agenda-time.ts`: `allDayDates`, `validateAgenda`, `occursOnDate`, `reminderTrigger`, `conflictingEventIds`.
  - `weekly-reminders.ts`: `WEEKLY_REMINDER_DAYS = 28`, `projectWeeklyReminders(schedules, logs, now)`.
  - `repositories/`: `agenda.repository.ts`, `weekly-schedule.repository.ts`.
- **`data/`**:
  - `repositories/agenda.repository.impl.ts` (`agendaRepository`)
  - `repositories/weekly-schedule.repository.impl.ts` (`weeklyScheduleRepository`)
  - `services/agenda-notification.service.ts` (`AgendaNotificationService`, `MAX_PENDING_REMINDERS = 50`)
  - `services/calendar-reminder.service.ts` (`syncCalendarReminders`)
- **`presentation/`**:
  - `hooks/`: `use-agenda.ts`, `use-weekly-schedules.ts`, `use-next-schedule.ts`.
  - `screens/`: `agenda-screen.tsx`, `create-agenda-screen.tsx`.
  - `components/`: `date-strip-header.tsx`, `daily-routine-checklist.tsx`, `weekly-occurrence-card.tsx`, `timeline-event-card.tsx`, `weekly-schedule-manager.tsx`, `add-edit-weekly-schedule-modal.tsx`, `add-event-modal.tsx`, `calendar-reminder-sync.tsx`.

---

## 2. User Flow & Aturan Aktual

1. **Kalender Harian (`AgendaScreen` mode `DAILY`)**:
   - `DateStripHeader` menampilkan strip mingguan yang dapat diperluas menjadi kalender bulanan.
   - Menggabungkan 3 sumber pada tanggal terpilih:
     1. **Rutinitas Harian** (`scheduleType === 'ROUTINE'`) -> `DailyRoutineChecklist` (collapsible, bisa dicentang atau diliburkan hari itu saja lewat `weekly_schedule_logs`).
     2. **Jadwal Rutin Komitmen** (`COLLEGE`, `WORK`, `STUDY`, `PERSONAL`) -> `WeeklyOccurrenceCard`.
     3. **Agenda & Blok Kerja** (`agenda_events`, all-day lalu timed) -> `TimelineEventCard`, lengkap dengan banner deteksi bentrok waktu (`conflictingEventIds`).
   - Jika `agenda_events.taskId` terisi, judul & status selesai disinkronkan langsung dengan `tasks` (`writeTaskStatus`), dan kartu menampilkan tautan **"Buka tugas"** ke `/tasks/[id]`.
2. **Master Jadwal Rutin (`AgendaScreen` mode `WEEKLY_MASTER`)**:
   - Mengelola template jadwal mingguan per hari (`Sen`–`Min`) di tabel `weekly_schedules`, termasuk pembuatan banyak hari sekaligus (`createWeeklySchedulesForDays`) dengan preset "Setiap Hari" / "Hari Kerja".
3. **Pengingat Notifikasi (Jendela 28 Hari)**:
   - `syncCalendarReminders()` menggabungkan pengingat `agenda_events` dan proyeksi 28 hari `weekly_schedules` (mengecualikan log yang sudah selesai/diliburkan), lalu menjadwalkan maksimal **50 notifikasi terdekat** via `AgendaNotificationService` pada channel `'agenda'`.
   - Jika ada izin notifikasi / exact alarm yang belum aktif, `CalendarReminderSync` mempublikasikan peringatan ke `useNotificationStore` (muncul di `/notifications` & `/reminders`).
   - Mengetuk notifikasi mengarahkan ke `/tasks/[id]` (jika ada `taskId`) atau `/(tabs)/agenda?date=...`.
