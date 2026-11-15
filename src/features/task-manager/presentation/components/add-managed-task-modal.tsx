import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import {
  BellRing,
  Bell,
  Zap,
  Music,
  Play,
  Square,
  FolderOpen,
  CalendarClock,
  Sparkles,
  GraduationCap,
  Briefcase,
  Rocket,
  User,
  Plus,
  X,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { fontFamily, radius, space } from '@/theme/tokens';
import { AppBottomSheet, AppText, SunButton } from '@/shared/ui';
import { formatLocalDate } from '@/shared/utils/local-date';
import {
  BUILT_IN_ALARM_TRACKS,
  computeDeadlineBufferInfo,
  formatDayAndDateIndo,
  type CreateManagedTaskInput,
  type CustomAlarmTrack,
  type TaskAlertMode,
  type TaskCategoryType,
} from '../../domain/entities/managed-task.entity';

const s = colors.sprout;

export interface AddManagedTaskModalProps {
  visible: boolean;
  alarmTracks: CustomAlarmTrack[];
  previewingTrackId: string | null;
  onClose: () => void;
  onSubmit: (input: CreateManagedTaskInput) => Promise<boolean>;
  onPickCustomSong: () => Promise<CustomAlarmTrack | null>;
  onTogglePreviewTrack: (track: CustomAlarmTrack) => void;
}

function addDaysToDateStr(baseDateStr: string, daysToAdd: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const dt = new Date(y || 2026, (m || 1) - 1, (d || 1) + daysToAdd);
  return formatLocalDate(dt);
}

function getNextWeekdayDateStr(baseDateStr: string, targetDayOfWeek: number): string {
  // targetDayOfWeek: 0 = Minggu, 1 = Senin, 2 = Selasa, ...
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const dt = new Date(y || 2026, (m || 1) - 1, d || 1);
  const currentDay = dt.getDay();
  let diff = (targetDayOfWeek - currentDay + 7) % 7;
  if (diff === 0) diff = 7;
  dt.setDate(dt.getDate() + diff);
  return formatLocalDate(dt);
}

const CATEGORIES: {
  id: TaskCategoryType;
  label: string;
  icon: typeof GraduationCap;
}[] = [
  { id: 'COLLEGE', label: 'Kuliah', icon: GraduationCap },
  { id: 'WORK', label: 'Kerja', icon: Briefcase },
  { id: 'PROJECT', label: 'Proyek', icon: Rocket },
  { id: 'PERSONAL', label: 'Pribadi', icon: User },
];

const ALERT_MODES: {
  id: TaskAlertMode;
  title: string;
  subtitle: string;
  icon: typeof BellRing;
}[] = [
  {
    id: 'ALARM',
    title: 'Alarm Berisik',
    subtitle: 'Dering layar penuh + putar lagu',
    icon: BellRing,
  },
  {
    id: 'BOTH',
    title: 'Notif + Alarm',
    subtitle: 'Ingatkan H-15m lalu dering alarm',
    icon: Zap,
  },
  {
    id: 'NOTIFICATION',
    title: 'Notifikasi Saja',
    subtitle: 'Pemberitahuan standar tanpa lagu',
    icon: Bell,
  },
];

const QUICK_EXEC_TIMES = ['08:00', '14:00', '19:00', '20:30'];

export const AddManagedTaskModal: React.FC<AddManagedTaskModalProps> = ({
  visible,
  alarmTracks,
  previewingTrackId,
  onClose,
  onSubmit,
  onPickCustomSong,
  onTogglePreviewTrack,
}) => {
  const todayStr = formatLocalDate(new Date());
  const defaultDeadline = getNextWeekdayDateStr(todayStr, 2); // Default Selasa depan
  const defaultExec = addDaysToDateStr(defaultDeadline, -2);  // Default Minggu (H-2)

  const [title, setTitle] = useState('');
  const [courseOrContext, setCourseOrContext] = useState('');
  const [categoryType, setCategoryType] = useState<TaskCategoryType>('COLLEGE');
  const [notes, setNotes] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  const [deadlineDate, setDeadlineDate] = useState(defaultDeadline);
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [executionDate, setExecutionDate] = useState(defaultExec);
  const [executionTime, setExecutionTime] = useState('19:00');

  const [alertMode, setAlertMode] = useState<TaskAlertMode>('ALARM');
  const [selectedTrack, setSelectedTrack] = useState<CustomAlarmTrack>(
    BUILT_IN_ALARM_TRACKS[0]!
  );
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);
  const [autoAddToToday, setAutoAddToToday] = useState(true);

  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bufferInfo = computeDeadlineBufferInfo(
    {
      executionDate,
      deadlineDate,
      isCompleted: false,
    },
    todayStr
  );

  const handleSelectDeadlinePreset = (newDeadline: string) => {
    setDeadlineDate(newDeadline);
    // Otomatis sesuaikan jadwal pengerjaan ke H-2 (minimal hari ini)
    const suggestedExec = addDaysToDateStr(newDeadline, -2);
    setExecutionDate(suggestedExec < todayStr ? todayStr : suggestedExec);
  };

  const handlePickSong = async () => {
    const picked = await onPickCustomSong();
    if (picked) {
      setSelectedTrack(picked);
    }
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [...prev, trimmed]);
    setSubtaskDraft('');
  };

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Judul tugas wajib diisi.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate)) {
      setErrorMessage('Format tanggal deadline harus YYYY-MM-DD.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(executionDate)) {
      setErrorMessage('Format tanggal pengerjaan harus YYYY-MM-DD.');
      return;
    }
    if (
      !/^\d{2}:\d{2}$/.test(executionTime) ||
      !/^\d{2}:\d{2}$/.test(deadlineTime)
    ) {
      setErrorMessage('Format jam harus HH:mm (contoh 19:00).');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const finalSubtasks = subtaskDraft.trim()
      ? [...subtasks, subtaskDraft.trim()]
      : subtasks;

    const ok = await onSubmit({
      title: title.trim(),
      courseOrContext: courseOrContext.trim(),
      categoryType,
      notes: notes.trim() || undefined,
      priority: 'HIGH',
      estimatedMinutes,
      executionDate,
      executionTime,
      deadlineDate,
      deadlineTime,
      alertMode,
      alarmTrackId: selectedTrack.id,
      alarmTrackName: selectedTrack.name,
      alarmTrackUri: selectedTrack.uri,
      snoozeMinutes,
      autoAddToToday,
      subtasks: finalSubtasks,
    });

    setIsSubmitting(false);
    if (ok) {
      setTitle('');
      setCourseOrContext('');
      setNotes('');
      setSubtasks([]);
      setSubtaskDraft('');
      onClose();
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Jadwalkan Tugas & Alarm"
      subtitle="Atur kapan deadline pengumpulan dan kapan kamu akan mengerjakannya dengan alarm."
      footer={
        <SunButton
          title="Simpan Tugas & Aktifkan Alarm"
          onPress={handleSave}
          loading={isSubmitting}
          disabled={!title.trim()}
        />
      }
    >
      <View style={styles.formStack}>
        {errorMessage && (
          <View style={styles.errorBanner}>
            <AppText style={styles.errorBannerText}>{errorMessage}</AppText>
          </View>
        )}

        {/* 1. Kategori & Mata Kuliah / Konteks */}
        <AppText style={styles.sectionLabel}>1. IDENTITAS TUGAS</AppText>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = categoryType === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryType(cat.id)}
                accessibilityRole="button"
                style={[
                  styles.categoryPill,
                  selected && styles.categoryPillActive,
                ]}
              >
                <Icon
                  size={15}
                  color={selected ? '#FFFFFF' : s.ink}
                  strokeWidth={2.3}
                />
                <AppText
                  style={[
                    styles.categoryPillText,
                    selected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Masukkan nama tugas"
          placeholderTextColor={s.inkSubtle}
          style={styles.inputBox}
        />

        <View style={styles.twoColRow}>
          <TextInput
            value={courseOrContext}
            onChangeText={setCourseOrContext}
            placeholder={
              categoryType === 'COLLEGE'
                ? 'Masukkan konteks tugas'
                : 'Masukkan konteks tugas'
            }
            placeholderTextColor={s.inkSubtle}
            style={[styles.inputBox, { flex: 1 }]}
          />
        </View>

        {/* Estimasi Durasi Pengerjaan */}
        <View style={styles.durationChipsRow}>
          <AppText style={styles.inlineSmallLabel}>Estimasi fokus:</AppText>
          {[30, 60, 90, 120].map((mins) => {
            const active = estimatedMinutes === mins;
            return (
              <Pressable
                key={mins}
                onPress={() => setEstimatedMinutes(mins)}
                accessibilityRole="button"
                style={[
                  styles.smallChip,
                  active && styles.smallChipActive,
                ]}
              >
                <AppText
                  style={[
                    styles.smallChipText,
                    active && styles.smallChipTextActive,
                  ]}
                >
                  {mins >= 60 ? `${mins / 60}j` : `${mins}m`}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* 2. Pengaturan Waktu Ganda: Deadline vs Kapan Dikerjakan */}
        <AppText style={styles.sectionLabel}>
          2. KAPAN DEADLINE & KAPAN DIKERJAKAN?
        </AppText>

        {/* Box A: Deadline Pengumpulan */}
        <View style={styles.dateCardDeadline}>
          <View style={styles.dateCardHeader}>
            <CalendarClock size={16} color="#B84A27" strokeWidth={2.4} />
            <AppText style={styles.dateCardTitleDeadline}>
              BATAS PENGUMPULAN (DEADLINE)
            </AppText>
          </View>

          <View style={styles.presetChipsWrap}>
            {[
              {
                label: 'Selasa Depan',
                date: getNextWeekdayDateStr(todayStr, 2),
              },
              {
                label: 'Besok',
                date: addDaysToDateStr(todayStr, 1),
              },
              {
                label: '+3 Hari',
                date: addDaysToDateStr(todayStr, 3),
              },
              {
                label: 'Minggu Depan',
                date: addDaysToDateStr(todayStr, 7),
              },
            ].map((preset) => {
              const active = deadlineDate === preset.date;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => handleSelectDeadlinePreset(preset.date)}
                  accessibilityRole="button"
                  style={[
                    styles.presetChip,
                    active && styles.presetChipDeadlineActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.presetChipText,
                      active && styles.presetChipTextActive,
                    ]}
                  >
                    {preset.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateInputRow}>
            <View style={{ flex: 1.4 }}>
              <AppText style={styles.fieldTinyLabel}>
                Tanggal Deadline ({formatDayAndDateIndo(deadlineDate)})
              </AppText>
              <TextInput
                value={deadlineDate}
                onChangeText={setDeadlineDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
            <View style={{ flex: 0.9 }}>
              <AppText style={styles.fieldTinyLabel}>Jam Batas Akhir</AppText>
              <TextInput
                value={deadlineTime}
                onChangeText={setDeadlineTime}
                placeholder="23:59"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
          </View>
        </View>

        {/* Box B: Jadwal Eksekusi (Kapan Mau Dikerjakan?) */}
        <View style={styles.dateCardExec}>
          <View style={styles.dateCardHeader}>
            <Sparkles size={16} color={s.forest} strokeWidth={2.4} />
            <AppText style={styles.dateCardTitleExec}>
              JADWAL EKSEKUSI (KAPAN MAU DIKERJAKAN?)
            </AppText>
          </View>

          <View style={styles.presetChipsWrap}>
            {[
              {
                label: '🌟 H-2 Deadline (Saran)',
                date:
                  addDaysToDateStr(deadlineDate, -2) < todayStr
                    ? todayStr
                    : addDaysToDateStr(deadlineDate, -2),
              },
              {
                label: 'Hari Minggu',
                date: getNextWeekdayDateStr(todayStr, 0),
              },
              {
                label: 'H-1 Deadline',
                date:
                  addDaysToDateStr(deadlineDate, -1) < todayStr
                    ? todayStr
                    : addDaysToDateStr(deadlineDate, -1),
              },
              {
                label: 'Hari Ini',
                date: todayStr,
              },
            ].map((preset) => {
              const active = executionDate === preset.date;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => setExecutionDate(preset.date)}
                  accessibilityRole="button"
                  style={[
                    styles.presetChip,
                    active && styles.presetChipExecActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.presetChipText,
                      active && styles.presetChipTextActive,
                    ]}
                  >
                    {preset.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateInputRow}>
            <View style={{ flex: 1.4 }}>
              <AppText style={styles.fieldTinyLabel}>
                Tanggal Kerjakan ({formatDayAndDateIndo(executionDate)})
              </AppText>
              <TextInput
                value={executionDate}
                onChangeText={setExecutionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
            <View style={{ flex: 0.9 }}>
              <AppText style={styles.fieldTinyLabel}>Jam Alarm Mulai</AppText>
              <TextInput
                value={executionTime}
                onChangeText={setExecutionTime}
                placeholder="19:00"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
          </View>

          {/* Quick Time Chips for Execution */}
          <View style={styles.quickTimeRow}>
            <AppText style={styles.fieldTinyLabel}>Pilih jam cepat:</AppText>
            {QUICK_EXEC_TIMES.map((tm) => {
              const selected = executionTime === tm;
              return (
                <Pressable
                  key={tm}
                  onPress={() => setExecutionTime(tm)}
                  accessibilityRole="button"
                  style={[
                    styles.timeQuickPill,
                    selected && styles.timeQuickPillActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.timeQuickPillText,
                      selected && styles.timeQuickPillTextActive,
                    ]}
                  >
                    {tm}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Buffer Status Indicator */}
          <View style={styles.bufferInfoStrip}>
            <AppText style={styles.bufferInfoText}>{bufferInfo.label}</AppText>
          </View>
        </View>

        {/* 3. Mode Peringatan: Alarm Berisik vs Notifikasi */}
        <AppText style={styles.sectionLabel}>
          3. MODE PERINGATAN & LAGU ALARM
        </AppText>

        <View style={styles.alertModeStack}>
          {ALERT_MODES.map((mode) => {
            const Icon = mode.icon;
            const selected = alertMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => setAlertMode(mode.id)}
                accessibilityRole="button"
                style={[
                  styles.alertModeCard,
                  selected && styles.alertModeCardActive,
                ]}
              >
                <View
                  style={[
                    styles.alertModeIconBox,
                    selected && styles.alertModeIconBoxActive,
                  ]}
                >
                  <Icon
                    size={18}
                    color={selected ? '#FFFFFF' : s.forest}
                    strokeWidth={2.4}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.alertModeTitle}>{mode.title}</AppText>
                  <AppText style={styles.alertModeSub}>{mode.subtitle}</AppText>
                </View>
                <View
                  style={[
                    styles.radioDotOuter,
                    selected && styles.radioDotOuterActive,
                  ]}
                >
                  {selected && <View style={styles.radioDotInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Custom Song Picker & Track List (Shown when Alarm is used) */}
        {(alertMode === 'ALARM' || alertMode === 'BOTH') && (
          <View style={styles.songPickerCard}>
            <View style={styles.songPickerHeader}>
              <View style={styles.songPickerTitleRow}>
                <Music size={16} color={s.forest} strokeWidth={2.5} />
                <AppText style={styles.songPickerTitle}>
                  Pilih Lagu / Suara Alarm
                </AppText>
              </View>

              <Pressable
                onPress={handlePickSong}
                accessibilityRole="button"
                accessibilityLabel="Pilih lagu alarm dari penyimpanan HP"
                style={({ pressed }) => [
                  styles.uploadSongBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <FolderOpen size={14} color={s.ink} strokeWidth={2.5} />
                <AppText style={styles.uploadSongBtnText}>
                  Pilih Lagu dari HP
                </AppText>
              </Pressable>
            </View>

            <View style={styles.trackListStack}>
              {alarmTracks.map((track) => {
                const isSelected = selectedTrack.id === track.id;
                const isPreviewing = previewingTrackId === track.id;
                return (
                  <View
                    key={track.id}
                    style={[
                      styles.trackRow,
                      isSelected && styles.trackRowSelected,
                    ]}
                  >
                    <Pressable
                      onPress={() => setSelectedTrack(track)}
                      accessibilityRole="button"
                      style={styles.trackSelectArea}
                    >
                      <View
                        style={[
                          styles.radioDotOuter,
                          isSelected && styles.radioDotOuterActive,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDotInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          style={[
                            styles.trackNameText,
                            isSelected && styles.trackNameTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {track.isBuiltIn ? track.name : `🎵 ${track.name}`}
                        </AppText>
                        {track.description ? (
                          <AppText
                            style={styles.trackDescText}
                            numberOfLines={1}
                          >
                            {track.description}
                          </AppText>
                        ) : null}
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => onTogglePreviewTrack(track)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isPreviewing
                          ? `Hentikan preview ${track.name}`
                          : `Putar preview ${track.name}`
                      }
                      style={[
                        styles.previewPlayBtn,
                        isPreviewing && styles.previewPlayBtnActive,
                      ]}
                    >
                      {isPreviewing ? (
                        <Square
                          size={12}
                          color="#FFFFFF"
                          fill="#FFFFFF"
                          strokeWidth={2.4}
                        />
                      ) : (
                        <Play
                          size={13}
                          color={s.forest}
                          fill={s.forest}
                          strokeWidth={2.4}
                        />
                      )}
                      <AppText
                        style={[
                          styles.previewPlayBtnText,
                          isPreviewing && { color: '#FFFFFF' },
                        ]}
                      >
                        {isPreviewing ? 'Stop' : 'Tes'}
                      </AppText>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Snooze Duration Selector */}
            <View style={styles.snoozeConfigRow}>
              <AppText style={styles.fieldTinyLabel}>
                Durasi Tunda (Snooze):
              </AppText>
              {[5, 10, 15].map((mins) => {
                const active = snoozeMinutes === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => setSnoozeMinutes(mins)}
                    accessibilityRole="button"
                    style={[
                      styles.smallChip,
                      active && styles.smallChipActive,
                    ]}
                  >
                    <AppText
                      style={[
                        styles.smallChipText,
                        active && styles.smallChipTextActive,
                      ]}
                    >
                      {mins} mnt
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 4. Sub-tugas / Langkah Pengerjaan & Auto-Sync Hari Ini */}
        <AppText style={styles.sectionLabel}>
          4. CHECKLIST LANGKAH & SINKRONISASI
        </AppText>

        <View style={styles.subtaskInputRow}>
          <TextInput
            value={subtaskDraft}
            onChangeText={setSubtaskDraft}
            onSubmitEditing={handleAddSubtask}
            placeholder="Masukkan langkah tugas"
            placeholderTextColor={s.inkSubtle}
            style={[styles.inputBox, { flex: 1 }]}
          />
          <Pressable
            onPress={handleAddSubtask}
            accessibilityRole="button"
            style={styles.addSubtaskCircle}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        </View>

        {subtasks.length > 0 && (
          <View style={styles.subtaskChipsList}>
            {subtasks.map((st, idx) => (
              <View key={`${st}-${idx}`} style={styles.subtaskDraftItem}>
                <AppText style={styles.subtaskDraftText} numberOfLines={1}>
                  {idx + 1}. {st}
                </AppText>
                <Pressable
                  onPress={() => handleRemoveSubtask(idx)}
                  hitSlop={6}
                >
                  <X size={14} color={s.inkMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.autoSyncRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText style={styles.autoSyncTitle}>
              Otomatis Masuk ke &ldquo;Hari Ini&rdquo;
            </AppText>
            <AppText style={styles.autoSyncSub}>
              Saat tanggal pengerjaan tiba, tugas otomatis tampil di layar Hari
              Ini.
            </AppText>
          </View>
          <Switch
            value={autoAddToToday}
            onValueChange={setAutoAddToToday}
            trackColor={{ false: '#D8D0BE', true: s.forest }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  formStack: {
    gap: space[3],
    paddingBottom: space[4],
  },
  errorBanner: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  errorBannerText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.onErrorContainer,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.7,
    color: s.forest,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3EDE0',
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  categoryPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  categoryPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DEC9',
    borderRadius: 16,
    paddingHorizontal: space[3],
    paddingVertical: 12,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: s.ink,
    ...formInputBase,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineSmallLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.inkMuted,
    marginRight: 4,
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1EBDC',
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  smallChipActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  smallChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  smallChipTextActive: {
    color: '#FFFFFF',
  },
  dateCardDeadline: {
    backgroundColor: '#FFF7F2',
    borderRadius: 20,
    padding: space[3],
    borderWidth: 1,
    borderColor: '#F3D5C5',
    gap: 10,
  },
  dateCardExec: {
    backgroundColor: '#F2F9F5',
    borderRadius: 20,
    padding: space[3],
    borderWidth: 1,
    borderColor: '#C9E5D4',
    gap: 10,
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateCardTitleDeadline: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#B84A27',
  },
  dateCardTitleExec: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: s.forest,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3DAC6',
  },
  presetChipDeadlineActive: {
    backgroundColor: '#B84A27',
    borderColor: '#B84A27',
  },
  presetChipExecActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  presetChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.ink,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldTinyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.inkMuted,
    marginBottom: 4,
  },
  compactDateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD6C3',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  quickTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeQuickPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E5DC',
  },
  timeQuickPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  timeQuickPillText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  timeQuickPillTextActive: {
    color: '#FFFFFF',
  },
  bufferInfoStrip: {
    backgroundColor: '#E1F3E8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bufferInfoText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  alertModeStack: {
    gap: 8,
  },
  alertModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  alertModeCardActive: {
    borderColor: s.forest,
    backgroundColor: '#F5FBF7',
  },
  alertModeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertModeIconBoxActive: {
    backgroundColor: s.forest,
  },
  alertModeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  alertModeSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: s.inkMuted,
  },
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C5BBA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotOuterActive: {
    borderColor: s.forest,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: s.forest,
  },
  songPickerCard: {
    backgroundColor: '#FAF6EC',
    borderRadius: 20,
    padding: space[3],
    borderWidth: 1,
    borderColor: '#E5DEC9',
    gap: 10,
  },
  songPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  songPickerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  songPickerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  uploadSongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: s.sun,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  uploadSongBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.ink,
  },
  trackListStack: {
    gap: 6,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#EAE2CE',
  },
  trackRowSelected: {
    borderColor: s.forest,
    backgroundColor: '#F4FBF6',
  },
  trackSelectArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackNameText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: s.ink,
  },
  trackNameTextSelected: {
    color: s.forest,
  },
  trackDescText: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: s.inkMuted,
  },
  previewPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: s.leafSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  previewPlayBtnActive: {
    backgroundColor: '#D64545',
  },
  previewPlayBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: s.forest,
  },
  snoozeConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSubtaskCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: s.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskChipsList: {
    gap: 6,
  },
  subtaskDraftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5DEC9',
  },
  subtaskDraftText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.ink,
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  autoSyncTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: s.ink,
  },
  autoSyncSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: s.inkMuted,
  },
});
