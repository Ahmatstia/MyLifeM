import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check, Clock, ChevronDown, ChevronUp, SunMedium, Ban, RotateCcw } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
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
        accessibilityLabel="Lipat atau buka ritme keseharian"
      >
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, isAllCompleted && styles.iconCircleCompleted]}>
            <SunMedium size={16} color={isAllCompleted ? colors.onPrimary : colors.primary} />
          </View>
          <View style={styles.headerTitles}>
            <AppText variant="labelMedium" color="onSurface" style={styles.headerTitle}>
              RITME KESEHARIAN
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Rutinitas personal & pembiasaan
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
                <Pressable
                  onPress={() => onToggleComplete(schedule.id, isCompleted)}
                  disabled={isCancelled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isCompleted }}
                  style={[
                    styles.checkbox,
                    isCompleted && styles.checkboxCompleted,
                    isCancelled && styles.checkboxDisabled,
                  ]}
                >
                  {isCompleted && <Check size={14} color={colors.onPrimary} />}
                </Pressable>

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
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
    marginBottom: 12,
  },
  header: {
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
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  badgeCompleted: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  itemList: {
    marginTop: space[3],
    paddingTop: space[2],
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: space[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.12)',
    gap: space[3],
  },
  itemRowCompleted: {
    opacity: 0.75,
  },
  itemRowCancelled: {
    opacity: 0.5,
    backgroundColor: colors.surfaceContainerLow,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EB',
  },
  checkboxCompleted: {
    backgroundColor: '#76A284',
    borderColor: '#1E1E2E',
  },
  checkboxDisabled: {
    borderColor: 'rgba(30, 30, 46, 0.2)',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  itemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#1E1E2E',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  titleCancelled: {
    textDecorationLine: 'line-through',
  },
  skipButton: {
    padding: space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

