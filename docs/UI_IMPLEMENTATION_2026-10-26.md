# Implementasi UI Botanical Pop

Tanggal: 26 Oktober 2026. Tahap: redesign UI berdasarkan arahan pemilik setelah audit. Ini penerapan kode aplikasi, berbeda dari prototipe `design-preview.html` yang dibuat pada tahap analisis.

## Yang diterapkan

- Token warna petrol/teal, citron, peach, ivory; warna label dan status memiliki pasangan teks gelap yang dapat dibaca.
- Button dengan tinggi minimum dan label yang dapat membungkus; varian accent untuk hero; Card hero dengan bubble noninteraktif; Screen dengan margin responsif dan batas lebar konten; header layar bersama.
- Hari Ini: hero dari prioritas nyata, ringkasan tugas/menit, daftar prioritas, timer yang bisa diciutkan dan dibuka kembali. Tidak ada data demo di aplikasi.
- Target: filter kategori, ringkasan dengan cakupan jelas, kartu tujuan dan label progres rencana. Proyek: ringkasan peach, filter status termasuk Ditunda, kartu dengan status lifecycle tertulis; checklist 100% tidak otomatis mencoret proyek aktif.
- Detail target/proyek: hilangkan nested vertical scroll; statistik dapat menumpuk; roadmap tahapan bisa dibuka/tutup; opsi tahap/tugas melalui menu berlabel dengan konfirmasi hapus.
- Agenda: pemilahan sepanjang hari dan kegiatan berwaktu, timeline, navigasi minggu maju/mundur tanpa batas 14 hari. Kolom jam luar disederhanakan pada font besar; jam tetap ada dalam kartu.
- Pengaturan: pengelolaan kategori di dalam bottom sheet, preferensi fokus, statistik lokal, pratinjau JSON dengan keterangan bahwa pemulihan belum tersedia. Tidak menambah tab kategori.
- Lima form utama memiliki footer aksi di luar area gulir. Input menggunakan font aplikasi dan border yang lebih terbaca; refleksi memakai bottom sheet yang sama.
- Navigasi bawah dan FAB citron, quick add, konfigurasi warna splash/adaptive background/notifikasi, serta tema starter mengacu ke palet yang sama. Perubahan konfigurasi native terlihat setelah build native berikutnya. Tidak menambah dependency.

## Perbaikan terkait alur UI

- Mengganti kategori tidak lagi mengosongkan draft judul/deskripsi target.
- Daftar memuat ulang saat route kembali fokus, termasuk setelah pengelolaan kategori atau perubahan detail.
- Dialog refleksi menunggu hasil penyimpanan; error mempertahankan dialog dan catatan. Hook meneruskan kegagalan supaya UI tidak menganggapnya berhasil.
- Form tahapan/tugas menampilkan pesan saat simpan ditolak, bukan diam tanpa penjelasan.
- Pemilihan hari/kalender memakai tanggal lokal perangkat. Ini belum menyelesaikan normalisasi timestamp/query agregasi UTC di repository.
- Pergantian mode dan pelepasan tugas timer dibatasi ketika sesi berjalan untuk mengurangi perubahan yang tidak sengaja. Persistence/finalisasi timer tetap pekerjaan R0.

## Pemeriksaan yang dilakukan

- Lint dan TypeScript akhir lulus; `git diff --check` bersih.
- `npm run test:ui`: pemeriksaan kontras semantik, tanggal lokal WIB/WITA/WIT, draft target saat kategori berubah, proyek aktif dengan checklist 100%, pemisahan error/empty state, dan kegagalan/sukses simpan refleksi.
- Render komponen produksi dengan fixture hooks, tanpa menyentuh DB pengguna: tujuh layar × tiga lebar (320/360/412) × dua skala tipografi simulasi (100/200%), serta lima form pada dua skala. Ini uji render, bukan engine layout native.
- Browser memeriksa 14 kombinasi layar pada lebar 320 dan teks normal/besar: tidak ditemukan pelebaran konten melewati frame. Sepuluh kombinasi form menunjukkan tombol footer di dalam frame, tinggi aksi minimal 48, dan tanpa pelebaran frame.
- Inspeksi screenshot browser dilakukan pada Hari Ini, detail roadmap dengan teks besar, form Target, dan agenda. Font fixture memuat berkas Plus Jakarta Sans yang sama dari dependency lokal.
- Export web Expo berhasil setelah Metro diberi dukungan aset `.wasm`, mengikuti [setup SQLite SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/#web-setup). Sandbox awal menolak penulisan aset ekspor; pengulangan dengan izin eksekusi yang sesuai berhasil. Tidak ada deployment.

## Cara mengulang

```sh
npm run lint
npx tsc --noEmit
npm run test:ui
npm run test:ui -- --preview
```

Pratinjau dari kode komponen ditulis ke `.expo/ui-preview/`, berisi fixture terpisah per layar/lebar/skala. Data fixture hanya berada pada skrip pengujian; tidak dimasukkan ke aplikasi atau database. Simulasi font besar menggandakan font/line height pada render web; TalkBack, Android font scaling nonlinear, keyboard dan safe area nyata tetap perlu diuji.

## Batas dan pekerjaan berikutnya

Belum diuji pada APK/perangkat Android/iOS, keyboard native, gesture kembali, TalkBack, Doze/restart timer, atau database pengguna. Pratinjau web memakai fixture; bukan E2E aplikasi dengan SQLite browser/hydration. Hosting web membutuhkan konfigurasi COOP/COEP yang sesuai untuk SQLite; keberhasilan export tidak membuktikan hosting sudah siap.

Foreign key/migrasi, backup+restore lengkap, transaksi, rollup tugas proyek→target, satu sumber status tugas, normalisasi waktu repository, preferensi timer yang belum terhubung, dan persistence sesi tetap tercatat pada audit/backlog. Kode database dan data pengguna tidak dimigrasikan pada tahap UI ini. Jangan menandai R0 atau seluruh gerbang rilis native sebagai selesai.
