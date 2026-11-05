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
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, Button, ProgressBar } from '@/shared/ui';
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
      `Hapus target "${target?.title}" beserta tahapan, tugas langsung, dan prioritas hariannya? Proyek terkait tetap disimpan. Sesi fokus dan agenda dipertahankan dengan tautan yang dilepas.`,
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
          <ActivityIndicator size="large" color={colors.primary} />
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

  return (
    <Screen scrollable={false} style={styles.screenBg} withBottomPadding={false}>
      {/* TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.circleNavBtn}
        >
          <ArrowLeft size={18} color={colors.onSurface} strokeWidth={2.4} />
        </Pressable>

        <AppText variant="titleMedium" numberOfLines={1} style={styles.topBarTitle}>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TARGET HEADER PROFILE */}
        <View style={styles.headerProfileSection}>
          <View style={styles.metaBadgeRow}>
            <View style={styles.categoryBadge}>
              <View style={styles.categoryDot} />
              <AppText variant="labelSmall" style={styles.categoryText}>
                {target.categoryName.toUpperCase()}
              </AppText>
            </View>

            {target.targetDate ? (
              <View style={styles.dateBadge}>
                <Calendar size={12} color={colors.onSurfaceVariant} strokeWidth={2.2} />
                <AppText variant="labelSmall" style={styles.dateBadgeText}>
                  Target: {target.targetDate}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="headlineMedium" style={styles.targetTitleText}>
            {target.title}
          </AppText>

          {/* PLAYFUL "WHY" MOTIVATION CARD */}
          {target.description ? (
            <View style={styles.whyCard}>
              <View style={styles.whyHeaderRow}>
                <Sparkles size={14} color={colors.primary} strokeWidth={2.2} />
                <AppText variant="labelSmall" style={styles.whyLabel}>
                  Komitmen & Motivasi Pribadi
                </AppText>
              </View>
              <AppText variant="bodySmall" style={styles.whyText}>
                &ldquo;{target.description}&rdquo;
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <AppText variant="labelMedium" color="onSurfaceVariant">PROGRES RENCANA</AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                {target.completedTasks}/{target.totalTasks} tugas · {stages.length} tahap
              </AppText>
            </View>
            <AppText variant="titleLarge" style={styles.summaryPercent} tabularNums>
              {target.totalTasks ? `${target.progressPercent}%` : 'Belum ada rencana'}
            </AppText>
          </View>
          <ProgressBar progress={target.progressPercent} height={5} />
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Estimasi pekerjaan: {target.totalEstimatedHours} jam
          </AppText>
        </View>

        <AppText variant="bodySmall" style={styles.disclaimerText}>
          Mencakup tugas langsung dan proyek terkait. Tugas dibatalkan tidak dihitung; persen menunjukkan progres rencana, bukan penguasaan keterampilan.
        </AppText>

        {/* SECTION HEADER: TAHAPAN ROADMAP */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleCol}>
            <View style={styles.sectionTitleRow}>
              <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                Tahapan Roadmap
              </AppText>
              <View style={styles.stageCountBadge}>
                <AppText variant="labelSmall" style={styles.stageCountText}>
                  {stages.length}
                </AppText>
              </View>
            </View>
            <AppText variant="bodySmall" style={styles.sectionSubtext}>
              Urutan fase untuk mencapai tujuanmu
            </AppText>
          </View>

          <Pressable
            onPress={() => {
              setEditingStage(undefined);
              setStageModalVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tambah Tahap Baru"
            style={styles.addStageBtn}
          >
            <Plus size={14} color={colors.onPrimary} strokeWidth={2.8} />
            <AppText variant="labelSmall" style={styles.addStageText}>
              Tahap Baru
            </AppText>
          </Pressable>
        </View>

        {/* STAGES LIST */}
        {stages.length === 0 ? (
          <View style={styles.emptyStagesCard}>
            <AppText variant="titleMedium" align="center" style={styles.emptyTitle}>
              Belum Ada Tahapan
            </AppText>
            <AppText variant="bodySmall" align="center" style={styles.emptyDesc}>
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

      </ScrollView>

      {/* MODAL TAMBAH/EDIT TAHAP */}
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

      {/* MODAL TAMBAH/EDIT TUGAS */}
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
  screenBg: { backgroundColor: '#FCF8FF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[3] },
  topBar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[2] },
  topBarTitle: { flex: 1, textAlign: 'center', fontFamily: fontFamily.bold, color: '#1E1E2E', fontSize: 16 },
  circleNavBtn: {
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
  circleDeleteBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFDAD6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  scrollContent: { paddingBottom: space[4], gap: space[2] },
  headerProfileSection: { gap: space[2] },
  metaBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
  categoryBadge: {
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
  categoryDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: '#805600' },
  categoryText: { color: '#805600', fontFamily: fontFamily.bold, fontSize: 11 },
  dateBadge: {
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
  dateBadgeText: { color: '#504535', fontFamily: fontFamily.medium, fontSize: 11 },
  targetTitleText: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, color: '#1E1E2E' },
  whyCard: {
    gap: 6,
    padding: space[3],
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderRadius: 18,
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  whyHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  whyLabel: { color: '#805600', fontFamily: fontFamily.bold },
  whyText: { color: '#504535', lineHeight: 20 },
  summaryCard: {
    gap: space[2],
    padding: space[3],
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderRadius: 18,
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryPercent: { color: '#805600', fontFamily: fontFamily.bold },
  disclaimerText: { fontSize: 11, lineHeight: 16, color: '#504535' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2], marginTop: space[3], marginBottom: space[1] },
  sectionTitleCol: { flex: 1, gap: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sectionHeadingBold: { color: '#1E1E2E', fontFamily: fontFamily.bold, fontSize: 16 },
  sectionSubtext: { color: '#504535' },
  stageCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBD9',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  stageCountText: { color: '#805600', fontFamily: fontFamily.bold, fontSize: 11 },
  addStageBtn: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#E06B52',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  addStageText: { color: '#FAF5EB', fontFamily: fontFamily.bold, fontSize: 12 },
  emptyStagesCard: {
    padding: space[4],
    gap: space[2],
    alignItems: 'center',
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  emptyTitle: { color: '#1E1E2E', fontFamily: fontFamily.bold },
  emptyDesc: { marginBottom: space[2], maxWidth: 280, color: '#504535' },
  emptyBtn: { borderRadius: 999 },
});
