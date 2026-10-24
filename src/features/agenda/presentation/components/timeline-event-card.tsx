import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { CheckCircle2, Circle, Clock, MapPin, Trash2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
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
      padding={space[3]}
      style={[styles.container, style]}
    >
      <View style={styles.row}>
        {/* Check button on left (>= 48dp hit area per DESIGN.md 9.2) */}
        <Pressable
          onPress={onToggleComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.checkButton}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : (
            <Circle size={24} color={colors.outline} />
          )}
        </Pressable>

        {/* Event Content */}
        <View style={styles.contentCol}>
          {/* Header Row: Time and Type Badge */}
          <View style={styles.metaHeader}>
            <View style={styles.timeBadge}>
              <Clock size={12} color={colors.onSurfaceVariant} />
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums style={styles.timeText}>
                {timeLabel}
              </AppText>
            </View>

            <View style={[styles.typeBadge, { borderColor: typeColor }]}>
              <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
              <AppText variant="badge" style={{ color: typeColor }}>
                {EVENT_TYPE_LABELS[eventType]}
              </AppText>
            </View>
          </View>

          {/* Title */}
          <AppText
            variant="titleSmall"
            color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
            numberOfLines={2}
            style={[styles.title, isCompleted && styles.completedText]}
          >
            {event.title}
          </AppText>

          {/* Description & Location */}
          {event.description ? (
            <AppText variant="bodySmall" color="onSurfaceSubtle" numberOfLines={2}>
              {event.description}
            </AppText>
          ) : null}

          {event.location ? (
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.onSurfaceSubtle} />
              <AppText variant="labelSmall" color="onSurfaceSubtle" numberOfLines={1}>
                {event.location}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Delete action */}
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Hapus agenda"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteButton}
        >
          <Trash2 size={16} color={colors.onSurfaceSubtle} />
        </Pressable>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    marginBottom: space[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    width: touchTarget.compact,
    height: touchTarget.compact,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  contentCol: {
    flex: 1,
    marginRight: space[2],
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[1],
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    marginLeft: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 4,
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  title: {
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deleteButton: {
    padding: space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
