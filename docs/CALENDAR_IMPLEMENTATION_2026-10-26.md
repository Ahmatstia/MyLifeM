# Tanggal, agenda, dan pengingat — R0.3

Implementasi 26 Oktober 2026. Tahap ini memperbaiki A04, A09, dan jalur pengingat A10. Pengujian repository memakai SQLite sementara di memori; tidak membuka atau mengubah database pengguna. Tidak ada dependency baru, perubahan skema, atau migrasi massal waktu.

## Aturan tanggal dan waktu

- Prioritas harian memakai tanggal kalender perangkat `YYYY-MM-DD`. Batas hari dihitung dari tengah malam lokal ke tengah malam berikutnya, termasuk hari DST sepanjang 23/25 jam.
- Agenda berjam menyimpan instant UTC dan ditampilkan dalam zona perangkat. Query menggunakan overlap `[mulai, selesai)`: agenda lintas malam muncul pada kedua hari, tetapi agenda yang berakhir tepat tengah malam tidak muncul pada hari berikutnya.
- Agenda sepanjang hari memakai tanggal awal dan akhir eksklusif, tanpa jam atau pengingat. Tanggal kalender tetap sama ketika zona perangkat berubah.
- Form menyediakan pilihan eksplisit **Selesai besok**. Jam salah, jam lokal yang tidak ada saat DST, atau akhir sebelum/sama dengan awal ditolak; tidak ada penggantian jam diam-diam. Jam berulang saat DST mengikuti kejadian pertama yang dipilih JavaScript.
- Tumpang tindih agenda berjam aktif diperbolehkan, dengan peringatan dan penanda kartu. Agenda selesai/sepanjang hari tidak dianggap konflik.
- Seluruh menit satu sesi fokus dihitung pada tanggal lokal sesi dimulai. Sesi lintas malam tidak dipecah karena data belum menyimpan segmen aktivitas/pause. Controller timer dan refleksi tetap menunggu R0.5.

Data legacy tidak ditulis ulang saat dibaca. Timestamp ber-offset mempertahankan instant; timestamp tanpa offset ditafsirkan dalam zona perangkat saat ini. Zona historis yang tidak tercatat tidak dapat direkonstruksi. Agenda sepanjang hari legacy mengikuti bagian tanggalnya: akhir tengah malam bersifat eksklusif, sedangkan akhir lama `23:59:59` dipetakan ke hari berikutnya. Rentang rusak menghasilkan error tanpa menghapus catatan. Validasi import juga menolak sesi/agenda berjam yang hanya berisi tanggal.

Query SQLite menggunakan kandidat `julianday` dan prefiks tanggal, kemudian filter tepat di JavaScript untuk mendukung campuran legacy. Normalisasi kolom/indeks membutuhkan keputusan migrasi zona waktu tersendiri; performa dataset besar di perangkat belum diprofilkan. Database tetap versi 1; backup tetap `formatVersion: 1`, `schemaVersion: 2`.

## Lifecycle dan penyimpanan

Hari Ini dan Agenda memeriksa pergantian hari, zona, offset, dan kembali aktif. Timer memeriksa paling lambat setiap menit ketika aplikasi aktif serta menjadwalkan batas tengah malam. Hari yang sengaja dipilih pengguna tetap dipertahankan; pilihan yang masih mengikuti hari ini maju otomatis. Respons request lama diabaikan setelah tanggal/view berubah.

Tanggal form ditangkap saat dibuka sehingga draft tidak berpindah hari saat tengah malam. Pengiriman ganda dan penutupan ketika menyimpan diblokir; error penyimpanan mempertahankan draft. Validasi juga berlaku pada repository, bukan hanya UI. Database disimpan lebih dahulu; kegagalan scheduler ditampilkan sebagai peringatan terpisah, sehingga agenda yang sudah tersimpan tidak dilaporkan gagal.

## Pengingat lokal

`null` berarti nonaktif, `0` tepat waktu, dan angka positif sejumlah menit sebelum mulai. Agenda selesai/sepanjang hari serta trigger yang sudah lewat tidak dijadwalkan. Trigger yang sudah lewat dijelaskan setelah penyimpanan.

Scheduler berjalan berurutan dan membaca keadaan database saat giliran operasi dimulai. Rekonsiliasi membatalkan hanya identifier `agenda-*`, lalu memasang kembali pengingat aktif. Menghapus/menyelesaikan agenda memperbarui jadwal setelah commit; membuka kembali agenda mengaktifkan jadwal yang masih akan datang. Rekonsiliasi dilakukan ketika Agenda dibuka, kalender berubah, aplikasi kembali aktif, perubahan agenda, serta restore.

Android membuat channel sebelum meminta izin notifikasi; foreground handler menampilkan notifikasi. Izin iOS provisional diterima. Pembacaan pasif tidak membuka dialog izin. SDK 58 mendukung notifikasi lokal di Expo Go; dukungan remote push merupakan kemampuan berbeda.

Izin notifikasi dan izin alarm tepat waktu Android diperiksa terpisah. Pengaturan alarm khusus hanya dibuka melalui tindakan **Periksa izin pengingat**. Android dapat memulai ulang aplikasi ketika izin tersebut dicabut. Penjadwalan tetap bersifat best effort: izin tersedia bukan jaminan bebas keterlambatan akibat OS, baterai, DND, atau kebijakan vendor. Penolakan/ketidaktersediaan modul tidak menggagalkan simpan agenda.

Maksimal **50 pengingat terdekat** dipasang; cakupan parsial menampilkan peringatan. Batch diisi kembali ketika membuka/kembali aktif/pergantian hari. Jika aplikasi tidak dibuka lagi setelah batch habis, pengingat yang belum dipasang belum tercakup. Tidak ada background worker baru. Web belum mendukung pengingat dan menampilkan peringatan jika terdapat pengingat mendatang; data tetap lokal.

## Verifikasi dan batas rilis

- `check-calendar.cjs`: 32 kelompok pemeriksaan, termasuk WIB/WITA/WIT pada 00:30, lintas malam, batas eksklusif, DST, legacy, validasi, stale request, lifecycle, izin, antrean rekonsiliasi, dan batas 50.
- `check-backup.cjs`: 45 kelompok regresi termasuk penolakan timestamp tanpa jam; `check-integrity.cjs`: 29 kelompok regresi.
- `check-ui.cjs`: 42 render layar dasar, dua skenario tambahan agenda konflik/peringatan, dan 12 form; interaksi validasi, draft gagal simpan, dan pengiriman ganda ikut diperiksa.
- Harness audit memakai tanggal lokal untuk A04 dan query overlap untuk A09. Bukti audit awal tetap dipertahankan; masalah status A06 menunggu R0.4.
- Pemeriksaan browser fixture React Native Web pada lebar 320 dan teks 200% menemukan/memperbaiki wrapping form dan banner: aksi banner kini berada di bawah pesan agar teks tidak terjepit. Fixture memakai hook simulasi, bukan bukti runtime SQLite/native.

Pemeriksaan akhir lulus: ESLint `src scripts`, TypeScript `tsc --noEmit`, seluruh skrip regresi di atas, harness audit, `git diff --check`, dan ekspor web penuh ke `.expo/ui-export`. Perintah dijalankan langsung melalui Node. Dua percobaan Metro di sandbox tidak menghasilkan progres/berkas dan dihentikan; pengulangan melalui izin resmi di luar sandbox berhasil membundel aplikasi dan server render.

Pengujian otomatis notifikasi memakai mock native; tidak membuktikan pengiriman OS sebenarnya. Gerbang rilis masih memerlukan development build Android/iOS: dialog izin/channel/alarm tepat waktu, foreground/background, Doze/DND, reboot, perubahan zona/jam, keyboard, TalkBack, dan back gesture. Tidak ada APK yang diuji pada tahap ini.

Tahap berikutnya adalah **R0.4 status, progres, dan refresh**. Perluasan monitoring hidup R2/R3 tetap menunggu fondasi R0 selesai.

## Acuan API

Pembaruan native 27 Oktober 2026: pengujian Android pengguna menemukan `ExpoTopicSubscriptionModule` tidak tersedia ketika barrel `expo-notifications` 58.1.6 dievaluasi. Loader sekarang memakai `requireOptionalNativeModule` sebelum memuat barrel pada Android. Jika modul tersebut tidak tersedia, paket tidak dievaluasi dan pengingat dilaporkan tidak aktif tanpa menggagalkan agenda. Ini batas kombinasi paket JS/binary tersebut; bukan pernyataan bahwa semua notifikasi lokal tidak didukung Expo Go. Untuk menguji pengingat pada runtime yang gagal ini, gunakan binary/development build yang cocok. Tidak memakai deep import internal, mengubah node_modules, atau mematikan LogBox. Regresi kalender bertambah menjadi 33 kelompok, termasuk bukti barrel tidak dimuat ketika modul hilang; pengiriman native setelah patch tetap memerlukan pengujian perangkat.

- [Dokumentasi Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Expo Notifications SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/)
- [React Native AppState](https://reactnative.dev/docs/appstate)
