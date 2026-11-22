# Pita waktu untuk MyLife

## Situasi pemakaian

Seseorang membuka MyLife di sela kegiatan, sering kali dengan satu tangan. Keputusan pertamanya sederhana. Tugas mana yang bisa mulai dikerjakan, dan berapa lama waktu yang diperlukan? Beranda menampilkan jawaban dari rencana hari ini dan sesi yang tersimpan di perangkat.

## Warna dan huruf

Kabut mengisi latar terluas. Porselen dan Nila membentuk lapisan kedua. Aprikot dipakai paling sedikit, terutama pada tindakan utama. Perbandingan 60/30/10 menjadi panduan komposisi, bukan kuota untuk setiap halaman.

- **Kabut** `#F1F4F8`, HSL 214° 33% 96%. Latar halaman.
- **Porselen** `#FAFBFD`, HSL 220° 43% 99%. Bidang formulir, bilah bawah, dan tulisan di atas Nila.
- **Tinta** `#172A45`, HSL 215° 50% 18%. Judul dan isi. Kontras di atas Kabut 13,1 ∶ 1.
- **Nila** `#283E73`, HSL 222° 48% 30%. Pita fokus, hari terpilih, dan garis fokus keyboard. Kontras dengan Porselen 10,0 ∶ 1.
- **Aprikot** `#FFC28A`, HSL 29° 100% 77%. Bidang aksi fokus dan simpan. Kontras dengan Tinta 9,2 ∶ 1.
- **Sabak** `#475A70`, HSL 212° 22% 36%. Lokasi, kategori, dan keterangan durasi. Kontras di atas Kabut 6,4 ∶ 1.

Plus Jakarta Sans digunakan dalam empat bobot. Judul halaman 32/40, judul tugas utama 24/30, teks isi 14/20 atau 16/24, label pendek 12/18. Angka waktu memakai lebar tetap per digit. Nama panjang dapat turun baris. Jarak memakai kelipatan empat. Ikon centang lebih kecil daripada area sentuhnya.

Status sukses memakai hijau `#246050`, peringatan memakai oker `#795018`, galat memakai merah `#9E3341`. Ikon, label, dan tindakan pemulihan memberi makna yang sama secara tertulis. Latar kontrol berubah saat ditekan. Fokus keyboard memakai garis luar dua lapis yang terbaca di bidang terang dan gelap. Preferensi kurangi gerakan berlaku untuk perpindahan layar, laci, dan dialog.

## Dua susunan yang dipertimbangkan

```text
A. Ringkasan lebih dahulu        B. Mulai dari tugas
Hari ini                        Hari ini      tanggal
[selesai] [menit fokus]         ┌ Fokus berikutnya       ┐
Tugas berikutnya                │ Baca 10 halaman buku   │
[Buka fokus]                    ├ - - - - - - - - - - - ┤
Rencana hari ini                │ [Buka fokus]    15 mnt │
  tugas dan agenda              └────────────────────────┘
Jadwal azan                     Rencana hari ini      [+]
                                ○ Baca 10 halaman buku
                                Jadwal azan
```

Susunan B dipilih agar pengguna melihat tugas sebelum mengevaluasi capaian. Judul, isi, dan aksi mulai sejajar kiri. Durasi sejajar kanan agar mudah ditemukan ketika nama tugas membungkus. Pada teks besar, durasi turun ke baris tersendiri. Pita berubah menjadi timer di tempat yang sama.

## Empat keputusan desain

1. **Satu pita untuk satu sesi.** Garis perforasi membagi nama tugas dan bagian yang dipakai untuk bertindak. Saat sesi dijeda, pita menunjukkan waktu dan jalan kembali ke sesi itu.
2. **Kerapatan mengikuti fungsi.** Tugas menjadi baris dengan kotak centang, tanggal memakai tujuh kolom, dan pilihan Tambah menjadi daftar empat tujuan. Bidang pekat terbesar disimpan untuk tugas aktif.
3. **Angka harus membantu mengambil keputusan.** Progres Target dihitung dari tugas pada daftar yang sedang disaring. Nomor urut hiasan dan ringkasan nol dari nol dihilangkan.
4. **Ruang sentuh lebih besar daripada ikon.** Tanggal, centang, tombol utama, dan kontrol timer memiliki bidang tekan minimal 48 dp. Formulir dan daftar dapat digulir saat teks membesar.

## Kritik dan perubahan

Usulan awal menempatkan dua angka ringkasan di atas. Susunan itu mudah tertukar dengan dasbor kebiasaan lain. Bagian tersebut diganti dengan pita yang menyebut tugas, durasi nyata bila tersedia, dan satu aksi. Penanda bergelombang pada judul serta panah otomatis pada tombol Simpan juga dilepas.

Saat diuji pada lebar sempit dan ukuran teks besar, timer sempat melebar mengikuti isi terpanjang. Lebar timer kini dibatasi oleh ruang yang tersedia. Pemeriksaan hitam-putih dan gambar yang diburamkan menilai posisi aksi, pembagian bidang, dan tingkat terang secara terpisah dari pilihan warna.

## Implementasi dan pratinjau

Token berada di `src/theme/colors.ts` dan `src/theme/tokens.ts`. Beranda, timer, Target, Kalender, Tambah, Tugas & Alarm, Pengaturan, dan formulir memakai komponen React Native yang membaca data aplikasi. Pengujian tata letak mencakup 12 layar atau komponen pada lebar 320, 360, 412, dan 768, masing-masing pada skala teks 100% dan 200%.

Pratinjau di `screenshots/pita-waktu/` diambil dari aplikasi web pada lebar 360. Data contoh dibuat lewat formulir di penyimpanan browser terpisah. Pemeriksaan perangkat fisik mencakup TalkBack, papan ketik Android, getaran, serta alarm saat aplikasi berada di latar belakang.

## Hasil pemeriksaan

- Seluruh 96 kombinasi tata letak lolos tanpa teks atau kontrol melampaui tepi layar secara horizontal.
- Pada aplikasi web hasil ekspor, Tab dan Enter dapat membuka, memulai, menjeda, serta menciutkan timer. Escape menutup menu. Saat gerakan dikurangi, menu langsung berada pada posisi akhirnya. Garis fokus tetap terlihat.
- Di gambar hitam-putih dan gambar dengan blur 3 px, bidang pita tetap menjadi titik perhatian pertama. Tombol mulai masih terpisah dari durasi dan daftar di bawahnya.
- Pemeriksaan kode, alur simpan dan muat ulang, 14 skenario timer, serta 18 simulasi siklus alarm lulus. Bundel Android dan web berhasil dibuat.

[Beranda](screenshots/pita-waktu/hari-ini.png) · [Timer](screenshots/pita-waktu/timer.png) · [Target](screenshots/pita-waktu/target.png) · [Kalender](screenshots/pita-waktu/kalender.png) · [Formulir](screenshots/pita-waktu/formulir.png)
