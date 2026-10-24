import { useState, useEffect, useCallback } from 'react';
import type {
  ProjectWithSummary,
  MilestoneEntity,
  CreateMilestoneInput,
} from '../../domain/entities/project.entity';
import type { TaskEntity } from '@/features/today-focus/domain/entities/daily-focus.entity';
import { projectRepository } from '../../data/repositories/project.repository.impl';

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectWithSummary | null>(null);
  const [milestones, setMilestones] = useState<MilestoneEntity[]>([]);
  const [tasks, setTasks] = useState<TaskEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);

      const [proj, miles, tList] = await Promise.all([
        projectRepository.getProjectById(projectId),
        projectRepository.getMilestones(projectId),
        projectRepository.getProjectTasks(projectId),
      ]);

      setProject(proj);
      setMilestones(miles);
      setTasks(tList);
    } catch (err: any) {
      console.error('[useProjectDetail] Load error:', err);
      setError('Gagal memuat detail proyek.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addMilestone = async (title: string, dueDate?: string): Promise<boolean> => {
    try {
      await projectRepository.createMilestone({
        projectId,
        title,
        sortOrder: milestones.length + 1,
        dueDate,
      });
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Add milestone error:', err);
      return false;
    }
  };

  const toggleMilestone = async (id: string, currentCompleted: boolean) => {
    try {
      await projectRepository.toggleMilestone(id, !currentCompleted);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Toggle milestone error:', err);
    }
  };

  const removeMilestone = async (id: string) => {
    try {
      await projectRepository.deleteMilestone(id);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Remove milestone error:', err);
    }
  };

  const addTask = async (title: string, milestoneId?: string | null): Promise<boolean> => {
    try {
      await projectRepository.createProjectTask(projectId, title, milestoneId);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjectDetail] Add task error:', err);
      return false;
    }
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await projectRepository.toggleProjectTask(taskId, !currentCompleted);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Toggle task error:', err);
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      await projectRepository.deleteProjectTask(taskId);
      await loadData();
    } catch (err) {
      console.error('[useProjectDetail] Remove task error:', err);
    }
  };

  const deleteThisProject = async () => {
    await projectRepository.deleteProject(projectId);
  };

  return {
    project,
    milestones,
    tasks,
    isLoading,
    error,
    refresh: loadData,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    addTask,
    toggleTask,
    removeTask,
    deleteThisProject,
  };
}
