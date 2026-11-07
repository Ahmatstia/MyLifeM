import { useState, useEffect } from 'react';
import type { TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';
import { getTodayPrayerTimes } from '../../data/services/prayer-times.service';

export function usePrayerTimes(
  latitude = -6.2088,
  longitude = 106.8456,
  cityName = 'Jakarta (WIB)'
): TodayPrayerSchedule {
  const [schedule, setSchedule] = useState<TodayPrayerSchedule>(() =>
    getTodayPrayerTimes(new Date(), latitude, longitude, cityName)
  );

  useEffect(() => {
    const update = () => {
      setSchedule(getTodayPrayerTimes(new Date(), latitude, longitude, cityName));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [latitude, longitude, cityName]);

  return schedule;
}

