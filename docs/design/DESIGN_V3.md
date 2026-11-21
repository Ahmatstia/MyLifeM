# MyLife Fieldnotes — sistem desain aktif

Pembaruan: 22 November 2026. Redesign ini menggantikan tampilan Sprout yang didominasi ilustrasi dan kartu besar. Tujuannya: lebih banyak informasi berguna dalam satu layar, bentuk komponen bervariasi, dan hierarki yang jelas.

## Karakter visual

Kertas putih kehijauan, tinta hijau gelap, limau sebagai aksen tindakan, dan ungu atau terakota pada konteks tertentu. Plus Jakarta Sans yang sudah tersedia digunakan untuk seluruh hierarki. Identitas muncul melalui garis tepi, nomor urut, bidang gelap, dan komposisi; dekorasi tidak mengambil ruang konten.

Sumber kebenaran tetap `src/theme/colors.ts` dan `src/theme/tokens.ts`. Nama key `sprout` dan nama komponen lama dipertahankan untuk kompatibilitas pemanggil; bukan tema lain yang dapat dipilih. Ukuran isi 12–14, judul bagian 16–17, judul layar 24–28. Label mikro 10–11 hanya untuk informasi sekunder. Angka timer dan metrik menjadi aksen, bukan ukuran standar semua teks.

## Susunan menurut fungsi

- Hari Ini: panel fokus gelap berdampingan dengan ringkasan tugas/waktu. Pada font besar, kedua panel ditumpuk. Jadwal salat berupa tabel ringkas; tugas dan agenda memakai linimasa terbuka.
- Target: ringkasan progres tunggal, filter berupa indeks bergaris bawah, kartu bernomor dengan aksen tepi. Angka merupakan progres tugas dan estimasi waktu, bukan tren atau statistik buatan.
- Detail Target: judul, metadata, satu progres, lalu tahapan yang bisa dikerjakan. Maskot, indikator progres kedua, dan peta tahapan duplikat dihapus dari presentasi.
- Kalender: navigasi minggu dan kisi bulan lengkap dipertahankan; sel bertambah tinggi mengikuti font. Agenda menggunakan baris waktu dan kategori.
- Formulir: satu permukaan input, kategori dalam pilihan horizontal berukuran ringkas, tombol simpan 48 dp. Tidak ada kartu dekoratif membungkus input berulang kali.
- Timer: angka pada panel gelap dan indikator progres linear; mode, jeda, lanjutkan, reset, dan pencatatan tetap menggunakan fungsi yang sama. Indikator interval dekoratif yang tidak mengukur jumlah sesi dihapus.
- Tugas & Alarm: ringkasan angka dalam satu baris, kartu tugas dengan aksen tepi, waktu pengerjaan dan tenggat tetap terpisah jelas. Pesan batas alarm perangkat tetap terlihat.
- Pengaturan: kelompok baris yang padat, pilihan durasi dan seluruh pemulihan/cadangan tetap tersedia.
- Tambah Baru: menu teks dan ikon dalam lembar yang dibatasi tinggi dan dapat digulir. Navigasi bawah lebih tipis, tombol tambah tidak menonjol di atasnya.

## Ukuran dan interaksi

Permukaan utama radius 12–18 dengan padding 12–16. Komponen ringkas tetap mempertahankan area tekan dan hitSlop; minimum input 48 dp. Teks mengikuti ukuran sistem dan konten boleh bertambah tinggi. Menu tambah dibatasi 92% tinggi layar; daftar bisa digulir. Timer menumpuk pemilih mode dan aksi sekunder pada font minimal 150%.

Tidak ada dependensi baru, migrasi database, perubahan format backup, maupun perubahan penjadwalan alarm dalam redesign ini. Jalur Target → Tahapan → Tugas → Hari Ini tetap berlaku.

## Verifikasi

`test:ui` memeriksa interaksi, draft gagal, status, navigasi, dan guard penyimpanan. `test:layouts` memeriksa 12 layar/komponen × 4 lebar (320/360/412/768) × 2 skala font (100/200%), termasuk timer. Screenshot 360/100% dan 320/200% dipakai untuk inspeksi visual. Pengujian browser menggunakan konteks baru dengan SQLite web; tidak memakai database pengguna.

Screenshot aplikasi nyata di `screenshots/fieldnotes/` berisi data contoh yang dibuat melalui formulir pada konteks browser terisolasi. Ini pratinjau web, bukan bukti Android native. Keyboard, safe area perangkat, TalkBack, dan perilaku alarm ketika aplikasi ditutup masih memerlukan verifikasi di HP. Redesign tidak menutup tiga temuan QA native pada laporan audit sebelumnya.

Hasil 22 November 2026: lint dan TypeScript lolos; suite UI, 68 pemeriksaan fungsi/input, 14 pemeriksaan timer, dan 18 simulasi siklus alarm lolos. Seluruh 96 kasus layout lolos, termasuk kontrol tutup dan akses gulir menu tambah pada teks besar. Enam skenario CRUD/reload web dan penelusuran pratinjau aplikasi nyata selesai tanpa error browser. Export bundle Android juga berhasil; hasilnya bukan APK dan tidak menggantikan uji perangkat.
