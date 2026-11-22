import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Keep transitions off during SSR and until the device reports its preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const query = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (!query) return;
      const onChange = () => setReduced(query.matches);
      onChange();
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }

    let active = true;
    let receivedChange = false;
    const listener = AccessibilityInfo?.addEventListener?.('reduceMotionChanged', enabled => {
      receivedChange = true;
      if (active) setReduced(enabled);
    });
    AccessibilityInfo?.isReduceMotionEnabled?.().then(enabled => {
      if (active && !receivedChange) setReduced(enabled);
    }).catch(() => {});
    return () => {
      active = false;
      listener?.remove();
    };
  }, []);

  return reduced;
}
