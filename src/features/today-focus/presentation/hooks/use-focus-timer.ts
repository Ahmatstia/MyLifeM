import { useState, useEffect, useRef, useCallback } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import type {
  FocusTimerMode,
  TaskEntity,
} from '../../domain/entities/daily-focus.entity';

export interface UseFocusTimerOptions {
  onSessionFinish?: (sessionData: {
    mode: FocusTimerMode;
    startedAt: string;
    endedAt: string;
    durationMinutes: number;
    taskId: string | null;
  }) => void;
}

export function useFocusTimer(options?: UseFocusTimerOptions) {
  const [mode, setMode] = useState<FocusTimerMode>('POMODORO');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<TaskEntity | null>(null);

  // References for Delta-time calculation (tahan Android Doze Mode)
  const startedAtRef = useRef<number | null>(null);
  const targetEndRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<string | null>(null);

  // Keep screen awake while timer is running
  const setKeepAwakeState = useCallback(async (active: boolean) => {
    try {
      if (active) {
        await activateKeepAwakeAsync('focus-timer');
      } else {
        deactivateKeepAwake('focus-timer');
      }
    } catch {
      // Ignore on unsupported platforms
    }
  }, []);

  useEffect(() => () => { void setKeepAwakeState(false); }, [setKeepAwakeState]);

  // Set mode & reset time
  const changeMode = useCallback((newMode: FocusTimerMode, minutes?: number) => {
    setIsRunning(false);
    setKeepAwakeState(false);
    setMode(newMode);

    let targetMin = minutes;
    if (!targetMin) {
      if (newMode === 'POMODORO') targetMin = 25;
      else if (newMode === 'DEEP_FLOW') targetMin = 50;
      else targetMin = 0; // Stopwatch
    }

    setSelectedMinutes(targetMin);
    setSecondsLeft(newMode === 'STOPWATCH' ? 0 : targetMin * 60);
    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    targetEndRef.current = null;
  }, [setKeepAwakeState]);

  // Start timer
  const startTimer = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const now = Date.now();
    startedAtRef.current = now;

    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date(now).toISOString();
    }

    if (mode !== 'STOPWATCH') {
      const remainingMs = secondsLeft * 1000;
      targetEndRef.current = now + remainingMs;
    }

    setIsRunning(true);
    setKeepAwakeState(true);
  }, [mode, secondsLeft, setKeepAwakeState]);

  // Pause timer
  const pauseTimer = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (startedAtRef.current) {
      const now = Date.now();
      accumulatedMsRef.current += now - startedAtRef.current;
    }

    startedAtRef.current = null;
    targetEndRef.current = null;
    setIsRunning(false);
    setKeepAwakeState(false);
  }, [setKeepAwakeState]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setKeepAwakeState(false);
    setSecondsLeft(mode === 'STOPWATCH' ? 0 : selectedMinutes * 60);
    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    targetEndRef.current = null;
    sessionStartTimeRef.current = null;
  }, [mode, selectedMinutes, setKeepAwakeState]);

  // Handle session finish
  const handleFinish = useCallback(async () => {
    setIsRunning(false);
    setKeepAwakeState(false);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const endedAt = new Date().toISOString();
    const startedAt = sessionStartTimeRef.current || endedAt;
    const durationMinutes =
      mode === 'STOPWATCH'
        ? Math.round(secondsLeft / 60)
        : selectedMinutes;

    if (options?.onSessionFinish) {
      options.onSessionFinish({
        mode,
        startedAt,
        endedAt,
        durationMinutes: Math.max(durationMinutes, 1),
        taskId: activeTask?.id || null,
      });
    }

    resetTimer();
  }, [mode, selectedMinutes, secondsLeft, activeTask, options, resetTimer, setKeepAwakeState]);

  // Delta-time interval loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();

        if (mode === 'STOPWATCH') {
          const currentElapsedMs =
            accumulatedMsRef.current + (startedAtRef.current ? now - startedAtRef.current : 0);
          setSecondsLeft(Math.floor(currentElapsedMs / 1000));
        } else {
          if (targetEndRef.current) {
            const deltaMs = targetEndRef.current - now;
            if (deltaMs <= 0) {
              setSecondsLeft(0);
              clearInterval(interval!);
              handleFinish();
            } else {
              setSecondsLeft(Math.ceil(deltaMs / 1000));
            }
          }
        }
      }, 500); // Check every 500ms using delta timestamp for smoothness
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, handleFinish]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  };

  // Progress ratio from 0 to 1
  const totalSecondsExpected = selectedMinutes * 60;
  const progressRatio =
    mode === 'STOPWATCH'
      ? 1
      : totalSecondsExpected > 0
      ? (totalSecondsExpected - secondsLeft) / totalSecondsExpected
      : 0;

  return {
    mode,
    selectedMinutes,
    secondsLeft,
    formattedTime: formatTime(secondsLeft),
    isRunning,
    activeTask,
    progressRatio,
    setActiveTask,
    changeMode,
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
