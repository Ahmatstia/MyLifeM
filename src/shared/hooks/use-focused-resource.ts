import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/** Refetch on return; obsolete reads and mutation callbacks cannot replace another view. */
export function useFocusedResource<T>(key: string, read: () => Promise<T>, errorMessage: string) {
  const [state, setState] = useState<{ key: string; data?: T; error: string | null; isLoading: boolean }>({ key, error: null, isLoading: true });
  const current = useRef({ key, active: false, request: 0 });
  const setError = useCallback((error: string) => {
    if (current.current.active && current.current.key === key) {
      current.current.request++;
      setState(previous => ({ ...previous, error, isLoading: false }));
    }
  }, [key]);
  const refresh = useCallback(async () => {
    const view = current.current;
    if (!view.active || view.key !== key) return;
    const request = ++view.request;
    setState(previous => ({ ...previous, key, error: null, isLoading: true }));
    try {
      const data = await read();
      if (view.active && view.key === key && view.request === request) setState({ key, data, error: null, isLoading: false });
    } catch (error) {
      if (view.active && view.key === key && view.request === request) setState({ key, error: error instanceof Error ? error.message : errorMessage, isLoading: false });
    }
  }, [key, read, errorMessage]);
  useFocusEffect(useCallback(() => {
    const view = current.current;
    view.key = key; view.active = true;
    void refresh();
    return () => { view.active = false; view.request++; };
  }, [key, refresh]));
  return { data: state.key === key ? state.data : undefined, isLoading: state.key !== key || state.isLoading,
    error: state.key === key ? state.error : null, refresh, setError };
}
