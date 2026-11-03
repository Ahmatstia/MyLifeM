# Spesifikasi Lengkap UI/UX Layar MyLife (Botanical Pop Redesign Blueprint)

Dokumen ini adalah **spesifikasi desain resmi (design brief & screen architecture)** aplikasi mobile **MyLife** yang dirancang untuk agen desain / AI desainer (**Google Stitch / Figma**). Dokumen ini merinci hierarki visual, fitur fungsional, arsitektur tata letak dari atas ke bawah, serta sistem token warna yang dipertahankan.

---

## 1. Fondasi Desain & Palet Warna (*Botanical Pop System*)

Aplikasi menggunakan tema **Botanical Pop**: hangat, membumi (*earthy*), ceria (*playful*), dan tenang untuk fokus membaca.

### 1.1 Palet Warna Utama (Wajib Dipertahankan)
| Nama Token | Kode HEX | Peran & Penggunaan |
| :--- | :--- | :--- |
| **Ivory Canvas** | `#F7F5EF` | Background dasar seluruh layar aplikasi (hangat, bukan putih silau). |
| **Pure White** | `#FFFFFF` | Background kartu konten utama (*surface card*), field input, bottom bar. |
| **Deep Teal** | `#125B50` | Warna aksi utama / Primary CTA, header brand, checkbox aktif, ikon terpilih. |
| **Dark Petrol** | `#173C36` | Background Hero Card (kartu fokus utama hari ini, berwibawa & fokus). |
| **Citron Glow** | `#D5F478` | Warna aksen pop/highlight (tombol "Mulai Fokus" di Hero Card, badge status aktif). |
| **Sage Green** | `#DDEDE5` | Container sekunder tenang (kartu ringkasan selesai, tag kategori teal, chip non-aktif). |
| **Warm Peach** | `#FFE3D5` | Container waktu/refleksi (kartu menit fokus, highlight sesi santai). |
| **Coral Terracotta**| `#F2786D` | Aksen perhatian hangat (notifikasi penting, penanda batas waktu). |
| **Deep Charcoal** | `#262D29` | Teks judul utama (kontras tinggi, mudah dibaca, bukan hitam pekat kaku). |
| **Muted Slate** | `#5D6861` | Teks sekunder, deskripsi, placeholder, jam & metadata. |
| **Soft Border** | `#DEE3D8` | Garis tepi (*outline/divider*) halus antar kartu dan pemisah jam. |
| **Soft Red/Error** | `#A83030` (`#FFE4E0`) | Status pembatalan, bentrok waktu, dan aksi destruktif. |

### 1.2 Geometri & Bentuk (*Soft & Friendly*)
* **Corner Radius Hero**: `28dp – 32dp` (kartu hero sangat melengkung ramah).
* **Corner Radius Kartu Konten**: `20dp – 24dp` (kartu isi lembut).
* **Corner Radius Tombol & Chip**: `16dp – 20dp` / Full Pill `999dp`.
* **Ikonografi Lucu (*Chubby Stroke*)**: Menggunakan garis tebal `strokeWidth = 2.4 – 3.0` agar ikon tampak montok dan bersahabat.

---

## 2. Bedah Detail Layar per Layar (*Screen-by-Screen Architecture*)

---

### LAYAR 1: Hari Ini (`TodayFocusScreen`) — Rute: `/(tabs)/index`
> **Tujuan Layar**: Pusat komando harian pengguna. Menjawab pertanyaan: *"Apa satu hal terpenting yang perlu saya tuntaskan hari ini, kapan jadwal berikutnya, dan bagaimana progres fokus saya?"*

#### A. Arsitektur Komponen (Urutan dari Atas ke Bawah):
1. **Top Bar Header**:
   - Tanggal lokal Indonesia berukuran sedang di atas (contoh: *"Rabu, 4 November"* — warna Muted Slate).
   - Judul utama tebal: `"Hari Ini."` (28pt, Charcoal).
   - Tombol Aksi Kanan: Tombol Pengaturan `Settings2` 🎛️ berlatar putih bulat (48x48dp) menuju halaman Settings.
2. **Hero Card Utama (Dark Petrol `#173C36`)**:
   - *Eyebrow Tag*: Teks kecil Citron kapital (`RUANG UNTUK YANG PENTING` atau `SESI SEDANG BERJALAN`).
   - *Headline*: Teks putih besar `"Satu langkah lebih dekat."` atau angka countdown timer (`24:59`).
   - *Subtext*: Tugas aktif yang sedang dijalankan atau kalimat motivasi tenang.
   - *CTA Button (Citron `#D5F478`)*: Tombol pil tebal dengan ikon `ArrowUpRight` bertuliskan `"Buka timer fokus"` atau `"Pilih prioritas"`.
3. **Card "Agenda Berikutnya" (Realtime Commitment Banner)**:
   - Muncul otomatis jika ada jadwal kuliah/kerja terdekat hari ini.
   - Badge mini: Ikon `CalendarHeart` 🗓️❤️ + teks `"AGENDA BERIKUTNYA"`.
   - Judul jadwal (contoh: *"Kecerdasan Buatan"*), waktu (`08:00 – 10:00`), dan lokasi/ruangan.
   - Panah interaktif ke halaman Agenda.
4. **Metrik Harian (2 Kotak Berdampingan)**:
   - *Kotak Kiri (Sage `#DDEDE5`)*: Angka besar `X / Y` + label *"prioritas aktif selesai"*.
   - *Kotak Kanan (Peach `#FFE3D5`)*: Angka besar `XX mnt` + label *"waktu fokus tercatat"*.
5. **Daftar Prioritas ("Yang penting hari ini")**:
   - Header seksi: Judul + tombol teks `"+ Tambah"` (maksimal 5 prioritas per hari agar tidak *overwhelmed*).
   - *Kartu Tugas Prioritas*:
     - Checkbox bulat besar (warna Deep Teal saat dicentang, mencoret teks tugas secara memuaskan).
     - Judul tugas + badge label asal proyek/target.
     - Tombol cepat play `Play` untuk langsung menyalakan timer fokus pada tugas ini.
     - Tombol hapus tugas dari hari ini jika batal.
   - *Empty State* (jika belum ada prioritas): Kartu bersahabat bertuliskan *"Mulai dari satu langkah"* dengan tombol *"Pilih prioritas"*.
6. **Mindful Quote / Bottom Note**:
   - Ikon Play dengan pesan tenang: *"Rencana boleh disesuaikan. Fokus pada langkah yang masuk akal untukmu hari ini."*

---

### LAYAR 2: Target Hidup (`TargetListScreen`) — Rute: `/(tabs)/targets`
> **Tujuan Layar**: Tempat merawat tujuan hidup jangka menengah/panjang (contoh: *"Menjadi AI Engineer"*, *"Skripsi Selesai"*, *"Kemandirian Finansial"*).

#### A. Arsitektur Komponen:
1. **Top Bar Header**:
   - Subtitle: *"Untuk hidup yang kamu pilih"*.
   - Judul utama: `"Target Hidup."`.
   - Tombol Aksi Kanan: Tombol Pill `"+ Target"` untuk membuka modal pembuatan target baru.
2. **Filter Kategori Horizontal (Chips Bar)**:
   - Baris geser mendatar: `[Semua]`, `[Karier]`, `[Pendidikan]`, `[Kesehatan]`, `[Keuangan]`, `[Pribadi]`.
   - Chip aktif berwarna Deep Teal dengan teks putih; chip tidak aktif berwarna putih bergaris tepi halus.
3. **Card Ringkasan Progres Rencana (Sage Green `#DDEDE5`)**:
   - Menampilkan agregat rencana: *"Semua kategori · X target"*.
   - Angka persentase besar `XX%` + teks *"XX dari YY tugas rencana selesai"*.
   - Progress bar horizontal ramping.
   - Penjelasan transparan: mengukur progres tugas rencana, bukan klaim instan atas keahlian.
4. **Daftar Kartu Target (`TargetCard`)**:
   - Setiap kartu merepresentasikan satu target hidup:
     - Tag Kategori di pojok atas (dengan warna lembut sesuai kategori).
     - Judul Target tebal (contoh: *"Lulus Cumlaude Skripsi AI"*).
     - Deskripsi singkat atau *why statement* (alasan pentingnya target ini).
     - Progres bar + indikator ringkas: *"3/12 tugas • 4 tahapan"*.
     - Aksi sentuh untuk membuka Layar Detail Target.
5. **Empty State**:
   - Menampilkan ikon `Sprout` 🌱 lucu berukuran 36dp + ilustrasi ajakan membuat target pertama.

---

### LAYAR 3: Detail Target & Roadmap Tahapan (`TargetDetailScreen`) — Rute: `/targets/[id]`
> **Tujuan Layar**: Memecah satu tujuan besar menjadi fase/tahapan nyata (*roadmap*) dan tugas-tugas konkret.

#### A. Arsitektur Komponen:
1. **Top Navigation Bar**:
   - Tombol Kembali (`ArrowLeft`).
   - Judul target (terpotong rapi dengan ellipsis jika panjang).
   - Tombol Hapus Target (`Trash2` warna merah lembut dengan dialog konfirmasi aman).
2. **Target Header Profile**:
   - Pill nama kategori.
   - Judul Target besar & deskripsi lengkap.
3. **Statistik Dua Kolom**:
   - Kolom 1 (Sage): Persentase progres tugas + progress bar mini.
   - Kolom 2 (White Elevated): Rasio tugas selesai (`X/Y`) + total estimasi jam kerja.
4. **Section "Tahapan Target" (Roadmap)**:
   - Header seksi: Teks *"Tahapan Target"* + tombol `"+ Tambah Tahap"`.
   - *Kartu Tahapan (`StageCard`)* bertingkat:
     - Nomor urut tahap (contoh: *"Tahap 1: Proposal & Kajian Literatur"*).
     - Tombol reorder naik/turun (`ChevronUp`, `ChevronDown`).
     - Sub-daftar checklist tugas di dalam tahap tersebut.
     - Setiap tugas memiliki status (Pending, In Progress, Selesai) dan estimasi jam.
     - Tombol cepat `"+ Tambah Tugas"` langsung di bawah masing-masing tahap.

---

### LAYAR 4: Proyek & Portofolio (`ProjectListScreen`) — Rute: `/(tabs)/projects`
> **Tujuan Layar**: Mengelola hasil kerja nyata (*deliverables*) yang memiliki batasan waktu atau output konkret (contoh: *"Aplikasi Mobile MyLife"*, *"Desain UI Dashboard"*).

#### A. Arsitektur Komponen:
1. **Top Bar Header**:
   - Subtitle: *"Ide menjadi sesuatu yang nyata"*.
   - Judul: `"Proyek."`.
   - Tombol Aksi: `"+ Proyek"` (membuka modal buat proyek baru).
2. **Hero Banner Kreatif (Peach `#FFE3D5`)**:
   - Eyebrow: `RUANG UNTUK BERKARYA`.
   - Headline: *"Bangun sesuatu, selangkah demi selangkah."*.
   - Rangkuman: Jumlah proyek aktif dan perbandingan tugas selesai.
3. **Filter Status Proyek (Horizontal Chips)**:
   - `[Semua]`, `[Aktif]`, `[Rencana]`, `[Ditunda]`, `[Selesai]`.
4. **Daftar Kartu Proyek (`ProjectCard`)**:
   - Badge status: Pill warna ramah (Hijau untuk Aktif, Kuning untuk Rencana, Abu untuk Ditunda).
   - Judul Proyek + asosiasi Target Hidup terkait (misalnya *"Terkait target: Menjadi AI Engineer"*).
   - Output / Hasil yang ingin dicapai.
   - Progress bar pengerjaan tugas proyek.
5. **Empty State**:
   - Menampilkan ikon `Shapes` 🔷 berukuran 36dp dan tombol *"Buat proyek"*.

---

### LAYAR 5: Detail Proyek (`ProjectDetailScreen`) — Rute: `/projects/[id]`
> **Tujuan Layar**: Ruang eksekusi proyek dengan rincian deliverable, status lifecycle, dan daftar milestone pekerjaan.

#### A. Arsitektur Komponen:
1. **Top Bar**: Tombol kembali, judul proyek, tombol edit status / hapus.
2. **Info Card Deliverable**: Penjelasan luaran konkret yang sedang dibangun.
3. **Status Selector**: Pengubah status instan (`Aktif` $\leftrightarrow$ `Selesai` $\leftrightarrow$ `Ditunda`).
4. **Breakdown Task & Checklist**: Daftar tugas terstruktur dengan estimasi waktu dan opsi memasukkan tugas ke *"Hari Ini"*.

---

### LAYAR 6: Agenda & Ritme Keseharian (`AgendaScreen`) — Rute: `/(tabs)/agenda`
> **Tujuan Layar**: Mengintegrasikan jadwal komitmen mutlak mingguan (seperti KRS Kuliah / Jadwal Kerja Shift) dengan ritme rutinitas keseharian (bangun subuh, workout, sarapan) dalam satu tampilan waktu yang rapi.

#### A. Arsitektur Komponen:
1. **Top Bar & Segment Mode Switcher**:
   - Judul: `"Agenda."`.
   - Tombol toggle 2 mode di atas layar:
     - Mode 1: **"Hari Ini & Tanggal" (DAILY)** — Tampilan harian realtime.
     - Mode 2: **"Master Mingguan (KRS)" (WEEKLY_MASTER)** — Template jadwal mutlak Senin s/d Minggu.
2. **Konten Mode DAILY (Tampilan Hari Ini)**:
   - **Date Strip Header**: Kalender geser horizontal 7 hari dengan indikator tanggal aktif, hari ini (*Today pill*), dan pemilih bulan/tahun.
   - **Filter Cepat Timeline**:
     - `[Semua]`, `[Komitmen]` (Kuliah/Kerja), `[Ritme]` (Rutinitas Keseharian).
   - **Card "Ritme Keseharian" (`DailyRoutineChecklist`)**:
     - Desain ramah yang bisa dilipat (*collapsible*).
     - Header: Ikon `Sparkles` ✨ + Teks *"Ritme Keseharian"* + badge progress *"3/5 selesai"*.
     - Isi: Checklist rutinitas harian cepat (Bangun 05:00, Olahraga 08:00, Sarapan 09:00, dll.).
     - Fitur: Ceklis cepat, tombol skip ("Lewati hari ini").
   - **Timeline Jadwal Berwaktu (Timeline Visual)**:
     - Garis vertikal di sisi kiri dengan label jam (contoh: `08:00`, `10:00`, `14:00`).
     - *Event Cards*:
       - Judul kegiatan (contoh: *"Kuliah Pemrograman Mobile"*).
       - Badge Kategori dengan ikon lucu (`GraduationCap` 🎓 untuk Kuliah, `Briefcase` 💼 untuk Kerja, `Heart` ❤️ untuk Pribadi).
       - Waktu mulai & selesai + lokasi/ruang kelas.
       - Indikator bentrok (peringatan merah lembut jika ada dua kegiatan di jam yang sama).
       - Tombol aksi harian: *"Selesai"* atau *"Libur / Batalkan khusus hari ini"*.
   - **Tombol Tambah Agenda (+)**: Membuka modal tambah agenda cepat.
3. **Konten Mode WEEKLY_MASTER (Pengaturan Template KRS/Mingguan)**:
   - Tab Pemilih Hari: `[Sen]` `[Sel]` `[Rab]` `[Kam]` `[Jum]` `[Sab]` `[Min]`.
   - Daftar jadwal rutin di hari terpilih.
   - Form pembuatan jadwal berulang: Judul, tipe (Kuliah/Kerja/Rutinitas), hari berlaku (bisa multi-select seperti *"Setiap Hari"* atau *"Hari Kerja"*), jam mulai/selesai, ruangan/lokasi.

---

### LAYAR 7: Modal Tambah Cepat (`QuickAddScreen`) — Rute: `/quick-add`
> **Tujuan Layar**: Antarmuka sentuhan cepat dari tombol Floating Action Button (+) di tengah navigasi bawah.

#### A. Arsitektur Komponen:
1. **Header Modal**: Judul *"Tambah Cepat"* + Tombol Tutup Silang.
2. **Grid / Selector 4 Kategori (Ikon Lucu & Ramah)**:
   - Tombol 1: `Sparkles` ✨ **"Prioritas Hari Ini"** — Tugas kilat untuk hari ini.
   - Tombol 2: `Sprout` 🌱 **"Target Hidup"** — Cita-cita baru.
   - Tombol 3: `Shapes` 🔷 **"Proyek Baru"** — Hasil karya baru.
   - Tombol 4: `CalendarHeart` 🗓️❤️ **"Agenda / Jadwal"** — Kegiatan baru di kalender.
3. **Dynamic Form Container**:
   - Input teks judul dengan border halus dan placeholder ramah.
   - Pemilih waktu / kategori relevan.
   - Tombol Simpan (Deep Teal `#125B50`) di bagian bawah yang mudah dijangkau jempol.

---

### LAYAR 8: Pengaturan (`SettingsScreen`) — Rute: `/settings`
> **Tujuan Layar**: Pengelolaan preferensi personal, kategori, sesi fokus, serta cadangan data offline-first.

#### A. Arsitektur Komponen:
1. **Top Bar**: Tombol kembali + Judul *"Pengaturan"*.
2. **Grup 1: Organisasi & Kategori**:
   - Baris menu `Palette` 🎨 **"Kategori Target"**: Menampilkan palet warna dan nama-nama kategori.
3. **Grup 2: Sesi Fokus & Timer**:
   - Baris switch `Sun` ☀️ **"Layar Tetap Menyala"**: Menjaga layar tidak mati saat timer fokus aktif.
   - Baris opsi `Coffee` ☕ **"Durasi Pomodoro"**: Pemilih menit santai (15, 25, 45, 60 menit).
   - Baris opsi `Flame` 🔥 **"Durasi Deep Flow"**: Pemilih menit intensif (60, 90, 120 menit).
   - Baris switch `Vibrate` 📳 **"Getaran Selesai"**: Feedback haptik saat waktu habis.
4. **Grup 3: Keamanan & Cadangan Data (Offline-First)**:
   - Baris `Download` 📥 **"Ekspor Cadangan"**: Menyimpan file backup SQLite/JSON aman ke memori HP.
   - Baris `ShieldCheck` 🛡️ **"Pulihkan Data"**: Mengembalikan data dari file backup tanpa server luar.
5. **Grup 4: Info Aplikasi**:
   - Versi aplikasi: `1.0.0 (Botanical Edition)`.
   - Filosofi: *"MyLife — Ruang pribadi untuk merawat hidup yang kamu pilih."*

---

## 3. Komponen Mengambang Tetap (*Persistent Global Bar*)

### Bottom Navigation Bar (Bilah Navigasi Bawah)
- Latar belakang: Pure White `#FFFFFF` dengan garis batas atas halus `#DEE3D8` dan bayangan lembut.
- 4 Tab Utama + 1 FAB Tengah:
  1. **Hari Ini**: Ikon `Sparkles` ✨
  2. **Target**: Ikon `Sprout` 🌱
  3. **FAB Tengah**: Lingkaran Deep Teal `#125B50` berukuran 56x56dp dengan ikon `Plus` ➕ putih tebal (`strokeWidth={3}`).
  4. **Proyek**: Ikon `Shapes` 🔷
  5. **Agenda**: Ikon `CalendarHeart` 🗓️❤️
- Indikator Tab Terpilih: Ikon dan label berwarna Deep Teal `#125B50` dengan titik aksen Citron kecil di bawahnya.

