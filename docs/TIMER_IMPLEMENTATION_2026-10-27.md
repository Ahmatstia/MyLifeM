# Timer persisten dan refleksi opsional — R0.5

Implementasi 27 Oktober 2026, untuk A07/A08. Perubahan menyentuh aturan durasi, penyimpanan timer/sesi, hook, widget, refleksi, validasi backup, dan pengujian terkait. Database pengguna tidak dibuka oleh skrip pengujian. Tidak ada dependency atau perubahan skema baru.

## Perilaku yang tersedia

- Maksimal satu sesi tersimpan. Mulai, jeda, lanjutkan, dan selesai membaca keadaan persisten di dalam transaksi, bukan hanya state komponen.
- Durasi aktif mengecualikan jeda. Countdown yang dipulihkan setelah lewat batas berhenti pada deadline aslinya; tidak mencatat seluruh waktu sampai aplikasi dibuka kembali. Stopwatch berjalan menurut waktu perangkat sampai diakhiri.
- Sesi yang dijeda tetap dijeda setelah restart. Sesi berjalan dipulihkan dari timestamp awal segmen berjalan dan akumulasi segmen sebelumnya. Tidak perlu menulis database setiap detik.
- **Akhiri & catat** tersedia untuk countdown maupun stopwatch, termasuk ketika dijeda. Akhir lebih awal mencatat durasi yang benar-benar aktif.
- Mode dan tugas terkunci selama sesi aktif, termasuk ketika dijeda. Reset tidak menghapus sesi; pengguna diminta mengakhiri dan mencatat terlebih dahulu. Reset saat idle mempertahankan mode yang dipilih.
- Sesi disimpan sebelum refleksi ditampilkan. Menutup dialog atau melewati refleksi mempertahankan aktivitas dan menit tugas. Refleksi hanya memperbarui sesi yang sama.
- Refleksi yang belum ditutup dipulihkan setelah remount/restart. Gagal simpan mempertahankan isian dalam dialog; input/penutupan dan pengiriman ganda diblokir selama penyimpanan. Draft refleksi yang belum disimpan tidak dipersistenkan melewati penghentian proses.

Widget memakai durasi Pomodoro/Deep Flow dari Pengaturan. Durasi sesi yang sedang berjalan dibekukan; perubahan preferensi berlaku pada sesi berikutnya. Preferensi getaran mengendalikan feedback tindakan; preferensi layar aktif mengendalikan keep-awake saat aplikasi di foreground. Lock dilepas saat jeda, selesai, background, atau komponen dilepas; aktivasi native yang terlambat juga dibersihkan.

## Penyimpanan dan idempotensi

Satu row bernama `focus_timer_v1` dalam tabel key/value `user_settings` menyimpan JSON berversi: ID sesi, mode, snapshot ID/judul tugas, waktu mulai, akumulasi milidetik aktif, awal segmen berjalan, target durasi, status RUNNING/PAUSED/COMPLETED, dan waktu selesai. Tabel yang sudah ada cukup untuk satu checkpoint ini; tidak menambah model timer atau tabel kedua.

Finalisasi melakukan tiga pekerjaan dalam transaksi yang sama: memasukkan `focus_sessions` dengan ID timer, menambah menit tugas, dan mengubah checkpoint menjadi COMPLETED. Percobaan ulang pada checkpoint COMPLETED mengembalikan catatan yang sama tanpa INSERT atau penambahan menit kedua. Jika salah satu penulisan gagal, seluruh perubahan rollback dan timer tetap tersedia untuk retry.

Helper penyimpanan sesi digunakan bersama oleh jalur pencatatan sesi lama dan timer. Snapshot judul berasal dari awal sesi, sehingga rename/hapus tugas tidak menghilangkan konteks. Bila tugas telah dihapus, sesi disimpan dengan FK null dan judul snapshot tetap ada. Tugas selesai/dibatalkan tidak dapat dipilih untuk memulai sesi baru; aktivitas yang sudah dimulai tetap dapat diakhiri.

Simpan refleksi memperbarui row sesi dan menghapus checkpoint dalam transaksi; melewati refleksi hanya menghapus checkpoint COMPLETED. Tidak ada penghapusan catatan aktivitas pada kedua jalur tersebut. ID yang berubah atau status yang belum selesai menghentikan operasi yang tidak sesuai.

Checkpoint JSON divalidasi saat dibaca/ditulis. Data rusak tidak diganti atau dihapus otomatis; timer menampilkan error dan menyediakan retry. Perbaikan data rusak di luar retry memerlukan pemulihan dari cadangan yang valid atau pemeriksaan manual terhadap catatan asli.

## Backup dan kompatibilitas

Checkpoint ikut snapshot 11 tabel yang sudah ada, sehingga timer aktif maupun refleksi tertunda dapat dipulihkan. Import memvalidasi struktur JSON, versi/status/mode/durasi/timestamp, serta kecocokan checkpoint COMPLETED dengan sesi yang sudah tercatat. Checkpoint berjalan tidak boleh mempunyai sesi selesai dengan ID yang sama. Snapshot staging dan transaksi restore R0.1 tetap digunakan; remount R0.1 melepaskan interval/efek dari tampilan lama.

Database tetap versi 1; backup tetap `formatVersion: 1`, `schemaVersion: 2`. Cadangan lengkap lama tanpa checkpoint tetap valid. Aplikasi lama yang belum mengenal key ini tidak memperoleh kemampuan memulihkan timer hanya dengan membaca cadangannya.

## Batas pengukuran dan background

`duration_minutes` masih bilangan bulat. Durasi aktif dibulatkan ke bawah per sesi; sesi di bawah satu menit disimpan sebagai aktivitas 0 menit dan ditampilkan **Kurang dari 1 menit fokus**. Tidak ada minimum satu menit buatan. Presisi detik setelah checkpoint ditutup memerlukan perluasan skema tersendiri sebelum metrik yang membutuhkan presisi tersebut.

Timer memakai wall clock perangkat agar dapat pulih setelah proses mati. Perubahan jam mundur dijepit agar tidak menghasilkan durasi negatif atau rentang terbalik; perubahan jam manual dapat memengaruhi pengukuran, terutama stopwatch. Ini bukan alat pengukuran waktu presisi.

Tidak ada background worker atau alarm/notifikasi akhir timer baru pada tahap ini. Saat OS menangguhkan JavaScript, finalisasi countdown dilakukan ketika aplikasi aktif/dibuka kembali dan durasinya tetap dibatasi deadline. Jangan menjanjikan getaran, suara, atau pencatatan tepat detik ketika aplikasi ditutup. Pengingat agenda R0.3 tetap terpisah.

## Verifikasi

- `test:timer`: 13 kelompok pemeriksaan memakai repository produksi, SQLite sementara, jam terkontrol, dan mock efek native. Mencakup mulai ganda, jeda/lanjut, selesai dini, restart, deadline terlewati, idempotensi, skip/retry refleksi, rollback tiga penulisan, tugas dihapus, status/ID/durasi invalid, jam mundur, backup aktif/selesai, JSON rusak, preferensi, cleanup, native failure, serta retry eksplisit setelah auto-save gagal.
- Auto-save yang gagal tidak diulang setiap 500 ms. Timer dipertahankan dan tombol retry menyelesaikan penyimpanan satu kali setelah masalah teratasi.
- Regresi: 45 backup, 29 integritas/migrasi, 32 kalender/agenda, dan 15 status/progres/refresh.
- UI: 42 render layar dasar, enam keadaan timer berjalan/jeda dan sesi mandiri yang diciutkan pada teks 100/200%, 10 skenario pembatalan/rencana kosong, dua peringatan agenda, dan 12 form. Uji refleksi mencakup isian bertahan ketika gagal, double tap, dan penutupan saat busy.
- Pemeriksaan browser fixture lebar 320 dan teks 200% menemukan/memperbaiki kartu timer yang melebar. Ukuran angka mengikuti lebar dan skala teks; setelah perbaikan frame dan scrollWidth sama-sama 320, kontrol dan label dapat dibaca. Fixture memakai data simulasi, bukan runtime SQLite native.

Pemeriksaan akhir lulus: lint `src scripts` tanpa error/peringatan, typecheck `tsc --noEmit`, ekspor web penuh ke `.expo/ui-export`, dan `git diff --check`. Perintah dijalankan langsung melalui Node; ekspor Metro memakai izin resmi di luar sandbox seperti tahap sebelumnya.

Gerbang perangkat masih terbuka: Android/iOS, penghentian proses sebenarnya, background/Doze, perubahan jam/zona, wake-lock/getaran pada perangkat, keyboard/back gesture, dan TalkBack/VoiceOver. Tidak ada APK atau pengiriman notifikasi OS yang diuji melalui mock.

Langkah berikutnya: QA perangkat untuk fondasi R0/R1, lalu R2.1 kriteria hasil tujuan dan tindakan berikutnya. R0 selesai pada cakupan implementasi otomatis; kelulusan gerbang rilis native tetap terpisah.

## Acuan API

- [Expo SQLite SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/)
- [Expo KeepAwake SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/keep-awake/)
- [Expo Haptics SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/haptics/)
- [React Native AppState](https://reactnative.dev/docs/appstate)
