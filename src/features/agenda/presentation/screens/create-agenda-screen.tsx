import { AppSwitch as Switch } from '@/shared/ui/app-switch';
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { backOrHome } from '@/shared/utils/back-or-home';
import {
  Briefcase,
  Users,
  GraduationCap,
  Heart,
  Clock,
  MapPin,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { formInputBase, formInputCompact } from '@/shared/ui/form-control-styles';
import { touchTarget, layout, radius, space, fontFamily, stroke, typography } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  ChoiceTile,
  SunButton,
  FieldLabel,
} from '@/shared/ui';
import { localTimeToIso, shiftDate, formatLocalDate, isDateOnly } from '@/shared/utils/local-date';
import { useAgenda } from '../hooks/use-agenda';
import type { AgendaEventType } from '../../domain/entities/agenda.entity';

const s = colors.sprout;

const EVENT_TYPES: {
  type: AgendaEventType;
  label: string;
  icon: typeof Briefcase;
  tone: 'leaf' | 'teal' | 'grape' | 'rose';
}[] = [
  { type: 'LEARNING', label: 'Belajar', icon: GraduationCap, tone: 'leaf' },
  { type: 'PERSONAL', label: 'Pribadi', icon: Heart, tone: 'rose' },
  { type: 'WORK', label: 'Kerja', icon: Briefcase, tone: 'teal' },
  { type: 'MEETING', label: 'Rapat', icon: Users, tone: 'grape' },
];

const REMINDER_OPTIONS = [
  { minutes: null, label: 'Nonaktif' },
  { minutes: 0, label: 'Tepat Waktu' },
  { minutes: 10, label: '10 mnt' },
  { minutes: 30, label: '30 mnt' },
];

export const CreateAgendaScreen: React.FC = () => {
  const params = useLocalSearchParams<{ date?: string }>();
  const initialDate =
    typeof params.date === 'string' && isDateOnly(params.date)
      ? params.date
      : formatLocalDate(new Date());

  const { addEvent } = useAgenda();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<AgendaEventType>('LEARNING');
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
        throw new Error(
          'Waktu selesai harus setelah mulai. Untuk lintas malam, aktifkan "Selesai besok".'
        );
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
        backOrHome();
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
    <Screen
      scrollable
      style={styles.screenBg}
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <FormScreenHeader title="Tambah Agenda" onBack={() => backOrHome()} />

        {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          <View style={styles.titleFields}>
            <FieldLabel>Nama kegiatan</FieldLabel>
            <TextInput accessibilityLabel="Nama kegiatan"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama kegiatan"
              placeholderTextColor={s.inkSubtle}
              style={formInputBase}
              autoFocus
            />
            <FieldLabel>Catatan (opsional)</FieldLabel>
            <TextInput accessibilityLabel="Catatan (opsional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Masukkan catatan (opsional)"
              placeholderTextColor={s.inkSubtle}
              style={formInputBase}
            />
          </View>

          {/* Kategori Squircle Tiles */}
          <FieldLabel>Kategori</FieldLabel>
          <View style={styles.categoryTilesRow}>
            {EVENT_TYPES.map((et) => (
              <ChoiceTile
                key={et.type}
                label={et.label}
                icon={et.icon}
                tone={et.tone}
                selected={eventType === et.type}
                onPress={() => setEventType(et.type)}
              />
            ))}
          </View>

          {/* Waktu */}
          <FieldLabel>Waktu</FieldLabel>
          <View style={styles.timeCard}>
            <View style={styles.switchRow}>
              <View style={styles.timeRowLeft}>
                <Clock size={18} color={s.ink} strokeWidth={2.2} />
                <AppText style={styles.rowHeading}>Sepanjang Hari</AppText>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: colors.outlineVariant, true: s.forest }}
              />
            </View>

            {!isAllDay && (
              <>
                <View style={styles.timeInputsRow}>
                  <View style={styles.timeFieldBox}>
                    <AppText style={styles.miniLabel}>Mulai</AppText>
                    <TextInput accessibilityLabel="Jam mulai"
                      value={startTimeStr}
                      onChangeText={setStartTimeStr}
                      placeholder="JJ:MM"
                      placeholderTextColor={s.inkSubtle}
                      style={styles.timeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.timeFieldBox}>
                    <AppText style={styles.miniLabel}>Selesai</AppText>
                    <TextInput accessibilityLabel="Jam selesai"
                      value={endTimeStr}
                      onChangeText={setEndTimeStr}
                      placeholder="JJ:MM"
                      placeholderTextColor={s.inkSubtle}
                      style={styles.timeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <AppText style={styles.subLabel}>Berlanjut lintas tengah malam</AppText>
                  <Switch
                    value={endsTomorrow}
                    onValueChange={setEndsTomorrow}
                    trackColor={{ false: colors.outlineVariant, true: s.forest }}
                  />
                </View>

                <View style={styles.reminderRow}>
                  {REMINDER_OPTIONS.map((opt) => {
                    const selected = reminderMinutes === opt.minutes;
                    return (
                      <Pressable accessibilityRole="button" accessibilityLabel={opt.label}
                        accessibilityState={{ selected }}
                        key={String(opt.minutes)}
                        onPress={() => setReminderMinutes(opt.minutes)}
                        style={[styles.reminderChip, selected && styles.reminderChipSelected]}
                      >
                        <AppText
                          style={[
                            styles.reminderChipText,
                            selected && styles.reminderChipTextSelected,
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

          {/* Lokasi */}
          <View style={styles.locationPillRow}>
            <MapPin size={18} color={s.ink} strokeWidth={2.2} />
            <TextInput accessibilityLabel="Lokasi atau tautan"
              value={location}
              onChangeText={setLocation}
              placeholder="Masukkan lokasi atau tautan (opsional)"
              placeholderTextColor={s.inkSubtle}
              style={styles.locationInput}
            />
          </View>

          <View style={styles.ctaWrap}>
            <SunButton title="Simpan" onPress={handleSubmit} loading={isSubmitting} />
          </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  titleFields: { gap: layout.fieldGap },
  screenBg: {
    backgroundColor: s.cream,
  },
  keyboardContainer: { flex: 1, gap: layout.sectionGap },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  categoryTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: space[2],
  },
  timeCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    gap: space[3],
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  rowHeading: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
  },
  subLabel: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  timeFieldBox: {
    flex: 1,
    backgroundColor: s.card,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  miniLabel: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  timeInput: {
    fontFamily: fontFamily.bold,
    fontSize: typography.titleMedium.fontSize,
    color: s.ink,
    paddingVertical: space[0.5],
    ...formInputCompact,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[1],
  },
  reminderChip: {
    minHeight: touchTarget.min,
    justifyContent: 'center',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    backgroundColor: s.card,
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  reminderChipSelected: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  reminderChipText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  reminderChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: colors.surfaceContainerLowest,
  },
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    gap: space[3],
  },
  locationInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
    ...formInputCompact,
  },
  ctaWrap: {
    marginTop: space[3],
  },
});
