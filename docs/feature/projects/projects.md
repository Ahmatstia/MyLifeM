# Dokumentasi Fitur: Proyek Kerja (Projects)

**Modul:** Projects (`src/features/projects`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.2, R0.4, R1)  
**Terkait:** `docs/PROGRESS_IMPLEMENTATION_2026-10-27.md`, `docs/INTEGRITY_IMPLEMENTATION_2026-10-26.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Fitur **Proyek** berfungsi sebagai wadah eksekusi konkret (*work delivery*):
* **Tujuan**: Mengorganisasikan inisiatif kerja terukur (misal: "Membangun Fitur KRS MyLife", "Skripsi Bab 1–3", "Latihan Soal Sertifikasi AWS") yang memiliki batasan waktu dan tahapan kerja bertahap.
* **Keterkaitan ke Target**: Proyek dapat berdiri sendiri (*standalone*) atau ditautkan ke salah satu **Target Hidup** (`target_id`). Jika ditautkan, kemajuan tugas dalam proyek ini secara otomatis berkontribusi langsung pada progres target induknya.

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Manajemen Proyek
* **Atribut Utama**: Judul, deskripsi, tanggal target penyelesaian (*target date*), prioritas (`LOW`, `MEDIUM`, `HIGH`), dan status lifecycle (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`).
* **Pilihan Target Induk**: Saat membuat atau mengedit proyek, pengguna dapat memilih target terkait dari dropdown/modal.

### 2.2 Struktur Tahapan & Tugas
* Di dalam proyek, pekerjaan dipecah menjadi **Tahapan Proyek (Project Stages)**:
  * Misal: *Tahap 1: Riset & Analisis*, *Tahap 2: Implementasi*, *Tahap 3: Pengujian & Review*.
* Di setiap tahapan terdapat **Tugas (Tasks)** yang memiliki bobot estimasi jam, batas waktu, dan prioritas.
* Progres proyek dihitung dari rasio tugas selesai terhadap total tugas aktif di seluruh tahapan proyek.

### 2.3 Penghapusan & Integritas Data
* **Konfirmasi Hapus**: Dialog konfirmasi eksplisit menjelaskan dampak penghapusan:
  * Tahapan, tugas, dan prioritas harian yang terkait proyek akan ikut dihapus secara transaksional (`CASCADE`).
  * Sesi fokus dan event agenda yang pernah merujuk ke proyek ini **tetap dipertahankan** dengan referensi `project_id` diubah menjadi `NULL` (`SET NULL`), menjaga keutuhan riwayat waktu pengguna.

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `projects`
```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  target_id TEXT REFERENCES targets(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',     -- 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  priority TEXT NOT NULL DEFAULT 'MEDIUM',   -- 'LOW' | 'MEDIUM' | 'HIGH'
  target_date TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

#### Tabel `milestones` (Legacy Compatibility)
```sql
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  created_at TEXT NOT NULL
);
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/projects/
├── domain/
│   ├── entities/project.entity.ts          # Entity Project & ProjectSummary
│   └── repositories/project.repository.ts  # Kontrak repository proyek
├── data/
│   └── repositories/
│       └── project.repository.impl.ts      # Query SQL Drizzle, kalkulasi progres, transaksi hapus
└── presentation/
    ├── hooks/
    │   ├── use-projects.ts                 # Hook daftar proyek & filter status
    │   └── use-project-detail.ts           # Hook detail proyek, tahapan, dan reload otomatis
    ├── screens/
    │   ├── project-list-screen.tsx         # Layar daftar proyek (tab Proyek)
    │   └── project-detail-screen.tsx       # Layar detail proyek & tahapan
    └── components/
        ├── project-card.tsx                # Kartu tampilan proyek
        └── add-project-modal.tsx           # Modal form pembuatan proyek baru
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:progress`: Memverifikasi perubahan status tugas dalam proyek segera merefleksikan perubahan pada progres proyek dan target terkait secara konsisten.
* `npm run test:integrity`: Memverifikasi penghapusan proyek menjaga referensi agenda dan sesi fokus tanpa error FK.
* `npm run test:ui`: Memverifikasi render kartu proyek, modal form, dan penanganan status error/loading.

