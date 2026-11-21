import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { categories, targets } from '@/db/schema';
import { normalizeCategoryName } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import type {
  CategoryEntity,
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../domain/entities/category.entity';

function hasDuplicateName(connection: Pick<typeof db, 'select'>, name: string, excludeId?: string): boolean {
  const normalized = normalizeCategoryName(name);
  return connection.select({ id: categories.id, name: categories.name }).from(categories).all()
    .some(category => category.id !== excludeId && normalizeCategoryName(category.name) === normalized);
}

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
    return hasDuplicateName(db, name, excludeId);
  }

  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama kategori wajib diisi.');
    }

    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return db.transaction(tx => {
      if (hasDuplicateName(tx, cleanName)) throw new Error(`Kategori "${cleanName}" sudah ada.`);
      const category = { id, name: cleanName, createdAt: now, updatedAt: now };
      tx.insert(categories).values(category).run();
      return category;
    });
  }

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryEntity> {
    const cleanName = input.name.trim();
    if (!cleanName) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const now = new Date().toISOString();
    return db.transaction(tx => {
      if (hasDuplicateName(tx, cleanName, id)) throw new Error(`Kategori "${cleanName}" sudah digunakan.`);
      tx.update(categories).set({ name: cleanName, updatedAt: now }).where(eq(categories.id, id)).run();
      return { id, name: cleanName, createdAt: now, updatedAt: now };
    });
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
