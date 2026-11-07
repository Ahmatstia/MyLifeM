import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Button, FormScreenHeader } from '@/shared/ui';
import { useTodayFocus } from '../hooks/use-today-focus';

export const CreatePriorityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { focusItems = [], availableTasks = [], addQuickTask, addTaskToToday } = useTodayFocus();

  const [quickTitle, setQuickTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentCount = focusItems.length;
  const isFull = currentCount >= 5;

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) {
      setErrorMessage('Judul tugas tidak boleh kosong.');
      return;
    }

    if (isFull) {
      setErrorMessage('Maksimal 5 tugas prioritas per hari.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const success = await addQuickTask(quickTitle.trim());
    setIsSubmitting(false);

    if (success) {
      router.back();
    } else {
      setErrorMessage('Gagal menambahkan tugas prioritas.');
    }
  };

  const handleSelectTask = async (taskId: string) => {
    if (isFull) {
      setErrorMessage('Maksimal 5 tugas prioritas per hari.');
      return;
    }

    setErrorMessage(null);
    const success = await addTaskToToday(taskId);
    if (success) {
      router.back();
    } else {
      setErrorMessage('Gagal menambahkan tugas ke hari ini.');
    }
  };

  return (
    <Screen scrollable={false} withBottomPadding={false} withHorizontalPadding={false} style={styles.screenBg}>
      <FormScreenHeader title="Tambah Prioritas" onBack={() => router.back()} />

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

          {/* Quota Counter Pod */}
          <View style={styles.quotaPod}>
            <View style={{ flex: 1 }}>
              <AppText variant="titleSmall" style={styles.quotaTitle}>
                Prioritas Harian
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Fokuskan energimu pada maksimal 5 tugas terpenting hari ini
              </AppText>
            </View>
            <View style={styles.quotaPill}>
              <AppText variant="labelLarge" style={styles.quotaNumber}>
                {currentCount}/5
              </AppText>
            </View>
          </View>

          {/* Section 1: Buat Tugas Kilat */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              BUAT TUGAS KILAT BARU
            </AppText>
            <TextInput
              value={quickTitle}
              onChangeText={(text) => {
                setQuickTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Misal: Tinjau draft proposal klien"
              placeholderTextColor="#8F9298"
              style={styles.textInput}
              autoFocus
              editable={!isFull}
            />
          </View>

          {/* Section 2: Pilih dari Rencana / Tugas Tersedia */}
          {availableTasks.length > 0 && (
            <View style={styles.pod}>
              <AppText variant="labelSmall" style={styles.fieldLabel}>
                ATAU PILIH DARI RENCANA TERSIMPAN ({availableTasks.length})
              </AppText>

              <View style={styles.tasksList}>
                {availableTasks.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => handleSelectTask(t.id)}
                    accessibilityRole="button"
                    disabled={isFull}
                    style={({ pressed }) => [
                      styles.taskOptionItem,
                      pressed && styles.taskOptionItemPressed,
                      isFull && styles.taskOptionItemDisabled,
                    ]}
                  >
                    <View style={styles.taskOptionTextCol}>
                      <AppText variant="bodyMedium" style={styles.taskOptionTitle} numberOfLines={1}>
                        {t.title}
                      </AppText>
                      <AppText variant="labelSmall" color="onSurfaceVariant">
                        Estimasi {t.estimatedMinutes} menit
                      </AppText>
                    </View>

                    <View style={styles.selectCircle}>
                      <Plus size={16} color="#121316" strokeWidth={2.4} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
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
            title="Tambah Prioritas"
            variant="filled"
            onPress={handleQuickAdd}
            loading={isSubmitting}
            disabled={isFull || !quickTitle.trim()}
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
  quotaPod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: space[3],
  },
  quotaTitle: {
    fontFamily: fontFamily.bold,
    color: '#121316',
  },
  quotaPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  quotaNumber: {
    fontFamily: fontFamily.bold,
    color: '#121316',
  },
  pod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: space[2],
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
  tasksList: {
    gap: 8,
    marginTop: space[1],
  },
  taskOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space[3],
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: space[2],
  },
  taskOptionItemPressed: {
    backgroundColor: '#F0F1F5',
  },
  taskOptionItemDisabled: {
    opacity: 0.5,
  },
  taskOptionTextCol: {
    flex: 1,
    gap: 2,
  },
  taskOptionTitle: {
    fontFamily: fontFamily.semibold,
    color: '#121316',
  },
  selectCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E4E9',
    alignItems: 'center',
    justifyContent: 'center',
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
