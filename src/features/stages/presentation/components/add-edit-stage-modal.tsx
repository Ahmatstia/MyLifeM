import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';

export interface AddEditStageModalProps {
  visible: boolean;
  initialData?: { id: string; name: string; description?: string | null };
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<boolean>;
}

export const AddEditStageModal: React.FC<AddEditStageModalProps> = ({
  visible,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setErrorMessage(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Nama tahapan tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const success = await onSubmit(name.trim(), description.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Ubah Tahapan' : 'Tambah Tahapan Baru'}
      subtitle="Pecah tujuanmu menjadi fase yang berurutan"
    >
      {errorMessage && (
        <View style={styles.errorBox}>
          <AppText variant="bodySmall" color="onErrorContainer">
            {errorMessage}
          </AppText>
        </View>
      )}

      <AppText variant="labelLarge" style={styles.inputLabel}>
        Nama Tahapan
      </AppText>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errorMessage) setErrorMessage(null);
        }}
        placeholder="Contoh: Tahap 1 — Fondasi AI"
        placeholderTextColor={colors.onSurfaceSubtle}
        style={styles.textInput}
      />

      <AppText variant="labelLarge" style={styles.inputLabel}>
        Deskripsi (Opsional)
      </AppText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Fokus atau hasil yang diharapkan dari tahap ini..."
        placeholderTextColor={colors.onSurfaceSubtle}
        multiline
        numberOfLines={3}
        style={[styles.textInput, styles.textArea]}
      />

      <View style={styles.actionRow}>
        <Button
          title="Batal"
          variant="tonal"
          onPress={onClose}
          style={styles.cancelBtn}
        />
        <Button
          title={initialData ? 'Simpan Perubahan' : 'Buat Tahapan'}
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
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: space[2],
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
