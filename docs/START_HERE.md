# MyLife — arah produk dan hasil audit

**Pembaruan lanjutan 22 November 2026:** kalender lengkap, pilihan salat berikutnya, konfirmasi hapus, statistik faktual, bootstrap/persistensi web, pemulihan alarm dan aksesibilitas/layout diperbaiki. Dependensi diselaraskan ke patch SDK58 dengan npm audit 0 temuan yang diketahui saat pemeriksaan. Tersisa QA perangkat untuk alarm, aksesibilitas dan layout; lihat [audit bagian 11.9](./audits/FULL_PROJECT_AUDIT.md#119-penanganan-seluruh-area-tersisa).

**Pembaruan 22 November 2026:** kategori/durasi Tugas Hari Ini tersimpan hingga timer dan backup; pengingat jadwal rutin diselaraskan bersama agenda setelah perubahan data, resume dan restore. Jendela weekly 28 hari, maksimal 50 pengingat kalender terdekat; warning izin/cakupan tampil pada kedua layar. Bukti dan langkah QA ada di [audit bagian 11.8](./audits/FULL_PROJECT_AUDIT.md#118-tugas-cepat-dan-pengingat-jadwal-rutin). QA notifikasi perangkat tetap terbuka.

Tanggal: 26 Oktober 2026. Bahasa produk: Indonesia. Platform utama: Android; arsitektur tetap memperhatikan iOS.

**Keputusan produk:** MyLife menghubungkan tujuan hidup dengan tindakan harian dan evaluasi berbasis bukti. Pengguna perlu tahu: saya menuju ke mana, langkah berikutnya apa, kapan dikerjakan, dan hasilnya sejauh mana.

**Keputusan pengguna terbaru:** fitur Proyek dihapus karena bertumpang tindih dengan Target. Alur aktif menjadi **Target → Tahapan → Tugas → Hari Ini**. Proyek lama dipindahkan otomatis menjadi Target tersendiri; relasi target induk sebelumnya dicatat dalam deskripsi. Cadangan lama tetap diterima. Rincian penyimpanan dan batas pengujian tercatat pada bagian konsolidasi di ARCHITECTURE_V2 dan audit terbaru.

Audit awal menyelesaikan perencanaan sebelum perubahan kode aplikasi. Redesign aktif berikutnya menyederhanakan UI menjadi palet hijau-netral, kartu lebih ringkas, navigasi konsisten, dan tanpa profil/statistik contoh. Aturan implementasi ada di [desain v3](./design/DESIGN_V3.md); catatan UI sebelumnya adalah riwayat iterasi, bukan arah visual yang aktif.

Tahap berikutnya sudah mengimplementasikan R0.1: ekspor dan pemulihan berkas lengkap melalui Pengaturan, dengan salinan pengaman dan transaksi. Lihat [implementasi backup](./BACKUP_IMPLEMENTATION_2026-10-26.md) untuk perilaku, verifikasi, batas format, dan pengujian native yang belum dilakukan. Integritas seluruh jalur tulis R0.2 tetap pekerjaan berikutnya.

Pembaruan berikutnya mengimplementasikan fondasi R0.2: constraint FK dan kepemilikan, migrasi berversi dengan arsip pengaman, transaksi majemuk dan penghapusan yang menjaga histori. [Catatan R0.2](./INTEGRITY_IMPLEMENTATION_2026-10-26.md) menjadi acuan keadaan kode terbaru dan batas QA; agenda/tanggal serta konsolidasi status masih menunggu tahap selanjutnya.

## Urutan membaca

Pembaruan terbaru: **R0.5 timer dan refleksi** diimplementasikan pada 27 Oktober 2026. [Catatan timer](./TIMER_IMPLEMENTATION_2026-10-27.md) menjelaskan pemulihan sesi, simpan sebelum refleksi, idempotensi, preferensi, dan batas background/presisi menit. Implementasi fondasi R0 tersedia dengan gerbang rilis native yang masih terbuka; berikutnya QA perangkat dan R2.1 kriteria hasil/tindakan berikutnya.

Pembaruan sebelumnya: **R0.4 status, progres, dan refresh** sudah diterapkan. [Catatan R0.4](./PROGRESS_IMPLEMENTATION_2026-10-27.md) menjadi acuan untuk status tugas, pembatalan, agregasi progres, dan pemuatan ulang antarlayar.

Tahap sebelumnya, R0.3, memperbaiki tanggal lokal, agenda lintas malam, validasi waktu, dan rekonsiliasi pengingat. [Catatan kalender](./CALENDAR_IMPLEMENTATION_2026-10-26.md) menjelaskan perilaku, kompatibilitas legacy, batas penjadwalan, dan QA native yang belum selesai.

1. [Audit sistem](./SYSTEM_AUDIT_2026-10-26.md): keadaan kode, bukti masalah, risiko, batas pemeriksaan.
2. [Riset kebutuhan dan referensi](./RESEARCH_2026-10-26.md): temuan sumber, konteks manusia, asumsi yang belum diuji.
3. [PRD v2](./PRD_V2.md): arah, pengguna prioritas, aturan bisnis, contoh AI Engineer, batas rilis.
4. [Arsitektur v2](./ARCHITECTURE_V2.md): struktur folder, model data, integritas, migrasi, lifecycle.
5. [Desain v2](./DESIGN_V2.md): arah visual, warna, hierarki layar, komponen, aksesibilitas.
6. [Backlog dan gerbang rilis](./DELIVERY_ROADMAP.md): pekerjaan berurutan dengan kriteria selesai.

[Pratinjau visual Botanical Pop](./design-preview.html) adalah konsep historis dan tidak lagi menjadi acuan visual. Untuk layar React Native yang aktif, gunakan token di `src/theme/` dan aturan pada [desain v3](./design/DESIGN_V3.md).

## Mana yang menjadi acuan?

- Audit adalah catatan keadaan awal yang tetap; jangan mengubah bukti awal setelah bug diperbaiki. Catat hasil perbaikan di backlog.
- PRD_V2, ARCHITECTURE_V2, DESIGN_V2, dan DELIVERY_ROADMAP adalah keputusan perencanaan terbaru, menggantikan bagian bertentangan di dokumen lama untuk pekerjaan selanjutnya.
- Kode di `src/` sudah memuat redesign UI tahap awal; aturan bisnis/database yang belum diperbaiki tetap mengikuti catatan audit. Jangan menyamakan seluruh rancangan v2 dengan implementasi yang tersedia.
- Dokumen `prd.md`, `MYLIFE_MOBILE_PRD_MVP.md`, `architecture.md`, `database.md`, `DESIGN.md`, dan `PROJECT_PROFILE.md` dipertahankan sebagai riwayat. Template bukan bukti bahwa suatu fitur sudah selesai.
- Setiap perubahan fitur harus memperbarui aturan bisnis, tampilan terkait, penyimpanan, dan verifikasinya dalam perubahan yang sama.

## Keputusan utama

- Pertahankan aplikasi lokal, struktur per fitur, Expo Router, SQLite, Drizzle, dan Plus Jakarta Sans.
- Stabilkan data dan hubungan progres sebelum memperbesar cakupan.
- Kategori dikelola dari Pengaturan dengan bottom sheet yang sudah ada. Tidak perlu tab atau layar utama kategori.
- Mulai dari mahasiswa, orang belajar mandiri, dan pekerja yang sedang meningkatkan keterampilan; perluas berdasarkan kebutuhan yang teruji.
- Tiga layar utama: Hari Ini, Target, Agenda, disertai tombol Tambah dan Menu. Evaluasi mingguan masuk melalui ringkasan Hari Ini, bukan tab baru.
- Arah visual aktif: **MyLife Clean** — hijau sebagai aksen tindakan, permukaan netral, kepadatan informasi terkontrol, dan hierarki tipografi ringkas.
- Tidak menambah AI, cloud, keuangan rinci, atau pemantauan kesehatan otomatis pada rilis fondasi.

## Verifikasi keadaan awal

`npm run lint` dan `node_modules/.bin/tsc --noEmit` berhasil pada audit ini. `node scripts/audit-system.cjs` menjalankan repository produksi pada database sementara di memori dan mereproduksi sembilan kasus masalah. Exit 0 pada skrip audit berarti kasus lama berhasil direproduksi, **bukan** aplikasi bebas bug. Skrip memerlukan Node 22 dengan `node:sqlite` dan dependency proyek terpasang.

Hasil reproduksi tersimpan di [audit-evidence.json](./audit-evidence.json). Pratinjau desain lolos pemeriksaan struktur, script, tujuan navigasi, font lokal, serta lima perpindahan layar dan dialog sesi dengan DOM mock. Pemeriksaan visual browser tidak selesai karena koneksi localhost ditolak lingkungan; belum ada QA native Android/iOS. Jangan menganggap prototipe ini sebagai hasil pengujian tampilan aplikasi.
