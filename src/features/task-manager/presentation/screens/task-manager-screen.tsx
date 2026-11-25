import { backOrHome } from '@/shared/utils/back-or-home';
import React, { useState } from 'react';
import {
  View,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  BellRing,
  Bell,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  FolderOpen,
  GraduationCap,
  Briefcase,
  Rocket,
  User,
  Music,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
  Zap,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { touchTarget, fontFamily, space, radius, stroke, typography } from '@/theme/tokens';
import {
  AppText,
  FormScreenHeader,
  Banner,
  EmptyState,
  Screen,
  SproutCheck,
} from '@/shared/ui';
import {
  computeDeadlineBufferInfo,
  formatDayAndDateIndo,
  type ManagedTaskEntity,
  type TaskCategoryType,
} from '../../domain/entities/managed-task.entity';
import { useManagedTasks } from '../hooks/use-managed-tasks';

const s = colors.sprout;

type FilterTab = 'ALL' | 'TODAY_EXEC' | 'ALARM_ONLY' | 'TIGHT' | 'DONE';

function renderCategoryBadgeIcon(type: TaskCategoryType) {
  switch (type) {
    case 'COLLEGE':
      return <GraduationCap size={13} color={s.forest} strokeWidth={2.4} />;
    case 'WORK':
      return <Briefcase size={13} color={s.forest} strokeWidth={2.4} />;
    case 'PROJECT':
      return <Rocket size={13} color={s.forest} strokeWidth={2.4} />;
    default:
      return <User size={13} color={s.forest} strokeWidth={2.4} />;
  }
}

function getCategoryDefaultName(type: TaskCategoryType): string {
  switch (type) {
    case 'COLLEGE':
      return 'Kuliah';
    case 'WORK':
      return 'Pekerjaan';
    case 'PROJECT':
      return 'Target';
    default:
      return 'Pribadi';
  }
}

export const TaskManagerScreen: React.FC = () => {
  const params = useLocalSearchParams<{ openAdd?: string }>();
  const {
    tasks,
    alarmTracks,
    isLoading,
    error,
    alarmWarning,
    retryAlarms,
    todayDate,
    refresh,
    toggleTask,
    toggleSubtask,
    deleteTask,
    pickAndSaveCustomSong,
    simulateAlarm,
  } = useManagedTasks();

  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [showSound, setShowSound] = useState(false);

  React.useEffect(() => {
    if (params?.openAdd === '1') {
      router.push('/task-manager/new' as any);
    }
  }, [params?.openAdd]);

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const todayExecTasks = activeTasks.filter(
    (t) => t.executionDate <= todayDate
  );
  const alarmEnabledTasks = activeTasks.filter(
    (t) => t.alertMode === 'ALARM' || t.alertMode === 'BOTH'
  );
  const customUploadedSongsCount = alarmTracks.filter(
    (t) => !t.isBuiltIn
  ).length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'TODAY_EXEC') {
      return !t.isCompleted && t.executionDate <= todayDate;
    }
    if (filter === 'ALARM_ONLY') {
      return (
        !t.isCompleted && (t.alertMode === 'ALARM' || t.alertMode === 'BOTH')
      );
    }
    if (filter === 'TIGHT') {
      if (t.isCompleted) return false;
      const buf = computeDeadlineBufferInfo(t, todayDate);
      return (
        buf.tone === 'tight' ||
        buf.tone === 'critical' ||
        buf.tone === 'overdue'
      );
    }
    if (filter === 'DONE') {
      return t.isCompleted;
    }
    return true;
  });

  const confirmDelete = (task: ManagedTaskEntity) => {
    const message = `“${task.title}” beserta subtask, prioritas harian dan pengingatnya akan dihapus. Catatan sesi fokus tetap disimpan.`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(message)) void deleteTask(task.id);
      return;
    }
    Alert.alert('Hapus tugas?', message, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus tugas', style: 'destructive', onPress: () => { void deleteTask(task.id); } },
    ]);
  };

  const renderTaskCard = (item: ManagedTaskEntity) => {
    const buffer = computeDeadlineBufferInfo(item, todayDate);
    const isAlarmLoud =
      item.alertMode === 'ALARM' || item.alertMode === 'BOTH';
    const isExecToday = item.executionDate === todayDate && !item.isCompleted && !item.excludedFocusDates?.includes(todayDate);

    const bufferColors =
      buffer.tone === 'safe'
        ? { bg: colors.successContainer, border: colors.successContainer, text: colors.success }
        : buffer.tone === 'tight'
          ? { bg: colors.warningContainer, border: colors.warningContainer, text: colors.warning }
          : buffer.tone === 'done'
            ? { bg: colors.surfaceContainerLow, border: colors.outlineVariant, text: s.forest }
            : { bg: colors.errorContainer, border: colors.errorContainer, text: colors.error };

    const completedSubs = item.subtasks.filter((st) => st.isCompleted).length;

    return (
      <View
        key={item.id}
        style={[
          styles.taskCard,
          item.isCompleted && styles.taskCardCompleted,
        ]}
      >
        {/* Main Title Row with Checkbox */}
        <View style={styles.titleCheckRow}>
          <SproutCheck
            checked={item.isCompleted}
            onPress={() => toggleTask(item.id)}
            accessibilityLabel={
              (item.isCompleted ? 'Buka kembali ' : 'Selesaikan ') + item.title
            }
            size={24}
          />
          <View style={{ flex: 1, gap: space[0.5] }}>
            <AppText
              style={[
                styles.taskTitle,
                item.isCompleted && styles.taskTitleDone,
              ]}
            >
              {item.title}
            </AppText>
            <View style={styles.metaInlineRow}>
              <Clock size={12} color={s.inkMuted} strokeWidth={2.3} />
              <AppText style={styles.metaInlineText}>
                Estimasi fokus {item.estimatedMinutes} menit
              </AppText>
              {isExecToday && (
                <View style={styles.todaySyncBadge}>
                  <Sparkles size={10} color={s.forest} strokeWidth={2.5} />
                  <AppText style={styles.todaySyncBadgeText}>
                    Aktif di Hari Ini
                  </AppText>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={() => confirmDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={`Hapus tugas ${item.title}`}
            style={styles.deleteIconBtn}
          >
            <Trash2 size={15} color={s.inkMuted} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={styles.cardTopRow}>
          <View style={styles.contextPill}>
            {renderCategoryBadgeIcon(item.categoryType)}
            <AppText style={styles.contextPillText} numberOfLines={1}>
              {item.courseOrContext
                ? `${getCategoryDefaultName(item.categoryType)}, ${item.courseOrContext}`
                : getCategoryDefaultName(item.categoryType)}
            </AppText>
          </View>

          <View
            style={[
              styles.bufferBadge,
              {
                backgroundColor: bufferColors.bg,
                borderColor: bufferColors.border,
              },
            ]}
          >
            <AppText
              style={[styles.bufferBadgeText, { color: bufferColors.text }]}
            >
              {buffer.label}
            </AppText>
          </View>
        </View>

        {/* Visual Dual-Date Bridge: Kapan Dikerjakan -> Deadline */}
        <View style={styles.dualDateBridge}>
          {/* Left: Jadwal Eksekusi (Do-Date) */}
          <View style={styles.execDateBox}>
            <View style={styles.dateBoxHeader}>
              <Sparkles size={12} color={s.forest} strokeWidth={2.5} />
              <AppText style={styles.execBoxLabel}>Waktu mulai</AppText>
            </View>
            <AppText style={styles.execBoxDateText}>
              {formatDayAndDateIndo(item.executionDate)}
            </AppText>
            <AppText style={styles.execBoxTimeText}>
              Pukul {item.executionTime}
            </AppText>
          </View>


          {/* Right: Batas Pengumpulan (Deadline) */}
          <View style={styles.deadlineDateBox}>
            <View style={styles.dateBoxHeader}>
              <CalendarClock size={12} color={colors.warning} strokeWidth={2.5} />
              <AppText style={styles.deadlineBoxLabel}>
                Tenggat
              </AppText>
            </View>
            <AppText style={styles.deadlineBoxDateText}>
              {formatDayAndDateIndo(item.deadlineDate)}
            </AppText>
            <AppText style={styles.deadlineBoxTimeText}>
              Pukul {item.deadlineTime}
            </AppText>
          </View>
        </View>

        {/* Subtasks Checklist (If any) */}
        {item.subtasks.length > 0 && (
          <View style={styles.subtasksBlock}>
            <View style={styles.subtasksHeaderRow}>
              <AppText style={styles.subtasksHeaderTitle}>
                Langkah pengerjaan
              </AppText>
              <AppText style={styles.subtasksHeaderCount}>
                {completedSubs}/{item.subtasks.length} selesai
              </AppText>
            </View>
            {item.subtasks.map((st) => (
              <Pressable
                key={st.id}
                onPress={() => toggleSubtask(item.id, st.id)}
                accessibilityRole="button"
                style={styles.subtaskRow}
              >
                {st.isCompleted ? (
                  <CheckCircle2 size={16} color={s.forest} strokeWidth={2.4} />
                ) : (
                  <Circle size={16} color={s.inkMuted} strokeWidth={2.2} />
                )}
                <AppText
                  style={[
                    styles.subtaskText,
                    st.isCompleted && styles.subtaskTextDone,
                  ]}
                >
                  {st.title}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}

        {/* Bottom Alarm & Action Strip */}
        <View style={styles.alarmFooterStrip}>
          <View style={styles.alarmModeInfo}>
            <View
              style={[
                styles.alarmIconCircle,
                isAlarmLoud
                  ? styles.alarmIconCircleLoud
                  : styles.alarmIconCircleSoft,
              ]}
            >
              {item.alertMode === 'BOTH' ? (
                <Zap size={14} color={s.ink} strokeWidth={2.5} />
              ) : isAlarmLoud ? (
                <BellRing size={14} color={s.ink} strokeWidth={2.5} />
              ) : (
                <Bell size={14} color={s.forest} strokeWidth={2.4} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <AppText style={styles.alarmModeTitleText} numberOfLines={1}>
                {item.alertMode === 'ALARM'
                  ? 'Alarm Berisik (Layar Penuh)'
                  : item.alertMode === 'BOTH'
                    ? 'Notif H-15m + Alarm Berisik'
                    : 'Hanya Notifikasi Standar'}
              </AppText>
              {isAlarmLoud && (
                <AppText style={styles.alarmSongSubtitle} numberOfLines={1}>
                  Lagu: {item.alarmTrackName}
                </AppText>
              )}
            </View>
          </View>

          {!item.isCompleted && (
            <View style={styles.footerButtonsGroup}>
              {isAlarmLoud && (
                <Pressable
                  onPress={() => simulateAlarm(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Tes dering alarm untuk ${item.title}`}
                  style={({ pressed }) => [
                    styles.testAlarmButton,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Volume2 size={13} color={s.ink} strokeWidth={2.5} />
                  <AppText style={styles.testAlarmButtonText}>
                    Tes Alarm
                  </AppText>
                </Pressable>
              )}

              <Pressable
                onPress={() => router.push('/(tabs)' as any)}
                accessibilityRole="button"
                accessibilityLabel={`Mulai fokus ${item.title}`}
                style={({ pressed }) => [
                  styles.focusGoButton,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Play
                  size={12}
                  color={colors.surfaceContainerLowest}
                  fill={colors.surfaceContainerLowest}
                  strokeWidth={2.4}
                />
                <AppText style={styles.focusGoButtonText}>Fokus</AppText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Screen
      scrollable
      style={styles.screenRoot}
    >
      <FormScreenHeader title="Manajemen Tugas" onBack={backOrHome}
        rightAction={
          <Pressable onPress={() => router.push('/task-manager/new')}
            accessibilityRole="button" accessibilityLabel="Tambah Tugas Terjadwal Baru"
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Plus size={22} color={colors.onHighlight} />
          </Pressable>
        }
      />
      {alarmWarning && <Banner variant="warning" message={alarmWarning} actionText="Periksa izin pengingat" onActionPress={retryAlarms} />}
      {error && (
        <Banner
          variant="error"
          message={error}
          actionText="Muat ulang"
          onActionPress={refresh}
        />
      )}

      {/* 3. Filter Pills */}
      <ScrollView
        style={{ flexGrow: 0 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {(
          [
            ['ALL', `Semua (${tasks.length})`],
            ['TODAY_EXEC', `Siap dikerjakan (${todayExecTasks.length})`],
            ['ALARM_ONLY', `Dengan alarm (${alarmEnabledTasks.length})`],
            ['TIGHT', 'Dekat tenggat'],
            ['DONE', `Selesai (${completedTasks.length})`],
          ] as const
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <Pressable accessibilityState={{ selected: active }}
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="button"
              style={[
                styles.filterPill,
                active && styles.filterPillActive,
              ]}
            >
              <AppText
                style={[
                  styles.filterPillText,
                  active && styles.filterPillTextActive,
                ]}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. Task List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={s.forest} />
          <AppText color="onSurfaceVariant">Memuat jadwal tugasmu…</AppText>
        </View>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={tasks.length ? "Tidak ada tugas di filter ini" : "Belum ada tugas terjadwal"}
          description={tasks.length ? "Lihat semua tugas untuk memilih jadwal lain." : "Pilih waktu mulai dan tenggat untuk tugas pertamamu."}
          actionTitle={tasks.length ? "Lihat semua tugas" : "Jadwalkan Tugas Pertama"}
          customIcon={<BellRing size={28} color={s.forest} strokeWidth={2.2} />}
          onActionPress={() => tasks.length ? setFilter('ALL') : router.push('/task-manager/new')}
        />
      ) : (
        <View style={styles.cardsStack}>
          {filteredTasks.map(renderTaskCard)}
        </View>
      )}
      <View style={styles.soundSection}>
        <Pressable onPress={() => setShowSound(!showSound)} accessibilityRole="button"
          accessibilityState={{ expanded: showSound }} style={({ pressed }) => [styles.soundHeading, pressed && styles.pressed]}>
          <Music size={18} color={s.forest} />
          <AppText variant="titleSmall" style={{ flex: 1 }}>Suara pengingat</AppText>
          {showSound ? <ChevronUp size={18} color={s.ink} /> : <ChevronDown size={18} color={s.ink} />}
        </Pressable>
        {showSound && (
          <View style={styles.soundBody}>
            <AppText color="onSurfaceVariant">Lagu diputar saat aplikasi terbuka. Saat aplikasi tertutup, tugas memakai notifikasi sesuai izin perangkat.</AppText>
            <Pressable onPress={() => void pickAndSaveCustomSong()} accessibilityRole="button"
              accessibilityLabel="Tambah lagu alarm dari penyimpanan HP"
              style={({ pressed }) => [styles.soundHeading, pressed && styles.pressed]}>
              <FolderOpen size={18} color={s.forest} />
              <AppText variant="titleSmall">Tambah lagu dari HP ({customUploadedSongsCount})</AppText>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  addButton: { width: touchTarget.min, height: touchTarget.min, borderRadius: radius.md, backgroundColor: colors.highlight, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  soundSection: { borderTopWidth: stroke.hairline, borderTopColor: colors.border },
  soundHeading: { minHeight: touchTarget.min, flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[2] },
  soundBody: { gap: space[2], paddingHorizontal: space[2] },
  screenRoot: {
    backgroundColor: s.cream,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: space[2],
    paddingVertical: space[0.5],
  },
  filterPill: { minHeight: touchTarget.min, justifyContent: 'center', paddingHorizontal: space[3], paddingVertical: space[2], borderRadius: radius.sm, backgroundColor: s.card, borderWidth: stroke.hairline, borderColor: colors.border, },
  filterPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  filterPillText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  filterPillTextActive: {
    color: colors.surfaceContainerLowest,
  },
  loadingWrap: {
    paddingVertical: space[10],
    alignItems: 'center',
    gap: space[2],
  },
  cardsStack: {
    gap: space[3],
  },
  taskCard: { backgroundColor: s.card, borderRadius: radius.md, padding: space[3], borderWidth: stroke.hairline, borderColor: colors.border, gap: space[2], },
  taskCardCompleted: {
    opacity: 0.72,
  },
  cardTopRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.leafSoft,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    maxWidth: '52%',
  },
  contextPillText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  bufferBadge: {
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    borderWidth: stroke.hairline,
  },
  bufferBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
  },
  deleteIconBtn: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  taskTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.titleMedium.fontSize,
    lineHeight: typography.titleMedium.lineHeight,
    color: s.ink,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  metaInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[1],
  },
  metaInlineText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  todaySyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.leafSoft,
    paddingHorizontal: space[2],
    paddingVertical: space[0.5],
    borderRadius: radius.pill,
  },
  todaySyncBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  dualDateBridge: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: space[2],
  },
  execDateBox: {
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: colors.successContainer,
    borderRadius: radius.lg,
    padding: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.successContainer,
    gap: space[0.5],
  },
  deadlineDateBox: {
    flexGrow: 1,
    flexBasis: 120,
    backgroundColor: colors.warningContainer,
    borderRadius: radius.lg,
    padding: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.warningContainer,
    gap: space[0.5],
  },
  dateBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  execBoxLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.5,
    color: s.forest,
  },
  execBoxDateText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  execBoxTimeText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  deadlineBoxLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.5,
    color: colors.warning,
  },
  deadlineBoxDateText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.warning,
  },
  deadlineBoxTimeText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: colors.warning,
  },
  subtasksBlock: {
    backgroundColor: s.cream,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    gap: space[1],
  },
  subtasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[0.5],
  },
  subtasksHeaderTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.5,
    color: s.inkMuted,
  },
  subtasksHeaderCount: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  subtaskRow: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[0.5],
  },
  subtaskText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  subtaskTextDone: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  alarmFooterStrip: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  alarmModeInfo: {
    flexGrow: 1,
    flexBasis: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  alarmIconCircle: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmIconCircleLoud: {
    backgroundColor: s.sun,
  },
  alarmIconCircleSoft: {
    backgroundColor: s.leafSoft,
  },
  alarmModeTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  alarmSongSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  footerButtonsGroup: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  testAlarmButton: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.sunSoft,
    borderWidth: stroke.hairline,
    borderColor: s.sun,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.md,
  },
  testAlarmButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  focusGoButton: {
    minHeight: touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.forest,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.md,
  },
  focusGoButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.surfaceContainerLowest,
  },

});
