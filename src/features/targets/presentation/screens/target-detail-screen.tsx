import { backOrHome } from '@/shared/utils/back-or-home';
import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Trash2,
  Plus,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily, radius, stroke, typography, touchTarget } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  Banner,
  Button,
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
              backOrHome();
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
          onActionPress={error ? refresh : backOrHome}
        />
      </Screen>
    );
  }

  const progress = Math.min(100, Math.max(0, target.progressPercent || 0));
  const completedStagesCount = stages.filter((st) => st.status === 'COMPLETED').length;
  const statusLabel =
    target.status === 'COMPLETED'
      ? 'Selesai'
      : target.status === 'PAUSED'
        ? 'Dijeda'
        : 'Berjalan';

  const formattedStartDate = formatShortDateId(target.startDate || target.createdAt, 'Hari Ini');
  const formattedTargetDate = formatShortDateId(target.targetDate, 'Fleksibel');
  const activeDays = calculateActiveDays(target.startDate || target.createdAt);

  return (
    <Screen
      scrollable
      style={styles.screenBg}
      floatingAction={
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
      }
      overlay={
        <>
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


      <FormScreenHeader title="Rincian Target" onBack={backOrHome}
        rightAction={
          <Pressable
            onPress={handleDeleteTarget}
            accessibilityRole="button"
            accessibilityLabel="Hapus target"
            style={styles.circleDeleteBtn}
          >
            <Trash2 size={17} color={colors.error} strokeWidth={2.2} />
          </Pressable>
        }
      />

      <View style={styles.overviewCard}>
        <View style={styles.metaTopRow}>
          <AppText variant="labelMedium" color="onSurfaceVariant">{target.categoryName || 'Umum'}</AppText>
          <AppText variant="labelMedium" color="primary">{statusLabel}</AppText>
        </View>
        <AppText variant="headlineLarge" accessibilityRole="header">{target.title}</AppText>
        {target.description ? <AppText color="onSurfaceVariant">{target.description}</AppText> : null}
        <View style={styles.detailMetrics}>
          <AppText>{target.completedTasks}/{target.totalTasks} tugas selesai</AppText>
          <AppText>{completedStagesCount}/{stages.length} tahap selesai</AppText>
        </View>
        <View style={styles.aggregationTrack}>
          <View style={[styles.aggregationFill, { width: `${progress}%` }]} />
        </View>
        <AppText variant="labelMedium" color="onSurfaceVariant">
          {target.totalTasks ? `${progress}% selesai` : 'Belum ada rencana'}
        </AppText>
        <AppText>Estimasi {target.totalEstimatedHours || 0} jam</AppText>
        <AppText>Tenggat {formattedTargetDate}</AppText>
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
  detailDates: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], marginVertical: space[2] },
  detailDateText: { fontSize: typography.labelMedium.fontSize, color: s.inkMuted },
  screenBg: {
    backgroundColor: s.cream,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  circleDeleteBtn: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.xl,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  overviewCard: { paddingVertical: space[3], gap: space[3], borderBottomWidth: stroke.hairline, borderBottomColor: colors.border, },
  metaTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space[2], flexWrap: 'wrap' },
  detailMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: space[2], flexWrap: 'wrap' },
  aggregationTrack: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  aggregationFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  // 2. Circular Progress & Momentum Gauge Card

  // 3. Rencana perjalanan (Waypoint Card)

  emptyStagesCard: {
    padding: space[5],
    gap: space[2],
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  emptyTitle: {
    color: s.ink,
    fontFamily: fontFamily.bold,
    fontSize: typography.titleMedium.fontSize,
  },
  emptyDesc: {
    marginBottom: space[2],
    maxWidth: 280,
    color: s.inkMuted,
    fontSize: typography.labelMedium.fontSize,
  },
  emptyBtn: {
    borderRadius: radius.pill,
  },
  fabSquare: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: s.sun, alignItems: 'center', justifyContent: 'center', borderWidth: stroke.hairline, borderColor: s.forest, },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
