import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Target as TargetIcon,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Banner } from '@/shared/ui/banner';
import { useProjectDetail } from '../hooks/use-project-detail';
import { StageCard } from '@/features/stages/presentation/components/stage-card';
import { AddEditStageModal } from '@/features/stages/presentation/components/add-edit-stage-modal';
import { AddEditTaskModal } from '@/features/stages/presentation/components/add-edit-task-modal';
import type { TaskItemEntity } from '@/features/stages/domain/entities/stage.entity';
import type { ProjectStatus } from '../../domain/entities/project.entity';

export interface ProjectDetailScreenProps {
  projectId: string;
}

const STATUS_ITEMS: { key: ProjectStatus; label: string }[] = [
  { key: 'ACTIVE', label: 'Aktif' },
  { key: 'PLANNING', label: 'Rencana' },
  { key: 'ON_HOLD', label: 'Ditunda' },
  { key: 'COMPLETED', label: 'Selesai' },
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

  // Stage Modal State
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingStage, setEditingStage] = useState<
    { id: string; name: string; description?: string | null } | undefined
  >(undefined);

  // Task Modal State
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
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText
            variant="bodyMedium"
            color="onSurfaceVariant"
            style={styles.loadingText}
          >
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

  const currentStatus = project.status;

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenRoot}>
      {/* 1. Header Navigation */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.circleButton}
          >
            <ArrowLeft size={20} color={colors.onSurface} />
          </Pressable>
          <AppText variant="titleMedium" style={styles.topBarTitle}>
            Detail Proyek
          </AppText>
        </View>

        <Pressable
          onPress={handleDeleteProject}
          accessibilityRole="button"
          accessibilityLabel="Hapus proyek"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.circleButton}
        >
          <Trash2 size={18} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Target & Deadline Badges */}
        <View style={styles.badgeRow}>
          {project.targetTitle ? (
            <View style={styles.targetBadge}>
              <TargetIcon size={14} color="#1F1D8A" />
              <AppText
                variant="labelMedium"
                style={styles.targetBadgeText}
                numberOfLines={1}
              >
                Terkait: {project.targetTitle}
              </AppText>
            </View>
          ) : (
            <View style={styles.targetBadge}>
              <Sparkles size={14} color="#1F1D8A" />
              <AppText variant="labelMedium" style={styles.targetBadgeText}>
                Eksplorasi Mandiri
              </AppText>
            </View>
          )}

          <View style={styles.deadlinBadge}>
            <Calendar size={13} color="#6C3A00" />
            <AppText variant="labelMedium" style={styles.deadlineBadgeText}>
              {project.targetDate ? project.targetDate : 'Jangka Panjang'}
            </AppText>
          </View>
        </View>

        {/* 3. Title & Subtitle */}
        <View style={styles.headingSection}>
          <AppText variant="headlineLarge" style={styles.projectTitle}>
            {project.title}
          </AppText>
          {project.description ? (
            <AppText
              variant="bodyMedium"
              color="onSurfaceVariant"
              style={styles.projectDesc}
            >
              {project.description}
            </AppText>
          ) : null}
        </View>

        {/* 5. Status Lifecycle Selector (Playful Segmented Capsule) */}
        <View style={styles.statusSection}>
          <AppText
            variant="labelMedium"
            color="onSurfaceVariant"
            style={styles.statusSectionTitle}
          >
            Status Siklus Proyek
          </AppText>
          <View style={styles.segmentedContainer}>
            {STATUS_ITEMS.map((item) => {
              const isSelected = currentStatus === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => updateStatus(item.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonActive,
                  ]}
                >
                  {isSelected && <View style={styles.statusDotActive} />}
                  <AppText
                    variant="labelMedium"
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextActive,
                    ]}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <AppText variant="labelMedium" color="onSurfaceVariant">PROGRES RENCANA</AppText>
            <AppText variant="titleLarge" style={styles.summaryPercent} tabularNums>
              {project.taskSummary.totalTasks ? `${project.taskSummary.progressPercent}%` : 'Belum ada rencana'}
            </AppText>
          </View>
          <ProgressBar progress={project.taskSummary.progressPercent} height={5} />
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {project.taskSummary.completedTasks}/{project.taskSummary.totalTasks} tugas selesai · {stages.length} tahap · estimasi {project.taskSummary.totalEstimatedHours} jam
          </AppText>
        </View>

        {/* Disclaimer Note (preserves test requirement) */}
        <AppText
          variant="bodySmall"
          color="onSurfaceVariant"
          style={styles.footnoteText}
        >
          Tugas dibatalkan tidak dihitung. Persen menunjukkan progres rencana, bukan penguasaan keterampilan atau pencapaian hasil akhir.
        </AppText>

        {/* 7. Milestone & Task Checklist Section */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleBlock}>
            <AppText variant="titleMedium" style={styles.sectionTitle}>
              Milestone & Checklist
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {stages.length} Tahap • {project.taskSummary.totalTasks} Tugas Terdaftar
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
            <AppText
              variant="bodySmall"
              color="onSurfaceVariant"
              align="center"
              style={styles.emptyDesc}
            >
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

        <View style={{ height: space[4] }} />
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
  screenRoot: { backgroundColor: '#FCF8FF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
  loadingText: { letterSpacing: -0.2 },
  topBar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[2] },
  topBarLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  topBarTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: '#1E1E2E' },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FAF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  scrollContent: { paddingBottom: space[4], gap: space[2] },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  targetBadge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  targetBadgeText: { color: '#805600', fontFamily: fontFamily.bold, fontSize: 11 },
  deadlinBadge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  deadlineBadgeText: { color: '#504535', fontFamily: fontFamily.medium, fontSize: 11 },
  headingSection: { marginVertical: space[2] },
  projectTitle: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3, color: '#1E1E2E', marginBottom: 4 },
  projectDesc: { fontSize: 14, lineHeight: 20, color: '#504535' },
  statusSection: { marginBottom: space[2] },
  statusSectionTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: '#1E1E2E', marginBottom: space[1] },
  segmentedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FAF5EB',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    padding: 3,
    gap: 3,
  },
  segmentButton: { minHeight: 36, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 6, borderRadius: 999 },
  segmentButtonActive: {
    backgroundColor: '#E8A838', // Custard Gold
    boxShadow: '1.5px 1.5px 0px #1E1E2E',
  },
  statusDotActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E1E2E' },
  segmentText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#504535' },
  segmentTextActive: { color: '#1E1E2E' },
  summaryCard: {
    gap: space[2],
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
    padding: space[3],
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryPercent: { color: '#805600', fontFamily: fontFamily.bold },
  footnoteText: { fontSize: 11, lineHeight: 16, marginVertical: space[1], color: '#504535' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[2], marginTop: space[2], marginBottom: space[1] },
  sectionTitleBlock: { flex: 1 },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: '#1E1E2E' },
  emptyStagesCard: {
    padding: space[4],
    gap: space[2],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  emptyDesc: { marginBottom: space[2], maxWidth: 280, color: '#504535' },
  emptyBtn: { borderRadius: 999 },
});
