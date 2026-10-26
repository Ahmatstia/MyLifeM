import React, { useState, useRef } from 'react';
import { localTimeToIso, shiftDate } from '@/shared/utils/local-date';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { CalendarPlus, Clock, MapPin, Bell } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import type {
  CreateAgendaInput,
  AgendaEventType,
} from '../../domain/entities/agenda.entity';

export interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAgendaInput) => Promise<boolean>;
  selectedDate: string; // 'YYYY-MM-DD'
}

const EVENT_TYPES: { type: AgendaEventType; label: string; color: string }[] = [
  { type: 'WORK', label: 'Kerja', color: colors.pillars.career },
  { type: 'MEETING', label: 'Rapat', color: colors.pillars.finance },
  { type: 'LEARNING', label: 'Belajar', color: colors.pillars.growth },
  { type: 'PERSONAL', label: 'Pribadi', color: colors.pillars.personal },
];

const REMINDER_OPTIONS = [
  { minutes: null, label: 'Nonaktif' },
  { minutes: 0, label: 'Tepat Waktu' },
  { minutes: 10, label: '10 mnt' },
  { minutes: 30, label: '30 mnt' },
  { minutes: 60, label: '1 jam' },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onSubmit,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<AgendaEventType>('WORK');
  const [isAllDay, setIsAllDay] = useState(false);
  const [endsTomorrow, setEndsTomorrow] = useState(false);
  const [formDate] = useState(selectedDate);
  const submitting = useRef(false);
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('WORK');
    setIsAllDay(false);
    setEndsTomorrow(false);
    setStartTimeStr('09:00');
    setEndTimeStr('10:00');
    setLocation('');
    setReminderMinutes(10);
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (submitting.current) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (!title.trim()) {
      setErrorMessage('Judul agenda tidak boleh kosong.');
      return;
    }

    try {
      const startIso = isAllDay ? formDate : localTimeToIso(formDate, startTimeStr);
      const endIso = isAllDay ? shiftDate(formDate, 1) : localTimeToIso(endsTomorrow ? shiftDate(formDate, 1) : formDate, endTimeStr);
      if (endIso <= startIso) throw new Error('Waktu selesai harus setelah mulai. Untuk lintas malam, pilih selesai besok.');
      setErrorMessage(null);
      submitting.current = true;
      setIsSubmitting(true);
      const success = await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startIso,
        endTime: endIso,
        isAllDay,
        eventType,
        location: location.trim() || undefined,
        reminderMinutes: isAllDay ? null : reminderMinutes,
      });
      if (success) {
        resetForm();
        onClose();
      } else {
        setErrorMessage('Gagal menyimpan agenda. Silakan coba lagi.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Agenda belum tersimpan. Silakan coba lagi.');
    } finally { submitting.current = false; setIsSubmitting(false); }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={handleClose}
      title="Agenda baru"
      subtitle={formDate}
      icon={<CalendarPlus size={20} color={colors.primary} />}
      footer={
        <View style={styles.actionRow}>
          <Button
            title="Batal"
            onPress={handleClose}
            variant="tonal"
            disabled={isSubmitting}
            style={styles.cancelButton}
          />
          <Button
            title="Jadwalkan"
            onPress={handleSubmit}
            variant="filled"
            loading={isSubmitting}
            style={styles.saveButton}
          />
        </View>
      }
    >
      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorBox}>
          <AppText variant="bodySmall" color="onErrorContainer">
            {errorMessage}
          </AppText>
        </View>
      )}

      {/* Input: Judul Agenda */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Judul Kegiatan *
      </AppText>
      <TextInput
        editable={!isSubmitting}
        accessibilityLabel="Judul agenda"
        value={title}
        onChangeText={setTitle}
        placeholder="Contoh: Diskusi Arsitektur Sistem"
        placeholderTextColor={colors.onSurfaceSubtle}
        style={styles.textInput}
      />

      {/* Event Type / Category */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Kategori Kegiatan
      </AppText>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map((item) => {
          const isSelected = eventType === item.type;
          return (
            <Pressable
              disabled={isSubmitting}
              key={item.type}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setEventType(item.type)}
              style={[
                styles.typeChip,
                isSelected && {
                  backgroundColor: colors.primaryContainer,
                  borderColor: item.color,
                },
              ]}
            >
              <View
                style={[styles.typeDot, { backgroundColor: item.color }]}
              />
              <AppText
                variant="labelSmall"
                color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Time / All-Day Selector */}
      <View style={styles.timeSectionHeader}>
        <AppText variant="labelLarge">Waktu Pelaksanaan</AppText>
        <Pressable
          disabled={isSubmitting}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isAllDay }}
          accessibilityLabel="Agenda sepanjang hari"
          onPress={() => setIsAllDay(!isAllDay)}
          style={[
            styles.allDayToggle,
            isAllDay && styles.allDayToggleActive,
          ]}
        >
          <AppText
            variant="labelSmall"
            color={isAllDay ? 'onPrimaryContainer' : 'onSurfaceSubtle'}
          >
            Bebas Jam (All Day)
          </AppText>
        </Pressable>
      </View>

      {!isAllDay ? (
        <View style={styles.timeInputsRow}>
          <View style={styles.timeCol}>
            <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.subLabel}>
              Mulai (JJ:MM)
            </AppText>
            <View style={styles.timeInputContainer}>
              <Clock size={16} color={colors.onSurfaceVariant} />
              <TextInput
                editable={!isSubmitting}
                accessibilityLabel="Jam mulai"
                value={startTimeStr}
                onChangeText={setStartTimeStr}
                placeholder="09:00"
                placeholderTextColor={colors.onSurfaceSubtle}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={styles.timeInput}
              />
            </View>
          </View>

          <View style={styles.timeSeparator}>
            <AppText variant="bodySmall" color="onSurfaceSubtle">-</AppText>
          </View>

          <View style={styles.timeCol}>
            <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.subLabel}>
              Selesai (JJ:MM)
            </AppText>
            <View style={styles.timeInputContainer}>
              <Clock size={16} color={colors.onSurfaceVariant} />
              <TextInput
                editable={!isSubmitting}
                accessibilityLabel="Jam selesai"
                value={endTimeStr}
                onChangeText={setEndTimeStr}
                placeholder="10:00"
                placeholderTextColor={colors.onSurfaceSubtle}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={styles.timeInput}
              />
            </View>
          </View>
        </View>
      ) : null}
      {!isAllDay && <Pressable disabled={isSubmitting} onPress={() => setEndsTomorrow(value => !value)} accessibilityRole="checkbox"
        accessibilityState={{ checked: endsTomorrow }} accessibilityLabel="Selesai besok" style={styles.nextDay}>
        <AppText variant="bodySmall" color="primary">{endsTomorrow ? '✓ ' : '○ '}Selesai besok ({shiftDate(formDate, 1)})</AppText>
      </Pressable>}
      <AppText variant="bodySmall" color="onSurfaceVariant">{isAllDay ? 'Mengikuti tanggal kalender, tanpa pengingat berjam.' : 'Jam mengikuti zona perangkat (' + Intl.DateTimeFormat().resolvedOptions().timeZone + '). Jadwal berjam tetap pada waktu yang sama saat berpindah zona.'}</AppText>

      {/* Location */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Lokasi / Media
      </AppText>
      <View style={styles.iconInputContainer}>
        <MapPin size={16} color={colors.onSurfaceVariant} />
        <TextInput
          editable={!isSubmitting}
          value={location}
          onChangeText={setLocation}
          placeholder="Google Meet, Kantor, atau Rumah"
          placeholderTextColor={colors.onSurfaceSubtle}
          style={styles.flexInput}
        />
      </View>

      {/* Reminder */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Pengingat Waktu
      </AppText>
      <View style={styles.reminderRow}>
        {!isAllDay && REMINDER_OPTIONS.map((item) => {
          const isSelected = reminderMinutes === item.minutes;
          return (
            <Pressable
              disabled={isSubmitting}
              key={String(item.minutes)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setReminderMinutes(item.minutes)}
              style={[
                styles.reminderChip,
                isSelected && styles.reminderChipSelected,
              ]}
            >
              <Bell
                size={12}
                color={
                  isSelected ? colors.onPrimaryContainer : colors.onSurfaceSubtle
                }
              />
              <AppText
                variant="labelSmall"
                color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Catatan / Deskripsi */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Catatan Agenda (Opsional)
      </AppText>
      <TextInput
        editable={!isSubmitting}
        value={description}
        onChangeText={setDescription}
        placeholder="Tambahkan agenda rapat atau catatan persiapan..."
        placeholderTextColor={colors.onSurfaceSubtle}
        multiline
        numberOfLines={2}
        style={[styles.textInput, styles.textArea]}
      />

      {/* Sticky Action Button Row (Template C) */}

    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    padding: space[3],
    marginBottom: space[3],
  },
  inputLabel: {
    marginBottom: space[2],
    marginTop: space[3],
    color: colors.onSurface,
  },
  subLabel: {
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.lg,
    color: colors.onSurface,
    paddingHorizontal: space[3],
    minHeight: 56,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: space[2],
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[2],
  },
  allDayToggle: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
  },
  allDayToggleActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  timeCol: {
    flex: 1,
    minWidth: 0,
  },
  timeSeparator: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    minHeight: 56,
    gap: space[2],
  },
  timeInput: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    minHeight: 56,
    gap: space[2],
  },
  flexInput: {
    flex: 1,
    minWidth: 0,
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  reminderChip: {
    flex: 1,
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    gap: 4,
  },
  reminderChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  nextDay: { minHeight: 48, justifyContent: 'center', paddingVertical: space[2] },
  actionRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[1],
    marginBottom: space[1],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
