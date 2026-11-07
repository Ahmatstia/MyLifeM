import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Briefcase,
  Users,
  GraduationCap,
  Heart,
  Clock,
  MapPin,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  WaveBackdrop,
  ChoiceTile,
  SunButton,
  FieldLabel,
  MascotHead,
  sproutShadow,
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
  const insets = useSafeAreaInsets();
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
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={{ ...styles.scrollContent, paddingBottom: 120 + insets.bottom }}
    >
      <WaveBackdrop variant="form" withBottomHills />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={{ marginHorizontal: -space[4] }}>
          <FormScreenHeader title="Tambah Agenda" onBack={() => router.back()} />
        </View>

        {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Mascot + Cloud Input */}
          <View style={styles.cloudHeroWrap}>
            <View style={styles.mascotHeadWrap} pointerEvents="none">
              <MascotHead width={144} height={92} />
            </View>

            <View style={styles.cloudOuterCard}>
              <View style={styles.cloudInnerPill}>
                <TextInput
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Apa agenda kegiatanmu?"
                  placeholderTextColor={s.inkSubtle}
                  style={styles.cloudInput}
                  autoFocus
                />
                <Sparkles size={20} color={s.sun} fill={s.sun} />
              </View>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Catatan singkat (opsional)…"
                placeholderTextColor={s.inkSubtle}
                style={styles.cloudDescInput}
              />
            </View>
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
                trackColor={{ false: '#D8D0BE', true: s.forest }}
              />
            </View>

            {!isAllDay && (
              <>
                <View style={styles.timeInputsRow}>
                  <View style={styles.timeFieldBox}>
                    <AppText style={styles.miniLabel}>Mulai</AppText>
                    <TextInput
                      value={startTimeStr}
                      onChangeText={setStartTimeStr}
                      placeholder="09:00"
                      placeholderTextColor={s.inkSubtle}
                      style={styles.timeInput}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.timeFieldBox}>
                    <AppText style={styles.miniLabel}>Selesai</AppText>
                    <TextInput
                      value={endTimeStr}
                      onChangeText={setEndTimeStr}
                      placeholder="10:00"
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
                    trackColor={{ false: '#D8D0BE', true: s.forest }}
                  />
                </View>

                <View style={styles.reminderRow}>
                  {REMINDER_OPTIONS.map((opt) => {
                    const selected = reminderMinutes === opt.minutes;
                    return (
                      <Pressable
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
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Lokasi atau tautan ruang (opsional)"
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
  screenBg: {
    backgroundColor: s.cream,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[5],
    paddingTop: space[2],
    gap: space[3],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  cloudHeroWrap: {
    marginTop: 58,
    marginBottom: space[1],
    position: 'relative',
  },
  mascotHeadWrap: {
    position: 'absolute',
    top: -68,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  cloudOuterCard: {
    backgroundColor: s.card,
    borderRadius: 32,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#F1EADA',
    gap: space[2],
    ...sproutShadow,
  },
  cloudInnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EFE3',
    borderRadius: 22,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    gap: space[2],
  },
  cloudInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: s.ink,
    paddingVertical: 4,
  },
  cloudDescInput: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: s.inkMuted,
    paddingHorizontal: space[2],
    paddingTop: space[1],
  },
  categoryTilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[2],
  },
  timeCard: {
    backgroundColor: '#F1EBDC',
    borderRadius: 24,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#E7DFCC',
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
    fontSize: 14,
    color: s.ink,
  },
  subLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: s.inkMuted,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  timeFieldBox: {
    flex: 1,
    backgroundColor: s.card,
    borderRadius: 16,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  miniLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: s.inkMuted,
  },
  timeInput: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: s.ink,
    paddingVertical: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reminderChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  reminderChipSelected: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  reminderChipText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  reminderChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  locationPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EBDC',
    borderRadius: 22,
    paddingHorizontal: space[4],
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E7DFCC',
    gap: space[3],
  },
  locationInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: s.ink,
  },
  ctaWrap: {
    marginTop: space[3],
  },
});
