import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { backOrHome } from '@/shared/utils/back-or-home';
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
import { formInputBase } from '@/shared/ui/form-control-styles';
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
} from '@/shared/ui';
import { useTodayFocus } from '../hooks/use-today-focus';
import type { QuickTaskCategory } from '../../domain/quick-task';

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
  const { focusItems = [], availableTasks = [], addQuickTask, addTaskToToday, isLoading, error } = useTodayFocus();

  const [quickTitle, setQuickTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickTaskCategory>('Belajar');
  const submitting = useRef(false);
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

  const savePriority = async (work: () => Promise<boolean>) => {
    if (submitting.current || isLoading) return;
    if (isFull) {
      setErrorMessage('Maksimal 5 tugas prioritas per hari.');
      return;
    }

    submitting.current = true; setErrorMessage(null); setIsSubmitting(true);
    try {
      if (await work()) backOrHome();
      else setErrorMessage('Tugas belum tersimpan. Silakan coba lagi.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Tugas belum tersimpan. Silakan coba lagi.');
    } finally { submitting.current = false; setIsSubmitting(false); }
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) { setErrorMessage('Judul tugas tidak boleh kosong.'); return; }
    await savePriority(() => addQuickTask(quickTitle.trim(), undefined, {
      category: selectedCategory, ...(selectedMinutes === null ? {} : { estimatedMinutes: selectedMinutes }),
    }));
  };

  const handleSelectTask = (taskId: string) => savePriority(() => addTaskToToday(taskId));

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
          <FormScreenHeader title="Tambah Tugas" onBack={() => { if (!submitting.current) backOrHome(); }} />
        </View>

        {(errorMessage || error) && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage || error}
              </AppText>
            </View>
          )}

          <FieldLabel>Nama tugas</FieldLabel>
          <View style={styles.cloudHeroWrap}>
            <View style={styles.cloudOuterCard}>
              <View style={styles.cloudInnerPill}>
                <TextInput accessibilityLabel="Nama tugas"
                  value={quickTitle}
                  onChangeText={(text) => {
                    setQuickTitle(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan nama tugas"
                  placeholderTextColor={s.inkSubtle}
                  style={styles.cloudInput}
                  autoFocus
                  editable={!isFull && !isSubmitting && !isLoading}
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
                onPress={() => { if (!submitting.current) setSelectedCategory(cat.id as QuickTaskCategory); }}
              />
            ))}
          </View>

          {/* Waktu (Optional Pill Row matching Reference UI) */}
          <FieldLabel>Durasi fokus (opsional)</FieldLabel>
          <Pressable
            onPress={cycleDuration}
            accessibilityRole="button"
            accessibilityLabel="Pilih durasi fokus"
            disabled={isSubmitting || isLoading || isFull}
            style={({ pressed }) => [styles.timePillRow, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.timePillLeft}>
              <Clock size={20} color={s.ink} strokeWidth={2.2} />
              <AppText style={styles.timePillText}>
                {selectedMinutes
                  ? `${selectedMinutes} menit · ${selectedCategory}`
                  : 'Ikuti pengaturan fokus'}
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
                          {t.estimatedMinutes} menit{t.quickCategory ? ` · ${t.quickCategory}` : ''}
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
              disabled={isFull || isLoading || isSubmitting || !quickTitle.trim()}
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
    gap: space[3],
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingTop: space[2],
    gap: space[3],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  cloudHeroWrap: {
    marginBottom: space[2],
    position: 'relative',
  },
  cloudOuterCard: { gap: 8, },
  cloudInnerPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: s.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, gap: 8, },
  cloudInput: { flex: 1, fontFamily: fontFamily.medium, fontSize: 14, color: s.ink, paddingVertical: 8, ...formInputBase, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, },
  categoryTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: space[2],
  },
  timePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF0E8',
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderWidth: 1,
    borderColor: '#DDE3D8',
  },
  timePillLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  timePillText: {
    flexShrink: 1,
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
