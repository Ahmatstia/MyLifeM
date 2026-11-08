export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  key: PrayerKey;
  name: string;
  arabicName: string;
  time: Date;
  formattedTime: string; // HH:mm
  isNext: boolean;
  isPassed: boolean;
  isCurrent: boolean;
}

export interface TodayPrayerSchedule {
  prayers: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem | null;
  currentPrayer: PrayerTimeItem | null;
  remainingText: string | null;
  cityName: string;
}

export interface PrayerLocationPreset {
  id: string;
  cityName: string;
  region: 'WIB' | 'WITA' | 'WIT';
  latitude: number;
  longitude: number;
}

export const INDONESIA_PRAYER_CITIES: PrayerLocationPreset[] = [
  { id: 'jakarta', cityName: 'Jakarta (WIB)', region: 'WIB', latitude: -6.2088, longitude: 106.8456 },
  { id: 'bandung', cityName: 'Bandung (WIB)', region: 'WIB', latitude: -6.9175, longitude: 107.6191 },
  { id: 'surabaya', cityName: 'Surabaya (WIB)', region: 'WIB', latitude: -7.2575, longitude: 112.7521 },
  { id: 'yogyakarta', cityName: 'Yogyakarta (WIB)', region: 'WIB', latitude: -7.7956, longitude: 110.3695 },
  { id: 'semarang', cityName: 'Semarang (WIB)', region: 'WIB', latitude: -6.9667, longitude: 110.4167 },
  { id: 'malang', cityName: 'Malang (WIB)', region: 'WIB', latitude: -7.9666, longitude: 112.6326 },
  { id: 'medan', cityName: 'Medan (WIB)', region: 'WIB', latitude: 3.5952, longitude: 98.6722 },
  { id: 'palembang', cityName: 'Palembang (WIB)', region: 'WIB', latitude: -2.9761, longitude: 104.7754 },
  { id: 'padang', cityName: 'Padang (WIB)', region: 'WIB', latitude: -0.9471, longitude: 100.4172 },
  { id: 'pekanbaru', cityName: 'Pekanbaru (WIB)', region: 'WIB', latitude: 0.5071, longitude: 101.4478 },
  { id: 'banda-aceh', cityName: 'Banda Aceh (WIB)', region: 'WIB', latitude: 5.5483, longitude: 95.3238 },
  { id: 'batam', cityName: 'Batam (WIB)', region: 'WIB', latitude: 1.0456, longitude: 104.0305 },
  { id: 'pontianak', cityName: 'Pontianak (WIB)', region: 'WIB', latitude: -0.0263, longitude: 109.3425 },
  { id: 'bandar-lampung', cityName: 'Bandar Lampung (WIB)', region: 'WIB', latitude: -5.3971, longitude: 105.2668 },
  { id: 'denpasar', cityName: 'Denpasar / Bali (WITA)', region: 'WITA', latitude: -8.6705, longitude: 115.2126 },
  { id: 'makassar', cityName: 'Makassar (WITA)', region: 'WITA', latitude: -5.1477, longitude: 119.4327 },
  { id: 'balikpapan', cityName: 'Balikpapan (WITA)', region: 'WITA', latitude: -1.2379, longitude: 116.8529 },
  { id: 'samarinda', cityName: 'Samarinda (WITA)', region: 'WITA', latitude: -0.5022, longitude: 117.1536 },
  { id: 'banjarmasin', cityName: 'Banjarmasin (WITA)', region: 'WITA', latitude: -3.3194, longitude: 114.5908 },
  { id: 'mataram', cityName: 'Mataram / Lombok (WITA)', region: 'WITA', latitude: -8.5833, longitude: 116.1167 },
  { id: 'manado', cityName: 'Manado (WITA)', region: 'WITA', latitude: 1.4748, longitude: 124.8421 },
  { id: 'jayapura', cityName: 'Jayapura (WIT)', region: 'WIT', latitude: -2.5337, longitude: 140.7181 },
  { id: 'ambon', cityName: 'Ambon (WIT)', region: 'WIT', latitude: -3.6954, longitude: 128.1814 },
  { id: 'sorong', cityName: 'Sorong (WIT)', region: 'WIT', latitude: -0.8762, longitude: 131.2558 },
];
