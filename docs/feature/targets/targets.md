# Dokumentasi Fitur: Target Hidup & Kategori (Targets & Categories)

**Modul:** Targets (`src/features/targets`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.2, R0.4, R1)  
**Terkait:** `docs/PROGRESS_IMPLEMENTATION_2026-10-27.md`, `docs/INTEGRITY_IMPLEMENTATION_2026-10-26.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Fitur **Target** mewakili aspirasi jangka panjang dan arah hidup pengguna:
* **Tujuan**: Menampung sasaran besar hidup (misal: "Menjadi AI Engineer Handal", "Membangun Portofolio Mobile", "Kesehatan Kardio Prima") yang dikelompokkan berdasarkan **Kategori**.
* **Karakteristik**: Target dipecah menjadi **Tahapan Berurutan (Stages)** dan **Tugas (Tasks)** langsung, serta dapat dihubungkan dengan satu atau beberapa **Proyek Kerja**.

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Pengelompokan & Filter
* **Kategori Mandiri**: Setiap target terikat pada sebuah Kategori (`category_id` FK restrict).
* **Filter Chips**: Daftar target dapat difilter secara instan berdasarkan kategori aktif di layar utama tab Target.
* **Pilar Kehidupan (Legacy)**: Kolom `pillar_id` dipertahankan untuk kompatibilitas data lama, namun UI memprioritaskan kategori.

### 2.2 Perhitungan Progres Rencana Terpadu (Unified Progress)
* Progres target **bukan sekadar angka manual**, melainkan agregasi matematis yang dapat diandalkan dari seluruh tugas di bawahnya:
  $$\text{Progres Target} = \frac{\text{Jumlah Tugas Selesai}}{\text{Total Tugas Aktif}} \times 100\%$$
* **Cakupan Tugas yang Dihitung**:
  1. Tugas langsung pada tahapan Target (`tasks.target_id = target.id`).
  2. Tugas pada tahapan Proyek yang terhubung ke target (`projects.target_id = target.id`).
* **Aturan Khusus**:
  * Menggunakan `DISTINCT task.id` untuk mencegah perhitungan ganda.
  * Tugas dengan status `CANCELLED` **dikecualikan** dari penyebut dan pembilang progres.
  * Teks UI menjelaskan secara jujur: *"Persen menunjukkan progres rencana, bukan penguasaan keterampilan atau pencapaian hasil akhir."*

### 2.3 Layar Detail Target
* Kartu statistik (Marshmallow Dual-Card):
  * Progres rencana persentase dengan progress bar.
  * Rasio penyelesaian tugas ($x/y$), total jam estimasi, dan jumlah tahapan aktif.
* Pengelolaan Tahapan & Tugas:
  * Tambah tahap baru, urutkan (Naik/Turun), edit nama/deskripsi, dan hapus tahap.
  * Tambah tugas ke dalam tahap dengan prioritas, estimasi menit/jam, dan batas waktu (*due date*).
* Penghapusan Aman (*Safe Deletion*):
  * Menghapus target menjalankan transaksi atomik: menghapus tahapan dan tugas langsung, namun **mempertahankan proyek terkait** (relasi `projects.target_id` diubah menjadi `NULL`).
  * Sesi fokus dan agenda historis dipertahankan dengan tautan yang dilepas (`SET NULL`).

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `targets`
```sql
CREATE TABLE IF NOT EXISTS targets (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
  pillar_id TEXT REFERENCES life_pillars(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'MILESTONE_BASED', -- 'MILESTONE_BASED' | 'NUMERIC' | 'MAINTENANCE'
  target_value REAL NOT NULL DEFAULT 100.0,
  current_value REAL NOT NULL DEFAULT 0.0,
  unit TEXT NOT NULL DEFAULT '%',
  status TEXT NOT NULL DEFAULT 'ACTIVE',          -- 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  priority TEXT NOT NULL DEFAULT 'MEDIUM',        -- 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  start_date TEXT NOT NULL,
  target_date TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/targets/
├── domain/
│   ├── entities/target.entity.ts           # Entity Target, TargetSummary, & Status
│   └── repositories/target.repository.ts   # Kontrak repository
├── data/
│   └── repositories/
│       └── target.repository.impl.ts       # Query rollup SQL, DISTINCT tasks, transaksi hapus
└── presentation/
    ├── hooks/
    │   ├── use-targets.ts                  # Hook daftar target & filter kategori
    │   └── use-target-detail.ts            # Hook detail target, tahapan, dan reload antarlayar
    ├── screens/
    │   ├── target-list-screen.tsx          # Layar daftar target (tab Target)
    │   └── target-detail-screen.tsx        # Layar detail target & tahapan
    └── components/
        ├── target-card.tsx                 # Kartu ringkasan target
        ├── category-filter-chips.tsx       # Filter kategori horizontal
        └── add-target-modal.tsx            # Modal form pembuatan target baru
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:progress`: Menguji bahwa penyelesaian tugas di proyek terkait langsung meningkatkan progres target secara otomatis, tidak ada hitung ganda ID tugas, dan tugas dibatalkan tidak merusak persentase.
* `npm run test:integrity`: Memverifikasi penghapusan target mempertahankan integritas referensial dan melepas FK tanpa menyisakan *orphan tasks*.
* `npm run test:ui`: Memverifikasi render kartu target, banner informasi, dan layout adaptif.

