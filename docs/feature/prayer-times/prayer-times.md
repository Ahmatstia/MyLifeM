# Spesifikasi Fitur: Jadwal Waktu Salat (`prayer-times`)

> **Direktori**: `src/features/prayer-times/`  
> **Lokasi Tampil**: Layar `Hari Ini` (`TodayFocusScreen`) & konfigurasi lokasi di `Pengaturan` (`SettingsScreen`)

---

## 1. Struktur Modul

- **`domain/entities/prayer-times.entity.ts`**: `PrayerKey` (`'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'`), `PrayerTimeItem`, `TodayPrayerSchedule`, `PrayerCityPreset`, `INDONESIA_PRAYER_CITIES`.
- **`data/services/prayer-times.service.ts`**: `getTodayPrayerTimes(date, latitude, longitude, cityName)` menggunakan library `adhan` dengan `CalculationMethod.Singapore()` dan `madhab = 'shafi'` (sesuai standar Kemenag RI: Subuh 20°, Isya 18°).
- **`data/prayer-location-store.ts`**: Store in-memory `getPrayerLocation()`, `setPrayerLocation()`, dan `subscribePrayerLocation()` (default: `Jakarta (WIB)`, `-6.2088, 106.8456`).
- **`presentation/`**:
  - `hooks/use-prayer-times.ts`: Memuat jadwal hari ini sesuai lokasi aktif dan menghitung hitung mundur waktu salat berikutnya (termasuk Subuh esok hari jika sudah melewati Isya).
  - `components/prayer-times-widget.tsx`: Kartu ringkas di `TodayFocusScreen` yang menampilkan waktu salat aktif/berikutnya dan daftar 5 waktu salat harian.

---

## 2. Sinkronisasi Lokasi

1. Saat startup (`initDatabase()` di `src/db/migrations.ts`), `syncPrayerLocationFromDb()` membaca lokasi tersimpan dari `user_settings` ke `prayer-location-store`.
2. Saat pengguna mengubah kota atau koordinat di `SettingsScreen`, `settingsRepository.saveSettings()` menyimpan ke `user_settings` dan langsung memanggil `setPrayerLocation()`, sehingga `PrayerTimesWidget` di `Hari Ini` diperbarui secara real-time.
