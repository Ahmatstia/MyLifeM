import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, targets } from '@/db/schema';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import type {
  CategoryEntity,
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../domain/entities/category.entity';

export class CategoryRepositoryImpl implements CategoryRepository {
  async getAll(): Promise<CategoryWithCount[]> {
    const allCategories = await db.select().from(categories);
    const allTargets = await db.select({ categoryId: targets.categoryId }).from(targets);

    const countsMap = new Map<string, number>();
    for (const t of allTargets) {
      if (t.categoryId) {
        countsMap.set(t.categoryId, (countsMap.get(t.categoryId) || 0) + 1);
      }
    }

    return allCategories
      .map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        targetCount: countsMap.get(c.id) || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }

  async getById(id: string): Promise<CategoryEntity | null> {
    const rows = await db.select().from(categories).where(eq(categories.id, id));
    if (rows.length === 0) return null;
    const c = rows[0];
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async isNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    const all = await db.select({ id: categories.id, name: categories.name }).from(categories);
    return all.some(
      (c) => c.name.trim().toLowerCase() === trimmed && c.id !== excludeId
    );
  }

  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama kategori wajib diisi.');
    }

    const isDuplicate = await this.isNameDuplicate(cleanName);
    if (isDuplicate) {
      throw new Error(`Kategori "${cleanName}" sudah ada.`);
    }

    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(categories).values({
      id,
      name: cleanName,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      name: cleanName,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const isDuplicate = await this.isNameDuplicate(cleanName, id);
    if (isDuplicate) {
      throw new Error(`Kategori "${cleanName}" sudah digunakan.`);
    }

    const now = new Date().toISOString();
    await db
      .update(categories)
      .set({
        name: cleanName,
        updatedAt: now,
      })
      .where(eq(categories.id, id));

    return {
      id,
      name: cleanName,
      createdAt: now,
      updatedAt: now,
    };
  }

  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    // Check if category is used by any target
    const usedTargets = await db
      .select({ id: targets.id, title: targets.title })
      .from(targets)
      .where(eq(targets.categoryId, id));

    if (usedTargets.length > 0) {
      return {
        success: false,
        message: `Kategori tidak dapat dihapus karena sedang digunakan oleh ${usedTargets.length} target (${usedTargets.map((t) => t.title).slice(0, 2).join(', ')}${usedTargets.length > 2 ? '...' : ''}).`,
      };
    }

    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  }
}

export const categoryRepository = new CategoryRepositoryImpl();
