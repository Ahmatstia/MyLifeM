import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ==========================================
// 1. CATEGORIES (PRD MVP: Grouping for Targets)
// ==========================================
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_categories_name_unique').on(table.name),
  ]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  targets: many(targets),
}));

// ==========================================
// 2. LIFE PILLARS (Legacy / Compatibility)
// ==========================================
export const lifePillars = sqliteTable('life_pillars', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const lifePillarsRelations = relations(lifePillars, ({ many }) => ({
  targets: many(targets),
}));

// ==========================================
// 3. TARGETS (Goals - Core Feature)
// ==========================================
export const targets = sqliteTable(
  'targets',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'restrict',
    }),
    pillarId: text('pillar_id').references(() => lifePillars.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    type: text('type').notNull().default('MILESTONE_BASED'), // 'MILESTONE_BASED' | 'NUMERIC' | 'MAINTENANCE'
    targetValue: real('target_value').notNull().default(100.0),
    currentValue: real('current_value').notNull().default(0.0),
    unit: text('unit').notNull().default('%'),
    status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
    priority: text('priority').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    startDate: text('start_date').notNull(),
    targetDate: text('target_date'),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_targets_category_status').on(table.categoryId, table.status),
    index('idx_targets_pillar_status').on(table.pillarId, table.status),
    index('idx_targets_updated_at').on(table.updatedAt),
  ]
);

export const targetsRelations = relations(targets, ({ one, many }) => ({
  category: one(categories, {
    fields: [targets.categoryId],
    references: [categories.id],
  }),
  pillar: one(lifePillars, {
    fields: [targets.pillarId],
    references: [lifePillars.id],
  }),
  projects: many(projects),
  tasks: many(tasks),
  stages: many(stages),
  agendaEvents: many(agendaEvents),
}));

// ==========================================
// 3. PROJECTS
// ==========================================
export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    targetId: text('target_id').references(() => targets.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('ACTIVE'), // 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
    priority: text('priority').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH'
    targetDate: text('target_date'),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_projects_target_id').on(table.targetId),
    index('idx_projects_status').on(table.status),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  target: one(targets, {
    fields: [projects.targetId],
    references: [targets.id],
  }),
  milestones: many(milestones),
  stages: many(stages),
  tasks: many(tasks),
  agendaEvents: many(agendaEvents),
}));

// ==========================================
// 4. STAGES (PRD MVP: Tahapan for Target and Project)
// ==========================================
export const stages = sqliteTable(
  'stages',
  {
    id: text('id').primaryKey(),
    parentType: text('parent_type').notNull(), // 'TARGET' | 'PROJECT'
    parentId: text('parent_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_stages_parent').on(table.parentType, table.parentId, table.sortOrder),
  ]
);

export const stagesRelations = relations(stages, ({ many }) => ({
  tasks: many(tasks),
}));

// ==========================================
// 5. MILESTONES (Legacy Compatibility)
// ==========================================
export const milestones = sqliteTable(
  'milestones',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isCompleted: integer('is_completed').notNull().default(0),
    dueDate: text('due_date'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_milestones_project_id').on(table.projectId),
  ]
);

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

// ==========================================
// 6. TASKS (Tugas - Stage Child)
// ==========================================
export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    stageId: text('stage_id').references(() => stages.id, {
      onDelete: 'cascade',
    }),
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'cascade',
    }),
    targetId: text('target_id').references(() => targets.id, {
      onDelete: 'set null',
    }),
    milestoneId: text('milestone_id').references(() => milestones.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    name: text('name'),
    description: text('description'),
    priority: text('priority').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: text('status').notNull().default('TODO'), // 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    estimatedHours: real('estimated_hours').default(1.0),
    estimatedMinutes: integer('estimated_minutes').notNull().default(25),
    actualMinutes: integer('actual_minutes').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    dueDate: text('due_date'),
    isCompleted: integer('is_completed').notNull().default(0),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_tasks_stage_id').on(table.stageId),
    index('idx_tasks_project_id').on(table.projectId),
    index('idx_tasks_target_id').on(table.targetId),
    index('idx_tasks_milestone_id').on(table.milestoneId),
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_due_date').on(table.dueDate),
  ]
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  stage: one(stages, {
    fields: [tasks.stageId],
    references: [stages.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  target: one(targets, {
    fields: [tasks.targetId],
    references: [targets.id],
  }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  dailyFocusItems: many(dailyFocusItems),
  focusSessions: many(focusSessions),
  agendaEvents: many(agendaEvents),
}));

// ==========================================
// 6. DAILY FOCUS ITEMS (Top 3-5 Priorities)
// ==========================================
export const dailyFocusItems = sqliteTable(
  'daily_focus_items',
  {
    id: text('id').primaryKey(),
    date: text('date').notNull(), // 'YYYY-MM-DD'
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
    isCompleted: integer('is_completed').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_daily_focus_unique').on(table.date, table.taskId),
    index('idx_daily_focus_date').on(table.date),
  ]
);

export const dailyFocusItemsRelations = relations(dailyFocusItems, ({ one }) => ({
  task: one(tasks, {
    fields: [dailyFocusItems.taskId],
    references: [tasks.id],
  }),
}));

// ==========================================
// 7. FOCUS SESSIONS (Pomodoro & Deep Work Logs)
// ==========================================
export const focusSessions = sqliteTable(
  'focus_sessions',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').references(() => tasks.id, {
      onDelete: 'set null',
    }),
    mode: text('mode').notNull().default('POMODORO'), // 'POMODORO' | 'DEEP_FLOW' | 'STOPWATCH'
    startedAt: text('started_at').notNull(),
    endedAt: text('ended_at'),
    durationMinutes: integer('duration_minutes').notNull().default(0),
    rating: integer('rating'), // 1 - 5 stars
    obstacle: text('obstacle'),
    nextAction: text('next_action'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_focus_sessions_task').on(table.taskId),
    index('idx_focus_sessions_started_at').on(table.startedAt),
  ]
);

export const focusSessionsRelations = relations(focusSessions, ({ one }) => ({
  task: one(tasks, {
    fields: [focusSessions.taskId],
    references: [tasks.id],
  }),
}));

// ==========================================
// 8. AGENDA EVENTS (Chronological Timeline)
// ==========================================
export const agendaEvents = sqliteTable(
  'agenda_events',
  {
    id: text('id').primaryKey(),
    targetId: text('target_id').references(() => targets.id, {
      onDelete: 'set null',
    }),
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    taskId: text('task_id').references(() => tasks.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    isAllDay: integer('is_all_day').notNull().default(0),
    eventType: text('event_type').notNull().default('WORK'), // 'WORK' | 'PERSONAL' | 'LEARNING' | 'MEETING'
    location: text('location'),
    reminderMinutes: integer('reminder_minutes').default(10),
    isCompleted: integer('is_completed').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_agenda_time_range').on(table.startTime, table.endTime),
  ]
);

export const agendaEventsRelations = relations(agendaEvents, ({ one }) => ({
  target: one(targets, {
    fields: [agendaEvents.targetId],
    references: [targets.id],
  }),
  project: one(projects, {
    fields: [agendaEvents.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [agendaEvents.taskId],
    references: [tasks.id],
  }),
}));

// ==========================================
// 9. USER SETTINGS (Key-Value)
// ==========================================
export const userSettings = sqliteTable('user_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Infered TypeScript Types
export type LifePillar = typeof lifePillars.$inferSelect;
export type NewLifePillar = typeof lifePillars.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;

export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type DailyFocusItem = typeof dailyFocusItems.$inferSelect;
export type NewDailyFocusItem = typeof dailyFocusItems.$inferInsert;

export type FocusSession = typeof focusSessions.$inferSelect;
export type NewFocusSession = typeof focusSessions.$inferInsert;

export type AgendaEvent = typeof agendaEvents.$inferSelect;
export type NewAgendaEvent = typeof agendaEvents.$inferInsert;

export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;
