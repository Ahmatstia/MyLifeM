import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Stack, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/db/client';
import { useDataRevision } from '@/db/data-revision';
import { AlarmRingingModal } from '@/features/task-manager/presentation/components/alarm-ringing-modal';
import { CalendarReminderSync } from '@/features/agenda/presentation/components/calendar-reminder-sync';
import { ManagedAlarmSync } from '@/features/task-manager/presentation/components/managed-alarm-sync';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { colors } from '@/theme/colors';
import { AppText, Button, Screen } from '@/shared/ui';
import { readMigrationBackup, saveBackupFile } from '@/features/settings/data/services/backup-file.service';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';

// Keep the splash screen visible while initializing local database
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const dataRevision = useDataRevision();
  const reducedMotion = useReducedMotion();
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
    Fredoka_500Medium,
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
    return <Screen contentContainerStyle={{ justifyContent: 'center' }}>
      <AppText accessibilityRole="header" variant="headlineSmall">Data belum dapat dibuka</AppText>
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
    </Screen>;
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
          animation: reducedMotion ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="targets/[id]" options={{ animation: reducedMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="targets/new" options={{ animation: reducedMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="projects/[id]" options={{ animation: reducedMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="projects/new" options={{ animation: reducedMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="agenda/new" options={{ animation: reducedMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="today/new" options={{ animation: reducedMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="task-manager" options={{ animation: reducedMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen name="task-manager/new" options={{ animation: reducedMotion ? 'none' : 'fade' }} />
        <Stack.Screen name="settings" options={{ animation: reducedMotion ? 'none' : 'slide_from_right' }} />
        <Stack.Screen
          name="quick-add"
          options={{ presentation: 'transparentModal', animation: reducedMotion ? 'none' : 'fade' }}
        />
      </Stack>
      <AlarmRingingModal key={'alarm-' + dataRevision} />
      <CalendarReminderSync key={'reminders-' + dataRevision} />
      <ManagedAlarmSync key={'managed-reminders-' + dataRevision} />
    </ThemeProvider>
  );
}
