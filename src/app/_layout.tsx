import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Stack, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/db/client';
import { useDataRevision } from '@/db/data-revision';
import { colors } from '@/theme/colors';
import { AppText, Button } from '@/shared/ui';
import { readMigrationBackup, saveBackupFile } from '@/features/settings/data/services/backup-file.service';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

// Keep the splash screen visible while initializing local database
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const dataRevision = useDataRevision();
  const [isReady, setIsReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  const setupApp = useCallback(async () => {
    setDatabaseError(null);
    try {
      await initDatabase();
      setIsReady(true);
    } catch (error) {
      console.error('[RootLayout] Database initialization failed:', error);
      setDatabaseError(error instanceof Error ? error.message : 'Database gagal diinisialisasi.');
    }
  }, []);
  useEffect(() => {
    setupApp();
  }, [setupApp]);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if ((isReady || databaseError) && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady, databaseError, fontsLoaded, fontError]);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: false,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.surfaceContainerLowest,
        text: colors.onSurface,
        border: colors.outlineVariant,
        primary: colors.primary,
        notification: colors.secondary,
      },
    }),
    []
  );

  if (databaseError && (fontsLoaded || fontError)) {
    return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
      <AppText variant="headlineSmall">Data belum dapat dibuka</AppText>
      <AppText>Inisialisasi database gagal. Data tidak dihapus. Coba buka kembali sebelum melanjutkan.</AppText>
      <AppText>{databaseError}</AppText>
      <Button title="Coba lagi" onPress={setupApp} />
      <Button title="Simpan salinan pemulihan" variant="outlined" onPress={async () => {
        try {
          const json = await readMigrationBackup();
          if (!json) { setRecoveryMessage('Salinan pra-migrasi belum tersedia. Database asli tetap dipertahankan.'); return; }
          await saveBackupFile(json);
          setRecoveryMessage('Arsip pra-migrasi disiapkan. Data yang valid dapat dipulihkan lewat Pengaturan; data bermasalah perlu diperiksa terlebih dahulu.');
        } catch { setRecoveryMessage('Salinan belum dapat diekspor. Database asli tetap dipertahankan.'); }
      }} />
      {recoveryMessage && <AppText>{recoveryMessage}</AppText>}
    </ScrollView>;
  }
  if (!isReady || !(fontsLoaded || fontError)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        key={dataRevision}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="targets/[id]" />
        <Stack.Screen name="projects/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="quick-add"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
