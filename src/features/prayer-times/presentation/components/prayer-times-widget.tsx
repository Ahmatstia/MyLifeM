import React from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Sun, Moon, Sunrise, Sunset, ArrowUpRight } from 'lucide-react-native';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import { todayColors as c } from '@/theme/today';
import { AppText } from '@/shared/ui/app-text';
import type { TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';

export interface PrayerTimesWidgetProps {
  schedule: TodayPrayerSchedule;
  onPressLocation?: () => void;
}

const prayerIcons = { fajr: Sunrise, dhuhr: Sun, asr: Sun, maghrib: Sunset, isha: Moon };

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({ schedule, onPressLocation }) => {
  const { prayers, nextPrayer, remainingText, cityName } = schedule;
  const { fontScale } = useWindowDimensions();
  const NextIcon = nextPrayer ? prayerIcons[nextPrayer.key] : Sun;
  return (
    <View style={styles.card}>
      <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.sunWash} />
      <View style={styles.heading}>
        <AppText variant="titleMedium" accessibilityRole="header" style={styles.headingText}>Jadwal azan</AppText>
        <Pressable onPress={onPressLocation ?? (() => router.push('/settings'))}
          accessibilityRole="button" accessibilityLabel={`Ubah lokasi jadwal azan, saat ini ${cityName}`}
          style={({ pressed }) => [styles.location, pressed && styles.pressed]}>
          <MapPin size={14} color={c.goldInk} />
          <AppText variant="labelMedium" style={styles.locationText}>{cityName}</AppText>
          <ArrowUpRight size={14} color={c.goldInk} />
        </Pressable>
      </View>
      {nextPrayer && (
        <View style={styles.nextPrayer}>
          <View style={styles.nextCopy}>
            <View style={styles.prayerNameRow}>
              <AppText variant="headlineMedium" style={styles.prayerName}>{nextPrayer.name}</AppText>
              <AppText variant="labelMedium" color={c.goldInk}>berikutnya</AppText>
            </View>
            <View style={styles.timeRow}>
              <AppText variant="displayLarge" tabularNums style={styles.nextTime}>{nextPrayer.formattedTime}</AppText>
              {remainingText && <AppText variant="labelMedium" color={c.goldInk} style={styles.remaining}>{remainingText}</AppText>}
            </View>
          </View>
          {fontScale < 1.5 && <View style={styles.sunSeal} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <NextIcon size={42} color={c.goldInk} strokeWidth={2} />
          </View>}
        </View>
      )}
      <View style={styles.timetable}>
        {prayers.map(prayer => {
          return (
            <View key={prayer.key} style={[styles.cell, fontScale >= 1.5 && styles.wideCell, prayer.isNext && styles.selectedCell]}
              accessible accessibilityLabel={`${prayer.name}, pukul ${prayer.formattedTime}${prayer.isNext ? ', berikutnya' : ''}`}>
              <AppText variant="labelMedium" color={prayer.isNext ? c.card : c.goldInk}>{prayer.name}</AppText>
              <AppText variant="titleSmall" tabularNums color={prayer.isNext ? c.card : c.ink}>{prayer.formattedTime}</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { overflow: 'hidden', backgroundColor: c.gold, borderRadius: radius.xxl, padding: space[4], gap: space[2] },
  sunWash: { position: 'absolute', width: 180, height: 180, borderRadius: radius.full, right: -50, top: -45, borderWidth: 24, borderColor: c.goldSoft, opacity: 0.5 },
  heading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: space[2], justifyContent: 'space-between' },
  headingText: { fontFamily: fontFamily.display, color: c.ink },
  location: { minHeight: touchTarget.min, flexDirection: 'row', alignItems: 'center', gap: space[1], flexShrink: 1, borderRadius: radius.md },
  locationText: { color: c.goldInk, flexShrink: 1 },
  pressed: { opacity: 0.65 },
  nextPrayer: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  nextCopy: { flex: 1, gap: space[0.5] },
  prayerNameRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: space[2] },
  prayerName: { fontFamily: fontFamily.display, color: c.ink },
  timeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: space[2] },
  nextTime: { fontFamily: fontFamily.display, color: c.ink },
  remaining: { flexShrink: 1 },
  sunSeal: { width: 76, height: 76, borderRadius: 28, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '8deg' }], borderWidth: 2, borderColor: c.card },
  timetable: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1], paddingTop: space[2], borderTopWidth: 1, borderTopColor: '#D8B56F' },
  cell: { flexBasis: 44, flexGrow: 1, paddingVertical: space[2], alignItems: 'center', gap: space[0.5], borderRadius: radius.md },
  wideCell: { flexBasis: '30%' },
  selectedCell: { backgroundColor: c.ink },
});
