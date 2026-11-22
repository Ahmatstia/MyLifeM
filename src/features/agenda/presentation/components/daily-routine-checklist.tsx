import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Clock, ChevronDown, ChevronUp, SunMedium, Ban, RotateCcw } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily, touchTarget, typography, stroke } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { SproutCheck } from '@/shared/ui/sprout/primitives';
import { Card } from '@/shared/ui/card';
import type { ProjectedWeeklyOccurrence } from '../../domain/entities/weekly-schedule.entity';

export interface DailyRoutineChecklistProps {
  routines: ProjectedWeeklyOccurrence[];
  onToggleComplete: (scheduleId: string, currentCompleted: boolean) => void;
  onToggleCancelled: (scheduleId: string, currentCancelled: boolean) => void;
  onAddRoutine?: () => void;
}

export const DailyRoutineChecklist: React.FC<DailyRoutineChecklistProps> = ({
  routines,
  onToggleComplete,
  onToggleCancelled,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (routines.length === 0) {
    return null;
  }

  const activeRoutines = routines.filter((r) => !r.isCancelled);
  const completedCount = activeRoutines.filter((r) => r.isCompleted).length;
  const totalCount = activeRoutines.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <Card variant="filled" padding={space[3]} style={styles.card}>
      {/* Header bar */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel="Rutinitas harian"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, isAllCompleted && styles.iconCircleCompleted]}>
            <SunMedium size={16} color={isAllCompleted ? colors.onPrimary : colors.primary} />
          </View>
          <View style={styles.headerTitles}>
            <AppText variant="labelMedium" color="onSurface" style={styles.headerTitle}>
              Rutinitas harian
            </AppText>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.badge, isAllCompleted && styles.badgeCompleted]}>
            <AppText
              variant="labelSmall"
              color={isAllCompleted ? 'onPrimary' : 'primary'}
              style={styles.badgeText}
            >
              {completedCount}/{totalCount} selesai
            </AppText>
          </View>
          {isExpanded ? (
            <ChevronUp size={18} color={colors.onSurfaceVariant} />
          ) : (
            <ChevronDown size={18} color={colors.onSurfaceVariant} />
          )}
        </View>
      </Pressable>

      {/* Routine Items List */}
      {isExpanded && (
        <View style={styles.itemList}>
          {routines.map((item) => {
            const { schedule, isCompleted, isCancelled } = item;
            return (
              <View
                key={schedule.id}
                style={[
                  styles.itemRow,
                  isCompleted && styles.itemRowCompleted,
                  isCancelled && styles.itemRowCancelled,
                ]}
              >
                {/* Checkbox */}
                <SproutCheck
                  checked={isCompleted}
                  disabled={isCancelled}
                  accessibilityLabel={`${isCompleted ? 'Buka kembali' : 'Selesaikan'} ${schedule.title}`}
                  onPress={() => onToggleComplete(schedule.id, isCompleted)}
                />

                {/* Content */}
                <Pressable
                  style={styles.itemContent}
                  onPress={() => {
                    if (!isCancelled) {
                      onToggleComplete(schedule.id, isCompleted);
                    }
                  }}
                >
                  <View style={styles.timeTag}>
                    <Clock size={11} color={colors.primary} />
                    <AppText variant="bodySmall" color="primary" style={styles.timeText}>
                      {schedule.startTime} - {schedule.endTime}
                    </AppText>
                  </View>

                  <AppText
                    variant="bodyMedium"
                    color={isCompleted || isCancelled ? 'onSurfaceVariant' : 'onSurface'}
                    style={[
                      styles.itemTitle,
                      isCompleted && styles.titleCompleted,
                      isCancelled && styles.titleCancelled,
                    ]}
                    numberOfLines={1}
                  >
                    {schedule.title}
                  </AppText>

                  {schedule.location ? (
                    <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
                      {schedule.location}
                    </AppText>
                  ) : null}
                </Pressable>

                {/* Quick Skip / Cancel Action */}
                <Pressable
                  onPress={() => onToggleCancelled(schedule.id, isCancelled)}
                  accessibilityRole="button"
                  accessibilityLabel={isCancelled ? 'Aktifkan kembali' : 'Liburkan hari ini'}
                  style={styles.skipButton}
                >
                  {isCancelled ? (
                    <RotateCcw size={14} color={colors.primary} />
                  ) : (
                    <Ban size={14} color={colors.onSurfaceVariant} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
    marginBottom: space[3],
  },
  header: {
    minHeight: touchTarget.min,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[1],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCompleted: {
    backgroundColor: colors.primary,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  badge: {
    paddingHorizontal: space[2],
    paddingVertical: space[0.5],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  badgeCompleted: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
  },
  itemList: {
    marginTop: space[3],
    paddingTop: space[2],
    borderTopWidth: stroke.hairline,
    borderTopColor: colors.outlineVariant,
    gap: space[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
    paddingHorizontal: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    gap: space[1],
  },
  itemRowCompleted: {
    opacity: 0.75,
  },
  itemRowCancelled: {
    opacity: 0.5,
    backgroundColor: colors.surfaceContainerLow,
  },
  itemContent: {
    flex: 1,
    gap: space[0.5],
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  timeText: {
    fontSize: typography.labelMedium.fontSize,
    fontFamily: fontFamily.medium,
  },
  itemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: colors.onSurface,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  titleCancelled: {
    textDecorationLine: 'line-through',
  },
  skipButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    padding: space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

