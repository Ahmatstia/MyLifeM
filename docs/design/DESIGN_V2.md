# MyLife Design v2 — Botanical Pop

Tanggal: 26 Oktober 2026. Status: token, komponen, dan alur UI inti telah diterapkan; lihat [cakupan implementasi](./UI_IMPLEMENTATION_2026-10-26.md). Bagian yang membutuhkan fitur R2 tetap rancangan. QA native masih tertunda. Menggantikan arah visual lama; dokumentasi lama tetap sebagai sejarah.

## 1. Konteks dan karakter

Produk dipakai saat pengguna perlu memilih tindakan, memahami rencana, dan menilai progres. Karakter yang dipilih: hangat, berani, tenang untuk membaca, dan terasa personal. Referensi prinsip berasal dari Material 3 Expressive; referensi penataan waktu dari Structured/Tiimo. Palet dan komposisi berikut adalah keputusan desain MyLife, bukan hasil uji preferensi pengguna.

Masalah lama bukan warna ungu semata. Semua ringkasan/kartu memakai bahasa visual mirip, badge bertumpuk, teks aksen terlalu terang, dan banyak aksi bersaing dalam baris sempit. Redesign harus mengubah hierarki dan perilaku layout bersamaan dengan warna.

## 2. Palet terpilih

- Latar utama **Ivory** `#F7F5EF`; kartu baca `#FFFFFF`; surface pendukung `#EEEFE7`.
- Aksi utama **Deep Teal** `#125B50`, teks `#FFFFFF`.
- Hero **Petrol** `#173C36`, teks `#FFFFFF`, aksen **Citron** `#D5F478` dengan teks `#293B13`.
- Pilihan/kategori teal lembut `#DDEDE5`, teks `#153F35`.
- Area refleksi/aksen hangat **Peach** `#FFE3D5`, teks `#6C2B18`; coral `#FF9275` hanya dekorasi atau dengan pasangan gelap yang diverifikasi.
- Teks utama `#262D29`; teks sekunder `#5D6861`; teks bantu yang penting tidak diturunkan dengan opacity.
- Error `#A83030` dengan container `#FFE4E0`, teks `#7B2424`; sukses `#236341` dengan container `#E0F1E6`, teks `#194B31`. Semua pasangan baru diverifikasi saat token diterapkan.

Warna kategori bukan warna teks otomatis. Gunakan isi lembut dan label gelap, plus nama/ikon. Keuangan/kesehatan tidak dibedakan hanya lewat merah/hijau. Citron dipakai pada tindakan/indikator utama di hero; jangan menyebarnya ke semua tombol dan status.

## 3. Pemeriksaan kontras awal

Rumus luminansi relatif sRGB/WCAG dihitung pada audit untuk pasangan yang dipilih:

- putih pada primary: **7,96:1**.
- putih pada hero: **12,10:1**.
- teks utama pada ivory: **12,93:1**.
- teks sekunder pada ivory: **5,32:1**.
- teks citron pada citron container: **9,85:1**.
- teks peach pada peach container: **8,62:1**.
- teks teal pada teal container: **9,65:1**.

Ini verifikasi pasangan statis, bukan kelulusan seluruh UI. Semua state terpilih/pressed/disabled, ikon, border field, progress, serta overlay bubble diuji lagi pada komponen hasil implementasi. Teks kecil aktif minimal 4,5:1; elemen penting nonteks minimal 3:1 sesuai konteks pedoman.

## 4. Bentuk dan bubble

Hero memakai radius 28–32 dp dan bidang warna kuat. Kartu isi memakai radius 20–24 dp; field 14–16 dp; tombol CTA radius 16–20 dp; chip benar-benar pill. Variasi ini mempunyai fungsi: hero menarik perhatian, tugas mudah dipindai, kontrol mudah dikenali.

Bubble maksimum dua pada hero/background: bentuk lingkaran besar terpotong atau oval; berada di sudut yang tidak dipakai teks, pointerEvents none, tidak dibacakan screen reader. Isi dekorasi tidak menjadi latar teks kecil. Tidak perlu gradient, bitmap, dependency, blur besar, animasi kontinu, atau bubble pada setiap kartu.

Pisahkan dekorasi hero dan kontennya agar clipping tidak memotong tombol/focus indicator. Dekorasi boleh hilang pada lebar kecil atau teks besar. Rasa premium datang dari komposisi, tipografi, dan respons interaksi, bukan banyak efek.

## 5. Tipografi dan spacing

Pertahankan Plus Jakarta Sans 400/500/600/700 yang sudah terpasang. Nama keluarga per bobot konsisten lewat AppText. Skala awal: judul layar 28/36, judul seksi 20/28, judul kartu 16/24, isi 14–16/20–24, metadata 12/18; 11 hanya untuk label navigasi singkat bila tetap terbaca.

Angka progres/tabular memakai font tabular; timer 48–56 dengan penyesuaian ruang. Teks tidak dipaksa satu baris untuk judul penting. Form/detail memperlihatkan judul lengkap; daftar boleh dua baris dengan detail yang dapat dibuka.

Grid 4 dp: 4, 8, 12, 16, 20, 24, 32, 40, 48. Margin layar 20 dp pada lebar normal, 16 dp pada compact. Jarak antar seksi 24–32 dp; antar baris/kartu 12 dp. Kontrol nyata minimal 48×48 dp; jangan mengandalkan hitSlop yang saling menimpa.

Gunakan minHeight/padding daripada height tetap pada komponen berteks. Susunan kolom beralih menjadi tumpuk ketika tidak muat/teks membesar. Batas lebar konten pada tablet/web tidak boleh mengubah pola mobile menjadi baris padat.

## 6. Komposisi layar

### Hari Ini — keputusan berikutnya

Header tanggal di atas judul “Ruang untuk yang penting.” atau “Hari Ini”, dengan Pengaturan berlabel aksesibel. Satu hero petrol berisi tindakan berikutnya yang nyata dan satu CTA citron “Mulai fokus” atau “Pilih prioritas”. Bubble berada di sudut kanan tanpa menutupi copy.

Di bawah hero: dua angka ringkas (tugas selesai dan menit fokus), lalu prioritas sebagai baris putih yang tenang. Hindari dua hero besar yang berkompetisi. Timer tampil ketika diminta atau sesi aktif; status sesi tidak hilang saat diminimalkan.

Agenda terdekat berupa timeline ringkas setelah prioritas. Review mingguan menjadi panel peach saat R2 siap, memakai data nyata. Jangan menampilkan ringkasan palsu atau persentase hidup.

### Target — arah dan langkah

Header judul + aksi tambah 48 dp. Ringkasan menampilkan cakupan jelas: semua target atau kategori terpilih, dengan label “Tugas rencana selesai”. Filter kategori horizontal memiliki state terpilih jelas; pengelolaan kategori berpindah ke Pengaturan.

Kartu tujuan lebih editorial: kategori kecil, judul kuat, next action, progres dan jumlah tugas. Satu target tidak perlu banyak badge. Empty state memberi contoh target seperti AI Engineer dan CTA membuat target, tanpa angka progres fiktif.

Detail: judul/alasan/kriteria hasil; indikator progres rencana dengan penjelasan; next action; roadmap vertikal; proyek terkait; bukti hasil saat R2 siap. Timeline tahapan berbeda dari kartu daftar biasa. Aksi edit/reorder/hapus berada pada menu berlabel, bukan empat ikon kecil dalam header.

### Proyek — hasil kerja

Daftar menonjolkan deliverable dan target terkait; status lifecycle tertulis jelas. Detail berisi hasil yang ingin dibuat, progres tugas, tahapan dan tindakan berikutnya. Jangan mencoret judul proyek hanya karena checklist mencapai 100% jika hasil belum ditinjau.

### Agenda — waktu yang terbaca

Tanggal terpilih dengan navigasi yang tidak dibatasi 14 hari selamanya. Strip pendek untuk hari sekitar, akses pindah tanggal lebih jauh. Jadwal berwaktu memakai kolom jam dan garis timeline; kegiatan sepanjang hari terpisah di atas. Bentrok dan event yang melewati tengah malam tetap terlihat.

CTA menjadwalkan kegiatan atau tugas tersimpan, tanpa membuat salinan tugas. Form memisahkan tanggal/jam mulai/selesai, sepanjang hari, pengingat nonaktif/saat mulai/sebelumnya; error dekat field. Jam salah tidak diganti otomatis.

### Pengaturan — pengelolaan yang jarang dilakukan

Kelompok: Organisasi (Kategori), Fokus, Notifikasi, Data & Privasi, Tentang. Kategori membuka bottom sheet reuse, tidak menambah tab. Perubahan preferensi langsung berpengaruh dan status simpan terlihat.

Cadangan memperlihatkan kapan dibuat dan apakah pemulihan sudah diuji; aksi ekspor/import jelas. Jangan mengiklankan preview JSON sebagai pemulihan lengkap.

### Form dan dialog

Label selalu terlihat di atas input. Field memakai warna teks/border yang jelas; teks salah dan tombol mencoba ulang tidak tersembunyi di belakang keyboard. Header + isi scroll + footer aksi dipisah agar CTA tetap bisa dijangkau. Close saat ada perubahan penting menjelaskan konsekuensi; simpan gagal mempertahankan isian.

Satu modal aktif; jangan membuka manajemen kategori di atas form target sehingga state hilang. Akses “Kelola di Pengaturan” membawa pengguna secara jelas dan menyimpan draft bila navigasi mengharuskannya.

## 7. Komponen yang digunakan

Reuse AppText, Button, Card, Screen, AppBottomSheet, Banner, EmptyState, ProgressBar dan ProgressRing. Perbarui kontraknya terlebih dahulu untuk minHeight, wrapping, label aksesibilitas, loading, dan semantic color pasangan. Tambahkan primitive TextField/IconButton hanya jika perubahan form/aksi berulang membutuhkannya, bukan membuat pustaka UI baru.

Warna/radius/typography berasal dari src/theme; hilangkan literal lavender/putih yang membypass token pada komponen fitur. Sinkronkan konfigurasi splash/navigation/app.json ketika implementasi berjalan, dengan dokumentasi SDK 58. Tema starter yang tidak dipakai dibersihkan setelah verifikasi pemakai.

## 8. State, bahasa, dan gerak

- Loading pertama: indikator lokal yang tidak menampilkan angka ringkasan sebagai hasil final; error mempunyai retry. Hindari empty state bersamaan dengan error yang sebenarnya.
- Sukses: perubahan terlihat segera setelah commit; jangan menutup form sebelum sukses.
- Kosong: sebut objek dan satu tindakan, misalnya “Belum ada langkah untuk target ini” → “Tambah langkah”.
- Bahasa: Indonesia yang ringkas dan mendukung; “Rencana bisa disesuaikan”, bukan menyalahkan ketika target tertunda.
- Gerak: feedback tekan singkat, perpindahan konten yang membantu orientasi; ikuti Reduce Motion. Tidak menambah konfeti/bubble bergerak terus hanya untuk terlihat hidup.

## 9. Gerbang visual sebelum rilis

Uji lebar 320/360/412 dp, font sistem 100/150/200%, judul panjang, form dengan keyboard, data kosong/padat, seluruh state tombol, TalkBack, safe area Android, dan iOS bila target build didukung. Screenshot before/after setiap layar dan modal diperlukan; perbandingan token saja belum membuktikan redesign selesai.
