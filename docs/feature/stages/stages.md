# Dokumentasi Fitur: Tahapan & Tugas Polimorfik (Stages & Tasks)

**Modul:** Stages & Tasks (`src/features/stages`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.2, R0.4, R1)  
**Terkait:** `docs/INTEGRITY_IMPLEMENTATION_2026-10-26.md`, `docs/PROGRESS_IMPLEMENTATION_2026-10-27.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Fitur **Tahapan (Stages)** dan **Tugas (Tasks)** adalah blok pembangun fundamental (*atomic work units*) di MyLife:
* **Tahapan (Stage)**: Mengelompokkan roadmap menjadi fase-fase terstruktur berurutan (misal: *Fase 1: Pondasi*, *Fase 2: Eksekusi*, *Fase 3: Finishing*).
* **Tugas (Task)**: Butir pekerjaan nyata yang dapat dieksekusi, diestimasi waktunya, dijadwalkan, atau dipilih menjadi prioritas harian.
* **Polimorfik**: Tahapan dan tugas dapat dimiliki oleh **Target** ATAU oleh **Proyek**, dengan aturan kepemilikan tunggal yang ditegakkan secara mutlak oleh database.

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Tahapan Polimorfik & Pengurutan (Reordering)
* Sebuah tahap wajib memiliki tepat satu induk: `target_id` ATAU `project_id`.
* **Reordering Atomik**: Pengguna dapat menaikkan (`UP`) atau menurunkan (`DOWN`) urutan tahap. Penukaran nomor urut (`sort_order`) dijalankan dalam satu transaksi SQLite atomik agar tidak terjadi konflik duplikasi urutan sementara.
* **Pembersihan Bersih**: Menghapus tahapan akan otomatis menghapus seluruh tugas di bawah tahapan tersebut beserta prioritas hariannya (`CASCADE`).

### 2.2 Konsolidasi Status Tugas Tunggal (Single Source of Truth)
Sebelumnya sistem memiliki beberapa representasi status (`is_completed`, `status = DONE`, `status = TODO`). Sistem kini distandarkan pada satu enum otoritatif:
* `TODO`: Belum dimulai.
* `IN_PROGRESS`: Sedang aktif dikerjakan.
* `COMPLETED`: Selesai dikerjakan (otomatis mengisi `completed_at` dan `is_completed = 1`).
* `CANCELLED`: Dibatalkan (tidak lagi dikerjakan, tetapi histori dipertahankan dan dikecualikan dari kalkulasi progres).
* *Legacy Compatibility*: String `"DONE"` dinormalisasi secara aman menjadi `"COMPLETED"` tanpa merusak data cadangan lama.

### 2.3 Estimasi & Akumulasi Waktu
* Setiap tugas memiliki estimasi waktu: `estimated_minutes` (default 25 menit) dan `estimated_hours`.
* Kolom `actual_minutes` mencatat akumulasi waktu nyata yang dihabiskan dari sesi fokus yang telah diselesaikan.

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `stages`
```sql
CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY NOT NULL,
  parent_type TEXT NOT NULL,                -- 'TARGET' | 'PROJECT'
  parent_id TEXT NOT NULL,
  target_id TEXT REFERENCES targets(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (parent_type = 'TARGET' AND target_id IS NOT NULL AND parent_id = target_id AND project_id IS NULL) OR
    (parent_type = 'PROJECT' AND project_id IS NOT NULL AND parent_id = project_id AND target_id IS NULL)
  )
);
```

#### Tabel `tasks`
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  stage_id TEXT REFERENCES stages(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  target_id TEXT REFERENCES targets(id) ON DELETE CASCADE,
  milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  name TEXT,                                -- Alias legacy untuk title
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',  -- 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status TEXT NOT NULL DEFAULT 'TODO',      -- 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  estimated_hours REAL DEFAULT 1.0,
  estimated_minutes INTEGER NOT NULL DEFAULT 25,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (project_id IS NULL OR target_id IS NULL),
  CHECK (estimated_minutes >= 0 AND actual_minutes >= 0),
  CHECK (is_completed IN (0, 1))
);
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/stages/
├── domain/
│   ├── entities/stage.entity.ts           # Entity Stage, TaskItemEntity, TaskStatus
│   └── repositories/stage.repository.ts   # Kontrak repository stages & tasks
├── data/
│   └── repositories/
│       └── stage.repository.impl.ts       # Transaksi CRUD stage/task, reorder atomic, validasi FK
└── presentation/
    └── components/
        ├── stage-card.tsx                 # Kartu tahap dengan tombol panah reorder & menu aksi
        ├── add-edit-stage-modal.tsx       # Modal form pembuatan/edit tahap
        └── add-edit-task-modal.tsx        # Modal form pembuatan/edit tugas
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:integrity`: Memverifikasi constraint kepemilikan tahap (`stage_owner`), larangan multi-owner pada tugas, dan rollback transaksi saat reorder gagal.
* `npm run test:progress`: Memverifikasi bahwa toggle status tugas langsung memutakhirkan seluruh agregat terkait (tahap, proyek, target, dan prioritas harian).
* `npm run test:ui`: Memverifikasi render kartu tahap, pengurutan, dan interaksi form modal.

