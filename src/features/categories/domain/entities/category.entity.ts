/**
 * Category Domain Entity
 * Pure business model for PRD MVP category grouping.
 */

export interface CategoryEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function normalizeCategoryName(name: string): string {
  return name.trim().toLocaleLowerCase('id-ID');
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

export interface CategoryWithCount extends CategoryEntity {
  targetCount: number;
}
