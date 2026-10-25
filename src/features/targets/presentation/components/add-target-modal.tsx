import React, { useState, useEffect } from 'react';
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
import { X, Target as TargetIcon, Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import type { CreateTargetInput, TargetPriority } from '../../domain/entities/target.entity';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export interface AddTargetModalProps {
  visible: boolean;
  categories: CategoryWithCount[];
  onClose: () => void;
  onSubmit: (input: CreateTargetInput) => Promise<boolean>;
  onOpenCategoryManager: () => void;
}

export const AddTargetModal: React.FC<AddTargetModalProps> = ({
  visible,
  categories,
  onClose,
  onSubmit,
  onOpenCategoryManager,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState<TargetPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setErrorMessage(null);
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
    }
  }, [visible, categories, categoryId]);

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

    const success = await onSubmit({
      title: title.trim(),
      categoryId,
      description: description.trim() || undefined,
      priority,
    });

    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setDescription('');
      onClose();
    } else {
      setErrorMessage('Gagal menyimpan target. Silakan periksa kembali formulir.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <TargetIcon size={20} color={colors.primary} />
              </View>
              <AppText variant="titleLarge">Buat Target Baru</AppText>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
            >
              <X size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <AppText variant="bodySmall" color="onErrorContainer">
                  {errorMessage}
                </AppText>
              </View>
            )}

            {/* Nama Target (Wajib) */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Nama Target *
            </AppText>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Contoh: AI Engineer atau Belajar Bahasa Inggris"
              placeholderTextColor={colors.onSurfaceSubtle}
              style={styles.textInput}
            />

            {/* Kategori Target (Wajib) */}
            <View style={styles.categoryLabelRow}>
              <AppText variant="labelLarge" style={styles.inputLabel}>
                Kategori *
              </AppText>
              <Pressable
                onPress={() => {
                  onClose();
                  onOpenCategoryManager();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.manageCategoryTouch}
              >
                <Plus size={14} color={colors.primary} />
                <AppText variant="labelSmall" color="primary">
                  Kelola Kategori
                </AppText>
              </Pressable>
            </View>

            {categories.length === 0 ? (
              <View style={styles.noCategoriesCard}>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  Belum ada kategori. Buat kategori terlebih dahulu agar target dapat dikelompokkan.
                </AppText>
                <Button
                  title="Buat Kategori Baru"
                  variant="tonal"
                  size="compact"
                  onPress={() => {
                    onClose();
                    onOpenCategoryManager();
                  }}
                  style={styles.createCatBtn}
                />
              </View>
            ) : (
              <View style={styles.chipRow}>
                {categories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      accessibilityRole="button"
                      style={[styles.choiceChip, isSelected && styles.choiceChipSelected]}
                    >
                      <AppText
                        variant="labelMedium"
                        color={isSelected ? 'onPrimaryContainer' : 'onSurface'}
                      >
                        {c.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Deskripsi (Opsional) */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Deskripsi (Opsional)
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tujuan spesifik atau hasil yang ingin kamu capai..."
              placeholderTextColor={colors.onSurfaceSubtle}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.textArea]}
            />

            {/* Prioritas */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Prioritas Target
            </AppText>
            <View style={styles.priorityRow}>
              {(
                [
                  { key: 'LOW', label: 'Rendah' },
                  { key: 'MEDIUM', label: 'Sedang' },
                  { key: 'HIGH', label: 'Tinggi' },
                ] as const
              ).map((p) => {
                const isSelected = priority === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPriority(p.key)}
                    style={[styles.priorityChip, isSelected && styles.priorityChipSelected]}
                  >
                    <AppText
                      variant="labelMedium"
                      color={isSelected ? 'onPrimaryContainer' : 'onSurface'}
                    >
                      {p.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Tombol Aksi */}
            <View style={styles.actionRow}>
              <Button
                title="Batal"
                variant="tonal"
                onPress={onClose}
                style={styles.cancelButton}
              />
              <Button
                title="Simpan Target"
                variant="filled"
                onPress={handleSubmit}
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
    maxHeight: '90%',
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
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageCategoryTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  noCategoriesCard: {
    padding: space[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: space[2],
  },
  createCatBtn: {
    alignSelf: 'flex-start',
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
    height: 72,
    textAlignVertical: 'top',
    paddingVertical: space[2],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  choiceChip: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  choiceChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  priorityChipSelected: {
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
