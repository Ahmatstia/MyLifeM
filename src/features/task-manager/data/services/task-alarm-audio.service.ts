import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BUILT_IN_ALARM_TRACKS,
  type CustomAlarmTrack,
} from '../../domain/entities/managed-task.entity';

interface AudioPlayerLike {
  loop: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  remove: () => void;
}

let activeAlarmPlayer: AudioPlayerLike | null = null;
let activePreviewPlayer: AudioPlayerLike | null = null;
let vibrationTimer: ReturnType<typeof setInterval> | null = null;
let previewStopTimer: ReturnType<typeof setTimeout> | null = null;
let vibrationDelayTimer: ReturnType<typeof setTimeout> | null = null;
let alarmGeneration = 0;
let previewGeneration = 0;
let alarmRequested = false;

function releasePlayer(player: AudioPlayerLike | null): void {
  if (!player) return;
  // Each cleanup is independent: a failed pause must not prevent release.
  try { player.volume = 0; } catch {}
  try { player.pause(); } catch {}
  try { player.remove(); } catch {}
}

/**
 * Menghasilkan berkas WAV PCM 16-bit mono asli secara programatik untuk nada alarm bawaan
 * agar selalu dapat berbunyi nyaring secara offline di perangkat tanpa bergantung koneksi internet.
 */
function buildSynthesizedWavBytes(
  preset: 'siren' | 'digital' | 'chime'
): Uint8Array {
  const sampleRate = 22050;
  const durationSeconds = 4;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (preset === 'siren') {
      // Alternating dual-tone urgent alarm (880Hz <-> 1320Hz every 0.22s)
      const cycle = Math.floor(t / 0.22) % 2;
      const freq = cycle === 0 ? 880 : 1320;
      const raw = Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t);
      sample = Math.max(-1, Math.min(1, raw * 0.85));
    } else if (preset === 'digital') {
      // Classic rapid digital desk alarm: 4 quick beeps per second at 1046Hz
      const beat = t % 1.0;
      const isBeepOn =
        (beat >= 0.0 && beat < 0.11) ||
        (beat >= 0.16 && beat < 0.27) ||
        (beat >= 0.32 && beat < 0.43) ||
        (beat >= 0.48 && beat < 0.62);
      if (isBeepOn) {
        const wave = Math.sin(2 * Math.PI * 1046.5 * t) >= 0 ? 0.8 : -0.8;
        sample = wave;
      }
    } else {
      // Ascending chime arpeggio (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const noteIdx = Math.floor((t * 4) % notes.length);
      const noteTime = (t * 4) % 1;
      const env = Math.exp(-noteTime * 3.2);
      const freq = notes[noteIdx] ?? 523.25;
      sample = Math.sin(2 * Math.PI * freq * t) * env * 0.85;
    }

    const pcm16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    view.setInt16(44 + i * 2, pcm16, true);
  }

  return new Uint8Array(buffer);
}

async function resolvePlayableUri(trackUri: string | null): Promise<string | null> {
  if (!trackUri) return null;
  if (!trackUri.startsWith('builtin://')) {
    if (trackUri.startsWith('file://')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { File } = require('expo-file-system');
        if (!new File(trackUri).exists) return null;
      } catch { return null; }
    }
    return trackUri;
  }

  if (Platform.OS === 'web') return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { File, Paths } = require('expo-file-system');
    const key = trackUri.replace('builtin://', '');
    const preset: 'siren' | 'digital' | 'chime' =
      key === 'siren-energize'
        ? 'siren'
        : key === 'digital-pulse'
          ? 'digital'
          : 'chime';
    const file = new File(Paths.cache, `mylife-alarm-${preset}-v1.wav`);
    if (!file.exists) {
      file.create({ overwrite: true });
      file.write(buildSynthesizedWavBytes(preset));
    }
    return file.uri;
  } catch {
    return null;
  }
}

async function configureLoudAudioSession(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const expoAudio = require('expo-audio');
    if (typeof expoAudio.setAudioModeAsync === 'function') {
      await expoAudio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
    }
  } catch {
    // Ignore on unsupported environments
  }
}

export class TaskAlarmAudioService {
  /**
   * Membuka pemilih berkas lagu/audio (MP3, WAV, M4A, OGG) dari penyimpanan HP pengguna
   * dan menyalinnya ke direktori dokumen aplikasi agar tersimpan permanen.
   */
  static async pickCustomSongFromDevice(): Promise<CustomAlarmTrack | null> {
    if (Platform.OS === 'web') {
      throw new Error(
        'Pemilihan berkas lagu dari penyimpanan hanya tersedia di aplikasi Android/iOS.'
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { File, Paths } = require('expo-file-system');
    const picked = await File.pickFileAsync({
      mimeTypes: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/mp4',
        'audio/x-m4a',
        'audio/ogg',
        'audio/aac',
        'audio/*',
      ],
    });

    if (!picked || picked.canceled) {
      return null;
    }

    const sourceFile = Array.isArray(picked.result)
      ? picked.result[0]
      : picked.result;
    if (!sourceFile || !sourceFile.uri) {
      return null;
    }

    const rawName: string =
      sourceFile.name ||
      decodeURIComponent(sourceFile.uri.split('/').pop() || 'Lagu_Alarm.mp3');
    const cleanName = rawName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    const extMatch = /\.[a-zA-Z0-9]{2,5}$/.exec(rawName);
    const ext = extMatch ? extMatch[0].toLowerCase() : '.mp3';

    const trackId = 'custom-song-' + Date.now();
    const destFile = new File(Paths.document, `alarm-song-${trackId}${ext}`);

    try {
      sourceFile.copy(destFile);
    } catch {
      throw new Error('Lagu belum dapat disalin ke aplikasi. Pilih berkas lain agar aksesnya tetap tersedia setelah aplikasi dibuka ulang.');
    }

    return {
      id: trackId,
      name: cleanName || 'Lagu Kustom',
      uri: destFile.uri,
      isBuiltIn: false,
      description: 'Tersimpan di aplikasi dari penyimpanan HP',
    };
  }

  /**
   * Memutar preview lagu/nada alarm (selama maks 8 detik atau sampai dihentikan).
   */
  static async previewTrack(track: CustomAlarmTrack): Promise<boolean> {
    this.stopPreview();
    if (alarmRequested) return false;
    const generation = previewGeneration;
    await configureLoudAudioSession();
    if (generation !== previewGeneration) return false;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    if (generation !== previewGeneration) return false;
    const playableUri = await resolvePlayableUri(track.uri);
    if (!playableUri || generation !== previewGeneration) return false;

    let player: AudioPlayerLike | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createAudioPlayer }: typeof import('expo-audio') = require('expo-audio');
      player = createAudioPlayer(playableUri);
      activePreviewPlayer = player;
      player.loop = true;
      player.volume = 1;
      player.play();
      previewStopTimer = setTimeout(() => {
        if (generation === previewGeneration) this.stopPreview();
      }, 8000);
      return true;
    } catch {
      releasePlayer(player);
      if (activePreviewPlayer === player) activePreviewPlayer = null;
      return false;
    }
  }

  static stopPreview(): void {
    previewGeneration++;
    if (previewStopTimer) clearTimeout(previewStopTimer);
    previewStopTimer = null;
    const player = activePreviewPlayer;
    activePreviewPlayer = null;
    releasePlayer(player);
  }

  static async startAlarmRinging(trackUri: string | null): Promise<void> {
    this.stopPreview();
    this.stopAlarmRinging();
    alarmRequested = true;
    const generation = alarmGeneration;
    await configureLoudAudioSession();
    if (generation !== alarmGeneration) return;
    const playableUri = (await resolvePlayableUri(trackUri))
      ?? (await resolvePlayableUri(BUILT_IN_ALARM_TRACKS[0]!.uri));
    if (generation !== alarmGeneration) return;

    const triggerVibrationBurst = () => {
      if (generation !== alarmGeneration) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      vibrationDelayTimer = setTimeout(() => {
        vibrationDelayTimer = null;
        if (generation === alarmGeneration) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        }
      }, 300);
    };
    triggerVibrationBurst();
    vibrationTimer = setInterval(triggerVibrationBurst, 1400);
    if (!playableUri) throw new Error('Nada alarm belum tersedia. Periksa berkas lagu atau pilih nada bawaan.');

    let player: AudioPlayerLike | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createAudioPlayer }: typeof import('expo-audio') = require('expo-audio');
      player = createAudioPlayer(playableUri);
      activeAlarmPlayer = player;
      player.loop = true;
      player.volume = 1;
      player.play();
    } catch {
      releasePlayer(player);
      if (activeAlarmPlayer === player) activeAlarmPlayer = null;
      throw new Error('Suara alarm belum dapat diputar. Periksa volume dan berkas lagu.');
    }
  }

  static stopAlarmRinging(): void {
    alarmGeneration++;
    alarmRequested = false;
    if (vibrationTimer) clearInterval(vibrationTimer);
    if (vibrationDelayTimer) clearTimeout(vibrationDelayTimer);
    vibrationTimer = null;
    vibrationDelayTimer = null;
    const player = activeAlarmPlayer;
    activeAlarmPlayer = null;
    releasePlayer(player);
  }
}

