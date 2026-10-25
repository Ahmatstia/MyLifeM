# Product Requirements Document (PRD)

> Dokumen MVP historis. Gunakan [PRD_V2.md](./PRD_V2.md) dan [START_HERE.md](./START_HERE.md) untuk keputusan terbaru. Rancangan v2 belum berarti sudah diterapkan pada kode.

## MyLife — Mobile App

**Versi:** 0.1 (Draft MVP)  
**Status:** Draft untuk dasar desain UI/UX dan implementasi  
**Ruang lingkup:** Target, Kategori, dan Project  
**Platform:** Mobile app  
**Dokumen terkait:** Dokumen arsitektur teknis dan UI/UX dibuat terpisah setelah PRD disepakati.

---

## 1. Ringkasan Produk

MyLife adalah aplikasi untuk membantu pengguna mengubah hal yang ingin dicapai menjadi langkah-langkah dan tugas yang lebih jelas. Pada MVP ini, pengguna dapat membuat **Target** untuk tujuan pengembangan diri, mengelompokkan target menggunakan **Kategori**, serta mengelola **Project** untuk pekerjaan atau hasil konkret yang perlu diselesaikan.

Target dan Project sama-sama memiliki tahapan dan tugas. Namun, keduanya memiliki tujuan penggunaan yang berbeda:

- **Target:** tujuan yang ingin dicapai atau kemampuan yang ingin dibangun, misalnya *AI Engineer*, *Belajar Bahasa Inggris*, atau *Rutin Olahraga*.
- **Project:** pekerjaan atau hasil konkret yang perlu diselesaikan, misalnya *Skripsi*, *Membuat Aplikasi POS*, atau *Membangun Portofolio*.
- **Kategori:** label sederhana untuk mengelompokkan Target, misalnya *Belajar*, *Olahraga*, atau *Karier*.

PRD ini berfokus pada tiga fitur tersebut. Fitur lain dari konsep MyLife tidak termasuk dalam cakupan MVP ini.

## 2. Masalah yang Ingin Diselesaikan

Pengguna sering memiliki tujuan besar, tetapi tidak tahu langkah apa yang perlu dilakukan terlebih dahulu. Daftar tujuan yang hanya berisi nama belum cukup untuk membantu pengguna memahami urutan pekerjaan, tugas yang harus dikerjakan, perkiraan waktu, dan kemajuan yang sudah dicapai.

MyLife perlu menyediakan struktur yang sederhana tetapi cukup detail: **Target/Project → Tahapan → Tugas**. Kategori membantu pengguna mengelompokkan Target tanpa menambah kompleksitas.

## 3. Tujuan Produk

1. Pengguna dapat mencatat Target dan menghubungkannya dengan Kategori.
2. Pengguna dapat memecah Target menjadi tahapan yang terurut.
3. Pengguna dapat memecah setiap tahapan menjadi tugas yang memiliki deskripsi, prioritas, estimasi waktu, dan status pengerjaan.
4. Pengguna dapat mengelola Project menggunakan struktur tahapan dan tugas yang sama.
5. Pengguna dapat memahami progres Target atau Project berdasarkan penyelesaian tugas.
6. Struktur Target dan Project tetap terpisah agar tujuan pengembangan diri tidak tercampur dengan pekerjaan/proyek konkret.

## 4. Bukan Tujuan MVP

Hal berikut **tidak** termasuk dalam MVP:

- Kalender, deadline, pengingat, notifikasi, atau jadwal berulang.
- Subtask, checklist di dalam tugas, lampiran file, komentar, dan kolaborasi tim.
- Fitur habit tracker, jurnal, catatan harian, OKR, atau manajemen keuangan.
- AI yang otomatis membuat roadmap atau memecah target menjadi tugas.
- Login, sinkronisasi cloud, berbagi data antarperangkat, dan multi-user.
- Fitur kategori dengan ikon, warna, atau hierarki kategori.
- Integrasi eksternal dan dashboard analitik lanjutan.

Penyimpanan data harus ditentukan pada dokumen arsitektur teknis. PRD ini tidak mengunci apakah implementasi menggunakan penyimpanan lokal atau backend, tetapi data yang sudah disimpan harus tetap tersedia setelah aplikasi ditutup dan dibuka kembali.

## 5. Pengguna dan Skenario Utama

### Pengguna utama

Individu yang ingin mengelola pengembangan diri dan menyelesaikan pekerjaan pribadi melalui aplikasi mobile.

### Skenario A — Target belajar AI Engineer

1. Pengguna membuka Kategori dan membuat kategori **Belajar**.
2. Pengguna membuka Target lalu memilih **Tambah Target**.
3. Pengguna mengisi nama **AI Engineer**, memilih kategori **Belajar**, dan menambahkan deskripsi.
4. Pengguna membuka detail Target AI Engineer.
5. Pengguna membuat tahapan **Tahap 1 — Fondasi AI**.
6. Pengguna menambahkan tugas **Memahami Konsep AI**, mengisi deskripsi, memilih prioritas **Sedang**, mengisi estimasi **1 jam**, lalu menyimpan tugas.
7. Setelah mengerjakan tugas, pengguna mengubah statusnya menjadi **Selesai**.
8. Progres Target diperbarui berdasarkan tugas yang selesai.

### Skenario B — Project skripsi

1. Pengguna membuka Project dan membuat **Skripsi**.
2. Pengguna membuka detail Skripsi.
3. Pengguna membuat tahapan, misalnya **Tahap 1 — Persiapan Penelitian**.
4. Pengguna menambahkan tugas-tugas yang diperlukan pada tahapan tersebut.
5. Pengguna memperbarui status tugas selama proses pengerjaan dan melihat progres Project.

## 6. Konsep dan Aturan Utama

| Konsep | Fungsi | Struktur |
|---|---|---|
| Target | Tujuan atau kemampuan yang ingin dicapai | Target → Tahapan → Tugas |
| Kategori | Mengelompokkan Target | Kategori → digunakan oleh satu atau beberapa Target |
| Project | Pekerjaan konkret yang perlu diselesaikan | Project → Tahapan → Tugas |

Aturan penting:

- Kategori pada MVP digunakan untuk **Target**. Project tidak wajib memiliki kategori.
- Target dan Project adalah data yang berbeda, walaupun komponen tahapan dan tugas dapat menggunakan pola UI/logic yang serupa.
- Setiap tahapan harus berada di dalam satu Target atau satu Project.
- Setiap tugas harus berada di dalam satu tahapan.
- Tugas memiliki prioritas, estimasi waktu, dan status pengerjaan.
- Progres Target/Project dihitung dari tugas, bukan diinput manual.

## 7. Cakupan Fitur MVP

### 7.1 Fitur Kategori

Kategori sengaja dibuat sederhana. Form Kategori hanya memiliki satu field: **Nama Kategori**.

Kemampuan yang termasuk:

- Melihat daftar kategori.
- Membuat kategori.
- Mengubah nama kategori.
- Menghapus kategori jika belum dipakai oleh Target.
- Melihat empty state ketika belum ada kategori.

Aturan bisnis:

- Nama kategori wajib diisi dan tidak boleh hanya berisi spasi.
- Spasi di awal/akhir nama dihapus otomatis saat disimpan.
- Nama kategori harus unik tanpa membedakan huruf besar/kecil; contoh `Belajar` dan `belajar` dianggap sama.
- Jika kategori sedang digunakan oleh satu atau beberapa Target, pengguna tidak dapat menghapusnya sampai kategori tersebut tidak digunakan lagi. Aplikasi menampilkan penjelasan yang mudah dipahami.
- Mengubah nama kategori akan memperbarui nama kategori yang tampil pada semua Target terkait.
- Tidak ada field ikon, warna, kategori induk, atau deskripsi kategori pada MVP.

### 7.2 Fitur Target

Target digunakan untuk menyimpan tujuan yang ingin dicapai pengguna.

#### Form tambah/edit Target

| Field | Ketentuan |
|---|---|
| Nama Target | Wajib; contoh: `AI Engineer` |
| Kategori | Wajib; dipilih dari data Kategori yang sudah dibuat |
| Deskripsi | Opsional; penjelasan tujuan dan hasil yang ingin dicapai |

Kemampuan yang termasuk:

- Melihat daftar Target.
- Membuat, melihat detail, mengubah, dan menghapus Target.
- Memilih Kategori yang telah dibuat.
- Melihat tahapan dan tugas dalam detail Target.
- Menambahkan, mengubah, menghapus, dan mengurutkan tahapan.
- Menambahkan, mengubah, menghapus, serta memperbarui status tugas.
- Melihat progres Target berdasarkan penyelesaian tugas.

Aturan bisnis:

- Nama Target wajib diisi.
- Target harus memiliki satu kategori yang valid.
- Jika belum ada Kategori, tombol tambah Target mengarahkan pengguna untuk membuat kategori terlebih dahulu atau menampilkan tindakan **Buat Kategori**.
- Penghapusan Target harus meminta konfirmasi. Tahapan dan tugas di dalamnya ikut terhapus karena merupakan bagian dari Target tersebut.
- Target yang belum memiliki tahapan atau tugas tetap valid dan menampilkan empty state yang mengarahkan pengguna untuk menambah tahapan.

### 7.3 Fitur Project

Project digunakan untuk mengelola pekerjaan konkret hingga selesai, bukan untuk mengelompokkan tujuan pengembangan diri.

#### Form tambah/edit Project

| Field | Ketentuan |
|---|---|
| Nama Project | Wajib; contoh: `Skripsi` atau `Aplikasi POS UMKM` |
| Deskripsi | Opsional; ruang lingkup atau hasil akhir project |

Kemampuan yang termasuk:

- Melihat daftar Project.
- Membuat, melihat detail, mengubah, dan menghapus Project.
- Menambahkan, mengubah, menghapus, serta mengurutkan tahapan.
- Menambahkan, mengubah, menghapus, dan memperbarui status tugas di setiap tahapan.
- Melihat progres Project berdasarkan penyelesaian tugas.

Aturan bisnis:

- Nama Project wajib diisi.
- Project tidak memerlukan Kategori pada MVP.
- Penghapusan Project meminta konfirmasi. Semua tahapan dan tugas milik Project tersebut ikut terhapus.
- Project tanpa tahapan atau tugas tetap valid dan menampilkan empty state yang mengarahkan pengguna untuk menambah tahapan.

### 7.4 Fitur Tahapan

Tahapan memecah Target atau Project menjadi bagian-bagian yang lebih kecil dan berurutan.

#### Field tahapan

| Field | Ketentuan |
|---|---|
| Nama Tahapan | Wajib; contoh: `Tahap 1 — Fondasi AI` |
| Deskripsi | Opsional; menjelaskan fokus atau hasil yang diharapkan dari tahap tersebut |

Kemampuan yang termasuk:

- Membuat tahapan dari detail Target atau detail Project.
- Mengubah nama dan deskripsi tahapan.
- Menghapus tahapan dengan konfirmasi.
- Menampilkan daftar tugas dalam tahapan.
- Mengurutkan tahapan. Urutan awal mengikuti waktu pembuatan; pengguna dapat mengubah urutan melalui aksi **Pindah ke atas** dan **Pindah ke bawah**.
- Menampilkan jumlah tugas selesai dibandingkan total tugas dan status progres tahapan.

Aturan bisnis:

- Tahapan harus memiliki nama.
- Tahapan hanya dapat dibuat di dalam Target atau Project yang sedang dibuka.
- Menghapus tahapan akan menghapus semua tugas yang ada di dalamnya setelah pengguna mengonfirmasi.
- Tahapan tanpa tugas menampilkan pesan seperti **Belum ada tugas di tahap ini** dan tombol **Tambah Tugas**.
- Status tahapan dihitung otomatis: `Belum ada tugas`, `Belum dimulai`, `Berjalan`, atau `Selesai`.

### 7.5 Fitur Tugas

Tugas adalah unit pekerjaan yang dapat dikerjakan dan ditandai selesai.

#### Form tambah/edit Tugas

| Field | Ketentuan |
|---|---|
| Nama Tugas | Wajib; contoh: `Memahami Konsep AI` |
| Deskripsi | Opsional; detail pekerjaan atau definisi selesai |
| Prioritas | Wajib; `Rendah`, `Sedang`, atau `Tinggi`; default `Sedang` |
| Estimasi Waktu | Wajib; angka jam lebih besar dari 0, dapat memakai pecahan hingga 2 angka desimal; contoh `1` berarti 1 jam |
| Status | `Belum dimulai`, `Sedang dikerjakan`, atau `Selesai`; default `Belum dimulai` |

Kemampuan yang termasuk:

- Membuat tugas dari dalam suatu tahapan.
- Mengubah dan menghapus tugas.
- Mengubah prioritas dan estimasi waktu.
- Mengubah status tugas, termasuk tindakan cepat untuk menandai selesai.
- Menampilkan prioritas, estimasi waktu, dan status pada kartu tugas.
- Menampilkan total estimasi waktu pada suatu tahapan, serta total estimasi waktu Target/Project sebagai informasi tambahan.

Aturan bisnis:

- Tugas harus memiliki nama.
- Estimasi harus berupa angka valid yang lebih besar dari 0; nilai negatif, nol, atau teks ditolak.
- Deskripsi tugas boleh kosong.
- Tugas baru memiliki status `Belum dimulai` dan prioritas `Sedang` secara default.
- Tugas selesai tetap dapat diedit atau dibuka kembali ke status sebelumnya.
- Menghapus tugas memerlukan konfirmasi.
- Perubahan status tugas langsung memperbarui progres tahapan dan Target/Project terkait.

## 8. Status dan Perhitungan Progres

### Status tugas

1. **Belum dimulai** — tugas belum dikerjakan.
2. **Sedang dikerjakan** — pekerjaan sedang berlangsung.
3. **Selesai** — tugas sudah diselesaikan.

### Status tahapan

- **Belum ada tugas:** total tugas = 0.
- **Belum dimulai:** ada tugas, tetapi belum ada tugas yang selesai atau sedang dikerjakan.
- **Berjalan:** minimal satu tugas sedang dikerjakan atau ada kombinasi tugas selesai dan belum selesai.
- **Selesai:** semua tugas pada tahapan tersebut berstatus selesai dan jumlah tugas lebih dari 0.

### Progres Target dan Project

Rumus progres:

`Progres (%) = (Jumlah tugas berstatus Selesai / Jumlah seluruh tugas) × 100`

- Jika belum ada tugas, progres ditampilkan sebagai **0%** dan teks pendamping **Belum ada tugas**.
- Semua tugas dari seluruh tahapan di dalam Target/Project ikut dihitung.
- Tahapan tanpa tugas tidak menambah atau mengurangi total tugas.
- Progres dihitung ulang ketika tugas dibuat, dihapus, atau statusnya berubah.
- Progres ditampilkan sebagai persentase dan indikator visual.

## 9. Struktur Navigasi dan Daftar Screen

Nama navigasi akhir dapat disesuaikan dalam desain UI/UX, tetapi fungsi screen berikut harus tersedia.

| Screen | Fungsi utama |
|---|---|
| Daftar Target | Menampilkan Target, kategori, dan progres; menyediakan aksi tambah Target |
| Form Target | Membuat atau mengubah nama, kategori, dan deskripsi Target |
| Detail Target | Menampilkan ringkasan Target, progres, daftar tahapan, dan aksi menambah tahap |
| Form Tahapan | Membuat atau mengubah nama dan deskripsi tahapan |
| Form Tugas | Membuat atau mengubah nama, deskripsi, prioritas, estimasi waktu, dan status tugas |
| Daftar Kategori | Menampilkan kategori dan aksi tambah, ubah, hapus |
| Form Kategori | Hanya berisi field nama kategori |
| Daftar Project | Menampilkan Project dan progres; menyediakan aksi tambah Project |
| Form Project | Membuat atau mengubah nama dan deskripsi Project |
| Detail Project | Menampilkan ringkasan Project, progres, tahapan, dan tugas |
| Dialog Konfirmasi | Memastikan pengguna sengaja menghapus data beserta turunannya |

Daftar Target dan daftar Project perlu memiliki empty state yang berbeda serta tombol tindakan utama yang relevan. Detail Target dan detail Project menggunakan pola visual yang serupa, tetapi label dan konteksnya harus jelas agar tidak tertukar.

## 10. Alur Pengguna Utama

### Alur Target

`Daftar Target → Tambah Target → Pilih Kategori → Simpan → Detail Target → Tambah Tahapan → Simpan Tahapan → Tambah Tugas → Isi Detail Tugas → Simpan`

### Alur Kategori

`Daftar Kategori → Tambah Kategori → Isi Nama → Simpan → Kategori tersedia di form Target`

### Alur Project

`Daftar Project → Tambah Project → Isi Nama/Deskripsi → Simpan → Detail Project → Tambah Tahapan → Tambah Tugas`

### Alur menyelesaikan tugas

`Detail Target/Project → Temukan Tugas → Ubah Status menjadi Selesai → Progres Tahapan dan Target/Project diperbarui`

## 11. Kebutuhan Fungsional dan Kriteria Penerimaan

### Umum

- **FR-GEN-01:** Data yang disimpan tetap tersedia setelah aplikasi ditutup dan dibuka kembali.
- **FR-GEN-02:** Pengguna dapat membatalkan form tanpa menyimpan perubahan.
- **FR-GEN-03:** Validasi field wajib ditampilkan dekat field yang bermasalah dengan bahasa yang jelas.
- **FR-GEN-04:** Aksi penghapusan menampilkan konfirmasi yang menyebut jenis data yang akan dihapus.
- **FR-GEN-05:** Setelah membuat, mengubah, atau menghapus data, daftar dan detail yang terkait langsung mencerminkan perubahan tersebut.

### Kategori

- **FR-CAT-01:** Pengguna dapat membuat kategori hanya dengan mengisi nama.
- **FR-CAT-02:** Nama kosong dan nama duplikat ditolak.
- **FR-CAT-03:** Pengguna dapat mengubah nama kategori.
- **FR-CAT-04:** Kategori yang digunakan Target tidak dapat dihapus; aplikasi menjelaskan alasannya.
- **FR-CAT-05:** Kategori yang tidak digunakan dapat dihapus setelah konfirmasi.

**Kriteria penerimaan:** Setelah kategori `Belajar` disimpan, kategori muncul pada pilihan kategori di form Target. Jika pengguna mencoba membuat `belajar`, aplikasi menolak duplikasi tanpa membedakan kapitalisasi.

### Target

- **FR-TGT-01:** Pengguna dapat membuat Target dengan nama, kategori, dan deskripsi opsional.
- **FR-TGT-02:** Pengguna dapat mengubah dan menghapus Target.
- **FR-TGT-03:** Detail Target menampilkan data Target, kategori, progres, dan tahapan.
- **FR-TGT-04:** Pengguna dapat menambahkan tahapan dan tugas dari konteks Target yang benar.
- **FR-TGT-05:** Target tanpa tahapan menampilkan tindakan untuk menambahkan tahapan.

**Kriteria penerimaan:** Pengguna dapat membuat Target `AI Engineer`, memilih kategori `Belajar`, membuka detailnya, membuat tahapan `Tahap 1 — Fondasi AI`, lalu menambahkan tugas `Memahami Konsep AI` tanpa data masuk ke Target lain atau ke Project.

### Project

- **FR-PRJ-01:** Pengguna dapat membuat Project dengan nama dan deskripsi opsional.
- **FR-PRJ-02:** Pengguna dapat mengubah dan menghapus Project.
- **FR-PRJ-03:** Detail Project menampilkan progres, tahapan, dan tugas yang hanya milik Project tersebut.
- **FR-PRJ-04:** Pengguna dapat mengelola tahapan dan tugas tanpa perlu membuat Kategori.
- **FR-PRJ-05:** Project tanpa tahapan menampilkan tindakan untuk menambahkan tahapan.

**Kriteria penerimaan:** Pengguna dapat membuat Project `Skripsi`, menambah tahap dan tugas, lalu melihat bahwa tugas tersebut tidak muncul di detail Target.

### Tahapan

- **FR-STG-01:** Tahapan memiliki nama wajib dan deskripsi opsional.
- **FR-STG-02:** Pengguna dapat mengubah, menghapus, dan mengatur urutan tahapan.
- **FR-STG-03:** Menghapus tahapan meminta konfirmasi dan ikut menghapus seluruh tugas di dalamnya.
- **FR-STG-04:** Kartu tahapan menampilkan jumlah tugas selesai/total, status, dan estimasi waktu total.

### Tugas

- **FR-TSK-01:** Pengguna dapat membuat tugas dengan nama, prioritas, estimasi waktu, dan status default.
- **FR-TSK-02:** Nama tugas wajib dan estimasi waktu harus berupa angka lebih besar dari nol.
- **FR-TSK-03:** Pengguna dapat memilih prioritas Rendah, Sedang, atau Tinggi.
- **FR-TSK-04:** Pengguna dapat mengubah status ke Belum dimulai, Sedang dikerjakan, atau Selesai.
- **FR-TSK-05:** Pengguna dapat mengedit dan menghapus tugas.
- **FR-TSK-06:** Perubahan status atau penghapusan tugas memperbarui progres yang relevan.

**Kriteria penerimaan:** Jika sebuah Target memiliki 4 tugas dan 1 tugas berstatus Selesai, progres Target menjadi 25%. Setelah tugas kedua ditandai selesai, progres menjadi 50%.

## 12. Aturan Validasi dan Penanganan Kondisi Khusus

- Semua teks wajib harus dipangkas dari spasi di awal dan akhir.
- Form tidak boleh disimpan ketika field wajib tidak valid.
- Pesan validasi menjelaskan cara memperbaiki input, bukan hanya menyatakan gagal.
- Jika daftar Kategori kosong saat pengguna ingin membuat Target, tampilkan empty state dan jalur untuk membuat Kategori.
- Jika suatu daftar kosong, tampilkan penjelasan singkat dan satu tindakan utama; jangan tampilkan layar kosong tanpa konteks.
- Data turunan yang akan terhapus harus disebutkan atau diperingatkan sebelum penghapusan Target, Project, atau Tahapan.
- Jika penyimpanan gagal, data yang belum berhasil disimpan tidak boleh ditampilkan seolah-olah sudah tersimpan. Berikan pesan dan opsi mencoba lagi.
- Jika pengguna membatalkan form edit, data tersimpan sebelumnya tetap tidak berubah.

## 13. Kebutuhan Nonfungsional

- **Kemudahan penggunaan:** alur membuat Target → Tahapan → Tugas harus jelas dan tidak memerlukan langkah yang tidak relevan.
- **Konsistensi:** komponen tahapan dan tugas pada Target serta Project memakai perilaku yang konsisten.
- **Pemisahan data:** perubahan pada satu Target/Project tidak boleh mengubah item milik Target/Project lain.
- **Ketahanan data:** data yang berhasil disimpan tidak hilang hanya karena aplikasi ditutup atau perangkat memuat ulang aplikasi.
- **Responsivitas:** daftar dan detail harus tetap nyaman digunakan pada ukuran layar mobile yang didukung.
- **Aksesibilitas dasar:** ukuran area sentuh memadai, label field jelas, kontras teks terbaca, dan status tidak dibedakan hanya dengan warna.
- **Bahasa:** teks antarmuka MVP menggunakan Bahasa Indonesia.

## 14. Informasi yang Ditampilkan di Kartu dan Detail

### Kartu Target

- Nama Target.
- Nama Kategori.
- Persentase progres.
- Jumlah tugas selesai dan total tugas.

### Kartu Project

- Nama Project.
- Persentase progres.
- Jumlah tugas selesai dan total tugas.

### Kartu Tahapan

- Nama Tahapan dan deskripsi singkat jika tersedia.
- Jumlah tugas selesai/total.
- Status tahapan.
- Total estimasi waktu seluruh tugas pada tahap tersebut.
- Daftar tugas di bawah tahapan.

### Kartu Tugas

- Nama Tugas.
- Prioritas.
- Estimasi waktu.
- Status pengerjaan.
- Aksi untuk mengubah status dan membuka form edit.

## 15. Saran Struktur Data Logis

Bagian ini menjelaskan hubungan data pada tingkat produk, bukan memaksakan teknologi database tertentu.

### Category

- `id`
- `name`
- `createdAt`
- `updatedAt`

### Target

- `id`
- `name`
- `categoryId`
- `description` (opsional)
- `createdAt`
- `updatedAt`

### Project

- `id`
- `name`
- `description` (opsional)
- `createdAt`
- `updatedAt`

### Stage

- `id`
- `parentType` (`TARGET` atau `PROJECT`)
- `parentId`
- `name`
- `description` (opsional)
- `orderIndex`
- `createdAt`
- `updatedAt`

### Task

- `id`
- `stageId`
- `name`
- `description` (opsional)
- `priority` (`LOW`, `MEDIUM`, `HIGH`)
- `estimatedHours`
- `status` (`TODO`, `IN_PROGRESS`, `DONE`)
- `orderIndex`
- `createdAt`
- `updatedAt`

Catatan implementasi: pola data tahapan dapat memakai tabel terpisah untuk Target dan Project atau relasi bertipe, bergantung pada database yang dipilih. Yang wajib dijaga adalah integritas relasi, sehingga tugas selalu terhubung ke tahapan yang benar dan tahapan selalu terhubung ke Target atau Project yang benar.

## 16. Urutan Implementasi yang Disarankan

1. **Fondasi data dan navigasi:** model Kategori, Target, Project, Tahapan, Tugas; penyimpanan persisten; dan navigasi utama.
2. **Kategori:** daftar, tambah, ubah nama, hapus dengan aturan kategori yang sedang digunakan.
3. **Tahapan dan Tugas bersama:** form, CRUD, status tugas, prioritas, estimasi, urutan tahapan.
4. **Target:** CRUD Target, pemilihan kategori, detail dan progres.
5. **Project:** CRUD Project, detail dan progres dengan struktur tahapan/tugas yang sama.
6. **Pengujian menyeluruh:** validasi, empty state, penghapusan data turunan, persistensi, dan pemisahan data Target/Project.

Urutan ini menyarankan agar pola tahapan dan tugas dibuat sebagai komponen atau logika yang dapat digunakan ulang, tanpa menyamakan Target dan Project sebagai konsep produk.

## 17. Kriteria MVP Selesai

MVP dapat dianggap siap diuji jika seluruh kondisi berikut terpenuhi:

- Pengguna dapat membuat, mengubah nama, dan menghapus Kategori sesuai aturan.
- Pengguna dapat membuat Target dan memilih Kategori.
- Pengguna dapat membuat beberapa tahapan berurutan di dalam Target maupun Project.
- Pengguna dapat membuat tugas dengan deskripsi, prioritas, estimasi waktu, dan status.
- Pengguna dapat mengubah status tugas menjadi selesai atau mengembalikannya ke status lain.
- Progres Target/Project dan status tahapan dihitung secara benar dan otomatis.
- Penghapusan Target, Project, atau Tahapan menangani tugas turunannya dengan konfirmasi.
- Data tetap tersedia setelah aplikasi ditutup dan dibuka kembali.
- Data Target dan Project tidak tercampur.
- Semua empty state, validasi, serta kondisi gagal penyimpanan utama ditangani.
- Skenario AI Engineer dan Skripsi pada bagian 5 dapat diselesaikan dari awal sampai akhir.

## 18. Keputusan Produk yang Disarankan untuk MVP

Agar implementasi awal tetap fokus, PRD ini menetapkan rekomendasi berikut:

- Satu pengguna pada satu konteks aplikasi; fitur kolaborasi tidak dibuat.
- Kategori hanya diterapkan pada Target.
- Deskripsi Target, Project, Tahapan, dan Tugas bersifat opsional.
- Prioritas default tugas adalah Sedang.
- Status default tugas adalah Belum dimulai.
- Progres dihitung dari tugas berstatus Selesai.
- Tahapan dapat diurutkan secara manual; tugas dalam tahap mengikuti urutan pembuatan pada MVP.
- Deadline, pengingat, lampiran, sinkronisasi, dan AI otomatisasi ditunda ke versi berikutnya.
- Pilihan teknologi dan strategi penyimpanan ditetapkan dalam dokumen arsitektur teknis, bukan di PRD ini.

---

**Ringkasan:** MVP MyLife berpusat pada satu struktur yang mudah dipahami: **Target atau Project → Tahapan → Tugas**. Kategori menjadi pengelompokan sederhana khusus Target. Tugas memiliki prioritas, estimasi waktu, dan status agar progres benar-benar bisa diukur, bukan hanya berupa daftar nama.
