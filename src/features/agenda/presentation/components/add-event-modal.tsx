import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, CalendarPlus, Clock, MapPin, Bell } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
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
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('WORK');
    setIsAllDay(false);
    setStartTimeStr('09:00');
    setEndTimeStr('10:00');
    setLocation('');
    setReminderMinutes(10);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Judul agenda tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    let startIso: string;
    let endIso: string;

    if (isAllDay) {
      startIso = `${selectedDate}T00:00:00.000Z`;
      endIso = `${selectedDate}T23:59:59.000Z`;
    } else {
      // Validate time format (HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const validStart = timeRegex.test(startTimeStr.trim()) ? startTimeStr.trim() : '09:00';
      const validEnd = timeRegex.test(endTimeStr.trim()) ? endTimeStr.trim() : '10:00';

      const paddedStart = validStart.length === 4 ? `0${validStart}` : validStart;
      const paddedEnd = validEnd.length === 4 ? `0${validEnd}` : validEnd;

      startIso = `${selectedDate}T${paddedStart}:00`;
      endIso = `${selectedDate}T${paddedEnd}:00`;
    }

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startIso,
      endTime: endIso,
      isAllDay,
      eventType,
      location: location.trim() || undefined,
      reminderMinutes,
    });

    setIsSubmitting(false);

    if (success) {
      resetForm();
      onClose();
    } else {
      setErrorMessage('Gagal menyimpan agenda. Silakan coba lagi.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <CalendarPlus size={20} color={colors.primary} />
              </View>
              <View>
                <AppText variant="titleLarge">Jadwalkan Agenda</AppText>
                <AppText variant="labelSmall" color="onSurfaceVariant">
                  {selectedDate}
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
            >
              <X size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
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
                    key={item.type}
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

            {/* Location */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Lokasi / Media
            </AppText>
            <View style={styles.iconInputContainer}>
              <MapPin size={16} color={colors.onSurfaceVariant} />
              <TextInput
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
              {REMINDER_OPTIONS.map((item) => {
                const isSelected = reminderMinutes === item.minutes;
                return (
                  <Pressable
                    key={item.minutes}
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
              value={description}
              onChangeText={setDescription}
              placeholder="Tambahkan agenda rapat atau catatan persiapan..."
              placeholderTextColor={colors.onSurfaceSubtle}
              multiline
              numberOfLines={2}
              style={[styles.textInput, styles.textArea]}
            />

            {/* Sticky Action Button Row (Template C) */}
            <View style={styles.actionRow}>
              <Button
                title="Batal"
                onPress={handleClose}
                variant="tonal"
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    maxHeight: '92%',
    paddingBottom: space[6],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: space[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: space[2],
  },
  formContent: {
    padding: space[4],
  },
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
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    color: colors.onSurface,
    paddingHorizontal: space[3],
    height: 48,
    fontSize: 14,
  },
  textArea: {
    height: 64,
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
    borderColor: colors.outlineVariant,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[2],
  },
  allDayToggle: {
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    height: 48,
    gap: space[2],
  },
  timeInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    height: 48,
    gap: space[2],
  },
  flexInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
  },
  reminderRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  reminderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    gap: 4,
  },
  reminderChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[6],
    marginBottom: space[4],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
