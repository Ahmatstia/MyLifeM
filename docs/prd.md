# Product Requirements Document (PRD) — MyLife Mobile

**Versi:** 1.0.0  
**Target Platform:** Mobile (Android APK / iOS via Expo)  
**Arsitektur:** Offline-First (Local Database SQLite)  
**Status:** Draf Final untuk Implementasi Mobile  

---

## 1. Latar Belakang & Visi Produk

### 1.1 Latar Belakang Masalah
Versi web MyLife memiliki ekosistem fitur yang sangat lengkap, namun menghadapi kendala friksi akses (*accessibility friction*):
* Pengguna jarang membuka web karena harus menyalakan laptop/membuka peramban, yang memicu rasa malas (*friction*) untuk sekadar mencatat progress atau melihat target.
* Pengguna jauh lebih sering berinteraksi dengan ponsel sepanjang hari.
* Fitur produktivitas pribadi menuntut **kecepatan akses instan (< 1 detik)**, notifikasi pengingat tepat waktu (*lockscreen notifications*), dan kemampuan beroperasi tanpa jaringan internet (*offline-first*).

### 1.2 Visi Produk
Menghadirkan **Personal Life OS di saku pengguna**: sebuah aplikasi mobile yang berpusat pada **Target Kehidupan (Goals)** sebagai kompas utama, didukung oleh **Proyek eksekusi**, pengaturan **Agenda harian**, dan integrasi **Hari Ini & Sesi Fokus** dalam satu genggaman yang responsif, intuitif, dan tanpa gangguan server.

---

## 2. Ruang Lingkup Fitur Inti (Core Scope)

Pada rilis versi mobile ini, fitur difokuskan secara tajam pada 4 pilar utama yang paling berdampak:

```
┌──────────────────────────────────────────────────────────────┐
│                  1. TARGET (FITUR UTAMA)                     │
│         Visi, Pilar Kehidupan, Target Capaian, Progres       │
└──────────────────────────────┬───────────────────────────────┘
                               │ memandu
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         2. PROJECT                           │
│        Wadah Eksekusi Terstruktur, Milestone, Kumpulan Tugas  │
└──────────────────────────────┬───────────────────────────────┘
                               │ dipecah menjadi
                               ▼
┌──────────────────────────────┴───────────────────────────────┐
│                 3. TODAY & FOKUS (TERINTEGRASI)              │
│       Tugas Hari Ini + Timer Fokus (Pomodoro & Deep Work)    │
└──────────────────────────────┬───────────────────────────────┘
                               │ dijadwalkan pada
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                          4. AGENDA                           │
│          Timeline Waktu, Blok Kerja, Pengingat Harian        │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Spesifikasi Fungsional Fitur

---

### FITUR 1: TARGET (Pilar Utama & Kompas Hidup)
> **Penting:** Target adalah penggerak utama aplikasi. Seluruh proyek, agenda, dan tugas harian harus bermuara pada pencapaian Target.

#### 3.1 Kategori / Pilar Target
Setiap Target wajib dikelompokkan ke dalam area kehidupan yang jelas agar hidup seimbang:
* **Karier & Bisnis** (Pekerjaan, usaha, keahlian profesional).
* **Finansial** (Tabungan, investasi, pendapatan, pengelolaan utang).
* **Kesehatan & Kebugaran** (Fisik, nutrisi, stamina, olahraga).
* **Pengembangan Diri & Spiritual** (Membaca, ibadah, pembelajaran).
* **Pribadi & Hubungan** (Keluarga, sosial, lingkungan).

#### 3.2 Tipe Pengukuran Target
1. **Target Berbasis Tugas/Proyek (Milestone/Task-based):** Progres dihitung otomatis dari persentase tugas atau milestone yang telah diselesaikan.
2. **Target Berbasis Angka/Metrik (Metric/Numeric):** Contoh: "Membaca 24 buku", "Mencapai berat 65 kg", "Menabung Rp 50.000.000". Memiliki nilai target, nilai saat ini, dan satuan unit.
3. **Target Pemeliharaan (Maintenance):** Target berkelanjutan tanpa batas akhir khusus.

#### 3.3 Struktur Data Target
* Judul Target & Deskripsi motivasional.
* Pilar/Area Kehidupan.
* Rentang Waktu (Tanggal Mulai & Target Deadline).
* Prioritas (Rendah, Sedang, Tinggi, Mendesak).
* Status (Aktif, Dijeda, Selesai, Diarsipkan).
* Persentase Kemajuan (0 - 100%) dengan visual bar dinamis.

#### 3.4 UX & Interaksi Mobile
* Tampilan **Target Dashboard**: Kartu ringkasan target aktif dengan indikator progres visual melingkar (*circular progress*) atau progres bar horizontal tebal.
* Kemampuan memfilter target berdasarkan pilar kehidupan.
* Ketuk kartu target untuk melihat seluruh Proyek dan Tugas yang terhubung dengan target tersebut.

---

### FITUR 2: PROJECT (Wadah Eksekusi Terstruktur)

#### 2.1 Definisi & Hubungan
Project adalah inisiatif spesifik dengan cakupan kerja terukur yang secara langsung mendukung satu Target tertentu (misal: Target *"Menjadi Mobile Developer Handal"*, Project *"Membangun Aplikasi MyLife Mobile"*).

#### 2.2 Komponen Project
* **Identitas Project:** Judul, deskripsi, warna pembeda, tenggat waktu.
* **Tautan Target:** Project dapat ditautkan ke satu Target (opsional, bisa project mandiri).
* **Milestone / Babak Kerja:** Pembagian fase project (Contoh: Fase 1 Desain, Fase 2 Koding, Fase 3 Rilis).
* **Task List:** Daftar tugas konkret di dalam project.
* **Status Project:** Rencana, Sedang Berjalan, Tertahan, Selesai.

#### 2.3 UX & Interaksi Mobile
* Tampilan kartu proyek dengan ringkasan: `x dari y tugas selesai` dan persentase otomatis.
* *Accordion view* atau *tab* untuk berpindah antar Milestone dengan mudah menggunakan jempol.

---

### FITUR 3: TODAY & FOKUS TERPADU (Layar Harian Utama)

> **Kunci Desain Mobile:** Di web, fitur Today dan Fokus terpisah di halaman berbeda. Di mobile, keduanya **wajib disatukan** agar alur eksekusi mulus tanpa berpindah-pindah layar.

#### 3.1 Bagian 1: Prioritas Hari Ini (Daily Focus)
* Pengguna dapat memilih **3 hingga 5 tugas utama** untuk dieksekusi hari ini (*The Rule of 3-5 Priorities*).
* Mencegah rasa kewalahan (*overwhelmed*) akibat melihat puluhan to-do list sekaligus.
* Setiap tugas memiliki tombol centang cepat dan tombol **"Mulai Fokus"**.

#### 3.2 Bagian 2: Timer Fokus Terintegrasi (Inline / Bottom Sheet)
Saat pengguna menekan tombol "Fokus" pada suatu tugas:
* Timer langsung muncul di layar (bisa berupa widget atas atau bottom-sheet yang dapat diminimalkan/diperbesar).
* **Mode Timer:**
  1. **Pomodoro Clasic:** 25 menit kerja fokus + 5 menit istirahat sejenak.
  2. **Deep Flow:** 50 menit atau 90 menit kerja intensif tanpa jeda.
  3. **Stopwatch Bebas:** Menghitung maju waktu kerja pengguna.
* **Fitur Native HP saat Timer Aktif:**
  * **Keep-Awake:** Layar ponsel dijaga tetap menyala agar pengguna bisa melirik sisa waktu tanpa harus membuka kunci HP.
  * **Haptic Feedback:** Ponsel bergetar lembut saat timer dimulai, jeda, dan selesai.
  * **Audio Chime:** Bunyi bel mangkuk meditasi yang tenang saat sesi berakhir.
* **Catatan Refleksi Singkat Sesi:**
  Setelah sesi berakhir, muncul dialog 3 pertanyaan cepat (10 detik):
  - Berapa tingkat pemahaman/fokus? (Skala 1 - 5 bintang).
  - Apa hambatan utama yang dihadapi? (Teks opsional).
  - Waktu fokus otomatis dicatat ke akumulasi waktu tugas terkait.

---

### FITUR 4: AGENDA (Timeline Waktu & Jadwal Fleksibel)

#### 4.1 Definisi
Menata kegiatan, jadwal dengan jam pasti (*time-blocked*), maupun to-do bebas jam dalam urutan kronologis hari.

#### 4.2 Komponen Agenda
1. **Kegiatan Terikat Jam (Time-bound Events):**
   - Contoh: Rapat kerja jam 10:00 - 11:30, Belajar mandiri jam 14:00 - 15:30.
   - Dilengkapi pengingat notifikasi lokal (10 menit sebelum acara).
2. **To-Do Fleksibel (Bebas Jam):**
   - Tugas yang harus selesai pada hari tertentu tetapi tidak terpaku pada menit tertentu.
3. **Keterkaitan dengan Project/Target:**
   - Acara agenda dapat langsung dihubungkan ke Project atau Target tertentu.

#### 4.3 UX Mobile
* Menggunakan tampilan **Agenda List / Timeline Vertikal** (bukan kalender grid kotak desktop yang sempit di HP).
* Garis penanda waktu sekarang (*current time indicator line*) yang bergerak secara realtime sepanjang hari.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Kecepatan & Responsivitas:**
   - Waktu muat aplikasi dingin (*cold start*): < 1.5 detik.
   - Waktu buka layar (*screen transition*): 60 FPS (tanpa frame drop).
2. **Ketahanan Offline (100% Offline Capable):**
   - Seluruh operasi Create, Read, Update, Delete (CRUD) wajib berhasil tanpa koneksi internet apa pun.
   - Basis data disimpan lokal di memori aman internal HP pengguna.
3. **Efisiensi Daya & Baterai:**
   - Timer fokus dilarang menguras baterai dengan kalkulasi berat di background.
   - Menggunakan mekanisme kalkulasi selisih timestamp (*delta timestamp*) bukan looping interval aktif saat diminimalkan.
4. **Desain UI/UX & Aksesibilitas:**
   - Mendukung tema gelap modern (*Deep Obsidian Teal*).
   - Zona jangkauan jempol (*thumb-zone friendly*): Seluruh tombol aksi utama berada di separuh bawah layar ponsel.
   - *Haptic feedback* untuk setiap konfirmasi penting.

---

## 5. Rencana Rilis & Milestone Pengembangan

* **Fase 1:** Setup Pondasi Expo + Database SQLite Lokal + Theme System.
* **Fase 2:** Implementasi Fitur Target & Project (Kompas & Struktur).
* **Fase 3:** Implementasi Layar Terpadu Today & Fokus Timer (Eksekusi Harian).
* **Fase 4:** Implementasi Agenda Timeline & Notifikasi Lokal.
* **Fase 5:** Pengujian Build APK Produksi & Uji Pasang di Perangkat Fisik Android.
