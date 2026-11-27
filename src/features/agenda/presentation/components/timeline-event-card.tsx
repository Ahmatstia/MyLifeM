import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Trash2, AlertTriangle, MapPin, CalendarDays } from 'lucide-react-native';
import { touchTarget, fontFamily, space, radius, typography } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText, SoftCard, SproutCheck, IconTile } from '@/shared/ui';
import type { AgendaEventEntity, AgendaEventType } from '../../domain/entities/agenda.entity';
import { formatLocalDate, shiftDate } from '@/shared/utils/local-date';

const s = colors.sprout;

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
  { label: string; tone: 'leaf' | 'rose' | 'teal' | 'grape' }
> = {
  WORK: { label: 'Kerja', tone: 'teal' },
  PERSONAL: { label: 'Pribadi', tone: 'rose' },
  LEARNING: { label: 'Belajar', tone: 'leaf' },
  MEETING: { label: 'Rapat', tone: 'grape' },
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  selectedDate,
  hasConflict,
  onToggleComplete,
  onDelete,
  style,
}) => {
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

  const timeSpanLabel = event.isAllDay
    ? `Sepanjang hari (${event.startTime} – ${shiftDate(event.endTime, -1)})`
    : crossesDay
      ? `${dateAndTime(event.startTime)} – ${dateAndTime(event.endTime)}`
      : `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;

  return (
    <SoftCard style={[styles.card, hasConflict && styles.cardConflict, style]}>
      <View style={styles.mainRow}>
        <SproutCheck
          checked={event.isCompleted}
          onPress={onToggleComplete}
          accessibilityLabel={(event.isCompleted ? 'Buka kembali ' : 'Selesaikan ') + event.title}
          size={28}
        />

        <View style={styles.centerCol}>
          <AppText
            style={[styles.title, event.isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {event.title}
          </AppText>

          <AppText tabularNums style={styles.subtext}>
            {timeSpanLabel}, {event.taskId ? 'Blok pengerjaan tugas' : config.label}
          </AppText>

          {selectedDate &&
            !event.isAllDay &&
            formatLocalDate(new Date(event.startTime)) < selectedDate && (
              <AppText style={styles.continuedBadge}>
                Berlanjut dari hari sebelumnya
              </AppText>
            )}

          {hasConflict && (
            <View style={styles.conflictBadge}>
              <AlertTriangle size={12} color={colors.error} strokeWidth={2.4} />
              <AppText style={styles.conflictText}>Waktu bertumpuk</AppText>
            </View>
          )}

          {event.taskId && <Pressable accessibilityRole="button" accessibilityLabel={'Buka tugas '+event.title} onPress={()=>router.push({pathname:'/tasks/[id]',params:{id:event.taskId!}})} style={{minHeight:48,justifyContent:'center'}}><AppText variant="labelMedium" color="primary">Buka tugas</AppText></Pressable>}
          {event.location ? (
            <View style={styles.locationRow}>
              <MapPin size={12} color={s.inkMuted} strokeWidth={2} />
              <AppText style={styles.locationText} numberOfLines={1}>
                {event.location}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.rightActions}>
          <IconTile icon={CalendarDays} tone={config.tone} size={40} />
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={'Hapus agenda ' + event.title}
            style={styles.deleteBtn}
          >
            <Trash2 size={15} color={s.inkSubtle} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </SoftCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    marginBottom: space[3],
  },
  cardConflict: {
    borderColor: colors.errorContainer,
    backgroundColor: colors.errorContainer,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  centerCol: {
    flex: 1,
    gap: space[0.5],
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
    lineHeight: typography.bodyMedium.lineHeight,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  subtext: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  continuedBadge: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.warning,
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    marginTop: space[0.5],
  },
  conflictText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.error,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    marginTop: space[0.5],
  },
  locationText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  deleteBtn: {
    width: touchTarget.min, height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
