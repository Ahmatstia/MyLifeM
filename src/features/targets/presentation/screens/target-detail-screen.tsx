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
  TrendingUp,
  Zap,
  Sparkles,
  Calendar,
  Play,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, Button } from '@/shared/ui';
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
    <Screen style={styles.screenBg} withBottomPadding={false}>
      {/* TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.circleNavBtn}
        >
          <ArrowLeft size={18} color="#121417" strokeWidth={2.4} />
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
          <Trash2 size={17} color="#DC2626" strokeWidth={2.2} />
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
                <Calendar size={12} color="rgba(18, 20, 23, 0.6)" strokeWidth={2.2} />
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
                <Sparkles size={14} color="#7577EC" strokeWidth={2.4} />
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

        {/* 2-COLUMN HIGH-CONTRAST BENTO METRIC CARDS */}
        <View style={styles.statsGrid}>
          {/* Left Card: Warm Tangerine / Progres */}
          <View style={styles.statCardTangerine}>
            <View style={styles.statCardHeader}>
              <AppText variant="labelSmall" style={styles.statLabelTangerine}>
                PROGRES
              </AppText>
              <TrendingUp size={16} color="#8F4E00" strokeWidth={2.4} />
            </View>
            <View style={styles.statNumberBlock}>
              <AppText variant="headlineLarge" tabularNums style={styles.statBigNumberTangerine}>
                {target.totalTasks ? `${target.progressPercent}%` : 'Belum ada rencana'}
              </AppText>
              <AppText variant="bodySmall" style={styles.statSubTextTangerine}>
                {target.completedTasks} dari {target.totalTasks} tugas selesai
              </AppText>
            </View>
            <View style={styles.statProgressTrackTangerine}>
              <View
                style={[
                  styles.statProgressBarTangerine,
                  { width: `${Math.min(100, Math.max(0, target.progressPercent))}%` },
                ]}
              />
            </View>
          </View>

          {/* Right Card: Lavender / Estimasi */}
          <View style={styles.statCardLavender}>
            <View style={styles.statCardHeader}>
              <AppText variant="labelSmall" style={styles.statLabelLavender}>
                ESTIMASI
              </AppText>
              <Zap size={16} color="#5052ba" strokeWidth={2.4} />
            </View>
            <View style={styles.statNumberBlock}>
              <AppText variant="headlineLarge" tabularNums style={styles.statBigNumberLavender}>
                {target.totalEstimatedHours}h
              </AppText>
              <AppText variant="bodySmall" style={styles.statSubTextLavender}>
                Fokus terakumulasi
              </AppText>
            </View>
            <View style={styles.activeStagesIndicator}>
              <View style={styles.pulsingLavenderDot} />
              <AppText variant="labelSmall" style={styles.activeStagesText}>
                {stages.length} tahap rencana
              </AppText>
            </View>
          </View>
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
            <Plus size={14} color="#FFFFFF" strokeWidth={2.8} />
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

        {/* FLOATING ACTION PILL: Mulai Sesi Fokus */}
        <View style={styles.ctaWrapper}>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel="Mulai Sesi Fokus untuk Target Ini"
            style={styles.ctaButton}
          >
            <View style={styles.ctaPlayCircle}>
              <Play size={14} color="#121417" fill="#121417" />
            </View>
            <AppText variant="labelMedium" style={styles.ctaButtonText}>
              Mulai Sesi Fokus untuk Target Ini
            </AppText>
          </Pressable>
        </View>
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
  screenBg: {
    backgroundColor: '#F7F5EF',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  circleNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: space[3],
  },

  /* HEADER PROFILE */
  headerProfileSection: {
    marginTop: 4,
    gap: 8,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECEBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7577EC',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#6C6AE8',
    letterSpacing: 0.6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dateBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.7)',
  },
  targetTitleText: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 30,
  },
  whyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6E3DB',
    gap: 6,
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  whyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  whyLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#7577EC',
  },
  whyText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.75)',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  /* BENTO METRIC CARDS */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  statCardTangerine: {
    flex: 1,
    backgroundColor: '#FFE7D6',
    borderWidth: 1,
    borderColor: 'rgba(255, 155, 66, 0.25)',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabelTangerine: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#8F4E00',
    letterSpacing: 0.6,
  },
  statNumberBlock: {
    marginVertical: 6,
  },
  statBigNumberTangerine: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    color: '#8F4E00',
    lineHeight: 28,
  },
  statSubTextTangerine: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(143, 78, 0, 0.85)',
    marginTop: 2,
  },
  statProgressTrackTangerine: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(143, 78, 0, 0.15)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  statProgressBarTangerine: {
    height: '100%',
    backgroundColor: '#FF9E44',
    borderRadius: 999,
  },
  statCardLavender: {
    flex: 1,
    backgroundColor: '#ECEBFE',
    borderWidth: 1,
    borderColor: 'rgba(117, 119, 236, 0.25)',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#7577EC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabelLavender: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#5052ba',
    letterSpacing: 0.6,
  },
  statBigNumberLavender: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    color: '#5052ba',
    lineHeight: 28,
  },
  statSubTextLavender: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(80, 82, 186, 0.85)',
    marginTop: 2,
  },
  activeStagesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingLavenderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5052ba',
  },
  activeStagesText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#5052ba',
  },

  disclaimerText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.5)',
    lineHeight: 15,
  },

  /* SECTION HEADER */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitleCol: {
    gap: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeadingBold: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  stageCountBadge: {
    backgroundColor: '#ECEBFE',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 999,
  },
  stageCountText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#7577EC',
  },
  sectionSubtext: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.55)',
  },
  addStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#121417',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addStageText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },

  /* EMPTY STAGES */
  emptyStagesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E6E3DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  emptyDesc: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.6)',
    marginTop: 6,
    marginBottom: 16,
    maxWidth: 280,
    lineHeight: 18,
  },
  emptyBtn: {
    borderRadius: 999,
  },

  /* CTA BOTTOM WRAPPER */
  ctaWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#121417',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaPlayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCF763',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
});
