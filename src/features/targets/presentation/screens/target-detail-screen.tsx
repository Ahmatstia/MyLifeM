import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Banner } from '@/shared/ui/banner';
import { useTargetDetail } from '../hooks/use-target-detail';
import { StageCard } from '@/features/stages/presentation/components/stage-card';
import { AddEditStageModal } from '@/features/stages/presentation/components/add-edit-stage-modal';
import { AddEditTaskModal } from '@/features/stages/presentation/components/add-edit-task-modal';
import type { TaskItemEntity } from '@/features/stages/domain/entities/stage.entity';

export interface TargetDetailScreenProps {
  targetId: string;
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

  // Stage Modal State
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<{ id: string; name: string; description?: string | null } | undefined>(undefined);

  // Task Modal State
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{ id: string; name: string } | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<TaskItemEntity | undefined>(undefined);

  const handleDeleteTarget = () => {
    Alert.alert(
      'Hapus Target',
      `Apakah kamu yakin ingin menghapus target "${target?.title}" beserta seluruh tahapan dan tugas di dalamnya?`,
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
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.loadingText}>
            Memuat detail target...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !target) {
    return (
      <Screen>
        <Banner
          variant="error"
          message={error || 'Target tidak ditemukan.'}
          actionText={error ? 'Coba Lagi' : 'Kembali'}
          onActionPress={error ? refresh : () => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* TopBar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>

        <AppText variant="titleMedium" numberOfLines={1} style={styles.topBarTitle}>
          {target.title}
        </AppText>

        <Pressable
          onPress={handleDeleteTarget}
          accessibilityRole="button"
          accessibilityLabel="Hapus target"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteTopButton}
        >
          <Trash2 size={20} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Target Header Info */}
        <View style={styles.headingSection}>
          <View style={styles.categoryPill}>
            <AppText variant="labelSmall" color="primary">
              Kategori: {target.categoryName}
            </AppText>
          </View>
          <AppText variant="headlineMedium" style={styles.targetTitle}>
            {target.title}
          </AppText>
          {target.description ? (
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.targetDesc}>
              {target.description}
            </AppText>
          ) : null}
        </View>

        {/* Stats Row (2 Kolom Marshmallow) */}
        <View style={styles.statsRow}>
          <Card variant="elevated" style={styles.statCol}>
            <AppText variant="labelSmall" color="onSurfaceVariant">
              Progres Target
            </AppText>
            <AppText variant="headlineLarge" color="primary" tabularNums style={styles.statValue}>
              {target.progressPercent}%
            </AppText>
            <ProgressBar
              progress={target.progressPercent}
              color={colors.primary}
              height={6}
            />
          </Card>

          <Card variant="elevated" style={styles.statCol}>
            <AppText variant="labelSmall" color="onSurfaceVariant">
              Penyelesaian Tugas
            </AppText>
            <AppText variant="headlineLarge" color="onSurface" tabularNums style={styles.statValue}>
              {target.completedTasks}/{target.totalTasks}
            </AppText>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Total {target.totalEstimatedHours} jam • {stages.length} tahap
            </AppText>
          </Card>
        </View>

        {/* Section Header: Tahapan */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <AppText variant="titleLarge">Tahapan Target</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Urutan fase untuk mencapai tujuanmu
            </AppText>
          </View>

          <Button
            title="+ Tambah Tahap"
            variant="tonal"
            size="compact"
            onPress={() => {
              setEditingStage(undefined);
              setStageModalVisible(true);
            }}
          />
        </View>

        {/* Stages List */}
        {stages.length === 0 ? (
          <View style={styles.emptyStagesCard}>
            <AppText variant="titleMedium" align="center">
              Belum Ada Tahapan
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant" align="center" style={styles.emptyDesc}>
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
          </View>
        ) : (
          stages.map((stage, idx) => (
            <StageCard
              key={stage.id}
              stage={stage}
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
      </ScrollView>

      {/* Add / Edit Stage Modal */}
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

      {/* Add / Edit Task Modal */}
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  loadingText: {
    letterSpacing: -0.2,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: space[2],
  },
  deleteTopButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: space[10],
  },
  headingSection: {
    marginBottom: space[3],
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    marginBottom: space[2],
  },
  targetTitle: {
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  targetDesc: {
    marginTop: 2,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space[3],
    marginBottom: space[4],
  },
  statCol: {
    flex: 1,
    padding: space[4],
    borderRadius: radius.xl,
  },
  statValue: {
    marginVertical: space[1],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[3],
    marginTop: space[2],
  },
  emptyStagesCard: {
    padding: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  emptyDesc: {
    marginTop: space[1],
    marginBottom: space[4],
    maxWidth: 280,
  },
  emptyBtn: {
    borderRadius: radius.pill,
  },
});
