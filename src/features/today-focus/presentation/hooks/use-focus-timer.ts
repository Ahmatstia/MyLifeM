import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { settingsRepository } from '@/features/settings/data/repositories/settings.repository.impl';
import { DEFAULT_SETTINGS } from '@/features/settings/domain/entities/settings.entity';
import { focusTimerRepository } from '../../data/repositories/focus-timer.repository';
import { elapsedAt, timerDue, type TimerState } from '../../domain/focus-timer';
import type { FocusTimerMode, TaskEntity } from '../../domain/entities/daily-focus.entity';

export interface UseFocusTimerOptions { onSessionRecorded?: () => void | Promise<void>; }

export function useFocusTimer(options?: UseFocusTimerOptions) {
  const [state, setState] = useState<TimerState | null>(null);
  const current = useRef<TimerState | null>(null);
  const completionBlocked = useRef(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState(DEFAULT_SETTINGS);
  const [idleMode, setIdleMode] = useState<FocusTimerMode>('POMODORO');
  const [selectedTask, setSelectedTask] = useState<Pick<TaskEntity, 'id' | 'title'> | null>(null);
  const [now, setNow] = useState(Date.now);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  const recorded = useRef(options?.onSessionRecorded);
  useEffect(() => { recorded.current = options?.onSessionRecorded; }, [options?.onSessionRecorded]);
  const accept = useCallback((next: TimerState | null) => {
    completionBlocked.current = false;
    const previous = current.current;
    current.current = next; setState(next); setNow(Date.now()); setError(null); setReady(true);
    if (next?.status === 'COMPLETED' && previous?.status !== 'COMPLETED') {
      void Promise.resolve().then(() => recorded.current?.()).catch(() => { /* The session already committed; list retry is separate. */ });
    }
  }, []);
  const reload = useCallback(() => {
    try { accept(focusTimerRepository.load()); }
    catch (err) { completionBlocked.current = true; setError(err instanceof Error ? err.message : 'Timer belum dapat dipulihkan. Coba lagi.'); }
  }, [accept]);
  useFocusEffect(useCallback(() => {
    let alive = true;
    reload(); setSettingsReady(false);
    void settingsRepository.getSettings().then(value => { if (alive) { setPreferences(value); setSettingsReady(true); } }).catch(() => { if (alive) setError('Pengaturan timer belum dapat dimuat. Coba lagi.'); });
    return () => { alive = false; };
  }, [reload]));
  useEffect(() => {
    const listener = AppState.addEventListener('change', value => { setForeground(value === 'active'); if (value === 'active') reload(); });
    return () => listener.remove();
  }, [reload]);
  useEffect(() => {
    if (state?.status !== 'RUNNING' || !foreground) return;
    const interval = setInterval(() => {
      const time = Date.now(); setNow(time);
      if (!completionBlocked.current && current.current && timerDue(current.current, time)) reload();
    }, 500);
    return () => clearInterval(interval);
  }, [state?.status, foreground, reload]);
  useEffect(() => {
    if (state?.status !== 'RUNNING' || !preferences.keepAwakeEnabled || !foreground) return;
    const tag = `focus-timer-${Date.now()}-${Math.random()}`;
    let disposed = false;
    void activateKeepAwakeAsync(tag).then(() => { if (disposed) void deactivateKeepAwake(tag).catch(() => {}); }).catch(() => {});
    return () => { disposed = true; void deactivateKeepAwake(tag).catch(() => {}); };
  }, [state?.status, preferences.keepAwakeEnabled, foreground]);
  const haptic = () => { try { if (preferences.hapticsEnabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); } catch { /* Optional native feedback cannot undo a committed action. */ } };
  const mode = state?.mode ?? idleMode;
  const selectedMinutes = state ? state.targetMs / 60_000 : mode === 'POMODORO' ? preferences.pomodoroMinutes : mode === 'DEEP_FLOW' ? preferences.deepFlowMinutes : 0;
  const transition = (action: 'pause' | 'resume' | 'finish') => {
    try {
      if (!current.current) return;
      accept(focusTimerRepository.transition(current.current.id, action)); haptic();
    } catch (err) { setError(err instanceof Error ? err.message : 'Perubahan timer belum tersimpan.'); }
  };
  const startTimer = () => {
    if (!ready || !settingsReady) return;
    if (current.current?.status === 'PAUSED') { transition('resume'); return; }
    if (current.current) return;
    try { accept(focusTimerRepository.start(mode, selectedMinutes, selectedTask?.id ?? null)); haptic(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Timer belum dimulai.'); }
  };
  const changeMode = (next: FocusTimerMode) => {
    if (current.current) { setError('Akhiri dan catat sesi sebelum mengganti mode atau tugas.'); return; }
    setIdleMode(next); setError(null);
  };
  const setActiveTask = (task: Pick<TaskEntity, 'id' | 'title'> | null) => {
    if (current.current) { setError('Akhiri dan catat sesi sebelum mengganti mode atau tugas.'); return; }
    setSelectedTask(task);
  };
  const resetTimer = () => {
    if (current.current) { setError('Gunakan Akhiri & catat agar aktivitas tidak hilang.'); return; }
    setError(null);
  };
  const dismissReflection = () => {
    try { if (current.current) focusTimerRepository.dismiss(current.current.id); accept(null); setSelectedTask(null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Refleksi belum dapat ditutup.'); }
  };
  const saveReflection = async (reflection: { rating: number; obstacle?: string; nextAction?: string }) => {
    if (!current.current || current.current.status !== 'COMPLETED') throw new Error('Sesi belum tercatat.');
    focusTimerRepository.dismiss(current.current.id, reflection); accept(null); setSelectedTask(null);
  };
  const elapsed = state ? elapsedAt(state, now) : 0;
  const secondsLeft = Math.max(0, mode === 'STOPWATCH' ? Math.floor(elapsed / 1000) : Math.ceil((selectedMinutes * 60_000 - elapsed) / 1000));
  const minutes = Math.floor(secondsLeft / 60), seconds = secondsLeft % 60;
  const activeTask = state ? state.taskTitle ? { id: state.taskId ?? state.id, title: state.taskTitle } : null : selectedTask;
  return { mode, selectedMinutes, secondsLeft, formattedTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    isRunning: state?.status === 'RUNNING', hasSession: state !== null, activeTask,
    progressRatio: selectedMinutes ? Math.min(1, elapsed / (selectedMinutes * 60_000)) : 0,
    preferences, ready: ready && settingsReady, error, retry: () => { reload(); void settingsRepository.getSettings().then(value => { setPreferences(value); setSettingsReady(true); }).catch(() => setError('Pengaturan timer belum dapat dimuat. Coba lagi.')); }, reflection: state?.status === 'COMPLETED' ? state : null,
    changeMode, setActiveTask, startTimer, pauseTimer: () => transition('pause'), finishTimer: () => transition('finish'), resetTimer,
    dismissReflection, saveReflection };
}
