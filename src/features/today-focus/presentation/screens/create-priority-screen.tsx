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
import {
  Plus,
  GraduationCap,
  Heart,
  Briefcase,
  Gamepad2,
  Check,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { layout, radius, space, fontFamily, typography, touchTarget } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
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

const DURATION_OPTIONS = [null, 15, 30, 45, 60] as const;

export const CreatePriorityScreen: React.FC = () => {
  const { focusItems = [], availableTasks = [], addQuickTask, addTaskToToday, isLoading, error } = useTodayFocus();

  const [quickTitle, setQuickTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuickTaskCategory>('Belajar');
  const submitting = useRef(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCount = focusItems.length;
  const isFull = currentCount >= 5;

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
      style={styles.screenBg}
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <FormScreenHeader title="Tambah Tugas" onBack={() => { if (!submitting.current) backOrHome(); }} />

        {(errorMessage || error) && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage || error}
              </AppText>
            </View>
          )}

          <View style={styles.titleFields}>
            <FieldLabel>Nama tugas</FieldLabel>
            <TextInput accessibilityLabel="Nama tugas"
              value={quickTitle}
              onChangeText={(text) => {
                setQuickTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama tugas"
              placeholderTextColor={s.inkSubtle}
              style={formInputBase}
              autoFocus
              editable={!isFull && !isSubmitting && !isLoading}
            />
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

          <FieldLabel>Durasi fokus (menit)</FieldLabel>
          <View style={styles.durationKeys}>
            {DURATION_OPTIONS.map(minutes => {
              const selected = minutes === selectedMinutes;
              const label = minutes === null ? 'Otomatis' : `${minutes} menit`;
              return (
                <Pressable key={minutes ?? 'auto'} onPress={() => setSelectedMinutes(minutes)}
                  accessibilityRole="button" accessibilityState={{ selected }}
                  accessibilityLabel={label} disabled={isSubmitting || isLoading || isFull}
                  style={({ pressed }) => [styles.durationKey, selected && styles.selectedKey, pressed && styles.keyPressed]}>
                  <AppText variant="titleSmall" tabularNums color={selected ? 'onPrimary' : 'onSurface'}>
                    {minutes ?? 'Auto'}
                  </AppText>
                  {selected && <Check size={space[3]} color={colors.onPrimary} />}
                </Pressable>
              );
            })}
          </View>
          <AppText variant="labelMedium" color="onSurfaceVariant">
            {selectedMinutes === null ? 'Mengikuti durasi di pengaturan fokus.' : `Fokus selama ${selectedMinutes} menit.`}
          </AppText>

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
                          {t.estimatedMinutes} menit{t.quickCategory ? `, ${t.quickCategory}` : ''}
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
  durationKeys: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  durationKey: { flexGrow: 1, minWidth: touchTarget.min, minHeight: touchTarget.min, paddingHorizontal: space[2], paddingVertical: space[1], alignItems: 'center', justifyContent: 'center', gap: space[1], backgroundColor: colors.folderLilac, borderRadius: radius.sm },
  selectedKey: { backgroundColor: colors.primary },
  keyPressed: { opacity: 0.82 },
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
    borderRadius: radius.xl,
  },
  savedTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  taskOptionTextCol: {
    flex: 1,
    gap: space[0.5],
  },
  taskOptionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
  },
  taskOptionSub: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  selectCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrap: {
    marginTop: space[4],
  },
});
