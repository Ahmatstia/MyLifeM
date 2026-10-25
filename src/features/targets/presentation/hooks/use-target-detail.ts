import { useState, useEffect, useCallback } from 'react';
import type { TargetEntity } from '../../domain/entities/target.entity';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import { stageRepository } from '@/features/stages/data/repositories/stage.repository.impl';
import type {
  StageWithTasks,
  TaskItemEntity,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/features/stages/domain/entities/stage.entity';

export function useTargetDetail(targetId: string) {
  const [target, setTarget] = useState<TargetEntity | null>(null);
  const [stages, setStages] = useState<StageWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [loadedTarget, loadedStages] = await Promise.all([
        targetRepository.getTargetById(targetId),
        stageRepository.getStagesWithTasks('TARGET', targetId),
      ]);

      if (!loadedTarget) {
        setError('Target tidak ditemukan.');
        setTarget(null);
      } else {
        setTarget(loadedTarget);
        setStages(loadedStages);
        setError(null);
      }
    } catch (err: any) {
      console.error('[useTargetDetail] Load error:', err);
      setError('Gagal memuat detail target.');
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      return false;
    }
  };

  const reorderStage = async (stageId: string, direction: 'UP' | 'DOWN'): Promise<void> => {
    try {
      await stageRepository.reorderStage(stageId, direction);
      await loadData();
    } catch (err) {
      console.error('[useTargetDetail] Reorder stage error:', err);
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
      return false;
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus): Promise<void> => {
    try {
      const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await stageRepository.setTaskStatus(taskId, nextStatus);
      await loadData();
    } catch (err) {
      console.error('[useTargetDetail] Toggle task status error:', err);
    }
  };

  const deleteThisTarget = async (): Promise<boolean> => {
    try {
      await targetRepository.deleteTarget(targetId);
      return true;
    } catch (err) {
      console.error('[useTargetDetail] Delete target error:', err);
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
