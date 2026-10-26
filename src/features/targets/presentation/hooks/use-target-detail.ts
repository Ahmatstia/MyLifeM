import { useCallback } from 'react';
import { useFocusedResource } from '@/shared/hooks/use-focused-resource';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import { stageRepository } from '@/features/stages/data/repositories/stage.repository.impl';
import type {
  TaskItemEntity,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/features/stages/domain/entities/stage.entity';

export function useTargetDetail(targetId: string) {
  const read = useCallback(async () => {
    const [item, stages] = await Promise.all([
      targetRepository.getTargetById(targetId),
      stageRepository.getStagesWithTasks('TARGET', targetId),
    ]);
    if (!item) throw new Error('Target tidak ditemukan.');
    return { item, stages };
  }, [targetId]);
  const { data, isLoading, error, refresh, setError } = useFocusedResource(targetId, read, 'Gagal memuat detail target.');
  const target = data?.item ?? null;
  const stages = data?.stages ?? [];
  const loadData = refresh;

  // Stage Actions
  const addStage = async (name: string, description?: string): Promise<boolean> => {
    try {
      await stageRepository.createStage({
        parentType: 'TARGET',
        parentId: targetId,
        name,
        description,
      });
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Add stage error:', err);
      return false;
    }
  };

  const editStage = async (stageId: string, name: string, description?: string): Promise<boolean> => {
    try {
      await stageRepository.updateStage(stageId, { name, description });
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Edit stage error:', err);
      return false;
    }
  };

  const removeStage = async (stageId: string): Promise<boolean> => {
    try {
      await stageRepository.deleteStage(stageId);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Delete stage error:', err);
      setError('Perubahan belum tersimpan. Data tetap dipertahankan. Coba lagi.');
      return false;
    }
  };

  const reorderStage = async (stageId: string, direction: 'UP' | 'DOWN'): Promise<void> => {
    try {
      await stageRepository.reorderStage(stageId, direction);
      await loadData();
    } catch (err) {
      console.error('[useTargetDetail] Reorder stage error:', err);
      setError('Perubahan belum tersimpan. Data tetap dipertahankan. Coba lagi.');
    }
  };

  // Task Actions
  const addTask = async (input: CreateTaskInput): Promise<boolean> => {
    try {
      await stageRepository.createTask(input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Add task error:', err);
      return false;
    }
  };

  const editTask = async (taskId: string, input: UpdateTaskInput): Promise<boolean> => {
    try {
      await stageRepository.updateTask(taskId, input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Edit task error:', err);
      return false;
    }
  };

  const removeTask = async (task: TaskItemEntity): Promise<boolean> => {
    try {
      await stageRepository.deleteTask(task.id);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Delete task error:', err);
      setError('Perubahan belum tersimpan. Data tetap dipertahankan. Coba lagi.');
      return false;
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus): Promise<void> => {
    try {
      const nextStatus: TaskStatus = currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED' ? 'TODO' : 'COMPLETED';
      await stageRepository.setTaskStatus(taskId, nextStatus);
      await loadData();
    } catch (err) {
      console.error('[useTargetDetail] Toggle task status error:', err);
      setError('Status tugas belum tersimpan. Coba lagi.');
    }
  };

  const deleteThisTarget = async (): Promise<boolean> => {
    try {
      await targetRepository.deleteTarget(targetId);
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Delete target error:', err);
      setError('Target belum dapat dihapus. Data tetap dipertahankan. Coba lagi.');
      return false;
    }
  };

  return {
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
  };
}
