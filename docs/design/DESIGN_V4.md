# Kertas hangat MyLife

## Tampilan yang berlaku — 26 November 2026

Gaya Hari Ini kini menjadi dasar seluruh aplikasi. `src/theme/today.ts` menyediakan palet bersama: kertas #F8EFDF, tinta #352E26, kuning #F4D187, biru #D4EAF0, ungu #E8DFF7, dan mint #DEEDCF. `colors.ts` memetakan palet ini ke peran warna yang digunakan layar dan dialog. Fredoka Medium digunakan untuk judul utama, Plus Jakarta Sans untuk isi. Aksi utama memakai tinta gelap atau kuning, kontrol terpilih memiliki penanda yang jelas, dan kartu mempertahankan warna lembut yang sesuai fungsi.

Target memakai map pastel dan filter kapsul. Rincian target memakai sampul ungu. Kalender memakai kepingan tanggal membulat, dengan tanggal terpilih berwarna tinta. Manajemen Tugas memakai kartu krem, bidang waktu mulai mint, dan tenggat kuning. Pengaturan memakai kelompok kartu krem dan ikon pastel. Formulir, pilihan kategori, tombol simpan, dialog, tambah cepat, menu, notifikasi, dan detail pengingat mengikuti palet serta geometri yang sama. Ikon lonceng hanya ada di Hari Ini.

Jarak layar tetap 16 dp pada ponsel, 24 dp pada layar lebar, dan lebar konten maksimal 640 dp. Tombol memiliki bidang sentuh minimal 48 dp. Sudut dibedakan menurut fungsi: input dan kontrol 16 dp, kartu 22–28 dp, aksi utama dan filter berbentuk kapsul. Isi panjang dapat turun baris dan daftar tetap dapat digulir.

Validasi versi ini: lint dan pemeriksaan tipe lulus; regresi UI lulus; 168 kombinasi tata letak Chromium pada lebar 320/360/412/768 dengan ukuran teks 100/200% lulus tanpa luapan horizontal. Ekspor web dan Android berhasil. Browser aplikasi dengan data terisolasi menguji penyimpanan target/tugas, navigasi detail, kalender mingguan/bulanan, dialog jadwal, kategori, tambah cepat, menu, serta pusat notifikasi tanpa kesalahan runtime. Tata letak dan keyboard pada perangkat fisik belum diuji ulang untuk versi ini.

[Target](screenshots/paper-all/target.png) • [Rincian Target](screenshots/paper-all/detail-target.png) • [Kalender](screenshots/paper-all/kalender.png) • [Manajemen Tugas](screenshots/paper-all/manajemen-tugas.png) • [Pengaturan](screenshots/paper-all/pengaturan.png)

[Formulir Target](screenshots/paper-all/form-target.png) • [Formulir Tugas](screenshots/paper-all/form-tugas.png) • [Formulir Agenda](screenshots/paper-all/form-agenda.png) • [Tambah Cepat](screenshots/paper-all/tambah.png) • [Menu](screenshots/paper-all/menu.png)

## Arsip arah desain sebelumnya

# Jam meja MyLife (arsip)

## Titik awal

Saat ada waktu setengah jam, pengguna perlu memilih tugas yang muat dan segera mulai. Jam meja menggabungkan tiga hal yang perlu dilihat bersamaan, yaitu nama tugas, durasi, dan tombol fokus. Warna terpekat disimpan untuk tombol yang menjalankan sesi. Bagian lain memakai latar terang.

## Bahan visual

- Kertas ungu muda `#F6F3F6` menjadi latar halaman. Tinta `#332538` dipakai untuk teks utama, dengan `#635568` untuk keterangan.
- Mint `#CAE5D9` membentuk badan jam. Muka jam persik `#FFD1B7` dan sektor koral `#F39A78` menunjukkan menit. Jarum gelap tetap terlihat dalam hitam-putih.
- Murbei `#572C50` menandai aksi utama dan tanggal terpilih. Tab map Target mengulang warna kategori. Nama kategori selalu tertulis.
- Fredoka Medium memberi bentuk bulat pada judul dan angka timer. Plus Jakarta Sans membawa isi, label, dan nama kegiatan. Angka digital tetap menyertai jarum. Satu putaran menunjukkan satu jam.
- Kontrol utama memiliki bidang tekan minimal 48 dp. Nama tugas boleh turun baris. Jam, kontrol waktu, dan kalender menyesuaikan ruang saat teks diperbesar.

## Cara memakai

1. **Hari ini.** Lihat perkiraan tugas pada jam. Jika ada beberapa tugas yang belum selesai, ketuk **Ganti tugas** untuk melihat pilihan berikutnya beserta durasinya. Tekan **Buka fokus** untuk melihat timer. Sesudah sesi dimulai, tugas tetap terikat pada sesi ketika pengguna menjeda atau menciutkan timer.
2. **Tambah tugas.** Pilih durasi secara langsung. **Auto** mengikuti pengaturan fokus. Saat disimpan, tugas mempertahankan durasi yang dipilih.
3. **Target.** Kategori muncul pada tab di punggung map. Judul, status tertulis, dan progres berada di sampulnya. Tekan map untuk mengelola tahap dan tugas. Filter tetap tersedia di atas daftar.
4. **Kalender.** Tampilan pertama menyisakan satu baris tanggal sehingga agenda terpilih langsung terlihat. Tekan nama bulan untuk membentangkan seluruh bulan. Panah berpindah seminggu atau sebulan sesuai tampilan. Pada layar sempit dengan teks besar, tujuh hari dibagi menjadi dua baris. **Hari ini** mengembalikan pilihan ke tanggal sekarang.
5. **Tambah.** Tombol koral di tengah navigasi membuka empat tujuan. Tugas harian menempati tombol teratas. Pengingat, target, dan agenda memiliki tombol tersendiri.

6. **Manajemen Tugas.** Gunakan tombol tambah di judul untuk menjadwalkan tugas. Setiap kartu menampilkan waktu mulai dan tenggat bersebelahan jika cukup ruang. Pilihan suara ada di bawah daftar. Ketika alarm berbunyi, tombol untuk menghentikannya tetap terlihat saat rincian digulir.

## Ukuran dan jarak

Konten memakai tepi 16 dp pada ponsel dan 24 dp saat lebar aman mencapai 600 dp. Kolom maksimal 640 dp dan berada di tengah. Judul dimulai 12 dp di bawah area aman, bagian utama berjarak 16 dp, dan label nama berjarak 8 dp dari kolom isian. Tombol kembali, tutup, dan tambah memiliki bidang sentuh 48 dp. Pada tab, navigasi bawah menyediakan ruang untuk gestur perangkat. Pada halaman yang memiliki tombol melayang, daftar menyediakan ruang tambahan agar baris terakhir bisa dibaca dan ditekan.

## Pengujian tampilan

Sebanyak 21 layar, komponen, dan dialog diperiksa di Chromium pada lebar 320, 360, 412, dan 768 piksel dengan teks 100% dan 200%. Seluruh 168 kombinasi lulus pemeriksaan luapan horizontal dan ukuran tombol. Alur Manajemen Tugas juga diuji lewat Expo Go pada emulator Android dengan lebar 360 dp. Tombol tambah membuka formulir, nama tugas bisa diketik saat keyboard tampil, dan tombol kembali membawa pengguna ke daftar.

## Pratinjau

Gambar diambil dari aplikasi web pada lebar 360 piksel menggunakan data contoh yang dibuat lewat formulir. Tes alarm menggunakan ukuran 320 × 500.

[Beranda](screenshots/jam-meja/hari-ini.png) • [Timer](screenshots/jam-meja/timer.png) • [Target](screenshots/jam-meja/target.png) • [Kalender](screenshots/jam-meja/kalender.png) • [Tambah](screenshots/jam-meja/tambah.png) • [Formulir](screenshots/jam-meja/formulir.png)

[Manajemen Tugas](screenshots/jam-meja/manajemen-tugas.png) • [Jadwalkan Tugas](screenshots/jam-meja/jadwalkan-tugas.png) • [Tes alarm pada layar 320 × 500](screenshots/jam-meja/tes-alarm.png)

[Formulir dengan keyboard Android di Expo Go](screenshots/jam-meja/android-keyboard.png)


## Hari Ini dengan referensi kertas hangat

Pembaruan 26 November 2026 berfokus pada Hari Ini. Referensi pengguna memberi arah berupa latar krem, bidang kuning lembut, judul membulat, dan kontrol berbentuk kapsul. Pengguna meminta karakter lucu melalui komponen dan tipografi tanpa maskot.

Palet khusus Hari Ini menggunakan kertas #F8EFDF, tinta #352E26, kuning #F4D187, biru #D4EAF0, ungu #E8DFF7, dan persik #F9E1CF. Fredoka Medium membentuk judul dan waktu, sedangkan Plus Jakarta Sans digunakan untuk keterangan dan kontrol.

Jadwal azan menampilkan salat berikutnya, jam pelaksanaan, sisa waktu, lokasi, dan kelima waktu salat. Pemilihan waktu mengikuti perhitungan lokasi yang sudah tersedia. Pilihan lokasi tetap dapat dibuka. Panel fokus memakai bidang biru, dial waktu kecil, dan tombol kapsul. Rencana harian memakai kartu berwarna sesuai jenis kegiatan, penanda selesai, keterangan, dan aksi fokus. Filter Semua, Belum selesai, dan Selesai mengikuti status aktivitas.

Ukuran komponen menjaga tepi 16 dp, bidang sentuh minimal 48 dp, judul yang dapat turun baris, dan penyesuaian untuk ukuran teks besar. Angka progres dan waktu berasal dari data aplikasi.

[Hari Ini](screenshots/hari-ini-paper/hari-ini.png) • [Rencana harian](screenshots/hari-ini-paper/rencana.png) • [Timer](screenshots/hari-ini-paper/timer.png)


## Navigasi bawah

Navigasi memakai kapsul krem dengan sudut membulat dan jarak dari tepi perangkat. Tab terpilih ditandai ikon di atas bidang pastel serta label lebih gelap. Tombol tambah berbentuk kancing persik dengan gerakan tekan kecil. Hover dan tekan mempertahankan warna latar tab. Penanda fokus keyboard tetap terlihat, tautan tab mempertahankan perilaku navigasi, dan menu serta tambah membuka panel masing-masing.

[Pratinjau navigasi](screenshots/bottom-nav/navigasi.png)


## Pusat notifikasi

Peringatan status pengingat kalender, jadwal rutin, dan tugas dikumpulkan di halaman Notifikasi. Lonceng kanan atas memakai bidang kuning pastel dan badge jumlah pemberitahuan belum dibaca. Ikon lonceng hanya ditampilkan di kanan atas Beranda/Hari Ini. Halaman lain menggunakan header sesuai tugas masing-masing.

Pemberitahuan status digabung berdasarkan sumber. Sinkronisasi berulang mempertahankan status dibaca; perubahan pesan membuatnya belum dibaca kembali; status yang sudah pulih dihapus otomatis. Status baca berlaku selama sesi aplikasi. Pesan waktu pengingat agenda yang sudah lewat juga masuk ke pusat ini. Ketuk pemberitahuan untuk membuka detail, pemeriksaan izin, dan navigasi ke kalender atau manajemen tugas. Izin hanya diminta melalui tindakan pengguna. Kesalahan simpan/muat, konflik pada agenda, dan konfirmasi penggantian data tetap muncul pada konteks tindakan terkait.

Verifikasi: lint, pemeriksaan tipe, regresi UI, kalender, dan jadwal/pengaturan lulus. Ekspor web dan Android berhasil. Uji browser memakai data terisolasi untuk badge, pemberitahuan, baca semua, pemeriksaan izin, navigasi tujuan, dan empat lebar layar. Pengiriman notifikasi pada perangkat fisik belum diverifikasi ulang.

[Pusat notifikasi](screenshots/notifications/pusat-notifikasi.png) • [Detail pengingat](screenshots/notifications/detail.png)
