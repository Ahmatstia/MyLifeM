import type {
  WeeklyScheduleEntity,
  CreateWeeklyScheduleInput,
  UpdateWeeklyScheduleInput,
  ProjectedWeeklyOccurrence,
} from '../entities/weekly-schedule.entity';

export interface WeeklyScheduleRepository {
  /** Get all master schedules, ordered by dayOfWeek then startTime */
  getAllWeeklySchedules(): Promise<WeeklyScheduleEntity[]>;

  /** Get master schedules for a specific day of week (1 = Senin, ..., 7 = Minggu) */
  getWeeklySchedulesByDay(dayOfWeek: number): Promise<WeeklyScheduleEntity[]>;

  /** Get single schedule by ID */
  getScheduleById(id: string): Promise<WeeklyScheduleEntity | null>;

  /** Create a new master schedule entry */
  createWeeklySchedule(input: CreateWeeklyScheduleInput): Promise<WeeklyScheduleEntity>;

  /** Update an existing master schedule entry */
  updateWeeklySchedule(id: string, input: UpdateWeeklyScheduleInput): Promise<WeeklyScheduleEntity>;

  /** Delete a master schedule entry (cascades to logs) */
  deleteWeeklySchedule(id: string): Promise<void>;

  /**
   * Project master schedules onto a specific date, merging with any daily completion/cancellation logs.
   */
  getProjectedSchedulesForDate(dateStr: string): Promise<ProjectedWeeklyOccurrence[]>;

  /** Mark a specific date's occurrence as completed or todo */
  setOccurrenceCompletion(scheduleId: string, dateStr: string, isCompleted: boolean): Promise<void>;

  /** Mark a specific date's occurrence as cancelled or active */
  setOccurrenceCancellation(scheduleId: string, dateStr: string, isCancelled: boolean): Promise<void>;
}

