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
  CheckCircle2,
  Flame,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
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
    <Screen withBottomPadding={false} style={styles.screenRoot}>
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

        {/* 4. Output / Deliverable Konkret Banner (Neo-Playful Aesthetic) */}
        <View style={styles.deliverableCard}>
          <View style={styles.deliverableIconWrapper}>
            <Award size={20} color="#FFFFFF" />
          </View>
          <View style={styles.deliverableContent}>
            <View style={styles.deliverableHeaderRow}>
              <AppText
                variant="labelSmall"
                style={styles.deliverableTag}
              >
                OUTPUT / DELIVERABLE KONKRET
              </AppText>
              <View style={styles.versionBadge}>
                <AppText variant="labelSmall" style={styles.versionText}>
                  v1.0
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMedium" style={styles.deliverableText}>
              Artefak nyata, repositori kerja, atau hasil terukur yang siap dirilis dan diverifikasi saat siklus proyek selesai.
            </AppText>
          </View>
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

        {/* 6. Twin Summary Bento Cards (Peach & Periwinkle Palette) */}
        <View style={styles.bentoRow}>
          {/* Left Bento: Progres Tugas */}
          <View style={styles.leftBento}>
            <View style={styles.bentoHeader}>
              <View style={styles.bentoIconPeach}>
                <CheckCircle2 size={16} color="#8F4E00" />
              </View>
              <AppText variant="labelSmall" style={styles.bentoLabelPeach}>
                PROGRES
              </AppText>
            </View>
            <View style={styles.bentoBody}>
              <AppText
                variant="displayLarge"
                tabularNums
                style={styles.bentoNumberPeach}
              >
                {project.taskSummary.totalTasks
                  ? `${project.taskSummary.progressPercent}%`
                  : 'Belum ada rencana'}
              </AppText>
              <AppText variant="bodySmall" style={styles.bentoSubPeach}>
                {project.taskSummary.completedTasks} dari{' '}
                {project.taskSummary.totalTasks} tugas selesai
              </AppText>
            </View>
            <View style={styles.bentoProgressTrack}>
              <ProgressBar
                progress={project.taskSummary.progressPercent}
                color="#8F4E00"
                height={6}
              />
            </View>
          </View>

          {/* Right Bento: Waktu Fokus */}
          <View style={styles.rightBento}>
            <View style={styles.bentoHeader}>
              <View style={styles.bentoIconLavender}>
                <Flame size={16} color="#5052BA" />
              </View>
              <AppText variant="labelSmall" style={styles.bentoLabelLavender}>
                ESTIMASI
              </AppText>
            </View>
            <View style={styles.bentoBody}>
              <View style={styles.bentoTimeRow}>
                <AppText
                  variant="displayLarge"
                  tabularNums
                  style={styles.bentoNumberLavender}
                >
                  {project.taskSummary.totalEstimatedHours}
                </AppText>
                <AppText
                  variant="headlineSmall"
                  style={styles.bentoUnitLavender}
                >
                  jam
                </AppText>
              </View>
              <AppText variant="bodySmall" style={styles.bentoSubLavender}>
                {stages.length} tahap terstruktur
              </AppText>
            </View>
            <View style={styles.sparkBadge}>
              <Clock size={12} color="#5052BA" />
              <AppText variant="labelSmall" style={styles.sparkBadgeText}>
                Ritme Terjadwal
              </AppText>
            </View>
          </View>
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

        <View style={{ height: space[12] }} />
      </ScrollView>

      {/* 8. Sticky Floating Bottom Action Capsule */}
      <View style={styles.floatingActionContainer} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            setEditingStage(undefined);
            setStageModalVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Tambah Tahapan Baru"
          style={styles.floatingActionCapsule}
        >
          <View style={styles.floatingActionIcon}>
            <Plus size={18} color="#151718" />
          </View>
          <View style={styles.floatingActionText}>
            <AppText variant="labelLarge" style={styles.floatingActionTitle}>
              Tambah Tahapan Baru
            </AppText>
            <AppText variant="bodySmall" style={styles.floatingActionSub}>
              Pecah proyek menjadi langkah nyata
            </AppText>
          </View>
        </Pressable>
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
  screenRoot: {
    backgroundColor: '#F9F9FD',
  },
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
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    marginBottom: space[2],
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    flex: 1,
  },
  topBarTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#151718',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: '#EEEDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingBottom: space[16],
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginVertical: space[2],
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E1DFFF',
    paddingHorizontal: space[3],
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  targetBadgeText: {
    color: '#1F1D8A',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  deadlinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFDCC1',
    paddingHorizontal: space[3],
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  deadlineBadgeText: {
    color: '#6C3A00',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  headingSection: {
    marginVertical: space[3],
  },
  projectTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: '#151718',
    marginBottom: space[1],
  },
  projectDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: '#55585E',
  },
  deliverableCard: {
    flexDirection: 'row',
    gap: space[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEFF4',
    borderRadius: radius.xl,
    padding: space[4],
    marginBottom: space[4],
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  deliverableIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#5052BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableContent: {
    flex: 1,
  },
  deliverableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  deliverableTag: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#5052BA',
  },
  versionBadge: {
    backgroundColor: '#EEEDF2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  versionText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#464552',
  },
  deliverableText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#2A2C30',
  },
  statusSection: {
    marginBottom: space[4],
  },
  statusSectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#6A6D74',
    marginBottom: space[2],
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8E8EC',
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  segmentButtonActive: {
    backgroundColor: '#151718',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DCF763',
  },
  segmentText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#5A5D66',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: space[3],
    marginBottom: space[2],
  },
  leftBento: {
    flex: 1,
    backgroundColor: '#FFE8DB',
    borderRadius: radius.xl,
    padding: space[4],
    justifyContent: 'space-between',
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoIconPeach: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: '#FFA858',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabelPeach: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#6C3A00',
  },
  bentoBody: {
    marginVertical: space[2],
  },
  bentoNumberPeach: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#2E1500',
  },
  bentoSubPeach: {
    fontSize: 11,
    color: '#6C3A00',
    marginTop: 2,
  },
  bentoProgressTrack: {
    marginTop: space[1],
  },
  rightBento: {
    flex: 1,
    backgroundColor: '#E8E8FF',
    borderRadius: radius.xl,
    padding: space[4],
    justifyContent: 'space-between',
  },
  bentoIconLavender: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: '#C1C1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabelLavender: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#1F1D8A',
  },
  bentoTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bentoNumberLavender: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: '#08006C',
  },
  bentoUnitLavender: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#08006C',
  },
  bentoSubLavender: {
    fontSize: 11,
    color: '#3838A1',
    marginTop: 2,
  },
  sparkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: space[1],
  },
  sparkBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#5052BA',
  },
  footnoteText: {
    fontSize: 11,
    lineHeight: 16,
    marginVertical: space[2],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[4],
    marginBottom: space[3],
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: '#151718',
  },
  emptyStagesCard: {
    padding: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: '#EFEFF4',
  },
  emptyDesc: {
    marginTop: space[1],
    marginBottom: space[4],
    maxWidth: 280,
  },
  emptyBtn: {
    borderRadius: radius.pill,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: space[4],
    left: space[4],
    right: space[4],
    alignItems: 'center',
  },
  floatingActionCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: '#151718',
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: space[4],
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  floatingActionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: '#DCF763',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingActionText: {
    flex: 1,
  },
  floatingActionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  floatingActionSub: {
    fontSize: 11,
    color: '#9E9EA7',
  },
});
