import React, { useState } from 'react';
import { View, Pressable, Switch, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Tags, Vibrate, Eye, Timer, Flame, Download, ShieldCheck } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen, AppText, Card, Button, AppBottomSheet } from '@/shared/ui';
import { CategoryManagerModal } from '@/features/categories/presentation/components/category-manager-modal';
import { useSettings } from '../hooks/use-settings';

const POMODORO_OPTIONS = [15, 25, 45, 60];
const DEEP_FLOW_OPTIONS = [45, 50, 60, 90];

function SettingRow({ title, description, icon, trailing, onPress }: {
  title: string; description: string; icon: React.ReactNode; trailing?: React.ReactNode; onPress?: () => void;
}) {
  const content = <>
    <View style={styles.leadingIcon}>{icon}</View>
    <View style={styles.rowText}><AppText variant="titleSmall">{title}</AppText><AppText variant="bodySmall" color="onSurfaceVariant">{description}</AppText></View>
    {trailing || (onPress && <ChevronRight size={18} color={colors.primary} />)}
  </>;
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>{content}</Pressable> :
    <View style={styles.row}>{content}</View>;
}

export const SettingsScreen: React.FC = () => {
  const { settings, stats, isLoading, isExporting, backupJson, setBackupJson, updateSetting, exportBackup } = useSettings();
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(false);
  const [durationPicker, setDurationPicker] = useState<'POMODORO' | 'DEEP_FLOW' | null>(null);
  const durationOptions = durationPicker === 'POMODORO' ? POMODORO_OPTIONS : DEEP_FLOW_OPTIONS;
  const handleExport = async () => {
    if (!await exportBackup()) Alert.alert('Belum dapat menampilkan data', 'Coba lagi beberapa saat.');
  };

  return (
    <Screen withBottomPadding={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Kembali" style={styles.back}>
          <ArrowLeft size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}><AppText variant="bodySmall" color="onSurfaceVariant">Sesuaikan dengan caramu</AppText><AppText variant="headlineLarge">Pengaturan.</AppText></View>
      </View>

      <AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>Organisasi</AppText>
      <SettingRow title="Kategori target" description="Kelola nama dan pengelompokan tujuanmu."
        icon={<Tags size={20} color={colors.primary} />} onPress={() => setIsCategoryManagerVisible(true)} />

      <AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>Fokus & kenyamanan</AppText>
      <SettingRow title="Getaran haptik" description="Preferensi umpan balik sentuh."
        icon={<Vibrate size={20} color={colors.primary} />}
        trailing={<Switch accessibilityLabel="Getaran haptik" value={settings.hapticsEnabled} onValueChange={value => updateSetting({ hapticsEnabled: value })}
          trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }} thumbColor={colors.onPrimary} />} />
      <SettingRow title="Layar tetap terjaga" description="Preferensi layar selama sesi fokus."
        icon={<Eye size={20} color={colors.primary} />}
        trailing={<Switch accessibilityLabel="Layar tetap terjaga" value={settings.keepAwakeEnabled} onValueChange={value => updateSetting({ keepAwakeEnabled: value })}
          trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }} thumbColor={colors.onPrimary} />} />
      <SettingRow title="Durasi Pomodoro" description={settings.pomodoroMinutes + ' menit per sesi'}
        icon={<Timer size={20} color={colors.primary} />} onPress={() => setDurationPicker('POMODORO')} />
      <SettingRow title="Durasi Deep Flow" description={settings.deepFlowMinutes + ' menit per sesi'}
        icon={<Flame size={20} color={colors.primary} />} onPress={() => setDurationPicker('DEEP_FLOW')} />

      <AppText variant="headlineSmall" accessibilityRole="header" style={styles.sectionTitle}>Data & privasi</AppText>
      {!isLoading && <Card variant="highlight" padding={space[5]}>
        <AppText variant="labelMedium" color="onPrimaryContainer">TERSIMPAN DI PERANGKAT INI</AppText>
        <View style={styles.stats}>
          {[
            ['Target', stats.targetsCount], ['Proyek', stats.projectsCount], ['Tugas', stats.tasksCount],
            ['Sesi fokus', stats.focusSessionsCount], ['Agenda', stats.agendaEventsCount],
          ].map(([label, value]) => <View key={label} style={styles.stat}><AppText variant="headlineMedium" color="onPrimaryContainer" tabularNums>{value}</AppText><AppText variant="bodySmall" color="onPrimaryContainer">{label}</AppText></View>)}
        </View>
      </Card>}
      <View style={styles.dataActions}>
        <SettingRow title="Pratinjau data JSON" description="Untuk inspeksi lokal. Pemulihan data belum tersedia."
          icon={<Download size={20} color={colors.primary} />}
          trailing={<ChevronRight size={18} color={colors.primary} />} onPress={isExporting ? undefined : handleExport} />
      </View>
      <SettingRow title="Penyimpanan lokal" description="Catatan aplikasi disimpan di perangkat ini."
        icon={<ShieldCheck size={20} color={colors.primary} />} />
      <View style={styles.footer}><AppText variant="titleMedium" color="primary">MyLife</AppText><AppText variant="bodySmall" color="onSurfaceVariant">Versi 1.0.0 · Ruang untuk hidup yang berarti.</AppText></View>

      {isCategoryManagerVisible && <CategoryManagerModal visible onClose={() => setIsCategoryManagerVisible(false)} />}
      <AppBottomSheet visible={durationPicker !== null} onClose={() => setDurationPicker(null)}
        title={durationPicker === 'POMODORO' ? 'Durasi Pomodoro' : 'Durasi Deep Flow'}
        subtitle="Pilih durasi yang sesuai dengan ritmemu.">
        <View style={styles.durationOptions}>{durationOptions.map(minutes => {
          const selected = minutes === (durationPicker === 'POMODORO' ? settings.pomodoroMinutes : settings.deepFlowMinutes);
          return <Pressable key={minutes} accessibilityRole="button" accessibilityState={{ selected }}
            onPress={() => { updateSetting(durationPicker === 'POMODORO' ? { pomodoroMinutes: minutes } : { deepFlowMinutes: minutes }); setDurationPicker(null); }}
            style={[styles.duration, selected && styles.selectedDuration]}>
            <AppText variant="titleMedium" color={selected ? 'onPrimary' : 'onSurface'}>{minutes} menit</AppText>
          </Pressable>;
        })}</View>
      </AppBottomSheet>
      <AppBottomSheet visible={backupJson !== null} onClose={() => setBackupJson(null)}
        title="Pratinjau data" subtitle="Snapshot untuk inspeksi. Bukan pemulihan lengkap."
        footer={<Button title="Tutup pratinjau" onPress={() => setBackupJson(null)} />}>
        <TextInput accessibilityLabel="Isi snapshot JSON" value={backupJson || ''} multiline editable={false} selectTextOnFocus style={styles.json} />
      </AppBottomSheet>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[4], marginBottom: space[4] },
  headerText: { flex: 1 },
  back: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: space[6], marginBottom: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], minHeight: 80, backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.lg, marginBottom: space[2] },
  leadingIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: space[1] },
  pressed: { opacity: 0.8 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space[5], marginTop: space[4] },
  stat: { minWidth: 72, flexGrow: 1 },
  dataActions: { marginTop: space[3] },
  footer: { gap: space[1], paddingVertical: space[8] },
  durationOptions: { gap: space[3] },
  duration: { minHeight: 56, padding: space[4], borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow },
  selectedDuration: { backgroundColor: colors.primary },
  json: { minHeight: 240, color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, padding: space[4], borderRadius: radius.md, fontFamily: 'monospace', fontSize: 12, textAlignVertical: 'top' },
});
