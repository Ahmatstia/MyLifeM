# Full Project Audit 360° — MyLife Mobile

Tanggal: **21 November 2026 (Asia/Jakarta)**  
Repositori: **D:/IT/Software Engineer/mobile/MyLife**  
Commit dasar: **9a4b083ac1916630c21cdff7330d4684ccbcd5c8**  
Objek audit: **working tree**, termasuk 10 file yang sudah berubah sebelum audit.  
Metode: discovery, penelusuran source, lint/typecheck, suite regresi, reproduksi pada SQLite sementara, inventaris AST, pemeriksaan advisori npm dengan izin pengguna, ekspor bundle Android/iOS, browser aplikasi, serta pengukuran dan inspeksi visual fixture 14 screen.

**Selama audit baseline, source aplikasi, konfigurasi, lockfile, dan database pengguna tidak diubah.** File baru audit berada di docs/audits. Repositori web yang ditemukan ketika mencari lokasi awal bukan objek penilaian laporan ini.

**Tindak lanjut 21 November 2026 — AUD-01 DIPERBAIKI atas instruksi pengguna.** Parser backup kini menerima ROUTINE. Suite backup lulus 52 pemeriksaan (45 sebelumnya + 7 regresi baru), termasuk kelima tipe jadwal pada schemaVersion 1/2 dan ekspor–pemulihan rutinitas beserta log hariannya melalui repository. Lint dan typecheck lulus. Bukti penutup ada di [aud-01-remediation.json](./aud-01-remediation.json). Pengguna kemudian melaporkan seluruh uji manual backup/pemulihan rutinitas berhasil mengikuti panduan Expo Go (**USER REPORTED PASS**, tidak diamati langsung; model perangkat/OS tidak dicatat).

**Paket managed task — AUD-02/03/04/16 DIPERBAIKI.** Status core menjadi acuan; transaksi SQLite sinkron melindungi metadata/core/prioritas dari penulisan sebagian dan kehilangan metadata saat operasi bersamaan. Kegagalan database diteruskan ke UI; pekerjaan notifikasi dipisahkan setelah commit. Harness resmi kini memock adapter notifikasi secara eksplisit. Delapan suite, lint dan typecheck lulus; suite baru `npm run test:managed` memuat 24 pemeriksaan. Dari 24 temuan baseline, **19 masih terbuka: 3 HIGH, 15 MEDIUM, 1 LOW**. Bukti: [managed-task-remediation.json](./managed-task-remediation.json). Pengguna kemudian melaporkan keenam uji manual alur data managed task berhasil mengikuti panduan Expo Go (**USER REPORTED PASS**, tidak diamati langsung; model perangkat/OS tidak dicatat). UI kegagalan simpan dan perilaku alarm native tetap perlu verifikasi terpisah.

JSON dan hash audit sebelumnya tetap merupakan snapshot sebelum remediation. Harness reproduce-findings.cjs mengharapkan bug baseline (termasuk F01–F04), dan check-source-preservation.cjs membandingkan hash baseline; keduanya akan menandai perubahan yang memang disengaja setelah fix. Gunakan suite resmi untuk regresi terkini. AUD-01 mengubah parser backup dan suite backup; paket managed mengubah repository, hook, form tambah/modal alarm, harness integrity dan menambah check-managed.cjs beserta perintah npm-nya. Tidak ada dependency, lockfile, skema atau database pengguna yang diubah.

## 1. Executive Summary

MyLife adalah aplikasi produktivitas pribadi lokal: target → proyek/tahapan → tugas → prioritas harian → sesi fokus, dengan agenda, jadwal mingguan/rutinitas, manajemen tugas beralarm, waktu salat, kategori, dan cadangan. Beban yang dinilai adalah satu pemilik di satu perangkat; tidak diasumsikan ada backend, kolaborasi, atau sinkronisasi cloud.

Pada baseline, fondasi database memiliki perlindungan nyata: foreign key, trigger kepemilikan, transaksi, arsip pra-migrasi, staging restore, dan penyimpanan sesi sebelum refleksi. Fitur manajemen tugas menyimpan metadata/status dalam JSON user_settings sekaligus tabel tasks dan melewati sebagian aturan status/transaksi/validasi. Paket managed telah menyambungkan aturan status bersama dan transaksi; penyimpanan metadata tetap JSON dengan format yang kompatibel. Celah validasi AUD-05 tetap menjadi backlog.

**Ditemukan 24 temuan utama: 0 CRITICAL, 7 HIGH, 16 MEDIUM, 1 LOW.** Empat temuan lanjutan adalah startup web, overflow layout fixture, partial-save jadwal mingguan, dan kegagalan pengaturan tanpa feedback. Confidence HIGH untuk bukti source/reproduksi, kecuali konsekuensi alarm native, transfer geometri fixture ke native, dan keterjangkauan eksploit dependensi yang masih terbatas. Tidak ada skor kualitas spekulatif.

Risiko terpenting:

1. Cadangan yang mengandung rutinitas sah tidak dapat diimpor pada baseline; **AUD-01 telah diperbaiki pada tindak lanjut di atas**.
2. Pada baseline sinkronisasi menghapus status IN_PROGRESS/CANCELLED dan penulisan konkuren kehilangan metadata; **AUD-02/03 telah diperbaiki**.
3. Pada baseline kegagalan core task dilaporkan berhasil; **AUD-04 telah diperbaiki** dengan rollback dan propagasi error.
4. Jalur navigasi normal ke modul Proyek terputus.
5. Alarm lagu/full-screen dijanjikan UI, tetapi alur saat aplikasi ditutup atau saat notifikasi diketuk belum memiliki implementasi yang memadai.

**Hasil lanjutan:** 91 assertion dari empat suite yang semula gagal bootstrap berhasil dijalankan dengan stub batas native khusus audit. Seluruh 14 screen dirender pada 320/360/412/768 px dan simulasi font 100/200% (112 kasus); 26 kasus memiliki elemen yang melampaui batas horizontal menurut pemeriksaan fixture. Ekspor JavaScript Android dan iOS berhasil. Browser aplikasi asli gagal membuka database karena SharedArrayBuffer tidak tersedia.

**Batas kesimpulan:** pengguna memakai Expo Go dan belum memiliki APK/development build sendiri. Expo Go SDK 58 tersedia di cache lokal, tetapi emulator baru dengan data kosong gagal boot karena WHPX ditolak Windows (80070005). APK tersebut tidak dipasang. ADB tetap tanpa perangkat; tidak ada pengujian aplikasi Android/iOS. Screenshot fixture berasal dari React Native Web dengan hook mock dan tanpa hydration, bukan screenshot native. Audit source dan pemeriksaan lokal yang dapat dijalankan telah selesai; QA native tetap terbuka dan tidak dinyatakan lulus.

### 1.1 Bukti yang disertakan

- [audit-evidence.json](./audit-evidence.json): 11 kasus reproduksi, rasio kontras, inventaris 162 file source, lokasi 54 TextInput, atribut kontrol, style aktual, dan hash source.
- [reproduce-findings.cjs](./reproduce-findings.cjs): harness reproduksi; hanya menggunakan database :memory:.
- [verification-results.json](./verification-results.json): hasil lint/typecheck dan tujuh suite yang dijalankan.
- [npm-audit.json](./npm-audit.json): keluaran advisori lengkap; tidak ada audit fix atau perubahan dependency.
- [continued-suite-results.json](./continued-suite-results.json): integrity 30, calendar 33, progress 15, timer 13 assertion lulus menggunakan [native-boundary-stub.cjs](./native-boundary-stub.cjs); source skrip asli tetap tidak berubah.
- [continuation-evidence.json](./continuation-evidence.json) dan [continuation-checks.cjs](./continuation-checks.cjs): empat pengujian tambahan pada SQLite memory/hook mock, termasuk partial-save weekly, error pengaturan, race kategori dan preservasi target legacy.
- [browser-application-evidence.json](./browser-application-evidence.json): startup aplikasi web asli; [live-web-evidence.json](./live-web-evidence.json): diagnosis setelah header sementara di proxy audit.
- [browser-layout-evidence.json](./browser-layout-evidence.json), [ui-fixture-manifest.json](./ui-fixture-manifest.json), dan [screenshots](./screenshots/): 112 pengukuran, 28 screenshot fixture terbaru, serta screenshot kegagalan startup web. Fixture awal fixture-initial-360.png tidak dipakai untuk kesimpulan layout karena pemetaan font telah diperbaiki pada generator baru.
- [continuation-verification.json](./continuation-verification.json): metadata bundle Android/iOS, batas emulator, ringkasan layout dan pemeriksaan hash source terakhir.
- [native-boot-evidence.json](./native-boot-evidence.json): baris log relevan kegagalan emulator audit; [final-check-results.json](./final-check-results.json): hasil verifikasi penutup.

Status digunakan secara ketat:

| Status | Makna dalam laporan |
|---|---|
| VERIFIED | Perilaku tertentu dibuktikan lewat eksekusi/hasil alat; tidak otomatis berarti seluruh fitur lulus |
| CODE REVIEWED | Alur source diperiksa; belum dibuktikan di perangkat |
| PARTIALLY REVIEWED | Inventaris/inspeksi sebagian tersedia; ada bagian yang belum diperiksa |
| NOT REVIEWED | Pengujian yang disebut belum dilakukan |
| NOT APPLICABLE | Tidak relevan untuk arsitektur/platform yang tersedia |

## 2. Project Architecture Overview

### 2.1 Stack dan konfigurasi aktual

Versi berikut diambil dari package-lock.json, bukan asumsi versi terbaru.

| Bagian | Implementasi |
|---|---|
| Aplikasi/runtime | Expo 58.0.19, React Native 0.88.0, React 19.3.0; Node audit 22.23.0 |
| Bahasa/build | TypeScript 6.0.3 strict, npm + package-lock, Babel/Metro |
| Entry point | package.json → expo-router/entry → src/app/_layout.tsx |
| Routing | Expo Router 58.0.26; 18 file route/layout, terdiri dari 16 route dan 2 layout |
| Penyimpanan | expo-sqlite 58.0.14; mylife.db; Drizzle ORM 0.45.4 |
| Schema/migrasi | src/db/schema.ts, src/db/schema-sql.ts, src/db/integrity.ts, src/db/migrations.ts; user_version 1 |
| Native | expo-notifications 58.1.6, expo-audio, expo-haptics, expo-keep-awake, file-system/sharing |
| Waktu salat | adhan 4.4.6; perhitungan koordinat lokal |
| State | useState/useRef, hook per fitur, useFocusedResource, beberapa store modul dengan listener |
| Styling | StyleSheet + src/theme; komponen shared/ui dan keluarga Sprout; NativeWind/Tailwind terpasang tetapi tidak menjadi jalur styling layar aktif yang ditelusuri |
| Autentikasi/API | Tidak ditemukan login, backend bisnis, atau query API jaringan pada alur fitur aktif; personal local-first |
| Distribusi | app.json portrait/light; target Android utama, EAS development/preview/production APK; folder native dihasilkan Expo |
| Testing | Tujuh skrip check-*.cjs; Node SQLite di memori, transpiler TS, mock React/native, render React Native Web |

### 2.2 Arsitektur yang benar-benar diterapkan

Struktur **per fitur dengan domain/data/presentation**, bukan Clean Architecture lengkap. Route umumnya adapter tipis. Hook presentation memanggil implementasi repository secara langsung; interface domain tidak diinjeksi. Screen create juga memanggil repository langsung. Ini masih proporsional untuk aplikasi lokal; tidak ada alasan audit untuk mengganti framework atau memecah menjadi microservices.

Alur utama:

    Expo Router / Screen / form
      → hook state dan refresh, atau repository langsung pada screen create
      → repository Drizzle / validator domain
      → koneksi expo-sqlite melalui proxy
      → SQLite, FK, index, trigger
      → query ulang saat focus kembali ke layar

Alur silang yang harus diperhatikan:

    managed_tasks_v1 (JSON dalam user_settings)
      ↔ tasks
      → daily_focus_items
      → timer dan statistik
      → native notification queue

    restore JSON
      → parseBackup
      → staging SQLite
      → transaksi penggantian data
      → remount navigasi
      → rekonsiliasi pengingat agenda

Batas tanggung jawab yang baik: normalisasi status dan kalkulasi progres bersama; validator tanggal lokal; penyimpanan sesi/transaksi; adapter file backup native/web. Batas yang bocor: repository daily-focus mengimpor managed-task → notification service → React Native, sehingga akses data murni juga menarik dependency native.

### 2.3 Inventaris data

Ada **13 tabel**: categories, life_pillars, targets, projects, stages, milestones, tasks, daily_focus_items, focus_sessions, agenda_events, user_settings, weekly_schedules, weekly_schedule_logs.

FK/trigger melindungi kepemilikan target/proyek/stage/task dan mempertahankan histori sesi. Lima trigger dicek saat startup. Penghapusan task melepaskan hubungan sesi/agenda sesuai FK; histori judul sesi dipertahankan. JSON managed_tasks_v1 dan custom_alarm_tracks_v1 tidak memiliki FK untuk isi nested-nya. Schema SQL dan schema Drizzle harus berubah bersama; tabel mingguan ditambahkan pada versi database 1 tanpa menaikkan nomor versi, sehingga upgrade parsial perlu tetap diuji.

Tidak ditemukan environment secret yang diperlukan alur lokal ini. Secure login, otorisasi server, CORS, API abuse, dan IDOR server: NOT APPLICABLE. Tidak ada klaim bahwa SQLite/JSON terenkripsi; backup adalah data teks yang pengguna ekspor secara sadar.

### 2.4 Dokumentasi dan sumber kebenaran

README mengarahkan ke START_HERE; PRD_V2 dan ARCHITECTURE_V2 membedakan rencana dari implementasi. DESIGN_V3 menyatakan desain Clean aktif, tetapi source memakai Sprout/Quicksand/Fredoka dan beberapa komponen timer bergaya lain. Dokumen implementasi R0.1–R0.5 adalah riwayat, bukan bukti test saat ini.

Tidak ditemukan CI workflow di repositori mobile yang diinventarisasi. AGENTS.md mewajibkan lint/typecheck; keduanya dijalankan. Folder vendor, .expo/cache, Git object, aset binary, dan hasil build tidak dihitung sebagai source aplikasi yang harus diaudit semantiknya.

## 3. Feature Inventory

**10 modul fitur**; tabel berikut memecahnya menjadi **24 kemampuan** agar hubungan fitur tidak tersembunyi. Semua kemampuan memiliki penelusuran source. VERIFIED hanya dipakai untuk subperilaku yang disebut.

Singkatan lokasi di tabel mengacu pada src/features/<modul>/. P berarti presentation; D berarti data. Inventaris source lengkap ada pada lampiran dan JSON bukti.

| ID | Kemampuan dan jalur | Data/validasi/state | Status dan hasil |
|---|---|---|---|
| FE01 | Daftar/filter target: targets/P/screens/target-list-screen | targetRepository, kategori; useFocusedResource | CODE REVIEWED; null kategori AUD-05, ringkasan AUD-10 |
| FE02 | Buat target: targets/new → CreateTargetScreen; modal lama | title/category/description/priority → targets | CODE REVIEWED; input/a11y AUD-17/18; load kategori gagal tidak memiliki CTA recovery khusus |
| FE03 | Detail/hapus target: targets/[id] | direct stage/task + rollup task proyek; konfirmasi delete | CODE REVIEWED; histori dipertahankan; lifecycle edit/arsip target bukan UI yang tersedia |
| FE04 | Daftar/filter proyek: (tabs)/projects | projects + summary; filter status | CODE REVIEWED; navigasi AUD-07; query AUD-20 VERIFIED |
| FE05 | Buat/tautkan proyek: projects/new | targets aktif; title/description/priority | CODE REVIEWED; pilihan target dibatasi AUD-08 |
| FE06 | Detail/lifecycle/hapus proyek | useProjectDetail → projectRepository | CODE REVIEWED; status lifecycle terpisah dari checklist; FK/cascade/rollback diuji suite integrity dengan native mock, interaksi lifecycle native belum diuji |
| FE07 | CRUD/reorder tahapan | stageRepository; parent TARGET/PROJECT | CODE REVIEWED; validasi nama + FK/trigger; form/menu diinventarisasi |
| FE08 | CRUD/status/estimasi tugas tahap | shared task-status + transaksi | CODE REVIEWED; aturan core ada; overwrite dari managed AUD-02 VERIFIED |
| FE09 | Pilih/lepas prioritas harian | dailyFocusRepository; unik task/date, maksimum 5 | CODE REVIEWED; pelepasan managed dibalik AUD-06 VERIFIED |
| FE10 | Buat tugas cepat | CreatePriorityScreen → addQuickTask | CODE REVIEWED; kategori dan waktu tidak disimpan AUD-09 |
| FE11 | Timer Pomodoro/Deep Flow/Stopwatch | focus_timer_v1 + focus_sessions; persist pause/resume/finalize | CODE REVIEWED; 13 assertion timer VERIFIED dengan stub native; perintah asli tetap gagal bootstrap AUD-16 |
| FE12 | Refleksi sesi | rating/obstacle/nextAction → sesi tersimpan | VERIFIED pada mock gagal/retry/double-submit; keyboard/layout native NOT REVIEWED |
| FE13 | Suara latar fokus | FocusTimerWidget activeSound | CODE REVIEWED; hanya pilihan visual AUD-10 |
| FE14 | Agenda harian, all-day, lintas malam, konflik | agendaRepository + agenda-time; useAgenda | CODE REVIEWED; 33 assertion kalender/agenda VERIFIED dengan native mock; pengiriman OS belum diuji |
| FE15 | Form dan hapus/toggle agenda | CreateAgendaScreen; AddEventModal lama | CODE REVIEWED; title/waktu divalidasi; date route dipertahankan; reminders warning pada halaman form tidak ditampilkan |
| FE16 | Master jadwal mingguan multi-hari | weeklyScheduleRepository + useWeeklySchedules | CODE REVIEWED; partial-save dan duplikasi retry VERIFIED C01/AUD-23; jam impor AUD-05 |
| FE17 | Proyeksi, checklist rutin, liburkan per tanggal | weekly_schedule_logs | CODE REVIEWED; tipe ROUTINE valid di domain/UI tetapi backup menolak AUD-01 VERIFIED |
| FE18 | Pengingat agenda dan mingguan | AgendaNotificationService; queue maksimum 50 | CODE REVIEWED; agenda memiliki warning; weekly belum dijadwalkan AUD-12 |
| FE19 | Manajemen tugas terjadwal + subtask | JSON managed_tasks_v1 ↔ core tasks | VERIFIED pada race/status/partial-write/date tests; alarm native terpisah |
| FE20 | Alarm, snooze, simulasi, upload/preview lagu | native notifications, audio, file URI, listener modul | CODE REVIEWED; celah lifecycle/restore AUD-13; suara native NOT REVIEWED |
| FE21 | Jadwal salat + lokasi/search/koordinat | adhan + settings + prayer-location-store | CODE REVIEWED; kasus sebelum matahari terbit AUD-14 VERIFIED |
| FE22 | CRUD kategori | categoryRepository; nonempty/duplikat/FK restrict | CODE REVIEWED; race nama beda kapitalisasi membuat backup ditolak, VERIFIED C03/AUD-05; form memiliki feedback/konfirmasi |
| FE23 | Preferensi, statistik data, backup/restore/recovery | settingsRepository + file service + parseBackup | VERIFIED 45 skenario backup, preservasi nilai target legacy C04 dan error setting C02/AUD-24; ROUTINE AUD-01; picker/share native NOT REVIEWED |
| FE24 | Shell, quick add, drawer, routing/startup recovery | Stack/Tabs; DB init sebelum CRUD; remount restore | CODE REVIEWED; startup fail/retry VERIFIED pada mock; jalur Proyek AUD-07 |

Kemampuan yang hanya berada di rancangan: AI pembuat roadmap, cloud sync, bukti hasil/review mingguan lengkap, impor kalender perangkat, dan autentikasi multi-user. Tidak dihitung sebagai fitur selesai. Target NUMERIC/MAINTENANCE dan milestone legacy dipertahankan schema/repository, tetapi tidak ada alur authoring penuh pada UI aktif; PARTIALLY REVIEWED untuk pengalaman data legacy tersebut.

### 3.1 Integration matrix

| Relasi | Sumber → pembaca/tindakan | Invariant | Hasil |
|---|---|---|---|
| Proyek → target | project.targetId → getTargets rollup | task dihitung sekali | CODE REVIEWED; menggunakan Map/summarizeTasks |
| Tahapan → tugas | stages → tasks | pemilik cocok dan FK valid | VERIFIED pada sebagian migrasi/constraint; source lengkap ditelusuri |
| Tugas → Hari Ini | tasks ↔ daily_focus_items | status tunggal dan prioritas dapat dilepas | Gagal untuk managed: AUD-02/06 |
| Tugas → timer/sesi | taskId + taskTitle snapshot | sesi tetap ada setelah task dihapus | VERIFIED pada assertion integrity/timer dengan native mock; resume proses native belum diuji |
| Managed → core → prioritas | JSON ↔ tasks → daily_focus_items | atomik, konsisten, tidak kehilangan metadata | Gagal terisolasi: AUD-02/03/04 |
| Agenda → native queue | agenda_events → agenda-* | create/toggle/delete/restore selaras | CODE REVIEWED, mock backup subset VERIFIED |
| Weekly → agenda | weekly_schedules + logs → proyeksi harian | waktu valid, status per tanggal | Import jam tidak valid dapat merusak proyeksi: AUD-05 |
| Weekly → notifikasi | reminderMinutes → scheduler | pilihan pengingat memiliki efek | Tidak terhubung: AUD-12 |
| Restore → semua state eksternal | 13 tabel → remount + native queue + lokasi | tidak memakai ID/lokasi/alarms lama | Hanya queue agenda direkonsiliasi; AUD-13 |
| Kategori → target/filter | categoryId → label/filter | label dan ID menggambarkan data yang sama | Null legacy dikarang menjadi cat-karier: AUD-05 |
| Lokasi → jadwal salat | settings → store → adhan | prayer berikutnya berasal dari daftar salat yang ditampilkan | Gagal pada interval subuh–terbit: AUD-14 |

## 4. Screen Inventory

**14 implementasi screen**, ditambah dua redirect, dua layout, dan permukaan modal/dialog. Semua route ditemukan dari filesystem; akses ke route tidak dianggap bukti route dapat ditemukan dari navigasi normal.

**Cakupan tambahan untuk setiap baris berikut:** rendering dan pengukuran fixture VERIFIED pada empat lebar × dua skala font. Nama/source/metrik tiap screen tercatat di browser-layout-evidence.json. Status ini tidak mencakup interaksi, hydration, native safe area atau keyboard. Selector yang mengambil data melalui effect pada form target/proyek masih tampil loading dalam SSR; state sesudah pengambilan data tidak dinyatakan teruji visual.

| Screen | Route | Pemeriksaan individual dan status |
|---|---|---|
| Hari Ini | /(tabs) | CODE REVIEWED; SSR mock VERIFIED; header/timer/timeline/empty/error; denominator masih memasukkan item dibatalkan, tidak diklaim sama dengan rollup target |
| Target | /(tabs)/targets | CODE REVIEWED; SSR mock VERIFIED; filter/kartu/summary; klaim tren AUD-10 |
| Proyek | /(tabs)/projects | CODE REVIEWED; SSR mock VERIFIED; status filter/empty/list; akses normal AUD-07 |
| Agenda | /(tabs)/agenda | CODE REVIEWED; SSR mock VERIFIED; mode daily/weekly, all-day, overlap, tanggal route; kalender AUD-11 |
| Detail target | /targets/[id] | CODE REVIEWED; SSR mock VERIFIED; overview/gauge/roadmap/tahapan/menu/delete; perubahan status target tidak tersedia di UI |
| Detail proyek | /projects/[id] | CODE REVIEWED; SSR mock VERIFIED; summary/tahapan/lifecycle/menu/delete |
| Buat target | /targets/new | CODE REVIEWED; default/validasi/source save/error; belum render interaksi native |
| Buat proyek | /projects/new | CODE REVIEWED; field/target selector/save/error; AUD-08 |
| Buat prioritas | /today/new | CODE REVIEWED; title/selector duration/category; AUD-09 |
| Buat agenda | /agenda/new | CODE REVIEWED; date param, time/all-day/reminder, submitting ref; beberapa label hilang |
| Manajemen tugas | /task-manager | CODE REVIEWED; filter/subtask/preview/test alarm/delete; tidak tercakup screenSpecs suite UI |
| Buat tugas terjadwal | /task-manager/new | CODE REVIEWED; delapan input, tanggal dual, track/snooze; validasi AUD-05 |
| Pengaturan | /settings | CODE REVIEWED; SSR mock VERIFIED; preferensi/kategori/lokasi/data/restore; sebagian error save hanya console |
| Pilihan tambah | /quick-add | CODE REVIEWED; empat aksi, scrim/close, replace route; tidak ada proyek |

Redirect: src/app/index.tsx menuju /(tabs); src/app/(tabs)/add.tsx adalah adapter tambah. Layout: src/app/_layout.tsx dan src/app/(tabs)/_layout.tsx. Seluruh file adapter dan hash tersedia di audit-evidence.json.

### 4.1 Inventaris modal, dialog, panel, dan tab

| Permukaan | Pemilik/lokasi | Status/keterjangkauan |
|---|---|---|
| Drawer menu | shared/ui/app-sidebar-drawer | CODE REVIEWED; aktif dari tab Menu |
| Quick-add sheet | quick-add-screen | CODE REVIEWED; transparent Stack route |
| Tambah target/proyek/prioritas/agenda/managed | masing-masing Add*Modal | CODE REVIEWED; lima jalur lama masih diimport, tetapi tidak ditemukan setter visible=true pada layar induknya; jangan disamakan dengan form route baru |
| Tambah/edit tahap | AddEditStageModal | CODE REVIEWED; aktif dari detail |
| Tambah/edit task tahap | AddEditTaskModal | CODE REVIEWED; aktif dari detail |
| Opsi tahap dan opsi task | StageCard, dua AppBottomSheet | CODE REVIEWED; reorder/edit/delete dengan konfirmasi |
| Jadwal rutin baru/edit | AddEditWeeklyScheduleModal | CODE REVIEWED; aktif dari mode weekly |
| Kategori create/edit/delete | CategoryManagerModal | CODE REVIEWED; Pengaturan |
| Lokasi salat | settings-screen:590 | CODE REVIEWED; search/preset/koordinat |
| Durasi fokus sheet lama | settings-screen:729 | CODE REVIEWED; state tidak pernah diset non-null oleh kontrol saat ini; inline chips dipakai |
| Konfirmasi restore | settings-screen:779 dan seterusnya | VERIFIED pada mock; mengetik PULIHKAN, preview dan backup pengaman |
| Refleksi | SessionReflectionModal | VERIFIED pada mock async gagal/retry; sesi dicatat dahulu |
| Alarm ringing | AlarmRingingModal | CODE REVIEWED; dipasang pada tabs dan task-manager; kemungkinan dua subscriber ketika tab tetap mounted |
| Timer expanded/collapsed + mode tabs | TodayFocusScreen/FocusTimerWidget | CODE REVIEWED; tiga mode, ambient selector tidak punya pemutar |
| Filter kategori/status; daily/weekly; hari mingguan | komponen fitur dan PillTabs | CODE REVIEWED; selected states beragam, tidak seluruhnya memiliki semantik a11y |
| Dialog destruktif native | target/proyek/stage/task tahap/kategori/agenda | CODE REVIEWED; managed delete melewati konfirmasi AUD-15 |
| Startup loading/error/recovery | RootLayout | VERIFIED pada mock failure/retry; tidak memasang navigasi CRUD saat init gagal |

## 5. Form & Component Inventory

Inventaris mesin menemukan **16 file yang memuat form dan 54 instans TextInput**. Satu file Pengaturan memuat beberapa form; angka 16 bukan jumlah dialog bisnis. Selector, switch, rating, subtask, file picker, dan tombol juga dicatat pada JSON bukti. Ada **51 file komponen TSX** di luar route/screen: 24 komponen fitur, 17 komponen shared, 10 komponen template.

### 5.1 Pemeriksaan setiap form

Notasi state: D default, F focus, V filled, I invalid, X disabled, L loading/submitting, S success, E storage/server/local error. **F dan layout keyboard native NOT REVIEWED pada semua form.** State lain yang diperiksa via source diberi C; state yang benar-benar dieksekusi mock diberi V. Form legacy yang belum dapat dibuka dari navigasi normal tetap diinventarisasi.

| Form/file | Seluruh field penting | Validasi, submit, recovery, cancel | State D/V/I/X/L/S/E |
|---|---|---|---|
| CreateTargetScreen | title wajib; description opsional; categoryId wajib; priority | trim title/category; loading/error; gagal load kategori disembunyikan; back langsung; label programatik hilang | C/C/C/C/C/C/C |
| AddTargetModal lama | title; categoryId; description; priority | required; category default diperbaiki saat daftar berubah; loading/false error; close mereset draft | V/C/C/C/C/C/C |
| CreateProjectScreen | title; description; targetId opsional; priority | title trim; save error; hanya tiga target; back langsung | C/C/C/C/C/C/C |
| AddProjectModal lama | title; description; targetId; priority | title wajib; target chips; loading/error; cancel langsung | V/C/C/C/C/C/C |
| CreatePriorityScreen | quickTitle; selectedCategory; durationIdx; existingTaskId | title/max 5; category/duration tidak masuk payload; save loading; existing selection tidak punya lock ref | C/C/C/C/C/C/C |
| AddPriorityModal lama | quickTitle; existingTaskId | title/max 5; false-return tidak selalu memberi error lokal; loading hanya quick action | C/C/C/C/C/C/C |
| CreateAgendaScreen | title; description; eventType; formDate; start/end; allDay; endsTomorrow; location; reminder | title/waktu valid; date route immutable; all-day akhir eksklusif; ref mencegah double-submit; back tidak diblokir saat save | C/C/C/C/C/C/C |
| AddEventModal lama | title; start/end; location; description; eventType/allDay/endsTomorrow/reminder | validator yang sama; ref lock; failed save mempertahankan isian; close ditahan saat submit | V/V/V/C/V/V/V |
| AddEditWeeklyScheduleModal | days/dayOfWeek; title; start/end; scheduleType; location; notes; reminder; isActive | UI cek range jam; trim; multi-day loop bukan transaksi; close tidak dikunci saat submit; reminder tidak terhubung | C/C/C/C/C/C/C |
| AddEditStageModal | name; description | name trim; await boolean; generic retry; close langsung meski submit | V/C/C/C/C/C/C |
| AddEditTaskModal | name; description; priority; estimatedHours; status | required; parseFloat >0; status pilihan; async retry; finite/range keras belum menyeluruh; close langsung | V/C/C/C/C/C/C |
| CategoryManagerModal | newCategoryName; editingName; selected category | nonempty, duplicate; digunakan → delete ditolak; confirmation; busy bersama | C/C/C/C/C/C/C |
| CreateManagedTaskScreen | title; notes; context; category; estimate; execution date/time; deadline date/time; track; alert; snooze; autoToday; subtaskDraft/list | title dan regex bentuk tanggal/jam; tidak validasi kalender/range; repository tidak menutup celah; error dari hook tidak ditampilkan screen ini | C/C/C/C/C/C/C |
| AddManagedTaskModal lama | title; context; execution/deadline; subtask; selectors di atas; notes state | pola validasi sama; tidak ada input notes walau state/payload tersedia; busy state; close langsung | C/C/C/C/C/C/C |
| SessionReflectionModal | rating 1–5; obstacle; nextAction | ref lock, fields disabled, retry mempertahankan catatan; close tanpa kehilangan sesi | V/V/C/V/V/V/V |
| SettingsScreen | citySearch; customCityName; lat; lng; confirmation; preferences/switch/chips | koordinat finite/range; parseFloat menerima suffix; updateSetting menelan error dan sheet menutup; restore lock dan PULIHKAN | V/C/C/C/V/C/C |

State V pada baris legacy berasal dari render fixture, bukan E2E navigasi. Tidak ada klaim seluruh delapan state sudah VERIFIED. Untuk validasi API/server: NOT APPLICABLE; validator repository dan parser backup tetap menjadi batas kepercayaan berkas impor.

Detail setiap TextInput (file, baris, value, keyboard, multiline, a11y, editable, style) dilampirkan otomatis di bagian 5.4. Tidak ada field teks yang hanya disimpulkan dari dokumentasi.

### 5.2 Component variant inventory

| Keluarga | Varian implementasi | Kebutuhan dan hasil audit |
|---|---|---|
| Button | filled, tonal, outlined, text, danger, accent; standard/cta/compact | Semantik berbeda masuk akal; shared minHeight 48/56/48, radius 12 |
| SunButton | tombol kuning Sprout, tinggi tetap 58, radius 29 | Duplikasi keluarga aksi primer; teks besar dapat memerlukan tinggi dinamis; native belum diverifikasi |
| Card | filled/elevated/outlined/highlight/hero | 5 varian deklaratif; default padding 16; radius 16/20/24 |
| SoftCard | card/leaf/sun/cream | 4 tone; default padding 16/radius 24; shadow tersendiri |
| Kartu fitur | ProjectCard, StageCard, TimelineEventCard, WeeklyOccurrenceCard, TargetCard, managed task inline | Radius 26/28 dan empat TRAIL_THEMES; banyak literal; perbedaan peran bukan otomatis bug, tetapi bertentangan spesifikasi aktif AUD-18 |
| Input | formInputBase, formInputCompact, formTextArea + style tiap screen | 44/40/80 minimum; Object.assign(Object.create(null), …) menghilangkan typing ketat; label/focus belum reusable |
| Header | ScreenHeader, FormScreenHeader, SproutTopBar, header manual | Keluarga judul 17/18/24/26/27; penggunaan tidak tunggal |
| Modal | AppBottomSheet full-screen, quick-add sheet route, drawer Modal, alarm full-screen, Alert native | Kebutuhan interaksi berbeda sah; nama AppBottomSheet tertinggal dari perilaku fullscreen; maxHeight prop tidak digunakan |
| Tabs/chips | PillTabs, category filter, project status manual, weekly day selector, priority/reminder chips | Peran semantik/status selected belum konsisten; tidak perlu menyatukan seluruh bentuk tanpa evaluasi konteks |
| Progress | ProgressBar, ProgressRing, ring SVG dan track manual | Shared menyediakan role/value; varian manual tidak selalu mengumumkan progres |
| Feedback | Banner info/warning/error/success; EmptyState initial/completed/error; ActivityIndicator | Komponen bersama tersedia; alur native/log-only error masih tidak seragam |
| Ilustrasi | 6 export mascot + WaveBackdrop/plant | Dekorasi diinventarisasi; kualitas raster/animasi belum diperiksa visual |

### 5.3 Kelengkapan komponen

Semua **24 file komponen fitur**, **17 shared**, dan **10 komponen template di src/components** telah diinventarisasi dan diperiksa source-nya. Pemeriksaan lanjutan mencakup animasi, link, theme dan varian platform pada template; tidak ditemukan jalur import template dari route aktif. Status source adalah CODE REVIEWED; animasi native, browser eksternal, dan semua state interaksi belum dijalankan. Jangan menganggap seluruh file ini aman dihapus hanya dari nama; penghapusan butuh pemeriksaan dependency dinamis/build.

Komponen legacy seperti Add*Modal tetap di-code-review dan diuji fixture tertentu, tetapi bukan bukti alur baru lolos. Tidak direkomendasikan membangun lapisan use-case/DI baru; konsolidasi hanya untuk kontrak input, status, dan form yang terbukti berbeda.

### 5.4 Field-by-field source register

Setiap baris adalah instans JSX yang ditemukan, bukan jumlah record pengguna. Atribut yang tidak ada ditulis 'tidak eksplisit'. Pemilih nonteks dirinci pada tabel 5.1 dan atribut kontrol lengkap tersedia di JSON. Status seluruh baris: **CODE REVIEWED**; focus/keyboard/screen reader native: **NOT REVIEWED**.

| Input / lokasi | Value / state | Keyboard dan multiline | Label programatik | Editable / style |
|---|---|---|---|---|
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:263](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx#L263) | {title} | default; single-line | tidak eksplisit | default; {styles.input} |
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:315](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx#L315) | {startTime} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {styles.timeTextInput} |
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:335](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx#L335) | {endTime} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {styles.timeTextInput} |
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:357](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx#L357) | {location} | default; single-line | tidak eksplisit | default; {styles.flexInput} |
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:374](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx#L374) | {notes} | default; single-line | tidak eksplisit | default; {styles.flexInput} |
| [src/features/agenda/presentation/components/add-event-modal.tsx:156](../../src/features/agenda/presentation/components/add-event-modal.tsx#L156) | {title} | default; single-line | "Judul agenda" | {!isSubmitting}; {styles.textInput} |
| [src/features/agenda/presentation/components/add-event-modal.tsx:233](../../src/features/agenda/presentation/components/add-event-modal.tsx#L233) | {startTimeStr} | "numbers-and-punctuation"; single-line | "Jam mulai" | {!isSubmitting}; {styles.timeInput} |
| [src/features/agenda/presentation/components/add-event-modal.tsx:257](../../src/features/agenda/presentation/components/add-event-modal.tsx#L257) | {endTimeStr} | "numbers-and-punctuation"; single-line | "Jam selesai" | {!isSubmitting}; {styles.timeInput} |
| [src/features/agenda/presentation/components/add-event-modal.tsx:284](../../src/features/agenda/presentation/components/add-event-modal.tsx#L284) | {location} | default; single-line | tidak eksplisit | {!isSubmitting}; {styles.flexInput} |
| [src/features/agenda/presentation/components/add-event-modal.tsx:334](../../src/features/agenda/presentation/components/add-event-modal.tsx#L334) | {description} | default; multiline | tidak eksplisit | {!isSubmitting}; {[styles.textInput, styles.textArea]} |
| [src/features/agenda/presentation/screens/create-agenda-screen.tsx:160](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx#L160) | {title} | default; single-line | tidak eksplisit | default; {styles.cloudInput} |
| [src/features/agenda/presentation/screens/create-agenda-screen.tsx:175](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx#L175) | {description} | default; single-line | tidak eksplisit | default; {styles.cloudDescInput} |
| [src/features/agenda/presentation/screens/create-agenda-screen.tsx:220](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx#L220) | {startTimeStr} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {styles.timeInput} |
| [src/features/agenda/presentation/screens/create-agenda-screen.tsx:232](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx#L232) | {endTimeStr} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {styles.timeInput} |
| [src/features/agenda/presentation/screens/create-agenda-screen.tsx:280](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx#L280) | {location} | default; single-line | tidak eksplisit | default; {styles.locationInput} |
| [src/features/categories/presentation/components/category-manager-modal.tsx:126](../../src/features/categories/presentation/components/category-manager-modal.tsx#L126) | {newCategoryName} | default; single-line | "Nama kategori baru" | default; {styles.textInput} |
| [src/features/categories/presentation/components/category-manager-modal.tsx:167](../../src/features/categories/presentation/components/category-manager-modal.tsx#L167) | {editingName} | default; single-line | "Ubah nama kategori" | default; {styles.editInput} |
| [src/features/projects/presentation/components/add-project-modal.tsx:113](../../src/features/projects/presentation/components/add-project-modal.tsx#L113) | {title} | default; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/projects/presentation/components/add-project-modal.tsx:125](../../src/features/projects/presentation/components/add-project-modal.tsx#L125) | {description} | default; multiline | tidak eksplisit | default; {[styles.textInput, styles.textArea]} |
| [src/features/projects/presentation/screens/create-project-screen.tsx:124](../../src/features/projects/presentation/screens/create-project-screen.tsx#L124) | {title} | default; single-line | tidak eksplisit | default; {styles.cloudInput} |
| [src/features/projects/presentation/screens/create-project-screen.tsx:139](../../src/features/projects/presentation/screens/create-project-screen.tsx#L139) | {description} | default; multiline | tidak eksplisit | default; {styles.cloudDescInput} |
| [src/features/settings/presentation/screens/settings-screen.tsx:597](../../src/features/settings/presentation/screens/settings-screen.tsx#L597) | {citySearch} | default; single-line | tidak eksplisit | default; {styles.searchCityInput} |
| [src/features/settings/presentation/screens/settings-screen.tsx:692](../../src/features/settings/presentation/screens/settings-screen.tsx#L692) | {customCityName} | default; single-line | tidak eksplisit | default; {styles.customInput} |
| [src/features/settings/presentation/screens/settings-screen.tsx:700](../../src/features/settings/presentation/screens/settings-screen.tsx#L700) | {customLat} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {[styles.customInput, { flex: 1 }]} |
| [src/features/settings/presentation/screens/settings-screen.tsx:708](../../src/features/settings/presentation/screens/settings-screen.tsx#L708) | {customLng} | "numbers-and-punctuation"; single-line | tidak eksplisit | default; {[styles.customInput, { flex: 1 }]} |
| [src/features/settings/presentation/screens/settings-screen.tsx:817](../../src/features/settings/presentation/screens/settings-screen.tsx#L817) | {confirmation} | default; single-line | "Ketik PULIHKAN untuk mengonfirmasi penggantian data" | {!backupBusy}; {styles.confirmationInput} |
| [src/features/stages/presentation/components/add-edit-stage-modal.tsx:93](../../src/features/stages/presentation/components/add-edit-stage-modal.tsx#L93) | {name} | default; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/stages/presentation/components/add-edit-stage-modal.tsx:107](../../src/features/stages/presentation/components/add-edit-stage-modal.tsx#L107) | {description} | default; multiline | tidak eksplisit | default; {[styles.textInput, styles.textArea]} |
| [src/features/stages/presentation/components/add-edit-task-modal.tsx:133](../../src/features/stages/presentation/components/add-edit-task-modal.tsx#L133) | {name} | default; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/stages/presentation/components/add-edit-task-modal.tsx:147](../../src/features/stages/presentation/components/add-edit-task-modal.tsx#L147) | {description} | default; multiline | tidak eksplisit | default; {[styles.textInput, styles.textArea]} |
| [src/features/stages/presentation/components/add-edit-task-modal.tsx:191](../../src/features/stages/presentation/components/add-edit-task-modal.tsx#L191) | {estimatedHours} | "decimal-pad"; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/targets/presentation/components/add-target-modal.tsx:122](../../src/features/targets/presentation/components/add-target-modal.tsx#L122) | {title} | default; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/targets/presentation/components/add-target-modal.tsx:174](../../src/features/targets/presentation/components/add-target-modal.tsx#L174) | {description} | default; multiline | tidak eksplisit | default; {[styles.textInput, styles.textArea]} |
| [src/features/targets/presentation/screens/create-target-screen.tsx:138](../../src/features/targets/presentation/screens/create-target-screen.tsx#L138) | {title} | default; single-line | tidak eksplisit | default; {styles.cloudInput} |
| [src/features/targets/presentation/screens/create-target-screen.tsx:153](../../src/features/targets/presentation/screens/create-target-screen.tsx#L153) | {description} | default; multiline | tidak eksplisit | default; {styles.cloudDescInput} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:261](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L261) | {title} | default; single-line | tidak eksplisit | default; {styles.inputBox} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:307](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L307) | {courseOrContext} | default; single-line | tidak eksplisit | default; {[styles.inputBox, { flex: 1 }]} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:407](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L407) | {deadlineDate} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:417](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L417) | {deadlineTime} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:491](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L491) | {executionDate} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:501](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L501) | {executionTime} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx:740](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx#L740) | {subtaskDraft} | default; single-line | tidak eksplisit | default; {[styles.inputBox, { flex: 1 }]} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:271](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L271) | {title} | default; single-line | tidak eksplisit | default; {styles.cloudInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:285](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L285) | {notes} | default; multiline | tidak eksplisit | default; {styles.cloudDescInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:330](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L330) | {courseOrContext} | default; single-line | tidak eksplisit | default; {styles.inputBox} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:439](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L439) | {deadlineDate} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:449](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L449) | {deadlineTime} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:523](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L523) | {executionDate} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:533](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L533) | {executionTime} | default; single-line | tidak eksplisit | default; {styles.compactDateInput} |
| [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:778](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx#L778) | {subtaskDraft} | default; single-line | tidak eksplisit | default; {[styles.inputBox, { flex: 1 }]} |
| [src/features/today-focus/presentation/components/add-priority-modal.tsx:95](../../src/features/today-focus/presentation/components/add-priority-modal.tsx#L95) | {quickTitle} | default; single-line | tidak eksplisit | default; {styles.textInput} |
| [src/features/today-focus/presentation/components/session-reflection-modal.tsx:48](../../src/features/today-focus/presentation/components/session-reflection-modal.tsx#L48) | {obstacle} | default; single-line | "Hambatan atau distraksi" | {!saving}; {styles.input} |
| [src/features/today-focus/presentation/components/session-reflection-modal.tsx:51](../../src/features/today-focus/presentation/components/session-reflection-modal.tsx#L51) | {nextAction} | default; multiline | "Langkah berikutnya" | {!saving}; {[styles.input, styles.multiline]} |
| [src/features/today-focus/presentation/screens/create-priority-screen.tsx:138](../../src/features/today-focus/presentation/screens/create-priority-screen.tsx#L138) | {quickTitle} | default; single-line | tidak eksplisit | {!isFull}; {styles.cloudInput} |

### 5.5 Register setiap file komponen

CODE REVIEWED di sini berarti inspeksi source, bukan seluruh state diuji. Sepuluh berkas template juga sudah diperiksa source pada audit lanjutan; QA semua animasi native tetap NOT REVIEWED.

| File | Export komponen/helper | Status |
|---|---|---|
| [src/components/animated-icon.tsx](../../src/components/animated-icon.tsx) | AnimatedSplashOverlay, AnimatedIcon | CODE REVIEWED; native NOT REVIEWED |
| [src/components/animated-icon.web.tsx](../../src/components/animated-icon.web.tsx) | AnimatedSplashOverlay, AnimatedIcon | CODE REVIEWED; animation runtime NOT REVIEWED |
| [src/components/app-tabs.tsx](../../src/components/app-tabs.tsx) | AppTabs | CODE REVIEWED; native NOT REVIEWED |
| [src/components/app-tabs.web.tsx](../../src/components/app-tabs.web.tsx) | AppTabs, TabButton, CustomTabList | CODE REVIEWED; interaction runtime NOT REVIEWED |
| [src/components/external-link.tsx](../../src/components/external-link.tsx) | ExternalLink | CODE REVIEWED; external browser NOT REVIEWED |
| [src/components/hint-row.tsx](../../src/components/hint-row.tsx) | HintRow | CODE REVIEWED |
| [src/components/themed-text.tsx](../../src/components/themed-text.tsx) | ThemedText | CODE REVIEWED |
| [src/components/themed-view.tsx](../../src/components/themed-view.tsx) | ThemedView | CODE REVIEWED |
| [src/components/ui/collapsible.tsx](../../src/components/ui/collapsible.tsx) | Collapsible | CODE REVIEWED; animation runtime NOT REVIEWED |
| [src/components/web-badge.tsx](../../src/components/web-badge.tsx) | WebBadge | CODE REVIEWED |
| [src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx](../../src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx) | AddEditWeeklyScheduleModal | CODE REVIEWED |
| [src/features/agenda/presentation/components/add-event-modal.tsx](../../src/features/agenda/presentation/components/add-event-modal.tsx) | AddEventModal | CODE REVIEWED |
| [src/features/agenda/presentation/components/daily-routine-checklist.tsx](../../src/features/agenda/presentation/components/daily-routine-checklist.tsx) | DailyRoutineChecklist | CODE REVIEWED |
| [src/features/agenda/presentation/components/date-strip-header.tsx](../../src/features/agenda/presentation/components/date-strip-header.tsx) | DateStripHeader | CODE REVIEWED |
| [src/features/agenda/presentation/components/timeline-event-card.tsx](../../src/features/agenda/presentation/components/timeline-event-card.tsx) | TimelineEventCard | CODE REVIEWED |
| [src/features/agenda/presentation/components/weekly-occurrence-card.tsx](../../src/features/agenda/presentation/components/weekly-occurrence-card.tsx) | WeeklyOccurrenceCard | CODE REVIEWED |
| [src/features/agenda/presentation/components/weekly-schedule-manager.tsx](../../src/features/agenda/presentation/components/weekly-schedule-manager.tsx) | WeeklyScheduleManager | CODE REVIEWED |
| [src/features/categories/presentation/components/category-manager-modal.tsx](../../src/features/categories/presentation/components/category-manager-modal.tsx) | CategoryManagerModal | CODE REVIEWED |
| [src/features/prayer-times/presentation/components/prayer-times-widget.tsx](../../src/features/prayer-times/presentation/components/prayer-times-widget.tsx) | PrayerTimesWidget | CODE REVIEWED |
| [src/features/projects/presentation/components/add-project-modal.tsx](../../src/features/projects/presentation/components/add-project-modal.tsx) | AddProjectModal | CODE REVIEWED |
| [src/features/projects/presentation/components/project-card.tsx](../../src/features/projects/presentation/components/project-card.tsx) | ProjectCard | CODE REVIEWED |
| [src/features/stages/presentation/components/add-edit-stage-modal.tsx](../../src/features/stages/presentation/components/add-edit-stage-modal.tsx) | AddEditStageModal | CODE REVIEWED |
| [src/features/stages/presentation/components/add-edit-task-modal.tsx](../../src/features/stages/presentation/components/add-edit-task-modal.tsx) | AddEditTaskModal | CODE REVIEWED |
| [src/features/stages/presentation/components/stage-card.tsx](../../src/features/stages/presentation/components/stage-card.tsx) | StageCard | CODE REVIEWED |
| [src/features/targets/presentation/components/add-target-modal.tsx](../../src/features/targets/presentation/components/add-target-modal.tsx) | AddTargetModal | CODE REVIEWED |
| [src/features/targets/presentation/components/category-filter-chips.tsx](../../src/features/targets/presentation/components/category-filter-chips.tsx) | CategoryFilterChips | CODE REVIEWED |
| [src/features/targets/presentation/components/pillar-filter-chips.tsx](../../src/features/targets/presentation/components/pillar-filter-chips.tsx) | PillarFilterChips | CODE REVIEWED |
| [src/features/targets/presentation/components/target-card.tsx](../../src/features/targets/presentation/components/target-card.tsx) | TargetCard | CODE REVIEWED |
| [src/features/task-manager/presentation/components/add-managed-task-modal.tsx](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx) | AddManagedTaskModal | CODE REVIEWED |
| [src/features/task-manager/presentation/components/alarm-ringing-modal.tsx](../../src/features/task-manager/presentation/components/alarm-ringing-modal.tsx) | AlarmRingingModal | CODE REVIEWED |
| [src/features/today-focus/presentation/components/add-priority-modal.tsx](../../src/features/today-focus/presentation/components/add-priority-modal.tsx) | AddPriorityModal | CODE REVIEWED |
| [src/features/today-focus/presentation/components/focus-timer-widget.tsx](../../src/features/today-focus/presentation/components/focus-timer-widget.tsx) | FocusTimerWidget | CODE REVIEWED |
| [src/features/today-focus/presentation/components/priority-task-card.tsx](../../src/features/today-focus/presentation/components/priority-task-card.tsx) | PriorityTaskCard | CODE REVIEWED |
| [src/features/today-focus/presentation/components/session-reflection-modal.tsx](../../src/features/today-focus/presentation/components/session-reflection-modal.tsx) | SessionReflectionModal | CODE REVIEWED |
| [src/shared/ui/app-bottom-sheet.tsx](../../src/shared/ui/app-bottom-sheet.tsx) | AppBottomSheet | CODE REVIEWED |
| [src/shared/ui/app-sidebar-drawer.tsx](../../src/shared/ui/app-sidebar-drawer.tsx) | registerSidebarOpener, openAppSidebar, AppSidebarDrawer | CODE REVIEWED |
| [src/shared/ui/app-text.tsx](../../src/shared/ui/app-text.tsx) | AppText | CODE REVIEWED |
| [src/shared/ui/banner.tsx](../../src/shared/ui/banner.tsx) | Banner | CODE REVIEWED |
| [src/shared/ui/button.tsx](../../src/shared/ui/button.tsx) | Button | CODE REVIEWED |
| [src/shared/ui/capsule-date-strip.tsx](../../src/shared/ui/capsule-date-strip.tsx) | CapsuleDateStrip | CODE REVIEWED |
| [src/shared/ui/card.tsx](../../src/shared/ui/card.tsx) | Card | CODE REVIEWED |
| [src/shared/ui/empty-state.tsx](../../src/shared/ui/empty-state.tsx) | EmptyState | CODE REVIEWED |
| [src/shared/ui/form-screen-header.tsx](../../src/shared/ui/form-screen-header.tsx) | FormScreenHeader | CODE REVIEWED |
| [src/shared/ui/progress-bar.tsx](../../src/shared/ui/progress-bar.tsx) | ProgressBar | CODE REVIEWED |
| [src/shared/ui/progress-ring.tsx](../../src/shared/ui/progress-ring.tsx) | ProgressRing | CODE REVIEWED |
| [src/shared/ui/screen-header.tsx](../../src/shared/ui/screen-header.tsx) | ScreenHeader | CODE REVIEWED |
| [src/shared/ui/screen.tsx](../../src/shared/ui/screen.tsx) | Screen | CODE REVIEWED |
| [src/shared/ui/sprout/mascot.tsx](../../src/shared/ui/sprout/mascot.tsx) | MascotPeek, MascotHead, MascotCozy, MascotRocket, MascotAvatar, SproutPlant | CODE REVIEWED |
| [src/shared/ui/sprout/primitives.tsx](../../src/shared/ui/sprout/primitives.tsx) | SoftCard, HeroBlob, SproutCheck, IconTile, SunButton, SproutTopBar, SectionTitle, PillTabs, ChoiceTile, FieldLabel, sproutShadow | CODE REVIEWED |
| [src/shared/ui/sprout/wave-backdrop.tsx](../../src/shared/ui/sprout/wave-backdrop.tsx) | WaveBackdrop | CODE REVIEWED |
| [src/shared/ui/tab-fab-button.tsx](../../src/shared/ui/tab-fab-button.tsx) | TabFabButton | CODE REVIEWED |

## 6. Architecture Findings

Temuan arsitektur utama adalah **AUD-02, AUD-03, AUD-04, AUD-16, AUD-18, dan AUD-20**. Satu sumber status/transaksi sudah tersedia tetapi tidak digunakan konsisten oleh managed tasks. Duplikasi create screen dan modal lama membuat hasil test UI tidak otomatis mencakup form yang dipakai pengguna. Dependency native di repository juga mematahkan harness data murni. Tidak ditemukan static runtime import cycle pada 13 modul yang terjangkau dari db/client melalui pemeriksaan yang tersedia; ini bukan bukti tidak ada siklus di seluruh graph aplikasi.

Register temuan lengkap di bawah merupakan rujukan tunggal untuk severity, expected/actual, rekomendasi, risiko, dan acceptance criteria. Path relatif selalu dihitung dari root yang tercantum di awal laporan; setiap baris mengacu working tree audit.

## 7. Functional & Business Logic Findings

### AUD-01 — Rutinitas sah membuat backup tidak dapat dipulihkan

- **Status tindak lanjut:** **DIPERBAIKI**, VERIFIED pada parser dan repository dengan SQLite memory. Parser menerima ROUTINE; tipe tak dikenal tetap ditolak. Uji untuk lima tipe pada format lama/baru, round-trip repository dan log harian lulus. Hasil lengkap: aud-01-remediation.json. Bukti actual/reproduksi berikut adalah kondisi baseline sebelum fix.
- **Kategori / severity / confidence:** integritas backup / **HIGH** / HIGH. Fitur: jadwal rutin dan restore.
- **Lokasi:** src/features/settings/data/backup-format.ts:202–205; src/features/agenda/domain/entities/weekly-schedule.entity.ts:6; src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:33–38.
- **Bukti / actual:** UI/domain menerima ROUTINE; daftar nilai parseBackup tidak memasukkannya. Ekspor berhasil, impor menghasilkan “scheduleType tidak dikenal”.
- **Expected:** seluruh data yang sah dibuat aplikasi dapat round-trip melalui backup.
- **Reproduksi:** buat ROUTINE 05:00–06:00, ekspor 13 tabel, parse hasilnya. Harness F01 membuktikan kegagalan.
- **Root cause / dampak:** enum validator tertinggal dari domain; satu rutinitas memblokir seluruh pemulihan, termasuk pemeriksaan berkas pada restore dan migrasi tertentu.
- **Rekomendasi:** pakai definisi schedule type bersama, tambahkan kompatibilitas format lama dan uji round-trip ROUTINE.
- **Risiko perubahan / acceptance:** rendah; backup lama tetap diterima, backup baru semua tipe lolos staging/restore dan FK.
- **Verifikasi:** VERIFIED pada SQLite di memori; uji manual backup/pemulihan mengikuti panduan Expo Go kemudian dilaporkan berhasil oleh pengguna (USER REPORTED PASS, tidak diamati langsung).

### AUD-02 — Refresh dapat mengubah IN_PROGRESS/CANCELLED menjadi TODO

- **Status tindak lanjut:** **DIPERBAIKI**. Refresh mempertahankan status core; DONE dibaca sebagai COMPLETED, dan completion flag/prioritas mengikuti helper status bersama. Perubahan completion hanya dilakukan oleh aksi eksplisit. VERIFIED pada suite check-managed.cjs; bukti berikut adalah baseline.
- **Kategori / severity / confidence:** status lintas fitur / **HIGH** / HIGH. Fitur: managed tasks → Hari Ini/timer.
- **Lokasi:** src/features/task-manager/data/repositories/managed-task.repository.ts:73–98, 172–188; src/features/today-focus/data/repositories/daily-focus.repository.impl.ts:121–124; shared/domain/task-status.ts:1–12.
- **Bukti / actual:** JSON hanya menyimpan isCompleted. Sinkronisasi menulis status TODO untuk semua yang belum completed. F02 membuktikan IN_PROGRESS → TODO dan CANCELLED → TODO.
- **Expected:** status tasks menjadi sumber utama; membaca Hari Ini tidak membuka kembali tugas dibatalkan.
- **Reproduksi:** buat managed task, ubah core status, panggil syncWithCoreTasksAndToday atau muat Hari Ini.
- **Root cause / dampak:** pemetaan boolean menimpa model empat status; tugas dibatalkan dapat aktif/beralarm lagi dan progres berubah tanpa tindakan pengguna.
- **Rekomendasi:** pakai shared status writer dan sumber status core; sync metadata tidak mengubah lifecycle.
- **Risiko perubahan / acceptance:** sedang; uji semua status, toggle dari dua fitur, completedAt, prioritas multi-hari dan alarm; refresh tidak mengubah status.
- **Verifikasi:** VERIFIED F02, bukan pengujian tap native.

### AUD-03 — Dua penulisan managed task konkuren kehilangan metadata

- **Status tindak lanjut:** **DIPERBAIKI**. Pembacaan snapshot, mutasi JSON dan penulisan terkait berjalan dalam satu transaksi sinkron tanpa await. Uji create/create, subtask/snooze/create, delete/create serta urutan rekonsiliasi notifikasi lulus. VERIFIED otomatis; bukti berikut adalah baseline.
- **Kategori / severity / confidence:** race dan kehilangan data / **HIGH** / HIGH.
- **Lokasi:** src/features/task-manager/data/repositories/managed-task.repository.ts:111–126, 271–276; pola read-modify-write juga pada toggle/subtask/delete/snooze.
- **Bukti / actual:** Promise.all dua create menghasilkan **1 item JSON dan 2 core tasks**. Penulis terakhir mengganti seluruh array.
- **Expected:** kedua hasil create dan metadata jadwal/subtask tetap tersedia.
- **Reproduksi:** F03 menjalankan dua create bersamaan pada database kosong.
- **Root cause / dampak:** snapshot array dibaca sebelum penulisan tanpa serialisasi/transaksi bersama; salah satu tugas kehilangan jadwal/metadata meski core row masih ada. Double-tap adalah salah satu pemicu potensial; tidak diklaim sudah diuji di native.
- **Rekomendasi:** serialize mutasi dan transaksi atomik, atau simpan metadata per task dengan key/FK; pilih perubahan terkecil yang menutup lost update.
- **Risiko perubahan / acceptance:** sedang; dua create/toggle/subtask bersamaan tidak saling menghapus data, dan kegagalan tetap dapat di-retry.
- **Verifikasi:** VERIFIED F03.

### AUD-04 — Kegagalan core sync disembunyikan sebagai sukses

- **Status tindak lanjut:** **DIPERBAIKI**. Fault pada insert/update/delete core, metadata, prioritas, read dan commit membatalkan seluruh mutasi. Error diteruskan; form/hook/modal menampilkan kegagalan dan mempertahankan kesempatan retry. Efek notifikasi terjadi setelah commit. VERIFIED pada kode database/hook dengan fault injection; UI native perlu uji manual. Bukti berikut adalah baseline.
- **Kategori / severity / confidence:** transaksi dan error recovery / **HIGH** / HIGH.
- **Lokasi:** src/features/task-manager/data/repositories/managed-task.repository.ts:133–229, 271–277, 321–330.
- **Bukti / actual:** sync catch mengabaikan error; JSON disimpan dahulu. Fault “disk full” saat insert tasks menghasilkan create sukses, JSON 1, tasks 0.
- **Expected:** metadata/core/prioritas commit bersama; penyimpanan gagal dilaporkan, draft tidak ditutup.
- **Reproduksi:** F04 menyuntik kegagalan insert tasks; tidak menyentuh database perangkat.
- **Root cause / dampak:** operasi majemuk tidak satu transaksi, exception dianggap lingkungan non-DB; tugas ada di satu fitur dan hilang pada fitur lain. Delete juga dapat menyisakan row core.
- **Rekomendasi:** transaksi bersama, propagasi error database; pisahkan warning native setelah commit.
- **Risiko perubahan / acceptance:** sedang; fault pada tiap langkah membatalkan seluruh mutasi; retry tidak menduplikasi; UI menerima error yang benar.
- **Verifikasi:** VERIFIED F04.

### AUD-05 — Kontrak data tidak konsisten pada write, backup, dan legacy read

- **Kategori / severity / confidence:** validasi dan representasi data / **MEDIUM** / HIGH.
- **Lokasi:** src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:180–226; src/features/task-manager/presentation/components/add-managed-task-modal.tsx:179–225; src/features/task-manager/data/repositories/managed-task.repository.ts:60–108, 232–269; src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts:74–125; src/features/settings/data/backup-format.ts:189–207 dan validasi nama kategori; src/features/targets/data/repositories/target.repository.impl.ts:97–102; src/features/categories/data/repositories/category.repository.impl.ts (check duplicate → insert), src/db/schema-sql.ts (unique name dengan collation default).
- **Bukti / actual:** (a) 2026-02-30 dan 99:99 lolos regex managed; core dueDate kemudian membuat backup ekspor tidak dapat diparse. (b) weekly 24:00–25:00 lolos repository/backup, tetapi proyeksi melempar error. (c) user_settings managed payload “[null]” diterima parser; getAllTasks menelan error sebagai daftar kosong. (d) kategori target NULL dipetakan menjadi ID cat-karier dengan label Umum, tetapi target tidak muncul saat filter ID tersebut.
- **Bukti lanjutan C03:** dua create kategori konkuren dengan nama AuditCaseRace/AUDITCASERACE sama-sama sukses. Unique index membedakan kapitalisasi, sedangkan parser backup menolak nama tersebut sebagai duplikat; hasil ekspor sendiri tidak dapat diimpor. Kasus C04 terpisah membuktikan nilai NUMERIC/MAINTENANCE 75/100 tetap tersimpan di backup, tetapi tidak diekspos entity UI. Ini batas dukungan editor legacy, bukan klaim kehilangan nilai backup.
- **Expected:** validator batas penyimpanan/impor menerima hanya representasi yang bisa dipakai pembaca; null legacy tetap jujur.
- **Reproduksi:** F06, F07, F09, F08 masing-masing membuktikan empat mismatch.
- **Root cause / dampak:** string/any dan enum tersebar; nested JSON tidak divalidasi; default read mengarang relasi. Implikasi: jadwal tak valid, backup tidak dapat dipulihkan, tampilan kosong, filter membingungkan. Tidak ditemukan SQL injection dari jalur impor yang diperiksa.
- **Rekomendasi:** validator tanggal lokal/jam/managed payload bersama pada repository dan backup; propagasi corrupt-data error; pertahankan nullable categoryId; samakan aturan keunikan kategori pada database dan parser dengan penanganan data lama yang eksplisit.
- **Risiko perubahan / acceptance:** sedang; jangan normalisasi diam-diam data lama. Berkas invalid ditolak sebelum replacement; semua write sah round-trip; null kategori tidak mengubah identitas/hasil filter.
- **Verifikasi:** VERIFIED empat reproduksi awal dan C03/C04 terisolasi; interaksi UI kategori belum dijalankan native.

### AUD-06 — Melepas prioritas managed task dibatalkan oleh refresh

- **Kategori / severity / confidence:** aturan prioritas/UX / **MEDIUM** / HIGH.
- **Lokasi:** src/features/task-manager/data/repositories/managed-task.repository.ts:191–222; src/features/today-focus/data/repositories/daily-focus.repository.impl.ts:123, 161–162.
- **Actual / expected:** removeFocusItem menghapus hubungan, tetapi sync langsung menambah kembali task autoAddToToday dengan executionDate ≤ hari ini. Pelepasan prioritas seharusnya bertahan pada tanggal yang dipilih tanpa menghapus task.
- **Reproduksi:** F05: 0 hubungan setelah delete, kembali 1 setelah sync.
- **Root cause / dampak:** tidak ada opt-out per tanggal; pengguna tidak dapat mengganti prioritas managed yang belum selesai.
- **Rekomendasi:** catat keputusan skip per tanggal atau lakukan auto-add sekali, dengan aturan eksplisit.
- **Risiko / acceptance:** sedang; task overdue tetap dapat ditawarkan, maksimal lima tetap berlaku, skip hari ini tidak menghapus task/jadwal besok.
- **Verifikasi:** VERIFIED F05.

### AUD-07 — Modul Proyek tidak memiliki jalur masuk normal

- **Kategori / severity / confidence:** navigasi lintas fitur / **HIGH** / HIGH.
- **Lokasi:** src/app/(tabs)/_layout.tsx:98–110; src/shared/ui/app-sidebar-drawer.tsx:145–179; src/features/quick-add/presentation/screens/quick-add-screen.tsx:29–62; src/features/today-focus/presentation/screens/today-focus-screen.tsx:319–327.
- **Actual:** tab route projects dilabeli Menu lalu tabPress dicegah. Drawer tidak mempunyai item Proyek; quick add juga tidak. Klik task proyek di Hari Ini justru menuju daftar Target.
- **Expected:** pengguna dapat membuka daftar/detail proyek dan membuat proyek dari navigasi yang tersedia.
- **Reproduksi source:** telusuri setiap router destination pada shell/drawer/quick-add/Today; /projects hanya dirujuk dari dalam modul Proyek atau komponen template yang tidak dipakai.
- **Root cause / dampak:** perubahan shell memutus entry point, adapter project masih ada; fitur inti tersedia hanya lewat deep link/programmatic route.
- **Rekomendasi:** sediakan entry Proyek yang jelas dan arahkan task.projectId ke detail proyek.
- **Risiko / acceptance:** rendah; dari cold start → buka Proyek → buat → detail → kembali; task proyek membuka ID yang benar.
- **Verifikasi:** CODE REVIEWED; navigasi native belum dieksekusi.

### AUD-08 — Form proyek menghilangkan target keempat dan seterusnya

- **Kategori / severity / confidence:** pilihan relasi/form / **MEDIUM** / HIGH.
- **Lokasi:** src/features/projects/presentation/screens/create-project-screen.tsx:49–64, 150–173, khususnya slice(0, 3):163.
- **Actual / expected:** hanya tiga target aktif terbaru dirender tanpa pencarian/“lihat semua”; seluruh target aktif seharusnya dapat dipilih.
- **Reproduksi:** siapkan empat target aktif, buka route create; target di posisi keempat tidak memiliki kontrol pemilihan.
- **Root cause / dampak:** pemotongan array untuk layout; proyek tidak bisa ditautkan ke target lama dari form aktif.
- **Rekomendasi:** tampilkan daftar lengkap yang dapat digulir/dicari; jangan perluas model data.
- **Risiko / acceptance:** rendah; target ke-4/ke-20 bisa dipilih, mandiri tetap tersedia, judul panjang dan teks besar diuji.
- **Verifikasi:** CODE REVIEWED; bukan screenshot terverifikasi.

### AUD-09 — Kategori dan durasi tugas cepat tidak disimpan

- **Kategori / severity / confidence:** input diabaikan / **MEDIUM** / HIGH.
- **Lokasi:** src/features/today-focus/presentation/screens/create-priority-screen.tsx:53–61, 85, 155–183; src/features/today-focus/presentation/hooks/use-today-focus.ts:34–36; src/features/today-focus/data/repositories/daily-focus.repository.impl.ts:169–186.
- **Actual / expected:** pengguna memilih kategori dan 15/30/45/60 menit, tetapi payload hanya title; repository selalu menyimpan estimatedMinutes 25 dan tidak menerima kategori tersebut. Pilihan yang ditawarkan harus memengaruhi hasil tersimpan.
- **Reproduksi:** pilih Kerja/60 menit, simpan, baca tasks; durasi tetap 25.
- **Root cause / dampak:** state presentasi tidak disambungkan ke kontrak input; estimasi/ringkasan dan harapan pengguna berbeda.
- **Rekomendasi:** sambungkan field ke model yang memang didukung; hilangkan/beri status belum tersedia pada kontrol yang belum punya kontrak.
- **Risiko / acceptance:** sedang karena kategori task berbeda dari kategori target; definisikan makna, lalu uji reopen/read dan statistik estimasi.
- **Verifikasi:** CODE REVIEWED.

### AUD-10 — UI menampilkan fungsi audio dan klaim tren yang tidak didukung

- **Kategori / severity / confidence:** kebenaran feedback/UX / **MEDIUM** / HIGH.
- **Lokasi:** src/features/today-focus/presentation/components/focus-timer-widget.tsx:55–60, 88, 405–454; src/features/targets/presentation/screens/target-list-screen.tsx:39–45, 123–165.
- **Actual:** pemilih “Suara Latar Fokus” hanya setActiveSound; tidak ada sumber/pemutar audio. Target menulis “Produktivitasmu meningkat! +X%” dan kurva statis, sementara X adalah proporsi task selesai saat ini, bukan perubahan dibanding periode lain.
- **Expected:** audio benar-benar dapat diputar/dihentikan; persentase diberi label sesuai perhitungan, tanpa klaim peningkatan tanpa baseline.
- **Reproduksi:** pilih ambience apa pun; handler tidak memanggil audio. Data nol/penurunan checklist tetap merender kalimat peningkatan dan kurva yang sama.
- **Root cause / dampak:** elemen demo diintegrasikan sebagai fitur/data nyata; pengguna mendapat feedback yang tidak dapat dipercaya.
- **Rekomendasi:** sambungkan audio dengan cleanup bila memang dalam cakupan, atau hapus kontrol sementara; ganti microcopy/grafik dengan ringkasan faktual.
- **Risiko / acceptance:** rendah jika menghapus klaim/placeholder; implementasi audio punya risiko lifecycle sedang. Tidak ada klaim tren tanpa pembanding dan pemutar mempunyai state/error yang nyata.
- **Verifikasi:** CODE REVIEWED; keluaran speaker belum diuji.

### AUD-11 — Kalender bulanan hanya membangun lima minggu

- **Kategori / severity / confidence:** kalender/coverage tanggal / **MEDIUM** / HIGH.
- **Lokasi:** src/features/agenda/presentation/components/date-strip-header.tsx:45–64, 119–156.
- **Actual:** monthWeeks selalu 5 × 7. Tambahan missingWeekDays hanya mengakomodasi pekan tanggal terpilih.
- **Expected:** semua tanggal bulan dapat ditampilkan untuk bulan dengan empat, lima, atau enam baris.
- **Reproduksi source:** selectedDate 2026-11-21 menghasilkan grid 26 Oktober–29 November; pekan terpilih sudah di grid, sehingga 30 November tidak dimasukkan.
- **Root cause / dampak:** tinggi kalender diperlakukan sebagai konstanta; pengguna tidak melihat sebagian hari bulan tanpa memutar navigasi pekan/bulan.
- **Rekomendasi:** hitung jumlah baris berdasarkan awal/akhir bulan, pertahankan aksesibilitas dan selected date.
- **Risiko / acceptance:** rendah; uji bulan mulai Minggu/Sabtu, Februari kabisat, Desember/Januari, dan semua tanggal terlihat.
- **Verifikasi:** CODE REVIEWED dengan perhitungan tanggal deterministik; visual native belum dilihat.

### AUD-12 — Pilihan pengingat jadwal mingguan tidak dijadwalkan

- **Kategori / severity / confidence:** integrasi notifikasi / **MEDIUM** / HIGH.
- **Lokasi:** src/features/agenda/presentation/components/add-edit-weekly-schedule-modal.tsx:41–47, 140–149; src/features/agenda/presentation/hooks/use-weekly-schedules.ts:53–95; src/features/agenda/presentation/hooks/use-agenda.ts:49–52; src/features/agenda/data/services/agenda-notification.service.ts:66–89.
- **Actual / expected:** reminderMinutes weekly disimpan, tetapi scheduler hanya membaca agenda_events. Mengaktifkan pengingat weekly seharusnya menjadwalkan occurrence atau jelas dinyatakan belum didukung.
- **Reproduksi source:** buat jadwal mingguan dengan reminder 15 menit; tidak ada pemanggilan scheduler dari jalur write weekly atau pembacaan weekly oleh reconcileReminders.
- **Root cause / dampak:** field diimplementasi tanpa efek eksternal; pengguna dapat melewatkan kelas/komitmen.
- **Rekomendasi:** rekonsiliasi occurrence dengan horizon terdefinisi, atau nonaktifkan kontrol beserta penjelasan sementara.
- **Risiko / acceptance:** sedang; uji timezone/resume/skip/delete/edit/restore, limit OS dan izin ditolak; tidak ada reminder lama/duplikat.
- **Verifikasi:** CODE REVIEWED; tidak mengklaim notifikasi perangkat telah diamati.

### AUD-13 — Janji alarm lagu/full-screen melampaui jalur lifecycle yang tersedia

- **Kategori / severity / confidence:** alarm/recovery / **HIGH** / HIGH untuk source, MEDIUM untuk efek perangkat.
- **Lokasi:** src/features/task-manager/data/services/task-alarm-notification.service.ts:89–177; src/features/task-manager/presentation/components/alarm-ringing-modal.tsx:44–68; src/features/task-manager/data/repositories/managed-task.repository.ts:383–416; src/features/settings/presentation/hooks/use-settings.ts:115–120; src/features/task-manager/data/services/task-alarm-audio.service.ts:184–205, 262–297.
- **Actual:** loop custom audio dipicu polling React setiap 6 detik; jadwal OS hanya sound default. Tidak ditemukan notification-response handler/cold-start handoff. Firing biasa mensyaratkan tanggal dan menit sama persis, sehingga resume lewat menit dapat melewatkannya. Restore hanya merekonsiliasi agenda, bukan managed-task-*; audio kustom dicadangkan sebagai URI tanpa berkas.
- **Expected:** cakupan alarm dinyatakan jujur; foreground/background/killed/notification tap, restore dan file audio punya aturan recovery.
- **Reproduksi yang diperlukan:** jadwalkan 1 menit, tutup aplikasi, tunggu, ketuk notifikasi setelah menitnya lewat; restore cadangan berbeda; uji lagu setelah reinstall. **Langkah native ini belum dijalankan.**
- **Root cause / dampak:** side effect dipasang pada screen, bukan coordinator lifecycle; error izin/jadwal ditelan. Alarm dapat tidak memenuhi janji, reminder lama bertahan, custom URI tidak portable.
- **Rekomendasi:** dahulu tetapkan kemampuan yang dijamin dan warning izin; tambahkan coordinator tunggal untuk reconcile/response/resume/restore serta fallback audio. Jangan menjanjikan wake/full-screen lewat JS polling.
- **Risiko / acceptance:** tinggi untuk perubahan native; matriks APK Android foreground/background/killed/Doze/DND/izin ditolak/reboot/restore harus diuji. Pastikan satu subscriber/pemutar, bukan dua modal bersamaan.
- **Verifikasi:** CODE REVIEWED; runtime alarm NOT REVIEWED. API notifikasi dan audio dirujuk ke [Expo SDK 58 Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) dan [Audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio/).

### AUD-14 — Salat berikutnya salah pada interval setelah Subuh sebelum terbit

- **Kategori / severity / confidence:** waktu salat / **MEDIUM** / HIGH.
- **Lokasi:** src/features/prayer-times/data/services/prayer-times.service.ts:24–42, 62–76.
- **Actual:** adhan.nextPrayer mengembalikan sunrise; daftar UI tidak punya sunrise. Fallback langsung mengambil Subuh besok.
- **Expected:** jika widget menampilkan lima salat wajib, setelah Subuh salat berikutnya adalah Dzuhur hari ini; terbit boleh ditampilkan sebagai informasi berbeda.
- **Reproduksi:** F11 membekukan waktu 21 November 2026 05:00 WIB di Jakarta. Hasil menunjuk Subuh besok 04:03, padahal Dzuhur hari ini 11:40.
- **Root cause / dampak:** enum event astronomi disamakan dengan daftar lima salat; countdown menyesatkan pada interval harian.
- **Rekomendasi:** pilih waktu terdekat dari daftar yang ditampilkan memakai parameter waktu yang sama; lanjut besok hanya setelah semua item berlalu.
- **Risiko / acceptance:** rendah; uji sebelum Subuh, Subuh–terbit, terbit–Dzuhur, setelah Isya, pergantian tanggal serta koordinat berbeda.
- **Verifikasi:** VERIFIED F11 pada perhitungan/library; bukan validasi kesesuaian seluruh jadwal dengan otoritas lokal.

### AUD-15 — Managed task dihapus permanen dengan satu tap

- **Kategori / severity / confidence:** tindakan destruktif/UX / **MEDIUM** / HIGH.
- **Lokasi:** src/features/task-manager/presentation/screens/task-manager-screen.tsx:201–208; src/features/task-manager/data/repositories/managed-task.repository.ts:321–334.
- **Actual / expected:** ikon trash langsung delete JSON/core task/subtask dan prioritas; seharusnya ada konfirmasi konsekuensi atau undo yang dapat memulihkan.
- **Reproduksi source:** tekan trash card, handler langsung deleteTask; tidak melewati Alert seperti task pada StageCard.
- **Root cause / dampak:** interaksi baru tidak memakai kebijakan delete fitur lain; salah tap kehilangan task dan metadata alarm/subtask.
- **Rekomendasi:** konfirmasi yang menjelaskan dampak, atau undo atomik yang benar-benar memulihkan data.
- **Risiko / acceptance:** rendah; cancel tidak menulis, accept menghapus sekali, histori sesi tetap dipertahankan, gagal delete terlihat.
- **Verifikasi:** CODE REVIEWED.

### AUD-16 — Empat suite regresi gagal sebelum cakupan intinya selesai

- **Status tindak lanjut:** **DIPERBAIKI**. scripts/check-integrity.cjs memock adapter notifikasi managed pada environment bersama. Integrity/calendar/progress/timer berjalan melalui perintah asli tanpa preload audit (30/33/15/13 pemeriksaan); seluruh delapan suite, termasuk managed baru, lulus. Pengujian adapter native tetap dipisahkan. Bukti kegagalan berikut adalah baseline.
- **Kategori / severity / confidence:** testability/regresi / **MEDIUM** / HIGH.
- **Lokasi:** src/features/today-focus/data/repositories/daily-focus.repository.impl.ts:23; src/features/task-manager/data/repositories/managed-task.repository.ts:11; src/features/task-manager/data/services/task-alarm-notification.service.ts:1–2; scripts/check-backup.cjs:35–43; package.json scripts.
- **Actual:** check-integrity (setelah 17 PASS), check-calendar, check-progress, check-timer keluar 1 dengan SyntaxError Unexpected token 'typeof'. Loader CommonJS menarik source React Native tanpa transform/stub melalui dependency baru.
- **Expected:** suite bisa menjalankan assertion domain/repository tanpa native runtime.
- **Reproduksi:** jalankan empat skrip langsung pada Node 22.23.0 dengan node_modules yang sudah ada.
- **Root cause / dampak:** batas repository mengimpor native service yang belum ditutup harness; hasil R0 historis tidak menjadi gerbang regresi saat ini.
- **Rekomendasi:** mock adapter native di batas harness atau pisahkan side effect dari repository. Jangan mengubah logika produksi hanya agar test diam.
- **Risiko / acceptance:** rendah–sedang; ketujuh suite baseline exit 0, assertion lama benar-benar berjalan, tambahkan kasus ROUTINE/managed yang belum dicakup.
- **Verifikasi:** VERIFIED hasil run asli. Lanjutan memakai preload audit yang hanya menutup react-native Platform dan requireOptionalNativeModule; integrity 30, calendar 33, progress 15, timer 13 assertion kemudian PASS. Ini memperluas bukti logika domain tanpa memperbaiki harness resmi atau membuktikan perilaku native.

### AUD-21 — Aplikasi web gagal membuka database pada Metro standar

- **Kategori / severity / confidence:** konfigurasi runtime web / **HIGH** untuk web / HIGH; tidak diterapkan sebagai kegagalan Android.
- **Fitur / lokasi:** startup seluruh route web; metro.config.js:1–8; src/app/_layout.tsx (database initialization/recovery); expo-sqlite web worker.
- **Actual / bukti:** browser Chromium pada 360×800 mendapat HTTP 200, crossOriginIsolated=false dan UI “Data belum dapat dibuka / SharedArrayBuffer is not defined”. Respons tidak memiliki COOP/COEP. Konfigurasi hanya menambahkan asset wasm. Bukti: browser-application-evidence.json dan screenshots/application-initial-360.png.
- **Expected:** target web yang dikonfigurasi dapat menginisialisasi database sebelum CRUD, atau dukungan web dinyatakan tidak tersedia dengan jelas.
- **Reproduksi:** jalankan Expo web offline dengan konfigurasi repo; buka origin lokal dalam context browser baru; tunggu root initialization. Tidak memakai database pengguna.
- **Root cause / dampak:** syarat isolasi lintas-origin expo-sqlite web belum dikonfigurasi; semua fitur database web terhalang. [Dokumentasi SQLite SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/#web-setup) mensyaratkan wasm dan header yang mengizinkan SharedArrayBuffer.
- **Diagnosis lanjutan:** proxy audit sementara menambahkan header, tanpa mengubah konfigurasi repo. crossOriginIsolated menjadi true, tetapi SQLite kemudian timeout dan retry menghasilkan xFileControl undefined. Penyebab error kedua belum dipastikan; tidak dinaikkan menjadi bug source baru dan tidak ada klaim CRUD web lulus. Header saja belum dibuktikan cukup menutup temuan.
- **Rekomendasi:** tetapkan dukungan web, ikuti konfigurasi SQLite versi SDK, lalu uji worker/init/retry/persistensi pada origin baru dan reload.
- **Risiko / acceptance:** sedang; startup serta create/read/reload berhasil di browser yang didukung; tidak mengganggu asset/worker routing dan bundle native.
- **Verifikasi:** VERIFIED startup web gagal; perbaikan konfigurasi tidak diterapkan.

### AUD-23 — Simpan jadwal beberapa hari dapat commit sebagian dan duplikat saat retry

- **Kategori / severity / confidence:** integritas data/atomicity / **MEDIUM** / HIGH.
- **Fitur / lokasi:** jadwal rutin multi-hari; src/features/agenda/presentation/hooks/use-weekly-schedules.ts:67–83; src/features/agenda/data/repositories/weekly-schedule.repository.impl.ts (createWeeklySchedule).
- **Actual / bukti:** C01 menyuntik kegagalan INSERT hari kedua pada addSchedulesForDays([1,2]). Hook mengembalikan false tetapi satu row sudah tersimpan. Retry sukses membuat total tiga row, padahal pilihan pengguna hanya dua hari.
- **Expected:** satu submit beberapa hari commit seluruhnya atau tidak sama sekali; retry kegagalan tidak menggandakan hari pertama.
- **Reproduksi:** node docs/audits/continuation-checks.cjs; SQLite :memory:, fault kedua saja, lalu retry input sama. Log expected fault adalah bagian pengujian.
- **Root cause / dampak:** loop await per hari berada di luar transaksi batch dan tidak memiliki idempotency. Jadwal parsial/duplikat dapat muncul setelah kegagalan penyimpanan lokal.
- **Rekomendasi:** lakukan operasi multi-hari melalui satu metode repository dengan transaksi; refresh setelah hasil commit diketahui dan pertahankan draft pada kegagalan.
- **Risiko / acceptance:** sedang; fault pada tiap hari menghasilkan nol row baru, retry menghasilkan tepat dua occurrence master yang dipilih; edit/hapus/proyeksi tetap benar.
- **Verifikasi:** VERIFIED C01 pada kode hook/repository aktual dengan batas React/native mock; UI error native belum diuji.

### AUD-24 — Kegagalan menyimpan pengaturan tidak memberi feedback pengguna

- **Kategori / severity / confidence:** error recovery/UX / **MEDIUM** / HIGH.
- **Fitur / lokasi:** preferensi durasi, getaran, keep-awake dan lokasi salat; src/features/settings/presentation/hooks/use-settings.ts:59–78; src/features/settings/presentation/screens/settings-screen.tsx:106–140.
- **Actual / bukti:** C02 membuat saveSettings melempar error. updateSetting tetap resolve undefined, error publik tidak tersedia, backupError=null, dan nilai kembali dari pilihan 60 ke nilai lama 25. Pemilih lokasi pada screen ditutup segera setelah pemanggilan tanpa menunggu hasil commit. Hook hanya menulis console.error lalu reload.
- **Expected:** kegagalan save terlihat dan dapat dicoba ulang; pemilih lokasi mempertahankan input sampai penyimpanan berhasil.
- **Reproduksi:** continuation-checks.cjs C02 dengan saveSettings fault; handler lokasi ditelusuri pada source. Disk perangkat tidak diubah.
- **Root cause / dampak:** optimistic update tidak memiliki hasil sukses/gagal atau state error UI; pengguna dapat mengira durasi/lokasi tersimpan padahal revert, lalu menjalankan fokus atau jadwal salat dengan preferensi lama.
- **Rekomendasi:** kembalikan hasil/propagasi error, tampilkan pesan retry, dan tutup pemilih setelah commit; tetap rollback optimistic state ketika gagal.
- **Risiko / acceptance:** rendah–sedang; kegagalan setiap preferensi terlihat, lokasi draft tetap ada, retry menyimpan sekali, tampilan dan prayer-location store kembali ke nilai persisten secara konsisten.
- **Verifikasi:** VERIFIED C02 pada hook mock; penutupan picker CODE REVIEWED; tidak ada simulasi disk-full native.

## 8. UI/UX Findings

AUD-07/08/09/10/11/12/13/15 juga merupakan temuan UX. Tidak ada rekomendasi redesign berdasarkan selera; acuan adalah kontrak yang tampil, spesifikasi aktif, dan perhitungan terukur.

### AUD-17 — Kontras, label programatik, dan ukuran kontrol belum konsisten

- **Kategori / severity / confidence:** aksesibilitas / **MEDIUM** / HIGH untuk source/perhitungan.
- **Lokasi:** src/theme/colors.ts:98; src/features/targets/presentation/screens/target-detail-screen.tsx:810–815; src/features/targets/presentation/screens/create-target-screen.tsx:138–160; src/features/projects/presentation/screens/create-project-screen.tsx:124–145; src/features/agenda/presentation/screens/create-agenda-screen.tsx:220–248; sprout/primitives.tsx:260–283 dan pillTab style; src/features/targets/presentation/screens/target-detail-screen.tsx:721–740.
- **Actual:** teks kecil inkSubtle #7A867F di card #FFFDF8 memiliki rasio **3,73:1**, di cream **3,51:1**. Input baru tidak memiliki accessibilityLabel/labelledBy; FieldLabel hanya Text terpisah. Beberapa tombol detail 40×40 tanpa hitSlop dan pill tab minimum 40 bertentangan baseline produk 44/48.
- **Expected:** teks biasa ≥4,5:1; field tetap memiliki nama saat berisi; target sentuh sesuai standar produk. Angka 44/48 adalah keputusan mobile produk, bukan disamakan dengan minimum WCAG 2.5.8.
- **Reproduksi:** rasio dihitung dari token aktual dalam bukti; periksa atribut JSX dan style. TalkBack, fokus keyboard, announcement error dan zoom belum dijalankan.
- **Root cause / dampak:** style/control manual tanpa kontrak semantik seragam; teks placeholder/metadata sukar dibaca dan form sulit dibedakan oleh pembaca layar.
- **Rekomendasi:** gunakan token warna teks yang lulus, label eksplisit, selected/disabled/error announcements, area tekan konsisten; uji perangkat.
- **Risiko / acceptance:** rendah–sedang; kontras semua pasangan state aktif lulus, setiap input memiliki nama tetap, kontrol produk ≥44/48 dan TalkBack dapat menyelesaikan form.
- **Verifikasi:** VERIFIED untuk hitungan rasio; CODE REVIEWED untuk atribut/ukuran; visual/a11y native NOT REVIEWED. Acuan [WCAG 2.2 Contrast Minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum).

### AUD-18 — Spesifikasi desain aktif dan implementasi membentuk beberapa aturan berbeda

- **Kategori / severity / confidence:** konsistensi desain/maintainability / **MEDIUM** / HIGH.
- **Lokasi:** docs/design/DESIGN_V3.md:11–20; theme/tokens.ts:59–65; shared/ui/form-control-styles.ts:4–30; sprout/primitives.tsx styles; src/features/today-focus/presentation/components/focus-timer-widget.tsx:460–489; matriks bagian 9.
- **Actual:** dokumen Clean menetapkan kartu radius16/padding12, field48/textarea88; source memakai Sprout radius24–34/padding16–20, family Fredoka/Quicksand, field44/40/80, sedangkan timer memakai border gelap/shadow keras dan literal palet lain. Form agenda/managed padding20, form target/proyek/prioritas16 tanpa aturan pengecualian yang didokumentasikan.
- **Expected:** referensi desain menggambarkan implementasi yang disetujui; komponen dengan peran sama memiliki kontrak jelas termasuk pengecualian.
- **Reproduksi:** bandingkan nilai aktual pada bagian 9; spread formInputBase di akhir mengalahkan angka lama pada style lokal.
- **Root cause / dampak:** iterasi desain belum direkonsiliasi dan komponen lama/baru hidup bersama; perubahan token tidak menjangkau literal, QA dan implementasi berikutnya memakai acuan berbeda.
- **Rekomendasi:** konfirmasi/sahkan satu spesifikasi aktual terlebih dahulu, lalu konsolidasi input/card/header yang perlu seragam. Tidak mengubah visual otomatis.
- **Risiko / acceptance:** sedang–tinggi bila token font/layout diubah global; satu acuan, matrix konsisten atau pengecualian tercatat, snapshot/native kecil/teks besar diperiksa.
- **Verifikasi:** CODE REVIEWED; tidak mengklaim overflow/clipping sudah diamati.

### AUD-22 — Kontrol dan teks melampaui layar kecil pada fixture browser

- **Kategori / severity / confidence:** responsivitas/aksesibilitas teks besar / **MEDIUM** / HIGH pada fixture, MEDIUM untuk transfer ke native.
- **Fitur / lokasi:** src/features/today-focus/presentation/screens/create-priority-screen.tsx:157 dan 278 (categoryTilesRow); src/features/agenda/presentation/screens/create-agenda-screen.tsx (row kategori); src/features/task-manager/presentation/screens/create-managed-task-screen.tsx:343–363 dan 957–997 (durationCard/row/chip); src/features/targets/presentation/screens/target-list-screen.tsx:220 dan style trailHeaderTitle; src/features/targets/presentation/screens/target-detail-screen.tsx:788–812 (statusBadge).
- **Actual / bukti:** 112 kasus fixture menghasilkan 26 kasus dengan overflow terukur. Pada 320 px, kategori Hobi berada x268–344 dan Rapat x272–348; chip 2j pada form managed x345,6–378,4. Pada 360 px/font100%, daftar target, task-manager dan form managed masih memiliki elemen di luar batas. Pada 320 px/font200%, form managed memiliki 14 kandidat overflow dan detail target lima. Ini jumlah elemen, bukan jumlah bug independen.
- **Expected:** kontrol wajib dan teks esensial tetap dapat dibaca/dicapai pada lebar yang didukung dan teks besar; overflow tidak disengaja tidak dipotong. Row scroll yang memang disengaja tidak dihitung sebagai masalah oleh pemeriksa.
- **Reproduksi:** node docs/audits/render-all-screens.cjs, sajikan .expo/audit-all-ui pada port 8088, lalu node docs/audits/check-browser-layouts.cjs menggunakan Playwright yang sudah dibundel runtime Codex. Lebar 320/360/412/768 px; fontScale simulasi CSS 1/2. Bukti per elemen di browser-layout-evidence.json.
- **Bukti visual:** [form managed 360/font100%](./screenshots/create-managed-task-360-1x.png), [prioritas 320/font200%](./screenshots/create-priority-320-2x.png), [target 360/font100%](./screenshots/targets-360-1x.png), [detail target 320/font200%](./screenshots/target-detail-320-2x.png). Screenshot berasal dari fixture SSR tanpa hydration; ilustrasi expo-image dan selector berbasis effect belum selesai dimuat. Kekosongan tersebut tidak dinyatakan sebagai bug aplikasi.
- **Root cause / dampak:** beberapa row menggabungkan lebar tetap/min-content dan gap tanpa wrap/shrink/scroll yang cukup. Pilihan kategori/durasi dan label status dapat terpotong. Perbedaan pengukuran font/Yoga native masih harus diuji.
- **Rekomendasi:** beri wrap/grid/scroll atau batas shrink pada row yang terbukti bermasalah; verifikasi label dan pilihan tetap lengkap tanpa mendesain ulang visual lain.
- **Risiko / acceptance:** sedang; fixture kecil/teks besar tidak memiliki kontrol wajib di luar area, lalu konfirmasi Android Expo Go dengan keyboard, safe area dan font OS. Nilai overflow=0 bukan bukti semua aspek layout lulus.
- **Verifikasi:** VERIFIED untuk geometri fixture dan screenshot yang disebut; native NOT REVIEWED.

## 9. Design System Consistency Matrix

Nilai berikut adalah nilai source (dp untuk geometri), bukan hasil pengukuran screenshot. Spread terakhir menang. Screen default horizontal 16 untuk width <360 dan 20 untuk ≥360; override screen menggantinya, bukan menjumlahkannya.

| Properti | Hari Ini | Target list | Proyek list | Agenda | Referensi/status |
|---|---|---|---|---|---|
| Padding horizontal | Screen 16/20 | Screen 16/20 | Screen 16/20 | Screen 16/20 | Konsisten untuk layar utama |
| Header top/bottom | 12/8 (:671) | 12/4 (:275) | 12/12 (:228) | 12/8 (:404) | Perbedaan source; intent belum didokumentasikan |
| Gap content | 12 (:704) | 12 (:311) | 12 (:255) | 16 (:427) | Konteks section berbeda; bukan otomatis bug |
| Bottom content padding | 100 | 110 | 100 | 100 | Override tetap; safe area/layout native belum diperiksa |
| Heading aktual | 26/32 bold | 27/33 bold | 26/32 bold | 26/32 bold | DESIGN_V3 umumnya headlineSmall 18/24; AUD-18 |
| Surface/background | cream #FAF6EC | cream | cream | cream | Token konsisten, berbeda dari deskripsi Clean |
| Kartu utama | HeroBlob + timeline | TargetCard empat tema | SoftCard/ProjectCard | SoftCard event/weekly | Peran berbeda sah; variasi perlu dokumentasi |

| Properti | Target baru | Proyek baru | Prioritas baru | Agenda baru | Tugas terjadwal baru |
|---|---|---|---|---|---|
| Padding horizontal | 16 (:223) | 16 (:216) | 16 (:240) | 20 (:305) | 20 (:856) |
| Header FormScreenHeader | 18 bold; own horizontal16 | sama | sama | sama | sama |
| Gap body | 12 | 12 | 12 | 12 | 12 |
| Input minimum | 44 base | 44 base | 44 base | 44 base; waktu40 compact | 44 base; waktu40 compact |
| Radius input / font | 12 / 14 regular | sama | sama | sama | sama |
| Multiline | description44 minimum | description44 minimum | tidak ada | catatan single-line | notes44 minimum |
| Tombol submit | SunButton58/radius29 | sama | sama | sama | sama |
| Bottom override | 120 + inset | 120 + inset | 120 + inset | 120 + inset | 130 + inset |
| Label | FieldLabel15; margin8/4 | sama | sama | sama | section manual |
| Status | Persamaan base ada; label/a11y AUD-17 | target selector AUD-08 | payload AUD-09 | spacing berbeda tanpa acuan | validasi AUD-05 |

| Properti kartu/modal | Nilai aktual dan lokasi | Acuan/status |
|---|---|---|
| Shared Card filled | padding16/radius16; src/shared/ui/card.tsx:27,40 | V3 meminta padding12 |
| SoftCard | padding16/radius24; primitives style softCard | Variasi baru belum masuk acuan aktif |
| ProjectCard / StageCard | radius28; project-card:86, stage-card:262 | Bandingkan antar daftar dengan peran sama |
| TimelineEvent / WeeklyOccurrence | radius26; masing-masing :138/:103 | Keduanya konsisten satu sama lain |
| Detail target overview | padding16/radius30; target-detail:753 | Pengecualian belum didokumentasikan |
| Detail proyek card | padding20/radius34; project-detail:399 | Pengecualian belum didokumentasikan |
| AppBottomSheet | full-screen 100%; header/body/footer horizontal16, body gap12; :153–220 | Nama dan maxHeight prop tidak lagi mewakili perilaku |
| Form label spacing shared | top12/bottom8; form-control-styles:32 | Berbeda dari FieldLabel top8/bottom4 |
| Form textarea shared | minimum80; form-control-styles:27 | V3 menyebut88; angka96 lama pada stage ditimpa spread |
| Button biasa vs SunButton | min48/56/48 radius12 vs fixed58 radius29 | Kebutuhan CTA bisa berbeda; family perlu jelas |
| Pemilih tanggal | DateStripHeader aktif vs CapsuleDateStrip tidak digunakan | V3 meminta CapsuleDateStrip; tidak dianggap alasan mengganti tanpa QA |

Warna kontras yang diperiksa: ink/cream **11,23:1**; inkSubtle/card **3,73:1**; inkSubtle/cream **3,51:1**. Suite UI lama lulus kontras atas pasangan yang diassert sendiri; hasil itu tidak mencakup semua warna Sprout/literal terbaru.

## 10. Performance & Security Findings

### AUD-19 — Lockfile memuat paket terdampak advisori

- **Kategori / severity / confidence:** supply chain/tooling / **MEDIUM** / HIGH untuk inventory; LOW untuk eksploit APK.
- **Lokasi:** package-lock.json, package.json dependencies; npm-audit.json berisi path node/version/range/advisory.
- **Actual:** npm audit --omit=dev --ignore-scripts --json exit1: **14 paket terdampak, 3 high, 11 moderate, 0 critical**. Paket high: @expo/cli, node-forge, zod. Lock memiliki node-forge1.4.0, zod3.25.76, glob13.0.6, minimatch10.2.6.
- **Expected:** advisori ditriase terhadap penggunaan aktual dan patch yang kompatibel SDK; tidak ada klaim aman hanya karena aplikasi offline.
- **Reproduksi:** perintah audit di bagian 11; izin pengguna diperoleh sebelum metadata dikirim registry.
- **Root cause / dampak:** dependency transitif tertinggal. node-forge datang melalui @expo/code-signing-certificates → @expo/cli → expo. Tidak ditemukan import library ini pada fitur bisnis aktif; risiko utama yang terbukti adalah keberadaan dependency di tooling, bukan eksekusi serangan pada APK.
- **Rekomendasi:** patch dependency kompatibel SDK58 dan tinjau drizzle-kit sebagai tooling. Jangan menjalankan audit fix --force: rekomendasi otomatis npm bahkan menyarankan downgrade major Expo52 untuk beberapa rantai.
- **Risiko / acceptance:** sedang–tinggi bila mengganti major sembarang; dependency tree/scan diperbarui, tipe/lint/suite/build kompatibel dan jalur exploit ditriase.
- **Verifikasi:** VERIFIED inventory npm; penetrasi/eksploit NOT REVIEWED. Referensi contoh [node-forge advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) dan [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).

### AUD-20 — Membuka satu proyek membaca semua proyek dan melakukan query per item

- **Kategori / severity / confidence:** efisiensi data / **LOW** / HIGH.
- **Lokasi:** src/features/projects/data/repositories/project.repository.impl.ts:87–162, khususnya loop116–137; src/db/connection.ts:12–16,26–42.
- **Actual:** getProjectById memanggil getProjects lalu find. Dengan 30 proyek tertaut, satu pembacaan detail menjalankan **63 SELECT aplikasi + 63 SELECT1 pemeriksaan koneksi =126 SELECT**.
- **Expected:** membaca satu ID tidak memerlukan query metadata setiap proyek.
- **Reproduksi:** F10 mencatat statement pada adapter SQLite di memori; bukan benchmark durasi native.
- **Root cause / dampak:** list query dipakai sebagai detail query; join/aggregate dilakukan per item, liveness probe terjadi setiap akses proxy. Potensi biaya meningkat seiring data; tidak ada klaim p95/startup/FPS buruk tanpa profiling.
- **Rekomendasi:** filter ID di database, ambil summary hanya pemilik terkait; hilangkan query per-item bila datanya bisa dibaca bersama. Evaluasi probe berdasarkan profil native.
- **Risiko / acceptance:** rendah–sedang; hasil task/progres sama, detail tidak bertambah query secara linear terhadap proyek lain, benchmark perangkat sebelum menyatakan peningkatan waktu.
- **Verifikasi:** VERIFIED jumlah statement F10; latensi/memori native NOT REVIEWED.

### 10.1 Pemeriksaan keamanan/integritas lainnya

- Query impor memakai parameter dan identifier schema allowlist; SQL arsip migrasi tidak dieksekusi. Backup dibatasi 10MiB/50.000 baris, ID/FK/version diverifikasi; celah nested JSON dan enum dicatat AUD-01/05.
- Restore memakai staging, snapshot pengaman, pemeriksaan data tidak berubah dan transaksi; beberapa fault injection rollback lulus pada suite backup.
- Tidak ditemukan secret hardcoded pada scan pola source/config yang dilakukan. Ini tidak mencakup seluruh riwayat Git, dependency binary, perangkat, atau storage pengguna.
- Backup/safety-copy dan URI media adalah data lokal; tidak ada proteksi enkripsi backup yang diimplementasikan. Tidak diposisikan sebagai celah auth server karena server/login tidak ada.
- Upload lagu menyalin file ke dokumen aplikasi dengan fallback URI provider; retensi, validasi ukuran/jenis media dan portability perlu QA, terutama AUD-13. Tidak ada pemeriksaan isi berkas berbahaya atau uji disk penuh native.
- Daftar disusun dalam ScrollView/map dan beberapa query memuat seluruh tabel; tidak dilakukan benchmark bundle/startup/native re-render/memory. Temuan terukur hanya jumlah query AUD-20; rekomendasi virtualization baru layak setelah profil ukuran nyata.
- Rate limiting/CSRF/session/token server: NOT APPLICABLE. Penyimpanan OS/permission, perangkat rooted, Android backup transport dan distribusi APK: NOT REVIEWED.

## 11. Test Results & Coverage

Perintah dijalankan menggunakan dependency yang sudah terpasang. Tidak ada npm install, lockfile rewrite, database reset, seed, migration pada data pengguna, atau audit fix.

Tabel berikut menyimpan hasil audit baseline. **Perintah yang dulu FAIL sudah diperbaiki pada AUD-16; hasil terkini seluruh delapan suite tersedia di bagian 11.3.** Log/snapshot lama dipertahankan sebagai riwayat, bukan hasil verifikasi setelah perbaikan.

| Pemeriksaan | Hasil aktual | Batas cakupan |
|---|---|---|
| node --version | v22.23.0 | Host audit |
| node node_modules/typescript/bin/tsc --noEmit | PASS; tidak ada diagnostic | Bukan bukti runtime |
| node node_modules/eslint/bin/eslint.js src scripts --no-cache | PASS; tidak ada diagnostic | Tidak auto-fix |
| node scripts/check-backup.cjs | PASS, exit0; 45 checks | SQLite memory + file/native mock; fixture belum mencakup ROUTINE |
| node scripts/check-integrity.cjs | FAIL, exit1; 17 PASS lalu SyntaxError typeof | Migrasi subset terbukti, assertion repository berikutnya tidak selesai |
| node scripts/check-calendar.cjs | FAIL, exit1; SyntaxError typeof | Tidak dihitung lulus kalender |
| node scripts/check-progress.cjs | FAIL, exit1; SyntaxError typeof | Tidak dihitung lulus seluruh status/progres |
| node scripts/check-timer.cjs | FAIL, exit1; SyntaxError typeof | Tidak dihitung lulus timer |
| node scripts/check-ui.cjs | PASS, exit0 | SSR/mock; 42 render screen +6 timer +10 cancel/empty +2 warning +12 form sesuai log |
| node scripts/check-db-imports.cjs | PASS, exit0; 13 modul | Hanya graph database yang ditelusuri skrip |
| reproduce-findings.cjs | PASS assertion reproduksi 11 kasus | PASS berarti bug/observasi berhasil dibuktikan, bukan aplikasi lulus |
| Empat suite dengan --require ./docs/audits/native-boundary-stub.cjs | PASS; integrity 30 + calendar 33 + progress 15 + timer 13 = 91 assertion | Logika suite asli berjalan; Platform web/optional native module dimock; tidak memperbaiki perintah asli AUD-16 |
| continuation-checks.cjs | PASS empat kasus | Partial weekly, error settings, race kategori, preservasi target NUMERIC/MAINTENANCE; data sementara |
| Expo export --platform android --no-bytecode --max-workers 2 | PASS; 3.774 modul, 55 asset, JS sekitar 4,8 MB | Bundle JavaScript; bukan build APK atau bukti native API bekerja |
| Expo export --platform ios --no-bytecode --max-workers 2 | PASS; 3.629 modul, 51 asset, JS sekitar 4,6 MB | Bundle JavaScript; bukan IPA, simulator atau signing iOS |
| Browser aplikasi asli, context baru 360×800 | FAIL startup; SharedArrayBuffer is not defined | AUD-21; database pengguna tidak diakses |
| Browser melalui proxy header audit sementara | Startup tetap gagal timeout; retry xFileControl undefined | Isolasi origin aktif; penyebab error lanjutan belum dipastikan, CRUD tidak dijalankan |
| render-all-screens + check-browser-layouts | PASS render 112 kasus; 26 kasus memiliki kandidat overflow; 28 screenshot fixture | 14 screen × 4 lebar × 2 skala font; font dimuat, tanpa hydration, tanpa DB, bukan native E2E |
| npm audit --omit=dev --ignore-scripts --json | exit1; 14 paket terdampak | Metadata registry; bukan bukti exploit APK |
| Emulator audit dengan data baru, system image API36 yang sudah tersedia | BOOT BLOCKED; WHPX failed to setup partition, 80070005 | AVD audit dibuat terpisah di .expo; data AVD Pixel_3a dan perangkat pengguna tidak disalin/direset. Flag GPU software juga ditolak emulator versi ini; penolakan WHPX tetap blocker tersendiri |
| Expo Go SDK58.0.5 cache lokal | Ditemukan; belum dipasang/dijalankan | Tidak ada APK MyLife; emulator gagal sebelum pengujian, ADB tetap kosong |
| Build APK/EAS, E2E native, screen reader | NOT REVIEWED | Tidak membangun/mengunggah binary atau memasang dependency baru |
| Visual viewport/keyboard/font scaling native | NOT REVIEWED | Bukti browser tersedia; keyboard/safe area/TalkBack/OS scaling native belum diuji |

Error RootLayout “Relasi legacy bermasalah” di log suite UI adalah fault yang sengaja disimulasikan dan assertion recovery lulus. Jangan salah melaporkannya sebagai kegagalan startup data pengguna.

Rerun reproduksi dari root:

    node docs/audits/reproduce-findings.cjs
    node docs/audits/reproduce-findings.cjs --json

Harness mengganti Platform native dengan stub web, memakai kode repository produksi melalui loader test, dan membuka **hanya :memory:**. Uji jadwal salat memakai jam beku di WIB; jam sistem asli tidak diubah.

Untuk mengulang empat suite tanpa mengubah source/harness aslinya:

    node --require ./docs/audits/native-boundary-stub.cjs scripts/check-integrity.cjs
    node --require ./docs/audits/native-boundary-stub.cjs scripts/check-calendar.cjs
    node --require ./docs/audits/native-boundary-stub.cjs scripts/check-progress.cjs
    node --require ./docs/audits/native-boundary-stub.cjs scripts/check-timer.cjs
    node docs/audits/continuation-checks.cjs

Bundle diperiksa dengan Expo CLI lokal, CI=1, EXPO_OFFLINE=1, EXPO_NO_TELEMETRY=1, output .expo/audit-android atau .expo/audit-ios. Tidak ada instalasi paket. Durasi bundling host bukan benchmark startup, ukuran bundle bukan ukuran APK.

### 11.1 Coverage yang belum terpenuhi

- Semua 14 screen code-reviewed dan dirender/diukur pada 112 fixture browser. Suite assertion UI lama tetap mencakup tujuh screen; render tambahan tidak menggantikan E2E/component interaksi lengkap.
- Lima form legacy mendapat fixture dan reflection/agenda memiliki mock interaksi gagal/retry; form baru juga dirender. Focus/keyboard, label yang diumumkan, serta selector setelah effect/hydration belum diuji native.
- Tidak ada UI automation untuk alur navigasi proyek, selector keempat, custom audio, backup Android picker/share, penolakan izin, reboot, DND/Doze, atau restore media.
- Integrity/migrasi 30 assertion kini berjalan, termasuk fault/rollback/ownership/cascade. C04 membuktikan preservasi NUMERIC/MAINTENANCE di backup; editor nilai legacy dan semua milestone belum dibuktikan end-to-end.
- Static import-cycle check database lulus; siklus dynamic import seluruh aplikasi tidak diklaim bebas.
- Kalender 33 assertion berjalan: WIB/WITA/WIT, DST, lintas malam, all-day, rollover dan scheduler mock. Pengiriman notifikasi OS belum diuji. Setelah perbaikan AUD-16, perintah resmi berhasil tanpa preload audit.

### 11.2 QA native yang masih memerlukan runtime tersambung

Pengguna menyatakan masih mengembangkan melalui Expo Go. APK MyLife tidak wajib untuk memeriksa form, CRUD, navigasi, SQLite, timer foreground dan sebagian notifikasi lokal. [Dokumentasi notifications SDK58](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) membedakan notifikasi lokal yang tersedia di Expo Go dari remote push Android yang memerlukan development build. Audit ini tidak menemukan kebutuhan backend push untuk alur reminder lokal yang sedang dinilai.

Daftar ini adalah pekerjaan terbuka, bukan hasil lulus:

- **Expo Go pada Android:** startup database kosong/restart; create target → proyek → tahap → task → prioritas → fokus → refleksi; persistensi dan filter; navigasi Proyek; agenda/weekly multi-hari; category CRUD; backup/export/restore melalui picker/share. Gunakan data uji dan cadangan terpisah, jangan reset data pengguna.
- **Layout/interaksi native:** 320/360/412 dp, font OS besar, keyboard terbuka pada 54 field, safe area/back gesture, pesan validasi/gagal simpan, TalkBack dan target sentuh.
- **Notifikasi/alarm:** izin diterima/ditolak, jadwal lokal foreground/background, tap setelah menit alarm lewat, snooze, custom audio URI dan restore. Expo Go menguji kemampuan host-nya; hasil tidak membuktikan konfigurasi permission/plugin binary MyLife.
- **Development/release build MyLife kemudian:** exact-alarm permission, cold start/terminated, reboot/Doze/DND, foreground audio/lifecycle dan batas full-screen sesuai janji produk. Tidak ada build atau izin OS yang diubah dalam audit ini.
- **iOS:** bundle berhasil diekspor, tetapi native simulator/perangkat dan kebijakan permission/audio belum diuji dari host Windows.

Emulator audit gagal sebelum Expo Go dijalankan. Memperbaiki WHPX atau memakai perangkat Android tersambung adalah prasyarat lingkungan berikutnya; status tidak disamakan dengan kerusakan aplikasi dan tidak ditutup oleh hasil lint/bundle.

### 11.3 Hasil setelah perbaikan managed task

Seluruh perintah berikut dijalankan langsung melalui Node/skrip proyek, tanpa preload audit. Pemeriksaan database memakai SQLite :memory:. Fault di log sengaja disuntikkan oleh test, bukan kegagalan data pengguna.

| Pemeriksaan | Hasil terkini |
|---|---|
| npm run test:managed | PASS, 24 pemeriksaan; status, concurrency, rollback delapan titik kegagalan, metadata rusak, antrean notifikasi dan error hook |
| npm run test:backup | PASS, 52 pemeriksaan; regresi ROUTINE tetap lulus |
| npm run test:integrity | PASS, 30 pemeriksaan |
| npm run test:calendar | PASS, 33 pemeriksaan |
| npm run test:progress | PASS, 15 pemeriksaan |
| npm run test:timer | PASS, 13 pemeriksaan |
| npm run test:ui | PASS, assertion/render suite UI yang sudah tersedia; bukan QA native managed form |
| npm run test:db-imports | PASS, 13 modul graph database |
| TypeScript --noEmit | PASS |
| ESLint src scripts --no-cache | PASS |

Eksekusi delapan suite di atas mencakup 167 pemeriksaan bernomor dari enam suite database/domain, ditambah suite UI dan graph import dengan metriknya sendiri. Bukti lengkap termasuk run sebelum perbaikan (2 lulus/22 gagal pada suite managed baru) disimpan di managed-task-remediation.json. Test menggunakan kode repository/hook aktual dengan mock notifikasi/React yang eksplisit.

UI tambah managed task kini menampilkan error hook dan mempertahankan draft; toggle/subtask/delete serta aksi modal alarm menangani rejection database. Komponen tersebut diperiksa source, lint dan typecheck. Pengguna kemudian melaporkan enam langkah uji manual paket managed berhasil: dua tugas tersimpan, completion/reopen selaras antara Hari Ini dan Manajemen Tugas, subtask bertahan, data tetap ada setelah buka ulang, serta tugas yang dihapus tidak muncul kembali. Ini USER REPORTED PASS sesuai panduan Expo Go, bukan observasi langsung agen. Model perangkat/OS tidak diberikan. Error penyimpanan native, penulisan bersamaan di perangkat, dan alarm/background tidak tercakup enam langkah tersebut; kasus database/concurrency tetap memiliki bukti otomatis.

## 12. Prioritized Remediation Backlog

Effort relatif: S = satu area kecil; M = beberapa boundary/tes; L = lifecycle/native lintas fitur. Bukan estimasi hari kerja.

| Urutan | ID | Severity / effort | Ketergantungan dan kriteria selesai |
|---|---|---|---|
| 1 | AUD-01 | HIGH / S | Tambah ROUTINE ke kontrak bersama + round-trip/regression, backup lama tetap didukung |
| 2 | AUD-16 | MEDIUM / S–M | Pulihkan harness native boundary agar suite lama menjadi gerbang untuk perubahan berikut |
| 3 | AUD-02/03/04 | HIGH / M | Sumber status tunggal + write metadata/core atomik/serialized; fault dan concurrency lulus |
| 4 | AUD-05/06/23/24 | MEDIUM / M | Validasi write/import/legacy, unique kategori konsisten, opt-out prioritas, weekly atomik dan feedback setting |
| 5 | AUD-07 | HIGH / S | Entry Proyek dan route task.projectId dapat dicapai dari home |
| 6 | AUD-13 | HIGH / L | Tetapkan kemampuan alarm, kemudian coordinator/restore/response dan QA APK |
| 7 | AUD-12 | MEDIUM / M | Pengingat weekly bekerja atau kontrol dinonaktifkan dengan penjelasan |
| 8 | AUD-08/09/10/11/14/15 | MEDIUM / S–M | Semua input/CTA jujur, tanggal bulanan lengkap, next prayer benar, delete aman |
| 9 | AUD-17 | MEDIUM / M | Label/kontras/target area, TalkBack dan large-text pada form utama |
| 10 | AUD-18 | MEDIUM / M | Sahkan satu design spec, konsolidasi secukupnya, QA seluruh screen |
| 11 | AUD-19 | MEDIUM / M | Patch dependency kompatibel SDK dan triase tooling vs APK |
| 12 | AUD-20 | LOW / S–M | Batasi query detail, ukur di perangkat sebelum klaim speed-up |
| Sesudah integritas; awal bila web memang didukung | AUD-21 | HIGH (web) / M | Startup SQLite web, worker, CRUD dan persistensi reload; proxy audit belum membuktikan fix |
| Bersama aksesibilitas/form | AUD-22 | MEDIUM / M | Tutup overflow fixture kecil/teks besar, lalu cek Android/keyboard/native font |

**AUD-01/02/03/04/16 telah diterapkan dan diverifikasi otomatis.** AUD-01 dan enam alur data managed task juga mendapat konfirmasi uji manual pengguna. Berikutnya: validasi dan opt-out prioritas (AUD-05/06), partial-save weekly/error settings (AUD-23/24), serta akses Proyek (AUD-07). Alarm lifecycle, UI error penyimpanan native dan dependensi tetap perlu paket lanjutan.

## 13. Regression Risk

| Perubahan | Fitur yang wajib diuji ulang |
|---|---|
| Enum/parser/schema | Ekspor/impor format lama/baru, staging, recovery, migrasi v0/v1, semua schedule type |
| Status/transaksi managed | Hari Ini, progres target/proyek, prioritas tanggal lain, timer task, subtask, snooze, delete, penulisan konkuren |
| Validator input/import | Draft gagal save, error/retry, data legacy nullable, file invalid tidak mengubah data aktif |
| Navigation/shell | Semua tab/drawer/quick-add, deep link ID, hardware back, navigation stack setelah restore |
| Coordinator alarm | Foreground/background/killed, tap notifikasi, izin, restore, reboot/Doze, media URI dan satu pemutar |
| Kalender/prayer | Bulan enam baris, zona WIB/WITA/WIT, pergantian hari/tahun, all-day/lintas malam dan subuh–terbit |
| Shared theme/form | Seluruh 14 screen, modal full-screen, 320/360/412, tablet, font200%, keyboard terbuka, safe area/TalkBack |
| Dependency patch | Typecheck/lint/seluruh suite, Metro, APK Android, native file/audio/notification compatibility |
| Query detail | Kesesuaian summary/direct task/stage task/project-linked target, kosong/banyak data |

Technical debt yang nyata: metadata managed di JSON berdampingan dengan model task relasional, beberapa UI/dokumen desain paralel, form lama tetap ditest sementara form baru dipakai, duplikasi generator ID, dan typing any pada patch/form style. Tidak diusulkan migrasi arsitektur besar, cloud, dependency baru, atau redesign otomatis.

## 14. Final Audit Conclusion

Proyek memiliki fungsi lokal dan mekanisme proteksi data yang nyata. Keberhasilan lint, TypeScript, suite backup/UI, 91 assertion tambahan dan ekspor JavaScript Android/iOS belum cukup untuk menyatakan siap rilis. Bug backup, sumber status ganda, race/partial-write, navigasi Proyek, serta ketidakpastian alarm harus ditangani lebih dahulu. Startup web, overflow fixture, partial-save weekly dan error pengaturan menambah empat temuan sehingga total menjadi 24 (7 HIGH, 16 MEDIUM, 1 LOW).

Coverage source mencakup seluruh 10 modul, 24 kemampuan, 14 screen, 16 file form/54 TextInput dan 51 file komponen, termasuk pemeriksaan source template lanjutan. Seluruh screen mendapat fixture browser (112 kasus, 28 screenshot), tetapi hydration, state data hasil effect, ilustrasi expo-image, dan interaksi native tidak tercakup. Nilai target legacy terbukti terjaga di backup; authoring/editor legacy belum didukung penuh. **Audit runtime native belum selesai** karena tidak ada perangkat dan emulator gagal boot; laporan ini tidak menyatakan seluruh fitur VERIFIED.

Pada audit baseline tidak ada perbaikan source, penambahan dependency atau perubahan data pengguna; hash 162 source saat itu dicatat di continuation-verification.json. Setelah remediation diizinkan, AUD-01 diperbaiki dan pengguna melaporkan uji manualnya berhasil. Paket berikutnya menutup AUD-02/03/04/16 dengan status core yang konsisten, transaksi, error recovery dan harness resmi yang berjalan; enam langkah manual alur data managed juga dilaporkan berhasil. Hasil penutup berada di aud-01-remediation.json dan managed-task-remediation.json. Enam source berbeda dari baseline sesuai cakupan dua paket; 156 source lain tetap cocok pada verifikasi paket, termasuk perubahan pengguna yang tidak terkait. Tidak ada dependency, lockfile, skema atau data pengguna yang diubah oleh remediation. Tersisa 19 temuan terbuka dan QA native error/alarm lanjutan pada bagian 11.2/11.3.

### Lampiran: baseline dan referensi verifikasi

Hash setiap source berada pada sourceInventory di audit-evidence.json. Dokumen audit membaca working tree; sepuluh modifikasi awal tetap dipertahankan:

- [docs/design/DESIGN_V3.md](../../docs/design/DESIGN_V3.md)
- [src/features/agenda/presentation/screens/create-agenda-screen.tsx](../../src/features/agenda/presentation/screens/create-agenda-screen.tsx)
- [src/features/projects/presentation/screens/create-project-screen.tsx](../../src/features/projects/presentation/screens/create-project-screen.tsx)
- [src/features/targets/presentation/screens/create-target-screen.tsx](../../src/features/targets/presentation/screens/create-target-screen.tsx)
- [src/features/task-manager/presentation/components/add-managed-task-modal.tsx](../../src/features/task-manager/presentation/components/add-managed-task-modal.tsx)
- [src/features/task-manager/presentation/screens/create-managed-task-screen.tsx](../../src/features/task-manager/presentation/screens/create-managed-task-screen.tsx)
- [src/features/today-focus/presentation/components/session-reflection-modal.tsx](../../src/features/today-focus/presentation/components/session-reflection-modal.tsx)
- [src/features/today-focus/presentation/screens/create-priority-screen.tsx](../../src/features/today-focus/presentation/screens/create-priority-screen.tsx)
- [src/shared/ui/app-bottom-sheet.tsx](../../src/shared/ui/app-bottom-sheet.tsx)
- [src/shared/ui/form-control-styles.ts](../../src/shared/ui/form-control-styles.ts)

Referensi teknis eksternal yang dipakai untuk batas audit: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [Audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio/), serta [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Nilai source dan reproduksi lokal tetap menjadi bukti utama temuan.

Laporan ini membedakan inspeksi source, pengujian mock/SQLite memory, dan QA perangkat. Sebutan VERIFIED tidak pernah berarti aplikasi telah dilihat/diuji di perangkat jika metode tersebut tidak dijalankan.

