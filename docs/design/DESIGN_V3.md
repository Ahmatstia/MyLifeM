# MyLife Sprout — sistem desain aktif

Pembaruan: 22 November 2026. Dokumen ini menggantikan spesifikasi Clean dan Botanical Pop yang berbeda dari UI aktif. Tampilan Sprout yang sudah digunakan dipertahankan; perubahan berikut menutup ketidaksesuaian kontrak dan aksesibilitas, bukan membuat redesign baru.

## Sumber kebenaran

- Warna: `src/theme/colors.ts`; latar cream, permukaan card, teks ink, aksi forest, aksen sun. Teks sekunder/subtle/faint tetap memiliki kontras minimal 4,5:1 terhadap permukaan tempatnya digunakan. Nilai literal historis tidak menjadi token baru.
- Tipografi: `src/theme/tokens.ts`. Plus Jakarta Sans untuk isi, Fredoka/Quicksand untuk identitas judul sesuai peran. Tetap menghormati ukuran font sistem; teks esensial membungkus dan tinggi konten bertambah.
- Komponen: `src/shared/ui/`. Screen mengurus safe area, lebar konten dan keyboard. FormScreenHeader/SproutTopBar untuk formulir; PillTabs untuk pilihan tampilan; ChoiceTile untuk kategori.
- Draft/error: input tidak hilang saat simpan gagal; aksi ganda ditahan; sukses ditampilkan setelah commit. Native permission failure dibedakan dari kegagalan menyimpan data.

## Kontrak menurut peran

- SoftCard/kartu fitur: radius 24–28, padding 16–20. Kartu hero/ilustrasi boleh radius 26–34; tidak dipakai untuk setiap field. Tombol/chip berbentuk pill memakai radius penuh. Perbedaan ini disengaja berdasarkan peran, bukan dua desain aktif.
- Form satu baris: minimum 48 dp, label terlihat dan accessibilityLabel stabil. Textarea minimum 88 dp. Baris tanggal/jam boleh ringkas secara horizontal dengan tinggi sentuh tetap cukup.
- Kontrol interaktif: area tekan minimum 44 dp; ikon lebih kecil boleh memakai hitSlop yang tidak bertabrakan dengan aksi lain. Tombol teks bertambah tinggi pada font besar. Selected/disabled/checked memiliki state aksesibilitas.
- Kategori dan pilihan cepat: wrap atau gulir horizontal yang disengaja; tidak memaksa empat kotak tetap dalam lebar 320 dp. Label penting tetap dapat dibaca pada font 200%.
- Timer: satu tugas aktif, satu sesi persisten, aksi mulai/jeda/akhiri/reset jujur. Bentuk ring dan panel kontrol merupakan pengecualian layout untuk timer. Pemilih ambience yang belum memiliki pemutar dihapus sampai tersedia implementasi lengkap.
- Grafik dan ringkasan: hanya data nyata. Persentase tugas selesai tidak disebut peningkatan/tren. Tidak ada kurva waktu ilustratif yang tampak sebagai hasil pengukuran.
- Ilustrasi/WaveBackdrop bersifat dekoratif; tidak boleh memperlebar area kontrol atau menutupi informasi. Hero dapat membungkus ke dua baris pada ruang kecil.

## Navigasi dan data

Alur aktif Target → Tahapan → Tugas → Hari Ini. Proyek terpisah dihapus. Kalender menyediakan harian/rutin dan semua tanggal bulan. Pengaturan memuat preferensi, kategori, backup dan pemulihan. Statistik contoh/profil palsu tidak ditampilkan.

Hapus tugas meminta konfirmasi dengan konsekuensi subtask/prioritas/pengingat dan pelestarian sesi fokus. Alarm lagu/layar aplikasi hanya dijanjikan saat aplikasi aktif; di latar belakang/tertutup memakai notifikasi OS dengan batas izin/perangkat.

## Verifikasi

Gerbang otomatis: lint/typecheck, suite komponen, semua input memiliki nama programatik, kontras token, fixture browser 320/360/412/768 dan font 100/200%. Fixture tidak membuktikan keyboard, TalkBack, safe area atau pengiriman notifikasi native. Gerbang perangkat tersebut tetap harus dicatat terpisah dari hasil browser.
