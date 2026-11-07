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
import { targetRepository } from '@/features/targets/data/repositories/target.repository.impl';
import { projectRepository } from '../../data/repositories/project.repository.impl';
import type { TargetEntity } from '@/features/targets/domain/entities/target.entity';
import type { ProjectPriority } from '../../domain/entities/project.entity';

export const CreateProjectScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [availableTargets, setAvailableTargets] = useState<TargetEntity[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    targetRepository
      .getTargets({ status: 'ACTIVE' })
      .then((targets) => {
        if (!active) return;
        setAvailableTargets(targets);
        setIsLoadingTargets(false);
      })
      .catch(() => {
        if (active) setIsLoadingTargets(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Nama proyek tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await projectRepository.createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        targetId,
        priority,
      });
      setIsSubmitting(false);
      router.back();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal menyimpan proyek. Silakan coba lagi.');
    }
  };

  const priorityOptions: { value: ProjectPriority; label: string; activeColor: string }[] = [
    { value: 'LOW', label: 'Rendah', activeColor: '#5A5D65' },
    { value: 'MEDIUM', label: 'Sedang', activeColor: '#0E6852' },
    { value: 'HIGH', label: 'Tinggi', activeColor: '#DC2626' },
  ];

  return (
    <Screen scrollable={false} withBottomPadding={false} withHorizontalPadding={false} style={styles.screenBg}>
      <FormScreenHeader title="Proyek Baru" onBack={() => router.back()} />

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
              NAMA PROYEK *
            </AppText>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Misal: Redesain Aplikasi Mobile"
              placeholderTextColor="#8F9298"
              style={styles.textInput}
              autoFocus
            />

            <View style={styles.podDivider} />

            <AppText variant="labelSmall" style={styles.fieldLabel}>
              DESKRIPSI / TARGET HASIL
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Jelaskan ruang lingkup kerja atau hasil akhir proyek ini..."
              placeholderTextColor="#8F9298"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>

          {/* Section 2: Hubungkan ke Target Hidup (Optional) */}
          <View style={styles.pod}>
            <AppText variant="labelSmall" style={styles.fieldLabel}>
              HUBUNGKAN KE TARGET HIDUP
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Pilih target strategis yang didukung oleh proyek ini (opsional)
            </AppText>

            {isLoadingTargets ? (
              <ActivityIndicator size="small" color="#0E6852" style={{ alignSelf: 'flex-start', marginVertical: space[2] }} />
            ) : availableTargets.length === 0 ? (
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Belum ada target hidup aktif. Proyek tetap dapat dibuat mandiri.
              </AppText>
            ) : (
              <View style={styles.chipGrid}>
                <Pressable
                  onPress={() => setTargetId(null)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: targetId === null }}
                  style={[
                    styles.targetChip,
                    targetId === null && styles.targetChipSelected,
                  ]}
                >
                  <AppText
                    variant="labelMedium"
                    style={[
                      styles.targetChipText,
                      targetId === null && styles.targetChipTextSelected,
                    ]}
                  >
                    Mandiri (Tanpa Target)
                  </AppText>
                </Pressable>

                {availableTargets.map((t) => {
                  const isSelected = targetId === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setTargetId(t.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.targetChip,
                        isSelected && styles.targetChipSelected,
                      ]}
                    >
                      <AppText
                        variant="labelMedium"
                        style={[
                          styles.targetChipText,
                          isSelected && styles.targetChipTextSelected,
                        ]}
                      >
                        {t.title}
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
            title="Simpan Proyek"
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
  targetChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  targetChipSelected: {
    backgroundColor: '#121316',
    borderColor: '#121316',
  },
  targetChipText: {
    fontFamily: fontFamily.medium,
    color: '#44474E',
    fontSize: 13,
  },
  targetChipTextSelected: {
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

