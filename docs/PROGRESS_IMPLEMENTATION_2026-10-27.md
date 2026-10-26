# Status tugas, progres, dan refresh — R0.4

Implementasi 27 Oktober 2026 untuk A05, A06, dan A11. Cakupan: repository Target/Proyek/Tahapan/Hari Ini, pemilihan tugas, ringkasan dan form terkait, serta lifecycle pemuatan data. Tidak ada dependency, tabel, atau migrasi baru. Pengujian menggunakan SQLite sementara; database pengguna tidak dibuka oleh skrip.

## Satu acuan status

`tasks.status` menjadi acuan perilaku: `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Alias legacy `DONE` dibaca sebagai `COMPLETED`; penulisan status baru menolak alias dan status asing. UI Tahapan kini memakai enum yang sama dengan Hari Ini, termasuk pilihan **Dibatalkan**.

Checkbox Hari Ini dibaca dari status tugas melalui satu join, bukan flag pada prioritas. Entitas tugas, pilihan tugas, perhitungan Tahapan, dan ringkasan Target/Proyek memakai aturan yang sama. Status menang jika flag legacy bertentangan; misalnya `IN_PROGRESS` dengan `is_completed = 1` tetap belum selesai. Ini keputusan eksplisit berdasarkan PRD, bukan penebakan histori pengguna. Pembacaan dan backup tidak menulis ulang data legacy.

Penulisan dari Tahapan, toggle tugas Proyek, dan Hari Ini melewati helper yang sama di dalam transaksi pemanggil. Status, `tasks.is_completed`, `completed_at`, dan seluruh flag prioritas untuk taskId tersebut berubah bersama. Metadata tugas yang diubah bersamaan ikut rollback jika pembaruan flag gagal. Penulisan ke tugas yang tidak ditemukan menghasilkan error. Menyimpan ulang tugas selesai mempertahankan waktu selesai yang sudah ada; membuka kembali menghapus waktu selesai dan mengembalikan `TODO`.

Tugas dibatalkan tetap terlihat pada Tahapan dan prioritas yang sudah ada, dengan label **Dibatalkan** dan aksi **Buka kembali**. Tugas itu tidak menawarkan aksi memulai fokus dan tidak tersedia pada pemilih tugas aktif. Penambahan prioritas baru memerlukan tugas aktif yang belum selesai. Prioritas dibatalkan tetap memakai slot dari batas lima sampai dilepas pengguna; histori tidak dihapus otomatis. Buka kembali dari checkbox mengembalikan `TODO`.

Kolom kompatibilitas tetap disimpan agar backup lama dapat dipulihkan; R0.4 tidak menghapus atau menormalisasi massal nilai aslinya. Database tetap versi 1, backup `formatVersion: 1` / `schemaVersion: 2`. Kebenaran status lintas layar tidak bergantung pada konsistensi flag lama.

## Definisi progres

Progres rencana = jumlah tugas selesai / jumlah tugas yang tidak dibatalkan × 100, dibulatkan. Setiap ID dihitung sekali melalui deduplikasi sebelum agregasi. Estimasi juga mengecualikan tugas dibatalkan dan mempertahankan pecahan jam; estimasi menit tidak dibulatkan menjadi minimal satu jam pada agregasi.

- Target mencakup tugas langsung dan seluruh tugas proyek yang tertaut melalui `projects.target_id`. Tugas proyek tidak memerlukan salinan `tasks.target_id`.
- Proyek mencakup tugas langsung dan tugas tahapannya. Penautan tahapan dan proyek tidak menambah hitungan tugas yang sama.
- Ringkasan daftar Target mengikuti filter kategori; daftar Proyek mengikuti filter status. Ini bukan ringkasan global ketika filter aktif.
- Tahapan yang seluruh tugasnya dibatalkan ditampilkan sebagai **Belum ada tugas aktif**. Rencana tanpa tugas aktif ditampilkan sebagai **Belum ada rencana**.
- Persentase mengukur checklist rencana, bukan penguasaan keterampilan atau terpenuhinya hasil tujuan hidup. Checklist 100% tidak mengubah lifecycle Target/Proyek otomatis.

Helper agregasi dipakai oleh repository fitur dan ringkasan adapter proyek lama. Adapter lama tidak mempunyai pemanggil aplikasi aktif yang ditemukan pada pemeriksaan ini; tidak dihapus agar perubahan tidak memperluas cakupan.

## Kembali ke halaman dan hasil request lama

Daftar/detail Target, daftar/detail Proyek, dan Hari Ini memakai `useFocusedResource`. Pembacaan dimulai saat route mendapat fokus, termasuk kembali dari halaman lain; detail sebelumnya hanya membaca saat mount. Filter/ID/tanggal kalender menjadi identitas view. Cleanup saat kehilangan fokus atau identitas berubah membatalkan penerapan hasil lama melalui nomor request, tanpa menganggap operasi database yang sudah commit dibatalkan.

Respons sukses/error/loading dari request lama tidak dapat mengganti view terbaru. Callback refresh milik mutasi pada filter/ID/tanggal sebelumnya diabaikan. Error mutasi juga menginvalidasi pembacaan yang lebih lama, sehingga hasil baca sukses yang terlambat tidak menghilangkan pesan kegagalan simpan. Retry dan fokus berikutnya membaca keadaan terbaru.

Kegagalan toggle/hapus ditampilkan. Loader menangkap error pembacaan sendiri: simpan yang sudah commit tetap dilaporkan berhasil meski pembacaan setelahnya gagal, sehingga pengguna tidak diminta mengulangi penyimpanan yang sama. Halaman menampilkan error pembacaan dan dapat dicoba lagi. Restore tetap memakai mekanisme remount/revision R0.1 yang sudah ada.

Ini konsistensi saat refresh/kembali ke route, bukan sinkronisasi realtime lintas proses/perangkat. Controller dan objek tugas yang sedang dipakai sesi timer aktif tidak dirombak; persistensi/finalisasi timer tetap R0.5.

## Verifikasi

- `node scripts/check-progress.cjs`: 15 kelompok pemeriksaan menggunakan repository produksi/SQLite memori dan lifecycle hook terkontrol. Mencakup tugas tahap proyek → Target/Proyek/Tahapan/dua tanggal prioritas/pemilih tugas, semua writer, buka kembali, pembatalan, DONE/flag bertentangan, deduplikasi, estimasi, filter, tugas langsung, penghapusan, waktu selesai, rollback metadata/flag, dan status/ID invalid.
- Pengujian hook mencakup kelima pemanggil: perubahan filter/ID/tanggal, kembali fokus, sukses/error terlambat, callback view lama, blur, retry, kegagalan mutasi yang terlihat, serta commit berhasil walaupun pembacaan berikutnya gagal.
- Regresi kalender: 32 kelompok; backup: 45; integritas/migrasi: 29. Harness audit menandai A06 sudah diperbaiki; bukti audit awal tidak diubah.
- UI: 42 render layar dasar, 10 skenario pembatalan/rencana kosong, dua skenario peringatan agenda, dan 12 render form pada variasi ukuran/teks. Pemeriksaan juga memastikan atribut checked tersedia untuk assistive technology web.
- Pratinjau browser fixture diperiksa pada lebar 320 dan teks 200%: daftar Target tanpa rencana, form status tugas, dan Hari Ini dengan tugas dibatalkan. Konten tidak melebar keluar frame pada pemeriksaan tersebut; pilihan status memakai baris yang dapat membungkus. Fixture menggunakan data/hook simulasi dan tidak membuktikan interaksi SQLite/native secara end-to-end.

Lint tanpa error/peringatan, typecheck, `git diff --check`, dan ekspor web penuh ke `.expo/ui-export` lulus. Ekspor dijalankan melalui izin resmi di luar sandbox, mengikuti kebutuhan Metro yang sudah ditemukan pada tahap sebelumnya. Lint mencakup `src` dan `scripts`; perintah dijalankan langsung melalui Node.

Gerbang rilis native tetap terbuka: uji navigasi nyata Target → Proyek → Hari Ini → kembali, TalkBack/VoiceOver, keyboard/back gesture, serta dataset besar. Query daftar masih memuat kumpulan tugas untuk agregasi lokal; performa dataset besar belum diprofilkan. Tidak ada klaim seluruh aplikasi bebas bug dari harness audit.

Tahap berikutnya: **R0.5 timer dan refleksi**, termasuk sesi aktif persisten dan finalisasi idempoten. QA native pengingat dari R0.3 tetap terbuka.

## Acuan

- [PRD v2: aturan status dan progres](./PRD_V2.md)
- [Expo Router SDK 58: useFocusEffect](https://docs.expo.dev/versions/v58.0.0/sdk/router/#usefocuseffecteffect-do_not_pass_a_second_prop)
- [React Native: aksesibilitas](https://reactnative.dev/docs/accessibility)
