# Peta Dokumentasi Fitur MyLife (Feature Specifications)

Dokumen di folder ini berisi spesifikasi sistem, analisis arsitektur, alur UX, dan model data per fitur di MyLife. Setiap dokumen ditulis dari perspektif **System Analyst & Project Manager** sebagai acuan resmi tim pengembang.

---

## Daftar Dokumentasi Fitur

| Modul Fitur | Dokumen Spesifikasi | Deskripsi & Cakupan | Status |
| :--- | :--- | :--- | :---: |
| **Agenda & Jadwal Mingguan** | [agenda/agenda.md](./agenda/agenda.md) | Jadwal harian, time-blocking, notifikasi lokal, dan **Master Jadwal KRS/Kerja Mingguan (Realtime Projection)** | Siap Implementasi (v1.1) |
| **Hari Ini & Focus Timer** | [today-focus/today-focus.md](./today-focus/today-focus.md) | Prioritas harian (Top 3–5), mesin Pomodoro/Deep Flow/Stopwatch persisten, finalisasi transaksional, & refleksi | Selesai (v1.0) |
| **Target Hidup** | [targets/targets.md](./targets/targets.md) | Sasaran hidup, pengelompokan kategori, agregasi progres rencana terpadu (tugas langsung + proyek) | Selesai (v1.0) |
| **Proyek Kerja** | [projects/projects.md](./projects/projects.md) | Wadah kerja eksekusi, penautan ke target, tahapan proyek, estimasi jam, & status lifecycle | Selesai (v1.0) |
| **Tahapan & Tugas** | [stages/stages.md](./stages/stages.md) | Blok kerja polimorfik (Target/Proyek), reorder atomik, konsolidasi status tunggal (TODO, IN_PROGRESS, COMPLETED, CANCELLED) | Selesai (v1.0) |
| **Kategori Target** | [categories/categories.md](./categories/categories.md) | Pengelompokan tema hidup terpusat via Pengaturan, constraint nama unik, & proteksi hapus kategori aktif | Selesai (v1.0) |
| **Pengaturan & Backup** | [settings/settings.md](./settings/settings.md) | Preferensi haptik/layar, durasi timer, cadangan/pemulihan berkas JSON 11 tabel lengkap dengan staging & rollback | Selesai (v1.0) |
| **Tambah Cepat (Quick Add)** | [quick-add/quick-add.md](./quick-add/quick-add.md) | Global creation hub via FAB tengah nav bar dengan navigasi parameter `?add=1` otomatis | Selesai (v1.0) |

---

## Standar Penulisan & Kepatuhan Arsitektur

Setiap fitur dalam folder ini wajib mematuhi aturan baku MyLife:
1. **Local-First & Single Source of Truth**: Data dikelola di SQLite lokal (`mylife.db`) dengan Drizzle ORM; UI membaca via hook dan `useFocusedResource`.
2. **Integritas Database**: Foreign Key aktif (`PRAGMA foreign_keys = ON`), transaksi atomik untuk operasi banyak tabel, dan CHECK constraints.
3. **Zona Waktu Perangkat**: Format *date-only* lokal (`YYYY-MM-DD`) dan waktu absolut ISO UTC untuk event berwaktu.
4. **Desain Botanical Pop**: Menggunakan primitif `src/shared/ui/` dan token warna/tipografi `src/theme/`.
5. **Kualitas & Verifikasi**: Setiap perubahan wajib lolos `lint`, `tsc --noEmit`, dan suite script pengujian in-memory di `scripts/`.

