import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Target as TargetIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import type { CreateTargetInput, TargetPriority } from '../../domain/entities/target.entity';
import type { CategoryWithCount } from '@/features/categories/domain/entities/category.entity';

export interface AddTargetModalProps {
  visible: boolean;
  categories: CategoryWithCount[];
  onClose: () => void;
  onSubmit: (input: CreateTargetInput) => Promise<boolean>;
}

export const AddTargetModal: React.FC<AddTargetModalProps> = ({
  visible,
  categories,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState<TargetPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setErrorMessage(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!categories.some(category => category.id === categoryId)) {
      setCategoryId(categories[0]?.id || '');
    }
  }, [categories, categoryId]);

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
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Buat Target Baru"
      icon={<TargetIcon size={20} color={colors.primary} />}
      footer={
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
      }
    >
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
      </View>

      {categories.length === 0 ? (
        <View style={styles.noCategoriesCard}>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Belum ada kategori. Buat kategori melalui Pengaturan → Kategori target, lalu kembali ke sini.
          </AppText>
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
                accessibilityState={{ selected: isSelected }}
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

    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
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
  noCategoriesCard: {
    padding: space[3],
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: space[2],
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.lg,
    color: colors.onSurface,
    paddingHorizontal: space[3],
    minHeight: 56,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  textArea: {
    minHeight: 96,
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
    borderColor: colors.outline,
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
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
  },
  priorityChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[1],
    marginBottom: space[1],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
