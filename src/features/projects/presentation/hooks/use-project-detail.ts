import { useState, useEffect, useCallback } from 'react';
import type { ProjectWithSummary } from '../../domain/entities/project.entity';
import { projectRepository } from '../../data/repositories/project.repository.impl';
import { stageRepository } from '@/features/stages/data/repositories/stage.repository.impl';
import type {
  StageWithTasks,
  TaskItemEntity,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/features/stages/domain/entities/stage.entity';

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectWithSummary | null>(null);
  const [stages, setStages] = useState<StageWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      const [proj, loadedStages] = await Promise.all([
        projectRepository.getProjectById(projectId),
        stageRepository.getStagesWithTasks('PROJECT', projectId),
      ]);

      if (!proj) {
        setError('Proyek tidak ditemukan.');
        setProject(null);
      } else {
        setProject(proj);
        setStages(loadedStages);
        setError(null);
      }
    } catch (err: any) {
      console.error('[useProjectDetail] Load error:', err);
      setError('Gagal memuat detail proyek.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

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
        parentType: 'PROJECT',
        parentId: projectId,
        name,
        description,
      });
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Add stage error:', err);
      return false;
    }
  };

  const editStage = async (stageId: string, name: string, description?: string): Promise<boolean> => {
    try {
      await stageRepository.updateStage(stageId, { name, description });
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Edit stage error:', err);
      return false;
    }
  };

  const removeStage = async (stageId: string): Promise<boolean> => {
    try {
      await stageRepository.deleteStage(stageId);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Delete stage error:', err);
      return false;
    }
  };

  const reorderStage = async (stageId: string, direction: 'UP' | 'DOWN'): Promise<void> => {
    try {
      await stageRepository.reorderStage(stageId, direction);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Reorder stage error:', err);
    }
  };

  // Task Actions
  const addTask = async (input: CreateTaskInput): Promise<boolean> => {
    try {
      await stageRepository.createTask(input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Add task error:', err);
      return false;
    }
  };

  const editTask = async (taskId: string, input: UpdateTaskInput): Promise<boolean> => {
    try {
      await stageRepository.updateTask(taskId, input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Edit task error:', err);
      return false;
    }
  };

  const removeTask = async (task: TaskItemEntity): Promise<boolean> => {
    try {
      await stageRepository.deleteTask(task.id);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Delete task error:', err);
      return false;
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: TaskStatus): Promise<void> => {
    try {
      const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await stageRepository.setTaskStatus(taskId, nextStatus);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Toggle task status error:', err);
    }
  };

  const deleteThisProject = async () => {
    await projectRepository.deleteProject(projectId);
  };

  return {
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
    deleteThisProject,
  };
}
