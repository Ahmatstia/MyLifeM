import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Clock, MapPin, FileText, Bell } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import type {
  WeeklyScheduleEntity,
  WeeklyScheduleType,
  CreateWeeklyScheduleInput,
} from '../../domain/entities/weekly-schedule.entity';
import { DAY_NAMES, DAY_SHORT_NAMES } from '../../domain/entities/weekly-schedule.entity';

export interface AddEditWeeklyScheduleModalProps {
  visible: boolean;
  initialData?: WeeklyScheduleEntity;
  defaultDayOfWeek?: number;
  onClose: () => void;
  onSubmit: (input: CreateWeeklyScheduleInput) => Promise<boolean>;
}

const SCHEDULE_TYPES: { type: WeeklyScheduleType; label: string; color: string }[] = [
  { type: 'COLLEGE', label: 'Kuliah', color: colors.primary },
  { type: 'WORK', label: 'Kerja', color: colors.secondary },
  { type: 'STUDY', label: 'Belajar', color: colors.tertiary },
  { type: 'PERSONAL', label: 'Pribadi', color: colors.onSurfaceVariant },
];

const REMINDER_OPTIONS = [
  { minutes: null, label: 'Nonaktif' },
  { minutes: 0, label: 'Tepat Waktu' },
  { minutes: 10, label: '10 mnt' },
  { minutes: 15, label: '15 mnt' },
  { minutes: 30, label: '30 mnt' },
];

export const AddEditWeeklyScheduleModal: React.FC<AddEditWeeklyScheduleModalProps> = ({
  visible,
  initialData,
  defaultDayOfWeek = 1,
  onClose,
  onSubmit,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState(defaultDayOfWeek);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [scheduleType, setScheduleType] = useState<WeeklyScheduleType>('COLLEGE');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(15);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setDayOfWeek(initialData.dayOfWeek);
        setTitle(initialData.title);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setScheduleType(initialData.scheduleType);
        setLocation(initialData.location || '');
        setNotes(initialData.notes || '');
        setReminderMinutes(initialData.reminderMinutes);
        setIsActive(initialData.isActive);
      } else {
        setDayOfWeek(defaultDayOfWeek);
        setTitle('');
        setStartTime('08:00');
        setEndTime('10:00');
        setScheduleType('COLLEGE');
        setLocation('');
        setNotes('');
        setReminderMinutes(15);
        setIsActive(true);
      }
      setErrorMessage(null);
    }
  }, [visible, initialData, defaultDayOfWeek]);

  const validateTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t.trim());

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Judul agenda mingguan tidak boleh kosong.');
      return;
    }
    if (!validateTime(startTime) || !validateTime(endTime)) {
      setErrorMessage('Format jam harus JJ:MM (misal 08:00 atau 14:30).');
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('Jam mulai harus lebih awal dari jam selesai.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const ok = await onSubmit({
      dayOfWeek,
      title: title.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      scheduleType,
      location: location.trim() || null,
      notes: notes.trim() || null,
      reminderMinutes,
      isActive,
    });
    setIsSubmitting(false);

    if (ok) {
      onClose();
    } else {
      setErrorMessage('Gagal menyimpan jadwal rutin. Silakan periksa kembali.');
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Ubah Jadwal Tetap' : 'Jadwal Tetap Baru'}
      subtitle="Komitmen rutin mingguan (KRS kuliah / jam kerja)."
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage && (
          <View style={styles.errorBox}>
            <AppText variant="bodySmall" color="error">
              {errorMessage}
            </AppText>
          </View>
        )}

        {/* 1. Pilih Hari (Senin - Minggu) */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            HARI JADWAL RUTIN
          </AppText>
          <View style={styles.daySelectorRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const selected = day === dayOfWeek;
              return (
                <Pressable
                  key={day}
                  onPress={() => setDayOfWeek(day)}
                  accessibilityRole="button"
                  accessibilityLabel={DAY_NAMES[day]}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}
                >
                  <AppText
                    variant="labelMedium"
                    color={selected ? 'onPrimary' : 'onSurface'}
                    style={selected ? styles.dayTextSelected : undefined}
                  >
                    {DAY_SHORT_NAMES[day]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="bodySmall" color="primary" style={styles.dayHint}>
            Jadwal berlaku setiap hari {DAY_NAMES[dayOfWeek]}
          </AppText>
        </View>

        {/* 2. Judul Jadwal */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            NAMA KEGIATAN / MATA KULIAH *
          </AppText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="misal: Kuliah Algoritma, Shift Siang..."
            placeholderTextColor={colors.onSurfaceVariant}
          />
        </View>

        {/* 3. Tipe Kegiatan */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            KATEGORI KEGIATAN
          </AppText>
          <View style={styles.typeRow}>
            {SCHEDULE_TYPES.map((t) => {
              const selected = t.type === scheduleType;
              return (
                <Pressable
                  key={t.type}
                  onPress={() => setScheduleType(t.type)}
                  accessibilityRole="button"
                  style={[
                    styles.typeChip,
                    selected && { backgroundColor: t.color, borderColor: t.color },
                  ]}
                >
                  <AppText
                    variant="labelSmall"
                    color={selected ? 'onPrimary' : 'onSurface'}
                  >
                    {t.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Rentang Waktu (Jam Mulai - Selesai) */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            JAM MULAI & SELESAI (24 JAM)
          </AppText>
          <View style={styles.timeRow}>
            <View style={styles.timeInputCol}>
              <View style={styles.timeBox}>
                <Clock size={16} color={colors.primary} />
                <TextInput
                  style={styles.timeTextInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="08:00"
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <AppText variant="bodySmall" color="onSurfaceVariant">Mulai</AppText>
            </View>

            <AppText variant="titleMedium" color="onSurfaceVariant" style={styles.dash}>
              –
            </AppText>

            <View style={styles.timeInputCol}>
              <View style={styles.timeBox}>
                <Clock size={16} color={colors.primary} />
                <TextInput
                  style={styles.timeTextInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  maxLength={5}
                  keyboardType="numbers-and-punctuation"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <AppText variant="bodySmall" color="onSurfaceVariant">Selesai</AppText>
            </View>
          </View>
        </View>

        {/* 5. Lokasi / Ruangan */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            RUANG / LOKASI (OPSIONAL)
          </AppText>
          <View style={styles.inputWithIcon}>
            <MapPin size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.flexInput}
              value={location}
              onChangeText={setLocation}
              placeholder="misal: Lab Komputer 3, Gedung B R. 302"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* 6. Catatan */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            CATATAN (OPSIONAL)
          </AppText>
          <View style={styles.inputWithIcon}>
            <FileText size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.flexInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="misal: Dosen: Pak Hendra, Bawa Modul"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>
        </View>

        {/* 7. Pengingat Otomatis */}
        <View style={styles.fieldGroup}>
          <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.label}>
            PENGINGAT SEBELUM MULAI
          </AppText>
          <View style={styles.reminderRow}>
            {REMINDER_OPTIONS.map((opt) => {
              const selected = opt.minutes === reminderMinutes;
              return (
                <Pressable
                  key={String(opt.minutes)}
                  onPress={() => setReminderMinutes(opt.minutes)}
                  accessibilityRole="button"
                  style={[styles.reminderChip, selected && styles.reminderChipSelected]}
                >
                  <Bell size={13} color={selected ? colors.onPrimary : colors.onSurfaceVariant} />
                  <AppText variant="labelSmall" color={selected ? 'onPrimary' : 'onSurface'}>
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 8. Status Aktif Switch */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <AppText variant="titleSmall">Status Jadwal Aktif</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Jika nonaktif, jadwal tidak akan muncul di timeline harian.
            </AppText>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Batal"
            variant="outlined"
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.actionBtn}
          />
          <Button
            title={isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Buat Jadwal Tetap'}
            variant="filled"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: space[6],
    gap: space[4],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    padding: space[3],
    borderRadius: radius.md,
  },
  fieldGroup: {
    gap: space[2],
  },
  label: {
    fontFamily: fontFamily.semibold,
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[1],
  },
  dayChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTextSelected: {
    fontFamily: fontFamily.bold,
  },
  dayHint: {
    marginTop: space[1],
    fontFamily: fontFamily.medium,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    minHeight: 48,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.onSurface,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    minHeight: 48,
    gap: space[3],
  },
  flexInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.onSurface,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  typeChip: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  timeInputCol: {
    flex: 1,
    alignItems: 'center',
    gap: space[1],
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    minHeight: 48,
    gap: space[2],
    width: '100%',
  },
  timeTextInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: colors.onSurface,
    textAlign: 'center',
  },
  dash: {
    alignSelf: 'center',
    paddingBottom: 20,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  reminderChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    padding: space[4],
    borderRadius: radius.lg,
    gap: space[3],
  },
  switchTextCol: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[3],
  },
  actionBtn: {
    flex: 1,
  },
});
