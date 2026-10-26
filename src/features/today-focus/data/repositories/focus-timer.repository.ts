import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { userSettings, tasks, focusSessions } from '@/db/schema';
import { normalizeTaskStatus } from '@/shared/domain/task-status';
import { TIMER_KEY, parseTimer, elapsedAt, finishTimerState, timerDue, type TimerState } from '../../domain/focus-timer';
import type { FocusTimerMode } from '../../domain/entities/daily-focus.entity';
import { insertFocusSession } from './daily-focus.repository.impl';

type Transaction = Pick<typeof db, 'select' | 'insert' | 'update' | 'delete'>;
function read(tx: Transaction): TimerState | null {
  const row = tx.select().from(userSettings).where(eq(userSettings.key, TIMER_KEY)).get();
  return row ? parseTimer(row.value) : null;
}
function write(tx: Transaction, state: TimerState) {
  const value = JSON.stringify(state); parseTimer(value);
  tx.insert(userSettings).values({ key: TIMER_KEY, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({ target: userSettings.key, set: { value, updatedAt: new Date().toISOString() } }).run();
}
function complete(tx: Transaction, state: TimerState, now: number) {
  if (state.status === 'COMPLETED') return state;
  const done = finishTimerState(state, now);
  const task = done.taskId ? tx.select().from(tasks).where(eq(tasks.id, done.taskId)).get() : null;
  insertFocusSession(tx, done.id, { taskId: task?.id ?? null, mode: done.mode, startedAt: done.startedAt,
    endedAt: done.endedAt!, durationMinutes: Math.floor(done.elapsedMs / 60_000) }, done.taskTitle);
  write(tx, done);
  return done;
}

export const focusTimerRepository = {
  load(now = Date.now()): TimerState | null {
    return db.transaction(tx => { const state = read(tx); return state && timerDue(state, now) ? complete(tx, state, now) : state; });
  },
  start(mode: FocusTimerMode, minutes: number, taskId: string | null, now = Date.now()): TimerState {
    return db.transaction(tx => {
      if (read(tx)) throw new Error('Masih ada sesi atau refleksi. Akhiri sesi sebelumnya dahulu.');
      const task = taskId ? tx.select().from(tasks).where(eq(tasks.id, taskId)).get() : null;
      if (taskId && (!task || !['TODO','IN_PROGRESS'].includes(normalizeTaskStatus(task.status)))) throw new Error('Pilih tugas aktif yang belum selesai.');
      const state: TimerState = { version: 1, id: `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`, mode,
        taskId, taskTitle: task?.title ?? null, startedAt: new Date(now).toISOString(), elapsedMs: 0, runStartedAt: now,
        targetMs: mode === 'STOPWATCH' ? 0 : minutes * 60_000, status: 'RUNNING', endedAt: null };
      write(tx, state); return state;
    });
  },
  transition(id: string, action: 'pause' | 'resume' | 'finish', now = Date.now()): TimerState {
    return db.transaction(tx => {
      const state = read(tx);
      if (!state || state.id !== id) throw new Error('Timer sudah berubah. Muat ulang sebelum melanjutkan.');
      if (state.status === 'COMPLETED') return state;
      if (action === 'finish' || timerDue(state, now)) return complete(tx, state, now);
      if (action === 'pause' && state.status === 'RUNNING') {
        const paused: TimerState = { ...state, elapsedMs: elapsedAt(state, now), runStartedAt: null, status: 'PAUSED' };
        write(tx, paused); return paused;
      }
      if (action === 'resume' && state.status === 'PAUSED') {
        const resumed: TimerState = { ...state, runStartedAt: Math.max(now, Date.parse(state.startedAt) + state.elapsedMs), status: 'RUNNING' };
        write(tx, resumed); return resumed;
      }
      return state;
    });
  },
  dismiss(id: string, reflection?: { rating: number; obstacle?: string; nextAction?: string }): void {
    db.transaction(tx => {
      const state = read(tx);
      if (!state) return;
      if (state.id !== id || state.status !== 'COMPLETED') throw new Error('Sesi belum selesai atau telah berubah.');
      if (!tx.select().from(focusSessions).where(eq(focusSessions.id, id)).get()) throw new Error('Catatan sesi tidak ditemukan.');
      if (reflection) {
        if (!Number.isSafeInteger(reflection.rating) || reflection.rating < 1 || reflection.rating > 5) throw new Error('Penilaian harus 1–5.');
        tx.update(focusSessions).set({ rating: reflection.rating, obstacle: reflection.obstacle?.trim() || null, nextAction: reflection.nextAction?.trim() || null }).where(eq(focusSessions.id, id)).run();
      }
      tx.delete(userSettings).where(eq(userSettings.key, TIMER_KEY)).run();
    });
  },
};
