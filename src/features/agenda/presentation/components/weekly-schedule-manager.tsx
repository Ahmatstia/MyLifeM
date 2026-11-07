import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Clock, MapPin, FileText, Plus, Edit2, Trash2, Calendar, BookOpen, Briefcase, Sparkles, GraduationCap, Heart } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import type {
  WeeklyScheduleEntity,
  WeeklyScheduleType,
} from '../../domain/entities/weekly-schedule.entity';
import { DAY_NAMES, DAY_SHORT_NAMES } from '../../domain/entities/weekly-schedule.entity';

export interface WeeklyScheduleManagerProps {
  schedulesByDay: Record<number, WeeklyScheduleEntity[]>;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onAddSchedule: (day: number) => void;
  onEditSchedule: (schedule: WeeklyScheduleEntity) => void;
  onDeleteSchedule: (id: string, title: string) => void;
}

const TYPE_CONFIG: Record<
  WeeklyScheduleType,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  COLLEGE: {
    label: 'Kuliah / Kelas',
    color: colors.primary,
    bg: colors.primaryContainer,
    icon: <GraduationCap size={13} color={colors.primary} strokeWidth={2.4} />,
  },
  WORK: {
    label: 'Kerja',
    color: colors.secondary,
    bg: colors.secondaryContainer,
    icon: <Briefcase size={13} color={colors.secondary} strokeWidth={2.4} />,
  },
  STUDY: {
    label: 'Belajar',
    color: colors.tertiary,
    bg: colors.tertiaryContainer,
    icon: <BookOpen size={13} color={colors.tertiary} strokeWidth={2.4} />,
  },
  PERSONAL: {
    label: 'Pribadi',
    color: colors.onSurfaceVariant,
    bg: colors.surfaceContainerHighest,
    icon: <Heart size={13} color={colors.onSurfaceVariant} strokeWidth={2.4} />,
  },
  ROUTINE: {
    label: 'Rutinitas',
    color: colors.primary,
    bg: colors.primaryContainer,
    icon: <Sparkles size={13} color={colors.primary} strokeWidth={2.4} />,
  },
};

export const WeeklyScheduleManager: React.FC<WeeklyScheduleManagerProps> = ({
  schedulesByDay,
  selectedDay,
  onSelectDay,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const currentDaySchedules = schedulesByDay[selectedDay] || [];
  const currentDayName = DAY_NAMES[selectedDay] || 'Hari';

  const confirmDelete = (item: WeeklyScheduleEntity) => {
    Alert.alert(
      'Hapus Jadwal Tetap?',
      `Hapus "${item.title}" dari jadwal rutin setiap hari ${DAY_NAMES[item.dayOfWeek]}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDeleteSchedule(item.id, item.title),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Day Selector Tabs (Senin - Minggu) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabsContainer}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const selected = day === selectedDay;
          const count = schedulesByDay[day]?.length || 0;
          return (
            <Pressable
              key={day}
              onPress={() => onSelectDay(day)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${DAY_NAMES[day]} (${count} agenda)`}
              style={[styles.dayTab, selected && styles.dayTabSelected]}
            >
              <AppText
                variant="titleSmall"
                color={selected ? 'onPrimary' : 'onSurface'}
                style={selected ? styles.dayTextBold : undefined}
              >
                {DAY_SHORT_NAMES[day]}
              </AppText>
              {count > 0 && (
                <View style={[styles.badge, selected && styles.badgeSelected]}>
                  <AppText
                    variant="labelSmall"
                    color={selected ? 'primary' : 'onSurfaceVariant'}
                    style={styles.badgeText}
                  >
                    {count}
                  </AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 2. Header Hari & Action Add */}
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <AppText variant="headlineSmall">
            Hari {currentDayName}
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {currentDaySchedules.length} jadwal rutin setiap hari {currentDayName}
          </AppText>
        </View>
        <Button
          title="+ Tambah"
          variant="filled"
          size="compact"
          leftIcon={<Plus size={16} color={colors.onPrimary} />}
          onPress={() => onAddSchedule(selectedDay)}
        />
      </View>

      {/* 3. Schedules List */}
      {currentDaySchedules.length === 0 ? (
        <EmptyState
          title={`Belum ada jadwal di hari ${currentDayName}`}
          description={`Tambahkan jadwal kerja, belajar, atau rutinitas harianmu setiap hari ${currentDayName} agar otomatis muncul di agenda harian.`}
          customIcon={<Calendar size={32} color={colors.primary} />}
          actionTitle={`+ Tambah Jadwal ${currentDayName}`}
          onActionPress={() => onAddSchedule(selectedDay)}
        />
      ) : (
        <View style={styles.list}>
          {currentDaySchedules.map((item) => {
            const typeInfo = TYPE_CONFIG[item.scheduleType] || TYPE_CONFIG.COLLEGE;
            return (
              <Card key={item.id} variant="elevated" padding={space[4]} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.timeTag}>
                    <Clock size={14} color={colors.primary} />
                    <AppText variant="titleSmall" color="primary" tabularNums>
                      {item.startTime} – {item.endTime}
                    </AppText>
                  </View>

                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                    {typeInfo.icon}
                    <AppText variant="labelSmall" color={typeInfo.color} style={styles.typeLabel}>
                      {typeInfo.label}
                    </AppText>
                  </View>
                </View>

                <AppText variant="titleMedium" style={styles.title}>
                  {item.title}
                </AppText>

                {(item.location || item.notes) && (
                  <View style={styles.metaRow}>
                    {item.location && (
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={colors.onSurfaceVariant} />
                        <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
                          {item.location}
                        </AppText>
                      </View>
                    )}
                    {item.notes && (
                      <View style={styles.metaItem}>
                        <FileText size={14} color={colors.onSurfaceVariant} />
                        <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
                          {item.notes}
                        </AppText>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <AppText variant="labelSmall" color={item.isActive ? 'primary' : 'onSurfaceVariant'}>
                    {item.isActive ? '● Berjalan aktif' : '○ Diliburkan'}
                  </AppText>

                  <View style={styles.actionButtons}>
                    <Pressable
                      onPress={() => onEditSchedule(item)}
                      accessibilityRole="button"
                      accessibilityLabel="Ubah jadwal"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.iconButton}
                    >
                      <Edit2 size={16} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(item)}
                      accessibilityRole="button"
                      accessibilityLabel="Hapus jadwal"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.iconButton}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: space[4],
  },
  dayTabsContainer: {
    flexDirection: 'row',
    gap: space[2],
    paddingVertical: space[2],
  },
  dayTab: {
    minWidth: 54,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: space[2],
  },
  dayTabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTextBold: {
    fontFamily: fontFamily.bold,
  },
  badge: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  badgeSelected: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[2],
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  list: {
    gap: space[3],
  },
  card: {
    gap: space[2],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: space[2],
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeLabel: {
    fontFamily: fontFamily.semibold,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    paddingTop: space[1],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    maxWidth: '85%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: space[2],
    marginTop: space[1],
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  iconButton: {
    padding: space[1],
  },
});
