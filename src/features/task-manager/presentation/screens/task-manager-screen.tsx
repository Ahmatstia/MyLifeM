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
  ArrowLeft,
  ArrowRight,
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
  Banner,
  EmptyState,
  Screen,
  SproutCheck,
  sproutShadow,
} from '@/shared/ui';
import {
  computeDeadlineBufferInfo,
  formatDayAndDateIndo,
  type ManagedTaskEntity,
  type TaskCategoryType,
} from '../../domain/entities/managed-task.entity';
import { AddManagedTaskModal } from '../components/add-managed-task-modal';
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
    previewingTrackId,
    refresh,
    addTask,
    toggleTask,
    toggleSubtask,
    deleteTask,
    pickAndSaveCustomSong,
    togglePreviewTrack,
    stopPreview,
    simulateAlarm,
  } = useManagedTasks();

  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

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
        {/* Top Row: Category Context Badge + Buffer Pill + Delete */}
        <View style={styles.cardTopRow}>
          <View style={styles.contextPill}>
            {renderCategoryBadgeIcon(item.categoryType)}
            <AppText style={styles.contextPillText} numberOfLines={1}>
              {item.courseOrContext
                ? `${getCategoryDefaultName(item.categoryType)}, ${item.courseOrContext}`
                : getCategoryDefaultName(item.categoryType)}
            </AppText>
          </View>

          <View style={styles.cardTopRightActions}>
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

            <Pressable
              onPress={() => confirmDelete(item)}
              accessibilityRole="button"
              accessibilityLabel={`Hapus tugas ${item.title}`}
              hitSlop={8}
              style={styles.deleteIconBtn}
            >
              <Trash2 size={15} color={s.inkMuted} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* Main Title Row with Checkbox */}
        <View style={styles.titleCheckRow}>
          <SproutCheck
            checked={item.isCompleted}
            onPress={() => toggleTask(item.id)}
            accessibilityLabel={
              (item.isCompleted ? 'Buka kembali ' : 'Selesaikan ') + item.title
            }
            size={28}
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

          <View style={styles.bridgeArrowCircle}>
            <ArrowRight size={14} color={s.inkMuted} strokeWidth={2.5} />
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
      withBottomPadding={false}
      style={styles.screenRoot}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          <View style={styles.floatingFabContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => router.push('/task-manager/new' as any)}
              accessibilityRole="button"
              accessibilityLabel="Tambah Tugas Terjadwal Baru"
              style={({ pressed }) => [
                styles.fabSquare,
                pressed && styles.fabSquarePressed,
              ]}
            >
              <Plus size={24} color={s.ink} strokeWidth={2.8} />
            </Pressable>
          </View>

          <AddManagedTaskModal
            visible={isAddModalVisible}
            alarmTracks={alarmTracks}
            previewingTrackId={previewingTrackId}
            onClose={() => {
              stopPreview();
              setIsAddModalVisible(false);
            }}
            onSubmit={addTask}
            onPickCustomSong={pickAndSaveCustomSong}
            onTogglePreviewTrack={togglePreviewTrack}
          />
        </>
      }
    >


      {/* 1. Header Bar */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={s.ink} strokeWidth={2.4} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <AppText style={styles.headerTitle}>Manajemen Tugas</AppText>
          <AppText style={styles.headerSubtitle}>
            Waktu mulai, tenggat, dan pengingat tugas.
          </AppText>
        </View>
      </View>

      <Banner variant="info" message="Lagu alarm diputar saat aplikasi aktif. Saat tertutup, pengingat memakai notifikasi perangkat. Ketuk notifikasi untuk membuka tugas; pengiriman mengikuti izin dan pembatasan sistem." />
      {alarmWarning && <Banner variant="warning" message={alarmWarning} actionText="Periksa izin pengingat" onActionPress={retryAlarms} />}
      {error && (
        <Banner
          variant="error"
          message={error}
          actionText="Muat ulang"
          onActionPress={refresh}
        />
      )}

      {/* 2. Command Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>Aktif</AppText>
            <AppText style={styles.metricBigVal} tabularNums>
              {activeTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>Hari ini</AppText>
            <AppText
              style={[styles.metricBigVal, { color: s.forest }]}
              tabularNums
            >
              {todayExecTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>Alarm aktif</AppText>
            <AppText
              style={[styles.metricBigVal, { color: colors.warning }]}
              tabularNums
            >
              {alarmEnabledTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>Tuntas</AppText>
            <AppText style={styles.metricBigVal} tabularNums>
              {completedTasks.length}
            </AppText>
          </View>
        </View>

        {/* Quick Custom Song Upload Bar */}
        <View style={styles.customSongQuickBar}>
          <View style={styles.customSongLeft}>
            <View style={styles.musicSquircle}>
              <Music size={16} color={s.forest} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.customSongBarTitle}>
                Suara pengingat ({customUploadedSongsCount} lagu HP)
              </AppText>
              <AppText style={styles.customSongBarSub} numberOfLines={1}>
                Pilih berkas audio dari perangkat.
              </AppText>
            </View>
          </View>

          <Pressable
            onPress={() => void pickAndSaveCustomSong()}
            accessibilityRole="button"
            accessibilityLabel="Tambah lagu alarm dari penyimpanan HP"
            style={({ pressed }) => [
              styles.pickSongQuickBtn,
              pressed && { opacity: 0.82 },
            ]}
          >
            <FolderOpen size={13} color={s.ink} strokeWidth={2.5} />
            <AppText style={styles.pickSongQuickBtnText}>+ Lagu HP</AppText>
          </Pressable>
        </View>
      </View>

      {/* 3. Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {(
          [
            ['ALL', `Semua (${tasks.length})`],
            ['TODAY_EXEC', `Jadwal Hari Ini (${todayExecTasks.length})`],
            ['ALARM_ONLY', `Dengan alarm (${alarmEnabledTasks.length})`],
            ['TIGHT', 'Mepet Deadline'],
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
          title="Belum ada tugas terjadwal"
          description="Punya tugas kuliah atau pekerjaan minggu depan? Atur kapan mau dikerjakan sebelum deadline dan pasang alarm lagu pilihanmu!"
          actionTitle="Jadwalkan Tugas Pertama"
          customIcon={<BellRing size={28} color={s.forest} strokeWidth={2.2} />}
          onActionPress={() => router.push('/task-manager/new' as any)}
        />
      ) : (
        <View style={styles.cardsStack}>
          {filteredTasks.map(renderTaskCard)}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    backgroundColor: s.cream,
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: 120,
    gap: space[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: s.card,
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...sproutShadow,
  },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: typography.headlineMedium.fontSize, lineHeight: typography.headlineLarge.lineHeight, letterSpacing: -0.6, color: s.ink, },
  headerSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  overviewCard: { paddingVertical: space[3], borderBottomWidth: stroke.hairline, borderBottomColor: colors.border, gap: space[3], },
  metricsGrid: {
    flexDirection: 'row',
    gap: space[2],
  },
  metricTile: { flex: 1, padding: space[2], alignItems: 'center', gap: space[0.5], borderRightWidth: stroke.hairline, borderRightColor: colors.border, },
  metricTinyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0.4,
    color: s.inkMuted,
    textAlign: 'center',
  },
  metricBigVal: {
    fontFamily: fontFamily.bold,
    fontSize: typography.titleLarge.fontSize,
    color: s.ink,
  },
  customSongQuickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.xl,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.successContainer,
  },
  customSongLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  musicSquircle: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSongBarTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  customSongBarSub: {
    fontFamily: fontFamily.regular,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  pickSongQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.sun,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
  },
  pickSongQuickBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
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
  taskCard: { backgroundColor: s.card, borderRadius: radius.md, padding: space[3], borderWidth: stroke.hairline, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: s.grape, gap: space[2], },
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
  cardTopRightActions: {
    maxWidth: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
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
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  execDateBox: {
    flex: 1,
    backgroundColor: colors.successContainer,
    borderRadius: radius.lg,
    padding: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.successContainer,
    gap: space[0.5],
  },
  deadlineDateBox: {
    flex: 1,
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
  bridgeArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    backgroundColor: s.cream,
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  testAlarmButton: {
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
  floatingFabContainer: {
    position: 'absolute',
    right: space[4],
    bottom: 24,
    zIndex: 30,
  },
  fabSquare: {
    width: 58,
    height: 58,
    borderRadius: radius.xl,
    backgroundColor: s.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: stroke.selected,
    borderColor: colors.warningContainer,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
  },
});
