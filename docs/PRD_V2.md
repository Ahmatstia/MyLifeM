# Product Requirements Document (PRD v2) — MyLife

> Dokumen ini diselaraskan dengan implementasi aktual di `src/` dan [PRODUCT_BLUEPRINT_2026-11-27.md](./PRODUCT_BLUEPRINT_2026-11-27.md).

---

## 1. Janji Produk
**MyLife** adalah asisten produktivitas pribadi *offline-first* berbasis SQLite untuk mahasiswa, pekerja, dan pembelajar mandiri agar dapat:
1. Menangkap tugas dengan cepat ke **Kotak Masuk** tanpa form yang menghambat.
2. Menyusun **Target Hidup** dengan **Tahapan (Stages)** dan **Tugas (Tasks)** yang progresnya dihitung secara faktual.
3. Memilih pekerjaan untuk **Hari Ini** berdasarkan kapasitas waktu, lalu mengeksekusinya dengan **Focus Timer** (Pomodoro, Deep Flow, Stopwatch).
4. Mengatur jadwal pengerjaan terpisah dari tenggat (**Dual-Date**) dengan **Alarm Keras** (termasuk lagu kustom dari perangkat).
5. Mengelola **Kalender Harian** dan **Jadwal Rutin Mingguan** (kuliah/kerja/ibadah/rutinitas) lengkap dengan deteksi bentrok waktu.
6. Memantau **Jadwal Waktu Salat** harian di layar Hari Ini sesuai lokasi kota Indonesia atau koordinat kustom.
7. Melakukan **Tinjauan Harian & 7 Hari** untuk menindaklanjuti tugas yang belum selesai dan mencatat refleksi.

---

## 2. Model Mental & Alur Kerja Utama

```text
Kategori ──▶ Target ──▶ Tahapan (Stages) ──▶ Tugas (Tasks)
                                                │
       ┌────────────────────┬───────────────────┼───────────────────┐
       ▼                    ▼                   ▼                   ▼
  Kotak Masuk         Fokus Hari Ini      Blok Kalender       Alarm Keras
  (INBOX/READY)     (daily_focus_items)  (agenda_events)     (task_profiles)
                            │
                            ▼
                      Focus Timer ──▶ focus_sessions ──▶ Tinjauan (/review)
```

---

## 3. Struktur Navigasi Aktif

1. **Bottom Tab Bar (Floating Pill 5 Slot — `src/app/(tabs)/_layout.tsx`)**:
   - **Hari Ini** (`/(tabs)`): Jadwal salat (`PrayerTimesWidget`), ringkasan & widget Focus Timer, panel kapasitas harian (`DayPlanPanel`), daftar prioritas & jadwal hari ini, serta tombol lonceng notifikasi (`/notifications`).
   - **Tugas** (`/(tabs)/tasks`): Quick-capture ke `INBOX`, pencarian, filter status/perencanaan (`INBOX`, `TODAY`, `ALL`, `SOMEDAY`, `WAITING`, `DONE`, `CANCELLED`), dan navigasi ke rincian tugas (`/tasks/[id]`).
   - **Tambah** (`/quick-add` modal): Pintu masuk cepat memilih **Catat Tugas** (`/tasks/new`), **Target Hidup** (`/targets/new`), atau **Agenda & Kalender** (`/agenda/new`).
   - **Kalender** (`/(tabs)/agenda`): Mode *Kalender Harian* (strip kalender, deteksi bentrok waktu, rutinitas harian, jadwal rutin mingguan, agenda berjam/sepanjang hari) dan mode *Jadwal Rutin* (master jadwal Senin–Minggu).
   - **Menu** (`AppSidebarDrawer`): Akses ke `Semua Tugas`, `Target & Peta Jalan` (`/targets`), `Kalender & Jadwal Rutin`, `Tinjauan` (`/review`), dan `Pengaturan` (`/settings`).
2. **Rute Sekunder & Adapter**:
   - `/targets`, `/targets/new`, `/targets/[id]`
   - `/tasks/new`, `/tasks/[id]`, `/task-manager`, `/task-manager/new`
   - `/agenda/new`, `/review`, `/settings`, `/notifications`, `/reminders`
   - Adapter redirect legacy: `/(tabs)/projects`, `/projects/new`, `/projects/[id]` -> `/targets`; `/today/new` -> `/tasks/new?today=1`.

---

## 4. Aturan Bisnis Wajib

1. **Penyimpanan Lokal 100% On-Device**: Seluruh data disimpan di SQLite lokal (`mylife.db`) tanpa autentikasi atau server cloud.
2. **Proyek Dikonsolidasi ke Target**: Tidak ada lagi entitas Proyek aktif; seluruh rencana jangka menengah/panjang dikelola melalui `Target -> Stages -> Tasks`.
3. **Tanpa Batas Keras Prioritas Harian & Tanpa Auto-Rollover**: Pengguna bebas memilih jumlah tugas untuk `Hari Ini` tanpa batas 5 item. Tugas yang tidak selesai di hari sebelumnya tidak dipindah otomatis ke hari berikutnya, melainkan ditinjau lewat `/review` (lanjut besok / atur ulang / simpan untuk nanti).
4. **Satu Tugas Satu Sumber Kebenaran**: Memilih tugas ke `Hari Ini` (`daily_focus_items`) atau menjadwalkannya ke kalender (`agenda_events.task_id`) mereferensikan baris `tasks` yang sama tanpa menduplikasi tugas.
5. **Progres Faktual**: Progres Target dihitung dari tugas aktif (`status !== 'CANCELLED'`) milik Target maupun Tahapan di bawahnya. Menyelesaikan checklist langkah (`task_steps`) atau menyelesaikan sesi Focus Timer tidak otomatis menandai tugas induk sebagai `COMPLETED`.
6. **Status Tugas Terpusat**: Status tugas menggunakan `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Setiap perubahan status melalui `writeTaskStatus` menyinkronkan `tasks`, `agenda_events`, `daily_focus_items`, mencatat `task_actions`, dan memicu pembaruan alarm/pengingat.
7. **Proteksi Integritas & Hapus Aman**:
   - Kategori yang masih memiliki Target tidak dapat dihapus (`ON DELETE RESTRICT`).
   - Menghapus Target/Tahapan/Tugas membersihkan entri orphan (`quick_task_details_v1`) dan menyinkronkan ulang notifikasi/alarm.
   - Menghapus tugas yang memiliki riwayat `focus_sessions` tetap mempertahankan riwayat menit fokus (`task_id = NULL`, `task_title` tersimpan).
8. **Alarm Keras & Audio Kustom**:
   - Alarm dijadwalkan berdasarkan `execution_date` + `execution_time` (dengan pengejaran keterlambatan maksimal 5 menit saat app aktif).
   - Notifikasi OS (`expo-notifications`) menjaga kuota maksimal 50 notifikasi terdekat per kategori (kalender/alarm tugas).
   - Lagu kustom disalin ke penyimpanan dokumen perangkat (`Paths.document`) dan **tidak ikut masuk dalam berkas backup JSON** (saat restore, sistem memberi peringatan untuk memilih ulang lagu kustom jika perlu).
9. **Backup & Restore Aman**:
   - Ekspor/impor JSON (`format: 'mylife-backup'`, `schemaVersion: 3`) mencakup 18 tabel.
   - Pemulihan selalu diuji terlebih dahulu di SQLite `:memory:`, menyimpan salinan pengaman sebelum restore, dan mewajibkan konfirmasi ketik `PULIHKAN`.
