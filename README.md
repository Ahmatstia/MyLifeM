# MyLife

MyLife membantu mencatat tugas, memilih rencana harian, mengatur waktu pengerjaan, dan meninjau hasil. Aplikasi menggunakan Expo SDK 58, React Native, dan SQLite lokal.

Mulai dari [Blueprint produk dan implementasi 27 November 2026](docs/PRODUCT_BLUEPRINT_2026-11-27.md). Riset awal pengguna dipertahankan pada [naskah riset](mylife-riset-arsitektur.md); koreksi dan keputusan produk yang berlaku ada pada blueprint.

## Alur utama

1. Catat pekerjaan di Tugas; judul saja sudah cukup.
2. Pilih tugas untuk Hari Ini, sesuaikan dengan waktu fokus yang tersedia.
3. Jika perlu, atur satu atau beberapa blok pengerjaan di Kalender. Tenggat tetap terpisah.
4. Kerjakan langkah kecil atau gunakan timer. Tandai selesai secara terpisah.
5. Buka Tinjauan untuk mencatat hasil dan memilih apa yang dilanjutkan.

Navigasi utama: Hari Ini, Tugas, Tambah, Kalender, Menu. Target dan Tinjauan tersedia dari Menu. Lonceng hanya pada Hari Ini. Lihat [arah visual](docs/design/DESIGN_V4.md) untuk konteks desain.

## Menjalankan pengembangan

```sh
npm install
npm start
```

Gunakan Expo Go untuk pengembangan dengan modul yang sudah tersedia. Pengujian pengiriman notifikasi dan alarm harus dilakukan pada perangkat native. Setelah menambahkan modul native di masa depan, ikuti petunjuk Expo mengenai development build.

## Pemeriksaan

```sh
npm run lint
npx tsc --noEmit
npm run test:task-planning
npm run test:backup
npm run test:integrity
npm run test:ui
npm run test:layouts
```

Pengujian data menggunakan SQLite sementara; tidak membuka database pribadi pengguna. Pengujian tata letak browser membutuhkan Chromium/Playwright dan membedakan hasil browser dari bukti native.

## Data dan kompatibilitas

Peningkatan database menyimpan salinan pengaman sebelum konversi. Tugas lama, ID, riwayat sesi, dan pengaturan alarm dipertahankan. Cadangan skema 3 mencakup rencana serta tinjauan; format lama tetap dapat dibaca dan dikonversi. Jangan menggunakan aplikasi versi lama untuk membuka database atau cadangan yang dibuat versi lebih baru.

Dokumen pada [START_HERE](docs/START_HERE.md) dan [arsitektur v2](docs/ARCHITECTURE_V2.md) menyimpan konteks audit/pengembangan sebelumnya. Blueprint terbaru menjadi acuan alur yang berlaku.
