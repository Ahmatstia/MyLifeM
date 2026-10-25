import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Check, ChevronDown, ChevronUp, MoreHorizontal, Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { Card, AppText, Button, AppBottomSheet } from '@/shared/ui';
import { type StageWithTasks, type TaskItemEntity, type TaskStatus, getStageStatusLabel } from '../../domain/entities/stage.entity';

export interface StageCardProps {
  stage: StageWithTasks; stepNumber?: number; isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void; onEditStage: () => void; onDeleteStage: () => void;
  onAddTask: () => void; onEditTask: (task: TaskItemEntity) => void; onDeleteTask: (task: TaskItemEntity) => void;
  onToggleTaskStatus: (taskId: string, currentStatus: TaskStatus) => void;
}

export const StageCard: React.FC<StageCardProps> = ({
  stage, stepNumber, isFirst, isLast, onMoveUp, onMoveDown, onEditStage,
  onDeleteStage, onAddTask, onEditTask, onDeleteTask, onToggleTaskStatus,
}) => {
  const [expanded, setExpanded] = useState(stage.status !== 'COMPLETED');
  const [stageMenu, setStageMenu] = useState(false);
  const [taskMenu, setTaskMenu] = useState<TaskItemEntity | null>(null);
  const complete = stage.status === 'COMPLETED';

  return (
    <Card variant="outlined" padding={space[4]} style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => setExpanded(!expanded)} accessibilityRole="button"
          accessibilityState={{ expanded }} accessibilityLabel={stage.name + ', ' + getStageStatusLabel(stage.status)}
          style={styles.heading}>
          <View style={[styles.step, complete && styles.completedStep]}>
            {complete ? <Check size={18} color={colors.onPrimary} /> : <AppText variant="titleSmall" color="onPrimaryContainer" tabularNums>{stepNumber || '•'}</AppText>}
          </View>
          <View style={styles.headingText}>
            <AppText variant="titleMedium">{stage.name}</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">{getStageStatusLabel(stage.status)} · {stage.completedTasks}/{stage.totalTasks} tugas</AppText>
          </View>
          {expanded ? <ChevronUp size={18} color={colors.primary} /> : <ChevronDown size={18} color={colors.primary} />}
        </Pressable>
        <Pressable onPress={() => setStageMenu(true)} accessibilityRole="button" accessibilityLabel={'Opsi tahapan ' + stage.name} style={styles.menuButton}>
          <MoreHorizontal size={22} color={colors.primary} />
        </Pressable>
      </View>
      {expanded && <View style={styles.content}>
        {stage.description && <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.description}>{stage.description}</AppText>}
        {stage.tasks.map(task => {
          const done = task.status === 'DONE';
          return <View key={task.id} style={styles.taskRow}>
            <Pressable onPress={() => onToggleTaskStatus(task.id, task.status)} accessibilityRole="checkbox"
              accessibilityState={{ checked: done }} accessibilityLabel={(done ? 'Buka kembali ' : 'Selesaikan ') + task.name} style={styles.checkTouch}>
              <View style={[styles.checkbox, done && styles.checked]}>{done && <Check size={16} color={colors.onPrimary} />}</View>
            </Pressable>
            <View style={styles.taskText}>
              <AppText variant="bodyMedium" style={done ? styles.strike : undefined}>{task.name}</AppText>
              {task.description && <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={2}>{task.description}</AppText>}
              <AppText variant="bodySmall" color="onSurfaceVariant">{task.estimatedHours} jam · {done ? 'Selesai' : task.status === 'IN_PROGRESS' ? 'Sedang dikerjakan' : task.priority === 'HIGH' ? 'Prioritas tinggi' : task.priority === 'LOW' ? 'Prioritas rendah' : 'Belum dimulai'}</AppText>
            </View>
            <Pressable onPress={() => setTaskMenu(task)} accessibilityRole="button" accessibilityLabel={'Opsi tugas ' + task.name} style={styles.menuButton}>
              <MoreHorizontal size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>;
        })}
        {stage.tasks.length === 0 && <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.description}>Tambahkan langkah kecil untuk memulai tahap ini.</AppText>}
        <Button title="Tambah tugas" variant="text" onPress={onAddTask} leftIcon={<Plus size={16} color={colors.primary} />} style={styles.addTask} />
      </View>}
      <AppBottomSheet visible={stageMenu} onClose={() => setStageMenu(false)} title="Opsi tahapan" subtitle={stage.name}>
        <View style={styles.actions}>
          <Button title="Ubah tahapan" variant="tonal" onPress={() => { setStageMenu(false); onEditStage(); }} />
          <Button title="Pindah ke atas" variant="outlined" disabled={isFirst} onPress={() => { setStageMenu(false); onMoveUp(); }} />
          <Button title="Pindah ke bawah" variant="outlined" disabled={isLast} onPress={() => { setStageMenu(false); onMoveDown(); }} />
          <Button title="Hapus tahapan" variant="danger" onPress={() => {
            setStageMenu(false);
            Alert.alert('Hapus tahapan?', 'Tahap ini dan ' + stage.totalTasks + ' tugas di dalamnya akan dihapus.', [
              { text: 'Batal', style: 'cancel' }, { text: 'Hapus tahapan', style: 'destructive', onPress: onDeleteStage },
            ]);
          }} />
        </View>
      </AppBottomSheet>
      <AppBottomSheet visible={taskMenu !== null} onClose={() => setTaskMenu(null)} title="Opsi tugas" subtitle={taskMenu?.name}>
        <View style={styles.actions}>
          <Button title="Ubah tugas" variant="tonal" onPress={() => { if (taskMenu) { onEditTask(taskMenu); setTaskMenu(null); } }} />
          <Button title="Hapus tugas" variant="danger" onPress={() => {
            if (!taskMenu) return;
            const task = taskMenu;
            setTaskMenu(null);
            Alert.alert('Hapus tugas?', task.name, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus tugas', style: 'destructive', onPress: () => onDeleteTask(task) }]);
          }} />
        </View>
      </AppBottomSheet>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: space[4], borderLeftWidth: 3, borderLeftColor: colors.primaryContainer },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  heading: { flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[3] },
  headingText: { flex: 1, gap: space[1] },
  step: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryContainer },
  completedStep: { backgroundColor: colors.primary },
  menuButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  content: { marginTop: space[3], borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: space[3] },
  description: { marginBottom: space[3] },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space[2], paddingVertical: space[2] },
  checkTouch: { width: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: radius.xs, borderWidth: 1.5, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  taskText: { flex: 1, gap: space[1], paddingTop: space[2] },
  strike: { textDecorationLine: 'line-through' },
  addTask: { alignSelf: 'flex-start' },
  actions: { gap: space[3] },
});
