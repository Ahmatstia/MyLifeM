import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Sparkles,
  GraduationCap,
  Heart,
  Briefcase,
  Gamepad2,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  WaveBackdrop,
  SoftCard,
  ChoiceTile,
  SunButton,
  FieldLabel,
  MascotHead,
  sproutShadow,
} from '@/shared/ui';
import { useTodayFocus } from '../hooks/use-today-focus';

const s = colors.sprout;

const QUICK_CATEGORIES = [
  { id: 'Belajar', label: 'Belajar', icon: GraduationCap, tone: 'leaf' as const },
  { id: 'Kesehatan', label: 'Kesehatan', icon: Heart, tone: 'rose' as const },
  { id: 'Kerja', label: 'Kerja', icon: Briefcase, tone: 'teal' as const },
  { id: 'Hobi', label: 'Hobi', icon: Gamepad2, tone: 'grape' as const },
];

const DURATION_OPTIONS = [15, 30, 45, 60];

export const CreatePriorityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { focusItems = [], availableTasks = [], addQuickTask, addTaskToToday } = useTodayFocus();

  const [quickTitle, setQuickTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Belajar');
  const [durationIdx, setDurationIdx] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCount = focusItems.length;
  const isFull = currentCount >= 5;

  const selectedMinutes = durationIdx !== null ? DURATION_OPTIONS[durationIdx] : null;

  const cycleDuration = () => {
    setDurationIdx((prev) => {
      if (prev === null) return 0;
      if (prev >= DURATION_OPTIONS.length - 1) return null;
      return prev + 1;
    });
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) {
      setErrorMessage('Judul tugas tidak boleh kosong.');
      return;
    }

    if (isFull) {
      setErrorMessage('Maksimal 5 tugas prioritas per hari.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await addQuickTask(quickTitle.trim());
    setIsSubmitting(false);

    if (success) {
      router.back();
    } else {
      setErrorMessage('Gagal menambahkan tugas prioritas.');
    }
  };

  const handleSelectTask = async (taskId: string) => {
    if (isFull) {
      setErrorMessage('Maksimal 5 tugas prioritas per hari.');
      return;
    }

    setErrorMessage(null);
    const success = await addTaskToToday(taskId);
    if (success) {
      router.back();
    } else {
      setErrorMessage('Gagal menambahkan tugas ke hari ini.');
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
          <FormScreenHeader title="Tambah Tugas" onBack={() => router.back()} />
        </View>

        {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Peeking Mascot + Cloud Input Card (exact match to Reference UI) */}
          <View style={styles.cloudHeroWrap}>
            <View style={styles.mascotHeadWrap} pointerEvents="none">
              <MascotHead width={144} height={92} />
            </View>

            <View style={styles.cloudOuterCard}>
              <View style={styles.cloudInnerPill}>
                <TextInput
                  value={quickTitle}
                  onChangeText={(text) => {
                    setQuickTitle(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Apa yang ingin kamu lakukan?"
                  placeholderTextColor={s.inkSubtle}
                  style={styles.cloudInput}
                  autoFocus
                  editable={!isFull}
                />
                <Sparkles size={20} color={s.sun} fill={s.sun} />
              </View>
            </View>
          </View>

          {/* Kategori Squircle Tiles */}
          <FieldLabel>Kategori</FieldLabel>
          <View style={styles.categoryTilesRow}>
            {QUICK_CATEGORIES.map((cat) => (
              <ChoiceTile
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                tone={cat.tone}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
            ))}
          </View>

          {/* Waktu (Optional Pill Row matching Reference UI) */}
          <FieldLabel>Waktu</FieldLabel>
          <Pressable
            onPress={cycleDuration}
            accessibilityRole="button"
            style={({ pressed }) => [styles.timePillRow, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.timePillLeft}>
              <Clock size={20} color={s.ink} strokeWidth={2.2} />
              <AppText style={styles.timePillText}>
                {selectedMinutes
                  ? `${selectedMinutes} menit · ${selectedCategory}`
                  : 'Atur waktu (opsional)'}
              </AppText>
            </View>
            <ChevronRight size={20} color={s.ink} strokeWidth={2.2} />
          </Pressable>

          {/* Pilih dari Rencana Tersimpan */}
          {availableTasks.length > 0 && (
            <View style={styles.savedSection}>
              <FieldLabel>Atau pilih dari rencana ({availableTasks.length})</FieldLabel>
              <View style={styles.tasksList}>
                {availableTasks.map((t) => (
                  <SoftCard
                    key={t.id}
                    onPress={() => handleSelectTask(t.id)}
                    style={styles.savedTaskCard}
                  >
                    <View style={styles.savedTaskRow}>
                      <View style={styles.taskOptionTextCol}>
                        <AppText style={styles.taskOptionTitle} numberOfLines={1}>
                          {t.title}
                        </AppText>
                        <AppText style={styles.taskOptionSub}>
                          {t.estimatedMinutes} menit
                        </AppText>
                      </View>
                      <View style={styles.selectCircle}>
                        <Plus size={16} color={s.forest} strokeWidth={2.6} />
                      </View>
                    </View>
                  </SoftCard>
                ))}
              </View>
            </View>
          )}

          {/* Big Golden-Yellow SunButton CTA */}
          <View style={styles.ctaWrap}>
            <SunButton
              title="Simpan"
              onPress={handleQuickAdd}
              loading={isSubmitting}
              disabled={isFull || !quickTitle.trim()}
            />
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
  categoryTilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space[2],
  },
  timePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1EBDC',
    borderRadius: 22,
    paddingHorizontal: space[4],
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  timePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  timePillText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: s.ink,
  },
  savedSection: {
    marginTop: space[2],
    gap: space[2],
  },
  tasksList: {
    gap: space[2],
  },
  savedTaskCard: {
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: 22,
  },
  savedTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  taskOptionTextCol: {
    flex: 1,
    gap: 2,
  },
  taskOptionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  taskOptionSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  selectCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrap: {
    marginTop: space[4],
  },
});
