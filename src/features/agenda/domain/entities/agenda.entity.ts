/**
 * Agenda Domain Entity & Types
 * Pure domain logic for chronological daily events and flexible tasks.
 */

export type AgendaEventType = 'WORK' | 'PERSONAL' | 'LEARNING' | 'MEETING';

export interface AgendaEventEntity {
  id: string;
  targetId: string | null;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string | null;
  startTime: string; // ISO-8601
  endTime: string;   // ISO-8601
  isAllDay: boolean;
  eventType: AgendaEventType;
  location: string | null;
  reminderMinutes: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgendaInput {
  title: string;
  description?: string;
  startTime: string; // ISO-8601
  endTime: string;   // ISO-8601
  isAllDay?: boolean;
  eventType?: AgendaEventType;
  location?: string;
  reminderMinutes?: number;
  targetId?: string | null;
  projectId?: string | null;
}
