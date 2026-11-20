import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { formatLocalDate } from '@/shared/utils/local-date';
import {
  BUILT_IN_ALARM_TRACKS,
  type CreateManagedTaskInput,
  type CustomAlarmTrack,
  type ManagedTaskEntity,
} from '../../domain/entities/managed-task.entity';
import {
  managedTaskRepository,
  subscribeManagedTasksChange,
  triggerAlarmNow,
} from '../../data/repositories/managed-task.repository';
import { TaskAlarmAudioService } from '../../data/services/task-alarm-audio.service';

export function useManagedTasks() {
  const [tasks, setTasks] = useState<ManagedTaskEntity[]>([]);
  const [alarmTracks, setAlarmTracks] = useState<CustomAlarmTrack[]>(
    BUILT_IN_ALARM_TRACKS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorVersion = useRef(0);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(
    null
  );

  const loadAll = useCallback(async () => {
    const version = errorVersion.current;
    try {
      await managedTaskRepository.syncWithCoreTasksAndToday();
      const [taskList, trackList] = await Promise.all([
        managedTaskRepository.getAllTasks(),
        managedTaskRepository.getAllAlarmTracks(),
      ]);
      setTasks(taskList);
      setAlarmTracks(trackList);
      if (version === errorVersion.current) setError(null);
    } catch (err) {
      if (version === errorVersion.current) setError(
        err instanceof Error ? err.message : 'Gagal memuat daftar tugas.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAll();
      return () => {
        TaskAlarmAudioService.stopPreview();
        setPreviewingTrackId(null);
      };
    }, [loadAll])
  );

  useEffect(() => {
    return subscribeManagedTasksChange(() => {
      void loadAll();
    });
  }, [loadAll]);

  const addTask = async (input: CreateManagedTaskInput): Promise<boolean> => {
    try {
      await managedTaskRepository.createTask(input);
      await loadAll();
      return true;
    } catch (err) {
      errorVersion.current++;
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan tugas baru.'
      );
      return false;
    }
  };

  const mutateTask = async (work: () => Promise<void>) => {
    try {
      await work();
      await loadAll();
    } catch (err) {
      errorVersion.current++;
      setError(err instanceof Error ? err.message : 'Perubahan tugas belum tersimpan. Coba lagi.');
    }
  };

  const toggleTask = (id: string) => mutateTask(() => managedTaskRepository.toggleTaskCompletion(id));
  const toggleSubtask = (taskId: string, subtaskId: string) => mutateTask(() => managedTaskRepository.toggleSubtask(taskId, subtaskId));
  const deleteTask = (id: string) => mutateTask(() => managedTaskRepository.deleteTask(id));

  const pickAndSaveCustomSong = async (): Promise<CustomAlarmTrack | null> => {
    try {
      const picked = await TaskAlarmAudioService.pickCustomSongFromDevice();
      if (!picked) return null;
      const updatedTracks = await managedTaskRepository.addCustomAlarmTrack(
        picked
      );
      setAlarmTracks(updatedTracks);
      return picked;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memilih berkas lagu dari penyimpanan.'
      );
      return null;
    }
  };

  const togglePreviewTrack = async (track: CustomAlarmTrack) => {
    if (previewingTrackId === track.id) {
      TaskAlarmAudioService.stopPreview();
      setPreviewingTrackId(null);
      return;
    }
    setPreviewingTrackId(track.id);
    await TaskAlarmAudioService.previewTrack(track);
  };

  const stopPreview = () => {
    TaskAlarmAudioService.stopPreview();
    setPreviewingTrackId(null);
  };

  const simulateAlarm = (task: ManagedTaskEntity) => {
    stopPreview();
    triggerAlarmNow(task);
  };

  const todayDate = formatLocalDate(new Date());

  return {
    tasks,
    alarmTracks,
    isLoading,
    error,
    todayDate,
    previewingTrackId,
    refresh: loadAll,
    addTask,
    toggleTask,
    toggleSubtask,
    deleteTask,
    pickAndSaveCustomSong,
    togglePreviewTrack,
    stopPreview,
    simulateAlarm,
  };
}

