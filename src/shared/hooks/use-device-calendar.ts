import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { formatLocalDate, localDayBounds } from '@/shared/utils/local-date';

function currentCalendar() {
  const now = new Date();
  return { date: formatLocalDate(now), zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(), revision: 0 };
}

/** Midnight timers plus resume checks also catch a changed device clock/time zone. */
export function useDeviceCalendar() {
  const [calendar, setCalendar] = useState(currentCalendar);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = (resumed = false) => {
      const next = currentCalendar();
      setCalendar(previous => !resumed && previous.date === next.date && previous.zone === next.zone && previous.offset === next.offset ? previous : { ...next, revision: previous.revision + 1 });
      clearTimeout(timer);
      const untilMidnight = localDayBounds(next.date).end.getTime() - Date.now();
      timer = setTimeout(check, Math.min(60_000, Math.max(100, untilMidnight + 25)));
    };
    check();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') check(true); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  return { ...calendar, key: `${calendar.date}|${calendar.zone}|${calendar.offset}|${calendar.revision}` };
}
