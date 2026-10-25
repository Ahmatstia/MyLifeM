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

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

export interface CategoryWithCount extends CategoryEntity {
  targetCount: number;
}
