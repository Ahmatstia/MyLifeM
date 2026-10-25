import React, { useEffect, useState, useMemo } from 'react';
import { Stack, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/db/client';
import { colors } from '@/theme/colors';
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupApp() {
      try {
        await initDatabase();
      } catch (error) {
        console.error('[RootLayout] Database initialization failed:', error);
      } finally {
        setIsReady(true);
      }
    }

    setupApp();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (isReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady, fontsLoaded, fontError]);

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
