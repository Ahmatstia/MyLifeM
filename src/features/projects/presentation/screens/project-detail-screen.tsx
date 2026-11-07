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
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Button,
  Banner,
  WaveBackdrop,
  SoftCard,
  PillTabs,
  SectionTitle,
  MascotCozy,
  sproutShadow,
} from '@/shared/ui';
import { useProjectDetail } from '../hooks/use-project-detail';
import { StageCard } from '@/features/stages/presentation/components/stage-card';
import { AddEditStageModal } from '@/features/stages/presentation/components/add-edit-stage-modal';
import { AddEditTaskModal } from '@/features/stages/presentation/components/add-edit-task-modal';
import type { TaskItemEntity } from '@/features/stages/domain/entities/stage.entity';
import type { ProjectStatus } from '../../domain/entities/project.entity';

const s = colors.sprout;

export interface ProjectDetailScreenProps {
  projectId: string;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'PLANNING', label: 'Rencana' },
  { value: 'ON_HOLD', label: 'Ditunda' },
  { value: 'COMPLETED', label: 'Selesai' },
];

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
    updateStatus,
    deleteThisProject,
  } = useProjectDetail(projectId);

  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<
    { id: string; name: string; description?: string | null } | undefined
  >(undefined);

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<
    TaskItemEntity | undefined
  >(undefined);

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
      <Screen style={styles.screenRoot}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={s.forest} />
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Memuat detail proyek...
          </AppText>
        </View>
      </Screen>
    );
  }

  if (error || !project) {
    return (
      <Screen style={styles.screenRoot}>
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
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenRoot}
      contentContainerStyle={styles.scrollContent}
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
      <WaveBackdrop variant="home" height={285} />

      {/* 1. Header Navigation (Non-sticky) */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.circleButton}
        >
          <ArrowLeft size={20} color={s.ink} />
        </Pressable>

        <AppText style={styles.topBarTitle} numberOfLines={1}>
          Detail Proyek
        </AppText>

        <Pressable
          onPress={handleDeleteProject}
          accessibilityRole="button"
          accessibilityLabel="Hapus proyek"
          style={styles.circleDeleteBtn}
        >
          <Trash2 size={17} color={colors.error} />
        </Pressable>
      </View>

      {/* Cozy Mascot Illustration */}
        <View style={styles.cozyHeroWrap}>
          <MascotCozy width={250} height={168} />
        </View>

        {/* Curved Storybook Detail Card */}
        <View style={styles.detailSheetCard}>
          <View style={styles.detailHeaderRow}>
            <View style={styles.greenCheckCircle}>
              <Check size={24} color="#FFFFFF" strokeWidth={3.2} />
            </View>

            <View style={styles.detailTitleCol}>
              <AppText style={styles.projectTitle}>{project.title}</AppText>
              <AppText style={styles.projectMetaSub}>
                {project.targetTitle ? project.targetTitle : 'Proyek Mandiri'} ·{' '}
                {project.taskSummary.totalTasks > 0
                  ? `${project.taskSummary.totalEstimatedHours} jam · ${project.taskSummary.progressPercent}%`
                  : 'Belum ada rencana'}
              </AppText>
            </View>
          </View>

          {project.description ? (
            <AppText style={styles.projectDesc}>{project.description}</AppText>
          ) : null}

          <PillTabs
            options={STATUS_OPTIONS}
            value={project.status}
            onChange={updateStatus}
          />

          {/* Celebration / Progress Pill Banner */}
          <View style={styles.celebrationBanner}>
            <View style={styles.celebrationIconCircle}>
              <Check size={20} color="#FFFFFF" strokeWidth={3} />
            </View>
            <View style={styles.celebrationTextCol}>
              <AppText style={styles.celebrationTitle}>
                {project.status === 'COMPLETED'
                  ? 'Tugas Selesai!'
                  : `${project.taskSummary.completedTasks}/${project.taskSummary.totalTasks} Tugas Selesai!`}
              </AppText>
              <AppText style={styles.celebrationSub}>
                Kerja bagus, terus semangat!
              </AppText>
            </View>
          </View>
        </View>

        {/* Milestone & Task Checklist Section */}
        <SectionTitle
          title="Tahapan Proyek"
          hint={`${stages.length} tahap`}
          actionLabel="Tambah Tahap"
          onAction={() => {
            setEditingStage(undefined);
            setStageModalVisible(true);
          }}
        />

        {stages.length === 0 ? (
          <SoftCard style={styles.emptyStagesCard}>
            <AppText style={styles.emptyTitle} align="center">
              Belum Ada Tahapan
            </AppText>
            <AppText align="center" style={styles.emptyDesc}>
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

        <View style={{ height: space[4] }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
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
    fontSize: 17,
    color: s.ink,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: s.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D0',
  },
  circleDeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3D0CA',
  },
  scrollContent: {
    paddingBottom: 90,
    gap: space[3],
  },
  cozyHeroWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: -14,
    zIndex: 2,
  },
  detailSheetCard: {
    backgroundColor: s.card,
    borderRadius: 34,
    padding: space[5],
    borderWidth: 1,
    borderColor: '#F1EADA',
    gap: space[4],
    ...sproutShadow,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  greenCheckCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B9B5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitleCol: {
    flex: 1,
    gap: 2,
  },
  projectTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: s.ink,
  },
  projectMetaSub: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: s.inkMuted,
  },
  projectDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: s.ink,
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: '#F4EFE2',
    borderRadius: 26,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  celebrationIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3B9B5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationTextCol: {
    flex: 1,
    gap: 2,
  },
  celebrationTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: s.ink,
  },
  celebrationSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  emptyStagesCard: {
    padding: space[5],
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  emptyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: s.ink,
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
});
