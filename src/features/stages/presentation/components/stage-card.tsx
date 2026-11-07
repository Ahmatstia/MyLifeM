import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Check, ChevronDown, ChevronUp, MoreHorizontal, Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import { AppText, Button, AppBottomSheet, SoftCard, SproutCheck } from '@/shared/ui';
import {
  type StageWithTasks,
  type TaskItemEntity,
  type TaskStatus,
  getStageStatusLabel,
} from '../../domain/entities/stage.entity';

const s = colors.sprout;

export interface StageCardProps {
  stage: StageWithTasks;
  stepNumber?: number;
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
  stepNumber,
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
  const [expanded, setExpanded] = useState(stage.status !== 'COMPLETED');
  const [stageMenu, setStageMenu] = useState(false);
  const [taskMenu, setTaskMenu] = useState<TaskItemEntity | null>(null);
  const complete = stage.status === 'COMPLETED';

  return (
    <SoftCard style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={stage.name + ', ' + getStageStatusLabel(stage.status)}
          style={styles.heading}
        >
          <View style={[styles.step, complete && styles.completedStep]}>
            {complete ? (
              <Check size={17} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <AppText style={styles.stepNumText} tabularNums>
                {stepNumber || '•'}
              </AppText>
            )}
          </View>
          <View style={styles.headingText}>
            <AppText style={styles.stageTitle}>{stage.name}</AppText>
            <AppText style={styles.stageSubtitle}>
              {getStageStatusLabel(stage.status)} · {stage.completedTasks}/{stage.totalTasks} tugas
            </AppText>
          </View>
          {expanded ? (
            <ChevronUp size={18} color={s.forest} />
          ) : (
            <ChevronDown size={18} color={s.forest} />
          )}
        </Pressable>

        <Pressable
          onPress={() => setStageMenu(true)}
          accessibilityRole="button"
          accessibilityLabel={'Opsi tahapan ' + stage.name}
          style={styles.menuButton}
        >
          <MoreHorizontal size={20} color={s.inkMuted} />
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.content}>
          {stage.description && (
            <AppText style={styles.description}>{stage.description}</AppText>
          )}

          {stage.tasks.map((task) => {
            const done = task.status === 'COMPLETED';
            const cancelled = task.status === 'CANCELLED';

            return (
              <View key={task.id} style={styles.taskRow}>
                <SproutCheck
                  checked={done}
                  onPress={() => onToggleTaskStatus(task.id, task.status)}
                  accessibilityLabel={
                    (done || cancelled ? 'Buka kembali ' : 'Selesaikan ') + task.name
                  }
                  size={26}
                />

                <View style={styles.taskText}>
                  <AppText style={[styles.taskName, done && styles.strike]}>
                    {task.name}
                  </AppText>
                  {task.description && (
                    <AppText style={styles.taskDesc} numberOfLines={2}>
                      {task.description}
                    </AppText>
                  )}
                  <AppText style={styles.taskMeta}>
                    {task.estimatedHours} jam ·{' '}
                    {cancelled
                      ? 'Dibatalkan'
                      : done
                        ? 'Selesai'
                        : task.status === 'IN_PROGRESS'
                          ? 'Sedang dikerjakan'
                          : task.priority === 'HIGH'
                            ? 'Prioritas tinggi'
                            : task.priority === 'LOW'
                              ? 'Prioritas rendah'
                              : 'Belum dimulai'}
                  </AppText>
                </View>

                <Pressable
                  onPress={() => setTaskMenu(task)}
                  accessibilityRole="button"
                  accessibilityLabel={'Opsi tugas ' + task.name}
                  style={styles.menuButton}
                >
                  <MoreHorizontal size={18} color={s.inkMuted} />
                </Pressable>
              </View>
            );
          })}

          {stage.tasks.length === 0 && (
            <AppText style={styles.description}>
              Tambahkan langkah kecil untuk memulai tahap ini.
            </AppText>
          )}

          <Pressable
            onPress={onAddTask}
            accessibilityRole="button"
            style={styles.addTaskPill}
          >
            <Plus size={15} color={s.forest} strokeWidth={2.6} />
            <AppText style={styles.addTaskText}>Tambah tugas</AppText>
          </Pressable>
        </View>
      )}

      <AppBottomSheet
        visible={stageMenu}
        onClose={() => setStageMenu(false)}
        title="Opsi tahapan"
        subtitle={stage.name}
      >
        <View style={styles.actions}>
          <Button
            title="Ubah tahapan"
            variant="tonal"
            onPress={() => {
              setStageMenu(false);
              onEditStage();
            }}
          />
          <Button
            title="Pindah ke atas"
            variant="outlined"
            disabled={isFirst}
            onPress={() => {
              setStageMenu(false);
              onMoveUp();
            }}
          />
          <Button
            title="Pindah ke bawah"
            variant="outlined"
            disabled={isLast}
            onPress={() => {
              setStageMenu(false);
              onMoveDown();
            }}
          />
          <Button
            title="Hapus tahapan"
            variant="danger"
            onPress={() => {
              setStageMenu(false);
              Alert.alert(
                'Hapus tahapan?',
                'Tahap ini, ' +
                  stage.totalTasks +
                  ' tugas, dan prioritas hariannya akan dihapus. Sesi fokus dan agenda tetap disimpan dengan tautan yang dilepas.',
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus tahapan', style: 'destructive', onPress: onDeleteStage },
                ]
              );
            }}
          />
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        visible={taskMenu !== null}
        onClose={() => setTaskMenu(null)}
        title="Opsi tugas"
        subtitle={taskMenu?.name}
      >
        <View style={styles.actions}>
          <Button
            title="Ubah tugas"
            variant="tonal"
            onPress={() => {
              if (taskMenu) {
                onEditTask(taskMenu);
                setTaskMenu(null);
              }
            }}
          />
          <Button
            title="Hapus tugas"
            variant="danger"
            onPress={() => {
              if (!taskMenu) return;
              const task = taskMenu;
              setTaskMenu(null);
              Alert.alert(
                'Hapus tugas?',
                task.name +
                  '\nPrioritas harian ikut dihapus. Sesi fokus dan agenda tetap disimpan dengan tautan yang dilepas.',
                [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus tugas', style: 'destructive', onPress: () => onDeleteTask(task) },
                ]
              );
            }}
          />
        </View>
      </AppBottomSheet>
    </SoftCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  heading: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  headingText: {
    flex: 1,
    gap: 2,
  },
  step: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: s.leafSoft,
  },
  completedStep: {
    backgroundColor: s.forest,
  },
  stepNumText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.forest,
  },
  stageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: s.ink,
  },
  stageSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  menuButton: {
    width: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: space[3],
    borderTopWidth: 1,
    borderTopColor: '#EDE5D2',
    paddingTop: space[3],
    gap: space[2],
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: s.inkMuted,
    marginBottom: space[1],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: s.cream,
    borderRadius: 20,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    borderWidth: 1,
    borderColor: '#EDE5D2',
  },
  taskText: {
    flex: 1,
    gap: 2,
  },
  taskName: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  taskDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: s.inkMuted,
  },
  taskMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.inkMuted,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  addTaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: s.leafSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  addTaskText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.forest,
  },
  actions: {
    gap: space[3],
  },
});
