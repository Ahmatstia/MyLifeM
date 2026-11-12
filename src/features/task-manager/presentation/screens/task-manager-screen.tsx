import React, { useState } from 'react';
import {
  View,
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
import { fontFamily, space } from '@/theme/tokens';
import {
  AppText,
  Banner,
  EmptyState,
  Screen,
  SproutCheck,
  WaveBackdrop,
  sproutShadow,
} from '@/shared/ui';
import {
  computeDeadlineBufferInfo,
  formatDayAndDateIndo,
  type ManagedTaskEntity,
  type TaskCategoryType,
} from '../../domain/entities/managed-task.entity';
import { AddManagedTaskModal } from '../components/add-managed-task-modal';
import { AlarmRingingModal } from '../components/alarm-ringing-modal';
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
      return 'Proyek';
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

  const renderTaskCard = (item: ManagedTaskEntity) => {
    const buffer = computeDeadlineBufferInfo(item, todayDate);
    const isAlarmLoud =
      item.alertMode === 'ALARM' || item.alertMode === 'BOTH';
    const isExecToday = item.executionDate === todayDate && !item.isCompleted;

    const bufferColors =
      buffer.tone === 'safe'
        ? { bg: '#E3F5EA', border: '#B9E4CA', text: '#166534' }
        : buffer.tone === 'tight'
          ? { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' }
          : buffer.tone === 'done'
            ? { bg: '#E8EFEA', border: '#D1DFD5', text: s.forest }
            : { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B' };

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
                ? `${getCategoryDefaultName(item.categoryType)} · ${item.courseOrContext}`
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
              onPress={() => deleteTask(item.id)}
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
          <View style={{ flex: 1, gap: 3 }}>
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
              <AppText style={styles.execBoxLabel}>JADWAL KERJAKAN</AppText>
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
              <CalendarClock size={12} color="#B84A27" strokeWidth={2.5} />
              <AppText style={styles.deadlineBoxLabel}>
                DEADLINE KUMPUL
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
                LANGKAH PENGERJAAN
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
                  🎵 Lagu: {item.alarmTrackName}
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
                  color="#FFFFFF"
                  fill="#FFFFFF"
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
          <AlarmRingingModal />
        </>
      }
    >
      <WaveBackdrop variant="home" height={285} />

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
            Atur jadwal pengerjaan sebelum deadline & alarm lagu kustom
          </AppText>
        </View>
      </View>

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
            <AppText style={styles.metricTinyLabel}>TUGAS AKTIF</AppText>
            <AppText style={styles.metricBigVal} tabularNums>
              {activeTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>KERJAKAN HARI INI</AppText>
            <AppText
              style={[styles.metricBigVal, { color: s.forest }]}
              tabularNums
            >
              {todayExecTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>ALARM AKTIF</AppText>
            <AppText
              style={[styles.metricBigVal, { color: '#B84A27' }]}
              tabularNums
            >
              {alarmEnabledTasks.length}
            </AppText>
          </View>

          <View style={styles.metricTile}>
            <AppText style={styles.metricTinyLabel}>TUNTAS</AppText>
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
                Koleksi Lagu Alarm Kustom ({customUploadedSongsCount} lagu HP)
              </AppText>
              <AppText style={styles.customSongBarSub} numberOfLines={1}>
                Gunakan lagu favoritmu agar langsung bangun saat jadwal tugas tiba
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
            ['ALARM_ONLY', `Mode Alarm 🔊 (${alarmEnabledTasks.length})`],
            ['TIGHT', 'Mepet Deadline'],
            ['DONE', `Selesai (${completedTasks.length})`],
          ] as const
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <Pressable
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
    borderRadius: 15,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#E7DFCC',
    alignItems: 'center',
    justifyContent: 'center',
    ...sproutShadow,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: s.ink,
  },
  headerSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  overviewCard: {
    backgroundColor: s.card,
    borderRadius: 28,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#EDE4D0',
    gap: space[3],
    ...sproutShadow,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricTile: {
    flex: 1,
    backgroundColor: s.cream,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EAE1CE',
    alignItems: 'center',
    gap: 2,
  },
  metricTinyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.4,
    color: s.inkMuted,
    textAlign: 'center',
  },
  metricBigVal: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: s.ink,
  },
  customSongQuickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#F3FAF5',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CFE8D8',
  },
  customSongLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  musicSquircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSongBarTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  customSongBarSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: s.inkMuted,
  },
  pickSongQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: s.sun,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pickSongQuickBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.ink,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  filterPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  filterPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  cardsStack: {
    gap: space[3],
  },
  taskCard: {
    backgroundColor: s.card,
    borderRadius: 28,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#EDE4D0',
    gap: space[3],
    ...sproutShadow,
  },
  taskCardCompleted: {
    opacity: 0.72,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: s.leafSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    maxWidth: '52%',
  },
  contextPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  cardTopRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bufferBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  bufferBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
  },
  deleteIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 23,
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
    gap: 6,
  },
  metaInlineText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  todaySyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: s.leafSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  todaySyncBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: s.forest,
  },
  dualDateBridge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  execDateBox: {
    flex: 1,
    backgroundColor: '#F1FAF4',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C8E6D2',
    gap: 2,
  },
  deadlineDateBox: {
    flex: 1,
    backgroundColor: '#FFF6F1',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3D2C1',
    gap: 2,
  },
  dateBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  execBoxLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: s.forest,
  },
  execBoxDateText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  execBoxTimeText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.forest,
  },
  deadlineBoxLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#B84A27',
  },
  deadlineBoxDateText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#7A2810',
  },
  deadlineBoxTimeText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: '#B84A27',
  },
  bridgeArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: s.cream,
    borderWidth: 1,
    borderColor: '#E5DEC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtasksBlock: {
    backgroundColor: s.cream,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE1CE',
    gap: 6,
  },
  subtasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subtasksHeaderTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: s.inkMuted,
  },
  subtasksHeaderCount: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  subtaskText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
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
    gap: 8,
    backgroundColor: '#F7F3E8',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#EAE2CE',
  },
  alarmModeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alarmIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
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
    fontSize: 11,
    color: s.ink,
  },
  alarmSongSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: s.forest,
  },
  footerButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testAlarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: s.sunSoft,
    borderWidth: 1,
    borderColor: s.sun,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testAlarmButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.ink,
  },
  focusGoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: s.forest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusGoButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
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
    borderRadius: 20,
    backgroundColor: s.sun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF6D6',
    shadowColor: '#8B6508',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
  },
});
