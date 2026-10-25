import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  Plus,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import {
  type StageWithTasks,
  type TaskItemEntity,
  type TaskStatus,
  getStageStatusLabel,
} from '../../domain/entities/stage.entity';

export interface StageCardProps {
  stage: StageWithTasks;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEditStage: () => void;
  onDeleteStage: () => void;
  onAddTask: () => void;
  onEditTask: (task: TaskItemEntity) => void;
  onDeleteTask: (task: TaskItemEntity) => void;
  onToggleTaskStatus: (taskId: string, currentStatus: TaskStatus) => void;
}

export const StageCard: React.FC<StageCardProps> = ({
  stage,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEditStage,
  onDeleteStage,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
}) => {
  const getStatusBadgeStyle = () => {
    switch (stage.status) {
      case 'COMPLETED':
        return { bg: colors.surfaceContainerHighest, text: colors.success };
      case 'IN_PROGRESS':
        return { bg: colors.primaryContainer, text: colors.primary };
      case 'NOT_STARTED':
        return { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant };
      case 'NO_TASKS':
      default:
        return { bg: colors.surfaceContainerLow, text: colors.onSurfaceSubtle };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <Card variant="elevated" padding={space[4]} style={styles.stageCard}>
      {/* Header Tahapan */}
      <View style={styles.stageHeader}>
        <View style={styles.titleCol}>
          <AppText variant="titleMedium">{stage.name}</AppText>
          {stage.description && (
            <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.descText}>
              {stage.description}
            </AppText>
          )}

          {/* Badges Row */}
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
              <AppText variant="labelSmall" style={{ color: badgeStyle.text }}>
                {getStageStatusLabel(stage.status)}
              </AppText>
            </View>

            <View style={styles.metaPill}>
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                {stage.completedTasks}/{stage.totalTasks} tugas
              </AppText>
            </View>

            <View style={styles.metaPill}>
              <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                {stage.totalEstimatedHours} jam
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.stageActions}>
          <Pressable
            disabled={isFirst}
            onPress={onMoveUp}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={[styles.iconTouch, isFirst && styles.iconDisabled]}
            accessibilityLabel="Pindah ke atas"
          >
            <ChevronUp size={18} color={isFirst ? colors.outlineVariant : colors.onSurface} />
          </Pressable>

          <Pressable
            disabled={isLast}
            onPress={onMoveDown}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={[styles.iconTouch, isLast && styles.iconDisabled]}
            accessibilityLabel="Pindah ke bawah"
          >
            <ChevronDown size={18} color={isLast ? colors.outlineVariant : colors.onSurface} />
          </Pressable>

          <Pressable
            onPress={onEditStage}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.iconTouch}
            accessibilityLabel="Ubah tahapan"
          >
            <Pencil size={15} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert(
                'Hapus Tahapan',
                `Apakah kamu yakin ingin menghapus "${stage.name}" beserta ${stage.totalTasks} tugas di dalamnya?`,
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus', style: 'destructive', onPress: onDeleteStage },
                ]
              );
            }}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.iconTouch}
            accessibilityLabel="Hapus tahapan"
          >
            <Trash2 size={15} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Task List */}
      <View style={styles.tasksSection}>
        {stage.tasks.length === 0 ? (
          <View style={styles.emptyTasksBox}>
            <AppText variant="bodySmall" color="onSurfaceSubtle">
              Belum ada tugas di tahap ini.
            </AppText>
            <Button
              title="+ Tambah Tugas"
              variant="tonal"
              size="compact"
              onPress={onAddTask}
              style={styles.emptyAddBtn}
            />
          </View>
        ) : (
          <>
            <View style={styles.tasksList}>
              {stage.tasks.map((task) => {
                const isDone = task.status === 'DONE';
                const isInProgress = task.status === 'IN_PROGRESS';

                const priorityLabel =
                  task.priority === 'HIGH' ? 'Tinggi' : task.priority === 'LOW' ? 'Rendah' : 'Sedang';

                return (
                  <View key={task.id} style={[styles.taskRow, isDone && styles.taskRowDone]}>
                    {/* 28dp tactile stamp checkbox */}
                    <Pressable
                      onPress={() => onToggleTaskStatus(task.id, task.status)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isDone }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[
                        styles.stampCheck,
                        isDone && styles.stampCheckDone,
                        isInProgress && styles.stampCheckProgress,
                      ]}
                    >
                      {isDone && <Check size={16} color={colors.onPrimary} strokeWidth={3} />}
                    </Pressable>

                    {/* Task Title & Details */}
                    <View style={styles.taskTextCol}>
                      <AppText
                        variant="bodyMedium"
                        color={isDone ? 'onSurfaceSubtle' : 'onSurface'}
                        style={isDone && styles.textStrikethrough}
                      >
                        {task.name}
                      </AppText>
                      {task.description && (
                        <AppText variant="bodySmall" color="onSurfaceSubtle" numberOfLines={1}>
                          {task.description}
                        </AppText>
                      )}

                      {/* Pill Row */}
                      <View style={styles.taskPillRow}>
                        {/* Status Switcher Chip */}
                        <Pressable
                          onPress={() => onToggleTaskStatus(task.id, task.status)}
                          style={[
                            styles.taskStatusChip,
                            isInProgress && styles.taskStatusChipProgress,
                            isDone && styles.taskStatusChipDone,
                          ]}
                        >
                          <AppText
                            variant="labelSmall"
                            color={
                              isDone
                                ? 'onSurfaceSubtle'
                                : isInProgress
                                  ? 'primary'
                                  : 'onSurfaceVariant'
                            }
                          >
                            {task.status === 'DONE'
                              ? 'Selesai'
                              : task.status === 'IN_PROGRESS'
                                ? 'Sedang jalan'
                                : 'Belum jalan'}
                          </AppText>
                        </Pressable>

                        {/* Priority Pill */}
                        <View style={styles.priorityPill}>
                          <AppText variant="labelSmall" color="onSurfaceVariant">
                            {priorityLabel}
                          </AppText>
                        </View>

                        {/* Estimated Hours Pill */}
                        <View style={styles.hoursPill}>
                          <AppText variant="labelSmall" color="onSurfaceVariant" tabularNums>
                            {task.estimatedHours} jam
                          </AppText>
                        </View>
                      </View>
                    </View>

                    {/* Task Action Controls */}
                    <View style={styles.taskActions}>
                      <Pressable
                        onPress={() => onEditTask(task)}
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                        style={styles.taskActionBtn}
                      >
                        <Pencil size={14} color={colors.onSurfaceVariant} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            'Hapus Tugas',
                            `Hapus tugas "${task.name}"?`,
                            [
                              { text: 'Batal', style: 'cancel' },
                              { text: 'Hapus', style: 'destructive', onPress: () => onDeleteTask(task) },
                            ]
                          );
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                        style={styles.taskActionBtn}
                      >
                        <Trash2 size={14} color={colors.outline} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Bottom Add Task Button */}
            <Pressable
              onPress={onAddTask}
              style={({ pressed }) => [styles.addTaskRowBtn, pressed && styles.pressed]}
            >
              <Plus size={15} color={colors.primary} />
              <AppText variant="labelMedium" color="primary">
                Tambah Tugas di Tahap Ini
              </AppText>
            </Pressable>
          </>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  stageCard: {
    borderRadius: radius.xl,
    marginBottom: space[3],
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: space[2],
  },
  descText: {
    marginTop: 2,
    marginBottom: space[2],
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginTop: space[2],
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  metaPill: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  stageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconTouch: {
    padding: 6,
  },
  iconDisabled: {
    opacity: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: space[3],
  },
  tasksSection: {},
  emptyTasksBox: {
    paddingVertical: space[3],
    alignItems: 'center',
    gap: space[2],
  },
  emptyAddBtn: {
    borderRadius: radius.pill,
  },
  tasksList: {
    gap: space[2],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: space[3],
  },
  taskRowDone: {
    opacity: 0.7,
    backgroundColor: colors.surfaceContainerLow,
  },
  stampCheck: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[3],
  },
  stampCheckProgress: {
    borderColor: colors.primary,
    borderWidth: 2.5,
  },
  stampCheckDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskTextCol: {
    flex: 1,
    marginRight: space[2],
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  taskPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
    marginTop: 4,
  },
  taskStatusChip: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  taskStatusChipProgress: {
    backgroundColor: colors.primaryContainer,
  },
  taskStatusChipDone: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  priorityPill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  hoursPill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskActionBtn: {
    padding: 6,
  },
  addTaskRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[2],
    marginTop: space[2],
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.8,
  },
});
