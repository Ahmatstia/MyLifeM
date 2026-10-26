import { parseInstant } from '@/shared/utils/local-date';
import type { FocusTimerMode } from './entities/daily-focus.entity';

export const TIMER_KEY = 'focus_timer_v1';
export interface TimerState {
  version: 1; id: string; mode: FocusTimerMode; taskId: string | null; taskTitle: string | null;
  startedAt: string; elapsedMs: number; runStartedAt: number | null; targetMs: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED'; endedAt: string | null;
}

export function parseTimer(value: string): TimerState {
  const s: TimerState = JSON.parse(value);
  const keys = ['version','id','mode','taskId','taskTitle','startedAt','elapsedMs','runStartedAt','targetMs','status','endedAt'];
  if (!s || Object.keys(s).length !== keys.length || Object.keys(s).some(key => !keys.includes(key)) || s.version !== 1
    || typeof s.id !== 'string' || !s.id.trim() || !['POMODORO','DEEP_FLOW','STOPWATCH'].includes(s.mode)
    || (s.taskId !== null && (typeof s.taskId !== 'string' || !s.taskId.trim())) || (s.taskTitle !== null && typeof s.taskTitle !== 'string')
    || !Number.isSafeInteger(s.elapsedMs) || s.elapsedMs < 0 || !Number.isSafeInteger(s.targetMs) || s.targetMs < 0 || s.targetMs > 1440 * 60_000
    || (s.mode === 'STOPWATCH' ? s.targetMs !== 0 : s.targetMs < 60_000 || s.elapsedMs > s.targetMs)
    || !['RUNNING','PAUSED','COMPLETED'].includes(s.status)) throw new Error('Data timer tidak valid; catatan asli dipertahankan.');
  const start = parseInstant(s.startedAt).getTime();
  if (s.status === 'RUNNING' ? !Number.isSafeInteger(s.runStartedAt) || s.runStartedAt! < start : s.runStartedAt !== null) throw new Error('Status waktu timer tidak valid.');
  if (s.status === 'COMPLETED' ? s.endedAt === null || parseInstant(s.endedAt).getTime() < start : s.endedAt !== null) throw new Error('Waktu selesai timer tidak valid.');
  if ((s.status === 'RUNNING' && s.elapsedMs > s.runStartedAt! - start) || (s.status === 'COMPLETED' && s.elapsedMs > Date.parse(s.endedAt!) - start)) throw new Error('Durasi timer melebihi rentang sesi.');
  return s;
}

export function elapsedAt(state: TimerState, now: number): number {
  const elapsed = state.elapsedMs + (state.runStartedAt === null ? 0 : Math.max(0, now - state.runStartedAt));
  return state.mode === 'STOPWATCH' ? elapsed : Math.min(state.targetMs, elapsed);
}

export function timerDue(state: TimerState, now: number): boolean {
  return state.status === 'RUNNING' && state.mode !== 'STOPWATCH' && elapsedAt(state, now) >= state.targetMs;
}

export function finishTimerState(state: TimerState, now: number): TimerState {
  if (state.status === 'COMPLETED') return state;
  const ended = timerDue(state, now) ? state.runStartedAt! + state.targetMs - state.elapsedMs : Math.max(now, Date.parse(state.startedAt) + elapsedAt(state, now), state.runStartedAt ?? 0);
  return { ...state, elapsedMs: elapsedAt(state, ended), runStartedAt: null, status: 'COMPLETED', endedAt: new Date(ended).toISOString() };
}
