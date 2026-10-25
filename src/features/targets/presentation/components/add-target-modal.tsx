import React, { useState } from 'react';
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
import { X, Target as TargetIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import type {
  CreateTargetInput,
  LifePillarEntity,
  TargetType,
  TargetPriority,
} from '../../domain/entities/target.entity';

export interface AddTargetModalProps {
  visible: boolean;
  pillars: LifePillarEntity[];
  onClose: () => void;
  onSubmit: (input: CreateTargetInput) => Promise<boolean>;
}

export const AddTargetModal: React.FC<AddTargetModalProps> = ({
  visible,
  pillars,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pillarId, setPillarId] = useState(pillars[0]?.id || 'career');
  const [type, setType] = useState<TargetType>('NUMERIC');
  const [targetValue, setTargetValue] = useState('100');
  const [unit, setUnit] = useState('%');
  const [priority, setPriority] = useState<TargetPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Judul target tidak boleh kosong.');
      return;
    }

    const parsedTargetVal = parseFloat(targetValue);
    if (isNaN(parsedTargetVal) || parsedTargetVal <= 0) {
      setErrorMessage('Nilai target harus berupa angka lebih dari 0.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      pillarId,
      type,
      targetValue: parsedTargetVal,
      currentValue: 0,
      unit: unit.trim() || '%',
      priority,
    });

    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setDescription('');
      setTargetValue('100');
      setUnit('%');
      onClose();
    } else {
      setErrorMessage('Gagal menyimpan target. Silakan coba lagi.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AppText variant="bodySmall" color="onErrorContainer">
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            {/* Input: Judul Target */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Judul Target *
            </AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Menabung Dana Darurat 2026"
              placeholderTextColor={colors.onSurfaceSubtle}
              style={styles.textInput}
            />

            {/* Input: Deskripsi */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Alasan & Visi Motivasi (Opsional)
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Kenapa target ini penting untuk hidupmu?"
              placeholderTextColor={colors.onSurfaceSubtle}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.textArea]}
            />

            {/* Selector: Pilar Kehidupan */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Pilar Kehidupan *
            </AppText>
            <View style={styles.chipRow}>
              {pillars.map((p) => {
                const isSelected = pillarId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPillarId(p.id)}
                    style={[
                      styles.choiceChip,
                      isSelected && {
                        backgroundColor: colors.primaryContainer,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <View
                      style={[styles.choiceDot, { backgroundColor: p.color }]}
                    />
                    <AppText
                      variant="labelSmall"
                      color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                    >
                      {p.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Selector: Tipe Pengukuran */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Tipe Pengukuran Target
            </AppText>
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => {
                  setType('NUMERIC');
                  setUnit('buku');
                }}
                style={[
                  styles.typeOption,
                  type === 'NUMERIC' && styles.typeOptionSelected,
                ]}
              >
                <AppText
                  variant="labelMedium"
                  color={type === 'NUMERIC' ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                >
                  Angka / Metrik
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setType('MILESTONE_BASED');
                  setUnit('%');
                }}
                style={[
                  styles.typeOption,
                  type === 'MILESTONE_BASED' && styles.typeOptionSelected,
                ]}
              >
                <AppText
                  variant="labelMedium"
                  color={type === 'MILESTONE_BASED' ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                >
                  Tugas & Milestone
                </AppText>
              </Pressable>
            </View>

            {/* Target Value & Unit */}
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <AppText variant="labelLarge" style={styles.inputLabel}>
                  Sasaran Akhir *
                </AppText>
                <TextInput
                  value={targetValue}
                  onChangeText={setTargetValue}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={colors.onSurfaceSubtle}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.halfInput}>
                <AppText variant="labelLarge" style={styles.inputLabel}>
                  Satuan Unit *
                </AppText>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="%, kg, buku"
                  placeholderTextColor={colors.onSurfaceSubtle}
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Priority Selector */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Prioritas
            </AppText>
            <View style={styles.priorityRow}>
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TargetPriority[]).map((pr) => {
                const isSelected = priority === pr;
                return (
                  <Pressable
                    key={pr}
                    onPress={() => setPriority(pr)}
                    style={[
                      styles.priorityChip,
                      isSelected && styles.priorityChipSelected,
                    ]}
                  >
                    <AppText
                      variant="labelSmall"
                      color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {pr.toLowerCase()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Button
                title="Batal"
                onPress={onClose}
                variant="tonal"
                style={styles.cancelButton}
              />
              <Button
                title="Simpan Target"
                onPress={handleSubmit}
                variant="filled"
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  choiceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: space[2],
  },
  typeRow: {
    flexDirection: 'row',
    gap: space[3],
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  typeOptionSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: space[3],
  },
  halfInput: {
    flex: 1,
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
