import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Button, FormScreenHeader } from '@/shared/ui';
import { localTimeToIso, shiftDate, formatLocalDate, isDateOnly } from '@/shared/utils/local-date';
import { useAgenda } from '../hooks/use-agenda';
import type { AgendaEventType } from '../../domain/entities/agenda.entity';

const EVENT_TYPES: { type: AgendaEventType; label: string; activeColor: string }[] = [
  { type: 'WORK', label: 'Kerja', activeColor: '#0E6852' },
  { type: 'MEETING', label: 'Rapat', activeColor: '#2B59C3' },
  { type: 'LEARNING', label: 'Belajar', activeColor: '#9333EA' },
  { type: 'PERSONAL', label: 'Pribadi', activeColor: '#D97706' },
];

const REMINDER_OPTIONS = [
  { minutes: null, label: 'Nonaktif' },
  { minutes: 0, label: 'Tepat Waktu' },
  { minutes: 10, label: '10 mnt' },
  { minutes: 30, label: '30 mnt' },
  { minutes: 60, label: '1 jam' },
];

export const CreateAgendaScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate = typeof params.date === 'string' && isDateOnly(params.date)
    ? params.date
    : formatLocalDate(new Date());

  const { addEvent } = useAgenda();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<AgendaEventType>('WORK');
  const [isAllDay, setIsAllDay] = useState(false);
  const [endsTomorrow, setEndsTomorrow] = useState(false);
  const [formDate] = useState(initialDate);
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [location, setLocation] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitting = useRef(false);

  const handleSubmit = async () => {
    if (submitting.current) return;
    if (!title.trim()) {
      setErrorMessage('Judul agenda tidak boleh kosong.');
      return;
    }

    try {
      const startIso = isAllDay ? formDate : localTimeToIso(formDate, startTimeStr);
      const endIso = isAllDay
        ? shiftDate(formDate, 1)
        : localTimeToIso(endsTomorrow ? shiftDate(formDate, 1) : formDate, endTimeStr);

      if (endIso <= startIso) {
        throw new Error('Waktu selesai harus setelah mulai. Untuk lintas malam, aktifkan "Selesai besok".');
      }

      setErrorMessage(null);
      submitting.current = true;
      setIsSubmitting(true);

      const success = await addEvent({
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
        router.back();
      } else {
        setErrorMessage('Gagal menyimpan agenda. Silakan coba lagi.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Agenda belum tersimpan. Silakan coba lagi.'
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable={false} withBottomPadding={false} withHorizontalPadding={false} style={styles.screenBg}>
      <FormScreenHeader title="Agenda Baru" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        >
          {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Section 1: Main Info */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              JUDUL AGENDA *
            </AppText>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Misal: Diskusi Strategi Q3"
              placeholderTextColor="#8F9298"
              style={styles.textInput}
              autoFocus
            />

            <View style={styles.podDivider} />

            <AppText variant="labelSmall" style={styles.fieldLabel}>
              TIPE KEGIATAN
            </AppText>
            <View style={styles.eventTypeRow}>
              {EVENT_TYPES.map((et) => {
                const isSelected = eventType === et.type;
                return (
                  <Pressable
                    key={et.type}
                    onPress={() => setEventType(et.type)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.eventTypeBtn,
                      isSelected && [styles.eventTypeBtnSelected, { backgroundColor: et.activeColor }],
                    ]}
                  >
                    <AppText
                      variant="labelMedium"
                      style={[
                        styles.eventTypeText,
                        isSelected && styles.eventTypeTextSelected,
                      ]}
                    >
                      {et.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.podDivider} />

            <AppText variant="labelSmall" style={styles.fieldLabel}>
              LOKASI / TAUTAN RUANG (OPSIONAL)
            </AppText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Misal: Google Meet / Lab 3"
              placeholderTextColor="#8F9298"
              style={styles.textInput}
            />
          </View>

          {/* Section 2: Waktu & Tanggal */}
          <View style={styles.pod}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="titleSmall" style={styles.rowHeading}>
                  Sepanjang Hari
                </AppText>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  Tidak terikat jam spesifik
                </AppText>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: '#E2E4E9', true: '#0E6852' }}
              />
            </View>

            {!isAllDay && (
              <>
                <View style={styles.podDivider} />

                <View style={styles.timeInputsRow}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="labelSmall" style={styles.fieldLabel}>
                      MULAI (HH:mm)
                    </AppText>
                    <TextInput
                      value={startTimeStr}
                      onChangeText={setStartTimeStr}
                      placeholder="09:00"
                      placeholderTextColor="#8F9298"
                      style={styles.textInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="labelSmall" style={styles.fieldLabel}>
                      SELESAI (HH:mm)
                    </AppText>
                    <TextInput
                      value={endTimeStr}
                      onChangeText={setEndTimeStr}
                      placeholder="10:00"
                      placeholderTextColor="#8F9298"
                      style={styles.textInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="titleSmall" style={styles.rowHeading}>
                      Selesai Besok
                    </AppText>
                    <AppText variant="bodySmall" color="onSurfaceVariant">
                      Kegiatan berlangsung lintas tengah malam
                    </AppText>
                  </View>
                  <Switch
                    value={endsTomorrow}
                    onValueChange={setEndsTomorrow}
                    trackColor={{ false: '#E2E4E9', true: '#0E6852' }}
                  />
                </View>
              </>
            )}

            {!isAllDay && (
              <>
                <View style={styles.podDivider} />
                <AppText variant="labelSmall" style={styles.fieldLabel}>
                  PENGINGAT
                </AppText>
                <View style={styles.chipGrid}>
                  {REMINDER_OPTIONS.map((opt) => {
                    const isSelected = reminderMinutes === opt.minutes;
                    return (
                      <Pressable
                        key={String(opt.minutes)}
                        onPress={() => setReminderMinutes(opt.minutes)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        style={[
                          styles.reminderChip,
                          isSelected && styles.reminderChipSelected,
                        ]}
                      >
                        <AppText
                          variant="labelMedium"
                          style={[
                            styles.reminderChipText,
                            isSelected && styles.reminderChipTextSelected,
                          ]}
                        >
                          {opt.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {/* Section 3: Catatan */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              CATATAN TAMBAHAN (OPSIONAL)
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Agenda rapat, persiapan yang perlu dibawa, dll..."
              placeholderTextColor="#8F9298"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Dock */}
        <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, space[4]) }]}>
          <Button
            title="Batal"
            variant="tonal"
            onPress={() => router.back()}
            style={styles.cancelBtn}
          />
          <Button
            title="Jadwalkan"
            variant="filled"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: '#FCF8FF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: space[4],
    gap: space[3],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  pod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: space[2],
  },
  podDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: space[2],
  },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#717684',
  },
  textInput: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: '#121316',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  multilineInput: {
    minHeight: 80,
  },
  eventTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: space[1],
  },
  eventTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  eventTypeBtnSelected: {
    borderColor: 'transparent',
  },
  eventTypeText: {
    fontFamily: fontFamily.medium,
    color: '#44474E',
    fontSize: 13,
  },
  eventTypeTextSelected: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[1],
  },
  rowHeading: {
    fontFamily: fontFamily.semibold,
    color: '#121316',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: space[1],
  },
  reminderChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  reminderChipSelected: {
    backgroundColor: '#121316',
    borderColor: '#121316',
  },
  reminderChipText: {
    fontFamily: fontFamily.medium,
    color: '#44474E',
    fontSize: 12,
  },
  reminderChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingTop: space[3],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#121316',
    borderRadius: 16,
  },
});
