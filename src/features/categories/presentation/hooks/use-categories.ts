import { useState, useEffect, useCallback } from 'react';
import { categoryRepository } from '../../data/repositories/category.repository.impl';
import type { CategoryWithCount } from '../../domain/entities/category.entity';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryRepository.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat kategori.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await categoryRepository.create({ name });
      await fetchCategories();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal membuat kategori.' };
    }
  };

  const editCategory = async (id: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await categoryRepository.update(id, { name });
      await fetchCategories();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal memperbarui kategori.' };
    }
  };

  const removeCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await categoryRepository.delete(id);
      if (result.success) {
        await fetchCategories();
      }
      return result;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghapus kategori.' };
    }
  };

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}
