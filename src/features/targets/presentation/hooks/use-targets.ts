import { useFocusedResource } from '@/shared/hooks/use-focused-resource';
import { useState, useCallback } from 'react';
import type {
  CreateTargetInput,
  UpdateTargetInput,
} from '../../domain/entities/target.entity';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import { categoryRepository } from '@/features/categories/data/repositories/category.repository.impl';

export function useTargets() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const read = useCallback(async () => {
    const [categories, pillars, targets] = await Promise.all([
      categoryRepository.getAll(), targetRepository.getPillars(),
      targetRepository.getTargets(selectedCategoryId ? { categoryId: selectedCategoryId } : undefined),
    ]);
    return { categories, pillars, targets };
  }, [selectedCategoryId]);
  const { data, isLoading, error, refresh, setError } = useFocusedResource(`category:${selectedCategoryId ?? ''}`, read, 'Gagal memuat daftar target.');
  const { categories = [], pillars = [], targets = [] } = data || {};
  const loadData = refresh;

  const addTarget = async (input: CreateTargetInput): Promise<boolean> => {
    try {
      await targetRepository.createTarget(input);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargets] Create error:', err);
      return false;
    }
  };

  const editTarget = async (id: string, updates: UpdateTargetInput): Promise<boolean> => {
    try {
      await targetRepository.updateTarget(id, updates);
      await loadData();
      return true;
    } catch (err) {
      console.error('[useTargets] Update error:', err);
      return false;
    }
  };

  const removeTarget = async (id: string): Promise<void> => {
    try {
      await targetRepository.deleteTarget(id);
      await loadData();
    } catch (err) {
      console.error('[useTargets] Delete error:', err);
      setError('Data belum dapat dihapus. Coba lagi.');
    }
  };

  return {
    targets,
    categories,
    pillars,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoading,
    error,
    refresh,
    addTarget,
    editTarget,
    removeTarget,
  };
}
