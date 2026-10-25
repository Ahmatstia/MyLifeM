import type {
  StageWithTasks,
  StageEntity,
  TaskItemEntity,
  CreateStageInput,
  UpdateStageInput,
  CreateTaskInput,
  UpdateTaskInput,
  StageParentType,
  TaskStatus,
} from '../entities/stage.entity';

export interface StageRepository {
  getStagesWithTasks(parentType: StageParentType, parentId: string): Promise<StageWithTasks[]>;
  createStage(input: CreateStageInput): Promise<StageEntity>;
  updateStage(id: string, input: UpdateStageInput): Promise<StageEntity>;
  deleteStage(id: string): Promise<void>;
  reorderStage(id: string, direction: 'UP' | 'DOWN'): Promise<void>;

  createTask(input: CreateTaskInput): Promise<TaskItemEntity>;
  updateTask(id: string, input: UpdateTaskInput): Promise<TaskItemEntity>;
  deleteTask(id: string): Promise<void>;
  setTaskStatus(id: string, status: TaskStatus): Promise<TaskItemEntity>;
}
