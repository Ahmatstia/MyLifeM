import React, { useState } from 'react';
import {
  View,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Palette,
  Vibrate,
  Sun,
  Coffee,
  Flame,
  Download,
  ShieldCheck,
  Lock,
  RefreshCw,
  Heart,
  Star,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Card,
  Button,
  AppBottomSheet,
  Banner,
} from '@/shared/ui';
import { CategoryManagerModal } from '@/features/categories/presentation/components/category-manager-modal';
import { useSettings } from '../hooks/use-settings';

const POMODORO_OPTIONS = [15, 25, 45, 60];
const DEEP_FLOW_OPTIONS = [45, 50, 60, 90];

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    stats,
    isLoading,
    backupBusy,
    backupError,
    backupNotice,
    pendingBackup,
    recoveryAvailable,
    closeBackup,
    updateSetting,
    exportBackup,
    inspectBackup,
    restoreBackup,
    exportRecovery,
  } = useSettings();

  const [confirmation, setConfirmation] = useState('');
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(false);
  const [durationPicker, setDurationPicker] = useState<
    'POMODORO' | 'DEEP_FLOW' | null
  >(null);
  const durationOptions =
    durationPicker === 'POMODORO' ? POMODORO_OPTIONS : DEEP_FLOW_OPTIONS;

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenRoot}>
      {/* 1. Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.circleButton}
          >
            <ArrowLeft size={20} color={colors.onSurface} />
          </Pressable>
          <AppText variant="titleMedium" style={styles.topBarTitle}>
            Pengaturan
          </AppText>
        </View>

      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Section: Organisasi */}
        <View style={styles.sectionHeaderRow}>
          <AppText
            variant="labelSmall"
            accessibilityRole="header"
            style={styles.sectionHeaderTag}
          >
            ORGANISASI
          </AppText>
          <AppText variant="labelSmall" style={styles.sectionHeaderSub}>
            Kustomisasi
          </AppText>
        </View>

        <View style={styles.cardGroup}>
          {/* Row 1: Kategori Target & Proyek */}
          <Pressable
            onPress={() => setIsCategoryManagerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Kategori target"
            style={({ pressed }) => [
              styles.settingItemRow,
              pressed && styles.pressedRow,
            ]}
          >
            <View style={styles.iconLavender}>
              <Palette size={20} color={colors.primary} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                Kategori target
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Kelola nama dan pengelompokan tujuanmu.
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* 4. Section: Fokus & Kenyamanan */}
        <View style={styles.sectionHeaderRow}>
          <AppText
            variant="labelSmall"
            accessibilityRole="header"
            style={styles.sectionHeaderTag}
          >
            FOKUS & KENYAMANAN
          </AppText>
          <Coffee size={15} color={colors.primary} />
        </View>

        <View style={styles.cardGroup}>
          {/* Toggle 1: Layar tetap terjaga */}
          <View style={styles.settingItemRow}>
            <View style={styles.iconWarmPeach}>
              <Sun size={20} color={colors.warning} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                Layar tetap terjaga
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Preferensi layar selama sesi fokus.
              </AppText>
            </View>
            <Switch
              accessibilityLabel="Layar tetap terjaga"
              value={settings.keepAwakeEnabled}
              onValueChange={(value) =>
                updateSetting({ keepAwakeEnabled: value })
              }
              trackColor={{
                false: colors.surfaceContainerHigh,
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Segmented Picker: Durasi Pomodoro */}
          <View style={styles.chipSettingBlock}>
            <View style={styles.chipSettingHeader}>
              <View style={styles.iconPeach}>
                <Coffee size={18} color={colors.primary} />
              </View>
              <View style={styles.chipSettingText}>
                <AppText variant="titleSmall" style={styles.settingItemTitle}>
                  Durasi Pomodoro
                </AppText>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  {settings.pomodoroMinutes} menit per sesi
                </AppText>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {POMODORO_OPTIONS.map((mins) => {
                const isSelected = settings.pomodoroMinutes === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => updateSetting({ pomodoroMinutes: mins })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.durationChip,
                      isSelected && styles.durationChipActivePrimary,
                    ]}
                  >
                    <AppText
                      variant="labelMedium"
                      style={[
                        styles.durationChipText,
                        isSelected && styles.durationChipTextActive,
                      ]}
                    >
                      {mins}m
                    </AppText>
                    {isSelected && <Star size={11} color={colors.onPrimary} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Segmented Picker: Durasi Deep Flow */}
          <View style={styles.chipSettingBlock}>
            <View style={styles.chipSettingHeader}>
              <View style={styles.iconTertiary}>
                <Flame size={18} color={colors.primary} />
              </View>
              <View style={styles.chipSettingText}>
                <AppText variant="titleSmall" style={styles.settingItemTitle}>
                  Durasi Deep Flow
                </AppText>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  {settings.deepFlowMinutes} menit per sesi
                </AppText>
              </View>
            </View>
            <View style={styles.chipsRow}>
              {DEEP_FLOW_OPTIONS.map((mins) => {
                const isSelected = settings.deepFlowMinutes === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => updateSetting({ deepFlowMinutes: mins })}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.durationChip,
                      isSelected && styles.durationChipActiveSecondary,
                    ]}
                  >
                    <AppText
                      variant="labelMedium"
                      style={[
                        styles.durationChipText,
                        isSelected && styles.durationChipTextActive,
                      ]}
                    >
                      {mins}m
                    </AppText>
                    {isSelected && <Star size={11} color={colors.onPrimary} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Toggle 2: Getaran haptik */}
          <View style={styles.settingItemRow}>
            <View style={styles.iconNeutral}>
              <Vibrate size={20} color={colors.onSurface} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                Getaran haptik
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Preferensi umpan balik sentuh.
              </AppText>
            </View>
            <Switch
              accessibilityLabel="Getaran haptik"
              value={settings.hapticsEnabled}
              onValueChange={(value) => updateSetting({ hapticsEnabled: value })}
              trackColor={{
                false: colors.surfaceContainerHigh,
                true: colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 5. Section: Data & Privasi */}
        <View style={styles.sectionHeaderRow}>
          <AppText
            variant="labelSmall"
            accessibilityRole="header"
            style={styles.sectionHeaderTag}
          >
            DATA & PRIVASI
          </AppText>
          <Lock size={15} color={colors.warning} />
        </View>

        {/* 100% On-Device Banner */}
        <View style={styles.onDeviceBanner}>
          <ShieldCheck size={22} color={colors.primary} />
          <View style={styles.onDeviceBannerContent}>
            <AppText variant="labelMedium" style={styles.onDeviceBannerTitle}>
              100% On-Device Storage
            </AppText>
            <AppText
              variant="bodySmall"
              color="onSurfaceVariant"
              style={styles.onDeviceBannerDesc}
            >
              Seluruh catatan, target, dan jadwal tersimpan aman di memori lokal ponselmu tanpa server pihak ketiga atau analitik pelacak.
            </AppText>
          </View>
        </View>

        {/* Data Stats Card */}
        {!isLoading && (
          <Card variant="highlight" padding={space[4]} style={styles.statsCard}>
            <AppText variant="labelSmall" style={styles.statsCardTitle}>
              TERSIMPAN DI PERANGKAT INI
            </AppText>
            <View style={styles.statsGrid}>
              {[
                ['Target', stats.targetsCount],
                ['Proyek', stats.projectsCount],
                ['Tugas', stats.tasksCount],
                ['Sesi fokus', stats.focusSessionsCount],
                ['Agenda', stats.agendaEventsCount],
              ].map(([label, value]) => (
                <View key={label} style={styles.statBox}>
                  <AppText
                    variant="headlineSmall"
                    color="onPrimaryContainer"
                    tabularNums
                    style={styles.statValue}
                  >
                    {value}
                  </AppText>
                  <AppText variant="labelSmall" color="onPrimaryContainer">
                    {label}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Backup Actions */}
        <View style={styles.cardGroup}>
          <Pressable
            onPress={backupBusy ? undefined : exportBackup}
            accessibilityRole="button"
            accessibilityLabel="Buat cadangan"
            style={({ pressed }) => [
              styles.settingItemRow,
              pressed && styles.pressedRow,
            ]}
          >
            <View style={styles.iconLavender}>
              <Download size={20} color={colors.primary} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                {backupBusy === 'export'
                  ? 'Menyiapkan cadangan…'
                  : 'Buat cadangan'}
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Simpan seluruh catatan, kategori, tahapan, dan preferensi sebagai berkas JSON.
              </AppText>
            </View>
            <View style={styles.actionPillPrimary}>
              <AppText variant="labelSmall" style={styles.actionPillPrimaryText}>
                Ekspor
              </AppText>
            </View>
          </Pressable>

          <Pressable
            onPress={
              backupBusy
                ? undefined
                : async () => {
                    setConfirmation('');
                    await inspectBackup();
                  }
            }
            accessibilityRole="button"
            accessibilityLabel="Pulihkan dari berkas"
            style={({ pressed }) => [
              styles.settingItemRow,
              pressed && styles.pressedRow,
            ]}
          >
            <View style={styles.iconPeach}>
              <RefreshCw size={20} color={colors.warning} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                {backupBusy === 'pick'
                  ? 'Memeriksa berkas…'
                  : 'Pulihkan dari berkas'}
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Tinjau isi cadangan sebelum mengganti data di perangkat ini.
              </AppText>
            </View>
            <View style={styles.actionPillNeutral}>
              <AppText variant="labelSmall" style={styles.actionPillNeutralText}>
                Pilih File
              </AppText>
            </View>
          </Pressable>

          {recoveryAvailable && (
            <Pressable
              onPress={backupBusy ? undefined : exportRecovery}
              accessibilityRole="button"
              accessibilityLabel="Cadangan sebelum pemulihan"
              style={({ pressed }) => [
                styles.settingItemRow,
                pressed && styles.pressedRow,
              ]}
            >
              <View style={styles.iconLavender}>
                <Download size={20} color={colors.primary} />
              </View>
              <View style={styles.settingItemContent}>
                <AppText variant="titleSmall" style={styles.settingItemTitle}>
                  Cadangan sebelum pemulihan
                </AppText>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  Simpan salinan data sebelum pemulihan terakhir.
                </AppText>
              </View>
              <ChevronRight size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          )}

          {backupError && !pendingBackup && (
            <Banner variant="error" message={backupError} />
          )}
          {backupNotice && <Banner variant="info" message={backupNotice} />}
        </View>

        {/* 6. Footer Philosophy Card */}
        <View style={styles.footerPhilosophyCard}>
          <View style={styles.footerIconCircle}>
            <Heart size={20} color={colors.primary} />
          </View>
          <View style={styles.footerBadge}>
            <AppText variant="labelSmall" style={styles.footerBadgeText}>
              MyLife App v1.0.0 • Neo-Playful Edition
            </AppText>
          </View>
          <View style={styles.quoteBox}>
            <AppText variant="bodyMedium" style={styles.quoteText}>
              “Ruang pribadi untuk merawat hidup yang kamu pilih — tanpa kebisingan notifikasi, tanpa algoritma manipulatif.”
            </AppText>
          </View>
        </View>

        <View style={{ height: space[10] }} />
      </ScrollView>

      {/* Category Manager Modal */}
      {isCategoryManagerVisible && (
        <CategoryManagerModal
          visible
          onClose={() => setIsCategoryManagerVisible(false)}
        />
      )}

      {/* Duration Picker Bottom Sheet (if invoked) */}
      <AppBottomSheet
        visible={durationPicker !== null}
        onClose={() => setDurationPicker(null)}
        title={
          durationPicker === 'POMODORO'
            ? 'Durasi Pomodoro'
            : 'Durasi Deep Flow'
        }
        subtitle="Pilih durasi yang sesuai dengan ritmemu."
      >
        <View style={styles.durationOptions}>
          {durationOptions.map((minutes) => {
            const selected =
              minutes ===
              (durationPicker === 'POMODORO'
                ? settings.pomodoroMinutes
                : settings.deepFlowMinutes);
            return (
              <Pressable
                key={minutes}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  updateSetting(
                    durationPicker === 'POMODORO'
                      ? { pomodoroMinutes: minutes }
                      : { deepFlowMinutes: minutes }
                  );
                  setDurationPicker(null);
                }}
                style={[
                  styles.durationSheetRow,
                  selected && styles.selectedDurationSheetRow,
                ]}
              >
                <AppText
                  variant="titleMedium"
                  color={selected ? 'onPrimary' : 'onSurface'}
                >
                  {minutes} menit
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </AppBottomSheet>

      {/* Restore Confirmation Sheet */}
      <AppBottomSheet
        visible={!!pendingBackup}
        onClose={closeBackup}
        title="Pulihkan cadangan?"
        subtitle="Seluruh data saat ini akan diganti, bukan digabung."
        footer={
          <Button
            title="Ganti data & pulihkan"
            variant="danger"
            loading={backupBusy === 'restore'}
            disabled={confirmation !== 'PULIHKAN' || !!backupBusy}
            onPress={restoreBackup}
          />
        }
      >
        {pendingBackup && (
          <View style={styles.durationOptions}>
            <AppText variant="bodyMedium">
              Cadangan dibuat{' '}
              {new Date(pendingBackup.summary.exportedAt).toLocaleString(
                'id-ID'
              )}
              .
            </AppText>
            <AppText variant="bodyMedium">
              {pendingBackup.summary.total} catatan: {pendingBackup.summary.targets}{' '}
              target, {pendingBackup.summary.projects} proyek,{' '}
              {pendingBackup.summary.tasks} tugas,{' '}
              {pendingBackup.summary.categories} kategori,{' '}
              {pendingBackup.summary.stages} tahapan,{' '}
              {pendingBackup.summary.sessions} sesi fokus, dan{' '}
              {pendingBackup.summary.agenda} agenda. Pilar, prioritas harian, dan
              preferensi ikut dipulihkan.
            </AppText>
            <Banner
              variant="warning"
              message="Sesi fokus yang sedang berjalan akan dihentikan. Salinan data saat ini disimpan sebelum penggantian. Jangan tutup aplikasi selama proses berlangsung."
            />
            <AppText variant="labelLarge">
              Ketik PULIHKAN untuk melanjutkan
            </AppText>
            <TextInput
              accessibilityLabel="Ketik PULIHKAN untuk mengonfirmasi penggantian data"
              value={confirmation}
              onChangeText={setConfirmation}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!backupBusy}
              style={styles.confirmationInput}
            />
            {backupError && <Banner variant="error" message={backupError} />}
          </View>
        )}
      </AppBottomSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenRoot: { backgroundColor: colors.background },
  topBar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[2] },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  topBarTitle: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.onSurface },
  circleButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: space[4], gap: space[2] },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3], backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 14 },
  introIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, gap: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[3], marginBottom: space[1] },
  sectionHeaderTag: { fontFamily: fontFamily.bold, fontSize: 11, letterSpacing: 0.5, color: colors.onSurfaceVariant },
  sectionHeaderSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.primary },
  cardGroup: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.outlineVariant },
  settingItemRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[2], borderRadius: 11 },
  pressedRow: { backgroundColor: colors.surfaceContainerLow },
  settingItemContent: { flex: 1 },
  settingItemTitle: { fontFamily: fontFamily.semibold, fontSize: 13, color: colors.onSurface, marginBottom: 2 },
  categoryDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  categoryCountLabel: { fontFamily: fontFamily.semibold, fontSize: 10, color: colors.onSurfaceVariant, marginLeft: 4 },
  iconLavender: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  iconPeach: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  iconWarmPeach: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  iconTertiary: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.tertiaryContainer, alignItems: 'center', justifyContent: 'center' },
  iconNeutral: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  chipSettingBlock: { padding: space[2], borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.outlineVariant },
  chipSettingHeader: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[2] },
  chipSettingText: { flex: 1 },
  chipsRow: { flexDirection: 'row', gap: space[2], marginTop: space[1] },
  durationChip: { minHeight: 40, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.surfaceContainerLow },
  durationChipActivePrimary: { backgroundColor: colors.primary },
  durationChipActiveSecondary: { backgroundColor: colors.primary },
  durationChipText: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.onSurfaceVariant },
  durationChipTextActive: { color: colors.onPrimary },
  onDeviceBanner: { flexDirection: 'row', gap: space[3], backgroundColor: colors.primaryContainer, borderRadius: 14, padding: space[3], marginBottom: space[2], alignItems: 'flex-start' },
  onDeviceBannerContent: { flex: 1 },
  onDeviceBannerTitle: { fontFamily: fontFamily.semibold, fontSize: 13, color: colors.onPrimaryContainer, marginBottom: 2 },
  onDeviceBannerDesc: { fontSize: 12, lineHeight: 17, color: colors.onPrimaryContainer },
  statsCard: { marginBottom: space[2], borderRadius: 14 },
  statsCardTitle: { fontFamily: fontFamily.semibold, marginBottom: space[2] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  statBox: { minWidth: 64, flexGrow: 1 },
  statValue: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 24 },
  actionPillPrimary: { backgroundColor: colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  actionPillPrimaryText: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.onPrimaryContainer },
  actionPillNeutral: { backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  actionPillNeutralText: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.onSurface },
  footerPhilosophyCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, padding: space[3], alignItems: 'center', marginTop: space[2], borderWidth: 1, borderColor: colors.outlineVariant },
  footerIconCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: space[2] },
  footerBadge: { backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: space[2] },
  footerBadgeText: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.onSurfaceVariant },
  quoteBox: { backgroundColor: colors.surfaceContainerLow, padding: space[3], borderRadius: 11, width: '100%' },
  quoteText: { fontSize: 12, lineHeight: 18, fontStyle: 'italic', textAlign: 'center', color: colors.onSurfaceVariant },
  durationOptions: { gap: space[2] },
  durationSheetRow: { minHeight: 48, padding: space[3], borderRadius: 10, backgroundColor: colors.surfaceContainerLow, justifyContent: 'center' },
  selectedDurationSheetRow: { backgroundColor: colors.primary },
  confirmationInput: { minHeight: 52, color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, paddingHorizontal: space[3], borderRadius: 10, fontSize: 16, fontFamily: fontFamily.semibold },
});
