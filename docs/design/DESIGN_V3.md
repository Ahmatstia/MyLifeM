# MyLife Clean — sistem desain aktif

Tanggal: 4 November 2026. Status: acuan implementasi UI aktif.

## Tujuan

MyLife membantu pengguna menghubungkan tujuan, tindakan hari ini, agenda, dan progres. Antarmuka harus membuat tindakan berikutnya mudah ditemukan tanpa membuat setiap informasi terasa seperti kartu utama. Prinsip layout aplikasi layanan seperti Gojek dipakai sebagai referensi untuk akses cepat dan hierarki yang jelas; identitas visual, aset, dan komponen Gojek tidak disalin.

## Aturan visual

- Gunakan latar abu-hijau sangat muda, permukaan putih, teks hijau kehitaman, dan hijau `colors.primary` hanya untuk tindakan utama/keadaan terpilih.
- Gunakan warna semantik `success`, `warning`, dan `error` untuk status. Hindari warna literal di screen/component; tambahkan token bila memang dibutuhkan lintas fitur.
- Judul layar ringkas (umumnya `headlineSmall`); judul kartu `titleSmall`/`titleMedium`; detail menggunakan `bodySmall` atau `labelSmall`.
- Kartu memakai border lembut, radius `radius.lg`, dan padding `space[3]`. Simpan bidang berwarna besar hanya untuk satu fokus utama layar bila diperlukan.
- Jangan menambahkan profil, jumlah, grafik, kutipan, atau contoh data statis yang tidak bersumber dari keadaan aplikasi.
- Gunakan `CapsuleDateStrip` untuk pemilih pekan yang sama. Kategori dikelola dari Pengaturan, bukan melalui layar navigasi baru.
- Aksi yang bisa ditekan mempertahankan area sentuh minimum 44 dp; ikon boleh kecil, area tombol tetap cukup.
- Gunakan satu pola navigasi bawah yang konsisten. Hindari FAB dekoratif jika tindakan yang sama sudah tersedia dalam layar.

## Pola layar

- **Hari Ini:** salam/tanggal singkat, pemilih tanggal, fokus/timer, ringkasan progres faktual, tindakan prioritas dan agenda terdekat.
- **Target dan Proyek:** judul, ringkasan kecil yang dihitung dari data aktif, filter, lalu daftar. Detail menonjolkan progres, langkah, dan tindakan yang benar-benar berjalan.
- **Agenda:** judul dan aksi tambah, pemilih tanggal, mode harian/mingguan, lalu daftar kronologis yang rapat. Tanggal yang dibuka dari layar lain harus dipertahankan.
- **Pengaturan:** kelompokkan preferensi, kategori, dan privasi dalam baris ringkas; hilangkan dekorasi yang mengulang label.

## Implementasi

Ambil warna dari `src/theme/colors.ts`, radius/spacing/tipografi dari `src/theme/tokens.ts`, dan gunakan komponen bersama di `src/shared/ui/` bila pola berulang. Perubahan token bersama harus ditinjau pada seluruh screen yang menggunakannya. Pastikan teks dinamis dapat membungkus, status dapat dipahami tanpa warna saja, dan tombol tetap nyaman ditekan pada perangkat kecil.

## Referensi

- [Tampilan Baru Gojek](https://www.gojek.com/blog/gojek/tampilan-baru-gojek) untuk akses layanan dan hierarki pada halaman utama.
- [Story of GO-JEK UI/UX](https://www.gojek.com/blog/gohr/story-of-go-jek-uiux) untuk konteks penyederhanaan akses pada aplikasi berfitur banyak.

Referensi tersebut menjadi inspirasi prinsip layout saja. MyLife tetap memakai identitas, komponen, warna, dan alur produknya sendiri.
