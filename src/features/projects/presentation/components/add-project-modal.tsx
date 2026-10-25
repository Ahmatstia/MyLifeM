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
import { X, FolderPlus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { targetRepository } from '@/features/targets/data/repositories/target.repository.impl';
import type { TargetEntity } from '@/features/targets/domain/entities/target.entity';
import type {
  CreateProjectInput,
  ProjectPriority,
} from '../../domain/entities/project.entity';

export interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<boolean>;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [availableTargets, setAvailableTargets] = useState<TargetEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      targetRepository.getTargets({ status: 'ACTIVE' }).then(setAvailableTargets);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Nama proyek tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      targetId,
      priority,
    });

    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setDescription('');
      setTargetId(null);
      setPriority('MEDIUM');
      onClose();
    } else {
      setErrorMessage('Gagal menyimpan proyek. Silakan coba lagi.');
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
                <FolderPlus size={20} color={colors.primary} />
              </View>
              <AppText variant="titleLarge">Buat Proyek Baru</AppText>
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
            {errorMessage && (
              <View style={styles.errorBox}>
                <AppText variant="bodySmall" color="onErrorContainer">
                  {errorMessage}
                </AppText>
              </View>
            )}

            {/* Input: Nama Proyek */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Nama Proyek *
            </AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Contoh: Rilis Aplikasi MyLife Mobile"
              placeholderTextColor={colors.onSurfaceSubtle}
              style={styles.textInput}
            />

            {/* Input: Deskripsi Proyek */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Deskripsi & Cakupan Kerja
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Apa hasil akhir yang ingin dicapai dari proyek ini?"
              placeholderTextColor={colors.onSurfaceSubtle}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.textArea]}
            />

            {/* Link to Target */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Tautkan ke Target Hidup (Opsional)
            </AppText>
            <View style={styles.targetsRow}>
              <Pressable
                onPress={() => setTargetId(null)}
                style={[
                  styles.targetChip,
                  targetId === null && styles.targetChipSelected,
                ]}
              >
                <AppText
                  variant="labelSmall"
                  color={targetId === null ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                >
                  Proyek Mandiri
                </AppText>
              </Pressable>

              {availableTargets.map((t) => {
                const isSelected = targetId === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTargetId(t.id)}
                    style={[
                      styles.targetChip,
                      isSelected && styles.targetChipSelected,
                    ]}
                  >
                    <AppText
                      variant="labelSmall"
                      color={isSelected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
                      numberOfLines={1}
                    >
                      🎯 {t.title}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Priority Selector */}
            <AppText variant="labelLarge" style={styles.inputLabel}>
              Prioritas
            </AppText>
            <View style={styles.priorityRow}>
              {(['LOW', 'MEDIUM', 'HIGH'] as ProjectPriority[]).map((pr) => {
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

            {/* Sticky Action Button Row (DESIGN.md Template C) */}
            <View style={styles.actionRow}>
              <Button
                title="Batal"
                onPress={onClose}
                variant="tonal"
                style={styles.cancelButton}
              />
              <Button
                title="Simpan Proyek"
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
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  targetChip: {
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    maxWidth: '90%',
  },
  targetChipSelected: {
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
