import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MapPin, Repeat } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { AppText, SoftCard, SproutCheck, IconTile } from '@/shared/ui';
import type {
  ProjectedWeeklyOccurrence,
  WeeklyScheduleType,
} from '../../domain/entities/weekly-schedule.entity';

const s = colors.sprout;

export interface WeeklyOccurrenceCardProps {
  occurrence: ProjectedWeeklyOccurrence;
  onToggleComplete: () => void;
  onToggleCancelled: () => void;
}

const TYPE_CONFIG: Record<
  WeeklyScheduleType,
  { label: string; tone: 'leaf' | 'teal' | 'grape' | 'rose' | 'sun' }
> = {
  COLLEGE: { label: 'Kuliah / Kelas', tone: 'leaf' },
  WORK: { label: 'Kerja', tone: 'teal' },
  STUDY: { label: 'Belajar', tone: 'grape' },
  PERSONAL: { label: 'Pribadi', tone: 'rose' },
  ROUTINE: { label: 'Rutinitas', tone: 'sun' },
};

export const WeeklyOccurrenceCard: React.FC<WeeklyOccurrenceCardProps> = ({
  occurrence,
  onToggleComplete,
  onToggleCancelled,
}) => {
  const { schedule, isCompleted, isCancelled } = occurrence;
  const typeConfig = TYPE_CONFIG[schedule.scheduleType] || TYPE_CONFIG.COLLEGE;

  return (
    <SoftCard
      style={[
        styles.card,
        isCancelled && styles.cancelledCard,
      ]}
    >
      <View style={styles.mainRow}>
        <SproutCheck
          checked={isCompleted}
          onPress={onToggleComplete}
          accessibilityLabel={`Tandai ${schedule.title} ${isCompleted ? 'belum selesai' : 'selesai'}`}
          size={28}
        />

        <View style={styles.contentCol}>
          <AppText
            style={[
              styles.title,
              isCompleted && styles.completedText,
              isCancelled && styles.cancelledText,
            ]}
            numberOfLines={1}
          >
            {schedule.title}
          </AppText>

          <AppText tabularNums style={styles.subtext}>
            {schedule.startTime} – {schedule.endTime} · {typeConfig.label}
            {isCancelled ? ' · Diliburkan' : ''}
          </AppText>

          {(schedule.location || schedule.notes) && (
            <View style={styles.metaRow}>
              {schedule.location && (
                <View style={styles.metaItem}>
                  <MapPin size={12} color={s.inkMuted} />
                  <AppText style={styles.metaText} numberOfLines={1}>
                    {schedule.location}
                  </AppText>
                </View>
              )}
            </View>
          )}

          <Pressable
            onPress={onToggleCancelled}
            accessibilityRole="button"
            hitSlop={6}
            style={styles.cancelLink}
          >
            <AppText style={styles.cancelLinkText}>
              {isCancelled ? 'Aktifkan kembali hari ini' : 'Liburkan hari ini saja'}
            </AppText>
          </Pressable>
        </View>

        <IconTile icon={Repeat} tone={typeConfig.tone} size={42} />
      </View>
    </SoftCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    marginBottom: space[3],
  },
  cancelledCard: {
    opacity: 0.72,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  contentCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: s.ink,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: colors.error,
  },
  subtext: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  cancelLink: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  cancelLinkText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.forest,
  },
});
