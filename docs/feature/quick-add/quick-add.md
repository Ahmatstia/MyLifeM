# Dokumentasi Fitur: Tambah Cepat (Quick Add)

**Modul:** Quick Add (`src/features/quick-add`)  
**Peran:** System Analyst & Project Manager  
**Tanggal:** 3 November 2026  
**Status Implementasi:** Selesai (R1)  
**Terkait:** `docs/DESIGN_V2.md`, `docs/UI_IMPLEMENTATION_2026-10-26.md`

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Fitur **Quick Add ("Langkah Baru")** adalah pintu masuk pintas terpusat (*global creation hub*):
* **Tujuan**: Memungkinkan pengguna mencatat ide, komitmen, atau rencana baru secara instan dari layar mana pun tanpa harus mencari-cari tab atau tombol tambah di dalam sub-menu.
* **Aksesibilitas & Posisi**: Dipicu langsung melalui tombol aksi terapung (FAB) di tengah tab navigasi bawah (*bottom bar*).

---

## 2. Fitur Utama & Alur Pengguna

### 2.1 Pilihan Aksi Cepat
Saat tombol tengah nav bar ditekan, sebuah Bottom Sheet meluncur ke atas menyajikan 4 pilihan jelas:
1. **Prioritas hari ini**: Langsung mengarahkan ke tab *"Hari Ini"* dan membuka modal pembuat prioritas (`/` dengan parameter `add=1`).
2. **Target hidup**: Langsung mengarahkan ke tab *"Target"* dan membuka modal pembuat target (`/targets` dengan parameter `add=1`).
3. **Proyek**: Langsung mengarahkan ke tab *"Proyek"* dan membuka modal pembuat proyek (`/projects` dengan parameter `add=1`).
4. **Agenda**: Langsung mengarahkan ke tab *"Agenda"* dan membuka modal penjadwalan kegiatan (`/agenda` dengan parameter `add=1`).

### 2.2 Pola Navigasi Berbasis Parameter
* Memilih salah satu opsi menutup modal Quick Add dan menavigasi ke route terkait:
  ```typescript
  router.navigate({ pathname: item.pathname, params: { add: '1' } });
  ```
* Setiap layar tujuan menggunakan custom hook bersama [`useOpenAddFromParam`](file:///d:/IT/Software%20Engineer/mobile/MyLife/src/shared/hooks/use-open-add-from-param.ts) yang mendeteksi parameter `add=1` dan secara otomatis membuka modal form pembuatan tanpa mengharuskan pengguna menekan tombol tambah lagi.

---

## 3. Desain Antarmuka & Aksesibilitas

* **Standar Sentuh (Touch Target)**: Setiap baris item memiliki tinggi minimum 56dp dengan padding luas, memenuhi standar ergonomi jempol satu tangan.
* **Tutup Cepat**: Dilengkapi dengan area *scrim* luar yang dapat ditekan untuk menutup, tombol silang (*close button*) di kanan atas, serta dukungan gesture kembali (*back gesture*).
* **Animasi & Tema**: Transisi `fade` pada latar belakang dan geser halus pada sheet bawah, berpadu dengan token warna Botanical Pop (`colors.surfaceContainerLowest` dan `colors.primary`).

---

## 4. Struktur Kode & Implementasi

```text
src/
├── app/
│   ├── quick-add.tsx                       # Route adapter Expo Router (presentation: transparentModal)
│   └── (tabs)/
│       └── add.tsx                         # Tombol FAB dummy di bottom bar yang membuka quick-add
├── features/quick-add/
│   └── presentation/screens/
│       └── quick-add-screen.tsx            # Komposisi Bottom Sheet "Langkah Baru"
└── shared/
    └── hooks/
        └── use-open-add-from-param.ts      # Hook pendeteksi parameter add=1 di layar tujuan
```

---

## 5. Verifikasi & Pengujian Otomatis

* `npm run test:ui`: Memverifikasi pembukaan modal, pemilihan opsi, pembacaan parameter navigasi pada 4 layar tujuan, serta render responsif pada skala teks 100% dan 200%.

