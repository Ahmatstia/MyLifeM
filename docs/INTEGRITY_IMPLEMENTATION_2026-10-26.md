# Integritas data dan migrasi — R0.2

Implementasi 26 Oktober 2026. Pengujian menggunakan SQLite sementara di memori; database pengguna tidak dibuka atau dimigrasikan oleh skrip pengembangan.

## Perubahan yang berlaku

SQLite kini memiliki 15 foreign key nyata. `schema-sql.ts` berisi DDL instalasi/migrasi; `schema.ts` mencerminkan kolom, relasi, indeks, dan CHECK yang sama untuk Drizzle. `integrity.ts` menegakkan kepemilikan lintas row dengan trigger. Koneksi mengaktifkan foreign key; startup memeriksa aktivasi, versi, relasi, kolom yang diperlukan, dan keberadaan constraint/trigger sebelum membuka navigasi.

- Tahapan memiliki satu `target_id` atau `project_id` berupa FK. `parent_type/parent_id` masih dipertahankan untuk kompatibilitas adapter layar, dengan CHECK agar nilainya selalu cocok. Ini masa transisi, bukan dua pilihan induk terpisah.
- Tugas memiliki paling banyak satu pemilik: target atau proyek. Tugas mandiri tetap diperbolehkan. Jika bertahapan, pemilik harus sama dengan tahapan; milestone harus berasal dari proyek tugas. Tahapan/milestone berisi tugas tidak dapat dipindahkan ke induk lain dengan perubahan satu field.
- Tugas proyek tidak lagi menyalin `target_id`. Ringkasan target mengikuti relasi proyek supaya kontribusinya tetap terlihat setelah perubahan ini.
- Sesi fokus menyimpan `task_title` saat dicatat. Sesi legacy memperoleh label tugas yang masih tersedia saat upgrade; label sebelum perubahan nama yang terjadi sebelum upgrade tidak dapat direkonstruksi.

## Penghapusan

- Kategori yang masih dipakai target ditolak oleh FK RESTRICT.
- Target: hapus tahapan/tugas langsung dan prioritas tugas tersebut; pertahankan proyek terkait dengan `target_id` dilepas. Tugas proyek tetap disimpan.
- Proyek: hapus tahapan, milestone, tugas proyek, dan prioritas harian tugas tersebut.
- Tahapan: hapus tugas di dalamnya dan prioritas hariannya.
- Tugas: hapus prioritasnya; sesi fokus dan agenda tetap disimpan dengan `task_id` null. Label historis sesi dipertahankan; jika label legacy kosong, trigger mengambil judul tugas sebelum penghapusan.
- Agenda mempertahankan judul/jadwal dan melepas tautan target/proyek/tugas yang dihapus. Menghapus milestone hanya melepas tautannya dari tugas.

Cascade dan pelepasan FK berlangsung dalam satu statement SQLite, sehingga kegagalan membatalkan seluruh penghapusan. Repository tidak lagi melakukan rangkaian DELETE manual dengan commit terpisah. Konfirmasi penghapusan menjelaskan dampak ini; kegagalan pada detail tetap di layar dengan opsi coba lagi.

## Migrasi versi 0 → 1

Nomor database menggunakan `PRAGMA user_version = 1`. Nomor ini terpisah dari versi format snapshot. Instalasi baru membuat tabel, constraint, indeks, trigger, dan data bawaan dalam transaksi. Database yang sudah ada tidak ditanami ulang kategori/pilar.

Sebelum rebuild database legacy yang dikenal, aplikasi mengambil snapshot konsisten berisi nilai mentah seluruh kolom, definisi tabel, indeks/trigger/view, dan nomor versi. Berkas `mylife-sebelum-migrasi.json` pada native atau key `mylife-before-migration-v1` pada web ditulis dan dibaca ulang sebelum penggantian dimulai. Bila ruang tidak cukup, migrasi berhenti. Batas arsip 10 MB; pemrosesan masih di memori.

Snapshot dinormalisasi hanya untuk pemetaan yang dapat dipastikan: kolom lama yang belum tersedia menerima default eksplisit, FK tahapan berasal dari induknya, dan salinan target tugas proyek dilepas hanya jika cocok dengan target proyek. NULL kategori tidak diubah menjadi Karier. ID, label custom, tanggal, status legacy, milestone, pilar, dan kolom kompatibilitas tetap dipertahankan.

Orphan, pemilik bertentangan, kolom/objek skema tidak dikenal, nilai tidak valid, atau versi masa depan menghentikan migrasi. Tidak ada penghapusan orphan atau penebakan induk. Trigger/view custom dan indeks asing tidak dihapus diam-diam. Tabel asing di luar model yang dikenal ditolak sebelum pengarsipan/rebuild; database asli tetap utuh. Layar startup menampilkan alasan, coba lagi, serta ekspor arsip jika salinannya tersedia.

Saat rebuild, FK dinonaktifkan di luar transaksi, seluruh data disalin ke skema baru dalam transaksi, jumlah catatan dan integritas diperiksa, lalu versi disimpan pada transaksi yang sama. Snapshot dibandingkan lagi sebelum penggantian untuk menjaga edit yang masuk selama penyimpanan arsip. FK diaktifkan dan diperiksa dalam `finally`. Kegagalan saat salin, indeks, penulisan versi, atau commit mengembalikan data/skema/versi sebelumnya. Jika pengaktifan FK gagal setelah commit, startup tetap diblokir; coba lagi mengaktifkan perlindungan sebelum membuka layar data.

## Cadangan dan kompatibilitas

Ekspor terbaru tetap `formatVersion: 1`, sekarang `schemaVersion: 2`, mencakup FK tahapan dan label sesi. Cadangan lengkap schemaVersion 1 masih dapat diimpor dengan pemetaan eksplisit. Snapshot lama yang tidak lengkap tetap ditolak.

Arsip pra-migrasi dengan data valid dapat diimpor melalui Pengaturan → Pulihkan dari berkas. Import membaca nilai baris dengan daftar tabel/kolom yang dikenal; definisi SQL arsip **tidak dijalankan**. Preview, konfirmasi penggantian, salinan pengaman, staging, dan transaksi restore tetap berlaku. Arsip yang memuat orphan/conflict ditolak sampai masalahnya ditangani secara eksplisit. Arsip internal tetap JSON tanpa enkripsi dan dapat hilang saat aplikasi/penyimpanan browser dihapus; simpan cadangan eksternal.

## Transaksi jalur tulis

Pembuatan tugas cepat + prioritas, pemeriksaan batas lima prioritas + insert, toggle tugas + salinan checkbox harian, pencatatan sesi + akumulasi menit, pertukaran urutan tahapan, serta perubahan beberapa preferensi menggunakan transaksi sinkron Drizzle. Callback transaksi tidak memakai `async`/`await`; seluruh statement dijalankan sebelum commit. Penambahan menit memakai ekspresi SQL agar pembaruan tidak saling menimpa.

## Verifikasi dan batas rilis

- `npm run test:integrity`: 29 pemeriksaan dengan migration/repository produksi dan driver Drizzle Expo. Mencakup instalasi bersih, upgrade penuh/kolom lama, nilai dan jumlah baris, idempotensi, arsip yang dapat dipulihkan tanpa eksekusi SQL, orphan/conflict/kolom asing, penyimpanan gagal, rollback salin/indeks/versi/commit, edit bersamaan, pengaktifan FK, seluruh kebijakan hapus, dan kegagalan operasi majemuk.
- `npm run test:backup`: 43 pemeriksaan, termasuk kompatibilitas snapshot lengkap versi sebelumnya.
- `npm run test:ui`: 42 render layar dan 12 render form, plus pemeriksaan startup gagal tidak memasang navigasi CRUD, pesan pemulihan, dan retry berhasil. Layar pemulihan dapat digulir untuk teks besar.
- Harness audit lama kini menandai perbaikan FK, orphan/delete, backup, serta kontribusi tugas proyek. Bukti audit awal tidak ditulis ulang. Masalah checkbox lintas jalur, tanggal, dan validasi agenda masih direproduksi; exit 0 harness audit bukan berarti aplikasi bebas bug.

QA migrasi pada Android/iOS, disk penuh sebenarnya, penghentian proses/kehabisan daya saat rebuild, kecepatan database mendekati batas, dan berkas berbagi perangkat belum diuji. Jangan menganggap uji SQLite memori sebagai sertifikasi rilis native. Tidak ada dependensi baru pada tahap ini.

Konsolidasi status tugas/checkbox, migrasi milestone menjadi roadmap yang baru, pengarsipan sebagai aksi produk, agenda/tanggal, serta timer persisten tidak dipaksakan ke migrasi ini. Langkah berikutnya R0.3 menangani tanggal dan agenda; R0.4 menangani status/progres lintas layar secara menyeluruh. Rancangan v2 tetap menjadi arah, dengan kompatibilitas legacy dijaga sampai migrasinya diuji tersendiri.

API transaksi dan koneksi dicocokkan dengan [Expo SQLite SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), implementasi driver Drizzle yang terpasang, serta [prosedur ALTER TABLE SQLite](https://www.sqlite.org/lang_altertable.html).
