import { useState, useEffect, useCallback } from 'react';
import type {
  ProjectWithSummary,
  CreateProjectInput,
} from '../../domain/entities/project.entity';
import { projectRepository } from '../../data/repositories/project.repository.impl';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {

      const items = await projectRepository.getProjects(
        statusFilter ? { status: statusFilter } : undefined
      );
      setProjects(items);
      setError(null);
    } catch (err: any) {
      console.error('[useProjects] Load error:', err);
      setError('Gagal memuat daftar proyek. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // refresh eksplisit menyalakan loading; loader sendiri tidak mengubah state sinkron di effect
  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addProject = async (input: CreateProjectInput): Promise<boolean> => {
    try {
      await projectRepository.createProject(input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useProjects] Create error:', err);
      return false;
    }
  };

  const removeProject = async (id: string) => {
    try {
      await projectRepository.deleteProject(id);
      await loadData();
    } catch (err) {
      console.error('[useProjects] Delete error:', err);
    }
  };

  return {
    projects,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    refresh,
    addProject,
    removeProject,
  };
}
