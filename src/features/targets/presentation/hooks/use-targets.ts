import { useState, useEffect, useCallback } from 'react';
import type {
  TargetEntity,
  LifePillarEntity,
  CreateTargetInput,
} from '../../domain/entities/target.entity';
import { targetRepository } from '../../data/repositories/target.repository.impl';

export function useTargets() {
  const [targets, setTargets] = useState<TargetEntity[]>([]);
  const [pillars, setPillars] = useState<LifePillarEntity[]>([]);
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {

      const [loadedPillars, loadedTargets] = await Promise.all([
        targetRepository.getPillars(),
        targetRepository.getTargets(
          selectedPillarId ? { pillarId: selectedPillarId } : undefined
        ),
      ]);

      setPillars(loadedPillars);
      setTargets(loadedTargets);
      setError(null);
    } catch (err: any) {
      console.error('[useTargets] Load error:', err);
      setError('Gagal memuat daftar target. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPillarId]);

  // refresh eksplisit menyalakan loading; loader sendiri tidak mengubah state sinkron di effect
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

  const updateProgress = async (id: string, currentValue: number): Promise<void> => {
    try {
      await targetRepository.updateTargetProgress(id, currentValue);
      await loadData();
    } catch (err) {
      console.error('[useTargets] Update progress error:', err);
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
    pillars,
    selectedPillarId,
    setSelectedPillarId,
    isLoading,
    error,
    refresh,
    addTarget,
    updateProgress,
    removeTarget,
  };
}
