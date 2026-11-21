import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  Folder,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  Button,
  WaveBackdrop,
  SoftCard,
  SectionTitle,
} from '@/shared/ui';
import { useTargetDetail } from '../hooks/use-target-detail';
import { StageCard } from '@/features/stages/presentation/components/stage-card';
import { AddEditStageModal } from '@/features/stages/presentation/components/add-edit-stage-modal';
import { AddEditTaskModal } from '@/features/stages/presentation/components/add-edit-task-modal';
import type { TaskItemEntity } from '@/features/stages/domain/entities/stage.entity';

const s = colors.sprout;

export interface TargetDetailScreenProps {
  targetId: string;
}

function formatShortDateId(dateStr?: string | null, fallback = 'Fleksibel'): string {
  if (!dateStr) return fallback;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function calculateActiveDays(startDateStr?: string | null): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr);
  if (Number.isNaN(start.getTime())) return 1;
  const diffMs = Date.now() - start.getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export const TargetDetailScreen: React.FC<TargetDetailScreenProps> = ({ targetId }) => {
  const {
    target,
    stages,
    isLoading,
    error,
    refresh,
    addStage,
    editStage,
    removeStage,
    reorderStage,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus,
    deleteThisTarget,
  } = useTargetDetail(targetId);

  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<
    { id: string; name: string; description?: string | null } | undefined
  >(undefined);

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<TaskItemEntity | undefined>(undefined);

  const handleDeleteTarget = () => {
    Alert.alert(
      'Hapus Target',
      `Hapus target "${target?.title}" beserta tahapan, tugas, dan prioritas hariannya? Sesi fokus dan agenda dipertahankan dengan tautan yang dilepas.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Selamanya',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteThisTarget();
            if (ok) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleOpenAddTask = (stageId: string, stageName: string) => {
    setSelectedStageForTask({ id: stageId, name: stageName });
    setEditingTaskData(undefined);
    setTaskModalVisible(true);
  };

  const handleOpenEditTask = (task: TaskItemEntity, stageName: string) => {
    setSelectedStageForTask({ id: task.stageId, name: stageName });
    setEditingTaskData(task);
    setTaskModalVisible(true);
  };

  if (isLoading) {
    return (
      <Screen style={styles.screenBg}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={s.forest} />
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Memuat detail target...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !target) {
    return (
      <Screen style={styles.screenBg}>
        <Banner
          variant="error"
          message={error || 'Target tidak ditemukan.'}
          actionText={error ? 'Coba Lagi' : 'Kembali'}
          onActionPress={error ? refresh : () => router.back()}
        />
      </Screen>
    );
  }

  const progress = Math.min(100, Math.max(0, target.progressPercent || 0));
  const completedStagesCount = stages.filter((st) => st.status === 'COMPLETED').length;
  const statusLabel =
    target.status === 'COMPLETED'
      ? 'SELESAI'
      : target.status === 'PAUSED'
        ? 'DIJEDA'
        : 'SEDANG BERJALAN';

  const formattedStartDate = formatShortDateId(target.startDate || target.createdAt, 'Hari Ini');
  const formattedTargetDate = formatShortDateId(target.targetDate, 'Fleksibel');
  const activeDays = calculateActiveDays(target.startDate || target.createdAt);

  return (
    <Screen
      scrollable
      style={styles.screenBg}
      withBottomPadding={false}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          <View style={styles.floatingFabContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => {
                setEditingStage(undefined);
                setStageModalVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Tambah Tahap Baru"
              style={({ pressed }) => [
                styles.fabSquare,
                pressed && styles.fabSquarePressed,
              ]}
            >
              <Plus size={24} color={s.ink} strokeWidth={2.8} />
            </Pressable>
          </View>

          <AddEditStageModal
            visible={stageModalVisible}
            initialData={editingStage}
            onClose={() => setStageModalVisible(false)}
            onSubmit={async (name, description) => {
              if (editingStage) {
                return editStage(editingStage.id, name, description);
              } else {
                return addStage(name, description);
              }
            }}
          />

          {selectedStageForTask && (
            <AddEditTaskModal
              visible={taskModalVisible}
              stageId={selectedStageForTask.id}
              stageName={selectedStageForTask.name}
              initialData={editingTaskData}
              onClose={() => {
                setTaskModalVisible(false);
                setEditingTaskData(undefined);
              }}
              onSubmit={async (input) => {
                if (editingTaskData) {
                  return editTask(editingTaskData.id, input);
                } else {
                  return addTask({
                    stageId: selectedStageForTask.id,
                    name: input.name || '',
                    description: input.description,
                    priority: input.priority,
                    estimatedHours: input.estimatedHours,
                    status: input.status,
                  });
                }
              }}
            />
          )}
        </>
      }
    >
      <WaveBackdrop variant="home" height={285} />

      {/* TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.circleNavBtn}
        >
          <ArrowLeft size={20} color={s.ink} strokeWidth={2.4} />
        </Pressable>

        <AppText numberOfLines={1} style={styles.topBarTitle}>
          Rincian Target
        </AppText>

        <Pressable
          onPress={handleDeleteTarget}
          accessibilityRole="button"
          accessibilityLabel="Hapus target"
          style={styles.circleDeleteBtn}
        >
          <Trash2 size={17} color={colors.error} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* =====================================================================
          1. TARGET COMMAND & OVERVIEW CARD (Matched to Reference Image 1 Left)
         ===================================================================== */}
      <View style={styles.overviewCard}>
        {/* Top Meta Badges + UID */}
        <View style={styles.metaTopRow}>
          <View style={styles.metaBadgesLeft}>
            <View style={styles.categoryBadge}>
              <AppText style={styles.categoryBadgeText}>
                {(target.categoryName || 'UMUM').toUpperCase()}
              </AppText>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <AppText style={styles.statusBadgeText}>{statusLabel}</AppText>
            </View>
          </View>
        </View>

        {/* Main Title & Description */}
        <View style={styles.titleSection}>
          <AppText style={styles.targetTitleText}>{target.title}</AppText>
          <AppText style={styles.descriptionParagraph}>
            {target.description
              ? target.description
              : target.totalTasks > 0
                ? 'Selesaikan tugas satu per satu untuk mendekati tujuan.'
                : 'Tambahkan tahap pertama untuk mulai menyusun rencana.'}
          </AppText>
        </View>

        {/* 4-Tile Bento Metric Grid (2x2 on mobile) */}
        <View style={styles.bentoGrid}>
          {/* Tile 1: Kemajuan Tugas */}
          <View style={styles.bentoTile}>
            <AppText style={styles.bentoLabel}>KEMAJUAN TUGAS</AppText>
            <View style={styles.bentoValueRow}>
              <Check size={15} color="#1E8A52" strokeWidth={3} />
              <AppText style={[styles.bentoValueText, { color: '#1E8A52' }]} tabularNums>
                {`${target.completedTasks}/${target.totalTasks} Tugas`}
              </AppText>
            </View>
          </View>

          {/* Tile 2: Tahapan Ekspedisi */}
          <View style={styles.bentoTile}>
            <AppText style={styles.bentoLabel}>TAHAPAN</AppText>
            <View style={styles.bentoValueRow}>
              <Folder size={14} color="#7A52B8" fill="#E6DDF7" strokeWidth={2.3} />
              <AppText style={[styles.bentoValueText, { color: '#6A42A8' }]} tabularNums>
                {`${completedStagesCount}/${stages.length} Tahapan`}
              </AppText>
            </View>
          </View>

          {/* Tile 3: Total Investasi */}
          <View style={styles.bentoTile}>
            <AppText style={styles.bentoLabel}>ESTIMASI WAKTU</AppText>
            <View style={styles.bentoValueRow}>
              <Clock size={14} color="#1F6B62" strokeWidth={2.5} />
              <AppText style={[styles.bentoValueText, { color: '#1F6B62' }]} tabularNums>
                {`± ${target.totalEstimatedHours || 0}j`}
              </AppText>
            </View>
          </View>

          {/* Tile 4: Batas Akhir */}
          <View style={styles.bentoTile}>
            <AppText style={styles.bentoLabel}>BATAS AKHIR</AppText>
            <View style={styles.bentoValueRow}>
              <Calendar size={14} color="#B87314" strokeWidth={2.5} />
              <AppText style={[styles.bentoValueText, { color: '#B87314' }]} numberOfLines={1}>
                {formattedTargetDate}
              </AppText>
            </View>
          </View>
        </View>

        {/* Bottom Aggregation Progress Bar */}
        <View style={styles.aggregationBlock}>
          <View style={styles.aggregationLabelRow}>
            <View style={styles.aggregationLeft}>
              <TrendingUp size={13} color="#1E8A52" strokeWidth={2.6} />
              <AppText style={styles.aggregationTitle}>PROGRES TUGAS</AppText>
            </View>
            <AppText style={styles.aggregationPercent} tabularNums>
              {target.totalTasks > 0 ? `${progress}% TUNTAS` : 'Belum ada rencana'}
            </AppText>
          </View>

          <View style={styles.aggregationTrack}>
            <View
              style={[
                styles.aggregationFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.detailDates}>
        <AppText style={styles.detailDateText}>Mulai {formattedStartDate}</AppText>
        <AppText style={styles.detailDateText}>{activeDays} hari berjalan</AppText>
      </View>

      <SectionTitle
        title="Langkah berikutnya"
        hint={`${stages.length} tahap`}
      />

      {stages.length === 0 ? (
        <SoftCard style={styles.emptyStagesCard}>
          <AppText align="center" style={styles.emptyTitle}>
            Belum Ada Tahapan
          </AppText>
          <AppText align="center" style={styles.emptyDesc}>
            {`Mulai pecah target "${target.title}" menjadi beberapa fase berurutan agar lebih mudah dikerjakan.`}
          </AppText>
          <Button
            title="Buat Tahap Pertama"
            variant="filled"
            size="standard"
            onPress={() => {
              setEditingStage(undefined);
              setStageModalVisible(true);
            }}
            leftIcon={<Plus size={16} color={colors.onPrimary} />}
            style={styles.emptyBtn}
          />
        </SoftCard>
      ) : (
        stages.map((stage, idx) => (
          <StageCard
            key={stage.id}
            stage={stage}
            stepNumber={idx + 1}
            isFirst={idx === 0}
            isLast={idx === stages.length - 1}
            onMoveUp={() => reorderStage(stage.id, 'UP')}
            onMoveDown={() => reorderStage(stage.id, 'DOWN')}
            onEditStage={() => {
              setEditingStage({
                id: stage.id,
                name: stage.name,
                description: stage.description,
              });
              setStageModalVisible(true);
            }}
            onDeleteStage={() => removeStage(stage.id)}
            onAddTask={() => handleOpenAddTask(stage.id, stage.name)}
            onEditTask={(task) => handleOpenEditTask(task, stage.name)}
            onDeleteTask={(task) => removeTask(task)}
            onToggleTaskStatus={(taskId, currentStatus) =>
              toggleTaskStatus(taskId, currentStatus)
            }
          />
        ))
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  detailDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 8 },
  detailDateText: { fontSize: 11, color: s.inkMuted },
  screenBg: {
    backgroundColor: s.cream,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  topBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[1],
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    color: s.ink,
    fontSize: 17,
  },
  circleNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: s.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE3D8',
  },
  circleDeleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: '#FFF2F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3D0CA',
  },
  scrollContent: {
    paddingBottom: 100,
    gap: space[3],
  },

  // 1. Overview Command Card
  overviewCard: { paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadgesLeft: {
    maxWidth: '100%',
    minWidth: 0,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#EAE4F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6CBF0',
  },
  categoryBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.7,
    color: '#5B3E96',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E1F4E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BCE5CC',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E8A52',
  },
  statusBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: '#176B3F',
  },

  titleSection: {
    gap: 6,
  },
  targetTitleText: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.6, color: s.ink, },
  descriptionParagraph: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 19, color: s.inkMuted, },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bentoTile: { flexGrow: 1, flexBasis: '45%', minWidth: 0, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: s.creamDeep, borderRadius: 10, gap: 6, },
  bentoLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: s.inkMuted,
  },
  bentoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bentoValueText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  aggregationBlock: {
    gap: 8,
    paddingTop: 2,
  },
  aggregationLabelRow: {
    gap: 8,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aggregationLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aggregationTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 10.5,
    letterSpacing: 0.7,
    color: s.inkMuted,
  },
  aggregationPercent: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#1E8A52',
  },
  aggregationTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#E8E0CC',
    overflow: 'hidden',
  },
  aggregationFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1E8A52',
  },

  // 2. Circular Progress & Momentum Gauge Card

  // 3. Rencana perjalanan (Waypoint Card)

  emptyStagesCard: {
    padding: space[5],
    gap: space[2],
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyTitle: {
    color: s.ink,
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  emptyDesc: {
    marginBottom: space[2],
    maxWidth: 280,
    color: s.inkMuted,
    fontSize: 13,
  },
  emptyBtn: {
    borderRadius: 999,
  },
  floatingFabContainer: {
    position: 'absolute',
    right: space[4],
    bottom: space[4],
    zIndex: 20,
  },
  fabSquare: { width: 48, height: 48, borderRadius: 14, backgroundColor: s.sun, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: s.forest, },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
