import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

/**
 * Membuka form tambah ketika tab dibuka dari FAB nav bar dengan parameter `?add=1`,
 * lalu menghapus parameter agar form tidak terbuka ulang saat layar difokuskan lagi.
 */
export function useOpenAddFromParam(open: () => void) {
  const { add } = useLocalSearchParams<{ add?: string }>();

  useEffect(() => {
    if (add === '1') {
      open();
      router.setParams({ add: undefined } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [add]);
}
