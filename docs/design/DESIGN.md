# DESIGN.md — Panduan UI & UX Aplikasi Mobile (Produktivitas / Tracker)

> Spesifikasi desain historis. Redesign berikutnya mengikuti [DESIGN_V2.md](./DESIGN_V2.md) dan [PRD_V2.md](./PRD_V2.md). Tema runtime masih lama; klaim riset/verifikasi dokumen ini tidak otomatis berlaku pada seluruh komponen saat ini.

> **Versi 1.0 · 23 Oktober 2026**
> **Platform:** Android saja · **Framework:** React Native (Expo) · **Tema:** Light saja · **Bahasa UI:** Bahasa Indonesia
> **Basis desain:** lebar layar **360 dp** · **Sistem:** Material Design 3 yang di-*tune* (bukan M3 bawaan)

---

## 0. Cara memakai dokumen ini

Dokumen ini adalah **satu-satunya sumber kebenaran** untuk tampilan dan perilaku antarmuka. Ia ditulis untuk dua pembaca: kamu (pengembang) dan AI agent yang menulis kode UI.

**Mengapa UI buatan AI agent biasanya "slop, tidak konsisten, berantakan"?** Karena tanpa batasan, agent menebak nilai baru di setiap layar: `padding: 14` di sini, `#6a5acd` di sana, tombol 44 dp di satu layar dan 52 dp di layar lain. Obatnya bukan "minta agent lebih rapi", melainkan **menghapus ruang untuk menebak**: setiap nilai sudah ada namanya (token), setiap komponen sudah ada spesifikasinya, dan ada daftar larangan serta daftar periksa yang bisa dicentang.

**Lima aturan emas** (kalau hanya sempat membaca satu bagian, baca ini):

1. **Tidak ada angka atau warna mentah di kode layar.** Semua datang dari `src/theme/` (Bagian 12). Nilai di luar token = bug.
2. **Hanya pakai komponen di Bagian 7.** Butuh komponen baru? Tambahkan spesifikasinya ke dokumen ini dulu, baru bangun.
3. **Ukuran tap minimum 48×48 dp, jarak antar target minimal 8 dp.** Tidak ada pengecualian untuk "supaya muat".
4. **Warna tidak pernah menjadi satu-satunya penanda.** Status/pilihan selalu disertai ikon atau teks.
5. **Satu aksi utama per layar**, diletakkan di zona jempol (Bagian 9), dengan gaya tombol *filled*.

### 0.1 Legenda tingkat bukti

Kamu meminta dokumen berbasis data, bukan kesimpulan asal. Maka setiap angka penting diberi label:

| Label | Arti | Seberapa boleh diubah |
|---|---|---|
| **[V]** | **Terverifikasi.** Saya membuka sumbernya pada sesi ini, atau menghitung/mengujinya sendiri dengan skrip. Nomor sumber `[S#]` merujuk ke Bagian 16. | Jangan diubah tanpa alasan kuat. |
| **[C]** | **Konvensi.** Angka standar Material 3/Android yang saya dapat dari cermin dokumentasi (repo komponen, library port) atau pengetahuan saya, **tetapi tidak bisa saya verifikasi dari halaman resmi** karena `m3.material.io` hanya dirender dengan JavaScript dan tidak terbaca alat saya. | Aman dipakai; cocokkan visual di perangkat nyata. |
| **[D]** | **Keputusan desain.** Pilihan saya, disertai alasan. Ini bukan fakta, melainkan penilaian. | Boleh diubah, **tapi ubah di token, bukan per layar**. |

> **Catatan kejujuran.** Dokumen PRD kamu **tidak terlampir** pada percakapan ini. Karena itu daftar layar, istilah domain, dan alur di dokumen ini bersifat **generik untuk aplikasi tracker**. Sistem desain (token, komponen, aturan) tidak bergantung pada PRD dan tetap berlaku; yang perlu dicocokkan dengan PRD hanya Bagian 8 (template layar) dan contoh teks di Bagian 14.

### 0.2 Lembar contekan (nilai kunci)

| Aspek | Nilai | Bukti |
|---|---|---|
| Font | **Plus Jakarta Sans** statis 400 / 500 / 600 / 700 | [D] + [V] fitur dicek (Bagian 4.2) |
| Ukuran teks | 36 / 28 / 24 / 22 / 16 / 14 / 12 / 11 sp (12 peran) | [V] ukuran, [C] line-height |
| Warna merek | `primary` **#4C4DCC** (HCT hue 285, chroma 64, tone 40) | [D] + [V] kontras dihitung |
| Latar layar | `surface` `#FCF8FD` | [V] kontras dihitung |
| Skala spasi | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 dp (kelipatan 4) | [C] |
| Margin layar | **16 dp** kiri-kanan | [C] |
| Radius | 4 · 8 · 12 · 16 · 28 · penuh | [C] |
| Target tap | **≥ 48×48 dp**, jarak ≥ 8 dp | [V] [S1] |
| Tinggi komponen | Tombol 48 (CTA 56, compact 40) · Field 56 · Top bar 64 · Nav bar 80 · FAB 56 · Chip 40 · Ikon 24 | [C]/[D] |
| Gerak | 100 / 200 / 300 / 400 ms; easing `standard` | [C] |
| Lebar uji | Basis 360 dp; uji 320, 360, 384, 412 dp | [V] [S19] |
| Skala font OS | Uji sampai **200%** | [V] [S3] |

---

## 1. Temuan riset & audit (dasar data)

Bagian ini merangkum data yang menjadi fondasi keputusan di bagian lain, termasuk **koreksi** terhadap asumsi yang umum dipercaya.

### 1.1 Data yang diverifikasi

| # | Temuan | Angka | Dampak pada desain | Sumber |
|---|---|---|---|---|
| 1 | Ukuran target sentuh minimum Android | **48×48 dp** (≈ 9 mm); kisaran yang dianjurkan 7–10 mm; target dipisah ≥ **8 dp** | Semua kontrol interaktif ≥ 48 dp | [S1] |
| 2 | WCAG 2.2 SC 2.5.8 (AA) | Target ≥ **24×24 CSS px**, kecuali ada pengecualian jarak/setara/inline | 48 dp kita jauh di atas batas AA | [S4] |
| 3 | WCAG 2.2 SC 1.4.11 (AA) | Komponen UI & grafik penting ≥ **3:1** terhadap warna sekitarnya; komponen *disabled* dikecualikan | Border field, ikon, progress ≥ 3:1 (diaudit di Bagian 3.6) | [S5] |
| 4 | Cara memegang ponsel (Hoober) | 1.333 pengamatan (Nov 2012–Jan 2013), 780 orang menyentuh layar: **49% satu tangan**, 36% digendong (*cradled*), 15% dua tangan. Pada satu tangan: **67% jempol kanan, 33% kiri** | Aksi utama di bawah; jangan hanya mengandalkan sudut kanan; sertakan tombol lebar-penuh yang netral tangan | [S2] |
| 5 | Navigasi tersembunyi vs terlihat | Navigasi tersembunyi dipakai di **57%** kasus (vs 86% navigasi kombinasi); penemuan turun **>20%**; tugas **15% lebih lambat** | Tab utama selalu terlihat (nav bar dengan label), bukan drawer/hamburger | [S9] |
| 6 | Font scaling Android 14+ | Dukungan sampai **200%**, kurva **nonlinear**; Google menyarankan uji pada 200% | Tinggi komponen memakai `minHeight`, bukan tinggi tetap; uji 200% | [S3] |
| 7 | Indikator progres | Umpan balik instan untuk setiap aksi; indikator untuk aksi **> ~1 dtk**; *looped* untuk **2–10 dtk**; *percent-done* untuk **≥ 10 dtk**; jangan teks "Loading…" statis; jangan "jangan klik lagi" | Aturan loading di Bagian 11.1 | [S6] |
| 8 | Dialog konfirmasi | Hanya untuk aksi serius/tak bisa dibatalkan; **jangan** untuk aksi rutin; tombol menyebut hasil ("Hapus berkas"/"Simpan berkas"), bukan "Yakin?"; **sediakan undo** | Hapus rutin = Snackbar + Urungkan; dialog hanya untuk hapus permanen/massal (Bagian 10.4) | [S8] |
| 9 | Error pada form | Pesan **di bawah/dekat field**; **jangan hanya warna**, tambah ikon; validasi **setelah pengguna selesai** mengisi field, bukan saat mengetik | Spesifikasi `TextField` (Bagian 7.7, 10.3) | [S10] |
| 10 | Label field | Label **terpisah dan selalu terlihat**; hindari label di dalam field (hilang saat mengetik); placeholder hanya untuk contoh format; *floating label* belum teruji menyeluruh | Label **di atas** field, bukan floating (Bagian 7.7) | [S11] |
| 11 | Tutorial di awal | Studi 70 pengguna/4 aplikasi iOS: sukses 91% (baca tutorial) vs 94% (lewati), **tidak ada beda nyata**; yang membaca menilai tugas **lebih sulit** (SEQ 4,92 vs 5,49). Rekomendasi: bantuan kontekstual | Onboarding minimal + petunjuk kontekstual (Bagian 11.3) | [S7] |
| 12 | Izin notifikasi Android 13+ | `POST_NOTIFICATIONS` runtime; notifikasi **mati secara default** pada instalasi baru; Google: minta setelah pengguna **memahami nilai aplikasi**, dipicu aksi pengguna (mis. tombol lonceng), atau menunggu peluncuran ke-3/4 | Izin diminta **dalam konteks** (Bagian 11.4) | [S12] |
| 13 | Prevalensi buta warna | ± **1 dari 12 pria** dan **1 dari 200 wanita** | Warna tidak boleh jadi penanda tunggal | [S24] |
| 14 | Resolusi layar ponsel Indonesia (StatCounter, **Sep 2026**) | 360×800 **8,94%**; 414×896 4,83%; 384×832 4,49%; 393×873 3,80%; 390×844 3,52%; 385×854 3,33% | Basis **360 dp**; uji 320–414 dp | [S19] |

### 1.2 Hasil pengujian saya sendiri (skrip, bisa diulang)

| Pengujian | Hasil |
|---|---|
| Rasio kontras dihitung dengan dua cara berbeda (rumus WCAG buatan sendiri vs pustaka `coloraide`) untuk 4 pasangan | **Selisih ≤ 0,0003** — rumus saya benar |
| Klaim "selisih tone HCT **40** ⇒ kontras ≥ 3:1" diuji pada 504 palet (72 hue × 7 chroma), semua pasangan tone berjarak 40 | **Terbukti**: kontras terburuk **3,152:1** |
| Klaim "selisih tone HCT **50** ⇒ kontras ≥ 4,5:1" diuji pada 504 palet yang sama, semua pasangan tone berjarak 50 | **Hampir benar, tetapi tidak mutlak**: kasus terburuk **4,455:1** (hue 270, chroma 16, tone 50 vs 100). Selisih **52** sudah aman (min 4,789:1); selisih **60** min 6,419:1 |
| Seluruh pasangan warna teks/UI di dokumen ini | **33 pasangan + 12 kombinasi state-layer, 0 gagal** (Bagian 3.6) |
| Fitur angka tabular di font terpilih | Plus Jakarta Sans memiliki fitur `tnum`; lebar digit proporsional 371–732 unit → **seragam 600 unit** dengan `tnum` (diukur dari berkas font) |
| Kroma merek vs bawaan Material 3 | Palet bawaan M3 (*TonalSpot*) memakai chroma **32**; merek kita **64** (2×). Versi "neon" pada hue/tone sama = chroma 80 — sengaja **tidak** dipakai |
| Warna kategori terhadap simulasi buta warna (protan/deutan/tritan) | 8 warna harmonis pada tone sama: selisih warna minimum (ΔE2000) hanya **2,1–3,4** → **tidak dapat dibedakan hanya dengan warna**. Karena itu aturan "ikon + label wajib" bersifat keras |

> **Implikasi praktis:** untuk teks di atas warna, jangan mengandalkan "selisih tone 50 pasti lolos". Pakai selisih ≥ 52 **dan** tetap verifikasi dengan skrip kontras. Itu yang saya lakukan di Bagian 3.6.

### 1.3 Koreksi atas asumsi umum (penting untuk AI agent)

| Asumsi umum | Kenyataan yang saya temukan |
|---|---|
| "Pakai `@expo/vector-icons`" | Expo **berencana** men-*deprecate*-nya (belum dihapus) dan menyarankan paket `@react-native-vector-icons/<paket-ikon>` (contoh terverifikasi: `@react-native-vector-icons/lucide`) [S16]. Proyek baru sebaiknya langsung memakai paket baru. |
| "Pakai `SafeAreaView` bawaan RN" | **Deprecated sejak RN 0.81**, tidak kompatibel dengan edge-to-edge Android; gunakan `react-native-safe-area-context` [S15]. Sejak Expo SDK 54 edge-to-edge **selalu aktif dan tak bisa dimatikan** [S14]. |
| "`fontVariant: ['tabular-nums']` hanya iOS" | Dokumen arsip RN menandainya iOS-only, tetapi dokumen RN terkini tidak memberi batasan platform dan PR resmi menyatakan dukungan Android sejak **RN 0.62** [S18]. Font harus punya fitur `tnum` (font kita punya). |
| "Variable font bisa dipakai di Expo" | Dukungan variable font di Android/iOS baru mulai **SDK 58+**; versi sebelumnya wajib **berkas statis per bobot** [S17]. Dokumen ini memakai berkas statis (berlaku di semua SDK). |
| "Pakai `expo@57.0.9`" | `expo@57.0.9` memperbaiki regresi memori Hermes V1 (reanimated/worklets), tetapi **`expo@57.0.17` adalah minimum teraman** karena juga memperbaiki regresi waktu *startup* dev [S13]. |
| "Bar navigasi M3 = 80 dp" | Benar untuk varian dasar; varian *flexible* (Expressive) = **64 dp** dengan indikator 56 dp [S22]. Dokumen ini memilih 80 dp (Bagian 7.4). |
| "State-layer focus = 8%" | Token Compose Material3 terbaru: hover **8%**, focus **10%**, pressed **10%**, dragged **16%** [S23]. Tabel lama (material-web) memakai 8/12/12/16. Kita ikut yang terbaru. |
| "Hoober membuktikan zona jempol kaku" | Datanya valid tetapi **berusia 13 tahun** (layar ±4"), ukuran sampel 780 penyentuh, tidak memberi ukuran target dalam mm. Pakai sebagai **arah**, bukan peta presisi (Bagian 9.1). |
| "NN/g mendukung skeleton screen" | Artikel NN/g tentang indikator progres **tidak membahas skeleton**. Dokumen ini tidak mengklaim bukti untuk skeleton; ia hanya opsi [D]. |

### 1.4 Yang TIDAK saya temukan datanya (agar tidak dianggap fakta)

- **Riset kuat tentang *streak* dan motivasi pada aplikasi pelacak kebiasaan.** Yang saya temukan hanya glosarium dan halaman toko aplikasi, bukan studi. Seluruh panduan *streak* di Bagian 11.5 adalah **keputusan desain [D]**.
- **Pedoman UX writing Bahasa Indonesia yang baku.** Sumber yang muncul hanya artikel jurnal umum dan lowongan kerja. Panduan nada "kamu" di Bagian 14 adalah **[D]**; pilih nada sesuai merek di PRD.
- **Nilai spesifikasi M3 dari halaman resmi.** Halaman resmi tidak terbaca (JavaScript). Tinggi komponen, line-height, dan durasi gerak berlabel **[C]** berasal dari cermin dokumentasi komponen Android, port library, dan pengetahuan saya.

---

## 2. Prinsip desain & aturan anti-*slop*

### 2.1 Tujuh prinsip

Aplikasi tracker dipakai **berulang kali setiap hari, sering sambil berdiri atau berjalan, dengan satu tangan**. Prinsip berikut diturunkan dari konteks itu [D]:

| # | Prinsip | Artinya dalam praktik |
|---|---|---|
| 1 | **Jelas sebelum cantik** | Kalau ada konflik antara "terlihat keren" dan "langsung dimengerti", pilih yang kedua. |
| 2 | **Satu hal utama per layar** | Satu aksi utama (tombol *filled*), satu hal yang dilihat pertama (angka/judul terbesar). Sisanya mundur secara visual. |
| 3 | **Konsistensi lewat token, bukan disiplin** | Kita tidak mengandalkan ingatan. Nilai ada di `src/theme/`; menyimpang = error lint/review (Bagian 13). |
| 4 | **Ramah satu tangan** | Aksi yang sering dilakukan berada di setengah bawah layar (Bagian 9). Aksi langka/berbahaya di atas atau butuh langkah ekstra. |
| 5 | **Tenang di sehari-hari, berani di momen penting** | 90% layar netral dan lapang; warna merek yang kuat dan aksen hangat dipakai untuk aksi utama dan momen pencapaian. |
| 6 | **Tidak menghukum** | Tidak ada teks yang menyalahkan, tidak ada warna merah untuk "belum dikerjakan". Terlewat satu hari ≠ kegagalan (Bagian 11.5). |
| 7 | **Responsif terasa instan** | Setiap sentuhan memberi umpan balik < 100 ms; tidak ada layar kosong tanpa penjelasan (Bagian 11.1). |

### 2.2 Komposisi warna 60 / 30 / 10 [D]

Aturan praktis agar warna "berani tapi tidak norak":

| Porsi luas layar | Warna | Contoh |
|---|---|---|
| ~ **60%** | Netral: `surface`, `surfaceContainer*` | Latar, kartu, daftar |
| ~ **30%** | Tonal: `primaryContainer`, `secondaryContainer`, teks `onSurface` | Chip terpilih, ikon-tile, indikator nav |
| ~ **10%** | Berani: `primary` (isi), `highlight` | Tombol utama, FAB, progress terisi, momen streak |

Konsekuensi: **maksimal satu elemen berwarna `primary` penuh yang besar per layar** (biasanya tombol utama atau kartu *hero*), dan **maksimal satu elemen `highlight`**.

### 2.3 Daftar larangan (penyebab utama UI "slop")

AI agent **dilarang**:

| # | Larangan | Alasan |
|---|---|---|
| L1 | Gradien, *glassmorphism*/blur, efek *glow*/neon | Tidak ada di sistem; mudah terlihat norak dan sulit dijaga kontrasnya. |
| L2 | Warna hex/rgb/hsl **mentah** di kode layar; opasitas teks buatan sendiri | Satu-satunya sumber warna: `colors.*`. Opasitas hanya lewat token state-layer/disabled. |
| L3 | Angka `padding`/`margin`/`gap`/`fontSize`/`borderRadius` mentah | Pakai `space`, `radius`, `type`. |
| L4 | Lebih dari **satu keluarga font**; memakai `fontWeight` bersama font kustom | Di RN, bobot dipilih lewat nama keluarga font (Bagian 4.2). |
| L5 | Emoji sebagai ikon UI/penanda status | Render berbeda antar perangkat, tidak bisa diwarnai, tidak aksesibel. Ikon dari satu paket saja (Bagian 6.5). |
| L6 | Bayangan buatan (`shadow*`) selain level elevasi di Bagian 6.2 | Bayangan acak = tanda khas tampilan AI. |
| L7 | Kartu di dalam kartu di dalam kartu (nesting > 1 tingkat) | Kebisingan visual; gunakan divider/spasi. |
| L8 | Teks **kapital semua** untuk label/tombol | Lebih sulit dibaca, terkesan berteriak; pakai *sentence case*. |
| L9 | Placeholder sebagai satu-satunya label field | Label hilang saat mengetik [S11]. |
| L10 | Navigasi utama berupa ikon tanpa label, atau drawer/hamburger untuk tab utama | Penemuan turun >20% dan tugas 15% lebih lambat [S9]. |
| L11 | Target sentuh < 48 dp atau jarak antar target < 8 dp | [S1]. |
| L12 | Status/pilihan yang dibedakan **hanya** dengan warna | 1 dari 12 pria buta warna [S24]; WCAG 1.4.1. |
| L13 | Teks < 12 sp (kecuali badge 11 sp), atau teks berkontras < 4,5:1 | Bagian 4 dan 3.6. |
| L14 | Animasi dekoratif > 400 ms atau yang menghalangi aksi | Bagian 6.3. |
| L15 | Menulis teks UI dalam Bahasa Inggris/campuran, atau memakai "Anda" di satu layar dan "kamu" di layar lain | Bagian 14. |
| L16 | Menambah warna/komponen/ukuran baru "karena kurang cocok" tanpa memperbarui dokumen ini | Perubahan sistem lewat dokumen, bukan lewat layar. |
| L17 | Teks rata tengah untuk lebih dari 2 baris | Sulit dibaca. Rata tengah hanya untuk judul pendek dan *empty state*. |
| L18 | Menyembunyikan aksi penting di balik gestur saja (swipe/long-press) | Harus ada jalur non-gestur (Bagian 10.2). |

---

## 3. Warna

### 3.1 Cara palet ini dibuat (dan mengapa "berani tapi tidak norak")

Palet **dihasilkan dengan Material Color Utilities (ruang warna HCT)**, bukan dipilih dengan mata, sehingga kontras bisa dijamin dan dihitung ulang kapan pun. HCT mengatur tiga hal terpisah: *hue* (corak), *chroma* (kejenuhan), *tone* (terang-gelap 0–100). Karena tone terkait langsung dengan luminans, kontras bisa dikontrol lewat selisih tone [S20].

| Palet | Hue | Chroma | Catatan |
|---|---|---|---|
| `primary` | **285** (indigo-ultramarine) | **64** | Merek. Tone 40 = `#4C4DCC` |
| `secondary` | 285 | 16 | Netral bernuansa merek |
| `tertiary` | 50 (jingga) | 72 | Aksen hangat; `highlight` = tone 75 |
| `neutral` | 285 | 4 | Latar/teks; sedikit bernuansa merek agar tidak "abu mati" |
| `neutralVariant` | 285 | 8 | Outline & teks sekunder |
| `error` | 25 | 84 | Merah (nilai standar M3) |
| `success` | 150 | 52 | Hijau |
| `warning` | 78 | 62 | Amber |

**Mengapa chroma 64?** [V] + [D]. Palet bawaan Material 3 (*TonalSpot*) memakai chroma **32** (terbaca dari pustaka `materialyoucolor`), yaitu warna yang kalem. Merek kita memakai **64 (dua kali lipat)** sehingga terlihat jauh lebih berani. Versi pada hue dan tone yang sama dengan chroma 80 menghasilkan `#413EF7` (biru-ungu menyala); menurut penilaian saya itu mulai terasa norak di layar terang, jadi chroma **sengaja ditahan di 64** (penilaian visual = [D]). Warna "berani" di sini berarti *jenuh dan percaya diri*, bukan *paling terang*.

**Mengapa hue indigo (285)?** [D]. Alasannya praktis, bukan psikologi warna (saya tidak menemukan data kuat yang membuktikan efek emosi per hue): (1) hue 285 berjarak jauh dari merah (error, 25), hijau (sukses, 150), dan amber (peringatan, 78), sehingga **merek tidak pernah dikira status**; (2) pada tone 40 ia sudah menghasilkan kontras 6,17:1 di atas `surface`, jadi bisa dipakai untuk teks tautan dan tombol tanpa trik tambahan; (3) ia netral gender/usia dan tidak bentrok dengan warna kategori buatan pengguna.

**Mengapa ada aksen hangat (`highlight`)?** [D]. Layar tracker yang semua-indigo terasa dingin. Satu aksen jingga hangat untuk momen kecil (streak aktif, pencapaian) memberi "percikan" dan menarik mata tepat di tempat yang kamu inginkan. Teks di atasnya **gelap** (`onHighlight`), karena jingga terang + teks putih tidak lolos kontras.

### 3.2 Token warna (nilai final)

| Token | Hex | Peran / kapan dipakai |
|---|---|---|
| `primary` | `#4C4DCC` | Brand utama: tombol utama, FAB, link, ikon/indikator aktif, progress terisi |
| `onPrimary` | `#FFFFFF` | Teks/ikon di atas `primary` |
| `primaryContainer` | `#E1DFFF` | Latar lembut brand: chip terpilih, kartu sorotan ringan, empty-state ikon |
| `onPrimaryContainer` | `#08006C` | Teks/ikon di atas `primaryContainer` |
| `secondary` | `#5D5C72` | Aksen netral-bernuansa brand (ikon sekunder, tombol tonal) |
| `onSecondary` | `#FFFFFF` | Teks/ikon di atas `secondary` |
| `secondaryContainer` | `#E2E0F9` | Latar tombol tonal, indikator nav aktif, chip filter terpilih |
| `onSecondaryContainer` | `#1A1A2C` | Teks/ikon di atas `secondaryContainer` |
| `tertiary` | `#994700` | Aksen hangat TEKS/IKON (mis. ikon streak). Jarang dipakai |
| `onTertiary` | `#FFFFFF` | Teks/ikon di atas `tertiary` |
| `tertiaryContainer` | `#FFDBC8` | Latar lembut aksen hangat (badge pencapaian) |
| `onTertiaryContainer` | `#321300` | Teks/ikon di atas `tertiaryContainer` |
| `highlight` | `#FFA268` | Aksen hangat berani untuk MOMEN spesial saja (streak aktif, selebrasi). Maks 1 elemen per layar |
| `onHighlight` | `#321300` | Teks/ikon di atas `highlight` (gelap, bukan putih) |
| `error` | `#BA1A1A` | Error: teks error, border field error, ikon error |
| `onError` | `#FFFFFF` | Teks/ikon di atas `error` |
| `errorContainer` | `#FFDAD6` | Latar banner/notice error |
| `onErrorContainer` | `#410002` | Teks/ikon di atas `errorContainer` |
| `success` | `#066D2D` | Sukses/selesai: ikon centang selesai, teks status sukses |
| `onSuccess` | `#FFFFFF` | Teks/ikon di atas `success` |
| `successContainer` | `#9CF7A5` | Latar banner/chip sukses |
| `onSuccessContainer` | `#002108` | Teks/ikon di atas `successContainer` |
| `warning` | `#7F5600` | Peringatan: ikon & teks peringatan |
| `onWarning` | `#FFFFFF` | Teks/ikon di atas `warning` |
| `warningContainer` | `#FFDEAE` | Latar banner peringatan |
| `onWarningContainer` | `#281900` | Teks/ikon di atas `warningContainer` |
| `background` | `#FCF8FD` | Latar layar (sama dengan `surface`) |
| `onBackground` | `#1C1B1F` | Teks di atas background |
| `surface` | `#FCF8FD` | Latar layar & top bar |
| `onSurface` | `#1C1B1F` | Teks utama & ikon utama (kontras 16,3:1) |
| `onSurfaceVariant` | `#47464F` | Teks sekunder, label, ikon nav tidak aktif (8,85:1) |
| `surfaceContainerLowest` | `#FFFFFF` | Putih murni: latar field input, kartu putih bila diperlukan, area kanvas |
| `surfaceContainerLow` | `#F6F2F7` | Kartu default (filled card), bottom sheet |
| `surfaceContainer` | `#F0EDF1` | Nav bar, menu, top bar saat konten digulir |
| `surfaceContainerHigh` | `#EBE7EC` | Dialog, ubin ikon/avatar kategori, field disabled |
| `surfaceContainerHighest` | `#E5E1E6` | Track progress dan switch, skeleton |
| `surfaceDim` | `#DCD9DE` | Latar redup; tidak dipakai pada komponen standar |
| `outline` | `#777680` | Border field, checkbox/circle tidak dicentang, switch off (4,26:1) |
| `outlineVariant` | `#C8C5D0` | Divider & border dekoratif kartu (1,62:1 — BUKAN untuk identifikasi kontrol) |
| `inverseSurface` | `#313034` | Latar snackbar |
| `inverseOnSurface` | `#F3EFF4` | Teks snackbar |
| `inversePrimary` | `#C1C1FF` | Teks aksi di snackbar |

> Pada sistem M3, `scrim` = hitam dengan opasitas 0,32 untuk latar dialog/sheet modal [C]. Di kode: `colors.scrim` + `opacity: 0.32`.

### 3.3 Matriks pasangan (teks apa di atas latar apa)

Hanya pasangan di tabel ini yang boleh dipakai. Pasangan lain = **dilarang** (kontras tidak diaudit).

| Latar | Teks/ikon utama | Teks/ikon sekunder | Aksen yang boleh |
|---|---|---|---|
| `surface` / `background` | `onSurface` | `onSurfaceVariant` | `primary`, `error`, `success`, `warning` (min 6,15:1) |
| `surfaceContainerLowest` … `surfaceContainerHighest` | `onSurface` | `onSurfaceVariant` | `primary`, `error`, `success`, `warning` (min **5,00:1** di Highest — dihitung) |
| `primary` | `onPrimary` | `onPrimary` | — |
| `primaryContainer` | `onPrimaryContainer` | `onPrimaryContainer` | — |
| `secondaryContainer` | `onSecondaryContainer` | `onSecondaryContainer` | — |
| `tertiaryContainer` | `onTertiaryContainer` | `onTertiaryContainer` | — |
| `highlight` | `onHighlight` | `onHighlight` | — (`highlight` **hanya sebagai isi**; di atas `surface` ia hanya 1,88:1, jadi dilarang sebagai teks/ikon) |
| `errorContainer` / `successContainer` / `warningContainer` | `on…Container` masing-masing | sama | — |
| `inverseSurface` (snackbar) | `inverseOnSurface` | `inverseOnSurface` | `inversePrimary` (aksi) |

### 3.4 Warna status: wajib ikon + teks

Warna saja tidak cukup (WCAG 1.4.1; 1 dari 12 pria buta warna merah-hijau [S24]; NN/g: pasangkan warna dengan ikon [S10]).

| Status | Warna | Ikon (wajib) | Contoh teks (wajib) |
|---|---|---|---|
| Sukses / selesai | `success` / `successContainer` | centang (lingkaran) | "Selesai" |
| Error | `error` / `errorContainer` | tanda seru (lingkaran) | "Nama tidak boleh kosong" |
| Peringatan | `warning` / `warningContainer` | segitiga seru | "Pengingat belum aktif" |
| Info / netral | `primary` / `primaryContainer` | huruf *i* (lingkaran) | "Data tersimpan di perangkat ini" |
| Belum dikerjakan | **netral** (`onSurfaceVariant`) | lingkaran kosong | — **bukan merah** (Prinsip 6) |

**Warna ikon status:** di atas `surface`/`surfaceContainer*` ikon memakai warna status (`success`, `error`, `warning`, `primary`; kontras ≥ 5,00:1). Di atas `…Container` (banner, chip, lingkaran *empty state*) ikon memakai **`on…Container`** pasangannya, sesuai matriks 3.3.

### 3.5 Warna kategori (untuk label/ikon kategori buatan pengguna)

Dipakai pada **ikon**, **cincin progres**, dan **penanda kecil** — **bukan** sebagai latar teks. Semua berkontras ≥ 3:1 terhadap `surface` (5,69–5,73:1) dan terhadap semua `surfaceContainer*` (min 4,63:1) — dihitung.

| Nama | Hex (tone 42, chroma 56) | Kontras vs `surface` |
|---|---|---|
| `biru` | `#0862BD` | 5,72:1 |
| `teal` | `#006F6E` | 5,71:1 |
| `hijau` | `#00732E` | 5,72:1 |
| `zaitun` | `#6D6500` | 5,69:1 |
| `jingga` | `#9E4C00` | 5,73:1 |
| `merah` | `#AA3F3D` | 5,73:1 |
| `magenta` | `#9B4089` | 5,73:1 |
| `ungu` | `#764DB5` | 5,71:1 |

**Aturan keras:** setiap kategori **wajib** tampil dengan **ikon + nama**, tidak boleh hanya warna. Alasannya terukur [V]: pada simulasi protanopia, deuteranopia, dan tritanopia, pasangan terdekat dari 8 warna ini hanya terpaut ΔE2000 = 2,1–3,4 (nilai di bawah ~5 praktis tak dapat dibedakan). Jika suatu fitur *harus* dibedakan hanya dengan warna, batasi maksimal **6** warna dan pilih tone berselang-seling — pencarian saya menemukan set 6 warna dengan selisih minimum ΔE2000 = **16,1** di semua simulasi, tetapi hasilnya memakai tone gelap dan terang sehingga kurang harmonis. Itu cadangan, bukan default.

### 3.6 Audit kontras (dihitung, bukan perkiraan)

Rumus: kontras WCAG 2.x = (L₁ + 0,05) / (L₂ + 0,05) dengan luminans relatif sRGB. Syarat: **teks ≥ 4,5:1** (SC 1.4.3) dan **komponen UI/grafik ≥ 3:1** (SC 1.4.11, ambang ketat: 2,999 gagal) [S5]. Diverifikasi silang dengan pustaka `coloraide` (selisih ≤ 0,0003).

**Hasil: 33 pasangan utama, 0 gagal.**

| Pasangan | FG | BG | Rasio | Syarat | Jenis | Lulus |
|---|---|---|---|---|---|---|
| onSurface / surface | `#1C1B1F` | `#FCF8FD` | 16,30:1 | ≥4,5:1 | teks | ✅ |
| onSurface / surfaceContainerHighest | `#1C1B1F` | `#E5E1E6` | 13,25:1 | ≥4,5:1 | teks | ✅ |
| onSurfaceVariant / surface | `#47464F` | `#FCF8FD` | 8,85:1 | ≥4,5:1 | teks | ✅ |
| onSurfaceVariant / surfaceContainerHighest | `#47464F` | `#E5E1E6` | 7,20:1 | ≥4,5:1 | teks | ✅ |
| onSurfaceVariant / surfaceContainerLow | `#47464F` | `#F6F2F7` | 8,40:1 | ≥4,5:1 | teks | ✅ |
| primary (link/teks tombol teks) / surface | `#4C4DCC` | `#FCF8FD` | 6,17:1 | ≥4,5:1 | teks | ✅ |
| primary / surfaceContainerLowest (kartu putih) | `#4C4DCC` | `#FFFFFF` | 6,48:1 | ≥4,5:1 | teks | ✅ |
| onPrimary / primary | `#FFFFFF` | `#4C4DCC` | 6,48:1 | ≥4,5:1 | teks | ✅ |
| onPrimaryContainer / primaryContainer | `#08006C` | `#E1DFFF` | 13,20:1 | ≥4,5:1 | teks | ✅ |
| onSecondaryContainer / secondaryContainer | `#1A1A2C` | `#E2E0F9` | 13,24:1 | ≥4,5:1 | teks | ✅ |
| onTertiary / tertiary | `#FFFFFF` | `#994700` | 6,45:1 | ≥4,5:1 | teks | ✅ |
| onTertiaryContainer / tertiaryContainer | `#321300` | `#FFDBC8` | 13,20:1 | ≥4,5:1 | teks | ✅ |
| onError / error | `#FFFFFF` | `#BA1A1A` | 6,46:1 | ≥4,5:1 | teks | ✅ |
| error (teks error) / surface | `#BA1A1A` | `#FCF8FD` | 6,15:1 | ≥4,5:1 | teks | ✅ |
| onErrorContainer / errorContainer | `#410002` | `#FFDAD6` | 13,26:1 | ≥4,5:1 | teks | ✅ |
| success (teks) / surface | `#066D2D` | `#FCF8FD` | 6,18:1 | ≥4,5:1 | teks | ✅ |
| onSuccess / success | `#FFFFFF` | `#066D2D` | 6,50:1 | ≥4,5:1 | teks | ✅ |
| onSuccessContainer / successContainer | `#002108` | `#9CF7A5` | 13,32:1 | ≥4,5:1 | teks | ✅ |
| warning (teks) / surface | `#7F5600` | `#FCF8FD` | 6,18:1 | ≥4,5:1 | teks | ✅ |
| onWarning / warning | `#FFFFFF` | `#7F5600` | 6,49:1 | ≥4,5:1 | teks | ✅ |
| onWarningContainer / warningContainer | `#281900` | `#FFDEAE` | 13,27:1 | ≥4,5:1 | teks | ✅ |
| onHighlight / highlight | `#321300` | `#FFA268` | 8,64:1 | ≥4,5:1 | teks | ✅ |
| inverseOnSurface / inverseSurface (snackbar) | `#F3EFF4` | `#313034` | 11,52:1 | ≥4,5:1 | teks | ✅ |
| inversePrimary / inverseSurface (aksi snackbar) | `#C1C1FF` | `#313034` | 7,70:1 | ≥4,5:1 | teks | ✅ |
| outline / surface (border input, checkbox off) | `#777680` | `#FCF8FD` | 4,26:1 | ≥3,0:1 | non-teks | ✅ |
| outline / surfaceContainerLowest (border di kartu putih) | `#777680` | `#FFFFFF` | 4,48:1 | ≥3,0:1 | non-teks | ✅ |
| outline / surfaceContainerHighest (switch off track-border) | `#777680` | `#E5E1E6` | 3,47:1 | ≥3,0:1 | non-teks | ✅ |
| primary / surface (fokus, indikator, progress) | `#4C4DCC` | `#FCF8FD` | 6,17:1 | ≥3,0:1 | non-teks | ✅ |
| primary / surfaceContainerHighest (progress terisi vs track) | `#4C4DCC` | `#E5E1E6` | 5,01:1 | ≥3,0:1 | non-teks | ✅ |
| error / surface (border error, ikon) | `#BA1A1A` | `#FCF8FD` | 6,15:1 | ≥3,0:1 | non-teks | ✅ |
| success / surface (ikon) | `#066D2D` | `#FCF8FD` | 6,18:1 | ≥3,0:1 | non-teks | ✅ |
| warning / surface (ikon) | `#7F5600` | `#FCF8FD` | 6,18:1 | ≥3,0:1 | non-teks | ✅ |
| onSurfaceVariant / surface (ikon nonaktif-tidak-dipilih, nav) | `#47464F` | `#FCF8FD` | 8,85:1 | ≥3,0:1 | non-teks | ✅ |

**Kombinasi state-layer (hover 8%, pressed 10%, dragged 16%) — teks harus tetap ≥ 4,5:1 pada kasus terburuk.** Hasil: 12 kombinasi, 0 gagal.

| Kombinasi state-layer | Teks | Latar (hasil blend) | Rasio | Lulus |
|---|---|---|---|---|
| tombol filled · hover/fokus 8% | `#FFFFFF` | `#5A5BD0` | 5,47:1 | ✅ |
| tombol filled · pressed 10% | `#FFFFFF` | `#5E5FD1` | 5,21:1 | ✅ |
| tombol filled · drag 16% | `#FFFFFF` | `#6969D4` | 4,59:1 | ✅ |
| tombol teks/outlined (layer primary di atas surface) · hover/fokus 8% | `#4C4DCC` | `#EEEAF9` | 5,48:1 | ✅ |
| tombol teks/outlined (layer primary di atas surface) · pressed 10% | `#4C4DCC` | `#EAE7F8` | 5,33:1 | ✅ |
| tombol teks/outlined (layer primary di atas surface) · drag 16% | `#4C4DCC` | `#E0DDF5` | 4,88:1 | ✅ |
| list item (layer onSurface di atas surface) · hover/fokus 8% | `#1C1B1F` | `#EAE6EB` | 13,88:1 | ✅ |
| list item (layer onSurface di atas surface) · pressed 10% | `#1C1B1F` | `#E6E2E7` | 13,38:1 | ✅ |
| list item (layer onSurface di atas surface) · drag 16% | `#1C1B1F` | `#D8D5D9` | 11,78:1 | ✅ |
| tombol tonal (layer onSecondaryContainer) · hover/fokus 8% | `#1A1A2C` | `#D2D0E9` | 11,35:1 | ✅ |
| tombol tonal (layer onSecondaryContainer) · pressed 10% | `#1A1A2C` | `#CECCE4` | 10,90:1 | ✅ |
| tombol tonal (layer onSecondaryContainer) · drag 16% | `#1A1A2C` | `#C2C0D8` | 9,63:1 | ✅ |

**Pasangan yang SENGAJA di bawah 3:1 (bukan kontrol, atau harus ditopang selain warna):**

- secondaryContainer / surface (indikator nav aktif): #E2E0F9 on #FCF8FD = 1,23:1
- outlineVariant / surface (divider dekoratif): #C8C5D0 on #FCF8FD = 1,62:1
- primaryContainer / surface: #E1DFFF on #FCF8FD = 1,23:1
- surfaceContainerLowest / surface (kartu putih vs latar): #FFFFFF on #FCF8FD = 1,05:1
- surfaceContainerLow / surface (kartu filled vs latar): #F6F2F7 on #FCF8FD = 1,05:1
- highlight / surface (HANYA boleh sebagai isi, bukan teks/ikon): #FFA268 on #FCF8FD = 1,88:1

Artinya:

- **Indikator nav aktif** (`secondaryContainer` di atas `surface` = 1,23:1) **tidak boleh jadi satu-satunya penanda** terpilih. Penanda tambahan wajib: warna ikon `primary` dan label **SemiBold** (Bagian 7.4). Ini celah yang juga ada pada M3 bawaan.
- **Divider** (`outlineVariant` = 1,62:1) hanya dekoratif; **jangan** dipakai sebagai border yang menentukan keberadaan kontrol. Untuk border field/checkbox/switch pakai `outline` (4,26:1).
- **Kartu *filled*** (`surfaceContainerLow` di atas `surface`) nyaris tak terlihat batasnya (≈ 1,05:1). Itu disengaja: batas kartu dibentuk oleh spasi dan isi, bukan garis. Jika seluruh kartu bisa diketuk, tampilkan penanda aksi (chevron `›`) dan *ripple* — jangan mengandalkan batas kartu.

### 3.7 Tema terang saja — hal teknis

- Di `app.json`: `"userInterfaceStyle": "light"` agar OS tidak membalik warna [C].
- Status bar: ikon gelap di atas `surface` (`<StatusBar style="dark" />`) [C].
- Jangan memakai `useColorScheme()` untuk mengganti warna. Seluruh warna dari `colors.*`.
- Karena tidak ada mode gelap, jangan menulis token `dark`. Jika kelak ditambahkan, itu perubahan sistem (versi 2.0 dokumen ini).

---

## 4. Tipografi

### 4.1 Pemilihan font (berdasarkan pengukuran, bukan selera)

Saya mengunduh paket font kandidat dari `@expo-google-fonts/*` dan **mengukur langsung berkas `.ttf`-nya** (tinggi-x, tinggi kapital, dukungan angka tabular, ukuran berkas). Kriteria untuk aplikasi tracker: (1) **angka tabular** (jam, durasi, hitungan harus sejajar), (2) tinggi-x besar (terbaca di ukuran kecil), (3) berkas kecil (startup cepat), (4) bobot 400–700 tersedia sebagai berkas statis.

| Font | Tinggi-x (rasio em) | Tinggi kapital | Fitur `tnum` | Glyph | Ukuran per bobot | Keputusan |
|---|---|---|---|---|---|---|
| **Plus Jakarta Sans** | **0,536** | 0,745 | **Ya** | 721 | **92 KB** | **Dipilih** |
| Inter | 0,546 | 0,728 | Ya | 2.849 | 334 KB | Ditolak: 3,6× lebih besar per bobot (±1,3 MB untuk 4 bobot) |
| Manrope | 0,540 | 0,720 | Ya | 678 | 94 KB | Cadangan; tinggi baris bawaan besar (1,366) |
| Roboto (font sistem Android) | 0,528 | 0,711 | Ya | 927 | 155 KB (sudah ada di OS) | Cadangan tanpa unduhan; tampilan "M3 bawaan" |
| Figtree | 0,500 | 0,700 | Ya | 391 | 39 KB | Ditolak: tinggi-x terkecil kedua |
| DM Sans | 0,504 | 0,700 | **Tidak** | 403 | 55 KB | **Ditolak**: tanpa angka tabular — buruk untuk tracker |

Hasil ukur tambahan [V]: pada Plus Jakarta Sans, lebar digit `0–9` secara bawaan **bervariasi (371–732 unit)** — angka "1" jauh lebih sempit. Dengan fitur `tnum` semua digit menjadi **seragam 600 unit**. Artinya: **tanpa `tabular-nums`, angka yang berubah (timer, hitungan) akan "bergoyang"**.

**Mengapa Plus Jakarta Sans [D]:** bentuknya geometris-ramah (cocok dengan karakter merek yang berani tapi bersahabat), tinggi-x lebih besar dari Roboto, berkas kecil, mendukung seluruh huruf Latin yang dibutuhkan Bahasa Indonesia, lisensi terbuka (paket npm: MIT dan OFL-1.1; terverifikasi dari `package.json`).

> **Jika ingin nol unduhan font:** hapus `fontFamily` (Android memakai Roboto) lewat satu tempat di `src/theme/tokens.ts` (`fontFamily`). Seluruh skala di bawah tetap berlaku. Tampilan akan lebih "polos".

### 4.2 Cara memuat font di Expo (aturan teknis)

- Paket: `@expo-google-fonts/plus-jakarta-sans` + `expo-font`. Nama keluarga **satu per bobot**: `PlusJakartaSans_400Regular`, `PlusJakartaSans_500Medium`, `PlusJakartaSans_600SemiBold`, `PlusJakartaSans_700Bold` (Expo mendokumentasikan pola satu-nama-per-bobot untuk paket Google Fonts [S17]; nama berkas saya periksa langsung dari paket).
- **Variable font jangan dipakai.** Dukungannya baru di SDK 58+; sebelumnya wajib berkas statis [S17].
- **Muat sebelum render pertama.** Dokumentasi Expo tidak menjelaskan mekanisme *fallback* font; jika font belum siap, teks tampil dengan font sistem lalu "melompat". Tahan *splash screen* sampai font siap (`expo-splash-screen` + `useFonts`), atau embed lewat *config plugin* `expo-font` (direkomendasikan Expo, butuh development build, tidak jalan di Expo Go) [S17].
- **Dilarang** menulis `fontWeight` bersama `fontFamily` kustom. Bobot dipilih lewat **nama keluarga**. Semua gaya teks harus berasal dari `type.*` (Bagian 12) yang sudah memuat `fontFamily`.
- Android: setel `includeFontPadding: false` pada komponen `Text` agar tinggi baris sesuai angka di tabel [C].

### 4.3 Skala tipografi (12 peran)

Ukuran mengikuti skala tipe Material 3 [V — ukuran dari tabel 15 peran M3E, [S21]]; *line-height* dan bobot mengikuti konvensi M3 [C] dengan bobot dinaikkan satu tingkat pada judul agar lebih tegas [D]. Satuan: **sp** (ikut pengaturan ukuran font pengguna).

| Peran | Ukuran (sp) | Line-height (dp) | Bobot (font) | Letter-spacing (dp) | Dipakai untuk |
|---|---|---|---|---|---|
| `displaySmall` | 36 | 44 | 700 Bold | 0 | Angka sorotan (mis. total hari ini). **Selalu `tabular-nums`** |
| `headlineMedium` | 28 | 36 | 700 Bold | 0 | Judul layar penuh (onboarding, empty-state besar) |
| `headlineSmall` | 24 | 32 | 600 SemiBold | 0 | Judul dialog, judul seksi besar |
| `titleLarge` | 22 | 28 | 600 SemiBold | 0 | Judul top bar |
| `titleMedium` | 16 | 24 | 600 SemiBold | 0 | Judul item list/kartu, judul seksi |
| `titleSmall` | 14 | 20 | 600 SemiBold | 0 | Sub-judul kecil, header grup |
| `bodyLarge` | 16 | 24 | 400 Regular | 0 | Teks isi utama, teks input |
| `bodyMedium` | 14 | 20 | 400 Regular | 0 | Teks sekunder, deskripsi list |
| `bodySmall` | 12 | 16 | 400 Regular | 0,2 | Helper text, pesan error, keterangan waktu |
| `labelLarge` | 14 | 20 | 600 SemiBold | 0,1 | Teks tombol, chip |
| `labelMedium` | 12 | 16 | 500 Medium | 0,4 | Label nav bar, label kecil |
| `labelSmall` | 11 | 16 | 500 Medium | 0,4 | Badge angka saja |

Catatan nilai: *letter-spacing* di React Native berlaku dalam dp, bukan em. Nilai M3 dirancang untuk Roboto; Plus Jakarta Sans sudah berjarak lebih lega sehingga saya menahan *tracking* teks isi di 0 dan hanya membuka sedikit pada teks kecil [D]. **Periksa visual di perangkat nyata** (angka ini label [D]).

**Rasio line-height** (semua ≥ 1,2; teks isi 1,5): 36→44 = 1,22 · 28→36 = 1,29 · 24→32 = 1,33 · 22→28 = 1,27 · 16→24 = 1,50 · 14→20 = 1,43 · 12→16 = 1,33 · 11→16 = 1,45. `bodyLarge` 1,5 memenuhi pedoman WCAG 1.4.12 untuk teks isi [C].

### 4.4 Aturan pemakaian

| Aturan | Isi |
|---|---|
| Ukuran minimum | **14 sp** untuk teks isi yang dibaca; **12 sp** untuk teks sekunder; **11 sp** hanya badge. Tidak ada ukuran di bawah 11. |
| Hierarki | Maksimal **3 tingkat teks** dalam satu kartu/seksi (mis. judul → isi → keterangan). |
| Warna teks | Utama `onSurface`; sekunder `onSurfaceVariant`. **Dilarang** membuat abu-abu dengan opasitas. |
| Angka | Semua angka yang berubah atau berjajar (timer, hitungan, persentase, tanggal dalam daftar) memakai `fontVariant: ['tabular-nums']`. Dukungan Android ada sejak RN 0.62 dan font kita memiliki `tnum` [S18]. |
| Perataan | Rata kiri (awal). Rata tengah hanya untuk judul pendek (≤ 2 baris) dan empty-state. |
| Potong teks | Judul item: `numberOfLines={1}` + `ellipsizeMode="tail"`; deskripsi: maksimal 2 baris. **Jangan memotong angka atau satuannya.** |
| Simbol di dalam teks | Font memuat tanda kutip tipografis “ ” ‘ ’, – — … • · × ≥ ≤ → › dan ₹ € £ (dicek dari berkas font), **tetapi tidak memuat ✓**. Tanda centang/silang selalu dari **ikon**, bukan karakter teks. |
| Huruf kapital | *Sentence case* ("Tambah kebiasaan"), bukan KAPITAL SEMUA. |
| Panjang teks Indonesia | Teks Indonesia sering lebih panjang daripada padanan Inggrisnya [D, aturan praktis, bukan data]. Jangan beri lebar tetap pada tombol/label; tombol memakai `minWidth: 64` + padding horizontal 24 dan boleh melebar. |
| Skala font OS | `allowFontScaling` tetap **true** (bawaan RN [S18]). Teks isi: `maxFontSizeMultiplier = 2` (sama dengan batas OS 200% [S3]). Elemen *chrome* berbidang tetap (label nav bar, badge, chip): `maxFontSizeMultiplier = 1.5` [D] — **kompromi**: sedikit di bawah anjuran 200% demi layout tidak pecah; labelnya harus pendek (≤ 2 kata) dan diuji pada 200%. |
| Tinggi komponen | Pakai `minHeight`, bukan `height`, untuk komponen berisi teks, agar tumbuh saat font diperbesar. |

---

## 5. Spasi, grid & layout

### 5.1 Skala spasi (satu-satunya angka yang boleh dipakai)

Basis **4 dp**; nilai = kunci × 4. Skala 4/8 dp adalah dasar Material dan sistem desain Android [C]. Di kode: `space[4]` = 16.

| Kunci | dp | Pemakaian utama |
|---|---|---|
| `space[0]` | 0 | — |
| `space[1]` | **4** | Jarak sangat rapat: field → helper text, ikon-ke-label mikro, `hitSlop` |
| `space[2]` | **8** | Jarak antar elemen terkait; label → field; ikon → teks di dalam tombol/chip; jarak minimum antar target sentuh |
| `space[3]` | **12** | Jarak antar kartu bertumpuk; judul seksi → isi; padding vertikal bar aksi bawah |
| `space[4]` | **16** | **Margin layar**, padding kartu, padding item list horizontal, jarak antar field |
| `space[5]` | **20** | Jarak helper-text yang dicadangkan (16 line-height + 4) |
| `space[6]` | **24** | Jarak antar seksi; padding dialog; padding horizontal tombol |
| `space[8]` | **32** | Jarak besar: sebelum/sesudah blok *hero*, di atas empty-state |
| `space[10]` | 40 | Jarak ilustrasi ke judul pada empty-state/onboarding |
| `space[12]` | 48 | Jarak besar antar-blok di layar penuh (onboarding, empty-state) |
| `space[16]` | 64 | Ruang atas layar penuh (onboarding) |

> **Aturan:** nilai di luar tabel ini (mis. 6, 10, 14, 18, 22) **dilarang**. Jika desain "terasa kurang", yang diubah adalah pilihan kunci, bukan menambah angka.

### 5.2 Spasi semantik (jawab "berapa padding-nya?")

| Konteks | Nilai | Token |
|---|---|---|
| Margin kiri-kanan layar | **16** | `space[4]` — sesuai margin jendela *compact* M3 [C, S29] |
| Jarak konten dari top bar (atas) | 16 | `space[4]` |
| Jarak antar **seksi** (judul seksi + isinya → seksi berikut) | **24** | `space[6]` |
| Judul seksi → isinya | 12 | `space[3]` |
| Padding dalam **kartu** | **16** (semua sisi) | `space[4]` |
| Jarak antar kartu bertumpuk | **12** | `space[3]` |
| Jarak antar elemen di dalam kartu | 8 (terkait) / 16 (terpisah) | `space[2]` / `space[4]` |
| Item list: padding horizontal | 16 | `space[4]` |
| Item list: padding vertikal | 8 (+ `minHeight` 56/72/88) | `space[2]` |
| Item list: ikon/avatar → teks | 16 | `space[4]` |
| Tombol: padding horizontal | 24 (teks saja), 16 (dengan ikon di awal) | `space[6]` / `space[4]` |
| Tombol: ikon → label | 8 | `space[2]` |
| Label field → field | 8 | `space[2]` |
| Field → helper/error | 4 | `space[1]` |
| Field → field (terkait) | 16 | `space[4]` |
| Grup field → grup field | 24 | `space[6]` |
| Chip → chip (horizontal) | 8 | `space[2]` |
| Chip → chip (antar-baris) | 8 | `space[2]` (lihat 7.9 tentang area sentuh) |
| Bar aksi bawah (sticky): padding | H 16, V 12 | `space[4]`, `space[3]` |
| FAB dari tepi layar & dari nav bar | 16 | `space[4]` |
| Dialog: padding | 24 | `space[6]` |
| Snackbar dari nav bar | 16 | `space[4]` |

### 5.3 Grid & lebar layar

**Basis 360 dp**, karena resolusi paling umum di ponsel Indonesia adalah 360×800 (8,94%), diikuti 414×896, 384×832, 393×873, 390×844, 385×854 — semuanya berlebar **360–414** [V, StatCounter Sep 2026, S19]. Uji juga pada **320 dp** (batas bawah aman; 320 adalah lebar acuan uji *reflow* WCAG 1.4.10 [C]).

| Lebar layar (dp) | Lebar konten (lebar − 2×16) | Lebar 1 dari 2 kolom (gap 12) | Lebar 1 dari 3 kolom (gap 8) |
|---|---|---|---|
| 320 | 288 | 138 | 90,67 |
| 360 | 328 | 158 | 104 |
| 384 | 352 | 170 | 112 |
| 393 | 361 | 174,5 | 115 |
| 412 | 380 | 184 | 121,33 |

Aturan:

- **Satu kolom** untuk daftar; **2 kolom** untuk ubin statistik (gap 12); **3 kolom** hanya untuk chip/ikon kecil (gap 8). Tidak ada grid lain.
- **Dilarang lebar tetap** untuk elemen yang mengisi layar. Gunakan `flex`/persentase. Lebar tetap hanya untuk ikon, avatar, FAB, dan elemen berukuran spesifik di Bagian 7.
- Layar ≥ 600 dp (foldable/tablet): konten ditengahkan dengan `maxWidth: 600` [D]. Aplikasi dikunci **portrait** pada ponsel [D].
- M3 menyebut kelas jendela *compact* memakai 4 kolom [C]; kita tidak memakai sistem kolom formal — cukup aturan di atas.

### 5.4 Safe area & edge-to-edge (wajib)

- Sejak Expo SDK 54, edge-to-edge **selalu aktif dan tidak bisa dimatikan** [S14]; `SafeAreaView` bawaan RN **deprecated** sejak 0.81 dan tidak kompatibel dengan edge-to-edge [S15]. Pakai **`react-native-safe-area-context`** (`SafeAreaProvider` di akar, `useSafeAreaInsets()` di komponen).
- **Top bar**: tinggi 64 + `insets.top` (status bar). Latar top bar = `surface` agar status bar tampak menyatu.
- **Nav bar bawah / bar aksi sticky / FAB**: tambahkan `insets.bottom` (bilah gestur/3 tombol). Jangan menebak 24 atau 48.
- Konten yang bisa digulir **harus** punya `paddingBottom` = tinggi bar bawah (80 bila ada `NavBar`) + `insets.bottom` + **88** bila ada FAB (56 tinggi FAB + 2 × 16 jarak), agar item terakhir tidak tertutup.
- Gestur sistem tepi layar (back dari kiri/kanan) bersaing dengan elemen yang menempel di tepi: **jangan** menaruh target penting di 16 dp terluar kiri/kanan layar.

### 5.5 Anggaran tinggi vertikal (layar 360×800)

| Komponen | Tinggi |
|---|---|
| Status bar (umumnya 24; punch-hole bisa 32–48) | 24 – 48 |
| Top bar | 64 |
| Nav bar bawah | 80 |
| Bilah gestur/3 tombol | 0 – 24 |
| **Sisa untuk konten (kasus baik, status 24, tanpa inset bawah)** | 800 − 24 − 64 − 80 − 0 = **632 dp** |
| **Sisa untuk konten (kasus buruk, status 48, inset bawah 24)** | 800 − 48 − 64 − 80 − 24 = **584 dp** |

Konsekuensi [D]: tampilkan **informasi atau aksi paling penting dalam ±300 dp pertama konten**, supaya terlihat tanpa menggulir pada perangkat terburuk, bahkan setelah font diperbesar.

---

## 6. Bentuk, elevasi, gerak, state & ikon

### 6.1 Radius sudut (skala bentuk)

Skala mengikuti skala bentuk M3 [C] dengan enam nilai saja:

| Token | dp | Dipakai pada |
|---|---|---|
| `radius.xs` | 4 | Snackbar, menu/popup, tooltip |
| `radius.sm` | 8 | Chip, ubin ikon kecil, thumbnail kecil |
| `radius.md` | 12 | **Field input**, gambar/thumbnail, ubin statistik kecil |
| `radius.lg` | 16 | **Kartu**, FAB, banner |
| `radius.xl` | 28 | **Dialog**, bottom sheet (sudut atas) |
| `radius.full` | 9999 | **Tombol**, avatar, badge, indikator nav, track progress, switch |

Aturan: radius **luar** = radius **dalam** + padding. Elemen bersarang di dalam kartu (radius 16, padding 16) yang ber-radius sendiri memakai `sm` (8) atau `md` (12), tidak boleh lebih besar dari induknya.

### 6.2 Elevasi

M3 memakai enam level: 0, 1, 3, 6, 8, 12 dp [C, S25]. Pada tema terang kita **hampir tidak memakai bayangan**; kedalaman dibangun lewat warna *surface container* (elevasi tonal), sesuai M3 [C].

| Level | `elevation` (RN) | Dipakai pada |
|---|---|---|
| 0 | 0 | Layar, kartu *filled*, list, top bar (diam) |
| 1 | 1 | Bottom sheet |
| 2 | 3 | Nav bar bawah, menu, top bar saat konten digulir di bawahnya |
| 3 | 6 | **FAB**, dialog, snackbar |
| 4–5 | 8 / 12 | Tidak dipakai |

Catatan teknis [C]: di Android, `elevation` hanya menampilkan bayangan jika `backgroundColor` view **tidak transparan**. Jangan memakai `shadowColor/shadowOffset/shadowRadius` kustom (Larangan L6).

### 6.3 Gerak (motion)

Token durasi dan *easing* mengikuti Material 3 [C]. Nilai terukur: *route enter* = *emphasized-decelerate* 400 ms, *route exit* = *emphasized-accelerate* 200 ms, `standard` = 300 ms [S27].

| Token | Nilai | Dipakai pada |
|---|---|---|
| `motion.duration.short2` | 100 ms | Perubahan warna *state*, *ripple* |
| `motion.duration.short4` | 200 ms | Centang selesai, switch, chip, keluar (*exit*) elemen kecil |
| `motion.duration.medium2` | 300 ms | Transisi umum, snackbar masuk, perluasan/penciutan item |
| `motion.duration.medium4` | 400 ms | Dialog/sheet masuk, perubahan layar besar |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default hampir semua |
| `motion.easing.decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elemen **masuk** |
| `motion.easing.accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elemen **keluar** |

**Aturan gerak:**

1. **Umpan balik sentuh < 100 ms.** NN/g: setiap aksi harus mendapat umpan balik langsung tanpa ambang waktu [S6]; angka 100 ms adalah target internal kita [D]. Gunakan *ripple* bawaan `Pressable`, bukan animasi JS.
2. Keluar lebih cepat daripada masuk (200 vs 400 ms).
3. Satu gerakan utama per momen; tidak ada animasi yang berjalan terus-menerus kecuali indikator progres.
4. **Transisi antar-layar memakai bawaan native stack Android** [D] — selaras dengan platform dan mendukung *predictive back*. Jangan menulis transisi layar kustom.
5. **Hormati "Hapus animasi" OS**: bila animasi OS dinonaktifkan, durasi menjadi 0 dan gerak non-esensial dibuang (`AccessibilityInfo.isReduceMotionEnabled`) [C].
6. Pustaka: `react-native-reanimated` untuk animasi UI; `Easing.bezier(...)` dengan nilai di tabel.
7. **Haptik:** gunakan `expo-haptics` hanya pada (a) menyelesaikan item (konfirmasi), (b) aksi ditolak/error. Satu hentakan ringan; tidak pada setiap ketukan. Android memiliki konstanta haptik khusus untuk konfirmasi/penolakan [C]; periksa nama fungsi di versi `expo-haptics` yang terpasang.

### 6.4 State interaktif (state layer)

Setiap kontrol interaktif punya **lapisan state**: warna konten (`on…`) dengan opasitas tertentu di atas latar. Nilai dari token Compose Material3 terbaru [S23]:

| State | Opasitas lapisan | Catatan |
|---|---|---|
| Hover | 8% | Hanya ada bila mouse/stylus terhubung |
| Focus | 10% | Fokus keyboard/D-pad **plus cincin fokus** 2 dp `primary` |
| **Pressed** | **10%** | Ini yang utama di ponsel: dipakai sebagai warna *ripple* |
| Dragged | 16% | Saat item diseret |
| Disabled — konten | **38%** `onSurface` | Teks/ikon dinonaktifkan |
| Disabled — wadah | **12%** `onSurface` | Latar tombol/field dinonaktifkan |

Warna *ripple* per komponen (Pressable `android_ripple`) [D]:

| Komponen | Warna ripple |
|---|---|
| Tombol *filled* | `onPrimary` @ 10% |
| Tombol *tonal* | `onSecondaryContainer` @ 10% |
| Tombol *outlined*/teks, ikon-tombol berwarna | `primary` @ 10% |
| Item list, kartu bisa-diketuk, ikon-tombol netral | `onSurface` @ 10% |

Semua kombinasi state-layer di atas sudah lolos kontras teks 4,5:1 (Bagian 3.6). Komponen **disabled dikecualikan dari syarat kontras** WCAG [S5], tetapi **tetap harus jelas bahwa ia nonaktif** (opasitas 38% + tidak ada ripple) dan **harus disertai alasan** bila pengguna mungkin bingung (teks helper di bawahnya).

### 6.5 Ikon

- **Satu paket saja.** Paket: **`@react-native-vector-icons/lucide`** (nama paket terverifikasi di blog resmi Expo yang menyarankan paket berskop `@react-native-vector-icons/*` sebagai pengganti `@expo/vector-icons` [S16]). Gaya garis yang konsisten, ketebalan seragam.
- **Semua nama ikon didaftarkan di satu berkas `icons.ts`** (kunci semantik → nama ikon). Alasannya: nama ikon bisa berubah antar-versi paket; dengan satu berkas, perubahan tidak menyebar ke seluruh layar. **Verifikasi setiap nama terhadap `glyphmap` paket saat instalasi** (Bagian 15.2).
- Ukuran: **24 dp** (default) · **18 dp** (di dalam tombol/chip) · **48–64 dp** (empty-state, di dalam lingkaran 96–120) [C].
- Warna ikon: default `onSurfaceVariant`; penekanan `onSurface`; aktif/terpilih `primary`; di atas `primary` pakai `onPrimary`.
- **Ikon-saja** (tanpa teks) hanya untuk aksi yang sudah sangat baku (kembali, tutup, tambah, lainnya `⋮`, cari) dan **wajib** punya `accessibilityLabel`. Navigasi utama **tidak boleh** ikon-saja (Larangan L10).
- Ikon dekoratif di samping teks yang sudah menjelaskan: `accessible={false}` / `importantForAccessibility="no"`.
- Area sentuh ikon-tombol = **48×48** (ikon 24 + padding 12).

Kunci semantik yang diwajibkan ada di `icons.ts` (Bagian 12.4): `add`, `back`, `close`, `check`, `checkCircle`, `circle`, `error`, `warning`, `info`, `edit`, `delete`, `more`, `settings`, `notifications`, `calendar`, `streak`, `stats`, `home`, `list`, `search`, `chevronRight`.

---

## 7. Spesifikasi komponen

### 7.1 Aturan umum semua komponen

1. Dibangun **hanya dari token** (`colors`, `space`, `radius`, `type`, `elevation`, `motion`). Tidak ada nilai mentah.
2. Setiap komponen punya **semua state**: *default, pressed, focused, disabled* (dan *selected/error/loading* bila relevan).
3. Area sentuh **≥ 48×48 dp**. Bila tampilan lebih kecil, perluas dengan `hitSlop` atau padding — tidak boleh mengecilkan area sentuh.
4. Setiap kontrol punya `accessibilityRole`, `accessibilityLabel` (jika tidak ada teks terlihat), dan `accessibilityState` (`disabled`, `selected`, `checked`).
5. Komponen berisi teks memakai `minHeight`, bukan `height` (Bagian 4.4).
6. Label berstatus **[C]** = konvensi M3/Android; **[D]** = keputusan desain kita. Tinggi 48 dp tombol adalah [D] (M3 memakai 40 dp + area sentuh 48 dp [C]); alasannya: tinggi tampilan = area sentuh, sehingga tidak ada `hitSlop` tersembunyi yang bisa dilupakan agent.

---

### 7.2 Tombol (`Button`)

**Varian**

| Varian | Latar | Teks/ikon | Border | Dipakai untuk |
|---|---|---|---|---|
| `filled` | `primary` | `onPrimary` | — | **Aksi utama** (maks. 1 per layar/dialog/sheet) |
| `tonal` | `secondaryContainer` | `onSecondaryContainer` | — | Aksi penting kedua (mis. "Tambah catatan") |
| `outlined` | transparan | `primary` | 1 dp `outline` | Aksi sekunder yang perlu terlihat sebagai tombol |
| `text` | transparan | `primary` | — | Aksi tersier, di dialog, "Batal", "Lihat semua" |
| `danger` | `error` | `onError` | — | **Hanya** tombol konfirmasi aksi destruktif di dialog (hapus permanen, buang perubahan) |

**Ukuran & bentuk**

| Ukuran | Tinggi | Padding H | Dipakai untuk |
|---|---|---|---|
| `md` (default) | **48** | 24 (teks saja) · 16 (ikon di awal) | Hampir semua tombol |
| `lg` | **56** | 24 | **CTA lebar-penuh di bar bawah**, tombol utama onboarding |
| `sm` | **40** (+ `hitSlop` vertikal 4 → area sentuh 48) | 16 | Hanya di ruang padat (di dalam kartu); jangan di bar bawah |

- Radius: `radius.full` (pil). Gaya teks `labelLarge` (14/20, SemiBold). `minWidth: 64`.
- Ikon opsional di awal: **18 dp**, jarak ke label 8 dp.
- **Lebar:** tombol di bar bawah/form = `width: '100%'`. Tombol inline mengikuti isi (boleh melebar untuk teks Indonesia yang panjang).
- **State:** *pressed* = ripple 10% (tabel 6.4). *Focused* = cincin 2 dp `primary` berjarak 2 dp. *Disabled* = wadah `onSurface` 12% + konten `onSurface` 38%, tanpa ripple. *Loading* = spinner 18 dp (warna konten) di awal label + teks berubah ("Menyimpan…"), tombol tidak bisa ditekan lagi; **dilarang** menampilkan peringatan "jangan klik lagi" [S6].
- **Jangan menonaktifkan tombol utama form tanpa penjelasan** [D]: biarkan aktif, validasi saat ditekan, tampilkan error di field dan fokuskan field pertama yang salah. Nonaktifkan hanya bila aksi memang tidak tersedia dan alasannya terlihat.
- **Pasangan tombol** (dua tombol berdampingan): lebar sama (`flex: 1`), jarak 12 dp, **aksi utama di kanan** (konvensi Android [C]), sekunder (`outlined`/`text`) di kiri.
- **Dilarang:** dua tombol `filled` pada satu layar; tombol dengan teks > 2 baris (persingkat teksnya); tombol hanya-ikon bergaya tombol teks (pakai `IconButton`).

### 7.3 Tombol ikon (`IconButton`)

| Properti | Nilai |
|---|---|
| Area sentuh / wadah | **48×48**, `radius.full` |
| Ikon | 24 dp, warna `onSurfaceVariant` (default) |
| Varian | `standard` (tanpa latar), `tonal` (latar `secondaryContainer`, ikon `onSecondaryContainer`) |
| Wajib | `accessibilityLabel` ("Kembali", "Tutup", "Lainnya") |

### 7.4 Bar navigasi bawah (`NavBar`)

| Properti | Nilai |
|---|---|
| Tinggi | **80 dp** + `insets.bottom` [C]. (Varian *flexible* Expressive = 64 dp dengan indikator 56 dp [S22]; kita pilih 80 karena memberi ruang label yang lega untuk Bahasa Indonesia [D]) |
| Latar | `surfaceContainer`, elevasi level 2 (3 dp) |
| Jumlah tujuan | **3–5** (rekomendasi: **4**) [C] |
| Item | Lebar = layar ÷ jumlah item; tinggi penuh 80 → area sentuh jauh di atas 48 |
| Susunan item (vertikal) | padding atas 12 → wadah indikator **64×32** (`radius.full`) berisi ikon 24 → jarak 4 → label `labelMedium` (12/16) → padding bawah 16 (12 + 32 + 4 + 16 + 16 = 80) |
| Aktif | Indikator `secondaryContainer`; ikon `primary`; label `onSurface` bobot **600**. **Ketiganya wajib** — indikator saja hanya 1,23:1 terhadap latar (Bagian 3.6) |
| Tidak aktif | Ikon `onSurfaceVariant`; label `onSurfaceVariant` bobot 500 |
| Label | **Selalu tampil**, 1 baris, ≤ 12 karakter, `maxFontSizeMultiplier = 1.5` |
| Badge | Titik 6 dp (`error`) atau angka (tinggi 16, `labelSmall`, `error`/`onError`) di pojok kanan atas ikon [C] |

Dasar data: navigasi tersembunyi dipakai hanya 57% (vs 86% bila terlihat), penemuan turun >20%, tugas 15% lebih lambat [S9] → **tab utama selalu terlihat dan berlabel; drawer/hamburger dilarang untuk tujuan utama**. Mengetuk tab yang sedang aktif = gulir ke atas daftar. Tab **mempertahankan state** (posisi gulir) saat berpindah.

### 7.5 Bar atas (`TopBar`) — hanya satu tipe

| Properti | Nilai |
|---|---|
| Tinggi | **64 dp** + `insets.top` [C] |
| Latar | `surface`; saat konten digulir di bawahnya → `surfaceContainer` (+ elevasi level 2) [C] |
| Padding horizontal | 4 dp (karena `IconButton` 48 dp sudah membawa padding 12 → ikon terlihat di x = 16) |
| Judul | `titleLarge`, `onSurface`, 1 baris, ellipsis. Tanpa ikon awal: mulai di x = 16. Dengan ikon awal: mulai setelah ikon + 4 |
| Ikon awal | Layar utama (tab): **tidak ada**. Layar turunan: `back`. Layar form/modal: `close` |
| Aksi akhir | Maksimal **2** `IconButton` + opsional `more` (⋮) untuk sisanya |
| Larangan | Tidak ada top bar "besar/collapsing" — satu tipe saja agar konsisten [D]. Tidak ada tombol teks "Simpan" di pojok kanan atas (aksi utama form ada di bar bawah, Bagian 9.2) |

### 7.6 Tombol aksi mengambang (`FAB`)

| Properti | Nilai |
|---|---|
| Ukuran | **56×56**, `radius.lg` (16) [C] |
| Warna | Wadah `primary`, ikon `onPrimary` 24 dp [D] (M3 bawaan memakai `primaryContainer`; kita pakai `primary` agar tegas) |
| Elevasi | Level 3 (`elevation: 6`) |
| Posisi | Kanan-bawah: **16 dp** dari tepi kanan; **16 dp** di atas nav bar (`bottom = 80 + insets.bottom + 16`). Tanpa nav bar: `insets.bottom + 16` |
| Jumlah | **Maksimal 1 per layar**, hanya untuk aksi **membuat** utama (mis. "Tambah"). Tidak boleh ada bersama tombol `filled` di bar bawah |
| Wajib | `accessibilityLabel` ("Tambah kebiasaan"). Ikon "plus" saja tanpa label teks hanya karena aksinya baku; di *empty state* ada tombol berlabel penuh |
| Saat snackbar muncul | FAB naik setinggi snackbar + 8 dp (animasi 200 ms) agar tidak tertutup [C] |
| Gulir | Tetap tampil (tidak disembunyikan saat gulir) [D] — mengurangi kejutan; ruang bawah daftar sudah dicadangkan 48 dp tambahan |

Pertimbangan tangan: 33% pengguna satu-tangan memakai jempol kiri [S2], dan sudut kanan-bawah relatif jauh bagi mereka. FAB tetap dipakai pada layar daftar karena itu konvensi Android yang sudah dikenal, **tetapi alur pembuatan (form) selalu berakhir pada tombol lebar-penuh di bar bawah yang netral tangan** (Bagian 9.2).

### 7.7 Field input (`TextField`)

Gaya **outlined** dengan **label di atas** field (bukan *floating label*). Alasan: label yang selalu terlihat mencegah hilangnya konteks saat mengetik, dan pengguna dalam uji Baymard sampai menghapus seluruh isian hanya untuk melihat label lagi [S11].

```
Nama kebiasaan              ← label: titleSmall (14/20, 600), onSurface        (tinggi 20)
                            ← jarak 8
┌────────────────────────┐
│ Contoh: Minum air      │  ← field: minHeight 56, radius 12, border 1 (outline)
└────────────────────────┘     padding H 16, teks bodyLarge, placeholder onSurfaceVariant
                            ← jarak 4
Maks. 40 karakter           ← helper: bodySmall (12/16), onSurfaceVariant      (tinggi 16)
```

| Properti | Nilai |
|---|---|
| Wadah | `minHeight` **56**, `radius.md` (12), latar `surfaceContainerLowest` |
| Border | Default **1 dp `outline`** (4,26:1); fokus **2 dp `primary`**; error **2 dp `error`**; disabled 1 dp `onSurface` 12% |
| Perubahan ketebalan | 1 → 2 dp **tanpa menggeser isi** (kurangi padding 1 dp saat 2 dp) |
| Teks input | `bodyLarge`, `onSurface`; kursor & seleksi `primary` |
| Placeholder | `bodyLarge`, `onSurfaceVariant`; **hanya contoh format**, bukan pengganti label [S11] |
| Label | `titleSmall`. Field yang **tidak wajib** diberi tanda "(opsional)" di akhir label; field wajib tanpa tanda [D] |
| Helper | `bodySmall`, `onSurfaceVariant`; tinggi **dicadangkan 20 (16 + 4)** pada field yang bisa error agar layout tidak melompat saat error muncul |
| Error | **Ganti** helper dengan: ikon error 16 dp + teks `bodySmall` `error`, di **bawah** field [S10]. Border menjadi 2 dp `error`. Teks error menjelaskan **cara memperbaiki**, bukan hanya "Salah" |
| Ikon di dalam | Awal: 24 dp `onSurfaceVariant`. Akhir: tombol hapus-isi (×) / tampilkan-sembunyikan sandi, area sentuh 48 |
| Multiline | `minHeight` 112, `textAlignVertical: 'top'`, padding V 16 |
| Penghitung karakter | Kanan-bawah, `bodySmall`, bersama helper |

**Perilaku validasi** [S10]:

- Validasi **setelah pengguna selesai** dengan field (saat `onBlur`) — jangan memarahi saat sedang mengetik. Setelah field pernah salah, boleh divalidasi ulang saat mengetik agar error hilang segera.
- Saat tombol utama ditekan dan ada error: tampilkan semua error, **fokuskan field pertama yang salah**, gulir hingga terlihat, dan umumkan lewat TalkBack.
- **Jangan menghapus isian pengguna** saat error.
- Atur `keyboardType`/`inputMode`, `autoCapitalize`, `autoComplete`, dan `returnKeyType` ("Lanjut" untuk berantai, "Selesai" untuk terakhir) sesuai jenis data. Field angka memakai papan ketik numerik.
- Field berantai: tombol keyboard "Lanjut" memindahkan fokus ke field berikutnya.

### 7.8 Item daftar (`ListItem`)

| Properti | Nilai |
|---|---|
| Tinggi minimum | **56** (1 baris) · **72** (2 baris) · **88** (3 baris) [C]; pakai `minHeight` |
| Padding | H 16, V 8, `alignItems: 'center'` |
| Awal (leading) | Ikon 24 · avatar/ubin 40 · `CheckCircle` (area sentuh 48). Jarak ke teks **16** |
| Judul | `titleMedium` (16/24, 600), `onSurface`, 1 baris ellipsis |
| Keterangan | `bodyMedium` (14/20), `onSurfaceVariant`, maksimal 2 baris |
| Akhir (trailing) | Teks meta `labelMedium` `onSurfaceVariant`, atau ikon 24, atau chevron `›` bila seluruh baris menuju layar lain |
| Divider | 1 dp `outlineVariant`, **inset kiri** = 16 (sejajar teks bila tanpa leading) atau 72 (bila ada leading 40 + 16 + 16) |
| *Pressed* | Ripple `onSurface` 10% di seluruh baris |
| Terpilih | Latar `secondaryContainer` **+ ikon centang** di awal/akhir (bukan hanya warna) |
| Area sentuh | Seluruh baris (≥ 56 tinggi). Aksi terpisah di dalam baris (mis. `CheckCircle`) punya area 48 sendiri dan **jaraknya ≥ 8 dp** dari area sentuh baris lain |

### 7.9 Chip

| Properti | Nilai |
|---|---|
| Tinggi | **40** (+ `hitSlop` vertikal 4 → area sentuh 48). M3 memakai 32 [S22]; kita 40 agar tidak mengandalkan perluasan besar [D] |
| Bentuk | `radius.sm` (8) |
| Padding H | 16 (tanpa ikon) · 12 di sisi ikon |
| Teks | `labelLarge` |
| Tidak dipilih | Latar transparan, border 1 dp `outline`, teks `onSurfaceVariant` |
| **Dipilih** | Latar `secondaryContainer`, tanpa border, teks `onSecondaryContainer` **+ ikon centang 18 dp di awal** (bukan hanya warna) |
| Jarak | Antar-chip 8 dp. **Grup chip = satu baris yang bisa digulir horizontal** dengan padding kiri-kanan 16. Membungkus ke beberapa baris hanya untuk pemilih di dalam form, dengan jarak baris 8 dp |
| Catatan area sentuh | Dua chip bertumpuk: area sentuh 48 dp keduanya bersentuhan tetapi **tidak tumpang tindih** (40 + 4 + 4 = 48; jarak baris 8 = 4 + 4). Jarak horizontal 8 dp memenuhi anjuran 8 dp [S1] |

### 7.10 Kartu (`Card`) dan ubin statistik

| Varian | Latar | Border | Padding | Dipakai untuk |
|---|---|---|---|---|
| `filled` (default) | `surfaceContainerLow` | — | 16 | Kelompok informasi, item ringkasan |
| `outlined` | `surface` | 1 dp `outlineVariant` | 16 | Kartu bisa-pilih, pengelompokan form |
| `hero` | `primary` | — | 16 | **Satu** kartu sorotan di layar utama (mis. progres hari ini). Semua teks `onPrimary` |

- Radius **`lg` (16)**, elevasi 0. Tanpa bayangan (L6).
- **Jangan menumpuk kartu di dalam kartu** (L7). Pemisahan di dalam kartu: spasi 16 atau divider.
- Kartu yang bisa diketuk: ripple `onSurface` 10% (di `hero`: `onPrimary` 10%) + chevron `›`; seluruh kartu = satu area sentuh.
- **Teks di kartu `hero`**: hanya `onPrimary` (6,48:1). Hierarki dibuat dengan **ukuran dan bobot**, bukan opasitas.
- **Ubin statistik** (2 per baris, gap 12, lebar ±158 dp pada 360): kartu `filled`; angka `headlineSmall` (24/32, Bold, `tabular-nums`, `numberOfLines={1}`, `adjustsFontSizeToFit`, skala minimum 0,8); label `bodyMedium` `onSurfaceVariant` maks. 2 baris; ikon opsional 24 dp di atas. Angka terbesar `displaySmall` hanya pada kartu `hero` lebar-penuh.

### 7.11 Pilihan: `CheckCircle`, Checkbox, Radio, Switch

| Komponen | Ukuran visual | Area sentuh | Tidak dipilih | Dipilih |
|---|---|---|---|---|
| **`CheckCircle`** (menyelesaikan item — aksi inti tracker) | Lingkaran **28** | **48×48** | Border 2 dp `outline` (4,26:1), isi transparan | Isi `primary` + ikon centang 18 dp `onPrimary`; animasi skala 200 ms; haptik konfirmasi |
| Checkbox (form, pilihan ganda) | Kotak **18**, radius 2 [C] | 48×48 | Border 2 dp `outline` | Isi `primary` + centang `onPrimary` |
| Radio | Lingkaran **20** [C] | 48×48 | Border 2 dp `outline` | Border `primary` + titik 10 dp `primary` |
| Switch | Track **52×32**, thumb 16 (mati) / 24 (hidup) [C] | 48 tinggi × 52 lebar | Track `surfaceContainerHighest` + border 2 dp `outline`; thumb `outline` (3,47:1 vs track) | Track `primary`; thumb `onPrimary` **dengan ikon centang 16 dp** (penanda non-warna) |

- `CheckCircle` memakai `primary` (bukan `success`) karena ini **kontrol interaktif**, bukan indikator status [D]. Setelah selesai, baris boleh tampil dengan teks `onSurfaceVariant` dan coretan **hanya** jika pengguna perlu melihat riwayat; jangan menghilangkan baris secara mendadak.
- Setiap `CheckCircle`: `accessibilityRole="checkbox"`, `accessibilityState={{ checked }}`, label menyebut item ("Tandai Minum air selesai").
- Pilihan yang berefek langsung (switch) **berlaku seketika**, tanpa tombol "Terapkan".
- Jarak antar-`CheckCircle` bertumpuk dalam daftar: minimal 8 dp antar-area sentuh (baris 56 dp mencukupi).

### 7.12 Indikator progres

| Komponen | Spesifikasi |
|---|---|
| **`ProgressBar`** (data, mis. 3 dari 5) | Tinggi **8**, `radius.full`; track `surfaceContainerHighest`, terisi `primary` (5,01:1 vs track); **wajib disertai teks angka** ("3 dari 5") di dekatnya — bukan hanya panjang batang |
| **`ProgressRing`** (data) | Ukuran **56** (stroke 6) atau **96** (stroke 8, di kartu `hero`); track `surfaceContainerHighest`; terisi `primary`; di tengah angka `tabular-nums`. Saat 100%: ikon centang menggantikan angka |
| **`Loading`** (aktivitas, bukan data) | Spinner melingkar 48 dp (stroke 4) `primary`; atau batang linear 4 dp di bawah top bar. Aturan waktu: Bagian 11.1 |

Dari hasil kontras: terisi `primary` vs track `surfaceContainerHighest` = 5,01:1 (≥ 3:1 untuk grafik).

### 7.13 Snackbar

| Properti | Nilai |
|---|---|
| Wadah | `inverseSurface`, `radius.xs` (4), elevasi level 3, `minHeight` 48 |
| Teks | `bodyMedium`, `inverseOnSurface` (11,52:1), maks. 2 baris |
| Aksi | Satu tombol teks `labelLarge`, `inversePrimary` (7,70:1), tinggi 48, padding H 12 |
| Posisi | Margin H 16; **16 dp di atas nav bar** (di atas inset bawah). Menggeser FAB ke atas |
| Durasi | **5 dtk** tanpa aksi; **8 dtk** dengan aksi "Urungkan" [D]. Satu per satu (antrian) |
| Aksesibilitas | `accessibilityLiveRegion="polite"` agar TalkBack mengumumkan |
| Pakai untuk | Konfirmasi ringan ("Kebiasaan dihapus" + **Urungkan**, "Tersimpan"). **Bukan** untuk error yang memerlukan tindakan — itu banner/inline |

### 7.14 Dialog

| Properti | Nilai |
|---|---|
| Wadah | `surfaceContainerHigh`, `radius.xl` (28), padding **24**, elevasi level 3 |
| Lebar | `min(layar − 48, 560)`, minimum 280 [C, S26] → pada 360 dp: **312** |
| Isi | (Opsional) ikon 24 di tengah → judul `headlineSmall` (maks. 2 baris) → isi `bodyMedium` `onSurfaceVariant` |
| Jarak | Ikon → judul 16; judul → isi 16; isi → aksi 24 |
| Aksi | Rata kanan, tinggi 48, jarak 8. Batal dan konfirmasi biasa = tombol `text`; **konfirmasi destruktif = tombol `danger`**. Urutan: **batal di kiri, konfirmasi di kanan** [C]. Maksimal 2 aksi |
| Scrim | `scrim` @ 32% [C]; ketuk scrim atau tombol Kembali = batal |
| Pakai untuk | Aksi **tak bisa dibatalkan** atau berbiaya (hapus permanen, hapus semua data). **Bukan** untuk aksi rutin [S8] |
| Teks tombol | **Menyebut hasil**: "Hapus selamanya" / "Simpan data", bukan "Ya"/"Tidak"/"Yakin?" [S8]. Konfirmasi destruktif memakai varian `danger` |

### 7.15 Bottom sheet (modal)

| Properti | Nilai |
|---|---|
| Wadah | `surfaceContainerLow`, sudut atas `radius.xl` (28), elevasi level 1 [S28] |
| Drag handle | **32×4**, `radius.full`, `onSurfaceVariant`, di dalam strip **48 dp** (area sentuh) [S28] |
| Padding | H 16; bawah `insets.bottom` + 16 |
| Tinggi | Mengikuti isi; maksimal **90%** tinggi layar [D] |
| Tutup | Geser ke bawah, ketuk scrim (`scrim` 32%), tombol Kembali |
| Pakai untuk | Daftar pilihan/aksi (item 56 dp), filter, form pendek (≤ 3 field). **Bukan** untuk form panjang (itu layar penuh) |
| Keyboard | Sheet naik di atas keyboard; field aktif tetap terlihat |

### 7.16 Komponen status layar: *Empty*, *Error*, *Loading*

**Susunan *Empty/Error state*** (vertikal, tengah, sedikit di atas titik tengah vertikal area konten):

```
          [ lingkaran 96, latar primaryContainer ]
          [   ikon 48, onPrimaryContainer       ]
                       ↓ 24
                 Judul (titleLarge, tengah, ≤ 2 baris)
                       ↓ 8
        Penjelasan (bodyMedium, onSurfaceVariant, tengah,
                    lebar maks. 280, ≤ 3 baris)
                       ↓ 24
            [ Tombol filled md — satu aksi ]
```

| Jenis | Kapan | Ikon / warna | Contoh |
|---|---|---|---|
| **Kosong awal** | Belum ada data | Ikon topik; `primaryContainer` | "Belum ada kebiasaan" + "Tambah kebiasaan" |
| **Tak ada hasil** | Filter/pencarian tidak cocok | Ikon cari | "Tidak ada hasil" + "Hapus filter" |
| **Semua selesai** | Tuntas hari ini | Ikon centang; `successContainer` | "Semua selesai hari ini" |
| **Error** | Gagal memuat/menyimpan | Ikon error; `errorContainer` | "Gagal memuat" + "Coba lagi" |
| **Izin ditolak** | Notifikasi ditolak | Ikon lonceng-coret | "Pengingat belum aktif" + "Buka pengaturan" |

Warna ikon di dalam lingkaran: `onPrimaryContainer` (kosong awal/tak ada hasil), `onSuccessContainer` (semua selesai), `onErrorContainer` (error/izin ditolak; lingkaran `errorContainer`).

*Empty state* melakukan tiga pekerjaan: menjelaskan mengapa kosong, mengajarkan apa yang dilakukan di sini, dan menyediakan **satu** aksi untuk mengisinya [D]. Detail loading dan pola waktu: Bagian 11.1.

### 7.17 Komponen kecil

| Komponen | Spesifikasi |
|---|---|
| **Divider** | 1 dp `outlineVariant`; di list inset kiri 16/72; antar-seksi penuh lebar |
| **Judul seksi** (`SectionHeader`) | Tinggi min. 48; `titleMedium` `onSurface` di kiri; opsional tombol `text` "Lihat semua" di kanan (area sentuh 48); padding H 16; jarak atas 24 dari seksi sebelumnya |
| **Badge** | Titik 6 dp atau angka (tinggi 16, min lebar 16, `labelSmall`); `error`/`onError`; maks. "99+" |
| **Banner info/peringatan/error** | `…Container` + ikon 24 di awal (warna `on…Container`) + teks `bodyMedium` `on…Container` + (opsional) tombol `text`; `radius.lg`; padding 16; berada **di dalam konten** (tidak melayang) |
| **Avatar/ubin ikon kategori** | 40 dp `radius.full`; latar `surfaceContainerHigh`; ikon 24 warna kategori (≥ 4,63:1) |
| **Tooltip/hint kontekstual** | Dipakai hemat (Bagian 11.3); `inverseSurface`, `bodySmall`, `radius.xs` |
| **Pemilih tanggal/waktu** | Gunakan komponen native/platform (picker Android) agar sesuai kebiasaan pengguna; **tidak dibuat sendiri** [D] |

---

## 8. Template layar

> **Status:** template generik untuk aplikasi tracker (PRD tidak terlampir). Ganti nama dan isi dengan layar sebenarnya dari PRD; **struktur, jarak, dan komponen tidak boleh berubah**. Setiap layar baru harus memilih salah satu template ini.

Semua jarak vertikal di bawah adalah token dari Bagian 5; angka hasil penjumlahan ditunjukkan agar bisa dicek.

### 8.1 Template A — Layar tab utama (daftar + ringkasan)

```
┌────────────────────────────────────────┐ y = 0
│ status bar                (insets.top) │
├────────────────────────────────────────┤
│ TopBar 64    "Hari ini"      [cari] [⋮]│  judul titleLarge, x = 16
├────────────────────────────────────────┤
│ ↓ 16                                   │
│ ┌ Kartu HERO (primary) ──────────────┐ │  radius 16, padding 16, tinggi 124:
│ │ label bodyMedium (20)              │ │   16 + 20 + 8 + 44 (displaySmall)
│ │ angka displaySmall (44)            │ │   + 12 + 8 (ProgressBar) + 16 = 124
│ │ ProgressBar 8                      │ │
│ └────────────────────────────────────┘ │
│ ↓ 24                                   │
│ Judul seksi "Belum selesai"        (48)│
│ ListItem 72  [CheckCircle] judul/ket › │
│ ListItem 72  …                         │
│ ↓ 24                                   │
│ Judul seksi "Selesai"              (48)│
│ ListItem 72 …                          │
│                          ┌────┐        │
│                          │FAB │ 56     │  kanan 16, 16 di atas NavBar
│                          └────┘        │
├────────────────────────────────────────┤
│ NavBar 80  [Hari ini][Daftar][Statistik][Pengaturan]│
└────────────────────────────────────────┘ (+ insets.bottom)
```

- Kolom isi: `ScrollView` padding H 16, atas 16, bawah = 80 + `insets.bottom` + 88 (FAB 56 + 2 × 16).
- Aritmetika pada ponsel 360×800 (kasus baik, konten 632 dp): 16 + 124 + 24 + 48 = **212** dp terpakai sebelum baris pertama; sisa 420 dp ⇒ 5 baris (72 dp) penuh terlihat tanpa menggulir. Pada kasus terburuk (584 dp): sisa 372 ⇒ 5 baris (360 dp).
- Hanya **satu** kartu `hero`. Bila PRD tidak punya ringkasan, buang kartu `hero`, jangan diganti kartu lain yang berwarna.
- Aksi utama = `FAB` (tambah). Aksi item = `CheckCircle` di kiri (dalam jangkauan jempol kanan **dan** kiri karena berada di tepi kiri-tengah; lihat 9.2).

### 8.2 Template B — Layar detail (turunan)

```
┌ TopBar 64: [‹ back]  "Minum air"        [ubah] [⋮] ┐   ⋮ memuat "Hapus"
│ ↓ 16                                               │
│ Blok judul: headlineSmall + keterangan bodyMedium  │
│ ↓ 24                                               │
│ Ubin statistik 2 kolom (gap 12): [angka][angka]    │   lebar ±158 @360
│ ↓ 24                                               │
│ Judul seksi "Riwayat"                          (48)│
│ ListItem 56/72 …                                   │
└────────────────────────────────────────────────────┘
```

- **Aksi destruktif (hapus) berada di menu `⋮` di pojok kanan atas**, bukan sebagai tombol merah besar dekat bawah layar. Alasannya: sudut atas adalah zona tersulit dijangkau jempol [S2] — cocok untuk aksi langka dan berbahaya (Bagian 9.2).
- Ubah = `IconButton` di top bar atau tombol `tonal` di dalam konten, bukan keduanya.

### 8.3 Template C — Layar form (tambah/ubah)

```
┌ TopBar 64: [× close]  "Tambah kebiasaan"           ┐
│ ScrollView padding H 16, atas 16                   │
│  Label (20) ↓8 Field (56) ↓4 Helper (16)           │   = 104 per field
│  ↓ 16  (antar-field terkait)                       │
│  …                                                 │
│  ↓ 24  (antar-grup)                                │
├────────────────────────────────────────────────────┤
│ BAR AKSI STICKY: padding H 16, V 12                │   tinggi 12 + 56 + 12 = 80
│ [        Simpan  (filled, lg 56, penuh)          ] │   + insets.bottom
└────────────────────────────────────────────────────┘
```

- Satu field dengan helper = 20 + 8 + 56 + 20 (cadangan helper 16 + 4) = **104 dp**; dua field berurutan + jarak 16 = 224 dp. Pada layar 360×800 (status 24, tanpa inset bawah) tersedia 800 − 24 − 64 − 80 (bar aksi) = 632 dp; dikurangi padding atas 16 = 616 dp ⇒ **5 field** (5×104 + 4×16 = 584 dp) terlihat tanpa menggulir.
- Bar aksi **ikut naik di atas keyboard**. Pakai penanganan keyboard yang kompatibel edge-to-edge dan **uji di perangkat nyata** (perilaku `KeyboardAvoidingView` pada Android edge-to-edge bervariasi; pustaka `react-native-keyboard-controller` umum dipakai untuk ini [C — verifikasi saat instalasi]).
- Tombol **Batal tidak ada di bar**; membatalkan = `×` di top bar atau tombol Kembali sistem. Bila ada perubahan belum disimpan → dialog: "Buang perubahan?" dengan aksi **"Lanjut mengedit"** (kiri) dan **"Buang"** (kanan, `danger`).
- Simpan **tidak** disembunyikan di pojok kanan atas: tombol lebar-penuh di bawah ada di zona jempol dan netral tangan kiri/kanan (Bagian 9.2).

### 8.4 Template D — Pengaturan

```
┌ TopBar 64: "Pengaturan"                            ┐
│ Judul seksi "Pengingat"                        (48)│
│ ListItem 56  [ikon] "Pengingat harian"   [Switch]  │
│ ListItem 72  [ikon] "Waktu"  "08.00"            ›  │
│ Divider                                            │
│ Judul seksi "Data"                             (48)│
│ ListItem 56  "Ekspor data"                      ›  │
│ ListItem 56  "Hapus semua data"  (teks error) …    │   → dialog (aksi permanen)
│ ↓ 24 (di akhir)  versi aplikasi (bodySmall)        │
└────────────────────────────────────────────────────┘
```

- Switch berlaku **seketika**. Item destruktif memakai teks `error` + ikon (bukan hanya warna) dan **selalu** membuka dialog konfirmasi.

### 8.5 Template E — Layar penuh kosong/error/loading

Tengah vertikal (sedikit ke atas), memakai komponen 7.16. Tidak ada top bar kustom; top bar layar induk tetap tampil.

### 8.6 Template F — Onboarding (opsional)

- **Maksimal 3 halaman** atau tidak ada sama sekali. Studi NN/g pada 4 aplikasi iOS (70 pengguna): tidak ada beda keberhasilan antara yang membaca dan melewati tutorial, dan pembaca menilai tugas lebih sulit [S7] → **upayakan antarmuka cukup jelas tanpa tutorial** dan beri bantuan **kontekstual** (11.3).
- Setiap halaman: ilustrasi/ikon 96–120 dp, `headlineMedium` (≤ 2 baris), `bodyLarge` (≤ 3 baris), tombol `filled lg` "Lanjut" di bawah, tombol `text` "Lewati" **selalu terlihat**.
- Tidak ada pembatas akun/izin sebelum pengguna melihat nilai aplikasi [D]. Izin notifikasi **tidak** diminta di onboarding (11.4).

---

## 9. UX: penempatan elemen & zona jempol

Bagian ini menjawab pertanyaan "apakah pengguna nyaman kalau tombolnya di posisi ini?" dengan data, batas data, dan aturan yang bisa diterapkan.

### 9.1 Apa kata data (dan batasnya)

Sumber utama: Steven Hoober, *How Do Users Really Hold Mobile Devices?* (UXmatters, 18 Feb 2013) [S2].

| Temuan | Angka |
|---|---|
| Jumlah pengamatan | 1.333 orang (Nov 2012 – 8 Jan 2013); **780** di antaranya sedang menyentuh layar |
| Cara memegang | **49%** satu tangan · **36%** digendong (*cradled*: satu tangan menopang, tangan lain mengetuk) · **15%** dua tangan |
| Satu tangan: jempol mana | **67% kanan**, **33% kiri** |
| Digendong | 72% mengetuk dengan jempol, 28% dengan jari |
| Peta jangkauan | Zona jangkauan (hijau-kuning-merah) digambarkan hanya **secara perkiraan**; artikel **tidak** memberi ukuran target dalam mm |

**Batasan yang harus kamu ketahui:**

1. Datanya berusia **13 tahun**. Ponsel saat itu berlayar ±4"; ponsel Android sekarang 6–6,8", sehingga **area atas lebih sulit dijangkau daripada di data**, bukan lebih mudah.
2. Ini pengamatan perilaku di tempat umum, bukan eksperimen terkontrol pada aplikasi tertentu.
3. Peta zona sering disalahpahami sebagai batas kaku. Perlakukan sebagai **arah** (bawah-tengah mudah, sudut atas sulit), bukan garis presisi.

Karena itu keputusan di bawah berlabel **[D]**: ia diturunkan dari data arah ini, ditambah aturan ukuran target yang sudah terverifikasi (48 dp, [S1]).

### 9.2 Peta zona (layar 360×800) dan aturan penempatan [D]

```
y = 0   ┌──────────────────────────────┐
        │ ZONA SULIT  (atas ±25%)       │  y 0–200
        │ Top bar, ⋮, ikon kembali       │  → aksi langka / berbahaya / navigasi balik
y = 200 ├──────────────────────────────┤
        │ ZONA SEDANG (tengah ±35%)      │  y 200–480
        │ Konten yang dibaca & digulir   │  → isi, daftar, kartu
y = 480 ├──────────────────────────────┤
        │ ZONA MUDAH  (bawah ±40%)       │  y 480–800
        │ Aksi utama, nav bar, CTA, FAB  │  → aksi sering & penting
y = 800 └──────────────────────────────┘
```

Batas persentase adalah **aproksimasi desain [D]**, bukan hasil pengukuran.

| Elemen | Letak | Alasan | Bukti |
|---|---|---|---|
| **Navigasi utama (tab)** | **Bawah**, `NavBar` 80 dp | Dipakai terus-menerus; harus di zona mudah. Dan harus **terlihat**, bukan di drawer | [S2] arah zona; [S9] 57% vs 86% |
| **Aksi utama membuat sesuatu** (layar daftar) | `FAB` kanan-bawah | Zona mudah; konvensi Android yang sudah dikenal | [C] + [S2] |
| **Aksi utama menyelesaikan form** | **Tombol lebar-penuh di bar bawah** (56 dp) | Zona mudah **dan netral tangan**: 33% pengguna satu-tangan memakai jempol kiri, jadi aksi yang hanya ada di kanan merugikan mereka | [S2] 67/33 |
| **Menyelesaikan item** (aksi inti tracker) | `CheckCircle` di **tepi kiri** baris, area 48 | Dijangkau jempol kiri **dan** kanan di tengah-bawah layar; dilakukan puluhan kali | [D] |
| **Kembali / tutup** | Pojok kiri atas (`back`/`close`) **+** tombol Kembali sistem/gestur | Pojok atas sulit dijangkau, tetapi pengguna Android punya jalur kedua (gestur/tombol sistem) sehingga tidak ada beban | [C] |
| **Aksi berbahaya** (hapus) | **Menu `⋮` pojok kanan atas**, di dalam dialog konfirmasi bila permanen | Sengaja di zona **sulit** agar tidak terketuk tanpa sengaja; aksi langka tidak perlu mudah | [D] + [S8] |
| **Filter** | Baris chip di atas daftar (gulir horizontal), atau bottom sheet | Chip terlihat tanpa membuka menu; sheet muncul di zona mudah | [D] |
| **Pencarian** | Ikon di top bar → layar pencarian dengan field di atas + keyboard muncul | Mengetik tidak bergantung zona jempol (keyboard di bawah menutup layar) | [D] |
| **Toast/snackbar** | Bawah, di atas nav bar | Dekat jempol ⇒ aksi "Urungkan" mudah dijangkau | [C] |
| **Dialog** | Tengah; aksi di **kanan-bawah dialog** | Aksi di dalam dialog selalu di bagian bawah dialog | [C] |

### 9.3 Aturan jarak antara aksi berdekatan

| Situasi | Aturan | Bukti |
|---|---|---|
| Dua target bersebelahan | Jarak antar-area sentuh ≥ **8 dp** | [S1] |
| Aksi aman di dekat aksi berbahaya | Jarak ≥ **24 dp**, dan aksi berbahaya **tidak** memakai warna/gaya aksi utama | [D] |
| Tombol ganda (dialog/bar) | Urutan: sekunder kiri, utama kanan; lebar sama; jarak 12 | [C] |
| Aksi utama dengan keyboard terbuka | Bar aksi menempel **di atas keyboard**, tidak tertutup | [D] |
| Elemen dekat tepi layar | Hindari target penting dalam **16 dp** dari tepi kiri/kanan (bersaing dengan gestur kembali sistem) | [C] |

### 9.4 Mengapa tidak "semua di bawah"?

Memindahkan **semua** kontrol ke bawah juga salah: konten yang dibaca perlu ruang, dan layar bagian bawah sudah diisi nav bar (80 dp) dan inset gestur. Prinsipnya **frekuensi × risiko**:

| | Risiko rendah (bisa urung) | Risiko tinggi (tak bisa urung) |
|---|---|---|
| **Sering** | Zona mudah, satu ketukan (CheckCircle, FAB) | Zona mudah + konfirmasi/undo |
| **Jarang** | Zona mana saja, boleh di menu ⋮ | **Zona sulit** + dialog konfirmasi |

### 9.5 Pengaturan sisi tangan (opsional, fase 2) [D]

Jika uji pengguna menunjukkan keluhan jangkauan: tambahkan pengaturan "Posisi tombol tambah: kiri / kanan". Tidak perlu di versi pertama karena alur form sudah memakai tombol lebar-penuh netral tangan.

---

## 10. UX: navigasi, gestur, form, aksi destruktif

### 10.1 Struktur navigasi

| Lapisan | Pola | Aturan |
|---|---|---|
| **Tab utama** | `NavBar` 3–5 tujuan (rekomendasi 4) | Tab selalu terlihat dan berlabel [S9]. Setiap tab mempertahankan state dan posisi gulirnya. Mengetuk tab aktif = gulir ke atas |
| **Layar turunan** | *Push* di atas tab (stack) | `TopBar` dengan `back`. Transisi bawaan native stack Android [D] |
| **Layar form/pembuatan** | Layar penuh bergaya modal | `TopBar` dengan `close` (×); aksi utama di bar bawah (8.3) |
| **Pilihan cepat/aksi** | Bottom sheet (7.15) atau dialog (7.14) | Sheet untuk daftar pilihan; dialog untuk konfirmasi |
| **Drawer/hamburger** | **Tidak dipakai** untuk tujuan utama | Navigasi tersembunyi: pemakaian 57% vs 86%, tugas 15% lebih lambat [S9] |

**Perilaku Kembali** [C]:

- Tombol/gestur Kembali sistem = naik satu layar. Di layar tab utama: kembali ke tab pertama, lalu keluar aplikasi.
- **Jangan menghalangi Kembali** kecuali ada perubahan form belum tersimpan (dialog "Buang perubahan?"). Gestur *predictive back* Android didukung bila memakai native stack standar — itu alasan Bagian 6.3 melarang transisi layar kustom.
- Notifikasi/tautan dalam yang membuka layar turunan: tumpukan harus berisi **tab utama di bawahnya**, sehingga Kembali mendarat di tab, bukan keluar aplikasi.

### 10.2 Gestur

**Prinsip:** gestur adalah **pintasan**, bukan satu-satunya jalan [D]. Gestur tersembunyi sulit ditemukan; data NN/g tentang navigasi tersembunyi (penemuan turun > 20%) menunjukkan akibatnya pada elemen yang tidak terlihat [S9].

| Gestur | Boleh? | Aturan |
|---|---|---|
| Ketuk | Ya | Aksi utama. Area ≥ 48 dp |
| Gulir vertikal | Ya | Standar |
| Gulir horizontal | Hanya pada baris chip/karusel | Tidak boleh bentrok dengan Kembali sistem: hindari mulai dari 16 dp tepi |
| Geser item (*swipe*) untuk hapus/aksi | **Hanya sebagai pintasan tambahan**; jalur terlihat (menu ⋮ di detail) **wajib** ada | Hindari sebagai satu-satunya jalan; hasil geser harus bisa **diurungkan** |
| Tekan lama | Hanya untuk pilih-ganda/menu konteks tambahan | Jalur terlihat wajib ada (mis. ikon "Pilih") |
| Seret-urut (*reorder*) | Boleh | Wajib ada **pegangan seret** terlihat (ikon 24 dalam area 48) **dan** alternatif non-seret ("Naikkan"/"Turunkan") lewat aksi aksesibilitas TalkBack |
| Tarik-segarkan (*pull to refresh*) | Hanya bila data berasal dari server | Tidak untuk data lokal |
| Cubit/ketuk-ganda | **Tidak** dipakai | — |

### 10.3 Form

**Prinsip:** sesedikit mungkin field; satu kolom; label di atas [S11]; kesalahan di bawah field + ikon [S10].

1. **Urutan field** = urutan kepentingan/kebiasaan pengguna; yang wajib dulu. Pertimbangkan nilai bawaan yang masuk akal (waktu bawaan, kategori terakhir dipakai).
2. **Satu kolom.** Jangan menaruh dua field berdampingan, kecuali pasangan yang selalu dibaca bersama (jam mulai–selesai) dengan lebar masing-masing 158 dp pada layar 360 (328 − 12 jarak = 316; 316 ÷ 2 = 158).
3. **Pilih komponen menurut jumlah opsi** [D]:

| Jumlah opsi | Komponen |
|---|---|
| 2 (hidup/mati) | `Switch` |
| 2–4, saling eksklusif | Grup `Radio` atau chip pilihan tunggal |
| 5–7 | Bottom sheet berisi daftar |
| > 7 | Layar/sheet pencarian |
| Tanggal/waktu | Picker native Android |
| Warna/kategori | Grid swatch (kolom 4, area 48, **ikon + nama**, terpilih = ikon centang) |

4. **Validasi:** lihat 7.7. Setelah pengguna menyelesaikan field; error di bawah field dengan ikon; fokuskan field pertama yang salah saat kirim; **jangan menghapus isian** [S10].
5. **Model simpan:** form pembuatan/ubah = **tombol "Simpan" eksplisit** di bar bawah. Pengaturan (switch/pilihan) = **berlaku seketika**.
6. **Selesai:** tutup form, tampilkan snackbar "Tersimpan" (tanpa dialog "Berhasil!").
7. **Perubahan belum disimpan:** bila pengguna menekan ×/Kembali setelah mengubah sesuatu → dialog "Buang perubahan?" — aksi **"Lanjut mengedit"** (kiri) dan **"Buang"** (kanan).

### 10.4 Aksi destruktif: undo lebih baik daripada konfirmasi

NN/g: dialog konfirmasi hanya untuk aksi serius/tak bisa dibatalkan; **jangan** untuk aksi rutin karena orang jadi menekan "Ya" tanpa membaca; tombol harus menyebut hasilnya; dan **usahakan menyediakan undo** [S8].

| Jenis aksi | Perlakuan |
|---|---|
| **Dapat dibatalkan, satu item** (hapus satu catatan, arsipkan, hapus kebiasaan) | Lakukan **langsung**, tampilkan Snackbar "**… dihapus** · **Urungkan**" (8 dtk). Di lapisan data: hapus **lunak** (*soft delete*) sampai snackbar hilang, baru hapus permanen |
| **Tak dapat dibatalkan atau massal** (hapus semua data, atur ulang) | Dialog 7.14, judul spesifik, tombol "Hapus selamanya" (`danger`) dan "Batal". Hanya untuk kasus paling ekstrem boleh meminta mengetik kata kunci [S8] |
| **Perubahan belum disimpan** | Dialog "Buang perubahan?" (10.3) |
| **Aksi di pengaturan yang berdampak** | Dialog bila tak dapat dibatalkan; selain itu langsung + snackbar |

Warna: aksi destruktif memakai teks/ikon `error` **disertai ikon dan kata kerja jelas** — bukan hanya merah.

---

## 11. UX: umpan balik, state layar, onboarding, notifikasi, progres

### 11.1 Loading dan umpan balik berbasis waktu

Aturan waktu dari NN/g [S6]: beri **umpan balik langsung untuk setiap aksi**; gunakan indikator untuk aksi yang lebih lama dari **±1 detik**; animasi *looped* (spinner) untuk **2–10 detik**; indikator *percent-done* untuk **≥ 10 detik** (atau untuk rangkaian rekaman, mis. "3 dari 50"); tampilkan perkiraan selesai bila > 10 detik. **Dilarang:** teks "Memuat…" statis, peringatan "jangan tekan lagi", spinner untuk > 10 detik.

| Durasi | Perlakuan |
|---|---|
| Instan (data lokal) | **Tanpa indikator.** Langsung tampilkan konten |
| ≤ 1 dtk | Tanpa indikator; jangan memunculkan spinner sekilas (kedipan). Tunda indikator **300 ms** sebelum tampil [D] |
| 1–10 dtk | Spinner (`Loading` 7.12) di tempat aksi: di dalam tombol bila dipicu tombol; di tengah area konten bila memuat layar |
| ≥ 10 dtk | Indikator progres terukur + teks + perkiraan |
| Gagal | State *error* dengan **"Coba lagi"** (7.16); jangan hanya snackbar |

- **Skeleton** (kerangka abu-abu) **opsional [D]**, bukan wajib: artikel NN/g tentang progres tidak membahasnya sehingga saya tidak mengklaim bukti. Bila dipakai: untuk daftar dari jaringan yang memakan ≥ 1 dtk, dengan tata letak sama persis (agar tidak bergeser), warna `surfaceContainerHighest`, tanpa animasi berkedip cepat. Untuk data lokal tidak perlu.
- Jangan memblokir seluruh layar bila hanya satu bagian yang memuat.
- Aksi pengguna yang berefek ke server (mis. sinkron) memakai **pembaruan optimistis** + rollback dengan pesan jelas bila gagal [D].

### 11.2 Hierarki pesan (di mana pesan ditampilkan)

| Tingkat | Komponen | Contoh |
|---|---|---|
| Satu field salah | Error inline di bawah field (7.7) | "Nama tidak boleh kosong" |
| Satu bagian layar bermasalah | Banner di dalam konten (7.17) | "Sinkronisasi tertunda. Data tersimpan di perangkat ini." |
| Seluruh layar gagal | State *error* layar penuh (7.16) | "Gagal memuat" + "Coba lagi" |
| Konfirmasi ringan | Snackbar (7.13) | "Tersimpan", "Kebiasaan dihapus · Urungkan" |
| Aksi berisiko | Dialog (7.14) | "Hapus semua data?" |

**Aturan penulisan pesan error** [S10]: eksplisit, mudah dibaca manusia, sopan, tepat, dan **memberi saran perbaikan**; jangan salahkan pengguna; tanpa kode teknis. Format: **apa yang terjadi + apa yang bisa dilakukan** ("Pengingat tidak tersimpan. Periksa koneksi lalu coba lagi.").

### 11.3 Onboarding & bantuan kontekstual

Bukti: pada studi NN/g (70 pengguna, 4 aplikasi iOS), pembaca tutorial **tidak** lebih berhasil (91% vs 94%) dan menilai tugas **lebih sulit** (SEQ 4,92 vs 5,49); rekomendasinya: curahkan upaya untuk membuat UI mudah dipakai dan, bila perlu bimbingan, pakai bantuan **kontekstual** [S7]. Batasan studi: hanya 4 aplikasi iOS dan tugas sederhana — hasil belum tentu berlaku pada Android atau aplikasi kompleks [S7].

Keputusan [D]:

1. **Tidak ada tur fitur panjang.** Maksimal 3 halaman nilai (8.6), selalu bisa dilewati, atau nol halaman.
2. **Empty state mengajar** (7.16): setiap daftar kosong menjelaskan fungsinya dan punya satu tombol.
3. **Petunjuk kontekstual**: kartu kecil dapat ditutup (bukan modal) yang muncul **sekali**, tepat ketika fitur relevan pertama kali digunakan. Setelah ditutup, tidak muncul lagi (simpan flag).
4. Tidak ada pemblokir akun/izin sebelum pengguna mencapai nilai pertama.

### 11.4 Izin notifikasi (Android 13+)

Fakta dari dokumentasi Android [S12]: izin runtime `POST_NOTIFICATIONS` berlaku di Android 13 (API 33)+; pada instalasi baru notifikasi **mati secara default**; bila aplikasi menargetkan API 33+, aplikasi **sepenuhnya mengendalikan kapan dialog izin muncul**; Google menganjurkan: "izinkan pengguna mengenal aplikasi lebih dulu", pemicunya aksi pengguna (mis. mengetuk tombol lonceng, mengikuti sesuatu, mengirim pesanan), atau menunggu peluncuran ke-3/4; dan menjelaskan konteks dan alasannya dengan jelas agar pengguna lebih mungkin setuju.

Alur yang diwajibkan [D]:

1. **Jangan minta saat peluncuran pertama atau di onboarding.**
2. Pemicu = pengguna **mengaktifkan pengingat** (mengetuk "Aktifkan pengingat" atau saat membuat pengingat pertama).
3. **Layar/sheet penjelasan sendiri** (bukan dialog sistem): judul "Aktifkan pengingat?"; isi satu-dua kalimat nilai ("Kami kirim pengingat pada jam yang kamu pilih. Matikan kapan saja di Pengaturan."); tombol `filled` "Aktifkan", `text` "Nanti saja".
4. Hanya bila memilih "Aktifkan" → panggil dialog izin sistem (`expo-notifications`, `requestPermissionsAsync`) [C].
5. Diizinkan → snackbar "Pengingat aktif". Ditolak → banner non-menghakimi di layar pengingat: "Pengingat belum aktif" + tombol "Buka pengaturan". **Jangan** menampilkan ulang permintaan sendiri berkali-kali.
6. Setelah penolakan berulang sistem bisa berhenti memunculkan dialog [C — perilaku sistem; verifikasi di perangkat]; karena itu jalur "Buka pengaturan" wajib ada.

### 11.5 Progres, *streak*, dan motivasi

> **Catatan bukti:** saya **tidak menemukan studi kuat** tentang *streak* pada aplikasi pelacak kebiasaan (hanya glosarium dan halaman toko aplikasi). Seluruh isi bagian ini adalah **keputusan desain [D]** berdasarkan prinsip "tidak menghukum" (Bagian 2), bukan klaim empiris.

1. **Tampilkan progres sebagai "x dari y" + bentuk visual** (`ProgressBar`/`ProgressRing`), bukan hanya persentase atau warna (7.12).
2. **Rayakan secukupnya:** menyelesaikan item = animasi centang 200 ms + haptik ringan; menyelesaikan semua = *empty state* "Semua selesai hari ini" (7.16) dengan `highlight` pada satu elemen. Tidak ada animasi layar penuh yang menghalangi.
3. ***Streak* hanya satu sinyal di antara beberapa:** tampilkan bersama "terbaik: N hari" dan "N dari 7 hari minggu ini". Satu hari terlewat tidak boleh menghapus seluruh rasa kemajuan.
4. **Saat *streak* putus:** jangan merah, jangan kata "gagal"/"hilang". Gunakan netral dan mengajak: "Mulai lagi hari ini. Rekor terbaikmu 12 hari."
5. **Pengingat dikendalikan pengguna** (jam, hari, bisa dijeda). Teks pengingat tidak membuat rasa bersalah (11.5 ↔ Bagian 14).
6. `highlight` (jingga) dipakai hanya untuk momen aktif/pencapaian, maksimal satu elemen per layar (Bagian 2.2).

### 11.6 Format tanggal, waktu, dan angka (Bahasa Indonesia) [C]

| Jenis | Format | Contoh |
|---|---|---|
| Tanggal pendek | `d MMM yyyy` | 22 Okt 2026 |
| Tanggal panjang | `EEEE, d MMMM yyyy` | Kamis, 22 Oktober 2026 |
| Jam | 24 jam, titik pemisah | 08.00 |
| Desimal | Koma | 1,5 |
| Ribuan | Titik | 1.250 |
| Hari pertama pekan | Senin | — |

Gunakan `Intl`/`toLocaleString('id-ID')` dan **satu** modul format (`format.ts`), tidak memformat manual di layar. **Uji pada perangkat Android nyata** (dukungan `Intl` pada mesin JS bergantung konfigurasi) [C]. Semua angka tampil dengan `tabular-nums` (Bagian 4.4).

---

## 12. Implementasi React Native (Expo)

### 12.1 Tumpukan teknologi

| Kebutuhan | Pilihan | Catatan & bukti |
|---|---|---|
| Expo SDK | **SDK 57** (React Native 0.86, React 19.2) | Gunakan **`expo@57.0.17` atau lebih baru**: memperbaiki regresi memori Hermes V1 (reanimated/worklets, diperbaiki sejak 57.0.9) dan regresi waktu *startup* dev (57.0.17) [S13] |
| Edge-to-edge | Selalu aktif | Sejak SDK 54; tidak bisa dimatikan [S14] |
| Safe area | `react-native-safe-area-context` | `SafeAreaView` bawaan RN deprecated sejak 0.81 [S15] |
| Font | `expo-font` + `@expo-google-fonts/plus-jakarta-sans` | Statis per bobot [S17] |
| Ikon | `@react-native-vector-icons/lucide` | Pengganti `@expo/vector-icons` yang direncanakan di-*deprecate* [S16] |
| Animasi | `react-native-reanimated` (+ `react-native-gesture-handler` bila perlu seret) | SDK 57 memakai reanimated 4.5 / gesture-handler 2.32 [S13] |
| Haptik | `expo-haptics` | 6.3 |
| Notifikasi | `expo-notifications` | 11.4 [C] |
| Navigasi | Expo Router atau React Navigation (native stack + bottom tabs) | [C] belum saya teliti; syarat dari dokumen ini: native stack Android (10.1) dan `NavBar` kustom sesuai 7.4 |
| Pustaka UI pihak ketiga (Paper, dsb.) | **Tidak dipakai** | Bawaan M3 memakai chroma 32 dan ukuran sendiri; komponen kita dibangun dari token agar konsisten [D] |

### 12.2 Struktur berkas

```
src/
├─ theme/
│  ├─ colors.ts      ← dihasilkan dari skrip HCT (12.3); jangan diedit manual
│  ├─ tokens.ts      ← space, radius, size, type, elevation, motion, state
│  ├─ icons.ts       ← satu-satunya tempat nama ikon
│  └─ index.ts
├─ strings.ts        ← SEMUA teks UI (Bahasa Indonesia) — tidak ada teks mentah di JSX
├─ format.ts         ← format tanggal/jam/angka (id-ID)
├─ components/       ← komponen Bagian 7 (AppText, Button, IconButton, NavBar, TopBar, Fab, TextField, ListItem, Chip, Card, CheckCircle, Switch, ProgressBar, ProgressRing, Snackbar, Dialog, BottomSheet, EmptyState, Banner, Divider, SectionHeader)
└─ screens/          ← hanya mengimpor dari components/ dan theme/
```

**Aturan impor:** `screens/` **tidak boleh** mengimpor `react-native` secara langsung selain `ScrollView`, `View`, dan `FlatList` untuk tata letak, serta tidak boleh memakai `StyleSheet` dengan angka mentah. Gaya selalu dari token.

### 12.3 Token (`colors.ts` dihasilkan; `tokens.ts` ditulis tangan)

```ts
// FILE: src/theme/colors.ts
// DIHASILKAN dari Material Color Utilities (HCT). Jangan edit manual.
// Seed: primary hue 285 / chroma 64 · neutral chroma 4 · neutralVariant chroma 8
export const colors = {
  primary: '#4C4DCC',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E1DFFF',
  onPrimaryContainer: '#08006C',
  secondary: '#5D5C72',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E2E0F9',
  onSecondaryContainer: '#1A1A2C',
  tertiary: '#994700',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFDBC8',
  onTertiaryContainer: '#321300',
  highlight: '#FFA268',
  onHighlight: '#321300',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  success: '#066D2D',
  onSuccess: '#FFFFFF',
  successContainer: '#9CF7A5',
  onSuccessContainer: '#002108',
  warning: '#7F5600',
  onWarning: '#FFFFFF',
  warningContainer: '#FFDEAE',
  onWarningContainer: '#281900',
  background: '#FCF8FD',
  onBackground: '#1C1B1F',
  surface: '#FCF8FD',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#47464F',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F6F2F7',
  surfaceContainer: '#F0EDF1',
  surfaceContainerHigh: '#EBE7EC',
  surfaceContainerHighest: '#E5E1E6',
  surfaceDim: '#DCD9DE',
  outline: '#777680',
  outlineVariant: '#C8C5D0',
  inverseSurface: '#313034',
  inverseOnSurface: '#F3EFF4',
  inversePrimary: '#C1C1FF',
  scrim: '#000000',  // pakai dengan opacity 0.32
} as const;

export const categoryColors = {
  biru: '#0862BD',
  teal: '#006F6E',
  hijau: '#00732E',
  zaitun: '#6D6500',
  jingga: '#9E4C00',
  merah: '#AA3F3D',
  magenta: '#9B4089',
  ungu: '#764DB5',
} as const;
```

```ts
// FILE: src/theme/tokens.ts
export const space = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const;
export type SpaceKey = keyof typeof space;

export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 } as const;

export const size = {
  touchMin: 48,
  icon: 24,
  iconSmall: 18,
  avatar: 40,
  buttonSm: 40,
  buttonMd: 48,
  buttonLg: 56,
  fab: 56,
  field: 56,
  topBar: 64,
  navBar: 80,
  chip: 40,
  listOne: 56,
  listTwo: 72,
  listThree: 88,
  checkCircle: 28,
  progressBar: 8,
  progressRing: 56,
  progressRingLarge: 96,
  navIndicatorW: 64,
  navIndicatorH: 32,
  switchW: 52,
  switchH: 32,
  dragHandleW: 32,
  dragHandleH: 4,
  snackbarMin: 48,
  dialogMin: 280,
  dialogMax: 560,
  contentMax: 600,
} as const;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export type TypeRole =
  | 'displaySmall' | 'headlineMedium' | 'headlineSmall'
  | 'titleLarge' | 'titleMedium' | 'titleSmall'
  | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
  | 'labelLarge' | 'labelMedium' | 'labelSmall';

export type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  includeFontPadding: false;
};

function ts(family: string, fontSize: number, lineHeight: number, letterSpacing = 0): TypeStyle {
  return { fontFamily: family, fontSize, lineHeight, letterSpacing, includeFontPadding: false };
}

export const type: Record<TypeRole, TypeStyle> = {
  displaySmall:   ts(fontFamily.bold,     36, 44),
  headlineMedium: ts(fontFamily.bold,     28, 36),
  headlineSmall:  ts(fontFamily.semibold, 24, 32),
  titleLarge:     ts(fontFamily.semibold, 22, 28),
  titleMedium:    ts(fontFamily.semibold, 16, 24),
  titleSmall:     ts(fontFamily.semibold, 14, 20),
  bodyLarge:      ts(fontFamily.regular,  16, 24),
  bodyMedium:     ts(fontFamily.regular,  14, 20),
  bodySmall:      ts(fontFamily.regular,  12, 16, 0.2),
  labelLarge:     ts(fontFamily.semibold, 14, 20, 0.1),
  labelMedium:    ts(fontFamily.medium,   12, 16, 0.4),
  labelSmall:     ts(fontFamily.medium,   11, 16, 0.4),
};

// Angka yang berubah/berjajar WAJIB memakai ini (Bagian 4.4).
export const tabularNums = { fontVariant: ['tabular-nums'] as Array<'tabular-nums'> };

// Batas pembesaran font OS (Bagian 4.4)
export const maxFontScale = { content: 2, chrome: 1.5 } as const;

export const elevation = { level0: 0, level1: 1, level2: 3, level3: 6 } as const;

export const motion = {
  duration: { short2: 100, short4: 200, medium2: 300, medium4: 400 },
  easing: {
    standard: [0.2, 0, 0, 1],
    decelerate: [0.05, 0.7, 0.1, 1],
    accelerate: [0.3, 0, 0.8, 0.15],
  },
} as const;

// Opasitas state-layer (Bagian 6.4)
export const state = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
  disabledContent: 0.38,
  disabledContainer: 0.12,
  scrim: 0.32,
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Spasi semantik (Bagian 5.2)
export const layout = {
  screenPaddingH: space[4],
  screenPaddingTop: space[4],
  sectionGap: space[6],
  cardPadding: space[4],
  cardGap: space[3],
  listPaddingH: space[4],
  listPaddingV: space[2],
  iconTextGap: space[4],
  fieldGap: space[4],
  groupGap: space[6],
  barPaddingH: space[4],
  barPaddingV: space[3],
  fabMargin: space[4],
} as const;
```

```ts
// FILE: src/theme/index.ts
export * from './colors';
export * from './tokens';
```

**Cara menghasilkan ulang `colors.ts`:** jalankan skrip HCT (`materialyoucolor` untuk Python, atau `@material/material-color-utilities` untuk Node) dengan seed di komentar berkas, lalu jalankan audit kontras (Bagian 3.6). Jangan mengubah hex dengan tangan: itu merusak jaminan kontras.

### 12.4 Ikon — satu tempat

```ts
// FILE: src/theme/icons.ts
// Nilai = nama ikon di paket @react-native-vector-icons/lucide.
// Nama bisa berubah antar-versi paket: verifikasi setiap nilai terhadap glyphmap saat instalasi.
export const icons = {
  add: 'plus',
  back: 'arrow-left',
  close: 'x',
  check: 'check',
  checkCircle: 'circle-check',
  circle: 'circle',
  error: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
  edit: 'pencil',
  delete: 'trash-2',
  more: 'ellipsis-vertical',
  settings: 'settings',
  notifications: 'bell',
  notificationsOff: 'bell-off',
  calendar: 'calendar',
  streak: 'flame',
  stats: 'chart-column',
  home: 'house',
  list: 'list',
  search: 'search',
  chevronRight: 'chevron-right',
} as const;
export type IconKey = keyof typeof icons;
```

### 12.5 Komponen acuan: `AppText` dan `Button`

Dua contoh ini menunjukkan **pola wajib** untuk semua komponen: gaya hanya dari token, semua state, area sentuh, dan aksesibilitas.

```tsx
// FILE: src/components/AppText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, maxFontScale, tabularNums, type, TypeRole } from '../theme';

type Props = TextProps & {
  variant?: TypeRole;
  color?: keyof typeof colors;
  tabular?: boolean;
  /** true untuk elemen berbidang tetap (label nav, chip, badge) */
  chrome?: boolean;
};

export function AppText({
  variant = 'bodyLarge',
  color = 'onSurface',
  tabular = false,
  chrome = false,
  style,
  ...rest
}: Props) {
  return (
    <Text
      maxFontSizeMultiplier={chrome ? maxFontScale.chrome : maxFontScale.content}
      style={[type[variant], { color: colors[color] }, tabular && tabularNums, style]}
      {...rest}
    />
  );
}
```

```tsx
// FILE: src/components/Button.tsx
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, size, space, state, withAlpha } from '../theme';
import { AppText } from './AppText';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;       // ikon 18 dp di awal
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const palette = {
  filled:   { bg: colors.primary,            fg: colors.onPrimary,            ripple: colors.onPrimary },
  tonal:    { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer, ripple: colors.onSecondaryContainer },
  outlined: { bg: 'transparent',             fg: colors.primary,              ripple: colors.primary },
  text:     { bg: 'transparent',             fg: colors.primary,              ripple: colors.primary },
  danger:   { bg: colors.error,              fg: colors.onError,              ripple: colors.onError },
} as const;

const heights = { sm: size.buttonSm, md: size.buttonMd, lg: size.buttonLg } as const;

export function Button({
  label, onPress, variant = 'filled', size: sz = 'md',
  icon, loading = false, disabled = false, fullWidth = false,
}: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  const hasBg = variant === 'filled' || variant === 'tonal' || variant === 'danger';

  const bg = disabled ? (hasBg ? withAlpha(colors.onSurface, state.disabledContainer) : 'transparent') : p.bg;
  const fg = disabled ? withAlpha(colors.onSurface, state.disabledContent) : p.fg;
  const borderColor = disabled ? withAlpha(colors.onSurface, state.disabledContainer) : colors.outline;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={sz === 'sm' ? { top: space[1], bottom: space[1] } : undefined}
      android_ripple={{ color: withAlpha(p.ripple, state.pressed), borderless: false }}
      style={[
        styles.base,
        {
          minHeight: heights[sz],
          backgroundColor: bg,
          paddingHorizontal: icon || sz === 'sm' ? space[4] : space[6],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'outlined' && { borderWidth: 1, borderColor },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} style={styles.leading} />
        ) : icon ? (
          <View style={styles.leading}>{icon}</View>
        ) : null}
        <AppText variant="labelLarge" style={{ color: fg }} numberOfLines={2}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 64,
    borderRadius: radius.full,
    overflow: 'hidden',          // agar ripple terpotong mengikuti pil
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  leading: { marginRight: space[2] },
});
```

```tsx
// FILE: src/components/Screen.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, size } from '../theme';

type Props = {
  children: React.ReactNode;
  /** true bila layar punya NavBar (tab utama) */
  hasNavBar?: boolean;
  /** true bila ada FAB */
  hasFab?: boolean;
};

export function Screen({ children, hasNavBar = false, hasFab = false }: Props) {
  const insets = useSafeAreaInsets();
  const bottom =
    (hasNavBar ? size.navBar : 0) + insets.bottom + (hasFab ? size.fab + 2 * layout.fabMargin : 0);
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPaddingH,
          paddingTop: layout.screenPaddingTop,
          paddingBottom: bottom,
          maxWidth: size.contentMax,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
```

> Catatan: `Screen` memberi `paddingBottom` = tinggi `NavBar` (80) + `insets.bottom` + FAB (56 + 2 × 16 = 88), sama dengan aturan di 5.4. Komponen `NavBar`/`TopBar` yang menempel di tepi menangani `insets` sendiri.

---

## 13. Aturan untuk AI agent (wajib dibaca sebelum menulis UI)

### 13.1 Instruksi yang ditempel ke agent (salin ke `CLAUDE.md` / `AGENTS.md` / prompt sistem)

```text
Kamu membangun UI untuk aplikasi Android (React Native / Expo, tema terang saja).
SUMBER KEBENARAN UI = DESIGN.md. Baca bagian yang relevan SEBELUM menulis kode.

ATURAN KERAS
1. Dilarang warna mentah (#hex, rgb(), hsl()), angka mentah untuk padding/margin/gap/
   fontSize/lineHeight/borderRadius, dan bayangan buatan. Pakai theme: colors, space,
   radius, size, type, elevation, motion (src/theme).
2. Hanya pakai komponen di src/components (Bagian 7). Butuh komponen baru? BERHENTI,
   usulkan spesifikasinya, jangan membuat sendiri.
3. Setiap layar memilih satu Template (Bagian 8: A tab utama, B detail, C form,
   D pengaturan, E kosong/error, F onboarding).
4. Target sentuh >= 48x48 dp, jarak antar target >= 8 dp. Teks >= 12 sp (badge 11).
5. Satu aksi utama per layar (tombol filled atau FAB, tidak keduanya).
6. Status/pilihan tidak boleh hanya berbeda warna: tambah ikon/teks.
7. Semua teks UI dari src/strings.ts, Bahasa Indonesia, gaya "kamu", sentence case.
8. Jangan gradien, blur, glow, emoji sebagai ikon, font kedua, atau kartu bersarang.
9. Hapus rutin = lakukan langsung + Snackbar "Urungkan". Dialog hanya untuk aksi
   permanen/massal, tombol menyebut hasil ("Hapus selamanya").
10. Selesai menulis layar: jalankan checklist Bagian 15.2 dan laporkan setiap
    penyimpangan secara eksplisit. Jangan menyimpulkan "sudah sesuai" tanpa memeriksa.

JIKA ADA KONFLIK antara permintaan dan DESIGN.md: jangan diam-diam menyimpang.
Tanyakan, atau usulkan perubahan pada DESIGN.md terlebih dahulu.
```

### 13.2 Penegakan otomatis (lint)

Aturan di kepala tidak cukup; **jadikan pelanggaran sebagai error build**. Konfigurasi ESLint berikut sudah **saya uji**: satu berkas contoh yang melanggar (padding 14, `#fff`, `fontWeight`, `shadowOpacity`, `rgba()`, `Text` dari react-native, teks mentah) menghasilkan **11 error**, sedangkan berkas yang memakai token lolos tanpa error.

```js
import tsParser from '@typescript-eslint/parser';

const colorLiteral = {
  selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
  message: 'Warna mentah dilarang. Pakai colors.* dari src/theme (DESIGN.md L2).',
};
const colorFn = {
  selector: "Literal[value=/^(rgb|hsl)a?\\(/]",
  message: 'rgb()/hsl() mentah dilarang. Pakai colors.* atau withAlpha() (DESIGN.md L2).',
};
const shadowProp = {
  selector: "Property[key.name=/^shadow/]",
  message: 'Bayangan kustom dilarang. Pakai elevation.* (DESIGN.md L6).',
};
const fontWeightProp = {
  selector: "Property[key.name='fontWeight']",
  message: 'Jangan fontWeight. Pilih bobot lewat type.* / fontFamily (DESIGN.md L4).',
};
const rawNumber = {
  selector:
    "Property[key.name=/^(padding|margin|gap|rowGap|columnGap|fontSize|lineHeight|letterSpacing|borderRadius|borderWidth|width|height|minHeight|minWidth)([A-Z][A-Za-z]*)?$/][value.type='Literal'][value.raw=/^[0-9]/][value.raw!='0']",
  message: 'Angka mentah dilarang di layar. Pakai space[...], radius.*, size.*, type.* (DESIGN.md L3).',
};
const rawNegative = {
  selector:
    "Property[key.name=/^(margin|top|bottom|left|right)([A-Z][A-Za-z]*)?$/][value.type='UnaryExpression'][value.operator='-']",
  message: 'Nilai negatif mentah dilarang. Pakai -space[...] atau tinjau ulang tata letak.',
};
const rawText = {
  selector: 'JSXText[value=/\\S/]',
  message: 'Teks mentah di JSX dilarang. Ambil dari src/strings.ts (DESIGN.md Bagian 14).',
};

const importBan = {
  paths: [
    {
      name: 'react-native',
      importNames: ['Text', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'SafeAreaView'],
      message: 'Pakai AppText / Button / Pressable komponen kita; SafeAreaView bawaan RN deprecated (DESIGN.md 5.4).',
    },
  ],
};

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/theme/**'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'no-restricted-syntax': ['error', colorLiteral, colorFn, shadowProp, fontWeightProp],
    },
  },
  {
    // layar: paling ketat
    files: ['src/screens/**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'no-restricted-syntax': ['error', colorLiteral, colorFn, shadowProp, fontWeightProp, rawNumber, rawNegative, rawText],
      'no-restricted-imports': ['error', importBan],
    },
  },
];
```

Pasang: `npm i -D eslint @typescript-eslint/parser`. Jalankan `npx eslint src` di CI dan sebelum commit. Aturan lintas-berkas lain (mis. "satu `filled` per layar") ditegakkan lewat review dan checklist 15.2.

### 13.3 Alur kerja agent per layar

1. **Baca** PRD untuk layar itu + Template (Bagian 8) + komponen yang dipakai (Bagian 7).
2. **Pilih template** dan sebutkan alasannya dalam satu kalimat.
3. **Susun** hanya dari komponen & token. Tidak ada gaya kustom di layar selain tata letak (`flex`, `gap` dari `space`).
4. **Isi semua state:** normal, kosong, memuat, error (7.16), dan (bila ada input) error validasi.
5. **Jalankan** lint + checklist 15.2. Tulis hasil per butir.
6. **Laporkan** penyimpangan: "Saya memakai X karena Y; perlu keputusan."

### 13.4 Cara mengubah sistem desain (agar tidak "bocor")

- Mau mengganti warna/ukuran/jarak? Ubah **token** (atau dokumen ini), bukan satu layar.
- Mau komponen baru? Tambahkan **spesifikasi** ke Bagian 7 (dimensi, state, aksesibilitas, bukti) → baru implementasi.
- Setiap perubahan token: jalankan ulang audit kontras (3.6) bila menyangkut warna.

---

## 14. Microcopy Bahasa Indonesia

> **Status bukti:** saya tidak menemukan pedoman UX writing Bahasa Indonesia yang baku dan berbasis data. Seluruh bagian ini adalah **keputusan desain [D]**. Prinsip yang bersandar pada data hanya satu: pesan error harus eksplisit, sopan, tepat, dan memberi saran perbaikan [S10]. Jika PRD kamu menetapkan nada merek, **ikuti PRD** dan perbarui tabel ini.

### 14.1 Nada & aturan gaya

| Aturan | Isi |
|---|---|
| Sapaan | **"kamu"** (akrab, bersahabat) di **seluruh** aplikasi. Jangan campur dengan "Anda". Boleh dihilangkan sama sekali bila kalimat tetap alami |
| Bahasa | Bahasa Indonesia baku-santai. Hindari serapan Inggris bila ada padanan yang lazim ("Simpan", bukan "Save"; "Pengaturan", bukan "Settings") |
| Kapitalisasi | *Sentence case*: huruf besar hanya di awal kalimat dan nama diri |
| Panjang | Tombol 1–2 kata (verba). Judul ≤ 6 kata. Kalimat penjelasan ≤ 2 kalimat |
| Verba tombol | Kata kerja yang menyebut **hasil**: "Simpan", "Tambah kebiasaan", "Hapus selamanya". Bukan "OK", "Ya", "Kirim" (bila tidak mengirim) |
| Tanda seru | Hanya untuk pencapaian, maksimal 1 per layar |
| Menyalahkan | Dilarang: "Kamu salah", "Gagal!" Gunakan kondisi sistem: "Belum tersimpan" |
| Angka & satuan | Selalu angka + satuan ("8 gelas", "12 hari"); format di 11.6 |
| Teks di kode | **Semua** string ada di `src/strings.ts`; tidak ada teks mentah di JSX (aturan lint 13.2) |

### 14.2 Kosakata baku (pakai / hindari)

| Pakai | Hindari |
|---|---|
| Simpan | Save, Submit, Kirim (bila bukan kirim) |
| Batal | Cancel, Tidak jadi |
| Hapus | Delete, Buang (kecuali "Buang perubahan") |
| Urungkan | Undo, Batalkan |
| Coba lagi | Retry, Ulangi |
| Selesai | Done, Finish, Beres |
| Tambah | Add, Buat baru |
| Ubah | Edit, Modifikasi |
| Pengaturan | Settings, Setelan |
| Lewati | Skip |
| Lanjut | Next, Berikutnya |
| Kembali | Back |
| Mengerti | OK, Oke, Got it |
| Pengingat | Reminder, Notifikasi (untuk fitur) |

### 14.3 Pola teks

| Situasi | Pola | Contoh |
|---|---|---|
| Judul tombol utama form | Verba + objek | "Simpan kebiasaan" |
| Error field kosong | "[Field] tidak boleh kosong" | "Nama tidak boleh kosong" |
| Error format | Sebut format yang benar | "Masukkan angka 1–99" |
| Error sistem | Apa yang terjadi + apa yang bisa dilakukan [S10] | "Pengingat tidak tersimpan. Periksa koneksi lalu coba lagi." |
| Konfirmasi ringan | Hasil, lampau | "Tersimpan" · "Kebiasaan dihapus" |
| Snackbar dengan undo | Hasil + aksi | "Kebiasaan dihapus · Urungkan" |
| Dialog destruktif | Judul spesifik + akibat + tombol hasil | Judul "Hapus semua data?" · Isi "Semua kebiasaan dan riwayat akan hilang dan tidak bisa dikembalikan." · Tombol "Batal" / "Hapus selamanya" |
| Buang perubahan | — | Judul "Buang perubahan?" · Isi "Perubahan yang belum disimpan akan hilang." · "Lanjut mengedit" / "Buang" |
| Empty state awal | Mengapa kosong + ajakan | Judul "Belum ada kebiasaan" · Isi "Mulai dengan satu kebiasaan kecil. Kamu bisa menambah lebih banyak nanti." · "Tambah kebiasaan" |
| Empty: tak ada hasil | — | "Tidak ada hasil" · "Coba kata kunci lain atau hapus filter." · "Hapus filter" |
| Empty: semua selesai | Apresiasi singkat | "Semua selesai hari ini" · "Sampai jumpa besok." |
| Loading panjang | Aksi + progres | "Mengekspor data… 3 dari 50" |
| Izin notifikasi (penjelasan) | Nilai + kendali | Judul "Aktifkan pengingat?" · "Kami kirim pengingat pada jam yang kamu pilih. Matikan kapan saja di Pengaturan." · "Aktifkan" / "Nanti saja" |
| Izin ditolak | Netral, ada jalan keluar | "Pengingat belum aktif" · "Aktifkan notifikasi di pengaturan perangkat agar pengingat sampai." · "Buka pengaturan" |

### 14.4 Teks notifikasi/pengingat (tanpa rasa bersalah)

| Hindari | Gunakan |
|---|---|
| "Kamu belum menyelesaikan apa pun hari ini!" | "Waktunya Minum air." |
| "Jangan putus streak-mu!" | "Satu langkah kecil hari ini?" |
| "Kamu gagal 3 hari berturut-turut" | "Mulai lagi hari ini. Rekor terbaikmu 12 hari." |

Prinsipnya: menyebut tindakan yang jelas dan ringan, bukan ancaman kehilangan (Bagian 2, Prinsip 6; 11.5).

### 14.5 Contoh `strings.ts`

```ts
// FILE: src/strings.ts
export const s = {
  common: {
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    undo: 'Urungkan',
    retry: 'Coba lagi',
    skip: 'Lewati',
    next: 'Lanjut',
    understood: 'Mengerti',
    saved: 'Tersimpan',
  },
  errors: {
    required: (field: string) => `${field} tidak boleh kosong`,
    generic: 'Terjadi kesalahan. Periksa koneksi lalu coba lagi.',
  },
  dialogs: {
    discardTitle: 'Buang perubahan?',
    discardBody: 'Perubahan yang belum disimpan akan hilang.',
    discardKeep: 'Lanjut mengedit',
    discardConfirm: 'Buang',
  },
} as const;
```

---

## 15. Aksesibilitas, QA & audit

### 15.1 Aksesibilitas (ringkasan aturan)

| Area | Aturan | Bukti |
|---|---|---|
| Kontras teks | ≥ 4,5:1 (teks besar ≥ 3:1). Semua pasangan token sudah diaudit (3.6) | WCAG 1.4.3 |
| Kontras komponen | Border, ikon, progres ≥ 3:1 (3.6) | [S5] |
| Warna bukan penanda tunggal | Ikon/teks menyertai status & pilihan (3.4, 7.9, 7.11) | WCAG 1.4.1; [S10] |
| Target sentuh | ≥ 48×48 dp; jarak ≥ 8 dp | [S1]; WCAG 2.5.8 min 24 px [S4] |
| Ukuran teks | `sp`; uji sampai **200%** (kurva nonlinear Android 14+); tinggi komponen `minHeight` | [S3] |
| TalkBack | Setiap kontrol: `accessibilityRole`, `accessibilityLabel` bila tanpa teks terlihat, `accessibilityState`; urutan fokus = urutan visual; judul layar diumumkan | [C] |
| Dialog/sheet | Fokus pindah ke judul saat terbuka, kembali ke pemicu saat tertutup; scrim tidak bisa difokuskan | [C] |
| Pesan dinamis | Error form & snackbar memakai `accessibilityLiveRegion="polite"` (atau umumkan lewat `AccessibilityInfo.announceForAccessibility`) | [C] |
| Gerak | Hormati "Hapus animasi" OS (6.3) | [C] |
| Seret-urut / geser | Selalu ada alternatif non-gestur (10.2); gunakan `accessibilityActions` untuk aksi khusus | [D] |
| Batas waktu | Snackbar berisi aksi "Urungkan" hilang setelah 8 dtk — pengguna TalkBack/motorik terbatas mungkin butuh lebih lama. Sediakan jalur pemulihan lain (mis. daftar "Dihapus baru-baru ini") bila datanya penting | [D] |

### 15.2 Daftar periksa per layar (centang semua sebelum dianggap selesai)

**Token & konsistensi**

- [ ] Tidak ada warna/angka/bayangan mentah; `npx eslint src` bersih (13.2).
- [ ] Layar memakai tepat satu Template (Bagian 8) dan hanya komponen Bagian 7.
- [ ] Semua teks dari `strings.ts`; Bahasa Indonesia; gaya "kamu"; *sentence case*.
- [ ] Ikon berasal dari `icons.ts`; setiap nama ikon valid di `glyphmap` paket.
- [ ] Hanya satu tombol `filled`/FAB; tidak ada dua aksi utama.
- [ ] Maksimal 3 tingkat teks per kartu; tidak ada kartu bersarang.
- [ ] Angka yang berubah memakai `tabular-nums`.

**UX**

- [ ] Aksi sering ada di zona mudah (bawah); aksi berbahaya di menu ⋮ / dialog (9.2).
- [ ] Jarak aksi aman ↔ berbahaya ≥ 24 dp (9.3).
- [ ] Hapus rutin = langsung + Snackbar "Urungkan"; dialog hanya aksi permanen (10.4).
- [ ] Form: label di atas, error inline di bawah + ikon, validasi setelah field selesai, isian tidak terhapus (7.7).
- [ ] State lengkap: normal, kosong, memuat, error (7.16, 11.1).
- [ ] Tidak ada gestur tanpa jalur alternatif terlihat (10.2).
- [ ] Tab utama terlihat dan berlabel; Kembali sistem berperilaku wajar (10.1).

**Perangkat & aksesibilitas (uji manual)**

- [ ] Lebar **320, 360, 384, 412 dp**: tidak ada teks terpotong/tombol terdorong keluar.
- [ ] **Ukuran font OS 200%** dan **ukuran tampilan terbesar**: semua teks terbaca, tidak tumpang tindih, tombol tetap terjangkau.
- [ ] Status bar 24 dan 48 dp; bilah gestur dan 3 tombol: konten tidak tertutup (5.4, 5.5).
- [ ] **TalkBack**: semua kontrol terbaca dengan label bermakna; dialog/sheet memindahkan fokus.
- [ ] Keyboard terbuka: bar aksi dan field aktif terlihat.
- [ ] "Hapus animasi" OS aktif: tidak ada gerak penting yang hilang maknanya.
- [ ] Pemindai aksesibilitas Android (Accessibility Scanner) tanpa temuan target/kontras [C].
- [ ] Font termuat sebelum render pertama (tidak ada "lompatan" font).

### 15.3 Hasil audit dokumen ini

Audit dilakukan dengan skrip, bukan dengan mata. Hasil terukur:

| Pemeriksaan | Hasil |
|---|---|
| Kontras teks/UI semua pasangan token (3.6) | 33 pasangan, **0 gagal** |
| Kontras teks pada state-layer 8/10/16% (3.6) | 12 kombinasi, **0 gagal** |
| Verifikasi silang rumus kontras (pustaka independen) | Selisih ≤ 0,0003 |
| Aksen (`primary/error/success/warning`) di semua `surfaceContainer*` | Minimum 5,00:1 |
| Warna kategori di semua `surfaceContainer*` | Minimum 4,63:1 |
| Klaim HCT "tone ±40 ⇒ 3:1", "tone ±50 ⇒ 4,5:1" | 40 terbukti (min 3,152); 50 **tidak mutlak** (min 4,455) — ditangani dengan memakai selisih 60 pada pasangan teks (T40 vs T100 = 6,4–6,5:1) |
| Aritmetika tinggi (hero 124, nav 80, form 104/field, lebar kolom) | Dihitung ulang; konsisten (Bagian 5, 8) |
| Konsistensi angka lintas bagian (ukuran, spasi, radius, tipe) | Diperiksa dengan skrip terhadap `tokens.ts` — lihat 15.4 |
| Kode contoh (`tokens.ts`, `AppText`, `Button`, `Screen`, `icons.ts`, `strings.ts`) | Dikompilasi dengan TypeScript terhadap tipe React Native 0.86.3 — lihat 15.4 |
| Aturan ESLint penegak token | Diuji: berkas pelanggar = 11 error; berkas benar = 0 |

### 15.4 Keterbatasan yang jujur & yang perlu kamu verifikasi

1. **PRD tidak terlampir.** Template layar (Bagian 8) dan contoh teks (Bagian 14) bersifat generik. Cocokkan dengan PRD: daftar layar, istilah domain, alur utama, apakah ada backend/sinkronisasi (menentukan perlunya loading/skeleton).
2. **Nilai berlabel [C]** (tinggi komponen, *line-height*, durasi gerak, sebagian radius) berasal dari cermin dokumentasi dan pengetahuan saya, bukan dari halaman resmi M3 (tidak terbaca alat saya). Cocokkan secara visual pada perangkat nyata; menyimpang sedikit **tidak** merusak sistem selama diubah di token.
3. **Nilai berlabel [D]** adalah penilaian desain. Warna merek, pilihan font, tinggi tombol 48/56, dan aturan *streak* sebaiknya **diuji pada pengguna nyata** sebelum dikunci.
4. **Data zona jempol berusia 13 tahun** (Hoober, 2013). Pakai sebagai arah; uji jangkauan pada ponsel besar (6,5"+).
5. **Tidak ada pengujian di perangkat fisik** pada sesi ini. Render font, `tabular-nums`, perilaku keyboard pada edge-to-edge, dan `Intl` `id-ID` **wajib diverifikasi di Android nyata**.
6. **Nama paket/ikon** (`@react-native-vector-icons/lucide`, nama glyph di `icons.ts`, nama ekspor komponen ikon, fungsi `expo-haptics`) harus diverifikasi saat instalasi karena bisa berbeda antar-versi.
7. **Bukti skeleton/streak/microcopy:** tidak ada studi kuat yang saya temukan; semuanya keputusan desain.
8. Dokumen ini **Light saja**. Bila kelak butuh mode gelap, itu perubahan sistem (versi 2.0): palet gelap dihasilkan dari palet HCT yang sama, dan seluruh audit kontras diulang.

---

## 16. Sumber

**Cara membaca:** *Primer* = dokumen resmi pembuat standar/platform atau lembaga riset yang membuka halaman aslinya. *Sekunder* = cermin dokumentasi, port library, atau ringkasan pihak ketiga yang memuat angka spesifikasi — dipakai karena halaman resmi M3 tidak terbaca (hanya JavaScript), sehingga nilainya berlabel **[C]** di dokumen. Semua sumber diakses pada 22–23 Oktober 2026.

| Kode | Sumber | Dipakai untuk | Jenis |
|---|---|---|---|
| S1 | [Android Accessibility Help — Touch target size](https://support.google.com/accessibility/android/answer/7101858) | 48 dp (≈ 9 mm), kisaran 7–10 mm, jarak ≥ 8 dp | Primer |
| S2 | [Hoober — How Do Users Really Hold Mobile Devices? (UXmatters, 18 Feb 2013)](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php) | 1.333 pengamatan; 49/36/15%; jempol 67% kanan, 33% kiri | Primer (berusia 13 tahun) |
| S3 | [Android 14 — Fitur & perilaku](https://developer.android.com/about/versions/14/features) | Font scaling hingga 200%, kurva nonlinear, uji pada 200% | Primer |
| S4 | [W3C WCAG 2.2 — Understanding SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Target ≥ 24×24 CSS px dan pengecualian | Primer |
| S5 | [W3C WCAG 2.2 — Understanding SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | Komponen UI/grafik ≥ 3:1; pengecualian disabled | Primer |
| S6 | [NN/g — Progress Indicators Make a Slow System Less Insufferable](https://www.nngroup.com/articles/progress-indicators/) | Ambang ±1 dtk, 2–10 dtk, ≥ 10 dtk; larangan teks statis | Primer |
| S7 | [NN/g — Mobile App Tutorials (Onboarding)](https://www.nngroup.com/articles/mobile-tutorials/) | 70 pengguna/4 app iOS; 91% vs 94%; SEQ 4,92 vs 5,49; bantuan kontekstual | Primer |
| S8 | [NN/g — Confirmation Dialogs Can Prevent User Errors](https://www.nngroup.com/articles/confirmation-dialog/) | Dialog hanya untuk aksi serius; tombol menyebut hasil; sediakan undo | Primer |
| S9 | [NN/g — Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/) | 57% vs 86%; penemuan turun > 20%; 15% lebih lambat | Primer |
| S10 | [NN/g — Error-Message Guidelines (Errors in Forms)](https://www.nngroup.com/articles/errors-forms-design-guidelines/) | Error di bawah field; ikon bersama warna; validasi setelah selesai | Primer |
| S11 | [Baymard — Mobile Forms: Avoid Inline Labels](https://baymard.com/blog/mobile-forms-avoid-inline-labels) | Label terpisah di atas; placeholder untuk contoh; floating label belum teruji | Primer (riset) |
| S12 | [Android Developers — Notification runtime permission](https://developer.android.com/develop/ui/views/notifications/notification-permission) | `POST_NOTIFICATIONS`, default mati, minta dalam konteks | Primer |
| S13 | [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57) | RN 0.86; `expo@57.0.17` minimum aman; reanimated 4.5, gesture-handler 2.32 | Primer |
| S14 | [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54) | Edge-to-edge selalu aktif; `SafeAreaView` deprecated | Primer |
| S15 | [React Native 0.81 — blog](https://reactnative.dev/blog/2025/08/12/react-native-0.81) | `SafeAreaView` deprecated; Android 16 wajib edge-to-edge | Primer |
| S16 | [Expo — Moving away from @expo/vector-icons](https://expo.dev/blog/moving-away-from-expo-vector-icons) | Rencana deprecate; paket `@react-native-vector-icons/*` (contoh `lucide`) | Primer |
| S17 | [Expo docs — Fonts](https://docs.expo.dev/develop/user-interface/fonts) | Config plugin vs `useFonts`; variable font SDK 58+; satu nama per bobot Google Fonts | Primer |
| S18 | [React Native — Text style props](https://reactnative.dev/docs/text-style-props) · [Text (arsip)](https://archive.reactnative.dev/docs/text) · [PR #29176](https://github.com/facebook/react-native/pull/29176) | `fontVariant` tabular-nums (Android sejak RN 0.62), `allowFontScaling`, `maxFontSizeMultiplier` | Primer |
| S19 | [StatCounter — Mobile screen resolution, Indonesia (Sep 2026)](https://gs.statcounter.com/screen-resolution-stats/mobile/indonesia) | 360×800 8,94% dst. | Primer (data) |
| S20 | [Material Foundation HCT (cermin: cogentcore)](https://github.com/cogentcore/core/blob/v0.1.3/colors/cam/hct) | Klaim selisih tone 40 ⇒ 3:1, 50 ⇒ 4,5:1 (**diuji sendiri**, 1.2) | Sekunder + uji sendiri |
| S21 | [pub.dev — m3e_typography](https://pub.dev/packages/m3e_typography) | Tabel 15 peran: 57/45/36/32/28/24/22/16/14/16/14/12/14/12/11 | Sekunder |
| S22 | [material-components-android — BottomNavigation.md](https://gitea.com/784622644/material-components-android/src/branch/master/docs/components/BottomNavigation.md) · [Chip.md](https://gitea.com/784622644/material-components-android/src/branch/master/docs/components/Chip.md) | Nav flexible 80→64 dp, indikator 64→56; chip tinggi minimum 32 + target sentuh | Sekunder (cermin dokumentasi resmi) |
| S23 | [frust-material — state_layer (token Compose Material3)](https://docs.rs/frust-material/latest/frust_material/state_layer/index.html) | Hover 8, focus 10, pressed 10, dragged 16% | Sekunder |
| S24 | [Qualibooth — What is color blindness](https://www.qualibooth.com/resources/what-is-color-blindness/) | ± 1 dari 12 pria, 1 dari 200 wanita | Sekunder |
| S25 | [Superdesign — Material design system](https://superdesign.dev/blog/material-design-system) | Level elevasi 0, 1, 3, 6, 8, 12 dp | Sekunder |
| S26 | [egui-material3 — dialog spec](https://docs.rs/egui-material3/latest/src/egui_material3/dialog.rs.html) | Dialog: radius 28, lebar 280–560, padding 24 | Sekunder |
| S27 | [expressive_m3 — ExpressiveMotion](https://pub.dev/documentation/expressive_m3/0.2.0/expressive_m3/ExpressiveMotion-class.html) | Route enter emphasized-decelerate 400 ms; exit emphasized-accelerate 200 ms | Sekunder |
| S28 | [frust-material — sheet](https://docs.rs/frust-material/0.6.2/frust_material/sheet/) | Drag handle 32×4 dalam strip 48 dp | Sekunder |
| S29 | [pub.dev — material_design (token spasi & margin)](https://pub.dev/packages/material_design) | Margin kontainer compact 16 dp; token spasi 0/2/4/8/12/16/24… | Sekunder |

**Alat & data yang saya hasilkan sendiri** (tidak ada di sumber di atas, dapat diulang): palet HCT (`materialyoucolor`), audit kontras WCAG dua-metode (`coloraide`), simulasi buta warna (protan/deutan/tritan), pengukuran berkas font (`fontTools`: tinggi-x, `tnum`, lebar digit, cakupan glyph), uji klaim HCT pada 28.728 pasangan tone, kompilasi TypeScript terhadap tipe React Native 0.86.3, dan uji aturan ESLint.

---

*Akhir dokumen. Versi 1.0 — 23 Oktober 2026.*
