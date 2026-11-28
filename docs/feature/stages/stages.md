# Spesifikasi Fitur: Tahapan Target (`stages`)

> **Direktori**: `src/features/stages/`  
> **Lokasi Tampil**: Layar Rincian Target (`/targets/[id]`, `TargetDetailScreen`)

---

## 1. Struktur Modul

- **`domain/`**:
  - `entities/stage.entity.ts`: `StageParentType` (`'TARGET'`), `StageStatus` (`'NO_TASKS' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'`), `TaskPriority` (`'LOW' | 'MEDIUM' | 'HIGH'`), `TaskItemEntity`, `StageEntity`, `StageWithTasks`, `calculateStageStatus`, `getStageStatusLabel`, `calculateOverallProgress`.
  - `repositories/stage.repository.ts`: Interface `StageRepository`.
- **`data/`**:
  - `repositories/stage.repository.impl.ts`: `StageRepositoryImpl` (`stageRepository`).
- **`presentation/components/`**:
  - `stage-card.tsx`: Kartu tahap yang dapat di-expand/collapse (otomatis collapse jika `status === 'COMPLETED'`), toggle tugas (`SproutCheck`), serta menu opsi tahap (ubah, pindah atas/bawah, hapus) dan opsi tugas (ubah, hapus).
  - `add-edit-stage-modal.tsx`: Bottom sheet tambah/ubah tahapan (nama wajib, deskripsi opsional).
  - `add-edit-task-modal.tsx`: Bottom sheet tambah/ubah tugas dalam tahap (nama, deskripsi, prioritas, estimasi jam `> 0`, status).

---

## 2. Aturan Bisnis Aktual

1. **Kepemilikan Khusus Target**: `createStage` dan `createTask` di `stageRepository` hanya mengizinkan `parentType === 'TARGET'` (konsisten dengan penghapusan fitur Proyek dan trigger `stage_owner_update` / `task_owner_*`).
2. **Status Tahap Otomatis (`calculateStageStatus`)**:
   - Mengabaikan tugas berstatus `CANCELLED`.
   - Tidak ada tugas aktif -> `NO_TASKS`.
   - Semua tugas aktif `COMPLETED` -> `COMPLETED`.
   - Semua tugas aktif `TODO` -> `NOT_STARTED`.
   - Lainnya -> `IN_PROGRESS`.
3. **Reordering Atomik**: `reorderStage` menukar `sort_order` dengan tetangga atas (`UP`) atau bawah (`DOWN`) dalam satu transaksi SQLite.
4. **Sinkronisasi Tugas**: Perubahan status tugas menggunakan `writeTaskStatus()`, dan penghapusan tahap/tugas membersihkan `quick_task_details_v1` orphan serta memanggil `notifyTaskChanges()`.
