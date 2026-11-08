import React, { useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  Folder,
  Clock,
  Calendar,
  TrendingUp,
  Gauge,
  Flag,
  CheckCircle2,
  Sparkles,
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
  MascotCozy,
  sproutShadow,
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
  const firstActiveIdx = stages.findIndex((st) => st.status !== 'COMPLETED');
  const activeStageIndex =
    stages.length === 0 ? -1 : firstActiveIdx === -1 ? stages.length - 1 : firstActiveIdx;
  const activeStageDisplayNum = activeStageIndex >= 0 ? activeStageIndex + 1 : 0;

  const statusLabel =
    target.status === 'COMPLETED'
      ? 'SELESAI'
      : target.status === 'PAUSED'
        ? 'DIJEDA'
        : 'SEDANG BERJALAN';

  const paceLabel =
    progress === 100
      ? 'TUNTAS'
      : progress >= 40
        ? 'OPTIMAL'
        : progress > 0
          ? ' AKTIF'
          : 'TAHAP AWAL';

  const uidCode = `GOAL-${(target.id || 'TARGET').slice(0, 8).toUpperCase()}`;
  const formattedStartDate = formatShortDateId(target.startDate || target.createdAt, 'Hari Ini');
  const formattedTargetDate = formatShortDateId(target.targetDate, 'Fleksibel');
  const activeDays = calculateActiveDays(target.startDate || target.createdAt);

  // SVG Circular Progress Ring geometry
  const ringSize = 124;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - (progress / 100) * ringCircumference;

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

      {/* Cozy Mascot Illustration */}
      <View style={styles.cozyHeroWrap}>
        <MascotCozy width={242} height={162} />
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

          <AppText style={styles.uidText} tabularNums>
            {`UID: ${uidCode}`}
          </AppText>
        </View>

        {/* Main Title & Description */}
        <View style={styles.titleSection}>
          <AppText style={styles.targetTitleText}>{target.title}</AppText>
          <AppText style={styles.descriptionParagraph}>
            {target.description
              ? target.description
              : target.totalTasks > 0
                ? 'Langkah demi langkah terstruktur untuk mewujudkan tujuan utamamu secara konsisten dan terukur.'
                : 'Belum ada rencana rinci. Tambahkan tahapan ekspedisi di bawah untuk mulai membangun momentum.'}
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
            <AppText style={styles.bentoLabel}>TAHAPAN EKSPEDISI</AppText>
            <View style={styles.bentoValueRow}>
              <Folder size={14} color="#7A52B8" fill="#E6DDF7" strokeWidth={2.3} />
              <AppText style={[styles.bentoValueText, { color: '#6A42A8' }]} tabularNums>
                {`${completedStagesCount}/${stages.length} Tahapan`}
              </AppText>
            </View>
          </View>

          {/* Tile 3: Total Investasi */}
          <View style={styles.bentoTile}>
            <AppText style={styles.bentoLabel}>TOTAL INVESTASI</AppText>
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
              <AppText style={styles.aggregationTitle}>AGREGASI INTEGRASI SISTEM</AppText>
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

      {/* =====================================================================
          2. CIRCULAR PROGRESS & OPERATIONAL PACE CARD (Reference Image 1 Right)
         ===================================================================== */}
      <View style={styles.gaugeCard}>
        <View style={styles.ringWrapper}>
          <Svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke="#E6DEC8"
              strokeWidth={ringStroke}
              fill="none"
            />
            {progress > 0 && (
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="#1E8A52"
                strokeWidth={ringStroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                strokeDashoffset={ringDashoffset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            )}
          </Svg>

          <View style={styles.ringCenterContent}>
            <AppText style={styles.ringBigPercent} tabularNums>
              {`${progress}%`}
            </AppText>
            <AppText style={styles.ringSubLabel}>KEMAJUAN</AppText>
          </View>
        </View>

        <View style={styles.paceBadge}>
          <Gauge size={14} color="#1E7A50" strokeWidth={2.5} />
          <AppText style={styles.paceBadgeText}>
            {`LAJU OPERASIONAL: ${paceLabel}`}
          </AppText>
        </View>

        <AppText style={styles.paceDescriptionText}>
          {progress === 100
            ? 'Seluruh tahapan pada target ini telah dituntaskan dengan sangat baik!'
            : 'Mulai tahapan awal secara bertahap untuk membangun momentum konsisten.'}
        </AppText>
      </View>

      {/* =====================================================================
          3. PETA JALAN EKSPEDISI — WAYPOINT STEPPER CARD (Reference Image 2)
         ===================================================================== */}
      <View style={styles.expeditionCard}>
        {/* Header Row */}
        <View style={styles.expeditionHeaderRow}>
          <View style={styles.expeditionTitleLeft}>
            <TrendingUp size={16} color="#7A52B8" strokeWidth={2.6} />
            <AppText style={styles.expeditionTitle}>Peta Jalan Ekspedisi</AppText>
            <AppText style={styles.expeditionSubTag}>{'// LINTASAN WAYPOINT'}</AppText>
          </View>

          <View style={styles.waypointActiveTag}>
            <View style={styles.waypointPurpleDot} />
            <AppText style={styles.waypointActiveTagText} tabularNums>
              {stages.length > 0
                ? `WAYPOINT ${String(activeStageDisplayNum).padStart(2, '0')} DARI ${String(
                    stages.length
                  ).padStart(2, '0')} AKTIF`
                : 'BELUM ADA WAYPOINT'}
            </AppText>
          </View>
        </View>

        {/* 4-Tile Telemetry Strip (2x2 on mobile) */}
        <View style={styles.telemetryGrid}>
          <View style={styles.telemetryTile}>
            <View style={styles.telemetryIconBox}>
              <Calendar size={14} color={s.inkMuted} strokeWidth={2.2} />
            </View>
            <View style={styles.telemetryTexts}>
              <AppText style={styles.telemetryLabel}>DIMULAI</AppText>
              <AppText style={styles.telemetryValue} numberOfLines={1}>
                {formattedStartDate}
              </AppText>
            </View>
          </View>

          <View style={styles.telemetryTile}>
            <View style={styles.telemetryIconBox}>
              <Clock size={14} color={s.inkMuted} strokeWidth={2.2} />
            </View>
            <View style={styles.telemetryTexts}>
              <AppText style={styles.telemetryLabel}>DURASI AKTIF</AppText>
              <AppText style={styles.telemetryValue} tabularNums>
                {`${activeDays} Hari Berjalan`}
              </AppText>
            </View>
          </View>

          <View style={styles.telemetryTile}>
            <View style={styles.telemetryIconBox}>
              <Flag size={14} color="#1E8A52" strokeWidth={2.3} />
            </View>
            <View style={styles.telemetryTexts}>
              <AppText style={styles.telemetryLabel}>STATUS MILESTONE</AppText>
              <AppText style={[styles.telemetryValue, { color: '#1E8A52' }]} tabularNums>
                {`${completedStagesCount}/${stages.length} Tahap Selesai`}
              </AppText>
            </View>
          </View>

          <View style={styles.telemetryTile}>
            <View style={styles.telemetryIconBox}>
              <CheckCircle2 size={14} color="#7A52B8" strokeWidth={2.3} />
            </View>
            <View style={styles.telemetryTexts}>
              <AppText style={styles.telemetryLabel}>PENYELESAIAN TUGAS</AppText>
              <AppText style={[styles.telemetryValue, { color: '#6A42A8' }]} tabularNums>
                {`${target.completedTasks}/${target.totalTasks} Tuntas`}
              </AppText>
            </View>
          </View>
        </View>

        {/* Horizontal Waypoint Nodes Stepper */}
        {stages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.waypointScrollContent}
          >
            {stages.map((st, idx) => {
              const isStageDone = st.status === 'COMPLETED';
              const isStageCurrent = idx === activeStageIndex && !isStageDone;
              const isLastWaypoint = idx === stages.length - 1;
              const stepCode = `Tahap ${String(idx + 1).padStart(2, '0')}`;

              return (
                <View key={st.id} style={styles.waypointColumn}>
                  {/* Node Circle + Horizontal Connecting Line */}
                  <View style={styles.waypointTopTrack}>
                    <View
                      style={[
                        styles.waypointCircle,
                        isStageDone && styles.waypointCircleDone,
                        isStageCurrent && styles.waypointCircleCurrent,
                      ]}
                    >
                      {isStageDone ? (
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <AppText
                          style={[
                            styles.waypointNumText,
                            isStageCurrent && styles.waypointNumTextCurrent,
                          ]}
                          tabularNums
                        >
                          {idx + 1}
                        </AppText>
                      )}
                    </View>

                    {!isLastWaypoint && (
                      <View
                        style={[
                          styles.waypointConnectorLine,
                          isStageDone && styles.waypointConnectorLineDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Labels Below Circle */}
                  <View style={styles.waypointMetaCol}>
                    <AppText style={styles.waypointStepCode}>{stepCode}</AppText>
                    <AppText style={styles.waypointStageName} numberOfLines={1}>
                      {st.name}
                    </AppText>

                    <View
                      style={[
                        styles.waypointStatusChip,
                        isStageDone
                          ? styles.waypointStatusChipDone
                          : isStageCurrent
                            ? styles.waypointStatusChipCurrent
                            : styles.waypointStatusChipUpcoming,
                      ]}
                    >
                      <AppText
                        style={[
                          styles.waypointStatusChipText,
                          isStageDone
                            ? styles.waypointStatusChipTextDone
                            : isStageCurrent
                              ? styles.waypointStatusChipTextCurrent
                              : styles.waypointStatusChipTextUpcoming,
                        ]}
                      >
                        {isStageDone
                          ? '✓ SELESAI'
                          : isStageCurrent
                            ? 'TAHAP INI'
                            : 'MENDATANG'}
                      </AppText>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Bottom Status Rute Banner */}
        <View style={styles.routeStatusBox}>
          <Sparkles size={15} color="#7A52B8" strokeWidth={2.4} />
          <AppText style={styles.routeStatusText}>
            <AppText style={styles.routeStatusBold}>Status Rute: </AppText>
            {stages.length === 0 ? (
              'Belum ada tahapan ekspedisi. Ketuk tombol + di kanan bawah untuk membuat Tahap 01.'
            ) : completedStagesCount === stages.length ? (
              `Seluruh ${stages.length} tahapan ekspedisi telah diselesaikan dengan tuntas!`
            ) : (
              <>
                {'Anda sedang berada di '}
                <AppText style={styles.routeStatusHighlight}>
                  {`Tahap ${activeStageDisplayNum} dari ${stages.length}`}
                </AppText>
                {'. Fokus aktif teralokasi pada penyelesaian tugas-tugas kritis di tahapan ini.'}
              </>
            )}
          </AppText>
        </View>
      </View>

      {/* =====================================================================
          4. INTERACTIVE STAGES & TASKS CHECKLIST
         ===================================================================== */}
      <SectionTitle
        title="Rincian Tahapan & Tugas"
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
    paddingBottom: 100,
    gap: space[3],
  },
  cozyHeroWrap: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: -14,
    zIndex: 2,
  },

  // 1. Overview Command Card
  overviewCard: {
    backgroundColor: s.card,
    borderRadius: 30,
    padding: space[4],
    borderWidth: 1.5,
    borderColor: '#EAE0CA',
    gap: space[4],
    ...sproutShadow,
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadgesLeft: {
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
  uidText: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    letterSpacing: 0.5,
    color: s.inkSubtle,
  },
  titleSection: {
    gap: 6,
  },
  targetTitleText: {
    fontFamily: fontFamily.bold,
    fontSize: 23,
    lineHeight: 29,
    color: s.ink,
  },
  descriptionParagraph: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: s.inkMuted,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bentoTile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#F7F3E6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E8DFCA',
    gap: 5,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aggregationLeft: {
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
  gaugeCard: {
    backgroundColor: s.card,
    borderRadius: 28,
    paddingVertical: space[4],
    paddingHorizontal: space[4],
    borderWidth: 1.5,
    borderColor: '#EAE0CA',
    alignItems: 'center',
    gap: 12,
    ...sproutShadow,
  },
  ringWrapper: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBigPercent: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 33,
    color: s.ink,
  },
  ringSubLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: '#1E8A52',
  },
  paceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E2F4E9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBE4CB',
  },
  paceBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#16683C',
  },
  paceDescriptionText: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: s.inkMuted,
    textAlign: 'center',
    maxWidth: 280,
  },

  // 3. Peta Jalan Ekspedisi (Waypoint Card)
  expeditionCard: {
    backgroundColor: s.card,
    borderRadius: 28,
    padding: space[4],
    borderWidth: 1.5,
    borderColor: '#EAE0CA',
    gap: space[4],
    ...sproutShadow,
  },
  expeditionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  expeditionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  expeditionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: s.ink,
  },
  expeditionSubTag: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: s.inkSubtle,
  },
  waypointActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waypointPurpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7A52B8',
  },
  waypointActiveTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#6A42A8',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  telemetryTile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F3E6',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E8DFCA',
  },
  telemetryIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFE9D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryTexts: {
    flex: 1,
    gap: 1,
  },
  telemetryLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: s.inkMuted,
  },
  telemetryValue: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    color: s.ink,
  },
  waypointScrollContent: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  waypointColumn: {
    width: 96,
    alignItems: 'flex-start',
  },
  waypointTopTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  waypointCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EEE0',
    borderWidth: 2,
    borderColor: '#D6CCB4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  waypointCircleDone: {
    backgroundColor: '#1E8A52',
    borderColor: '#1E8A52',
  },
  waypointCircleCurrent: {
    backgroundColor: '#7A52B8',
    borderColor: '#D5C5F5',
    borderWidth: 3,
  },
  waypointNumText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.inkMuted,
  },
  waypointNumTextCurrent: {
    color: '#FFFFFF',
  },
  waypointConnectorLine: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#DFD6C0',
  },
  waypointConnectorLineDone: {
    backgroundColor: '#1E8A52',
  },
  waypointMetaCol: {
    paddingRight: 8,
    gap: 2,
  },
  waypointStepCode: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: s.ink,
  },
  waypointStageName: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.inkMuted,
    marginBottom: 3,
  },
  waypointStatusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  waypointStatusChipDone: {
    backgroundColor: '#E1F4E8',
  },
  waypointStatusChipCurrent: {
    backgroundColor: '#EAE2F8',
  },
  waypointStatusChipUpcoming: {
    backgroundColor: '#EFE9D8',
  },
  waypointStatusChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 8.5,
    letterSpacing: 0.4,
  },
  waypointStatusChipTextDone: {
    color: '#176B3F',
  },
  waypointStatusChipTextCurrent: {
    color: '#6A42A8',
  },
  waypointStatusChipTextUpcoming: {
    color: s.inkMuted,
  },
  routeStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5EFE0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6DEC8',
  },
  routeStatusText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 17,
    color: s.inkMuted,
  },
  routeStatusBold: {
    fontFamily: fontFamily.bold,
    color: s.ink,
  },
  routeStatusHighlight: {
    fontFamily: fontFamily.bold,
    color: '#6A42A8',
  },

  emptyStagesCard: {
    padding: space[5],
    gap: space[2],
    alignItems: 'center',
    borderRadius: 28,
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
  fabSquare: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: s.sun,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B58105',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
