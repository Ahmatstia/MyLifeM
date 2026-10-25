import { useState, useEffect, useCallback } from 'react';
import type {
  TargetEntity,
  LifePillarEntity,
  CreateTargetInput,
  UpdateTargetInput,
} from '../../domain/entities/target.entity';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import { categoryRepository } from '@/features/categories/data/repositories/category.repository.impl';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export function useTargets() {
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [pillars, setPillars] = useState<LifePillarEntity[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [loadedCats, loadedPillars, loadedTargets] = await Promise.all([
        categoryRepository.getAll(),
        targetRepository.getPillars(),
        targetRepository.getTargets(
          selectedCategoryId ? { categoryId: selectedCategoryId } : undefined
        ),
      ]);

      setCategories(loadedCats);
      setPillars(loadedPillars);
      setTargets(loadedTargets);
      setError(null);
    } catch (err: any) {
      console.error('[useTargets] Load error:', err);
      setError('Gagal memuat daftar target. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
