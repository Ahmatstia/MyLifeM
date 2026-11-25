import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { backOrHome } from '@/shared/utils/back-or-home';
import {
  GraduationCap,
  Heart,
  Briefcase,
  Gamepad2,
  Compass,
  Flag,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { touchTarget, layout, radius, space, fontFamily, stroke, typography } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  ChoiceTile,
  SunButton,
  FieldLabel,
} from '@/shared/ui';
import { categoryRepository } from '@/features/categories/data/repositories/category.repository.impl';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';
import type { TargetPriority } from '../../domain/entities/target.entity';

const s = colors.sprout;

const CATEGORY_ICONS = [GraduationCap, Heart, Briefcase, Gamepad2, Compass];
const CATEGORY_TONES = ['leaf', 'rose', 'teal', 'grape', 'sun'] as const;

export const CreateTargetScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState<TargetPriority>('MEDIUM');
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    categoryRepository
      .getAll()
      .then((data) => {
        if (!active) return;
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
        setIsLoadingCats(false);
      })
      .catch(() => {
        if (active) setIsLoadingCats(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Nama target tidak boleh kosong.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Pilih kategori untuk target ini terlebih dahulu.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await targetRepository.createTarget({
        title: title.trim(),
        categoryId,
        description: description.trim() || undefined,
        priority,
      });
      setIsSubmitting(false);
      backOrHome();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal menyimpan target. Silakan coba lagi.');
    }
  };

  const priorityOptions: { value: TargetPriority; label: string }[] = [
    { value: 'LOW', label: 'Santai' },
    { value: 'MEDIUM', label: 'Utama' },
    { value: 'HIGH', label: 'Mendesak' },
  ];

  return (
    <Screen
      scrollable
      style={styles.screenBg}
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <FormScreenHeader title="Target Baru" onBack={() => backOrHome()} />

        {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          <View style={styles.titleFields}>
            <FieldLabel>Nama target</FieldLabel>
            <TextInput accessibilityLabel="Nama target"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Masukkan nama target"
              placeholderTextColor={s.inkSubtle}
              style={formInputBase}
              autoFocus
            />
            <FieldLabel>Deskripsi (opsional)</FieldLabel>
            <TextInput accessibilityLabel="Deskripsi target"
              value={description}
              onChangeText={setDescription}
              placeholder="Masukkan deskripsi target"
              placeholderTextColor={s.inkSubtle}
              multiline
              style={formInputBase}
            />
          </View>

          {/* Kategori Squircle Tiles */}
          <FieldLabel>Kategori</FieldLabel>
          {isLoadingCats ? (
            <ActivityIndicator size="small" color={s.forest} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <View style={styles.categoryTilesRow}>
              {categories.map((c, idx) => (
                <ChoiceTile
                  key={c.id}
                  label={c.name}
                  icon={CATEGORY_ICONS[idx % CATEGORY_ICONS.length]}
                  tone={CATEGORY_TONES[idx % CATEGORY_TONES.length]}
                  selected={categoryId === c.id}
                  onPress={() => setCategoryId(c.id)}
                />
              ))}
            </View>
          )}

          {/* Tingkat Prioritas */}
          <FieldLabel>Prioritas</FieldLabel>
          <View style={styles.priorityRow}>
            {priorityOptions.map((opt) => {
              const selected = priority === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPriority(opt.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.priorityPill, selected && styles.priorityPillSelected]}
                >
                  <Flag size={14} color={selected ? colors.surfaceContainerLowest : s.inkMuted} strokeWidth={2.3} />
                  <AppText
                    style={[styles.priorityPillText, selected && styles.priorityPillTextSelected]}
                  >
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
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
    gap: space[2],
  },
  priorityRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  priorityPill: {
    minHeight: touchTarget.min,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.xl,
    paddingVertical: space[3],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  priorityPillSelected: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  priorityPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  priorityPillTextSelected: {
    fontFamily: fontFamily.bold,
    color: colors.surfaceContainerLowest,
  },
  ctaWrap: {
    marginTop: space[4],
  },
});
