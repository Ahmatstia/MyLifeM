import type {
  CategoryEntity,
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../entities/category.entity';

export interface CategoryRepository {
  getAll(): Promise<CategoryWithCount[]>;
  getById(id: string): Promise<CategoryEntity | null>;
  create(input: CreateCategoryInput): Promise<CategoryEntity>;
  update(id: string, input: UpdateCategoryInput): Promise<CategoryEntity>;
  delete(id: string): Promise<{ success: boolean; message?: string }>;
  isNameDuplicate(name: string, excludeId?: string): Promise<boolean>;
}
