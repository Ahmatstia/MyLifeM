> **Pembaruan 27 November 2026:** arah produk yang disepakati, koreksi klaim riset, dan implementasi aktual tercatat pada [Blueprint MyLife](docs/PRODUCT_BLUEPRINT_2026-11-27.md). Naskah awal di bawah dipertahankan sebagai arsip pemikiran, bukan daftar fitur wajib. Angka 3–5, voice input, dan AI bukan persyaratan ilmiah atau MVP yang mengikat.

# MyLife — Riset & Spesifikasi Arsitektur Aplikasi Produktivitas

> **Dokumen ini untuk:** AI coding agent yang mengerjakan pengembangan ulang/penambahan fitur aplikasi MyLife.
> **Tujuan:** memberi konteks *kenapa* setiap fitur ada, bukan cuma *apa* fiturnya, supaya agent bisa mengambil keputusan desain yang konsisten saat merombak atau menambah bagian aplikasi.
> **Cara pakai:** baca dari atas ke bawah secara berurutan. Bagian 1-2 adalah alasan (riset), bagian 3-6 adalah spesifikasi yang bisa langsung dieksekusi menjadi kode/struktur fitur.

---

## 1. Latar belakang masalah (riset)

### 1.1 Kenapa aplikasi produktivitas pada umumnya gagal

Riset kognitif dan psikologi menunjukkan beberapa akar masalah yang konsisten muncul di aplikasi to-do/produktivitas, dan ini harus jadi prinsip desain MyLife, bukan sekadar catatan kaki:

1. **Keterbatasan kapasitas kerja otak.** Working memory manusia hanya mampu menampung sekitar 4-7 item sekaligus (riset Miller 1956, diperhalus oleh Cowan). Daftar tugas yang panjang memicu *decision fatigue* dan bisa membuat otak masuk ke kondisi "cognitive paralysis" — memilih diam total karena memproses keseluruhan daftar terlalu mahal secara kognitif.
   - **Implikasi desain:** jangan pernah menampilkan seluruh backlog tugas sebagai default view. Harus ada view yang membatasi jumlah item aktif (idealnya 1-5 item) yang perlu diperhatikan saat itu juga.

2. **Membuat daftar tugas bisa menjadi bentuk penundaan itu sendiri.** Peneliti prokrastinasi Timothy Pychyl menemukan banyak orang menjadikan "sudah menulis to-do list" sebagai pencapaian harian, sehingga mengurangi rasa bersalah tanpa benar-benar mengerjakan apa pun. Fenomena ini disebut "procrastination field" — sibuk bersiap-siap untuk mulai kerja, tapi tidak pernah benar-benar mulai.
   - **Implikasi desain:** aplikasi tidak boleh memberi reward/validasi hanya karena menambah tugas ke list. Reward harus terikat pada eksekusi (menyelesaikan), bukan pencatatan.

3. **Prokrastinasi adalah masalah regulasi emosi, bukan manajemen waktu.** Penelitian Fuschia Sirois dan Timothy Pychyl secara konsisten menunjukkan orang menunda bukan untuk menghindari tugasnya, tapi untuk menghindari emosi negatif yang diantisipasi muncul saat mengerjakannya (takut gagal, cemas, dsb). Sekitar 20% orang dewasa adalah "chronic procrastinator".
   - **Implikasi desain:** notifikasi/reminder yang bernada menekan ("Tugas kamu TERLAMBAT!") kemungkinan memperburuk, bukan membantu. Nada harus suportif dan menawarkan jalan keluar (reschedule, pecah jadi lebih kecil), bukan tekanan.

4. **Penghindaran penyelesaian ("completion avoidance").** Tugas justru paling sering ditinggalkan bukan di awal, tapi di sepertiga akhir — ketika hasil mulai konkret dan bisa dinilai orang lain. Otak merespons potensi dihakimi/dievaluasi seolah itu ancaman fisik.
   - **Implikasi desain:** pecah tugas besar jadi milestone kecil dengan titik penyelesaian yang jelas, supaya "selesai" terasa lebih sering dan risikonya kecil per langkah.

5. **Tugas yang belum selesai terus mengganggu pikiran (Efek Zeigarnik).** Tugas yang belum tuntas tetap aktif secara kognitif, memicu kecemasan ringan dan pikiran berulang, bahkan bisa mengganggu tidur.
   - **Implikasi desain:** sediakan mekanisme "parkir" tugas secara sadar (bukan cuma dibiarkan menumpuk di backlog) — misalnya fitur "taruh dulu, bukan sekarang" yang eksplisit, supaya otak merasa sudah "menyelesaikan keputusan" soal tugas itu meski belum dikerjakan.

6. **Tingkat drop-off aplikasi personal sangat tinggi.** Rata-rata 52% aplikasi (semua kategori) ditinggalkan pengguna dalam 90 hari pertama; untuk app kesehatan/fitness bahkan 66-69%. Pola umumnya: aplikasi mulai terasa seperti "pekerjaan tambahan" alih-alih bantuan.
   - **Implikasi desain:** setiap interaksi wajib terasa mengurangi beban, bukan menambah. Kalau sebuah fitur butuh effort manual yang besar untuk "dirawat" (tagging manual rumit, kategorisasi manual berlapis, dsb), itu kandidat kuat penyebab churn.

### 1.2 Kebutuhan inti manusia yang harus dijawab aplikasi ini

Bukan daftar fitur, tapi daftar *kebutuhan* di balik fitur:

- **Capture tanpa beban mikir.** Saat ide/tugas muncul, harus bisa dicatat dalam hitungan detik, dari mana saja, tanpa harus langsung memutuskan kategori/prioritas.
- **Tahu persis harus mengerjakan apa sekarang.** Bukan daftar panjang, tapi 1-3 hal yang realistis untuk hari ini.
- **Melihat progres secara konkret.** Otak butuh sinyal "aku maju", bukan cuma checklist yang terus bertambah panjang.
- **Fleksibilitas saat rencana berantakan.** Hidup tidak linear; sistem yang terlalu kaku membuat orang merasa gagal lalu berhenti memakai aplikasi.
- **Tidak merasa dihakimi.** Notifikasi/reminder harus suportif, bukan menambah rasa bersalah.
- **Personalisasi dari pola nyata pengguna, bukan template generik.** Tren industri 2026 menunjukkan diferensiator utama aplikasi produktivitas sekarang adalah penjadwalan berbasis AI yang mempertimbangkan kalender, urgensi, dan pola kerja historis pengguna — bukan sekadar daftar statis.

### 1.3 Konteks pasar 2026 (ringkas, untuk kalibrasi fitur)

- Tren industri bergeser dari "app serba bisa" (all-in-one) ke app yang **AI-native dan terpusat pada kalender/waktu**, yang secara aktif menyarankan kapan tugas sebaiknya dikerjakan — bukan cuma menyimpannya.
- **Personalisasi berbasis memori jangka panjang** (aplikasi makin memahami kebiasaan pengguna seiring waktu) jadi pembeda paling berarti untuk pengguna individu.
- Ada tren konsolidasi: pengguna lebih memilih sedikit aplikasi yang kuat daripada banyak aplikasi khusus yang terpisah-pisah — jadi MyLife sebaiknya punya satu "home base" yang jelas, bukan jadi salah satu dari banyak tool yang harus dibuka bergantian.
- Interaksi suara/voice-to-task tumbuh pesat sebagai cara capture yang disukai, terutama untuk pengguna yang ingin interaksi cepat tanpa mengetik.

---

## 2. Prinsip desain yang mengikat (gunakan ini sebagai filter setiap keputusan fitur)

Setiap fitur baru atau perombakan fitur lama HARUS lolos semua filter berikut sebelum dikerjakan:

1. **Mengurangi beban kognitif, bukan menambah.** Jika fitur butuh pengguna mengingat/mengelola sesuatu secara manual yang rumit, pertimbangkan ulang.
2. **Punya tempat yang jelas di salah satu dari 5 tahap siklus** (lihat Bagian 3). Fitur yang tidak jelas masuk tahap mana adalah kandidat untuk disederhanakan atau dihapus.
3. **Tidak menghakimi pengguna.** Copy, notifikasi, dan visual tidak boleh terasa seperti menyalahkan.
4. **Menunjukkan progres secara konkret**, bukan hanya menyimpan data pasif.
5. **Berfungsi baik walau pengguna tidak disiplin 100%.** Sistem harus tetap berguna meski pengguna skip beberapa hari — jangan ada penalti/reset yang bikin pengguna merasa harus mulai dari nol lagi (ini penyebab umum churn di app berbasis streak/habit).

---

## 3. Arsitektur alur sistem (5 tahap siklus)

Ini kerangka utama arsitektur MyLife. Setiap modul/fitur aplikasi harus dipetakan ke salah satu tahap berikut:

```
[1. CAPTURE] → [2. ORGANIZE] → [3. PRIORITIZE] → [4. EXECUTE] → [5. REVIEW]
       ↑                                                              │
       └──────────────────────────────────────────────────────────────┘
                     (insight dari review memengaruhi capture berikutnya)
```

### Tahap 1 — Capture
**Pertanyaan pengguna yang dijawab:** "Gimana caranya aku gak lupa ide/tugas ini?"

- **Fitur wajib (MVP):**
  - Quick-add universal (satu tombol/shortcut, bisa diakses dari mana saja di app, idealnya juga dari widget/notifikasi sistem)
  - Input bebas format (tidak wajib isi field kategori/prioritas saat capture — itu urusan tahap organize)
  - Voice-to-text untuk capture cepat tanpa mengetik
- **Fitur lanjutan (bukan prioritas MVP):**
  - Auto-capture dari sumber eksternal (forward email, share dari app lain, chat)
  - Natural language parsing ("telepon klien jumat jam 3" otomatis jadi task + due date + waktu)

**Kriteria sukses tahap ini:** waktu dari "muncul ide" sampai "tercatat di app" < 5 detik, dengan friksi seminimal mungkin.

### Tahap 2 — Organize
**Pertanyaan pengguna yang dijawab:** "Ini masuk kategori apa?"

- **Fitur wajib (MVP):**
  - Struktur project/list sederhana
  - Tag/label bebas
  - Due date opsional (tidak wajib diisi — banyak tugas tidak punya deadline pasti)
- **Fitur lanjutan:**
  - Auto-kategorisasi berbasis AI (mengelompokkan brain dump mentah ke project yang sesuai)
  - Deteksi duplikat/tugas yang mirip

**Catatan penting:** tahap ini harus bisa di-skip sepenuhnya oleh pengguna yang terburu-buru — jangan buat wajib isi sebelum tugas tersimpan.

### Tahap 3 — Prioritize
**Pertanyaan pengguna yang dijawab:** "Dari semua ini, mana yang penting sekarang?"

- **Fitur wajib (MVP):**
  - "Today view" yang **dibatasi jumlahnya** (sarankan maksimal 3-5 item aktif per hari, bukan menampilkan seluruh backlog)
  - Mekanisme prioritas sederhana (bisa sesederhana urutan manual drag-and-drop, atau matriks urgent/penting)
- **Fitur lanjutan:**
  - AI scoring prioritas otomatis berdasarkan deadline, histori pengerjaan, dan energi/waktu pengguna
  - Deteksi "tugas yang selalu ditunda" dan menyarankan untuk dipecah lebih kecil (lihat Bagian 1.1 poin 4 — completion avoidance)

**Ini tahap paling kritis.** Mayoritas masalah overwhelm pada aplikasi to-do terjadi karena tahap ini tidak ada atau tidak dipaksakan — pengguna melihat seluruh daftar tugas sekaligus tanpa filter.

### Tahap 4 — Execute
**Pertanyaan pengguna yang dijawab:** "Kapan aku ngerjain ini, dan bagaimana aku tetap fokus?"

- **Fitur wajib (MVP):**
  - Reminder/notifikasi (nada suportif, bukan menghakimi — lihat Bagian 2 poin 3)
  - Tandai selesai dengan satu tap
  - Integrasi kalender dasar (menampilkan tugas di konteks waktu)
- **Fitur lanjutan:**
  - Timer fokus (pomodoro-style)
  - Auto-scheduling (AI menempatkan tugas otomatis ke slot kalender kosong, mempertimbangkan durasi & urgensi)
  - Reschedule otomatis yang suportif saat tugas terlewat (bukan sekadar label "overdue" berwarna merah)

### Tahap 5 — Review
**Pertanyaan pengguna yang dijawab:** "Aku udah maju belum? Apa yang perlu berubah?"

- **Fitur wajib (MVP):**
  - Riwayat tugas selesai (bisa dilihat kembali)
  - Ringkasan mingguan sederhana (berapa selesai, berapa tertunda)
- **Fitur lanjutan:**
  - Insight pola perilaku ("kamu paling produktif jam 9 pagi", "tugas kategori X sering tertunda")
  - Rekomendasi otomatis untuk siklus berikutnya berdasarkan insight tersebut (inilah yang menutup loop kembali ke Capture/Prioritize)

---

## 4. Audit fitur yang sudah ada — tabel kerja untuk AI agent

AI agent diminta mengisi tabel ini berdasarkan kode/fitur MyLife yang sudah ada saat ini, lalu memberi rekomendasi aksi (pertahankan / sederhanakan / hapus / belum ada-tambahkan):

| Nama fitur existing | Tahap (1-5) | Pertanyaan pengguna yang dijawab | Apakah lolos filter Bagian 2? | Rekomendasi aksi |
|---|---|---|---|---|
| *(diisi agent)* | | | | |

**Instruksi untuk agent:** jika ada fitur yang tidak bisa diisi di kolom "pertanyaan pengguna yang dijawab" dengan jelas, maka fitur itu kemungkinan besar sumber kebingungan tim dan perlu didiskusikan ulang fungsinya sebelum dikembangkan lebih jauh — jangan langsung dihapus tanpa konfirmasi ke product owner.

---

## 5. Keputusan strategis yang harus diambil lebih dulu

Sebelum menambah fitur apa pun, tentukan satu diferensiator inti MyLife. Jangan mencoba jadi semua sekaligus (Notion + Todoist + Motion dalam satu app) — ini pola kegagalan umum aplikasi solo developer karena tidak ada satu pun area yang benar-benar kuat.

Pilih salah satu fokus utama (boleh didiskusikan dengan product owner/user asli, bukan diputuskan sepihak oleh agent):

- **A. Daily planning ringan** — fokus ke Today view + kalender, minim fitur project kompleks.
- **B. Manajemen proyek pribadi** — fokus ke struktur project/sub-task/milestone, cocok untuk pengguna dengan proyek jangka panjang (skripsi, bisnis sampingan, dsb).
- **C. Pembentukan kebiasaan (habit)** — fokus ke recurring task + streak yang tidak menghukum saat terlewat.

Tahap 1-5 di Bagian 3 tetap berlaku untuk ketiga pilihan ini — yang berbeda adalah fitur mana yang paling ditonjolkan di tiap tahap.

---

## 6. Prioritas pengembangan (urutan yang disarankan)

1. **Core loop MVP dulu:** Capture → Today view (dibatasi) → tandai selesai. Ini harus mulus sebelum menyentuh apa pun yang lain.
2. **Review mingguan sederhana** (walau cuma angka "X selesai dari Y") — ini loop motivasi minimum yang dibutuhkan otak manusia untuk tetap menggunakan app lebih dari beberapa hari.
3. **Notifikasi suportif** — revisi nada semua pesan sistem supaya tidak terasa menghakimi.
4. **Baru setelah 1-3 stabil:** fitur lanjutan (AI scheduling, auto-kategorisasi, insight perilaku, integrasi kalender penuh).

**Jangan membangun fitur gamifikasi (badge, poin, dsb) sebelum core loop di atas benar-benar jalan mulus** — gamifikasi di atas sistem yang dasarnya belum solid hanya menutupi masalah struktural, bukan menyelesaikannya.

---

## 7. Catatan untuk AI agent yang menjalankan dokumen ini

- Gunakan Bagian 3 sebagai kerangka arsitektur utama saat mengambil keputusan struktur data/komponen.
- Gunakan Bagian 4 sebagai task pertama: audit kode yang ada sebelum menulis kode baru.
- Jangan menambah fitur yang tidak lolos filter di Bagian 2, meskipun secara teknis mudah diimplementasikan.
- Jika ragu fitur masuk kategori mana, tandai di tabel audit untuk didiskusikan dengan pemilik produk, jangan diputuskan sepihak.
