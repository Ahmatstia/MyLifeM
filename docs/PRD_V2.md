# MyLife PRD v2 — tujuan menjadi tindakan yang terlihat

Tanggal: 26 Oktober 2026. Status: keputusan arah produk, belum implementasi. Pemilik: pengguna; pelaksana analisis/rekayasa mengikuti dokumen dan backlog ini. Asumsi persona dijelaskan dalam RESEARCH_2026-10-26.md.

## 1. Janji produk

MyLife membantu seseorang merencanakan, menjalankan, dan mengevaluasi kehidupan sehari-hari dengan menghubungkan tujuan jangka panjang ke tindakan yang dapat dikerjakan hari ini. Aplikasi harus berguna secara offline dan tidak memerlukan pencatatan yang lebih berat daripada pekerjaan yang hendak dibantu.

Setiap kali dibuka, pengguna seharusnya bisa menjawab:

1. Apa yang paling penting saya kerjakan sekarang?
2. Tindakan ini mendukung tujuan apa?
3. Hasil apa yang sudah saya capai, dan bukti apa yang mendukungnya?
4. Apa yang perlu saya ubah pada rencana berikutnya?

Visi jangka panjang mencakup berbagai area kehidupan. Rilis awal difokuskan pada perencanaan tujuan, pembelajaran/pekerjaan, jadwal, dan evaluasi. Kesehatan, keuangan, dan hubungan dapat dicatat sebagai konteks tujuan/agenda; belum menjadi mesin pemantau khusus.

## 2. Pengguna dan masalah utama

Prioritas: mahasiswa/pembelajar mandiri serta pekerja yang mengembangkan keterampilan. Keduanya mempunyai tujuan jangka panjang, kewajiban terikat waktu, dan kapasitas harian terbatas. Model harus menerima beberapa konteks sekaligus; tidak mengunci pengguna sebagai “mahasiswa saja” atau “pekerja saja”.

Masalah pertama yang diselesaikan: roadmap sudah ada tetapi tidak berubah menjadi pekerjaan harian dan bukti progres yang mudah dipahami. Masalah kedua: agenda dan komitmen harian terpisah dari tujuan sehingga aktivitas banyak tetapi arahnya tidak terlihat.

## 3. Model mental

- **Area kehidupan:** konteks jangka panjang seperti Belajar & Karier, Kesehatan, Keuangan, Pribadi. Pada rilis fondasi gunakan kategori yang dapat dikelola; jangan menambah pilihan wajib pilar kedua.
- **Target:** hasil yang ingin dicapai, alasan, kriteria berhasil, tenggat opsional.
- **Proyek:** hasil kerja konkret dengan akhir yang jelas, opsional mendukung satu target. Target sederhana tidak wajib punya proyek.
- **Tahapan:** urutan langkah roadmap pada satu target atau satu proyek.
- **Tugas:** tindakan yang dapat dikerjakan, dengan estimasi menit, status, dan tenggat opsional.
- **Prioritas harian:** pemilihan tugas yang sama untuk hari tertentu, bukan salinan tugas.
- **Agenda:** alokasi waktu atau kegiatan nyata; bisa mengacu pada tugas yang sama. Deadline berbeda dengan waktu pengerjaan.
- **Sesi fokus:** catatan waktu pelaksanaan, tidak otomatis membuktikan tugas selesai atau kemampuan tercapai.
- **Bukti hasil:** catatan pencapaian atau tautan hasil kerja yang membantu mengevaluasi target.
- **Review mingguan:** penilaian singkat tentang hasil, hambatan, dan rencana berikutnya.

## 4. Alur contoh: menjadi AI Engineer

Ini contoh penggunaan, bukan kurikulum keahlian yang telah divalidasi.

Target: “Siap melamar posisi AI Engineer”. Alasan: berpindah karier. Kriteria hasil: mampu menjelaskan dan membangun solusi yang dipilih, menyelesaikan portofolio dengan dokumentasi evaluasi, dan meninjau kesiapan melalui latihan wawancara.

Roadmap awal: fondasi Python → pengolahan data → dasar machine learning → evaluasi model → proyek terapan → portofolio/persiapan melamar. Setiap tahap dipecah menjadi tindakan kecil. Proyek contoh: “Bangun satu demo klasifikasi teks dan tulis evaluasinya”.

Hari Ini: pilih tugas “Buat baseline dan catat metrik pada dataset latihan”, estimasi 45 menit; jadwalkan pukul 19:30–20:15; jalankan timer jika membantu; simpan catatan hasil/link; centang tugas hanya setelah output selesai. Agenda dan Hari Ini menunjuk taskId yang sama.

Review Minggu: apa yang selesai, bagian mana belum dipahami, bukti apa tersedia, dan langkah kecil minggu depan. Jika checklist 50%, labelnya “50% tugas rencana selesai”, bukan “50% menjadi AI Engineer”. Mengubah roadmap dapat menurunkan persentase; UI perlu menjelaskan bahwa cakupan rencana bertambah.

## 5. Cakupan rilis bertahap

### R0 — data yang dapat dipercaya

Foreign key/migrasi, cadangan lengkap dan restore teruji, transaksi, hari lokal, rollup target/proyek, status tugas tunggal, refresh antarlayar, startup error state, timer/refleksi tidak membuang data, pengingat jujur. Belum menambah modul domain besar.

### R1 — redesign seluruh alur yang sudah ada

Semua layar utama, detail, form, pengaturan, kartu, dialog/error/loading/empty mengikuti DESIGN_V2. Pengelolaan kategori masuk Pengaturan. Struktur navigasi tetap empat tujuan; aksi tambah membuka pilihan kontekstual. Pemilik bisa membaca dan menekan seluruh kontrol pada perangkat kecil dan teks besar.

### R2 — monitoring tujuan yang berguna

Kriteria berhasil dan next action pada target, proyek terkait terlihat di detail target, daftar tugas fleksibel/backlog, penjadwalan tugas tanpa duplikasi, catatan bukti sederhana, review mingguan dan ringkasan yang berasal dari data nyata. Dahulukan teks/link; lampiran besar menunggu strategi penyimpanan/backup.

### R3 — konteks kehidupan yang tervalidasi

Rutinitas berulang; konteks kuliah/kerja/pribadi; check-in kapasitas/energi opsional; template roadmap manual. Masuk hanya setelah alur R0–R2 terbukti dipakai dan kebutuhan diuji. Tidak menjanjikan semua fitur ini langsung dibangun.

## 6. Aturan bisnis wajib

1. Satu tugas memiliki satu pemilik yang konsisten: mandiri, langsung pada target, atau pada proyek; tahapan harus sesuai pemilik. Proyek menghubungkan tugasnya ke target lewat relasi proyek, tidak lewat salinan yang mudah kedaluwarsa.
2. Status persist tugas adalah TODO, IN_PROGRESS, COMPLETED, CANCELLED. UI boleh menerjemahkan label; DONE hanya dibaca sebagai legacy saat migrasi.
3. Progres rencana = tugas COMPLETED / seluruh tugas yang tidak CANCELLED × 100, dibulatkan; tiap taskId dihitung sekali. Tanpa tugas, tampilkan “Belum ada rencana”, bukan kesimpulan gagal.
4. Tugas di proyek tertaut ikut progres target. Filter kategori mengubah cakupan ringkasan dan diberi label; jangan menyebut agregasi seluruh tugas sebagai rata-rata target.
5. Checklist selesai tidak otomatis menyatakan tujuan hidup tercapai. Target/proyek dapat ditutup setelah kriteria hasil ditinjau; status lifecycle dan persen rencana mempunyai arti berbeda.
6. Target numerik dan maintenance legacy tidak diubah diam-diam menjadi checklist. Rilis fondasi mempertahankan data; UI tipe baru menunggu aturan yang lengkap. Angka progres numerik kelak perlu baseline, target, arah naik/turun, unit, dan riwayat pengukuran.
7. Tugas dapat masuk prioritas suatu hari satu kali. Default menonjolkan tiga, maksimal lima komitmen terpilih; backlog tidak dibatasi lima. Batas ini keputusan produk awal, bukan hukum psikologi.
8. Menyelesaikan tugas dari mana pun memperbarui tampilan terkini di semua tempat. Mengubah jadwal atau melepas prioritas tidak menghapus tugas.
9. Deadline, tanggal rencana, dan blok waktu terpisah. Tanggal tanpa jam memakai tanggal lokal; event berwaktu memakai instant UTC; event sepanjang hari memakai tanggal awal/akhir eksklusif.
10. Event yang overlap hari terpilih tetap terlihat meskipun mulai kemarin. Jadwal overlap diperbolehkan dengan informasi bentrok; pengguna memegang kendali.
11. Reminder nonaktif = null; 0 = saat mulai; nilai positif = menit sebelumnya. Penolakan izin ditampilkan; agenda tetap tersimpan.
12. Maksimal satu sesi timer aktif; pergantian tugas/mode memerlukan keputusan jelas terhadap sesi lama. Durasi aktif mengecualikan jeda. Finalisasi idempoten; refleksi opsional dan tidak menentukan apakah sesi tersimpan.
13. Kategori nama kosong/duplikat ditolak; kategori yang dipakai tidak bisa dihapus sebelum target dipindah. Kategori belum menjadi manajemen screen/tab tersendiri.
14. Arsip menjadi aksi umum untuk target/proyek selesai. Penghapusan permanen menjelaskan akibat dan menjaga histori sesi/agenda sesuai kebijakan relasi; tidak menghapus proyek independen tanpa penjelasan.
15. Semua aksi simpan menampilkan hasil, tidak menutup dialog ketika gagal, dan aman dicoba ulang. Preferensi mengubah perilaku yang diiklankan.
16. Tidak ada skor “kualitas hidup”, perbandingan orang, streak menghukum, atau klaim kesehatan dari data produktivitas.

## 7. Struktur navigasi dan isi layar

- **Hari Ini:** tanggal; tindakan berikutnya; prioritas; agenda terdekat; timer yang dapat dibuka; akses review mingguan ketika fiturnya siap. Tampilkan sedikit informasi yang membantu keputusan sekarang.
- **Target:** daftar tujuan, filter kategori, kemajuan rencana, next action; detail menyatukan roadmap langsung, proyek terkait, dan bukti hasil.
- **Proyek:** hasil kerja aktif/selesai; detail tahapan/tugas dan target terkait. Proyek mandiri tetap diperbolehkan.
- **Agenda:** tanggal yang dapat dipilih, timeline kegiatan, bagian sepanjang hari, akses menjadwalkan tugas yang ada.
- **Pengaturan:** Kategori; preferensi fokus; notifikasi; data/cadangan/pemulihan; informasi privasi/versi. Bukan tab utama.
- **Tambah:** tugas, target, proyek, atau agenda sesuai konteks. Membuat tugas cepat tidak wajib membuat target dahulu.

## 8. Ukuran keberhasilan

Target awal untuk validasi, bukan hasil yang sudah dicapai:

- Pemilik dapat memasukkan satu roadmap nyata dan memilih tindakan pertama tanpa bantuan penjelasan pengembang.
- Saat tugas proyek selesai, progres target dan Hari Ini langsung sepakat setelah kembali ke layar.
- Pengguna dapat menjelaskan perbedaan menit fokus, checklist rencana, dan bukti keberhasilan.
- Cadangan dari data uji dipulihkan dengan relasi dan jumlah baris utuh.
- Dalam putaran usability awal, catat penyelesaian alur, kesalahan, kebutuhan bantuan, dan waktu; jangan menetapkan persentase keberhasilan statistik dari sampel kecil.
- Setelah digunakan beberapa minggu, nilai apakah review benar-benar mengubah rencana dan membantu pengguna kembali ke tujuan. Pengukuran awal cukup catatan lokal sukarela; analytics cloud belum diperlukan.

## 9. Di luar cakupan sekarang

AI pembuat roadmap otomatis, sinkronisasi multi-perangkat, social/team workspace, marketplace template, bank integration, penghitungan investasi, diagnosis kesehatan mental, sensor kesehatan, penilaian akademik lengkap, dan pemantauan perilaku pasif. Fitur itu memerlukan riset, privasi, dan model data tambahan yang belum dibenarkan kebutuhan awal.

## 10. Definition of done

Setiap irisan fitur selesai dari input→validasi→transaksi→query→UI→error/retry→uji regresi. Lint/typecheck wajib; uji upgrade data jika skema berubah; uji visual native untuk layout/keyboard/teks besar; uji aksesibilitas kontrol yang berubah. Dokumen hanya menandai selesai setelah bukti tersedia.
