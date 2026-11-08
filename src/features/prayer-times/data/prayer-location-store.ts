export interface PrayerLocationState {
  cityName: string;
  latitude: number;
  longitude: number;
}

let currentLocation: PrayerLocationState = {
  cityName: 'Jakarta (WIB)',
  latitude: -6.2088,
  longitude: 106.8456,
};

const listeners = new Set<(loc: PrayerLocationState) => void>();

export function getPrayerLocation(): PrayerLocationState {
  return currentLocation;
}

export function setPrayerLocation(next: PrayerLocationState): void {
  if (
    currentLocation.cityName === next.cityName &&
    currentLocation.latitude === next.latitude &&
    currentLocation.longitude === next.longitude
  ) {
    return;
  }
  currentLocation = next;
  for (const listener of listeners) {
    listener(currentLocation);
  }
}

export function subscribePrayerLocation(
  listener: (loc: PrayerLocationState) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

