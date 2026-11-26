import { AppSwitch as Switch } from '@/shared/ui/app-switch';
import { backOrHome } from '@/shared/utils/back-or-home';
import React, { useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
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
  MapPin,
  Moon,
  Check,
  Compass,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { formInputBase } from '@/shared/ui/form-control-styles';
import { space, fontFamily, radius, stroke, typography, touchTarget } from '@/theme/tokens';
import {
  Screen,
  AppText,
  FormScreenHeader,
  Card,
  Button,
  AppBottomSheet,
  Banner,
  sproutShadow,
} from '@/shared/ui';
import { CategoryManagerModal } from '@/features/categories/presentation/components/category-manager-modal';
import {
  INDONESIA_PRAYER_CITIES,
  type PrayerLocationPreset,
} from '@/features/prayer-times/domain/entities/prayer-times.entity';
import { useSettings } from '../hooks/use-settings';

const s = colors.sprout;

const POMODORO_OPTIONS = [15, 25, 45, 60];
const DEEP_FLOW_OPTIONS = [45, 50, 60, 90];

export const SettingsScreen: React.FC = () => {
  const params = useLocalSearchParams<{ section?: string }>();
  const {
    settings,
    stats,
    isLoading,
    settingsError,
    isSavingSettings,
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
    refresh,
  } = useSettings();

  const [confirmation, setConfirmation] = useState('');
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(
    params?.section === 'categories'
  );
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(
    params?.section === 'prayer'
  );
  const [citySearch, setCitySearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'WIB' | 'WITA' | 'WIT'>('ALL');
  const [customCityName, setCustomCityName] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customLocError, setCustomLocError] = useState<string | null>(null);

  const [durationPicker, setDurationPicker] = useState<
    'POMODORO' | 'DEEP_FLOW' | null
  >(null);
  const durationOptions =
    durationPicker === 'POMODORO' ? POMODORO_OPTIONS : DEEP_FLOW_OPTIONS;

  const activePrayerCity = settings.prayerCity || 'Jakarta (WIB)';
  const activePrayerLat = settings.prayerLatitude ?? -6.2088;
  const activePrayerLng = settings.prayerLongitude ?? 106.8456;

  const filteredCities = INDONESIA_PRAYER_CITIES.filter((c) => {
    const matchesRegion = regionFilter === 'ALL' || c.region === regionFilter;
    const matchesQuery =
      !citySearch.trim() ||
      c.cityName.toLowerCase().includes(citySearch.trim().toLowerCase());
    return matchesRegion && matchesQuery;
  });

  const handleSelectCityPreset = async (preset: PrayerLocationPreset) => {
    const saved = await updateSetting({
      prayerCity: preset.cityName,
      prayerLatitude: preset.latitude,
      prayerLongitude: preset.longitude,
    });
    if (saved) setIsLocationPickerVisible(false);
  };

  const handleSaveCustomLocation = async () => {
    const nameTrim = customCityName.trim();
    const latNum = parseFloat(customLat.replace(',', '.'));
    const lngNum = parseFloat(customLng.replace(',', '.'));

    if (!nameTrim) {
      setCustomLocError('Nama kota/daerah wajib diisi.');
      return;
    }
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      setCustomLocError('Latitude harus berupa angka valid antara -90 dan 90.');
      return;
    }
    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      setCustomLocError('Longitude harus berupa angka valid antara -180 dan 180.');
      return;
    }

    setCustomLocError(null);
    const saved = await updateSetting({
      prayerCity: nameTrim,
      prayerLatitude: latNum,
      prayerLongitude: lngNum,
    });
    if (saved) setIsLocationPickerVisible(false);
  };

  return (
    <Screen
      scrollable
      style={styles.screenRoot}
    >


      <FormScreenHeader title="Pengaturan" onBack={backOrHome} />

      {settingsError && (
        <View style={styles.cardGroup}>
          <Banner variant="error" message={settingsError} />
          <Button title="Muat Ulang Pengaturan" variant="outlined" onPress={refresh} disabled={isLoading || isSavingSettings} />
        </View>
      )}

      {/* 2. Section: Lokasi & Jadwal Azan */}
      <View style={styles.sectionHeaderRow}>
        <AppText
          variant="labelSmall"
          accessibilityRole="header"
          style={styles.sectionHeaderTag}
        >
          Lokasi dan jadwal azan
        </AppText>
        <Moon size={15} color={s.forest} strokeWidth={2.3} />
      </View>

      <View style={styles.cardGroup}>
        <Pressable
          onPress={() => setIsLocationPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Lokasi jadwal azan"
          style={({ pressed }) => [
            styles.settingItemRow,
            pressed && styles.pressedRow,
          ]}
        >
          <View style={styles.iconLeaf}>
            <MapPin size={20} color={s.forest} strokeWidth={2.3} />
          </View>
          <View style={styles.settingItemContent}>
            <AppText variant="titleSmall" style={styles.settingItemTitle}>
              Lokasi jadwal azan
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {activePrayerCity} ({activePrayerLat.toFixed(2)}, {activePrayerLng.toFixed(2)})
            </AppText>
          </View>
          <View style={styles.actionPillPrimary}>
            <AppText variant="labelSmall" style={styles.actionPillPrimaryText}>
              Ubah Kota
            </AppText>
          </View>
        </Pressable>
      </View>

      {/* 3. Section: Organisasi */}
      <View style={styles.sectionHeaderRow}>
        <AppText
          variant="labelSmall"
          accessibilityRole="header"
          style={styles.sectionHeaderTag}
        >
          Kategori
        </AppText>
      </View>

      <View style={styles.cardGroup}>
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
            <Palette size={20} color={s.forest} />
          </View>
          <View style={styles.settingItemContent}>
            <AppText variant="titleSmall" style={styles.settingItemTitle}>
              Kategori target
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Kelola nama dan pengelompokan tujuanmu.
            </AppText>
          </View>
          <ChevronRight size={18} color={s.inkMuted} />
        </Pressable>
      </View>

      {/* 4. Section: Fokus & Kenyamanan */}
      <View style={styles.sectionHeaderRow}>
        <AppText
          variant="labelSmall"
          accessibilityRole="header"
          style={styles.sectionHeaderTag}
        >
          Preferensi fokus
        </AppText>
        <Coffee size={15} color={s.forest} />
      </View>

      <View style={styles.cardGroup}>
        {/* Toggle 1: Layar tetap terjaga */}
        <View style={styles.settingItemRow}>
          <View style={styles.iconWarmPeach}>
            <Sun size={20} color={s.sunDeep} />
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
            disabled={isLoading || isSavingSettings}
            value={settings.keepAwakeEnabled}
            onValueChange={(value) => { void updateSetting({ keepAwakeEnabled: value }); }}
            trackColor={{
              false: colors.outlineVariant,
              true: s.forest,
            }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </View>

        {/* Segmented Picker: Durasi Pomodoro */}
        <View style={styles.chipSettingBlock}>
          <View style={styles.chipSettingHeader}>
            <View style={styles.iconPeach}>
              <Coffee size={18} color={s.forest} />
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
                  disabled={isLoading || isSavingSettings}
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
                  {isSelected && <Star size={11} color={colors.surfaceContainerLowest} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Segmented Picker: Durasi Deep Flow */}
        <View style={styles.chipSettingBlock}>
          <View style={styles.chipSettingHeader}>
            <View style={styles.iconTertiary}>
              <Flame size={18} color={s.forest} />
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
                  disabled={isLoading || isSavingSettings}
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
                  {isSelected && <Star size={11} color={colors.surfaceContainerLowest} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Toggle 2: Getaran haptik */}
        <View style={styles.settingItemRow}>
          <View style={styles.iconNeutral}>
            <Vibrate size={20} color={s.ink} />
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
            disabled={isLoading || isSavingSettings}
            accessibilityLabel="Getaran haptik"
            value={settings.hapticsEnabled}
            onValueChange={(value) => { void updateSetting({ hapticsEnabled: value }); }}
            trackColor={{
              false: colors.outlineVariant,
              true: s.forest,
            }}
            thumbColor={colors.surfaceContainerLowest}
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
          Data dan privasi
        </AppText>
        <Lock size={15} color={s.forest} />
      </View>

      {/* 100% On-Device Banner */}
      <View style={styles.onDeviceBanner}>
        <ShieldCheck size={22} color={s.forest} />
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
            Catatan di perangkat ini
          </AppText>
          <View style={styles.statsGrid}>
            {[
              ['Target', stats.targetsCount],
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
            <Download size={20} color={s.forest} />
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
            <RefreshCw size={20} color={s.sunDeep} />
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
              <Download size={20} color={s.forest} />
            </View>
            <View style={styles.settingItemContent}>
              <AppText variant="titleSmall" style={styles.settingItemTitle}>
                Cadangan sebelum pemulihan
              </AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Simpan salinan data sebelum pemulihan terakhir.
              </AppText>
            </View>
            <ChevronRight size={18} color={s.inkMuted} />
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
          <Heart size={20} color={s.forest} />
        </View>
        <View style={styles.footerBadge}>
          <AppText variant="labelSmall" style={styles.footerBadgeText}>
            MyLife App v1.0.0 • Sprout Storybook Edition
          </AppText>
        </View>
        <View style={styles.quoteBox}>
          <AppText variant="bodyMedium" style={styles.quoteText}>
            “Ruang pribadi untuk merawat hidup yang kamu pilih — tanpa kebisingan notifikasi, tanpa algoritma manipulatif.”
          </AppText>
        </View>
      </View>

      <View style={{ height: space[10] }} />

      {isCategoryManagerVisible && (
        <CategoryManagerModal
          visible
          onClose={() => setIsCategoryManagerVisible(false)}
        />
      )}

      {/* Location Picker Sheet for Azan */}
      <AppBottomSheet
        visible={isLocationPickerVisible}
        onClose={() => { if (!isSavingSettings) setIsLocationPickerVisible(false); }}
        title="Pilih Lokasi Jadwal Azan"
        subtitle="Jadwal waktu shalat dihitung akurat menggunakan metode Kemenag RI sesuai titik koordinat kotamu."
      >
        <View style={styles.locationSheetBody}>
          {settingsError && <Banner variant="error" message={settingsError} />}
          <TextInput accessibilityLabel="Cari kota"
            value={citySearch}
            onChangeText={setCitySearch}
            placeholder="Cari nama kota"
            placeholderTextColor={s.inkSubtle}
            style={styles.searchCityInput}
          />

          <View style={styles.regionFilterRow}>
            {(['ALL', 'WIB', 'WITA', 'WIT'] as const).map((reg) => {
              const selected = regionFilter === reg;
              return (
                <Pressable accessibilityState={{ selected: selected }}
                  key={reg}
                  onPress={() => setRegionFilter(reg)}
                  accessibilityRole="button"
                  style={[
                    styles.regionPill,
                    selected && styles.regionPillActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.regionPillText,
                      selected && styles.regionPillTextActive,
                    ]}
                  >
                    {reg === 'ALL' ? 'Semua Zona' : reg}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={styles.cityListScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cityListStack}>
              {filteredCities.map((preset) => {
                const isSelected = activePrayerCity === preset.cityName;
                return (
                  <Pressable
                    key={preset.id}
                    onPress={() => handleSelectCityPreset(preset)}
                    accessibilityLabel={`Pilih kota ${preset.cityName}`}
                    disabled={isLoading || isSavingSettings}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.cityRowItem,
                      isSelected && styles.cityRowItemSelected,
                    ]}
                  >
                    <View style={styles.cityRowLeft}>
                      <MapPin
                        size={16}
                        color={isSelected ? colors.surfaceContainerLowest : s.forest}
                        strokeWidth={2.3}
                      />
                      <View>
                        <AppText
                          style={[
                            styles.cityRowTitle,
                            isSelected && styles.cityRowTitleSelected,
                          ]}
                        >
                          {preset.cityName}
                        </AppText>
                        <AppText
                          style={[
                            styles.cityRowCoords,
                            isSelected && styles.cityRowCoordsSelected,
                          ]}
                        >
                          {preset.latitude.toFixed(4)}, {preset.longitude.toFixed(4)}
                        </AppText>
                      </View>
                    </View>
                    {isSelected && (
                      <Check size={18} color={colors.surfaceContainerLowest} strokeWidth={2.8} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.customCoordBox}>
            <View style={styles.customCoordHeader}>
              <Compass size={15} color={s.forest} strokeWidth={2.3} />
              <AppText style={styles.customCoordTitle}>
                Atau masukkan koordinat daerah kustom
              </AppText>
            </View>

            <TextInput accessibilityLabel="Nama kota atau kabupaten"
              value={customCityName}
              editable={!isSavingSettings}
              onChangeText={setCustomCityName}
              placeholder="Masukkan nama kota atau kabupaten"
              placeholderTextColor={s.inkSubtle}
              style={styles.customInput}
            />
            <View style={styles.customLatLngRow}>
              <TextInput accessibilityLabel="Lintang lokasi"
                value={customLat}
                editable={!isSavingSettings}
                onChangeText={setCustomLat}
                placeholder="Masukkan latitude"
                placeholderTextColor={s.inkSubtle}
                keyboardType="numbers-and-punctuation"
                style={[styles.customInput, { flex: 1 }]}
              />
              <TextInput accessibilityLabel="Bujur lokasi"
                value={customLng}
                editable={!isSavingSettings}
                onChangeText={setCustomLng}
                placeholder="Masukkan longitude"
                placeholderTextColor={s.inkSubtle}
                keyboardType="numbers-and-punctuation"
                style={[styles.customInput, { flex: 1 }]}
              />
            </View>
            {customLocError && (
              <AppText style={styles.customErrorText}>{customLocError}</AppText>
            )}
            <Button
              title="Simpan Lokasi Kustom"
              onPress={handleSaveCustomLocation}
              disabled={isLoading || isSavingSettings}
              loading={isSavingSettings}
            />
          </View>
        </View>
      </AppBottomSheet>

      {/* Duration Picker Bottom Sheet */}
      <AppBottomSheet
        visible={durationPicker !== null}
        onClose={() => { if (!isSavingSettings) setDurationPicker(null); }}
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
                disabled={isLoading || isSavingSettings}
                onPress={async () => {
                  const saved = await updateSetting(
                    durationPicker === 'POMODORO'
                      ? { pomodoroMinutes: minutes }
                      : { deepFlowMinutes: minutes }
                  );
                  if (saved) setDurationPicker(null);
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
              target, {pendingBackup.summary.tasks} tugas,{' '}
              {pendingBackup.summary.categories} kategori,{' '}
              {pendingBackup.summary.stages} tahapan,{' '}
              {pendingBackup.summary.sessions} sesi fokus, dan{' '}
              {pendingBackup.summary.agenda} agenda. Pilar, prioritas harian, dan
              preferensi ikut dipulihkan.
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Jika cadangan memuat proyek versi lama, datanya dipulihkan sebagai Target. Jumlah Target dan tahapan dapat bertambah.
            </AppText>
            <Banner
              variant="warning"
              message="Sesi fokus yang sedang berjalan akan dihentikan. Salinan data saat ini disimpan sebelum penggantian. Berkas lagu kustom tidak ikut dicadangkan; pilih ulang jika tidak tersedia. Jangan tutup aplikasi selama proses berlangsung."
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
  screenRoot: { backgroundColor: s.cream },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sectionHeaderTag: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    letterSpacing: 0,
    color: s.inkMuted,
  },
  cardGroup: { backgroundColor: s.card, borderRadius: radius.xl, paddingHorizontal: space[1], borderWidth: stroke.hairline, borderColor: colors.border, },
  settingItemRow: { minHeight: touchTarget.comfortable, flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[2], borderRadius: radius.sm, },
  pressedRow: { backgroundColor: colors.surfaceContainerLow },
  settingItemContent: { flex: 1 },
  settingItemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
    marginBottom: space[0.5],
  },
  iconLeaf: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLavender: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.folderLilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPeach: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: s.sunSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWarmPeach: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: s.sunSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTertiary: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconNeutral: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSettingBlock: {
    padding: space[2],
    borderTopWidth: stroke.hairline,
    borderBottomWidth: stroke.hairline,
    borderColor: colors.border,
  },
  chipSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[2],
  },
  chipSettingText: { flex: 1 },
  chipsRow: { flexDirection: 'row', gap: space[2], marginTop: space[1] },
  durationChip: {
    minHeight: touchTarget.min,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[1],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  durationChipActivePrimary: { backgroundColor: s.forest },
  durationChipActiveSecondary: { backgroundColor: s.forest },
  durationChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  durationChipTextActive: { color: colors.surfaceContainerLowest, fontFamily: fontFamily.bold },
  onDeviceBanner: {
    flexDirection: 'row',
    gap: space[3],
    backgroundColor: s.leafSoft,
    borderRadius: radius.xl,
    padding: space[3],
    marginBottom: space[2],
    alignItems: 'flex-start',
    borderWidth: stroke.hairline,
    borderColor: colors.successContainer,
  },
  onDeviceBannerContent: { flex: 1 },
  onDeviceBannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
    marginBottom: space[0.5],
  },
  onDeviceBannerDesc: {
    fontSize: typography.labelMedium.fontSize,
    lineHeight: typography.labelMedium.lineHeight,
    color: s.inkMuted,
  },
  statsCard: { marginBottom: space[2], borderRadius: radius.xl },
  statsCardTitle: { fontFamily: fontFamily.bold, marginBottom: space[2] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  statBox: { minWidth: 64, flexGrow: 1 },
  statValue: { fontFamily: fontFamily.bold, fontSize: typography.titleLarge.fontSize, lineHeight: typography.titleMedium.lineHeight },
  actionPillPrimary: {
    backgroundColor: s.sun,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
  },
  actionPillPrimaryText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  actionPillNeutral: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
  },
  actionPillNeutralText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  footerPhilosophyCard: {
    backgroundColor: s.card,
    borderRadius: radius.lg,
    padding: space[4],
    alignItems: 'center',
    marginTop: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    ...sproutShadow,
  },
  footerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  footerBadge: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    marginBottom: space[2],
  },
  footerBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  quoteBox: {
    backgroundColor: s.cream,
    padding: space[3],
    borderRadius: radius.lg,
    width: '100%',
  },
  quoteText: {
    fontSize: typography.labelMedium.fontSize,
    lineHeight: typography.labelMedium.lineHeight,
    textAlign: 'center',
    color: s.inkMuted,
  },
  durationOptions: { gap: space[2] },
  durationSheetRow: {
    minHeight: touchTarget.min,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
  },
  selectedDurationSheetRow: { backgroundColor: s.forest },
  confirmationInput: {
    minHeight: touchTarget.comfortable,
    color: s.ink,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    fontSize: typography.titleMedium.fontSize,
    fontFamily: fontFamily.bold,
    ...formInputBase,
  },
  locationSheetBody: {
    gap: space[3],
  },
  searchCityInput: {
    minHeight: touchTarget.min,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingHorizontal: space[3],
    fontFamily: fontFamily.medium,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    ...formInputBase,
  },
  regionFilterRow: {
    flexDirection: 'row',
    gap: space[1],
  },
  regionPill: {
    flex: 1,
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
  },
  regionPillActive: {
    backgroundColor: s.forest,
  },
  regionPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  regionPillTextActive: {
    fontFamily: fontFamily.bold,
    color: colors.surfaceContainerLowest,
  },
  cityListScroll: {
    maxHeight: 220,
  },
  cityListStack: {
    gap: space[1],
  },
  cityRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.lg,
    backgroundColor: s.cream,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  cityRowItemSelected: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  cityRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  cityRowTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.bodyMedium.fontSize,
    color: s.ink,
  },
  cityRowTitleSelected: {
    color: colors.surfaceContainerLowest,
  },
  cityRowCoords: {
    fontFamily: fontFamily.regular,
    fontSize: typography.labelMedium.fontSize,
    color: s.inkMuted,
  },
  cityRowCoordsSelected: {
    color: s.leafSoft,
  },
  customCoordBox: {
    backgroundColor: s.cream,
    borderRadius: radius.lg,
    padding: space[3],
    gap: space[2],
    borderWidth: stroke.hairline,
    borderColor: colors.border,
  },
  customCoordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  customCoordTitle: {
    fontFamily: fontFamily.bold,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
  },
  customInput: {
    minHeight: touchTarget.min,
    backgroundColor: s.card,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: s.ink,
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    ...formInputBase,
  },
  customLatLngRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  customErrorText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.labelMedium.fontSize,
    color: colors.error,
  },
});
