import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { CheckCircle2, Circle, Clock, MapPin, Repeat, Ban } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import type {
  ProjectedWeeklyOccurrence,
  WeeklyScheduleType,
} from '../../domain/entities/weekly-schedule.entity';

export interface WeeklyOccurrenceCardProps {
  occurrence: ProjectedWeeklyOccurrence;
  onToggleComplete: () => void;
  onToggleCancelled: () => void;
}

const TYPE_CONFIG: Record<
  WeeklyScheduleType,
  { label: string; color: string; bg: string }
> = {
  COLLEGE: {
    label: 'Kuliah',
    color: colors.primary,
    bg: colors.primaryContainer,
  },
  WORK: {
    label: 'Kerja',
    color: colors.secondary,
    bg: colors.secondaryContainer,
  },
  STUDY: {
    label: 'Belajar',
    color: colors.tertiary,
    bg: colors.tertiaryContainer,
  },
  PERSONAL: {
    label: 'Pribadi',
    color: colors.onSurfaceVariant,
    bg: colors.surfaceContainerHighest,
  },
  ROUTINE: {
    label: 'Rutinitas',
    color: colors.primary,
    bg: colors.surfaceContainerLow,
  },
};

export const WeeklyOccurrenceCard: React.FC<WeeklyOccurrenceCardProps> = ({
  occurrence,
  onToggleComplete,
  onToggleCancelled,
}) => {
  const { schedule, isCompleted, isCancelled } = occurrence;
  const typeConfig = TYPE_CONFIG[schedule.scheduleType] || TYPE_CONFIG.COLLEGE;

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      padding={space[4]}
      style={[
        styles.card,
        isCompleted && styles.completedCard,
        isCancelled && styles.cancelledCard,
      ]}
    >
      <View style={styles.mainRow}>
        {/* Toggle Checkbox */}
        <Pressable
          onPress={onToggleComplete}
          disabled={isCancelled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted, disabled: isCancelled }}
          accessibilityLabel={`Tandai ${schedule.title} ${isCompleted ? 'belum selesai' : 'selesai'}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkbox}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} color={colors.primary} />
          ) : (
            <Circle
              size={24}
              color={isCancelled ? colors.outlineVariant : colors.outline}
            />
          )}
        </Pressable>

        {/* Content Details */}
        <View style={styles.contentCol}>
          {/* Header Row: Time, Rutin Tag, & Type Pill */}
          <View style={styles.tagRow}>
            <View style={styles.timeTag}>
              <Clock size={12} color={colors.primary} />
              <AppText variant="labelSmall" color="primary" tabularNums>
                {schedule.startTime} – {schedule.endTime}
              </AppText>
            </View>

            <View style={styles.rutinBadge}>
              <Repeat size={11} color={colors.primary} />
              <AppText variant="labelSmall" color="primary" style={styles.rutinText}>
                RUTIN
              </AppText>
            </View>

            <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
              <AppText variant="labelSmall" color={typeConfig.color} style={styles.typeText}>
                {typeConfig.label}
              </AppText>
            </View>

            {isCancelled && (
              <View style={styles.cancelledBadge}>
                <Ban size={11} color={colors.error} />
                <AppText variant="labelSmall" color="error" style={styles.typeText}>
                  DILIBURKAN
                </AppText>
              </View>
            )}
          </View>

          {/* Title */}
          <AppText
            variant="titleMedium"
            style={[
              styles.title,
              isCompleted && styles.completedText,
              isCancelled && styles.cancelledText,
            ]}
          >
            {schedule.title}
          </AppText>

          {/* Location & Notes */}
          {(schedule.location || schedule.notes) && (
            <View style={styles.metaRow}>
              {schedule.location && (
                <View style={styles.metaItem}>
                  <MapPin size={13} color={colors.onSurfaceVariant} />
                  <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
                    {schedule.location}
                  </AppText>
                </View>
              )}
              {schedule.notes && (
                <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
                  • {schedule.notes}
                </AppText>
              )}
            </View>
          )}

          {/* Footer: Quick Cancel / Reopen for today */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={onToggleCancelled}
              accessibilityRole="button"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <AppText variant="labelSmall" color="onSurfaceVariant">
                {isCancelled ? 'Aktifkan kembali hari ini' : 'Liburkan hari ini saja'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
    borderLeftWidth: 1.5,
    borderLeftColor: '#1E1E2E',
  },
  completedCard: {
    backgroundColor: '#F5EFE6',
    borderLeftColor: '#1E1E2E',
    opacity: 0.85,
  },
  cancelledCard: {
    backgroundColor: '#FFDAD6',
    borderLeftColor: '#1E1E2E',
    opacity: 0.75,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  checkbox: {
    paddingTop: 2,
  },
  contentCol: {
    flex: 1,
    gap: space[2],
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[2],
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBD9',
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  rutinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FAF5EB',
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  rutinText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  typeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.errorContainer,
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.onSurface,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.onSurfaceVariant,
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: colors.error,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: space[1],
  },
});
