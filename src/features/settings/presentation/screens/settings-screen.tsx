import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Vibrate,
  Eye,
  Timer,
  Flame,
  HardDrive,
  Download,
  Smartphone,
  ShieldCheck,
  X,
  Copy,
  Check,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, touchTarget } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useSettings } from '../hooks/use-settings';

const POMODORO_OPTIONS = [15, 25, 45, 60];
const DEEP_FLOW_OPTIONS = [45, 50, 60, 90];

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    stats,
    isExporting,
    backupJson,
    setBackupJson,
    updateSetting,
    exportBackup,
  } = useSettings();

  const [activeDurationPicker, setActiveDurationPicker] = useState<'POMODORO' | 'DEEP_FLOW' | null>(null);

  const handleExport = async () => {
    const json = await exportBackup();
    if (!json) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengekspor database.');
    }
  };

  return (
    <Screen>
      {/* TopBar 64 dp (DESIGN.md Template D) */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.onSurface} />
        </Pressable>

        <View style={styles.topBarTitleBox}>
          <AppText variant="titleLarge">Pengaturan</AppText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* SEKSI 1: TIMER & FOKUS */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleMedium" color="onSurface">
            Fokus & Timer
          </AppText>
        </View>

        {/* Item: Getaran Haptik */}
        <View style={styles.listItem56}>
          <View style={styles.leadingIconBox}>
            <Vibrate size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Getaran Haptik</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Umpan balik sentuh saat timer mulai & selesai
            </AppText>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(val) => updateSetting({ hapticsEnabled: val })}
            trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {/* Item: Layar Terjaga */}
        <View style={styles.listItem56}>
          <View style={styles.leadingIconBox}>
            <Eye size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Layar Tetap Terjaga</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Mencegah layar redup otomatis saat sesi fokus
            </AppText>
          </View>
          <Switch
            value={settings.keepAwakeEnabled}
            onValueChange={(val) => updateSetting({ keepAwakeEnabled: val })}
            trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {/* Item: Durasi Pomodoro */}
        <Pressable
          onPress={() => setActiveDurationPicker('POMODORO')}
          accessibilityRole="button"
          style={styles.listItem72}
        >
          <View style={styles.leadingIconBox}>
            <Timer size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Durasi Pomodoro</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Waktu standar sesi kerja fokus teratur
            </AppText>
          </View>
          <View style={styles.trailingChip}>
            <AppText variant="labelMedium" color="primary">
              {settings.pomodoroMinutes} mnt
            </AppText>
          </View>
        </Pressable>

        {/* Item: Durasi Deep Flow */}
        <Pressable
          onPress={() => setActiveDurationPicker('DEEP_FLOW')}
          accessibilityRole="button"
          style={styles.listItem72}
        >
          <View style={styles.leadingIconBox}>
            <Flame size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Durasi Deep Flow</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Waktu sesi kerja intensif tanpa jeda
            </AppText>
          </View>
          <View style={styles.trailingChip}>
            <AppText variant="labelMedium" color="primary">
              {settings.deepFlowMinutes} mnt
            </AppText>
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* SEKSI 2: DATA & PENYIMPANAN */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleMedium" color="onSurface">
            Data & Penyimpanan
          </AppText>
        </View>

        {/* Database Stats Card */}
        <Card variant="filled" style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <HardDrive size={18} color={colors.primary} />
            <AppText variant="labelLarge" color="primary">
              Database SQLite Lokal
            </AppText>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <AppText variant="titleLarge" tabularNums>
                {stats.targetsCount}
              </AppText>
              <AppText variant="labelSmall" color="onSurfaceVariant">
                Target
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="titleLarge" tabularNums>
                {stats.projectsCount}
              </AppText>
              <AppText variant="labelSmall" color="onSurfaceVariant">
                Proyek
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="titleLarge" tabularNums>
                {stats.tasksCount}
              </AppText>
              <AppText variant="labelSmall" color="onSurfaceVariant">
                Tugas
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="titleLarge" tabularNums>
                {stats.focusSessionsCount}
              </AppText>
              <AppText variant="labelSmall" color="onSurfaceVariant">
                Sesi Fokus
              </AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="titleLarge" tabularNums>
                {stats.agendaEventsCount}
              </AppText>
              <AppText variant="labelSmall" color="onSurfaceVariant">
                Agenda
              </AppText>
            </View>
          </View>
        </Card>

        {/* Item: Ekspor Data */}
        <Pressable
          onPress={handleExport}
          accessibilityRole="button"
          style={styles.listItem56}
        >
          <View style={styles.leadingIconBox}>
            <Download size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Ekspor Cadangan Data JSON</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Salin snapshot seluruh database ke format JSON
            </AppText>
          </View>
          <Button
            title={isExporting ? 'Mengekspor...' : 'Ekspor'}
            variant="tonal"
            size="compact"
            onPress={handleExport}
            loading={isExporting}
          />
        </Pressable>

        <View style={styles.divider} />

        {/* SEKSI 3: TENTANG APLIKASI */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleMedium" color="onSurface">
            Tentang MyLife Mobile
          </AppText>
        </View>

        <View style={styles.listItem56}>
          <View style={styles.leadingIconBox}>
            <Smartphone size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Versi Aplikasi</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              v1.0.0 (Personal Life OS)
            </AppText>
          </View>
        </View>

        <View style={styles.listItem56}>
          <View style={styles.leadingIconBox}>
            <ShieldCheck size={20} color={colors.primary} />
          </View>
          <View style={styles.itemTextCol}>
            <AppText variant="bodyLarge">Arsitektur Penyimpanan</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              100% Offline-First (Local SQLite on device)
            </AppText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerBox}>
          <AppText variant="bodySmall" color="onSurfaceSubtle" style={styles.footerText}>
            MyLife Mobile • Dibuat untuk eksekusi hidup nyata tanpa distorsi.
          </AppText>
        </View>
      </ScrollView>

      {/* Modal Pemilih Durasi */}
      <Modal
        visible={activeDurationPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDurationPicker(null)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <AppText variant="titleLarge" style={styles.pickerTitle}>
              Pilih Durasi {activeDurationPicker === 'POMODORO' ? 'Pomodoro' : 'Deep Flow'}
            </AppText>

            <View style={styles.pickerChipsRow}>
              {(activeDurationPicker === 'POMODORO'
                ? POMODORO_OPTIONS
                : DEEP_FLOW_OPTIONS
              ).map((mins) => {
                const isSelected =
                  activeDurationPicker === 'POMODORO'
                    ? settings.pomodoroMinutes === mins
                    : settings.deepFlowMinutes === mins;

                return (
                  <Pressable
                    key={mins}
                    onPress={() => {
                      if (activeDurationPicker === 'POMODORO') {
                        updateSetting({ pomodoroMinutes: mins });
                      } else {
                        updateSetting({ deepFlowMinutes: mins });
                      }
                      setActiveDurationPicker(null);
                    }}
                    style={[
                      styles.pickerChip,
                      isSelected && styles.pickerChipSelected,
                    ]}
                  >
                    <AppText
                      variant="labelLarge"
                      color={isSelected ? 'onPrimaryContainer' : 'onSurface'}
                    >
                      {mins} Menit
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <Button
              title="Tutup"
              variant="tonal"
              onPress={() => setActiveDurationPicker(null)}
              style={styles.pickerCloseBtn}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Preview Cadangan JSON */}
      <Modal
        visible={backupJson !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setBackupJson(null)}
      >
        <View style={styles.backupModalOverlay}>
          <View style={styles.backupModalContent}>
            <View style={styles.backupHeader}>
              <AppText variant="titleLarge">Data Cadangan JSON</AppText>
              <Pressable
                onPress={() => setBackupJson(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>

            <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.backupSub}>
              Salin data JSON berikut sebagai arsip offline cadanganmu.
            </AppText>

            <TextInput
              value={backupJson || ''}
              multiline
              editable={false}
              selectTextOnFocus
              style={styles.backupTextInput}
            />

            <Button
              title="Tutup Preview"
              variant="filled"
              onPress={() => setBackupJson(null)}
              style={styles.backupCloseBtn}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space[2],
  },
  backButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  topBarTitleBox: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: space[10],
  },
  sectionHeader: {
    height: 48,
    justifyContent: 'center',
    marginTop: space[2],
  },
  listItem56: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
  },
  listItem72: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space[2],
  },
  leadingIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[3],
  },
  itemTextCol: {
    flex: 1,
    marginRight: space[2],
  },
  trailingChip: {
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: space[4],
  },
  statsCard: {
    marginVertical: space[2],
    padding: space[3],
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginBottom: space[3],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  footerBox: {
    marginTop: space[8],
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[4],
  },
  pickerModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xl,
    padding: space[5],
  },
  pickerTitle: {
    marginBottom: space[4],
    textAlign: 'center',
  },
  pickerChipsRow: {
    gap: space[2],
    marginBottom: space[4],
  },
  pickerChip: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  pickerChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  pickerCloseBtn: {
    marginTop: space[2],
  },
  backupModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  backupModalContent: {
    backgroundColor: colors.surfaceContainer,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '90%',
    padding: space[4],
    paddingBottom: space[8],
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  backupSub: {
    marginBottom: space[3],
  },
  backupTextInput: {
    height: 300,
    backgroundColor: colors.surfaceContainerLowest,
    color: colors.onSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: space[3],
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: space[4],
  },
  backupCloseBtn: {
    marginTop: space[2],
  },
});
