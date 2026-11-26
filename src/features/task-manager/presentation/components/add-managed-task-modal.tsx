import { AppSwitch as Switch } from '@/shared/ui/app-switch';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
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
import { formInputBase, formInputCompact } from '@/shared/ui/form-control-styles';
import { fontFamily, radius, space, stroke, typography, touchTarget } from '@/theme/tokens';
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
import { validateManagedTaskTiming } from '../../domain/managed-task-validation';

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
  { id: 'PROJECT', label: 'Target', icon: Rocket },
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
    try {
      validateManagedTaskTiming({ executionDate, executionTime, deadlineDate, deadlineTime });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Tanggal atau jam tidak valid.');
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
    } else {
      setErrorMessage('Tugas belum tersimpan. Silakan coba lagi.');
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

        <AppText style={styles.sectionLabel}>Nama tugas</AppText>
        <TextInput accessibilityLabel="Nama tugas"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Masukkan nama tugas"
          placeholderTextColor={s.inkSubtle}
          style={styles.inputBox}
        />

        <AppText style={styles.sectionLabel}>Kategori dan konteks</AppText>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = categoryType === cat.id;
            return (
              <Pressable accessibilityState={{ selected: selected }}
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
                  color={selected ? colors.surfaceContainerLowest : s.ink}
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

        <AppText style={styles.fieldLabel}>Konteks (opsional)</AppText>
        <View style={styles.twoColRow}>
          <TextInput accessibilityLabel="Konteks tugas"
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
              <Pressable accessibilityState={{ selected: active }}
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

        <AppText style={styles.sectionLabel}>Waktu tugas</AppText>

        {/* Box A: Deadline Pengumpulan */}
        <View style={styles.dateCardDeadline}>
          <View style={styles.dateCardHeader}>
            <CalendarClock size={16} color={colors.warning} strokeWidth={2.4} />
            <AppText style={styles.dateCardTitleDeadline}>
              Batas pengumpulan
            </AppText>
          </View>

          <View style={styles.presetChipsWrap}>
            {[
              {
                label: 'Selasa',
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
                label: 'Minggu',
                date: addDaysToDateStr(todayStr, 7),
              },
            ].map((preset) => {
              const active = deadlineDate === preset.date;
              return (
                <Pressable accessibilityState={{ selected: active }}
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
              <TextInput accessibilityLabel="Tanggal tenggat"
                value={deadlineDate}
                onChangeText={setDeadlineDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
            <View style={{ flex: 0.9 }}>
              <AppText style={styles.fieldTinyLabel}>Jam Batas Akhir</AppText>
              <TextInput accessibilityLabel="Jam tenggat"
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
              Jadwal pengerjaan
            </AppText>
          </View>

          <View style={styles.presetChipsWrap}>
            {[
              {
                label: '2 hari sebelum',
                date:
                  addDaysToDateStr(deadlineDate, -2) < todayStr
                    ? todayStr
                    : addDaysToDateStr(deadlineDate, -2),
              },
              {
                label: 'Minggu depan',
                date: getNextWeekdayDateStr(todayStr, 0),
              },
              {
                label: '1 hari sebelum',
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
                <Pressable accessibilityState={{ selected: active }}
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
              <TextInput accessibilityLabel="Tanggal pengerjaan"
                value={executionDate}
                onChangeText={setExecutionDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={s.inkSubtle}
                style={styles.compactDateInput}
              />
            </View>
            <View style={{ flex: 0.9 }}>
              <AppText style={styles.fieldTinyLabel}>Jam Alarm Mulai</AppText>
              <TextInput accessibilityLabel="Jam pengerjaan"
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
                <Pressable accessibilityState={{ selected: selected }}
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

        <AppText style={styles.sectionLabel}>Pengingat dan alarm</AppText>

        <View style={styles.alertModeStack}>
          {ALERT_MODES.map((mode) => {
            const Icon = mode.icon;
            const selected = alertMode === mode.id;
            return (
              <Pressable accessibilityState={{ selected: selected }}
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
                    color={selected ? colors.surfaceContainerLowest : s.forest}
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
                          color={colors.surfaceContainerLowest}
                          fill={colors.surfaceContainerLowest}
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
                          isPreviewing && { color: colors.surfaceContainerLowest },
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
                  <Pressable accessibilityState={{ selected: active }}
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

        <AppText style={styles.sectionLabel}>Langkah tugas</AppText>

        <View style={styles.subtaskInputRow}>
          <TextInput accessibilityLabel="Nama langkah tugas"
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
            <Plus size={18} color={colors.surfaceContainerLowest} strokeWidth={2.6} />
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
          <View style={{ flex: 1, gap: space[0.5] }}>
            <AppText style={styles.autoSyncTitle}>
              Otomatis Masuk ke &ldquo;Hari Ini&rdquo;
            </AppText>
            <AppText style={styles.autoSyncSub}>
              Tugas muncul otomatis pada tanggal pengerjaan.
            </AppText>
          </View>
          <Switch
            value={autoAddToToday}
            onValueChange={setAutoAddToToday}
            trackColor={{ false: colors.outlineVariant, true: s.forest }}
            thumbColor={colors.surfaceContainerLowest}
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
    fontSize: typography.labelMedium.fontSize,
    color: colors.onErrorContainer,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
    marginTop: space[1],
  },
  fieldLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  categoryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    minHeight: touchTarget.min,
    paddingVertical: space[2],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  categoryPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  categoryPillText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  categoryPillTextActive: {
    color: colors.surfaceContainerLowest,
  },
  inputBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    fontFamily: fontFamily.medium,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
    ...formInputBase,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  durationChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  inlineSmallLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
    marginRight: space[1],
  },
  smallChip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  smallChipActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  smallChipText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  smallChipTextActive: {
    color: colors.surfaceContainerLowest,
  },
  dateCardDeadline: {
    backgroundColor: colors.warningContainer,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.warningContainer,
    gap: space[2],
  },
  dateCardExec: {
    backgroundColor: colors.successContainer,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    gap: space[2],
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  dateCardTitleDeadline: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: colors.warning,
  },
  dateCardTitleExec: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
  },
  presetChip: {
    minHeight: touchTarget.min,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  presetChipDeadlineActive: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  presetChipExecActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  presetChipText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  presetChipTextActive: {
    color: colors.surfaceContainerLowest,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  fieldTinyLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
    marginBottom: space[1],
  },
  compactDateInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
    ...formInputCompact,
  },
  quickTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[1],
  },
  timeQuickPill: {
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  timeQuickPillActive: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  timeQuickPillText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  timeQuickPillTextActive: {
    color: colors.surfaceContainerLowest,
  },
  bufferInfoStrip: {
    backgroundColor: colors.successContainer,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  bufferInfoText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  alertModeStack: {
    gap: space[2],
  },
  alertModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  alertModeCardActive: {
    borderColor: s.forest,
    backgroundColor: colors.successContainer,
  },
  alertModeIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertModeIconBoxActive: {
    backgroundColor: s.forest,
  },
  alertModeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  alertModeSub: {
    fontFamily: fontFamily.regular,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: stroke.selected,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotOuterActive: {
    borderColor: s.forest,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: radius.xs,
    backgroundColor: s.forest,
  },
  songPickerCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
    gap: space[2],
  },
  songPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  songPickerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  songPickerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  uploadSongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.sun,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
  },
  uploadSongBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  trackListStack: {
    gap: space[1],
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    paddingHorizontal: space[2],
    paddingVertical: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  trackRowSelected: {
    borderColor: s.forest,
    backgroundColor: colors.successContainer,
  },
  trackSelectArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  trackNameText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  trackNameTextSelected: {
    color: s.forest,
  },
  trackDescText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  previewPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: s.leafSoft,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.pill,
  },
  previewPlayBtnActive: {
    backgroundColor: colors.error,
  },
  previewPlayBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.forest,
  },
  snoozeConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[0.5],
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  addSubtaskCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: s.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskChipsList: {
    gap: space[1],
  },
  subtaskDraftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  subtaskDraftText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  autoSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  autoSyncTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  autoSyncSub: {
    fontFamily: fontFamily.regular,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
});
