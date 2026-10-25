# Cadangan dan pemulihan — R0.1

Pembaruan R0.2: skema database dan format cadangan telah diperkuat. Ekspor kini schemaVersion 2, dengan impor kompatibel snapshot lengkap versi 1 dan arsip pra-migrasi. Lihat [catatan integritas terbaru](./INTEGRITY_IMPLEMENTATION_2026-10-26.md); uraian berikut mencatat implementasi R0.1 sebelum perubahan tersebut.

Tanggal: 26 Oktober 2026. Implementasi mengikuti prioritas setelah redesign UI. Data pengguna tidak dibuka atau dipulihkan selama pengembangan; seluruh pengujian SQLite memakai `:memory:`.

## Perilaku yang tersedia

- Pengaturan → **Buat cadangan** membuat snapshot konsisten seluruh 11 tabel: kategori, pilar, target, proyek, tahapan, milestone, tugas, prioritas harian, sesi fokus, agenda, dan preferensi. Native menulis berkas ke dokumen aplikasi lalu membuka menu berbagi; web meminta unduhan. Menutup menu berbagi tidak dianggap bukti bahwa berkas sudah disimpan di luar aplikasi.
- **Pulihkan dari berkas** membaca JSON, memeriksa format/versi, kolom, tipe, ID unik, tanggal, enum, rentang angka, relasi, dan kepemilikan tahapan/tugas. Isi berkas tidak pernah dipakai sebagai identifier atau perintah SQL.
- Pengguna melihat ringkasan, mengetik `PULIHKAN`, lalu memilih **Ganti data & pulihkan**. Pemulihan mengganti seluruh data; tidak menggabungkan dua dataset. Sesi fokus aktif yang belum disimpan dihentikan.
- Sebelum penggantian, aplikasi menyimpan dan membaca ulang salinan data lama. Salinan terakhir dapat diekspor melalui **Cadangan sebelum pemulihan**. Native menyimpannya di dokumen aplikasi; web menggunakan localStorage. Jika penyimpanan pengaman gagal, database aktif tidak diganti.
- Dataset masuk diuji pada SQLite terpisah, lalu diganti dalam satu transaksi pada database aktif. Integrity check, foreign-key check, dan jumlah baris diperiksa sebelum commit. Bila data aktif berubah selama penyimpanan salinan pengaman, pemulihan ditolak agar edit terbaru tidak hilang.
- Setelah commit, navigator dipasang ulang agar timer/form tidak memakai ID lama. Pengingat `agenda-*` dibatalkan dan agenda baru yang memenuhi syarat dijadwalkan kembali; pengingat lain tidak dibatalkan. Kegagalan izin/modul notifikasi ditampilkan sebagai peringatan setelah data berhasil dipulihkan.
- Inisialisasi database kini transaksional, hanya menambah kolom yang belum ada, tidak menelan error migrasi, dan tidak menanam ulang kategori/pilar setiap startup. Backfill hanya berjalan saat kolom lama benar-benar ditambahkan. Startup gagal menampilkan opsi coba lagi dan tidak membuka layar CRUD.

## Format dan batas

Envelope JSON menggunakan `format: mylife-backup`, `formatVersion: 1`, `schemaVersion: 1`, `exportedAt`, dan `data`. Versi skema ini adalah versi **format snapshot**, bukan klaim bahwa seluruh migrasi R0.2 telah terpasang. Maksimal 10 MB UTF-8 dan 50.000 catatan total; berkas dibaca ke memori. Nilai NULL, ID, tanggal lama yang valid, status legacy DONE, dan preferensi yang belum dikenal dipertahankan.

Snapshot lama yang tidak memuat kategori/tahapan tidak dapat dipulihkan. Ekspor tetap mempertahankan data mentah jika database lama sudah memiliki orphan atau nilai tidak valid; import akan menolak ketidakutuhan tersebut, tanpa menghapus atau memperbaiki catatan diam-diam. Penanganan data legacy bermasalah masuk R0.2, bukan normalisasi otomatis di sini.

Cadangan berupa JSON tanpa enkripsi. Simpan berkas di lokasi pribadi. Dokumen aplikasi dan localStorage bisa hilang saat aplikasi dihapus atau penyimpanan browser dibersihkan; salinan internal bukan pengganti cadangan eksternal. Salinan sebelum pemulihan ditimpa saat pemulihan berikutnya dicoba. Notifikasi sistem dan transaksi SQLite tidak dapat dijadikan satu transaksi; jika aplikasi ditutup paksa setelah commit, pengingat perlu diperiksa kembali.

## Verifikasi

`npm run test:backup` menjalankan 42 pemeriksaan pada kode produksi: round trip 11 tabel; validasi format, data, relasi, batas; import tanpa mutasi; rollback setelah DELETE dan INSERT parsial; kegagalan integrity check; perlindungan edit bersamaan; hasil restore setelah restart; database kosong; startup gagal/retry; picker batal/berkas terlalu besar; verifikasi tulis pengaman dan kuota browser; pengingat tepat waktu dan pembatalan selektif; urutan hook, kegagalan pengaman, kegagalan restore, peringatan notifikasi, dan klik ganda.

`npm run test:ui` memeriksa konfirmasi eksplisit di komponen Pengaturan, 42 render layar pada 320/360/412 dp dengan simulasi teks 100/200%, dan 12 render form, termasuk pemulihan. Harness audit awal diperbarui untuk menandai A02 sudah diperbaiki; bukti audit awal tetap utuh. Kasus masalah lain yang direproduksi harness belum dianggap selesai.

Pemeriksaan browser pada fixture dialog pemulihan di lebar 320 dengan simulasi teks 100/200% menunjukkan konten tidak meluber horizontal dan footer tetap di dalam bingkai. Fixture mengisolasi sheet karena Modal native keluar dari hierarki scroll layar. Ini bukan bukti perilaku keyboard/picker native.

`npm run lint`, `tsc --noEmit`, dan ekspor bundel web Expo berhasil. Dialog picker/share Android/iOS, disk penuh nyata, keyboard native, TalkBack, kinerja berkas mendekati batas, penghentian paksa di setiap fase, dan pengingat setelah reboot belum diuji. Jalur native memerlukan build baru yang memuat dependensi/config plugin yang ditambahkan; bukan sekadar OTA JavaScript.

## Sumber API

Implementasi mengacu pada dokumentasi [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/), [Sharing](https://docs.expo.dev/versions/v58.0.0/sdk/sharing/), [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), dan [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/). `expo-file-system` dan `expo-sharing` dipasang melalui `expo install`. Installer melaporkan 14 temuan audit dependency (9 moderate, 5 high); tidak dilakukan upgrade paksa dalam pekerjaan ini.

Langkah berikutnya: R0.2 — kebijakan orphan/legacy, constraint FK yang benar-benar terpasang di SQLite, migrasi berversi, dan transaksi jalur tulis/hapus. DDL aktif saat ini masih belum mendefinisikan foreign key; pemeriksaan relasi import tidak menggantikan integritas seluruh jalur tulis aplikasi.
