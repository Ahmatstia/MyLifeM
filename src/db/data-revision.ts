import { useSyncExternalStore } from 'react';

let revision = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => revision;

/** Remount screens after replacing all data, so no timer/form retains old task IDs. */
export function notifyDataRestored(): void {
  revision += 1;
  listeners.forEach(listener => listener());
}

export function useDataRevision(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
