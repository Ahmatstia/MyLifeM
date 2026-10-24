import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { Button } from '@/shared/ui/button';
import { space, radius } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { Play, Sparkles } from 'lucide-react-native';

export default function TodayFocusRoute() {
  const todayDateString = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="headlineLarge" color="onSurface">
          Hari Ini & Fokus
        </AppText>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {todayDateString}
        </AppText>
      </View>

      {/* Focus Timer Cockpit Card */}
      <Card variant="highlight" style={styles.timerCard}>
        <View style={styles.timerRow}>
          <View>
            <AppText variant="labelMedium" color="primary">
              SESI FOKUS AKTIF
            </AppText>
            <AppText variant="timer" color="onSurface" tabularNums>
              25:00
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Mode Pomodoro Klasik (25 mnt kerja + 5 mnt istirahat)
            </AppText>
          </View>
        </View>

        <Button
          title="Mulai Fokus Sekarang"
          variant="filled"
          size="standard"
          leftIcon={<Play size={18} color={colors.onPrimary} />}
          onPress={() => {}}
          style={styles.startButton}
        />
      </Card>

      {/* Info Notice */}
      <Banner
        variant="info"
        message="Pilih 3 hingga 5 prioritas utama dari target dan proyekmu hari ini agar eksekusimu tajam dan terarah."
        style={styles.banner}
      />

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <AppText variant="titleMedium">Top Prioritas Hari Ini (0/5)</AppText>
        <Button
          title="+ Tambah Tugas"
          variant="text"
          size="compact"
          onPress={() => {}}
        />
      </View>

      {/* Placeholder Empty State */}
      <Card variant="filled" style={styles.placeholderCard}>
        <View style={styles.emptyIconCircle}>
          <Sparkles size={24} color={colors.primary} />
        </View>
        <AppText variant="titleSmall" align="center" style={styles.placeholderTitle}>
          Belum Ada Prioritas Terpilih
        </AppText>
        <AppText
          variant="bodySmall"
          color="onSurfaceVariant"
          align="center"
          style={styles.placeholderDesc}
        >
          Buka tab Target untuk membuat sasaran hidup, lalu tautkan tugas harianmu ke sini.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: space[3],
    marginBottom: space[4],
  },
  timerCard: {
    marginBottom: space[3],
  },
  timerRow: {
    marginBottom: space[4],
  },
  startButton: {
    width: '100%',
  },
  banner: {
    marginBottom: space[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[3],
  },
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: space[8],
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
  placeholderTitle: {
    marginBottom: space[1],
  },
  placeholderDesc: {
    maxWidth: 260,
  },
});
