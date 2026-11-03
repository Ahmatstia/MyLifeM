# Spesifikasi Fitur: Master Jadwal Mingguan (KRS & Ritme Kerja)

**Modul:** Agenda (`src/features/agenda`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status:** Disetujui untuk Implementasi  
**Target Rilis:** MyLife v1.1.0 (Fitur Agenda Terintegrasi)

---

## 1. Ringkasan Eksekutif & Latar Belakang

### 1.1 Masalah Pengguna (*Problem Statement*)
Pengguna utama MyLife (mahasiswa, pembelajar mandiri, dan profesional yang sedang meningkatkan keterampilan) memiliki **jadwal mingguan yang bersifat mutlak dan berulang**:
* **Contoh riil**: Setiap hari Senin ada jadwal *Kuliah (08:00)*, *Bimbingan Skripsi (10:00)*, dan *Shift Kerja (14:00 - 18:00)*. Hari Selasa hingga Minggu memiliki pola berbeda yang juga berulang secara teratur.
* **Kelemahan sistem saat ini**: Fitur Agenda yang ada saat ini hanya mencatat *agenda insidental satu kali* (`agenda_events` dengan timestamp absolut). Pengguna terpaksa menginput ulang jadwal yang sama setiap hari atau setiap minggu, menimbulkan friksi mental yang tinggi dan membuat aplikasi tidak praktis untuk kebutuhan harian nyata.

### 1.2 Solusi yang Dirancang
Membangun sistem **Master Jadwal Mingguan (sistem ala KRS Kampus & Shift Kerja)** yang terintegrasi secara mulus dengan kalender harian:
1. **Master Timetable (Template KRS Mingguan)**: Pengguna mendefinisikan jadwal mingguan tetap (Senin s/d Minggu) sekali saja, lengkap dengan jam, tipe kegiatan, lokasi, dan pengingat.
2. **Virtual Realtime Projection**: Jadwal mingguan otomatis terproyeksi ke tampilan harian ("Hari Ini" dan tab "Agenda") secara *realtime* mengikuti tanggal kalender lokal perangkat tanpa perlu meng-copy ribuan baris data ke database.
3. **Pencatatan Status Harian (Override & Completion)**: Jadwal rutin dapat dicentang selesai atau ditandai ditiadakan pada tanggal spesifik tanpa merusak master template jadwal mingguan.
4. **Harmoni Agenda Khusus & Rutin**: Pengguna tetap bisa menambahkan agenda insidental (misal: "Janji Dokter jam 19:00 hari ini") berdampingan dengan jadwal rutin.

---

## 2. Arsitektur Teknis & Pola Desain

### 2.1 Perbandingan Strategi Sistem
Sebagai sistem analis, kita mengevaluasi dua opsi arsitektur:

| Kriteria Evaluasi | Opsi A: Batch Event Materialization | Opsi B: Virtual Projection Layer (Dipilih) |
| :--- | :--- | :--- |
| **Mekanisme** | Men-generate baris `agenda_events` konkret untuk 1 tahun ke depan. | Menyimpan master jadwal mingguan di tabel terpisah, lalu memproyeksikannya secara runtime saat tanggal dibuka. |
| **Beban Database** | Sangat besar (ratusan baris terbuat secara redundan). | Sangat ringan (hanya menyimpan n-jadwal master). |
| **Perubahan Jadwal (KRS diubah)** | Rentan error; harus menghapus dan men-generate ulang baris di masa depan. | Instan; perubahan langsung berlaku ke seluruh minggu mendatang secara otomatis. |
| **Ukuran Backup & Restore** | File JSON membengkak drastis. | File JSON cadangan tetap kompak dan terstruktur bersih. |
| **Keputusan** | ❌ **Ditolak** | ✅ **Dipilih sebagai Arsitektur Resmi** |

### 2.2 Penanganan Waktu & Kalender Lokal
Mengikuti prinsip `docs/CALENDAR_IMPLEMENTATION_2026-10-26.md`:
* Master jadwal mingguan menyimpan hari (`day_of_week` integer 1–7; 1 = Senin, 7 = Minggu) dan jam lokal dalam format string `HH:mm` (misal `"08:00"`, `"10:00"`).
* Runtime projection menggunakan fungsi `formatLocalDate(date)` dan zona waktu lokal perangkat (`WIB`, `WITA`, `WIT`).
* Tidak terjadi pergeseran tanggal akibat UTC date-slicing.

---

## 3. Desain Model Data & Database

### 3.1 Skema Tabel Baru (Drizzle ORM & SQLite)

Migrasi database dari skema `v1` ke `v2` (`PRAGMA user_version = 2`) menambahkan dua tabel baru:

#### A. Tabel Master: `weekly_schedules`
Menyimpan definisi jadwal berulang mingguan.

```typescript
// src/db/schema.ts
export const weeklySchedules = sqliteTable(
  'weekly_schedules',
  {
    id: text('id').primaryKey().notNull(),
    dayOfWeek: integer('day_of_week').notNull(), // 1 = Senin, 2 = Selasa, ..., 7 = Minggu
    title: text('title').notNull(),
    startTime: text('start_time').notNull(),      // Format 'HH:mm', misal '08:00'
    endTime: text('end_time').notNull(),          // Format 'HH:mm', misal '10:00'
    scheduleType: text('schedule_type').notNull().default('COLLEGE'), // 'COLLEGE' | 'WORK' | 'STUDY' | 'PERSONAL'
    location: text('location'),                   // Contoh: 'Ruang 304', 'Gedung A', 'Kantor'
    notes: text('notes'),                         // Catatan tambahan (nama dosen, link, PIC)
    reminderMinutes: integer('reminder_minutes').default(15), // Pengingat menit sebelum mulai
    isActive: integer('is_active').notNull().default(1),      // 1 = Aktif, 0 = Diliburkan/Nonaktif
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_weekly_schedules_day_time').on(table.dayOfWeek, table.startTime),
    check('chk_day_of_week', sql`${table.dayOfWeek} BETWEEN 1 AND 7`),
    check('chk_schedule_time_order', sql`${table.startTime} < ${table.endTime}`),
    check('chk_schedule_is_active', sql`${table.isActive} IN (0, 1)`),
  ]
);
```

#### B. Tabel Override Status Harian: `weekly_schedule_logs`
Menyimpan catatan kehadiran atau pembatalan harian spesifik per tanggal kalender.

```typescript
// src/db/schema.ts
export const weeklyScheduleLogs = sqliteTable(
  'weekly_schedule_logs',
  {
    id: text('id').primaryKey().notNull(),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => weeklySchedules.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // 'YYYY-MM-DD' lokal
    isCompleted: integer('is_completed').notNull().default(0), // 1 = Hadir / Selesai
    isCancelled: integer('is_cancelled').notNull().default(0), // 1 = Libur / Batal di hari ini
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_schedule_logs_unique').on(table.scheduleId, table.date),
    index('idx_schedule_logs_date').on(table.date),
    check('chk_log_is_completed', sql`${table.isCompleted} IN (0, 1)`),
    check('chk_log_is_cancelled', sql`${table.isCancelled} IN (0, 1)`),
  ]
);
```

### 3.2 Relasi & Integritas Antar Tabel
* `weekly_schedules` $\rightarrow$ `weekly_schedule_logs` (1 : Many dengan `ON DELETE CASCADE`).
* Jika sebuah jadwal master dihapus, log harian yang terkait otomatis dibersihkan tanpa meninggalkan *orphan record*.
* Backup JSON 11 tabel diperluas menjadi 13 tabel secara transaksional, memastikan seluruh jadwal master dan log kehadiran ikut tercadangkan dan dapat dipulihkan (*round-trip restore*).

---

## 4. Perancangan Alur Pengguna & Antarmuka (UI/UX)

Mengadopsi bahasa desain **Botanical Pop** yang sudah berjalan:

### 4.1 Layar Tab Agenda (`/agenda`)
Layar Agenda dilengkapi dengan pengalih tampilan (*Segmented Header*):
1. **Mode "Hari Ini / Tanggal Dipilih" (Harian)**:
   * **Date Strip**: Memilih tanggal kalender.
   * **Gabungan Timeline**:
     * Menampilkan agenda insidental (`agenda_events`) dan jadwal master hari tersebut (`weekly_schedules`).
     * Jadwal master diberi tanda pembeda visual yang jelas:
       * Badge Aksen Tipe: `[KULIAH]`, `[KERJA]`, `[BELAJAR]`, `[PRIBADI]`.
       * Menampilkan lokasi (misal: `"R. 302"`).
     * Tombol aksi cepat:
       * Centang selesai untuk hari ini (mengisi `weekly_schedule_logs`).
       * Opsi "Ditiadakan hari ini" (misal: dosen berhalangan / kantor libur).
2. **Mode "Master KRS" (Jadwal Mingguan)**:
   * Menampilkan daftar hari terstruktur dari **Senin s/d Minggu**.
   * Tiap hari menampilkan daftar slot waktu yang rapi (misal: Senin: 4 mata kuliah/kerja, Selasa: 2 agenda).
   * Tombol `+ Tambah Jadwal Rutin`:
     * Form modal: Pilih Hari, Judul, Jam Mulai, Jam Selesai, Tipe (Kuliah/Kerja/Belajar/Pribadi), Ruang/Lokasi, Catatan, dan Pengingat.
   * Aksi Edit & Hapus Master Jadwal dengan dialog konfirmasi aman.

### 4.2 Integrasi Layar Utama "Hari Ini" (`/`)
* Pada dashboard utama "Hari Ini", di samping target dan timer fokus, ditambahkan indikator **"Agenda / Kuliah Berikutnya"**:
  * Menampilkan jadwal aktif yang sedang berlangsung atau yang akan datang paling dekat pada hari ini.
  * Memberikan orientasi waktu seketika tanpa mengharuskan pengguna membuka tab Agenda terlebih dahulu.

---

## 5. Rencana Rilis & Milestone Pekerjaan (Work Breakdown Structure)

| Sprint | Paket Pekerjaan | Komponen yang Dibuat/Diubah | Kriteria Selesai |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **Database & Migrasi (v1 $\rightarrow$ v2)** | `src/db/schema.ts`, `src/db/schema-sql.ts`, `src/db/migrations.ts`, `src/features/settings/data/backup-format.ts` | Migrasi `PRAGMA user_version = 2` berhasil di SQLite, FK aktif, ekspor/impor backup 13 tabel round-trip valid. |
| **Sprint 2** | **Domain & Data Repository** | `src/features/agenda/domain/entities/weekly-schedule.entity.ts`, `weekly-schedule.repository.ts`, `weekly-schedule.repository.impl.ts` | Repository mendukung CRUD master jadwal, query harian terproyeksi, dan update log kehadiran per tanggal. |
| **Sprint 3** | **UI Master Jadwal Mingguan (KRS View)** | `src/features/agenda/presentation/components/weekly-schedule-manager.tsx`, `add-edit-weekly-schedule-modal.tsx` | Pengguna dapat melihat matriks jadwal Senin–Minggu, menambah, mengedit, dan menghapus jadwal rutin. |
| **Sprint 4** | **Integrasi Timeline Harian & Hari Ini** | `src/features/agenda/presentation/hooks/use-agenda.ts`, `timeline-event-card.tsx`, `src/features/today-focus/presentation/screens/today-focus-screen.tsx` | Jadwal rutin muncul otomatis di timeline tanggal terkait, bisa dicentang selesai, dan jadwal berikutnya tampil di Hari Ini. |
| **Sprint 5** | **Verifikasi & Test Suites** | `scripts/check-calendar.cjs`, `scripts/check-backup.cjs`, `scripts/check-integrity.cjs` | Semua script pengujian lolos, `npm run lint` dan `npx tsc --noEmit` keluar dengan exit code 0. |

---

## 6. Aturan Bisnis & Batasan Sistem (*System Constraints*)

1. **Integritas Waktu**:
   * `start_time` harus lebih awal dari `end_time` (contoh: 08:00 - 10:00).
   * Validasi format jam ketat: `HH:mm` (24 jam: 00:00 - 23:59).
2. **Idempotensi Status Harian**:
   * Mencatat kehadiran untuk tanggal tertentu bersifat unik pada kombinasi `(schedule_id, date)`.
   * Centang/batalkan hari ini tidak pernah mengubah jadwal master minggu depan.
3. **Pengingat Perangkat**:
   * Rekonsiliasi notifikasi lokal hanya menjadwalkan pengingat untuk jadwal master pada minggu berjalan agar tidak melebihi kuota 50 notifikasi native OS.
4. **Privasi & Local-First**:
   * Seluruh jadwal KRS dan rutinitas kerja tersimpan 100% lokal di perangkat pengguna dalam SQLite, tanpa sinkronisasi server pihak ketiga.

