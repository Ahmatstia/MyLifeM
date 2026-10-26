import { useFocusedResource } from '@/shared/hooks/use-focused-resource';
import { useState, useCallback } from 'react';
import type {
  CreateProjectInput,
} from '../../domain/entities/project.entity';
import { projectRepository } from '../../data/repositories/project.repository.impl';

export function useProjects() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const read = useCallback(() => projectRepository.getProjects(statusFilter ? { status: statusFilter } : undefined), [statusFilter]);
  const { data: projects = [], isLoading, error, refresh, setError } = useFocusedResource(statusFilter || 'all', read, 'Gagal memuat daftar proyek.');
  const loadData = refresh;

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
      setError('Data belum dapat dihapus. Coba lagi.');
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
