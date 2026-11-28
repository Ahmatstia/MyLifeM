# Spesifikasi Fitur: Kategori Target (`categories`)

> **Direktori**: `src/features/categories/`  
> **Lokasi Tampil**: `CategoryManagerModal` (dibuka dari `SettingsScreen`) & filter di `TargetListScreen` / `CreateTargetScreen`

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/category.entity.ts`: `CategoryEntity`, `CategoryWithCount` (`targetCount`), `CreateCategoryInput`, `UpdateCategoryInput`, `normalizeCategoryName(name)` (`locale 'id-ID'`).
  - `repositories/category.repository.ts`: Interface `CategoryRepository`.
- **`data/`**:
  - `repositories/category.repository.impl.ts`: `CategoryRepositoryImpl` (`categoryRepository`).
- **`presentation/`**:
  - `hooks/use-categories.ts`: State `categories`, `isLoading`, `error`, serta aksi `refresh`, `addCategory`, `editCategory`, `removeCategory`.
  - `components/category-manager-modal.tsx`: Bottom sheet pengelolaan kategori (tambah, ubah nama inline, hapus).

---

## 2. Aturan Bisnis Aktual

1. **Seed Default (`src/db/schema-sql.ts`)**: `cat-belajar` (Belajar), `cat-karier` (Karier), `cat-olahraga` (Olahraga), `cat-pribadi` (Pribadi).
2. **Keunikan Case-Insensitive**: Nama kategori tidak boleh kosong dan tidak boleh duplikat (dicek lewat `hasDuplicateName` dalam transaksi serta unique index `idx_categories_name_unique`).
3. **Proteksi Hapus (`ON DELETE RESTRICT`)**: `categoryRepository.delete(id)` menolak penghapusan jika masih ada baris `targets` yang memakai `category_id` tersebut, dan mengembalikan pesan informatif yang menyebut jumlah dan contoh judul target terkait.
4. **Integrasi Backup**: Tabel `categories` termasuk dalam ekspor/impor JSON 18 tabel (`schemaVersion: 3`).
