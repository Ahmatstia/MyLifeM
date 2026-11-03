# Dokumentasi Fitur: Pengaturan, Privasi, & Backup-Restore (Settings)

**Modul:** Settings (`src/features/settings`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.1, R0.2, R0.5, R1)  
**Terkait:** `docs/BACKUP_IMPLEMENTATION_2026-10-26.md`, `docs/TIMER_IMPLEMENTATION_2026-10-27.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Layar **Pengaturan** adalah pusat kendali kenyamanan pengguna dan kedaulatan data (*data sovereignty*):
* **Tujuan**:
  1. Menyesuaikan preferensi fokus (haptik, layar tetap menyala, durasi default timer).
  2. Memberikan transparansi volume data lokal perangkat.
  3. Menyediakan mekanisme **Cadangan & Pemulihan (Backup & Restore)** berkas JSON yang lengkap, aman, dan dapat diuji pulih (*round-trip verified*).

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Pengaturan Fokus & Kenyamanan
* **Getaran Haptik**: Sakelar ON/OFF getaran sentuh. Mempengaruhi efek getar saat timer dimulai, dijeda, atau selesai.
* **Layar Tetap Terjaga (Keep Awake)**: Sakelar ON/OFF untuk menjaga layar tidak mati selama sesi fokus aktif berjalan.
* **Durasi Default Pomodoro**: Pemilihan durasi cepat (15, 25, 45, 60 menit) via bottom sheet picker.
* **Durasi Default Deep Flow**: Pemilihan durasi cepat (45, 50, 60, 90 menit) via bottom sheet picker.

### 2.2 Statistik Penyimpanan Lokal
* Menampilkan jumlah riil entitas data yang tersimpan di perangkat:
  * Jumlah Target, Proyek, Tugas, Sesi Fokus, dan Agenda.
  * Menegaskan status: *"Tersimpan di perangkat ini — 100% lokal dan privat"*.

### 2.3 Sistem Backup & Restore Berkas Lengkap (R0.1 Engine)
* **Ekspor Cadangan**:
  * Mengambil snapshot konsisten dari seluruh **11 tabel database**.
  * Dibungkus dalam format envelope JSON standar dengan `formatVersion = 1`, `schemaVersion = 1`, dan timestamp `exportedAt`.
  * Memanfaatkan modul berbagi dokumen native Expo File System & Sharing (`expo-sharing`).
* **Pemulihan Transaksional (Safe Restore)**:
  1. Pengguna memilih berkas JSON cadangan.
  2. Sistem melakukan verifikasi ketat pada **database staging sementara** di memori: validasi versi, batas ukuran berkas, kolom wajib, tipe data, foreign key, dan integritas relasi.
  3. Sebelum database aktif diganti, sistem membuat **salinan pengaman (safety backup file)** dari data saat ini.
  4. Penggantian data aktif dilakukan dalam satu transaksi SQLite atomik.
  5. Jika terjadi kegagalan sekecil apa pun, transaksi dibatalkan (*rollback*) dan data pengguna tidak rusak.
  6. Setelah pemulihan sukses, jadwal notifikasi dan layar aplikasi di-*reset* secara bersih melalui `useDataRevision`.

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `user_settings`
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 3.2 Format Berkas Cadangan JSON
```json
{
  "formatVersion": 1,
  "schemaVersion": 1,
  "exportedAt": "2026-11-03T18:00:00.000Z",
  "data": {
    "categories": [],
    "lifePillars": [],
    "targets": [],
    "projects": [],
    "stages": [],
    "milestones": [],
    "tasks": [],
    "dailyFocusItems": [],
    "focusSessions": [],
    "agendaEvents": [],
    "userSettings": []
  }
}
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/settings/
├── domain/
│   ├── entities/settings.entity.ts           # Entity UserSettings, BackupEnvelope, Stats
│   └── repositories/settings.repository.ts   # Kontrak repository settings & backup
├── data/
│   ├── backup-format.ts                      # Parser, validator tipe, schema checking, & staging
│   ├── backup-store.ts                       # State in-memory lock untuk mencegah multiple backup
│   ├── repositories/
│   │   └── settings.repository.impl.ts       # Query user_settings, snapshot 11 tabel, restore DB
│   └── services/
│       ├── backup-file.service.ts            # Adapter penyimpanan berkas native (Expo FileSystem)
│       └── backup-file.service.web.ts        # Adapter penyimpanan berkas web fallback
└── presentation/
    ├── hooks/
    │   └── use-settings.ts                   # Hook preferensi, status backup/restore, dialog konfirmasi
    └── screens/
        └── settings-screen.tsx               # Layar Pengaturan lengkap
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:backup`: 45 pengujian otomatis mencakup pemulihan 11 tabel, penolakan format korup/ilegal, rollback saat kegagalan, dan rekonsiliasi notifikasi pasca restore.
* `npm run test:integrity`: Memverifikasi penyimpanan key-value preferensi berjalan secara transaksional tanpa kegagalan parsial.
* `npm run test:ui`: Memverifikasi render layar pengaturan, bottom sheet pemilih durasi, dan konfirmasi restore.

