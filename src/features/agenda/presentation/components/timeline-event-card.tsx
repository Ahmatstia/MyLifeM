import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions, type ViewStyle, type StyleProp } from 'react-native';
import { Check, Trash2, AlertTriangle, MapPin } from 'lucide-react-native';
import { fontFamily, radius } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui';
import type { AgendaEventEntity, AgendaEventType } from '../../domain/entities/agenda.entity';
import { formatLocalDate, shiftDate } from '@/shared/utils/local-date';

export interface TimelineEventCardProps {
  event: AgendaEventEntity;
  selectedDate?: string;
  hasConflict?: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  style?: StyleProp<ViewStyle>;
}

const TYPE_CONFIG: Record<
  AgendaEventType,
  { label: string; bg: string; text: string }
> = {
  WORK: { label: 'Kerja', bg: colors.primaryContainer, text: colors.onPrimaryContainer },
  PERSONAL: { label: 'Pribadi', bg: colors.surfaceContainer, text: colors.onSurfaceVariant },
  LEARNING: { label: 'Belajar', bg: colors.tertiaryContainer, text: colors.onTertiaryContainer },
  MEETING: { label: 'Rapat', bg: colors.successContainer, text: colors.onSuccessContainer },
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  selectedDate,
  hasConflict,
  onToggleComplete,
  onDelete,
  style,
}) => {
  const { fontScale } = useWindowDimensions();
  const config = TYPE_CONFIG[event.eventType] || TYPE_CONFIG.WORK;

  const dateAndTime = (value: string) =>
    new Date(value).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const crossesDay =
    !event.isAllDay &&
    formatLocalDate(new Date(event.startTime)) !== formatLocalDate(new Date(event.endTime));

  return (
    <View style={[styles.containerRow, style]}>
      {/* Left Time Column & Vertical Connector Line */}
      {!event.isAllDay && fontScale <= 1.3 && (
        <View style={styles.timeColumn}>
          <AppText variant="labelMedium" tabularNums style={styles.startTimeText}>
            {formatTime(event.startTime)}
          </AppText>
          <AppText variant="bodySmall" tabularNums style={styles.endTimeText}>
            {formatTime(event.endTime)}
          </AppText>
          <View style={styles.verticalRail} />
        </View>
      )}

      {/* Main Event Card */}
      <View
        style={[
          styles.card,
          event.isCompleted && styles.cardCompleted,
          hasConflict && styles.cardConflict,
        ]}
      >
        {/* Header: Type Badge & Action Delete */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
              <AppText variant="labelSmall" style={[styles.typeBadgeText, { color: config.text }]}>
                {config.label}
              </AppText>
            </View>

            {hasConflict && (
              <View style={styles.conflictBadge}>
                <AlertTriangle size={11} color={colors.error} strokeWidth={2.4} />
                <AppText variant="labelSmall" style={styles.conflictBadgeText}>
                  Waktu bertumpuk
                </AppText>
              </View>
            )}
          </View>

          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={'Hapus agenda ' + event.title}
            style={styles.deleteTouch}
          >
              <Trash2 size={15} color={colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Content Row: Tactile Checkbox + Details */}
        <View style={styles.contentRow}>
          <Pressable
            onPress={onToggleComplete}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: event.isCompleted }}
            accessibilityLabel={(event.isCompleted ? 'Buka kembali ' : 'Selesaikan ') + event.title}
            style={styles.checkboxTouch}
          >
            <View style={[styles.checkbox, event.isCompleted && styles.checkboxCompleted]}>
                {event.isCompleted && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
            </View>
          </Pressable>

          <View style={styles.detailsCol}>
            <AppText
              variant="titleSmall"
              style={[styles.title, event.isCompleted && styles.titleCompleted]}
            >
              {event.title}
            </AppText>

            {/* Time / Span */}
            {!event.isAllDay && (
              <AppText variant="bodySmall" tabularNums style={styles.subtitleTime}>
                {crossesDay
                  ? `${dateAndTime(event.startTime)} – ${dateAndTime(event.endTime)}`
                  : `${formatTime(event.startTime)} – ${formatTime(event.endTime)} WIB`}
              </AppText>
            )}

            {event.isAllDay && (
              <AppText variant="bodySmall" style={styles.subtitleTime}>
                Sepanjang hari ({event.startTime} – {shiftDate(event.endTime, -1)})
              </AppText>
            )}

            {selectedDate && !event.isAllDay && formatLocalDate(new Date(event.startTime)) < selectedDate && (
              <AppText variant="labelSmall" style={styles.continuedBadge}>
                Berlanjut dari hari sebelumnya
              </AppText>
            )}

            {/* Location */}
            {event.location ? (
              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.onSurfaceVariant} strokeWidth={2} />
                <AppText variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                  {event.location}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timeColumn: {
    width: 48,
    alignItems: 'center',
    paddingTop: 8,
    gap: 2,
  },
  startTimeText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
  },
  endTimeText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#504535',
  },
  verticalRail: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(30, 30, 46, 0.15)',
    marginTop: 6,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  cardCompleted: {
    backgroundColor: '#F5EFE6',
  },
  cardConflict: {
    borderColor: '#1E1E2E',
    backgroundColor: '#FFDAD6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.4,
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFDAD6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  conflictBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#BA1A1A',
  },
  deleteTouch: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxTouch: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
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
  detailsCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
    lineHeight: 21,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#837563',
  },
  subtitleTime: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: '#504535',
  },
  continuedBadge: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#805600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: '#504535',
  },
});
