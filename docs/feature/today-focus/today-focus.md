# Dokumentasi Fitur: Hari Ini & Focus Timer (Today & Focus)

**Modul:** Today Focus (`src/features/today-focus`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R0.4, R0.5, R1)  
**Terkait:** `docs/TIMER_IMPLEMENTATION_2026-10-27.md`, `docs/PROGRESS_IMPLEMENTATION_2026-10-27.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Layar **Hari Ini** adalah pusat gravitasi operasional harian di MyLife:
* **Tujuan**: Menghubungkan target besar dan roadmap proyek ke dalam 1–5 tindakan nyata hari ini, didukung oleh mesin timer fokus yang mencatat bukti waktu kerja secara transaksional.
* **Filosofi Desain**: *"Ruang untuk yang penting"* — mencegah *overwhelm* dengan membatasi prioritas harian maksimal 5 tugas, serta menyajikan visual tenang (Botanical Pop) dengan kartu hero yang fleksibel.

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Pemilihan Prioritas Harian (Top 3–5)
* Pengguna dapat memilih tugas dari roadmap (Target/Proyek) atau menulis tugas cepat (*quick task*) khusus hari ini.
* Kuota dibatasi maksimal 5 tugas per hari untuk menjaga fokus realistis.
* Centang selesai tugas di kartu prioritas otomatis memperbarui status tugas di seluruh sistem (`TODO` $\rightarrow$ `COMPLETED`).
* Tugas yang dibatalkan (`CANCELLED`) tetap ditampilkan dengan indikator visual dan tidak dihitung ke progres penyelesaian.

### 2.2 Mesin Focus Timer (Pomodoro, Deep Flow, & Stopwatch)
* Mendukung 3 mode kerja:
  1. **Pomodoro**: Interval default 25 menit (opsi 15, 25, 45, 60 menit dari Pengaturan).
  2. **Deep Flow**: Interval default 50 menit (opsi 45, 50, 60, 90 menit dari Pengaturan).
  3. **Stopwatch**: Penghitung maju dengan pencatatan menit aktual saat tombol selesai ditekan.
* **Persistensi Checkpoint**: State timer aktif (`sessionId`, mode, `taskId`, `startedAt`, elapsed aktif, status) disimpan di penyimpanan persisten. Jika aplikasi ditutup, beralih ke background, atau perangkat restart, sesi fokus dapat dipulihkan (*state recovery*).
* **Efek Native Terkendali**:
  * *Haptic feedback*: Bergetar saat mulai, jeda, dan selesai (menghormati toggle di Pengaturan).
  * *Keep Awake*: Layar tetap menyala selama timer aktif (menghormati toggle di Pengaturan).

### 2.3 Finalisasi Sesi & Refleksi Pasca Fokus
* Sesi fokus disimpan ke database SQLite secara **transaksional dan idempoten** saat timer mencapai target waktu atau dihentikan pengguna.
* **Refleksi Opsional**: Setelah sesi tercatat, muncul modal refleksi (Rating 1–5 bintang, hambatan yang dialami, dan *next action*).
  * Jika pengguna menutup/melewati refleksi, sesi dan akumulasi menit tugas **tetap tersimpan** di database (tidak ada data fokus yang hilang).
  * Penyimpanan refleksi memperbarui sesi yang sudah ada tanpa menduplikasi baris.
* Akumulasi waktu: Menit sesi fokus otomatis ditambahkan ke kolom `actual_minutes` pada tugas terkait.

---

## 3. Arsitektur Data & Model Database

### 3.1 Skema Tabel Terkait

#### Tabel `daily_focus_items`
```sql
CREATE TABLE IF NOT EXISTS daily_focus_items (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,                      -- Format 'YYYY-MM-DD' kalender lokal
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0, -- Kompatibilitas legacy
  created_at TEXT NOT NULL,
  UNIQUE(date, task_id)
);
```

#### Tabel `focus_sessions`
```sql
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  task_title TEXT,                         -- Disimpan historis jika tugas dihapus
  mode TEXT NOT NULL DEFAULT 'POMODORO',   -- 'POMODORO' | 'DEEP_FLOW' | 'STOPWATCH'
  started_at TEXT NOT NULL,                -- ISO UTC timestamp
  ended_at TEXT,                           -- ISO UTC timestamp
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  rating INTEGER,                          -- 1 s/d 5 bintang
  obstacle TEXT,                           -- Catatan hambatan
  next_action TEXT,                        -- Rencana aksi berikutnya
  created_at TEXT NOT NULL
);
```

---

## 4. Struktur Kode & Implementasi

```text
src/features/today-focus/
├── domain/
│   ├── entities/daily-focus.entity.ts       # Definisi DailyFocusItem & Task status
│   ├── repositories/daily-focus.repository.ts # Kontrak repository
│   └── focus-timer.ts                       # Logic murni timer, perhitungan elapsed & state
├── data/
│   └── repositories/
│       ├── daily-focus.repository.impl.ts   # Implementasi query SQLite, transaksi atomik
│       └── focus-timer.repository.ts        # Persistensi sesi & checkpoint timer
└── presentation/
    ├── hooks/
    │   ├── use-today-focus.ts               # Hook data prioritas harian & refresh fokus
    │   └── use-focus-timer.ts               # Hook pengendali timer, haptic, & keep awake
    ├── screens/
    │   └── today-focus-screen.tsx           # Layar utama "Hari Ini"
    └── components/
        ├── focus-timer-widget.tsx           # Widget timer expandable/minimizable
        ├── priority-task-card.tsx           # Kartu tugas prioritas
        ├── add-priority-modal.tsx           # Modal pemilihan prioritas dari backlog
        └── session-reflection-modal.tsx     # Modal refleksi pasca sesi
```

---

## 5. Verifikasi & Pengujian Otomatis

Fitur ini diuji secara ketat melalui:
* `npm run test:timer`: Memverifikasi pause/resume tanpa jeda, finalisasi idempoten, refleksi opsional, proteksi sub-menit, dan ketahanan data corrupt.
* `npm run test:progress`: Memverifikasi keterkaitan centang selesai prioritas harian terhadap task, stage, project, dan target.
* `npm run test:ui`: Memverifikasi render 6 state timer, hero card, dan variasi ukuran teks (100% dan 200%).

