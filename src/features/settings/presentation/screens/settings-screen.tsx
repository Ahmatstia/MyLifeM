import React, { useState } from 'react';
import {
  View,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
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
  Check,
  Lock,
  Sparkles,
  RefreshCw,
  Heart,
  Star,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, fontFamily } from '@/theme/tokens';
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
    <Screen withBottomPadding={false} style={styles.screenRoot}>
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

        <View style={styles.headerAvatarMini}>
          <Sparkles size={16} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Profile Summary Card (Botanical Bento) */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlowPrimary} />
          <View style={styles.profileGlowSecondary} />

          <View style={styles.profileCardInner}>
            <View style={styles.avatarRingOuter}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
                  }}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.avatarBadge}>
                <Sparkles size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileMeta}>
              <View style={styles.profileNameRow}>
                <AppText variant="headlineSmall" style={styles.profileName}>
                  Alexandra Jacob
                </AppText>
                <Check size={16} color="#5052BA" />
              </View>
              <View style={styles.personalEditionPill}>
                <View style={styles.greenDot} />
                <AppText variant="labelSmall" style={styles.personalEditionText}>
                  Edisi Personal Offline
                </AppText>
              </View>
              <View style={styles.localSyncRow}>
                <Lock size={12} color="#8F4E00" />
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  Tersimpan Lokal di Perangkat
                </AppText>
              </View>
            </View>
          </View>
        </View>

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
              <Palette size={20} color="#3838A1" />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                Kategori target
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Kelola nama dan pengelompokan tujuanmu.
              </AppText>
              {/* Category Color Dots */}
              <View style={styles.categoryDotsRow}>
                <View style={[styles.categoryDot, { backgroundColor: '#8B8DF9' }]} />
                <View style={[styles.categoryDot, { backgroundColor: '#5052BA' }]} />
                <View style={[styles.categoryDot, { backgroundColor: '#8F4E00' }]} />
                <View style={[styles.categoryDot, { backgroundColor: '#FFA858' }]} />
                <AppText variant="labelSmall" style={styles.categoryCountLabel}>
                  4 Aktif
                </AppText>
              </View>
            </View>
            <ChevronRight size={18} color="#777684" />
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
          <Coffee size={15} color="#5052BA" />
        </View>

        <View style={styles.cardGroup}>
          {/* Toggle 1: Layar tetap terjaga */}
          <View style={styles.settingItemRow}>
            <View style={styles.iconWarmPeach}>
              <Sun size={20} color="#733E00" />
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
                false: '#EEEDF2',
                true: '#5052BA',
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Segmented Picker: Durasi Pomodoro */}
          <View style={styles.chipSettingBlock}>
            <View style={styles.chipSettingHeader}>
              <View style={styles.iconPeach}>
                <Coffee size={18} color="#6C3A00" />
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
                    {isSelected && <Star size={11} color="#FFFFFF" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Segmented Picker: Durasi Deep Flow */}
          <View style={styles.chipSettingBlock}>
            <View style={styles.chipSettingHeader}>
              <View style={styles.iconTertiary}>
                <Flame size={18} color="#8C1038" />
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
                    {isSelected && <Star size={11} color="#FFFFFF" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Toggle 2: Getaran haptik */}
          <View style={styles.settingItemRow}>
            <View style={styles.iconNeutral}>
              <Vibrate size={20} color="#1A1C1F" />
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
                false: '#EEEDF2',
                true: '#5052BA',
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
          <Lock size={15} color="#8F4E00" />
        </View>

        {/* 100% On-Device Banner */}
        <View style={styles.onDeviceBanner}>
          <ShieldCheck size={22} color="#5052BA" />
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
              <Download size={20} color="#3838A1" />
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
              <RefreshCw size={20} color="#6C3A00" />
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
                <Download size={20} color="#3838A1" />
              </View>
              <View style={styles.settingItemContent}>
                <AppText variant="titleSmall" style={styles.settingItemTitle}>
                  Cadangan sebelum pemulihan
                </AppText>
                <AppText variant="bodySmall" color="onSurfaceVariant">
                  Simpan salinan data sebelum pemulihan terakhir.
                </AppText>
              </View>
              <ChevronRight size={18} color="#777684" />
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
            <Heart size={20} color="#5052BA" />
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
  screenRoot: {
    backgroundColor: '#F9F9FD',
  },
  topBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    marginBottom: space[2],
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    flex: 1,
  },
  topBarTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: '#151718',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: '#EEEDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: '#5052BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingBottom: space[16],
  },
  profileCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: space[4],
    marginBottom: space[4],
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  profileGlowPrimary: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1DFFF',
    opacity: 0.5,
  },
  profileGlowSecondary: {
    position: 'absolute',
    left: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFDCC1',
    opacity: 0.5,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    zIndex: 1,
  },
  avatarRingOuter: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFA858',
    padding: 3,
  },
  avatarContainer: {
    flex: 1,
    borderRadius: 27,
    overflow: 'hidden',
    backgroundColor: '#E2E2E6',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5052BA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileMeta: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: '#151718',
  },
  personalEditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEEDF2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5052BA',
  },
  personalEditionText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#464552',
  },
  localSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[3],
    marginBottom: space[2],
    paddingHorizontal: 4,
  },
  sectionHeaderTag: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#777684',
  },
  sectionHeaderSub: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#5052BA',
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: space[2],
    marginBottom: space[3],
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.lg,
  },
  pressedRow: {
    backgroundColor: '#F3F3F7',
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#151718',
    marginBottom: 2,
  },
  categoryDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryCountLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#777684',
    marginLeft: 4,
  },
  iconLavender: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#E1DFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPeach: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#FFDCC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWarmPeach: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#FFA858',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTertiary: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#FFD9DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconNeutral: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#E8E8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSettingBlock: {
    padding: space[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F3F7',
  },
  chipSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginBottom: space[2],
  },
  chipSettingText: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[1],
  },
  durationChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#EEEDF2',
  },
  durationChipActivePrimary: {
    backgroundColor: '#5052BA',
    shadowColor: '#5052BA',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  durationChipActiveSecondary: {
    backgroundColor: '#8F4E00',
    shadowColor: '#8F4E00',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  durationChipText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#464552',
  },
  durationChipTextActive: {
    color: '#FFFFFF',
  },
  onDeviceBanner: {
    flexDirection: 'row',
    gap: space[3],
    backgroundColor: '#E1DFFF',
    borderRadius: radius.xl,
    padding: space[4],
    marginBottom: space[3],
    alignItems: 'flex-start',
  },
  onDeviceBannerContent: {
    flex: 1,
  },
  onDeviceBannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#1F1D8A',
    marginBottom: 2,
  },
  onDeviceBannerDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#3838A1',
  },
  statsCard: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  statsCardTitle: {
    fontFamily: fontFamily.bold,
    letterSpacing: 0.6,
    marginBottom: space[2],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3],
  },
  statBox: {
    minWidth: 64,
    flexGrow: 1,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 26,
  },
  actionPillPrimary: {
    backgroundColor: '#8B8DF9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  actionPillPrimaryText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#1F1D8A',
  },
  actionPillNeutral: {
    backgroundColor: '#E8E8EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  actionPillNeutralText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#1A1C1F',
  },
  footerPhilosophyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: space[4],
    alignItems: 'center',
    marginTop: space[3],
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  footerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: '#E1DFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  footerBadge: {
    backgroundColor: '#EEEDF2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: space[3],
  },
  footerBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: '#464552',
  },
  quoteBox: {
    backgroundColor: '#F3F3F7',
    padding: space[3],
    borderRadius: radius.lg,
    width: '100%',
  },
  quoteText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#1A1C1F',
  },
  durationOptions: {
    gap: space[3],
  },
  durationSheetRow: {
    minHeight: 52,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: '#F3F3F7',
    justifyContent: 'center',
  },
  selectedDurationSheetRow: {
    backgroundColor: '#5052BA',
  },
  confirmationInput: {
    minHeight: 54,
    color: '#1A1C1F',
    backgroundColor: '#F3F3F7',
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
});
