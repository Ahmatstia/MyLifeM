import type {
  DailyFocusItemEntity,
  TaskEntity,
  FocusSessionEntity,
  SaveSessionInput,
} from '../entities/daily-focus.entity';

export interface DailyFocusRepository {
  getTodayFocusItems(date: string): Promise<DailyFocusItemEntity[]>;
  addFocusItem(date: string, taskId: string): Promise<void>;
  removeFocusItem(id: string): Promise<void>;
  toggleTaskCompletion(taskId: string, isCompleted: boolean): Promise<void>;
  createQuickTask(title: string, date: string, targetId?: string): Promise<TaskEntity>;
  getAvailableTasks(): Promise<TaskEntity[]>;
  saveFocusSession(input: SaveSessionInput): Promise<FocusSessionEntity>;
  incrementTaskActualMinutes(taskId: string, minutes: number): Promise<void>;
  getTodayCompletedMinutes(date: string): Promise<number>;
}
