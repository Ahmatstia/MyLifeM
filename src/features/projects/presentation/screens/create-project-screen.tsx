import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  FolderKanban,
  Target,
  Flag,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  WaveBackdrop,
  ChoiceTile,
  SunButton,
  FieldLabel,
  MascotHead,
  sproutShadow,
} from '@/shared/ui';
import { targetRepository } from '@/features/targets/data/repositories/target.repository.impl';
import { projectRepository } from '../../data/repositories/project.repository.impl';
import type { TargetEntity } from '@/features/targets/domain/entities/target.entity';
import type { ProjectPriority } from '../../domain/entities/project.entity';

const s = colors.sprout;

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

  const priorityOptions: { value: ProjectPriority; label: string }[] = [
    { value: 'LOW', label: 'Santai' },
    { value: 'MEDIUM', label: 'Utama' },
    { value: 'HIGH', label: 'Mendesak' },
  ];

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={{ ...styles.scrollContent, paddingBottom: 120 + insets.bottom }}
    >
      <WaveBackdrop variant="form" withBottomHills />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={{ marginHorizontal: -space[4] }}>
          <FormScreenHeader title="Proyek Baru" onBack={() => router.back()} />
        </View>

        {errorMessage && (
            <View style={styles.errorBox}>
              <AppText variant="bodySmall" color="onErrorContainer">
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Mascot + Cloud Input */}
          <View style={styles.cloudHeroWrap}>
            <View style={styles.mascotHeadWrap} pointerEvents="none">
              <MascotHead width={144} height={92} />
            </View>

            <View style={styles.cloudOuterCard}>
              <View style={styles.cloudInnerPill}>
                <TextInput
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Proyek apa yang ingin dikerjakan?"
                  placeholderTextColor={s.inkSubtle}
                  style={styles.cloudInput}
                  autoFocus
                />
                <Sparkles size={20} color={s.sun} fill={s.sun} />
              </View>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Catatan hasil akhir proyek ini (opsional)…"
                placeholderTextColor={s.inkSubtle}
                multiline
                style={styles.cloudDescInput}
              />
            </View>
          </View>

          {/* Hubungkan ke Target Hidup */}
          <FieldLabel>Hubungkan ke Target</FieldLabel>
          {isLoadingTargets ? (
            <ActivityIndicator size="small" color={s.forest} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <View style={styles.tilesRow}>
              <ChoiceTile
                label="Mandiri"
                icon={FolderKanban}
                tone="leaf"
                selected={targetId === null}
                onPress={() => setTargetId(null)}
              />
              {availableTargets.slice(0, 3).map((t) => (
                <ChoiceTile
                  key={t.id}
                  label={t.title}
                  icon={Target}
                  tone="teal"
                  selected={targetId === t.id}
                  onPress={() => setTargetId(t.id)}
                />
              ))}
            </View>
          )}

          {/* Prioritas */}
          <FieldLabel>Prioritas</FieldLabel>
          <View style={styles.priorityRow}>
            {priorityOptions.map((opt) => {
              const selected = priority === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPriority(opt.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.priorityPill, selected && styles.priorityPillSelected]}
                >
                  <Flag size={14} color={selected ? '#FFFFFF' : s.inkMuted} strokeWidth={2.3} />
                  <AppText
                    style={[styles.priorityPillText, selected && styles.priorityPillTextSelected]}
                  >
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.ctaWrap}>
            <SunButton title="Simpan" onPress={handleSubmit} loading={isSubmitting} />
          </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: s.cream,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[5],
    paddingTop: space[2],
    gap: space[3],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: space[3],
  },
  cloudHeroWrap: {
    marginTop: 58,
    marginBottom: space[1],
    position: 'relative',
  },
  mascotHeadWrap: {
    position: 'absolute',
    top: -68,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  cloudOuterCard: {
    backgroundColor: s.card,
    borderRadius: 32,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#F1EADA',
    gap: space[2],
    ...sproutShadow,
  },
  cloudInnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EFE3',
    borderRadius: 22,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    gap: space[2],
  },
  cloudInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: s.ink,
    paddingVertical: 4,
  },
  cloudDescInput: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: s.inkMuted,
    paddingHorizontal: space[2],
    paddingTop: space[1],
    minHeight: 44,
  },
  tilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  priorityRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  priorityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1EBDC',
    borderRadius: 20,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  priorityPillSelected: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  priorityPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: s.inkMuted,
  },
  priorityPillTextSelected: {
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  ctaWrap: {
    marginTop: space[4],
  },
});
