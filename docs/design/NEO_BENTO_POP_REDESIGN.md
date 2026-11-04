# MyLife UI/UX Redesign Blueprint — Neo-Bento Pop (Bold & Interactive)

> **Dokumen Resmi Redesain Aplikasi MyLife**
> **Arsitek & Desainer UI/UX**: App UI Designer & Mobile Systems Engineer
> **Inspirasi Referensi**: Vibrant Playful Bento, 3D Claymorphism, Floating Island Navigation, and Neo-Memphis Micro-Interactions.

---

## 1. Filosofi Desain: "Neo-Bento Pop"

Mengacu langsung pada referensi visual yang diberikan, desain baru MyLife bertransformasi dari sekadar minimalis tenang menjadi **Bold, Playful, Tactile, and Ultra-Interactive**. Desain ini dirancang agar setiap interaksi terasa hidup, memuaskan (*satisfying*), dan memberi dorongan dopamin produktivitas yang menyenangkan.

### Pilar Utama Desain Baru:
1. **Bento Grid Asimetris & Berani**: Tata letak kotak bento dengan warna-warna kontras tinggi yang berani (*bold color blocking*), sudut sangat membulat (*radius 24–32dp*), dan hierarki visual yang tegas.
2. **Floating Island Navigation Dock**: Bilah navigasi bawah melayang (*floating pill*) berwarna gelap obsidian dengan indikator aktif kapsul putih kontras tinggi dan efek kedalaman.
3. **Capsule Date Strip (Kapsul Kalender Vertikal)**: Penampil hari vertikal berbentuk kapsul pil dengan bintang penanda, di mana hari terpilih bertransformasi menjadi kapsul hitam pekat kontras tinggi (*inverted obsidian pill*).
4. **Circular Action Anchors (`→`)**: Setiap kartu aksi utama memiliki tombol bulat berpanah yang jelas dan memikat untuk disentuh.
5. **Tactile Micro-Interactions**: Transisi pegas (*spring animation*), feedback haptik saat mencentang tugas, dan progress kapsul dua warna.

---

## 2. Palet Warna Baru: *Bold Vibrant Bento Spectrum*

| Nama Token | Kode HEX | Peran & Penggunaan Visual |
| :--- | :--- | :--- |
| **Canvas Background** | `#F8F7FC` | Latar belakang ultra-halus bernuansa marshmallow lavender (bukan putih polos datar, memberikan kontras mewah ke kartu). |
| **Surface White** | `#FFFFFF` | Permukaan kartu terang, popup modal, dan field input. |
| **Obsidian Dark** | `#161722` | Warna jangkar kontras tinggi: Floating Tab Bar Dock, Kapsul Tanggal Aktif, Kartu Proyek Khusus. |
| **Electric Lilac** | `#9E86FF` | Hero Card utama ("Fokus Hari Ini" / "Daily Challenge"), tombol CTA sekunder, elemen magis. |
| **Solar Tangerine** | `#FFA834` | Kartu Komitmen / Agenda Terdekat ("Yoga / Kuliah"), kartu metrik energi, highlight penting. |
| **Hot Coral Pink** | `#FF4582` | Aksi cepat, penanda batas waktu, badge notifikasi (seperti bel `1`), dan FAB. |
| **Fresh Mint** | `#2DD4BF` | Indikator progres sukses, checklist rutinitas selesai, kapsul pencapaian target. |
| **Soft Sky Blue** | `#82B1FF` | Kartu proyek kreatif, kategori studi, dan timeline penyeimbang. |
| **Lemon Glow** | `#FFE066` | Bintang indikator aktif (`⭐`), badge pencapaian, dan bintang kapsul hari. |
| **Deep Charcoal Text** | `#1A1C23` | Tipografi judul tebal dengan keterbacaan sempurna. |
| **Muted Slate Text** | `#64748B` | Teks sekunder, deskripsi tugas, jam, dan metadata. |
| **Pill Container Soft** | `#F1F0F7` | Latar kapsul tanggal non-aktif dan tag kategori. |

---

## 3. Komponen Interaktif Unggulan (*Interactive UI Components*)

### 3.1 Floating Island Bottom Dock (Bilah Navigasi Melayang)
* **Visual**: Kapsul melayang rounded penuh (`borderRadius: 999`), melayang di atas tepi bawah layar dengan `marginHorizontal: 20` dan bayangan lembut (*elevation 12* / *box-shadow: 0 10px 25px rgba(22, 23, 34, 0.15)*).
* **Warna Dock**: Solid Obsidian Dark `#161722`.
* **Tab Aktif**: Memiliki latar belakang kapsul putih bulat (`#FFFFFF`) di mana ikon di dalamnya menjadi hitam pekat `#161722`.
* **Tombol Tengah (Quick Add FAB)**: Tombol lingkaran empuk dengan aksen Hot Coral Pink `#FF4582` atau Lemon Glow `#FFE066` dengan ikon tambah tebal.
* **Interaktivitas**: Animasi pergeseran halus (*spring slide*) saat pengguna berpindah tab, disertai getaran halus haptik (*haptic selection*).

### 3.2 Capsule Date Strip (Strip Kalender Kapsul 7 Hari)
* **Bentuk**: 7 kapsul vertikal ramping (`width: 48dp`, `height: 84dp`, `borderRadius: 24dp`).
* **State Normal (Non-aktif)**:
  * Latar: Putih bersih `#FFFFFF` dengan border halus `#E2E8F0`.
  * Atas: Bintang abu-abu kecil (`⭐`).
  * Tengah: Singkatan hari (`Sen`, `Sel`, `Rab`).
  * Bawah: Angka tanggal tebal (`23`, `24`).
* **State Terpilih (Active Inversion)**:
  * Latar: Solid Obsidian Dark `#161722` (hitam pekat memukau seperti di referensi!).
  * Atas: Bintang emas bercahaya (`⭐` Lemon Glow).
  * Teks: Putih bersih kontras tinggi `#FFFFFF`.
  * Elevasi: Sedikit membesar (scale `1.05`) dengan shadow elegan.

### 3.3 Hero Bento Card ("Daily Focus / Challenge")
* **Latar**: Electric Lilac `#9E86FF`.
* **Elemen**:
  * Tag kecil: *"FOKUS HARI INI"* dengan teks hitam/putih kontras.
  * Headline Tebal: *"Satu Langkah Lebih Dekat."* (Font Plus Jakarta Sans 700 / 26pt).
  * Subtitle: *"Tuntaskan 3 prioritas sebelum pukul 17:00."*
  * Aksesori Visual: Ilustrasi 3D bintang/bunga pop claymorphism di pojok kanan kartu.
  * Tombol Aksi: Lingkaran gelap atau Citron dengan ikon panah circular `→` yang memicu timer fokus saat ditekan.

### 3.4 Split Bento Plan Cards ("Your Plan / Agenda Realtime")
Dua kartu berdampingan dengan ukuran asimetris yang dinamis:
* **Kartu 1: Solar Tangerine (`#FFA834`) — "Agenda Berikutnya"**:
  * Badge atas: `Kuliah / Kerja` (tag pill putih).
  * Judul jadwal besar: *"Kecerdasan Buatan"*.
  * Waktu & Ruangan: `08:00 – 10:00 • Lab Komputer A5`.
  * Ikon 3D Bel Lilac dengan badge notifikasi merah muda `(1)`.
  * Footer: Avatar/Pengajar *"Dosen Pembimbing"* + tombol aksi sentuh.
* **Kartu 2: Electric Lilac (`#9E86FF`) / Sky Blue (`#82B1FF`) — "Ritme Keseharian"**:
  * Badge atas: `Rutinitas Harian`.
  * Progress: `3/5 Selesai`.
  * Ikon 3D spiral / sparkles.
  * Quick tap untuk membuka checklist harian.

### 3.5 Chunky Interactive Checklist ("Yang Penting Hari Ini")
* Setiap kartu prioritas berlatar putih bersih dengan radius `20dp`.
* **Checkbox**: Kotak bulat besar (28x28dp) dengan border tebal.
* **Saat Ditekan**:
  * Checkbox bertransformasi menjadi warna Fresh Mint `#2DD4BF` dengan tanda centang putih.
  * Teks tugas diberi efek coret lembut (*strikethrough*) dengan transisi opacity.
  * Efek haptik getaran sukses berbobot medium (*Haptics.notificationAsync*).
* Tombol play timer fokus di sisi kanan kartu berbentuk lingkaran mungil hitam dengan ikon play putih.

---

## 4. Transformasi Layar per Layar (*Screen Blueprints*)

### Layar 1: Hari Ini (`TodayFocusScreen`)
1. **Header Profil & Tanggal**:
   - Kiri: Avatar bulat lucu dengan sapaan *"Halo, Teman! ✨"* dan tanggal hari ini.
   - Kanan: Tombol lonceng notifikasi / Settings bulat (`48x48dp`).
2. **Hero Bento Card (Electric Lilac `#9E86FF`)**:
   - Menampilkan status fokus harian / tantangan hari ini, countdown timer, dan tombol panah `→`.
3. **Capsule Date Strip**:
   - 7 kapsul hari vertikal dengan seleksi inverted Obsidian Dark.
4. **Section "Your Plan" (Bento Split)**:
   - Kartu Tangerine Agenda Terdekat + Kartu Sky Blue Metrik Fokus.
5. **Section "Prioritas Hari Ini"**:
   - Checklist interaktif berani dengan aksi play timer langsung di kartu.

### Layar 2: Agenda & Ritme Keseharian (`AgendaScreen`)
1. **Top Segmented Pill**: Toggle antara `[Hari Ini]` dan `[Jadwal Mingguan / KRS]`.
2. **Date Capsule Strip**: Navigasi 7 hari interaktif di bagian atas.
3. **Bento Card Ritme Keseharian**: Kartu pop-out dengan progress kapsul dua warna (misal: 60% terisi mint, 40% peach).
4. **Timeline Berwaktu**: Kartu-kartu kegiatan berwaktu dengan warna berbeda per kategori:
   - Kuliah: Tangerine `#FFA834`
   - Kerja: Obsidian Dark `#161722` dengan aksen putih
   - Belajar: Electric Lilac `#9E86FF`
   - Pribadi: Hot Coral `#FF4582`

### Layar 3: Target Hidup & Roadmap (`TargetListScreen`)
1. **Category Pills**: Kapsul kategori horizontal (`Karier`, `Pendidikan`, `Kesehatan`, `Finansial`) dengan ikon lucu.
2. **Bento Cards Target**: Setiap target tampil seperti kartu mata pelajaran di referensi (Image 2 Screen 2):
   - Banner warna-warni dengan ilustrasi toga/piala.
   - Rasio pencapaian: `12 Tahap • 43 Tugas`.
   - Tombol panah melingkar `→` di pojok kanan bawah kartu.

### Layar 4: Proyek & Portofolio (`ProjectListScreen`)
1. **Hero Banner Karya**: Kartu Tangerine dengan headline *"Bangun Sesuatu yang Nyata"*.
2. **Status Pills**: `Semua`, `Aktif`, `Rencana`, `Selesai`.
3. **Project Bento Cards**: Kartu bergaya Neo-Memphis dengan progress kapsul vertikal bergaris (*striped capsule bar chart*) seperti di Image 2 Screen 3!

---

## 5. Rencana Arsitektur & Eksekusi Komponen

1. **Update Theme Tokens**:
   - Perbarui [src/theme/colors.ts](file:///d:/IT/Software%20Engineer/mobile/MyLife/src/theme/colors.ts) dengan warna bold bento baru tanpa merusak nama semantic token yang sudah dipakai.
2. **Floating Island Navigation**:
   - Modifikasi [src/app/(tabs)/_layout.tsx](file:///d:/IT/Software%20Engineer/mobile/MyLife/src/app/(tabs)/_layout.tsx) untuk merender custom floating tab bar dengan elevated capsule container.
3. **Date Capsule Component**:
   - Buat komponen `DateCapsuleStrip` di `src/features/agenda/presentation/components/date-capsule-strip.tsx`.
4. **Bento Cards & Micro-interactions**:
   - Perbarui kartu di Today Focus dan Agenda untuk menampilkan layout bento kontras tinggi dengan aksen circular button `→` dan haptic feedback.

