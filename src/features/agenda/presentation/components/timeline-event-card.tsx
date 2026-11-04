import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions, type ViewStyle, type StyleProp } from 'react-native';
import { Check, Trash2, AlertTriangle, MapPin } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
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
  WORK: { label: 'Kerja', bg: '#FFF4E5', text: '#9A5B00' },
  PERSONAL: { label: 'Pribadi', bg: '#FCE7F3', text: '#BE185D' },
  LEARNING: { label: 'Belajar', bg: '#ECEBFE', text: '#6C6AE8' },
  MEETING: { label: 'Rapat', bg: '#E8F8EE', text: '#1E7D42' },
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
                <AlertTriangle size={11} color="#DC2626" strokeWidth={2.4} />
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
            <Trash2 size={15} color="rgba(18, 20, 23, 0.4)" strokeWidth={2} />
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
              {event.isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
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
                <MapPin size={12} color="rgba(18, 20, 23, 0.5)" strokeWidth={2} />
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
    color: '#121417',
  },
  endTimeText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.45)',
  },
  verticalRail: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(18, 20, 23, 0.08)',
    marginTop: 6,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6E3DB',
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompleted: {
    backgroundColor: '#FBFBFA',
    opacity: 0.85,
  },
  cardConflict: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: '#FFF5F5',
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
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  conflictBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#DC2626',
  },
  deleteTouch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxTouch: {
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(18, 20, 23, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  detailsCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 18,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(18, 20, 23, 0.45)',
  },
  subtitleTime: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.65)',
  },
  continuedBadge: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#7577EC',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.55)',
  },
});
