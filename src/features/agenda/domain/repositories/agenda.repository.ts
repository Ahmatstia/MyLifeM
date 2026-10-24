import type {
  AgendaEventEntity,
  CreateAgendaInput,
} from '../entities/agenda.entity';

export interface AgendaRepository {
  getEventsForDate(dateStr: string): Promise<AgendaEventEntity[]>;
  createEvent(input: CreateAgendaInput): Promise<AgendaEventEntity>;
  toggleEventCompletion(id: string, isCompleted: boolean): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}
