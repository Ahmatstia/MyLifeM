import React from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui/app-text';
import type { TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';

const s = colors.sprout;

export interface PrayerTimesWidgetProps {
  schedule: TodayPrayerSchedule;
  onPressLocation?: () => void;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  schedule,
  onPressLocation,
}) => {
  const { prayers, nextPrayer, remainingText, cityName } = schedule;

  const handleLocationPress = () => {
    if (onPressLocation) {
      onPressLocation();
    } else {
      router.push('/settings');
    }
  };

  const { fontScale } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="titleMedium" accessibilityRole="header">Jadwal azan</AppText>
        <Pressable
          onPress={handleLocationPress}
          accessibilityRole="button"
          accessibilityLabel={`Ubah lokasi jadwal azan, saat ini ${cityName}`}
          style={({ pressed }) => [styles.location, pressed && styles.pressed]}
        >
          <MapPin size={space[4]} color={s.forest} />
          <AppText variant="labelMedium" style={styles.locationText}>{cityName}</AppText>
        </Pressable>
      </View>
      {nextPrayer && (
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          {nextPrayer.name} berikutnya pukul {nextPrayer.formattedTime}
          {remainingText ? `, ${remainingText}` : ''}
        </AppText>
      )}
      <View style={styles.timetable}>
        {prayers.map((prayer) => (
          <View key={prayer.key} style={[styles.cell, fontScale >= 1.5 && styles.wideCell, prayer.isNext && styles.nextCell]}>
            <AppText variant="labelMedium" color="onSurfaceVariant">{prayer.name}</AppText>
            <AppText variant="titleSmall" tabularNums style={styles.time}>{prayer.formattedTime}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingTop: space[2],
    gap: space[1],
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: space[3],
  },
  location: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: space[1],
    borderRadius: radius.sm,
  },
  locationText: { color: s.forest },
  pressed: { backgroundColor: colors.surfaceContainer },
  timetable: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1], marginTop: space[2] },
  cell: { flexBasis: touchTarget.min, flexGrow: 1, paddingVertical: space[2], alignItems: 'center', borderRadius: radius.sm },
  wideCell: { flexBasis: '30%' },
  nextCell: { backgroundColor: colors.primaryContainer },
  time: { color: s.ink, fontFamily: fontFamily.bold },
});
