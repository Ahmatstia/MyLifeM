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

