# Desain Visual Aktif: Kertas Hangat MyLife

> Dokumen desain resmi berdasarkan token aktual di `src/theme/today.ts`, `src/theme/colors.ts`, dan `src/theme/tokens.ts`.

---

## 1. Filosofi Visual
**"Kertas Hangat MyLife"** menggunakan estetika *stationery* yang tenang, hangat, dan ramah sentuhan (*tactile*):
- Permukaan kertas krem lembut dengan garis tepi tipis (*hairline border*) menggantikan bayangan berat.
- Aksen pastel terarah untuk membedakan konteks (Target, Tugas, Kalender, Pengaturan) tanpa mengganggu fokus membaca.
- Tipografi ramah untuk judul (*Fredoka*) dan sangat terbaca untuk konten harian (*Plus Jakarta Sans*).

---

## 2. Token Warna (`src/theme/today.ts` & `src/theme/colors.ts`)

| Peran | Token (`todayColors`) | Nilai Hex |
|---|---|---|
| Latar Belakang Utama | `paper` | `#F8EFDF` |
| Permukaan Kartu | `card` | `#FFFBF3` |
| Permukaan Kartu Sekunder | `cardSoft` | `#F3E7D2` |
| Teks Utama | `ink` | `#352E26` |
| Teks Sekunder | `muted` | `#716351` |
| Garis Pembatas | `line` | `#E6D9C3` |
| Aksen Emas (Hari Ini / Utama) | `gold` / `goldSoft` / `goldInk` | `#F4D187` / `#FBECC8` / `#5F4312` |
| Aksen Biru Langit (Kalender / Info) | `sky` / `skySoft` / `skyInk` | `#D4EAF0` / `#EAF5F8` / `#285461` |
| Aksen Lilac (Tugas / Fokus) | `lilac` / `lilacSoft` / `lilacInk` | `#E8DFF7` / `#F4EFFC` / `#4A3768` |
| Aksen Mint (Selesai / Sukses / Menu) | `mint` / `mintSoft` / `mintInk` | `#DEEDCF` / `#EFF7E7` / `#385723` |
| Aksen Peach (Peringatan / Tenggat) | `peach` / `peachSoft` / `peachInk` | `#F6D2C9` / `#FCECE8` / `#7C3626` |

---

## 3. Tipografi & Layout (`src/theme/tokens.ts`)

- **Display Font**: `Fredoka_500Medium` (judul layar & angka statistik utama).
- **Body & UI Font**: `PlusJakartaSans_400Regular`, `500Medium`, `600SemiBold`, `700Bold`.
- **Grid & Responsivitas**:
  - Skala spasi berbasis kelipatan `4pt` (`space`).
  - Lebar maksimum konten: `640px` (`layout.maxWidth`), breakpoint lebar `600px`.
  - Ukuran target sentuh minimum: `48x48dp` (`touchTarget.min: 48`).

---

## 4. Pola Navigasi & Layar Utama

1. **Bottom Navigation Bar (`src/app/(tabs)/_layout.tsx`)**:
   - Kapsul melayang (*floating pill*) berwarna `card` (`#FFFBF3`) dengan border `line` (`#E6D9C3`) dan sudut `borderRadius: 28`.
   - 5 slot: `Hari Ini` (gold), `Tugas` (lilac), tombol tengah `Tambah` (`TabFabButton` -> `/quick-add`), `Kalender` (sky), dan `Menu` (mint -> `AppSidebarDrawer`).
2. **Layar Hari Ini (`TodayFocusScreen`)**:
   - Header dengan tombol lonceng notifikasi (`/notifications`), widget **Jadwal Salat** (`PrayerTimesWidget`), hero card **Focus Timer** (dengan jam analog `MinuteDial` & tombol mulai kecil 5 menit), panel **Rencana Hari Ini** (`DayPlanPanel`), dan daftar terpadu prioritas + jadwal hari ini.
3. **Layar Tugas (`TaskListScreen`, `TaskDetailScreen`, `TaskEditorScreen`)**:
   - Quick-capture ke Kotak Masuk, filter status/perencanaan (`INBOX`, `TODAY`, `ALL`, `SOMEDAY`, `WAITING`, `DONE`, `CANCELLED`), checklist langkah (`task_steps`), penjadwalan blok waktu/alarm keras, serta form layar penuh (`FormScreenHeader`).
4. **Layar Target (`TargetListScreen`, `TargetDetailScreen`, `CreateTargetScreen`)**:
   - Kartu Target bergaya tab map pastel (`folderMint`, `folderPeach`, `folderLilac`), ringkasan progres total, rincian tugas langsung + tahapan (`StageCard` yang bisa di-expand/collapse), dan form layar penuh.
5. **Layar Kalender (`AgendaScreen`, `CreateAgendaScreen`)**:
   - Dual mode via `PillTabs`: *Kalender Harian* (strip tanggal mingguan/bulanan, banner bentrok, rutinitas harian, jadwal komitmen, timeline agenda) dan *Jadwal Rutin* (tab hari `Sen`–`Min`).
6. **Layar Tinjauan, Notifikasi, & Pengaturan**:
   - `ReviewScreen` (`/review`), `NotificationsScreen` (`/notifications`), `ReminderStatusScreen` (`/reminders`), `SettingsScreen` (`/settings`), dan `AlarmRingingModal` (layar penuh saat alarm berbunyi).
