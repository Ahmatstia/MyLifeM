import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Moon, Bell } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import type { TodayPrayerSchedule } from '../../domain/entities/prayer-times.entity';

export interface PrayerTimesWidgetProps {
  schedule: TodayPrayerSchedule;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  schedule,
}) => {
  const { prayers, nextPrayer, remainingText, cityName } = schedule;

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.iconCircle}>
            <Moon size={13} color="#0E6852" strokeWidth={2.4} />
          </View>
          <View style={styles.titleColumn}>
            <AppText variant="labelSmall" style={styles.widgetHeaderLabel}>
              JADWAL SHALAT & AZAN
            </AppText>
            <AppText variant="labelSmall" style={styles.citySubtext}>
              {cityName}
            </AppText>
          </View>
        </View>

        {nextPrayer && (
          <View style={styles.nextPill}>
            <Bell size={11} color="#0E6852" strokeWidth={2.6} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: space[3],
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: space[3],
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
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CEF5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    gap: 1,
  },
  widgetHeaderLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#121316',
  },
  citySubtext: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#717684',
  },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CEF5EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nextPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#0E6852',
  },
  prayersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  prayerPill: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    gap: 3,
  },
  prayerPillNext: {
    backgroundColor: '#121316',
    borderColor: '#121316',
  },
  prayerPillPassed: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
    opacity: 0.6,
  },
  prayerName: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: '#717684',
  },
  prayerNameNext: {
    fontFamily: fontFamily.bold,
    color: '#CEF5EB',
  },
  prayerNamePassed: {
    color: '#9E9E9E',
  },
  prayerTime: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#121316',
  },
  prayerTimeNext: {
    color: '#FFFFFF',
  },
  prayerTimePassed: {
    color: '#9E9E9E',
  },
});
