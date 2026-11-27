# MyLife — alur tugas dan perencanaan pribadi

Tanggal: 27 November 2026. Pengguna awal: pemilik aplikasi, dengan kegiatan campuran kuliah dan kerja. Tiga masalah utama: lupa, bingung memilih pekerjaan, dan sulit mulai atau kembali setelah tertunda.

## Keputusan produk dan implementasi

Navigasi: Hari Ini, Tugas, Tambah, Kalender, Menu. Target dan Tinjauan ada di Menu. Lonceng hanya di Hari Ini. Catat Tugas menjadi satu pintu tambah pekerjaan; jalur lama `/today/new`, `/task-manager/new`, dan `/task-manager` tetap tersedia sebagai adapter menuju alur baru. Hari Ini dapat memilih tugas yang sama tanpa membuat salinan pekerjaan.

Satu baris `tasks` menyimpan judul, status, pemilik, tenggat tanggal, dan menit aktual. `task_profiles` menyimpan konteks, tindakan berikutnya, status penataan, pengetahuan estimasi, tenggat jam opsional, dan pengaturan alarm. `task_steps` menyimpan checklist tanpa status induk otomatis. `daily_focus_items` menyimpan pilihan per tanggal, bukan status pekerjaan mandiri. Blok pengerjaan menggunakan `agenda_events.task_id`; beberapa blok dapat mengarah ke satu tugas. Agenda mandiri dan rutinitas tetap memiliki makna komitmen waktu.

Pencatatan memerlukan judul saja. Estimasi yang tidak diketahui disimpan sebagai 0 pada kolom kompatibilitas lama dan `estimate_known=0` pada profil, lalu ditampilkan sebagai belum diketahui. Metadata tidak memuat salinan judul/status. Tugas Target lama dibaca dari tabel tugas yang sama. Service `src/features/tasks/data/task.service.ts` mengoordinasikan alur baru; adapter repository lama tetap mendukung timer, Target, alarm, dan cadangan.

Tidak ada lagi batas keras lima tugas dan tidak ada penambahan tugas otomatis ketika hari berubah. Hari Ini menyarankan sampai tiga kandidat, termasuk pekerjaan yang pernah dipilih sebelumnya. Pengguna memilih ulang rencananya. Waktu fokus tersedia diisi pengguna di luar kuliah, pekerjaan, janji, dan istirahat. Angka awal 120 menit adalah nilai isian awal yang dapat diubah, bukan hasil pengukuran kapasitas pengguna. Estimasi yang kosong dihitung sebagai belum diketahui, bukan ruang kosong yang pasti tersedia.

Sesi fokus tidak menyelesaikan tugas. Pilihan menyiapkan sesi 5 menit tersedia. Checklist langkah juga tidak menutup tugas induk. Persentase Target adalah progres rencana; pengguna mengonfirmasi pencapaian hasil Target secara terpisah berdasarkan deskripsinya.

## Kalender, pengingat, dan perubahan rencana

Tenggat tetap terpisah dari blok pengerjaan. Tenggat tanpa jam berlaku sampai akhir tanggal lokal tersebut. Satu tugas dapat memiliki beberapa blok, dapat diubah atau dihapus tanpa menghapus tugas. Kalender membuka rincian tugas melalui tautan pada blok yang terkait. Penyelesaian dan pembukaan kembali tugas memperbarui status blok terkait.

Blok dapat menggunakan pengingat standar atau tanpa pengingat. Satu blok utama per tugas dapat memakai mesin alarm keras yang sudah ada, hanya atas pilihan pengguna. Alarm asli dan lagu kustom lama dipertahankan. Mengubah blok utama memindahkan alarmnya; menghapus bloknya menonaktifkan alarm tersebut. Simpan untuk Nanti atau Menunggu melepas pilihan harian mendatang dan blok masa depan, mempertahankan tugas/tenggat/riwayat, lalu memperbarui penjadwalan pengingat. Alarm terlewat tidak dikejar berhari-hari: mesin alarm aktif membatasi jendela pengejaran sampai lima menit.

Penjadwalan OS mengikuti commit data. Kegagalan izin/penjadwalan tidak mengubah hasil simpan menjadi kegagalan. Status masalah ditampilkan di pusat notifikasi. Tombol pemeriksaan izin tetap eksplisit. Ketukan notifikasi kalender yang terkait tugas membuka rincian tugas; notifikasi acara/rutinitas membuka Kalender.

## Tinjauan dan pengujian manfaat

Tinjauan menyimpan hasil, hambatan, dan langkah berikutnya untuk tanggal lokal yang dipilih. Ringkasan tujuh hari mengambil tugas selesai dan sesi menurut tanggal lokal. Keputusan pemilihan, pelepasan, penjadwalan, selesai, dibuka kembali, nanti, menunggu, dan batal dicatat dengan judul historis. Pengguna dapat melanjutkan tugas ke besok secara eksplisit. Tidak ada penalti streak.

Untuk validasi pribadi, catat tiga hari contoh keseharian sebelum menilai perubahan. Kemudian gunakan alur baru selama 14 hari. Pada Tinjauan, tulis tugas yang lupa, kesulitan memilih, alasan rencana berubah, dan langkah berikutnya. Ukur waktu mencatat dan merencanakan dengan pengamatan langsung. Bandingkan dengan catatan awal; satu pengguna belum cukup untuk menyimpulkan manfaat pada populasi umum. Aplikasi tidak mengirim telemetri perilaku ke server.

## Migrasi dan cadangan

Database versi 2 menambah lima tabel: profil, langkah, rencana harian, tinjauan, dan keputusan tugas. Upgrade dari versi 1 menyimpan snapshot pengaman sebelum transaksi. Metadata `managed_tasks_v1` divalidasi dan dipindahkan ke tabel relasional; ID tugas dan status inti dipertahankan. JSON asli diarsipkan pada `legacy_managed_tasks_v1`, bukan sumber aktif. Benturan ID langkah lintas tugas diberi ID bernama ruang untuk mempertahankan seluruh langkah. Blok waktu lama ditambahkan dengan ID deterministik. Kegagalan membatalkan transaksi dan dapat dicoba ulang.

Cadangan skema 3 mencakup 18 tabel; format skema 1/2 tetap dapat dibaca. Pemulihan menjalankan konversi metadata lama yang sama. Nama/tipe, enum, tanggal/jam, referensi, dan batas ukuran tetap divalidasi sebelum pemulihan. Aplikasi lama tidak dijanjikan dapat membaca cadangan baru. Tidak perlu menginstal dependensi native tambahan.

## Dasar riset yang digunakan

- [Aeon, Faber, Panaccio (2021)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0245066): manajemen waktu berkaitan dengan kinerja dan kesejahteraan; aplikasi juga perlu dinilai dari rasa terkendali.
- [Sirois dan Pychyl (2013)](https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12011): regulasi emosi relevan terhadap prokrastinasi; bukan diagnosis bahwa semua penundaan memiliki satu penyebab.
- [Harkin dkk. (2016)](https://pubmed.ncbi.nlm.nih.gov/26479070/): pemantauan progres mendukung pencapaian tujuan secara rata-rata.
- [Stothart dkk. (2015)](https://carystothart.com/publications/attentional-cost-cell-phone-notification/): notifikasi dapat mengganggu perhatian dalam eksperimen; lebih banyak alarm bukan ukuran manfaat.
- [Lally dkk. (2010)](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674): pembentukan kebiasaan bervariasi; satu kesempatan terlewat tidak berarti seluruh progres hilang dalam penelitian tersebut.
- [Cowan (2001)](https://pubmed.ncbi.nlm.nih.gov/11515286/) dan [Scheibehenne dkk. (2010)](https://scheibehenne.de/ScheibehenneGreifenederTodd2010.pdf): bukan bukti bahwa semua orang perlu dibatasi tepat tiga sampai lima tugas.
- [Todoist: tanggal dan tenggat](https://www.todoist.com/help/todoist/features/introduction-to-deadlines-in-todoist-uMqbSLM6U) dan [Sunsama: perencanaan harian](https://help.sunsama.com/docs/getting-started/basics/daily-planning-the-basics/): pola pembanding produk, bukan bukti efektivitas MyLife.

Klaim pada naskah riset awal mengenai sepertiga akhir pekerjaan, ancaman fisik, persentase pengguna meninggalkan aplikasi, dan AI sebagai pembeda wajib belum memiliki dukungan yang cukup untuk menjadi spesifikasi. Voice input, gamifikasi, AI, backend, dan sinkronisasi cloud ditunda sampai alur inti terbukti berguna.

## Verifikasi

`npm run test:task-planning` menguji pencatatan, validasi, pilihan harian, blok jamak, pemisahan tenggat, checklist, status bersama, kapasitas, tinjauan, cadangan, upgrade versi 1, rollback/retry, benturan ID langkah, dan idempotensi pada SQLite sementara. Regresi lama diperbarui untuk kontrak baru tanpa batas keras atau auto-rollover. Pengujian browser menggunakan data terisolasi, bukan database pengguna. Pengiriman alarm, tata letak native, keyboard HP, dan manfaat selama 14 hari memerlukan verifikasi pengguna.

[Pratinjau Tugas](design/screenshots/task-planning/kotak-masuk.png) · [Rincian](design/screenshots/task-planning/rincian-tugas.png) · [Kalender terhubung](design/screenshots/task-planning/kalender-terhubung.png) · [Tinjauan](design/screenshots/task-planning/tinjauan.png)


### Hasil verifikasi implementasi

Lint dan pemeriksaan tipe lulus. Delapan belas kelompok regresi data, migrasi, cadangan, status, kalender, pengingat, alarm, timer, bootstrap web, serta UI lulus; pengujian status/progres juga diperluas untuk pembaruan di latar tanpa menutup panel perencanaan. Pemeriksaan tata letak mencakup 192 kombinasi lebar 320/360/412/768 dan teks 100/200%. Browser aplikasi menguji pencatatan nama saja, edit, langkah checklist, blok jamak, navigasi Kalender–Tugas, selesai/buka kembali, peringatan kapasitas, tinjauan tersimpan, dan pilihan besok. Ekspor web serta Android berhasil. Daftar Target berada pada route stack `/targets`, bukan tab tersembunyi, agar Menu dan pemuatan ulang menuju halaman yang sama.

Uji tiga hari awal dan pemakaian pribadi selama 14 hari adalah tahap validasi manusia, bukan hasil yang sudah diklaim oleh pengujian kode. Pengiriman notifikasi/lagu di latar pada HP fisik belum diverifikasi ulang.
