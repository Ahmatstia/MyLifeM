import { useState, useEffect } from 'react';
import type { TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';
import { getTodayPrayerTimes } from '../../data/services/prayer-times.service';
import {
  getPrayerLocation,
  subscribePrayerLocation,
} from '../../data/prayer-location-store';

export function usePrayerTimes(
  overrideLat?: number,
  overrideLng?: number,
  overrideCity?: string
): TodayPrayerSchedule {
  const [loc, setLoc] = useState(getPrayerLocation);

  const latitude = overrideLat ?? loc.latitude;
  const longitude = overrideLng ?? loc.longitude;
  const cityName = overrideCity ?? loc.cityName;

  const [schedule, setSchedule] = useState<TodayPrayerSchedule>(() =>
    getTodayPrayerTimes(new Date(), latitude, longitude, cityName)
  );

  useEffect(() => {
    return subscribePrayerLocation((nextLoc) => {
      setLoc(nextLoc);
    });
  }, []);

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
