import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { PrayerKey, PrayerTimeItem, TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getTodayPrayerTimes(
  date: Date = new Date(),
  latitude = -6.2088,
  longitude = 106.8456,
  cityName = 'Jakarta (WIB)'
): TodayPrayerSchedule {
  const coordinates = new Coordinates(latitude, longitude);
  // Singapore calculation method has Fajr 20° and Isha 18° which matches Kemenag RI
  const params = CalculationMethod.Singapore();
  params.madhab = 'shafi';

  const pt = new PrayerTimes(coordinates, date, params);
  const nowMs = date.getTime();

  const PRAYER_LIST: { key: PrayerKey; name: string; arabicName: string; time: Date }[] = [
    { key: 'fajr', name: 'Subuh', arabicName: 'الفجر', time: pt.fajr },
    { key: 'dhuhr', name: 'Dzuhur', arabicName: 'الظهر', time: pt.dhuhr },
    { key: 'asr', name: 'Ashar', arabicName: 'العصر', time: pt.asr },
    { key: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', time: pt.maghrib },
    { key: 'isha', name: 'Isya', arabicName: 'العشاء', time: pt.isha },
  ];

  // Determine current and next prayer
  const adhanCurrent = pt.currentPrayer();
  const adhanNext = pt.nextPrayer();

  let nextPrayerItem: PrayerTimeItem | null = null;
  let currentPrayerItem: PrayerTimeItem | null = null;
  let remainingText: string | null = null;

  const prayers: PrayerTimeItem[] = PRAYER_LIST.map((p) => {
    const isPassed = nowMs > p.time.getTime();
    const isNext = adhanNext === p.key;
    const isCurrent = adhanCurrent === p.key;

    const item: PrayerTimeItem = {
      key: p.key,
      name: p.name,
      arabicName: p.arabicName,
      time: p.time,
      formattedTime: formatTime(p.time),
      isNext,
      isPassed,
      isCurrent,
    };

    if (isNext) nextPrayerItem = item;
    if (isCurrent) currentPrayerItem = item;

    return item;
  });

  // If next is tomorrow's Fajr (e.g. after Isha)
  if (!nextPrayerItem) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPt = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayerItem = {
      key: 'fajr',
      name: 'Subuh',
      arabicName: 'الفجر',
      time: tomorrowPt.fajr,
      formattedTime: formatTime(tomorrowPt.fajr),
      isNext: true,
      isPassed: false,
      isCurrent: false,
    };
  }

  if (nextPrayerItem) {
    const diffMs = nextPrayerItem.time.getTime() - nowMs;
    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHours > 0) {
        remainingText = `${diffHours}j ${diffMinutes}m lagi`;
      } else {
        remainingText = `${diffMinutes}m lagi`;
      }
    }
  }

  return {
    prayers,
    nextPrayer: nextPrayerItem,
    currentPrayer: currentPrayerItem,
    remainingText,
    cityName,
  };
}

