import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Check, MoreHorizontal } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import type { AgendaEventEntity, AgendaEventType } from '../../domain/entities/agenda.entity';

export interface TimelineEventCardProps {
  event: AgendaEventEntity;
  onToggleComplete: () => void;
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
}

const EVENT_TYPE_COLORS: Record<AgendaEventType, string> = {
  WORK: colors.pillars.career,     // Teal
  MEETING: colors.pillars.finance,  // Amber
  LEARNING: colors.pillars.growth,  // Purple
  PERSONAL: colors.pillars.personal,// Blue
};

const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  WORK: 'Kerja',
  MEETING: 'Rapat',
  LEARNING: 'Belajar',
  PERSONAL: 'Pribadi',
};

/**
 * TimelineEventCard: Desain Cute Marshmallow Minimal.
 * - Tanpa tumpukan icon (clock, map pin, trash).
 * - Checkbox bundar tactile 28dp.
 * - Pil pastel lembut untuk waktu dan tipe kegiatan.
 */
export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  onToggleComplete,
  onDelete,
  style,
}) => {
  const { isCompleted, isAllDay, eventType } = event;
  const typeColor = EVENT_TYPE_COLORS[eventType] || colors.primary;

  // Format time display
  const formatTimeStr = (iso: string) => {
    try {
      const d = new Date(iso);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch {
      return '';
    }
  };

  const timeLabel = isAllDay
    ? 'Bebas Jam'
    : `${formatTimeStr(event.startTime)} - ${formatTimeStr(event.endTime)}`;

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      padding={space[4]}
      style={[styles.container, style]}
    >
      <View style={styles.row}>
        {/* Checkbox Bundar Tactile */}
        <Pressable
          onPress={onToggleComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Tandai ${event.title} ${isCompleted ? 'belum selesai' : 'selesai'}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkButton}
        >
          <View style={[styles.stampCircle, isCompleted && styles.stampCircleDone]}>
            {isCompleted && <Check size={16} color={colors.onPrimary} strokeWidth={3} />}
          </View>
        </Pressable>

        {/* Event Content */}
        <View style={styles.contentCol}>
          {/* Header Row: Pil Waktu & Pil Tipe Pastel */}
          <View style={styles.metaHeader}>
            <View style={styles.timePill}>
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                {timeLabel}
              </AppText>
            </View>

            <View style={styles.typePill}>
              <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
              <AppText variant="labelSmall" style={{ color: typeColor }}>
                {EVENT_TYPE_LABELS[eventType]}
              </AppText>
            </View>
          </View>

          {/* Title */}
          <AppText
            variant="titleMedium"
            color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
            numberOfLines={2}
            style={[styles.title, isCompleted && styles.completedTitle]}
          >
            {event.title}
          </AppText>

          {/* Location text if available */}
          {event.location ? (
            <View style={styles.locationRow}>
              <AppText variant="bodySmall" color="onSurfaceSubtle" numberOfLines={1}>
                {event.location}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Delete option (discreet menu trigger) */}
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Hapus agenda ini"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.moreButton}
        >
          <MoreHorizontal size={18} color={colors.onSurfaceSubtle} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  stampCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: '#D4CEF2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  contentCol: {
    flex: 1,
    paddingRight: space[2],
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[1],
  },
  timePill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    gap: 4,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  title: {
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  locationRow: {
    marginTop: 2,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
