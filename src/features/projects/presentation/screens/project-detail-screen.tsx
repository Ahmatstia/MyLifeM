import React, { useState } from 'react';
import {
  View,
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
import { useProjectDetail } from '../hooks/use-project-detail';
import { StageCard } from '@/features/stages/presentation/components/stage-card';
import { AddEditStageModal } from '@/features/stages/presentation/components/add-edit-stage-modal';
import { AddEditTaskModal } from '@/features/stages/presentation/components/add-edit-task-modal';
import type { TaskItemEntity } from '@/features/stages/domain/entities/stage.entity';

export interface ProjectDetailScreenProps {
  projectId: string;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
}) => {
  const {
    project,
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
    deleteThisProject,
  } = useProjectDetail(projectId);

  // Stage Modal State
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<{ id: string; name: string; description?: string | null } | undefined>(undefined);

  // Task Modal State
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{ id: string; name: string } | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<TaskItemEntity | undefined>(undefined);

  const handleDeleteProject = () => {
    Alert.alert(
      'Hapus Proyek',
      `Hapus proyek "${project?.title}" beserta tahapan, tugas, dan prioritas hariannya? Sesi fokus dan agenda tetap disimpan dengan tautan yang dilepas.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Selamanya',
          style: 'destructive',
          onPress: async () => {
            if (await deleteThisProject()) router.back();
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
            Memuat detail proyek...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !project) {
    return (
      <Screen>
        <Banner
          variant="error"
          message={error || 'Proyek tidak ditemukan atau telah dihapus.'}
          actionText={error ? 'Coba Lagi' : 'Kembali'}
          onActionPress={error ? refresh : () => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen withBottomPadding={false}>
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
          {project.title}
        </AppText>

        <Pressable
          onPress={handleDeleteProject}
          accessibilityRole="button"
          accessibilityLabel="Hapus proyek"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteTopButton}
        >
          <Trash2 size={20} color={colors.error} />
        </Pressable>
      </View>

      <View style={styles.scrollContent}>
        {/* Project Heading & Description */}
        <View style={styles.headingSection}>
          <AppText variant="headlineMedium" style={styles.projectTitle}>
            {project.title}
          </AppText>
          {project.targetTitle && (
            <View style={styles.targetPill}>
              <AppText variant="labelSmall" color="primary">
                Terkait Target: {project.targetTitle}
              </AppText>
            </View>
          )}
          {project.description && (
            <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.descText}>
              {project.description}
            </AppText>
          )}
        </View>

        {/* Stats Row (2 Kolom Marshmallow) */}
        <View style={styles.statsRow}>
          <Card variant="highlight" style={styles.statCol}>
            <AppText variant="labelSmall" color="onSurfaceVariant">
              Progres rencana
            </AppText>
            <AppText variant="headlineLarge" color="primary" tabularNums style={styles.statValue}>
              {project.taskSummary.totalTasks ? `${project.taskSummary.progressPercent}%` : 'Belum ada rencana'}
            </AppText>
            <ProgressBar
              progress={project.taskSummary.progressPercent}
              color={colors.primary}
              height={6}
            />
          </Card>

          <Card variant="elevated" style={styles.statCol}>
            <AppText variant="labelSmall" color="onSurfaceVariant">
              Tugas Selesai
            </AppText>
            <AppText variant="headlineLarge" color="onSurface" tabularNums style={styles.statValue}>
              {project.taskSummary.completedTasks}/{project.taskSummary.totalTasks}
            </AppText>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              {stages.length} tahap • {project.taskSummary.totalEstimatedHours} jam
            </AppText>
          </Card>
        </View>

        <AppText variant="bodySmall" color="onSurfaceVariant">Tugas dibatalkan tidak dihitung. Persen menunjukkan progres rencana, bukan penguasaan keterampilan atau pencapaian hasil akhir.</AppText>

        {/* Section Header: Tahapan Proyek */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <AppText variant="titleLarge">Tahapan Proyek</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Urutan fase konkret hingga proyek selesai
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
              {`Pecah proyek "${project.title}" menjadi tahapan terukur untuk memulai pengerjaan.`}
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
      </View>

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
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  backButton: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: space[2],
  },
  deleteTopButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: space[10],
  },
  headingSection: {
    marginBottom: space[3],
  },
  projectTitle: {
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  targetPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    marginVertical: space[1],
  },
  descText: {
    marginTop: 2,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
    marginBottom: space[4],
  },
  statCol: {
    flex: 1,
    minWidth: 144,
    padding: space[4],
    borderRadius: radius.xl,
  },
  statValue: {
    marginVertical: space[1],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
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
