# Dokumentasi Proyek MyLife

Panduan utama dan indeks dokumentasi resmi **MyLife** — aplikasi mobile produktivitas pribadi berbasis **Expo / React Native** dengan penyimpanan lokal **SQLite (Drizzle ORM)**. Seluruh isi dokumentasi ini diselaraskan dengan implementasi aktual di `src/`.

---

## Ringkasan Sistem Saat Ini

- **Model Pekerjaan Utama**: `Kategori -> Target -> Tahapan (Stages) -> Tugas (Tasks) -> Hari Ini (Daily Focus) & Kalender (Agenda)`.
- **Fitur Proyek Dihapus**: Modul Proyek telah dikonsolidasi ke dalam **Target** (`src/db/project-consolidation.ts`). Rute lama `/projects/*` hanya dipertahankan sebagai adapter `<Redirect>` ke `/targets`.
- **Navigasi Utama (`src/app/(tabs)/_layout.tsx`)**:
  - **Bottom Tab Bar (Floating Pill 5 Slot)**: `Hari Ini` (`/(tabs)`), `Tugas` (`/(tabs)/tasks`), tombol tengah `Tambah` (`/quick-add`), `Kalender` (`/(tabs)/agenda`), dan `Menu` (membuka `AppSidebarDrawer`).
  - **Menu Sidebar (`AppSidebarDrawer`)**: `Semua Tugas` (`/(tabs)/tasks`), `Target & Peta Jalan` (`/targets`), `Kalender & Jadwal Rutin` (`/(tabs)/agenda`), `Tinjauan` (`/review`), dan `Pengaturan` (`/settings`).
  - **Pusat Notifikasi**: Tombol lonceng hanya di layar `Hari Ini`, membuka `/notifications` dan `/reminders`.
- **Arah Visual Aktif**: **Kertas Hangat MyLife** (`src/theme/today.ts`, `src/theme/colors.ts`, `src/theme/tokens.ts`) dengan tipografi **Fredoka Medium** + **Plus Jakarta Sans**.

---

## Peta Dokumen

### 1. Dokumen Inti Produk & Arsitektur
1. [PRODUCT_BLUEPRINT_2026-11-27.md](./PRODUCT_BLUEPRINT_2026-11-27.md) — Cetak biru alur tugas, perencanaan harian, dan tinjauan mingguan terbaru.
2. [PRD_V2.md](./PRD_V2.md) — Spesifikasi kebutuhan produk, aturan bisnis wajib, dan cakupan fitur aktif.
3. [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) — Arsitektur layer, peta rute `src/app/`, skema database SQLite (18 tabel, 19 FK, 5 trigger), dan sinkronisasi latar belakang.
4. [design/DESIGN_V4.md](./design/DESIGN_V4.md) — Sistem desain **Kertas Hangat MyLife** (token warna, tipografi, dan pola layar).

### 2. Spesifikasi Fitur (`docs/feature/`)
Lihat indeks lengkap di [docs/feature/README.md](./feature/README.md):
- [today-focus.md](./feature/today-focus/today-focus.md) — Fokus Hari Ini, Timer Fokus (Pomodoro / Deep Flow / Stopwatch), & Refleksi Sesi.
- [tasks.md](./feature/tasks/tasks.md) — Kotak Masuk, Rincian Tugas, Langkah Checklist, Kapasitas Harian, & Tinjauan.
- [task-manager.md](./feature/task-manager/task-manager.md) — Tugas Terjadwal Dual-Date & Alarm Keras dengan Lagu Kustom.
- [quick-add.md](./feature/quick-add/quick-add.md) — Pintu Masuk Tambah Cepat (`/quick-add`).
- [targets.md](./feature/targets/targets.md) — Target Hidup & Progres Terpadu.
- [stages.md](./feature/stages/stages.md) — Tahapan Peta Jalan Target.
- [categories.md](./feature/categories/categories.md) — Pengelolaan Kategori Target.
- [agenda.md](./feature/agenda/agenda.md) — Kalender Harian, Master Jadwal Rutin Mingguan, & Pengingat Notifikasi.
- [prayer-times.md](./feature/prayer-times/prayer-times.md) — Jadwal Waktu Salat & Pengaturan Lokasi Azan.
- [settings.md](./feature/settings/settings.md) — Preferensi Aplikasi, Statistik Lokal, & Backup/Restore JSON (18 tabel, `schemaVersion: 3`).
