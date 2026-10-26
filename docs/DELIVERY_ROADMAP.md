# MyLife — backlog implementasi dan gerbang rilis

Tanggal: 26 Oktober 2026. R0 dan R2/R3 belum selesai. Pemilik meminta implementasi dimulai dari redesign: UI inti R1 telah diterapkan, dengan [cakupan/verifikasi](./UI_IMPLEMENTATION_2026-10-26.md) dan gerbang native yang masih terbuka. Urutan di bawah tetap peta dependensi, bukan janji tanggal; R1 tidak berarti perbaikan data R0 sudah selesai.

## R0 — fondasi data yang dapat dipercaya

### R0.1 Backup lengkap sebelum migrasi [A02]

Status 26 Oktober 2026: implementasi cadangan/restore berkas, validasi 11 tabel, staging, salinan pengaman dan rollback tersedia. Cakupan, pengujian, serta gerbang native yang masih terbuka dicatat di [implementasi backup](./BACKUP_IMPLEMENTATION_2026-10-26.md). Sebagian perbaikan startup yang diperlukan untuk mempertahankan hasil restore ikut diterapkan; R0.2 secara keseluruhan belum selesai.

Sentuh repository/settings hook/screen, tipe format backup, dan uji SQLite. Ekspor categories/stages bersama sembilan tabel lainnya dalam snapshot konsisten. Definisikan formatVersion/schemaVersion; siapkan restore validasi+transaksi pada database sementara dan ekspor berkas lewat modul Expo yang kompatibel.

Selesai bila fixture dengan kategori custom, stage, task, proyek, agenda, sesi, dan pengaturan dapat diekspor lalu dipulihkan dengan nilai/relasi utuh. Import rusak atau versi tidak didukung harus gagal sebelum DB aktif berubah. Preview JSON saja belum selesai.

### R0.2 Migrasi dan integrity [A01, A03, A12]

Status 26 Oktober 2026: FK nyata, kepemilikan tahapan/tugas, kebijakan hapus dan preservasi histori, migrasi user_version 0→1 dengan arsip pengaman/rollback, serta transaksi jalur tulis majemuk telah diimplementasikan. Lihat [implementasi integritas](./INTEGRITY_IMPLEMENTATION_2026-10-26.md). Pengujian perangkat native dan penghentian proses masih merupakan gerbang rilis; konsolidasi legacy/status dijadwalkan terpisah.

Sentuh schema/client/migrations, seluruh jalur hapus/reorder/quick-create/session, startup error state. Tentukan kebijakan orphan/legacy terlebih dahulu, pasang FK nyata dan transaksi, lalu jalankan fixture upgrade sesuai ARCHITECTURE_V2.

Selesai bila rollback teruji, foreign_key_check bersih, versi tidak maju saat migrasi gagal, startup tidak membuka layar CRUD saat DB gagal, dan backup pra-upgrade dapat dipulihkan. Penghapusan tetap menjaga riwayat sesuai kebijakan PRD. Jangan menguji migrasi pertama kali pada database pengguna.

### R0.3 Tanggal dan agenda [A04, A09, A10]

Status 26 Oktober 2026: tanggal lokal/instant, query overlap lintas malam, validasi form/repository/import, lifecycle kalender, dan rekonsiliasi pengingat telah diimplementasikan. Lihat [implementasi kalender](./CALENDAR_IMPLEMENTATION_2026-10-26.md) untuk aturan legacy, batas 50 pengingat, verifikasi, dan gerbang native yang masih terbuka. Pengiriman notifikasi OS belum diuji di perangkat; R0.3 belum melewati gerbang rilis native.

Sentuh helper tanggal bersama, hook Today/Agenda, date strip, query sesi/event, form agenda dan scheduler. Standarkan date-only vs instant, validasi jam dan overlap, pisahkan reminder null/0/positif.

Selesai bila 00:30 WIB/WITA/WIT masuk hari benar; lintas tengah malam tetap terlihat; jam salah tidak diganti diam-diam; tepat-waktu terjadwal ketika izin tersedia; izin ditolak dijelaskan; kembali aktif setelah tengah malam memperbarui tanggal. Native reminder diuji di development build.

### R0.4 Status, progres dan refresh [A05, A06, A11]

Status 27 Oktober 2026: status tugas tunggal, flag kompatibilitas transaksional, progres terdeduplikasi tanpa tugas dibatalkan, serta refresh fokus dengan perlindungan request lama diterapkan pada Target/Proyek/Hari Ini. Lihat [implementasi status dan progres](./PROGRESS_IMPLEMENTATION_2026-10-27.md). Verifikasi otomatis tersedia; alur navigasi dan aksesibilitas native masih memerlukan QA perangkat. Tahap berikutnya R0.5 timer/refleksi.

Sentuh repository target/proyek/stage/daily-focus, domain status/progress, serta hook list/detail. Gunakan status tugas tunggal, rollup tugas proyek melalui relasi proyek, DISTINCT, dan refresh fokus route yang aman dari hasil request lama.

Selesai bila satu tugas proyek yang dicentang dari detail langsung memengaruhi target, daftar proyek, Hari Ini, dan pilihan tugas setelah kembali; tidak ada hitung ganda; reopened/cancelled mempunyai perilaku konsisten. Ringkasan menjelaskan cakupan filter dan arti persen rencana.

### R0.5 Timer dan refleksi [A07, A08]

Status 27 Oktober 2026: checkpoint timer persisten, durasi aktif tanpa jeda, finalisasi transaksional/idempoten, refleksi opsional, preferensi timer/efek, serta kompatibilitas backup telah diterapkan. Lihat [implementasi timer](./TIMER_IMPLEMENTATION_2026-10-27.md). Uji otomatis dan fixture tersedia; gerbang native/background tetap terbuka. Tidak ada alarm akhir timer baru; pemulihan/finalisasi ketika aplikasi kembali aktif dijelaskan pada catatan implementasi.

Sentuh controller timer, preferensi, schema/repository sesi, widget dan dialog refleksi, efek native. Satu sesi aktif persisten, finalisasi idempoten, preferensi dihormati, refleksi tidak menentukan tersimpannya aktivitas.

Selesai bila pause/resume/ganti mode/tugas/reset/selesai/restart teruji dengan jam terkontrol; sesi tidak ganda; menutup refleksi tidak membuang sesi; error simpan terlihat dan isian tetap; permission/Doze/keep-awake diuji di perangkat.

## R1 — redesign sistem UI yang sudah ada

### R1.1 Token dan primitive [A13, A14, A15]

Terapkan DESIGN_V2 pada colors/tokens, AppText/Button/Card/Screen/BottomSheet/progress/banner/empty. Satukan literal warna dan tema startup/navigation. Pastikan layout fleksibel dan komponen punya label aksesibel. Jangan mengubah query bisnis sambil menilai perubahan visual ini tanpa uji terpisah.

Selesai bila pasangan warna aktual lolos kontras, tombol/field bisa bertambah tinggi pada font 200%, CTA tetap dapat dijangkau dengan keyboard, dan safe area/gesture Android benar. Simpan screenshot komponen beserta state error/loading/disabled/pressed.

### R1.2 Hari Ini, navigasi dan quick add

Hero tindakan berikutnya, bubble terbatas, prioritas baris tenang, timer yang dapat diminimalkan tanpa kehilangan konteks. Tab tetap empat tujuan dengan label; tambah sebagai aksi. Jangan menampilkan grafik/statistik tanpa data nyata.

Selesai bila pengguna baru bisa memilih/membuat satu prioritas dan mulai sesi; pengguna lama bisa melihat tugas panjang, menyelesaikan/melepasnya dengan jelas; semua kontrol terbaca pada 320 dp dan teks besar.

### R1.3 Target/Proyek/detail/roadmap

Bedakan kartu target, proyek, dan roadmap. Pindahkan kumpulan ikon edit/reorder/hapus ke pola menu yang jelas. Hilangkan nested vertical scroll; tampilkan hubungan yang memang sudah didukung data. Copy menjelaskan “progres rencana”, bukan kompetensi.

Selesai bila daftar→detail→edit/selesai→kembali konsisten, judul panjang tidak memotong aksi, dan keadaan kosong/error tidak tertukar. Fitur kriteria hasil/bukti yang memerlukan data baru menunggu R2.

### R1.4 Agenda, seluruh form, dan Pengaturan

Timeline jam, all-day terpisah, validasi dekat field, footer aksi yang bisa dijangkau. Pindahkan pengelolaan kategori ke kelompok Organisasi di Pengaturan dengan CategoryManagerModal reuse; filter/pilihan kategori tetap pada Target. Tidak ada tab kategori baru.

Selesai bila kategori dapat dibuat/diubah dan larangan hapus yang dipakai dijelaskan; draft form tidak hilang ketika berpindah pengelolaan; seluruh modal diuji dengan keyboard dan back gesture. Preference harus memengaruhi timer, bukan hanya tampilan switch.

## R2 — monitoring tujuan dan review

### R2.1 Tujuan, next action dan proyek terkait

Tambah alasan/kriteria hasil/next action yang diperlukan pada target beserta migrasi dan form. Detail target memperlihatkan proyek tertaut dan kontribusinya. Penyelesaian target merupakan keputusan terhadap hasil, berbeda dari checklist 100%.

Selesai bila contoh AI Engineer dapat dicatat tanpa memaksa semua roadmap menjadi proyek, dan pengguna dapat menemukan tugas berikutnya serta melihat dari mana progres berasal.

### R2.2 Backlog dan penjadwalan tugas

Tugas mandiri tersedia tanpa harus menjadi prioritas hari ini; pilih tugas yang sama untuk daily focus dan time block. Link taskId dipertahankan, tidak membuat salinan judul sebagai tugas kedua.

Selesai bila satu tugas diubah judul/status dan tempat terkait tetap konsisten; pindah jadwal tidak menghapus tugas; deadline tetap terpisah dari jadwal pengerjaan.

### R2.3 Bukti hasil dan review mingguan

Mulai dari catatan/link pada target, satu review per awal minggu lokal, ringkasan tugas selesai dan menit fokus yang bersumber dari data valid. Tampilkan periode dan definisi metrik. Catatan kapasitas bukan diagnosis atau nilai kualitas hidup.

Selesai bila pengguna dapat menunjukkan output nyata dan menetapkan perubahan rencana untuk minggu berikutnya; data kosong tidak diisi angka/insight buatan; ekspor/restore mencakup tabel baru.

## R3 — perluasan setelah validasi

Rutinitas berulang, konteks kuliah/kerja, template roadmap, check-in kapasitas opsional. Urutan belum dikunci karena bergantung pada putaran penggunaan dan wawancara. Kalender eksternal, cloud, AI, finance/health khusus memerlukan PRD dan penilaian privasi tersendiri.

## Gerbang rilis

Setiap paket: lint + tsc, test perilaku yang berubah, dokumen diperbarui, tidak ada error ditelan yang membuat aksi tampak sukses. Perubahan skema: upgrade/rollback/restore fixture wajib. UI: screenshot native 320/360/412 dp, font 200%, TalkBack, keyboard, back gesture. Timer/reminder: background/Doze/restart/izin ditolak. Rilis APK hanya setelah development/preview build diuji; tidak menyatakan production ready dari tsc saja.

## Keputusan pengelolaan proyek

- Satu irisan pekerjaan aktif yang dapat diverifikasi dari ujung ke ujung; pecah menjadi perubahan kecil sesuai dependensi di atas.
- Prioritas baru harus menyebut masalah pengguna, alur terdampak, risiko data, dan kriteria selesai.
- Bug kritis mengalahkan penambahan modul. Refactor hanya sejauh diperlukan oleh perbaikan yang sedang dikerjakan.
- Tidak mengukur kemajuan proyek dari jumlah layar/komponen. Ukur alur yang benar-benar bisa dipakai dan hasil validasinya.
- Tidak meminta pemilik merancang arsitektur dari nol; gunakan keputusan dokumen ini sebagai default dan catat alasan bila bukti berikutnya mengubahnya.

## Yang sudah diselesaikan pada tahap audit ini

Peta alur/folder/database dan 18 temuan berprioritas; riset sumber dan batas generalisasinya; PRD/aturan bisnis; arsitektur/migrasi yang dituju; spesifikasi visual/aksesibilitas; backlog berurutan; harness sembilan reproduksi pada repository produksi di SQLite sementara. Lint dan tsc keadaan awal lulus. Kode aplikasi, tema runtime, dan data pengguna belum diubah.
