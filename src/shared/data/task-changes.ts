const listeners = new Set<() => void>();
export function subscribeTaskChanges(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function notifyTaskChanges() { for (const listener of listeners) listener(); }
