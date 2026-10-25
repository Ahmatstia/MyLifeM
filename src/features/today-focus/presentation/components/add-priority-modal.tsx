import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import type { TaskEntity } from '../../domain/entities/daily-focus.entity';

export interface AddPriorityModalProps {
  visible: boolean;
  availableTasks: TaskEntity[];
  currentCount: number;
  onClose: () => void;
  onAddQuickTask: (title: string) => Promise<boolean>;
  onSelectExistingTask: (taskId: string) => Promise<boolean>;
}

export const AddPriorityModal: React.FC<AddPriorityModalProps> = ({
  visible,
  availableTasks,
  currentCount,
  onClose,
  onAddQuickTask,
  onSelectExistingTask,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) {
      setErrorMessage('Judul tugas tidak boleh kosong.');
      return;
    }

    if (currentCount >= 5) {
      setErrorMessage('Maksimal 5 prioritas per hari.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await onAddQuickTask(quickTitle.trim());
    setIsSubmitting(false);

    if (success) {
      setQuickTitle('');
      onClose();
    }
  };

  const handleSelectTask = async (taskId: string) => {
    if (currentCount >= 5) {
      setErrorMessage('Maksimal 5 prioritas per hari.');
      return;
    }

    const success = await onSelectExistingTask(taskId);
    if (success) {
      onClose();
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Tambah Prioritas Hari Ini"
      subtitle={`Maksimal 5 tugas pilihan (${currentCount}/5 terisi)`}
    >
      {/* Error notice */}
      {errorMessage && (
        <View style={styles.errorBox}>
          <AppText variant="bodySmall" color="onErrorContainer">
            {errorMessage}
          </AppText>
        </View>
      )}

      {/* Quick Add Section */}
      <AppText variant="labelLarge" style={styles.sectionLabel}>
        Buat Tugas Cepat Baru
      </AppText>

      <View style={styles.quickAddRow}>
        <TextInput
          value={quickTitle}
          onChangeText={setQuickTitle}
          placeholder="Tulis tugas prioritas..."
          placeholderTextColor={colors.onSurfaceSubtle}
          style={styles.textInput}
        />
        <Button
          title="Tambah"
          onPress={handleQuickAdd}
          variant="filled"
          size="standard"
          loading={isSubmitting}
          disabled={currentCount >= 5}
          leftIcon={<Plus size={16} color={colors.onPrimary} />}
          style={styles.addButton}
        />
      </View>

      {/* Existing Tasks from DB */}
      {availableTasks.length > 0 && (
        <>
          <AppText variant="labelLarge" style={styles.sectionLabel}>
            Atau Pilih Dari Tugas Tersimpan
          </AppText>

          <View style={styles.tasksList}>
            {availableTasks.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => handleSelectTask(t.id)}
                accessibilityRole="button"
                disabled={currentCount >= 5}
                style={styles.taskOptionItem}
              >
                <View style={styles.taskOptionTextCol}>
                  <AppText variant="bodyMedium" numberOfLines={1}>
                    {t.title}
                  </AppText>
                  <AppText variant="labelSmall" color="onSurfaceSubtle">
                    Estimasi: {t.estimatedMinutes} menit
                  </AppText>
                </View>

                <View style={styles.selectBadge}>
                  <Plus size={16} color={colors.primary} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
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
  sectionLabel: {
    marginTop: space[2],
    marginBottom: space[2],
    color: colors.onSurface,
  },
  quickAddRow: {
    gap: space[2],
    marginBottom: space[4],
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    color: colors.onSurface,
    paddingHorizontal: space[4],
    minHeight: 56,
    paddingVertical: space[3],
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  addButton: {
    minWidth: 100,
  },
  tasksList: {
    gap: space[2],
  },
  taskOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    padding: space[3],
    minHeight: 52,
  },
  taskOptionTextCol: {
    flex: 1,
    marginRight: space[2],
  },
  selectBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
