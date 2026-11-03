# Dokumentasi Fitur: Kategori Target (Categories)

**Modul:** Categories (`src/features/categories`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.2, R1)  
**Terkait:** `docs/INTEGRITY_IMPLEMENTATION_2026-10-26.md`, `docs/START_HERE.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Fitur **Kategori** adalah instrumen pengorganisasian tingkat tinggi untuk Target Hidup:
* **Tujuan**: Memungkinkan pengguna membuat label tema kehidupan mereka sendiri (misal: *"Karier & Pekerjaan"*, *"Pendidikan / Kuliah"*, *"Kesehatan Fisik"*, *"Keluarga & Hubungan"*, *"Pengembangan Diri"*).
* **Keputusan Arsitektur**:
  * Sesuai keputusan produk di `START_HERE.md`, Kategori **bukan merupakan tab navigasi terpisah** di bottom bar.
  * Kategori dikelola secara terpusat melalui Pengaturan (menu Organisasi $\rightarrow$ "Kategori target") dan digunakan sebagai filter pada layar Target serta pemilih kategori pada pembuatan Target.

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Pengelolaan Kategori (Category Manager Modal)
* Dapat diakses dari **Pengaturan** melalui baris `Kategori target`.
* Tampilan Bottom Sheet interaktif:
  * Menampilkan daftar seluruh kategori yang sudah dibuat beserta jumlah target yang menggunakannya.
  * Tambah kategori baru dengan validasi nama unik (tidak boleh duplikat).
  * Edit nama kategori.
  * Hapus kategori dengan proteksi integritas.

### 2.2 Proteksi Integritas Hapus (`RESTRICT`)
* **Aturan Bisnis Mutlak**: Pengguna **dilarang menghapus** kategori yang masih digunakan oleh satu atau lebih target.
* Jika pengguna mencoba menghapus kategori yang aktif, sistem menampilkan pesan peringatan yang jelas:
  * *"Kategori ini sedang digunakan oleh X target. Pindahkan atau hapus target tersebut terlebih dahulu sebelum menghapus kategori."*
* Hal ini ditegakkan di level aplikasi dan di level foreign key SQLite (`ON DELETE RESTRICT`).

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `categories`
```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(name)
);
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/categories/
├── domain/
│   ├── entities/category.entity.ts           # Entity Category & DTO
│   └── repositories/category.repository.ts   # Kontrak repository kategori
├── data/
│   └── repositories/
│       └── category.repository.impl.ts       # Query SQLite Drizzle & pengecekan dependensi target
└── presentation/
    ├── hooks/
    │   └── use-categories.ts                 # Hook state kategori, CRUD, & loading
    └── components/
        └── category-manager-modal.tsx        # Bottom sheet pengelolaan kategori
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:backup`: Memverifikasi ekspor dan pemulihan kategori kustom dalam snapshot 11 tabel tanpa kehilangan data atau warna.
* `npm run test:integrity`: Memverifikasi constraint unik pada nama kategori dan penolakan hapus kategori yang memiliki target aktif.
* `npm run test:ui`: Memverifikasi render modal manager, validasi input nama kosong/duplikat, dan dialog konfirmasi hapus.

