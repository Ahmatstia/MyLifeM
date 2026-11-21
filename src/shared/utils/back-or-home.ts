import { router } from 'expo-router';

/** Direct web/deep-link entries may have no in-app navigation history. */
export function backOrHome(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}
