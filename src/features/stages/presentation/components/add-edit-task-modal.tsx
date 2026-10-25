import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import type {
  TaskItemEntity,
  TaskPriority,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../domain/entities/stage.entity';

export interface AddEditTaskModalProps {
  visible: boolean;
  stageId: string;
  stageName: string;
  initialData?: TaskItemEntity;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<boolean>;
}

export const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  visible,
  stageId,
  stageName,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setPriority(initialData.priority);
        setEstimatedHours(String(initialData.estimatedHours));
        setStatus(initialData.status);
      } else {
        setName('');
        setDescription('');
        setPriority('MEDIUM');
        setEstimatedHours('1');
        setStatus('TODO');
      }
      setErrorMessage(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Nama tugas tidak boleh kosong.');
      return;
    }

    const parsedHours = parseFloat(estimatedHours);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setErrorMessage('Estimasi waktu harus berupa angka lebih besar dari 0 (contoh: 1 atau 1.5).');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await onSubmit({
      stageId,
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedHours: parsedHours,
      status,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Ubah Tugas' : 'Tambah Tugas'}
      subtitle={`Tahap: ${stageName}`}
    >
      {errorMessage && (
        <View style={styles.errorBox}>
          <AppText variant="bodySmall" color="onErrorContainer">
            {errorMessage}
          </AppText>
        </View>
      )}

      <AppText variant="labelLarge" style={styles.inputLabel}>
        Nama Tugas
      </AppText>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errorMessage) setErrorMessage(null);
        }}
        placeholder="Contoh: Memahami Konsep AI"
        placeholderTextColor={colors.onSurfaceSubtle}
        style={styles.textInput}
      />

      <AppText variant="labelLarge" style={styles.inputLabel}>
        Deskripsi (Opsional)
      </AppText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Detail pekerjaan atau kriteria selesai..."
        placeholderTextColor={colors.onSurfaceSubtle}
        multiline
        numberOfLines={2}
        style={[styles.textInput, styles.textArea]}
      />

      {/* Prioritas: Rendah / Sedang / Tinggi */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Prioritas
      </AppText>
      <View style={styles.choiceRow}>
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
              style={[styles.choiceChip, isSelected && styles.choiceChipSelected]}
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

      {/* Estimasi Waktu (Jam) */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Estimasi Waktu (Jam)
      </AppText>
      <TextInput
        value={estimatedHours}
        onChangeText={setEstimatedHours}
        placeholder="Contoh: 1 atau 1.5"
        placeholderTextColor={colors.onSurfaceSubtle}
        keyboardType="decimal-pad"
        style={styles.textInput}
      />

      {/* Status Pengerjaan */}
      <AppText variant="labelLarge" style={styles.inputLabel}>
        Status Pengerjaan
      </AppText>
      <View style={styles.choiceRow}>
        {(
          [
            { key: 'TODO', label: 'Belum dimulai' },
            { key: 'IN_PROGRESS', label: 'Sedang dikerjakan' },
            { key: 'DONE', label: 'Selesai' },
          ] as const
        ).map((s) => {
          const isSelected = status === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setStatus(s.key)}
              style={[styles.choiceChip, isSelected && styles.choiceChipSelected]}
            >
              <AppText
                variant="labelSmall"
                color={isSelected ? 'onPrimaryContainer' : 'onSurface'}
              >
                {s.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <Button
          title="Batal"
          variant="tonal"
          onPress={onClose}
          style={styles.cancelBtn}
        />
        <Button
          title={initialData ? 'Simpan Perubahan' : 'Buat Tugas'}
          variant="filled"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitBtn}
        />
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
    height: 64,
    textAlignVertical: 'top',
    paddingVertical: space[2],
  },
  choiceRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  choiceChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  choiceChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space[3],
    marginTop: space[6],
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
