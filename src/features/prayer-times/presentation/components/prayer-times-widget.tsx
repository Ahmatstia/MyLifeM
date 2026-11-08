import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Moon, Bell, MapPin, ChevronRight } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui/app-text';
import { sproutShadow } from '@/shared/ui/sprout';
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

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={handleLocationPress}
          accessibilityRole="button"
          accessibilityLabel={`Ubah lokasi jadwal azan, saat ini ${cityName}`}
          style={({ pressed }) => [
            styles.headerTitleGroup,
            pressed && { opacity: 0.78 },
          ]}
        >
          <View style={styles.iconSquircle}>
            <Moon size={15} color={s.forest} strokeWidth={2.4} />
          </View>
          <View style={styles.titleColumn}>
            <AppText variant="labelSmall" style={styles.widgetHeaderLabel}>
              Jadwal Azan
            </AppText>
            <View style={styles.locationBadgeRow}>
              <MapPin size={11} color={s.forest} strokeWidth={2.4} />
              <AppText variant="labelSmall" style={styles.locationCityText}>
                {cityName}
              </AppText>
              <ChevronRight size={12} color={s.inkMuted} strokeWidth={2.4} />
            </View>
          </View>
        </Pressable>

        {nextPrayer && (
          <View style={styles.nextPill}>
            <Bell size={11} color={s.ink} strokeWidth={2.6} />
            <AppText variant="labelSmall" style={styles.nextPillText}>
              {nextPrayer.name} {nextPrayer.formattedTime}
              {remainingText ? ` · ${remainingText}` : ''}
            </AppText>
          </View>
        )}
      </View>

      {/* 5 Prayers Row */}
      <View style={styles.prayersRow}>
        {prayers.map((prayer) => {
          const isNext = prayer.isNext;
          const isPassed = prayer.isPassed && !isNext;

          return (
            <View
              key={prayer.key}
              style={[
                styles.prayerPill,
                isNext && styles.prayerPillNext,
                isPassed && styles.prayerPillPassed,
              ]}
            >
              <AppText
                variant="labelSmall"
                style={[
                  styles.prayerName,
                  isNext && styles.prayerNameNext,
                  isPassed && styles.prayerNamePassed,
                ]}
              >
                {prayer.name}
              </AppText>
              <AppText
                variant="titleSmall"
                style={[
                  styles.prayerTime,
                  isNext && styles.prayerTimeNext,
                  isPassed && styles.prayerTimePassed,
                ]}
                tabularNums
              >
                {prayer.formattedTime}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: s.card,
    borderRadius: 26,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#F1EADA',
    gap: space[3],
    ...sproutShadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: space[2],
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  iconSquircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    gap: 1,
  },
  widgetHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  locationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationCityText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.forest,
  },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: s.sunSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  nextPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.ink,
  },
  prayersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  prayerPill: {
    flex: 1,
    backgroundColor: s.cream,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE5D2',
    gap: 3,
  },
  prayerPillNext: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  prayerPillPassed: {
    backgroundColor: '#F7F3E8',
    borderColor: '#EFE9D9',
    opacity: 0.65,
  },
  prayerName: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: s.inkMuted,
  },
  prayerNameNext: {
    fontFamily: fontFamily.bold,
    color: s.leafSoft,
  },
  prayerNamePassed: {
    color: s.inkSubtle,
  },
  prayerTime: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  prayerTimeNext: {
    color: '#FFFFFF',
  },
  prayerTimePassed: {
    color: s.inkSubtle,
  },
});
