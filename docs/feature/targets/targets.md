# Spesifikasi Fitur: Target Hidup (`targets`)

> **Direktori**: `src/features/targets/`  
> **Rute Terkait**: `/targets` (`TargetListScreen`, diakses dari `AppSidebarDrawer`), `/targets/new` (`CreateTargetScreen`), `/targets/[id]` (`TargetDetailScreen`)  
> **Rute Legacy**: `/(tabs)/projects`, `/projects/new`, `/projects/[id]` -> `<Redirect>` ke `/targets*`

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/target.entity.ts`: `TargetStatus` (`'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'`), `TargetPriority` (`'LOW' | 'MEDIUM' | 'HIGH'`), `TargetEntity`, `CreateTargetInput`, `UpdateTargetInput`, `calculateTargetProgress(completedTasks, totalTasks)`.
  - `repositories/target.repository.ts`: `TargetFilterOptions`, `TargetRepository`.
- **`data/`**:
  - `repositories/target.repository.impl.ts`: `TargetRepositoryImpl` (`targetRepository`).
- **`presentation/`**:
  - `hooks/`: `use-targets.ts`, `use-target-detail.ts`.
  - `screens/`: `target-list-screen.tsx`, `create-target-screen.tsx`, `target-detail-screen.tsx`.
  - `components/`: `target-card.tsx`, `category-filter-chips.tsx`, `pillar-filter-chips.tsx`, `add-target-modal.tsx`.

---

## 2. User Flow & Aturan Aktual

1. **Daftar Target (`/targets`)**:
   - Menampilkan `CategoryFilterChips`, ringkasan progres seluruh target (`completedTasks / totalTasks` & `totalEstimatedHours`), daftar `TargetCard` bergaya tab map pastel (`folderMint`, `folderPeach`, `folderLilac`), serta FAB menuju `/targets/new`.
2. **Buat Target (`/targets/new`)**:
   - Form layar penuh (`CreateTargetScreen`) dengan input nama target (wajib), deskripsi opsional, pilihan kategori (`ChoiceTile`), dan prioritas (`LOW`: Santai, `MEDIUM`: Utama, `HIGH`: Mendesak).
   - Disimpan sebagai `type: 'MILESTONE_BASED'`, `targetValue: 100.0`, `unit: '%'`, `status: 'ACTIVE'`.
3. **Rincian Target (`/targets/[id]`)**:
   - Menampilkan kartu overview progres (`progressPercent` dari `summarizeTasks` atas seluruh tugas milik target maupun stages di bawahnya, mengecualikan `CANCELLED`).
   - Tombol konfirmasi status target tercapai / aktifkan kembali (`taskService.setTargetStatus`).
   - Bagian **"Tugas untuk Target ini"**: menampilkan `directTasks` (`owner === targetId && !stageId`) yang dapat dibuka ke `/tasks/[id]`, plus tombol **"Tambah tugas langsung"** ke `/tasks/new?target=<targetId>`.
   - Bagian **"Langkah berikutnya"**: daftar `StageCard` (tahapan peta jalan) beserta FAB tambah tahap (`AddEditStageModal`) dan `AddEditTaskModal`.
4. **Hapus Aman**:
   - `deleteTarget(id)` menjalankan transaksi `tx.delete(targets)` (otomatis menghapus `stages` & `tasks` terkait via `ON DELETE CASCADE`), membersihkan `quick_task_details_v1` orphan (`removeOrphanQuickTaskDetails`), dan memanggil `notifyTaskChanges()`.
