import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Button, FormScreenHeader } from '@/shared/ui';
import { categoryRepository } from '@/features/categories/data/repositories/category.repository.impl';
import { targetRepository } from '../../data/repositories/target.repository.impl';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';
import type { TargetPriority } from '../../domain/entities/target.entity';

export const CreateTargetScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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
    categoryRepository.getAll().then((data) => {
      if (!active) return;
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
      setIsLoadingCats(false);
    }).catch(() => {
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
      router.back();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal menyimpan target. Silakan coba lagi.');
    }
  };

  const priorityOptions: { value: TargetPriority; label: string; activeColor: string }[] = [
    { value: 'LOW', label: 'Rendah', activeColor: '#5A5D65' },
    { value: 'MEDIUM', label: 'Sedang', activeColor: '#0E6852' },
    { value: 'HIGH', label: 'Tinggi', activeColor: '#DC2626' },
  ];

  return (
    <Screen scrollable={false} withBottomPadding={false} withHorizontalPadding={false} style={styles.screenBg}>
      <FormScreenHeader title="Target Baru" onBack={() => router.back()} />

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

          {/* Section 1: Main Info Pod */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              NAMA TARGET *
            </AppText>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Misal: Mahir Machine Learning"
              placeholderTextColor="#8F9298"
              style={styles.textInput}
              autoFocus
            />

            <View style={styles.podDivider} />

            <AppText variant="labelSmall" style={styles.fieldLabel}>
              DESKRIPSI / TUJUAN
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tulis alasan atau gambaran hasil akhir yang ingin dicapai..."
              placeholderTextColor="#8F9298"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>

          {/* Section 2: Kategori Pod */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              KATEGORI *
            </AppText>
            {isLoadingCats ? (
              <ActivityIndicator size="small" color="#0E6852" style={{ alignSelf: 'flex-start', marginVertical: space[2] }} />
            ) : categories.length === 0 ? (
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Belum ada kategori. Silakan tambahkan kategori di Pengaturan.
              </AppText>
            ) : (
              <View style={styles.chipGrid}>
                {categories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                        pressed && styles.categoryChipPressed,
                      ]}
                    >
                      <AppText
                        variant="labelMedium"
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {c.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Section 3: Tingkat Prioritas Pod */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              TINGKAT PRIORITAS
            </AppText>
            <View style={styles.prioritySelectorRow}>
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setPriority(opt.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.priorityOptionBtn,
                      isSelected && [styles.priorityOptionBtnSelected, { backgroundColor: opt.activeColor }],
                    ]}
                  >
                    <AppText
                      variant="labelMedium"
                      style={[
                        styles.priorityOptionText,
                        isSelected && styles.priorityOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
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
            title="Simpan Target"
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
    minHeight: 90,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: space[1],
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  categoryChipSelected: {
    backgroundColor: '#121316',
    borderColor: '#121316',
  },
  categoryChipPressed: {
    opacity: 0.8,
  },
  categoryChipText: {
    fontFamily: fontFamily.medium,
    color: '#44474E',
    fontSize: 13,
  },
  categoryChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: space[1],
  },
  priorityOptionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  priorityOptionBtnSelected: {
    borderColor: 'transparent',
  },
  priorityOptionText: {
    fontFamily: fontFamily.medium,
    color: '#44474E',
    fontSize: 13,
  },
  priorityOptionTextSelected: {
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

