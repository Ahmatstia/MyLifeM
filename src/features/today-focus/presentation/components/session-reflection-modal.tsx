import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Star, CheckCircle, Award } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';

export interface SessionReflectionData {
  rating: number;
  obstacle?: string;
  nextAction?: string;
}

export interface SessionReflectionModalProps {
  visible: boolean;
  durationMinutes: number;
  taskTitle?: string;
  onClose: () => void;
  onSubmit: (data: SessionReflectionData) => void;
}

export const SessionReflectionModal: React.FC<SessionReflectionModalProps> = ({
  visible,
  durationMinutes,
  taskTitle,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [obstacle, setObstacle] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');

  const handleSave = () => {
    onSubmit({
      rating,
      obstacle: obstacle.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
    });
    setObstacle('');
    setNextAction('');
    setRating(4);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Full-screen backdrop touch to dismiss */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup dialog"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.dialogCard}>
            {/* Header celebration */}
            <View style={styles.header}>
              <View style={styles.awardCircle}>
                <Award size={32} color={colors.primary} />
              </View>
              <AppText variant="titleLarge" align="center">
                Sesi Fokus Selesai!
              </AppText>
              <AppText variant="bodyMedium" color="onSurfaceVariant" align="center" style={styles.subtitle}>
                Hebat! Kamu telah fokus selama{' '}
                <AppText variant="titleSmall" color="primary">
                  {durationMinutes} menit
                </AppText>
                {taskTitle ? ` untuk "${taskTitle}"` : '.'}
              </AppText>
            </View>

          {/* Star Rating (1 - 5) */}
          <View style={styles.ratingSection}>
            <AppText variant="labelMedium" color="onSurfaceVariant" align="center">
              Tingkat kepuasan & kedalaman fokusmu:
            </AppText>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={`${star} bintang`}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  style={styles.starTouch}
                >
                  <Star
                    size={32}
                    color={star <= rating ? colors.highlight : colors.outlineVariant}
                    fill={star <= rating ? colors.highlight : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Obstacle Input */}
          <AppText variant="labelMedium" style={styles.fieldLabel}>
            Hambatan atau distraksi? (Opsional)
          </AppText>
          <TextInput
            value={obstacle}
            onChangeText={setObstacle}
            placeholder="Cth: Notifikasi medsos, rasa ngantuk..."
            placeholderTextColor={colors.onSurfaceSubtle}
            style={styles.textInput}
          />

          {/* Next Action Input */}
          <AppText variant="labelMedium" style={styles.fieldLabel}>
            Langkah berikutnya setelah istirahat? (Opsional)
          </AppText>
          <TextInput
            value={nextAction}
            onChangeText={setNextAction}
            placeholder="Cth: Lanjut merapikan komponen modal..."
            placeholderTextColor={colors.onSurfaceSubtle}
            style={styles.textInput}
          />

          {/* CTA Button */}
          <Button
            title="Simpan Refleksi & Selesai"
            variant="filled"
            size="standard"
            leftIcon={<CheckCircle size={18} color={colors.onPrimary} />}
            onPress={handleSave}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[4],
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
  },
  dialogCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xxl,
    padding: space[5],
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...elevation.level3,
  },
  header: {
    alignItems: 'center',
    marginBottom: space[4],
  },
  awardCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[3],
  },
  subtitle: {
    marginTop: space[1],
  },
  ratingSection: {
    marginVertical: space[2],
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[2],
    marginBottom: space[3],
  },
  starTouch: {
    padding: 2,
  },
  fieldLabel: {
    marginTop: space[2],
    marginBottom: space[1],
    color: colors.onSurfaceVariant,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    color: colors.onSurface,
    paddingHorizontal: space[3],
    height: 48,
    fontSize: 13,
  },
  submitButton: {
    marginTop: space[5],
    width: '100%',
  },
});
