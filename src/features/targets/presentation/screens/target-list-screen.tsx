import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Plus, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  WaveBackdrop,
  SoftCard,
  SectionTitle,
  MascotPeek,
} from '@/shared/ui';
import { useTargets } from '../hooks/use-targets';
import { CategoryFilterChips } from '../components/category-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

const s = colors.sprout;

export const TargetListScreen: React.FC = () => {
  const {
    targets,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoading,
    error,
    refresh,
    addTarget,
  } = useTargets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => router.push('/targets/new'));

  const totalTasks = targets.reduce((sum, target) => sum + target.totalTasks, 0);
  const completedTasks = targets.reduce((sum, target) => sum + target.completedTasks, 0);
  const totalEstimatedHours = targets.reduce(
    (sum, target) => sum + (target.totalEstimatedHours || 0),
    0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <AddTargetModal
          visible={isModalVisible}
          categories={categories}
          onClose={() => setIsModalVisible(false)}
          onSubmit={addTarget}
        />
      }
    >
      <WaveBackdrop variant="home" height={285} />

      {/* Header over Sprout Home Wave (Non-sticky) */}
      <View style={styles.header}>
        <AppText variant="headlineMedium" style={styles.headerTitle}>
          Target Hidup
        </AppText>

        <Pressable
          onPress={() => router.push('/targets/new')}
          accessibilityRole="button"
          accessibilityLabel="Tambah Target Baru"
          style={({ pressed }) => [styles.addPillBtn, pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <Plus size={15} color={s.ink} strokeWidth={2.8} />
          <AppText style={styles.addPillText}>Target Baru</AppText>
        </Pressable>
      </View>

      {/* Segmented Category Pill Bar */}
        <CategoryFilterChips
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {error && (
          <Banner
            variant="error"
            message={error}
            actionText="Coba lagi"
            onActionPress={refresh}
            style={styles.notice}
          />
        )}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={s.forest} size="large" />
            <AppText color="onSurfaceVariant">Memuat targetmu…</AppText>
          </View>
        ) : (
          !error && (
            <>
              {/* Storybook Growth Hero Section (matching bottom-right Reference UI) */}
              <View style={styles.growthCard}>
                <View style={styles.growthTopRow}>
                  <MascotPeek width={122} height={92} />
                  <View style={styles.growthRightCol}>
                    <AppText style={styles.growthHeadline}>
                      Produktivitasmu{'\n'}meningkat!
                    </AppText>
                    <AppText style={styles.growthPercentText} tabularNums>
                      {totalTasks > 0 ? `+${progress}%` : 'Belum ada rencana'}
                    </AppText>
                  </View>
                </View>

                {/* Organic Wavy Trend Line */}
                <Svg width="100%" height={56} viewBox="0 0 320 56" preserveAspectRatio="none">
                  <Path
                    d="M0 48 C36 22 68 42 108 26 C148 10 184 34 228 14 C264 0 292 18 320 6 L320 56 L0 56 Z"
                    fill={s.leafSoft}
                    opacity={0.75}
                  />
                  <Path
                    d="M0 48 C36 22 68 42 108 26 C148 10 184 34 228 14 C264 0 292 18 320 6"
                    stroke={s.forest}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </View>

              {/* 3-Column Summary Card ("Ringkasan Target") matching Reference UI */}
              <SoftCard style={styles.ringkasanCard}>
                <AppText style={styles.ringkasanHeading}>Ringkasan Target</AppText>
                <View style={styles.statsColumnsRow}>
                  <View style={styles.statCol}>
                    <View style={[styles.statIconCircle, { backgroundColor: s.leafSoft }]}>
                      <CheckCircle2 size={16} color={s.forest} strokeWidth={2.5} />
                    </View>
                    <AppText style={styles.statValue} tabularNums>
                      {completedTasks}
                    </AppText>
                    <AppText style={styles.statLabel}>Tugas Selesai</AppText>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCol}>
                    <View style={[styles.statIconCircle, { backgroundColor: s.tealSoft }]}>
                      <Clock size={16} color={s.teal} strokeWidth={2.5} />
                    </View>
                    <AppText style={styles.statValue} tabularNums>
                      {totalEstimatedHours} jam
                    </AppText>
                    <AppText style={styles.statLabel}>Estimasi Fokus</AppText>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCol}>
                    <View style={[styles.statIconCircle, { backgroundColor: s.sunSoft }]}>
                      <Star size={16} color="#B87E00" fill={s.sun} strokeWidth={2.2} />
                    </View>
                    <AppText style={styles.statValue} tabularNums>
                      {targets.length}
                    </AppText>
                    <AppText style={styles.statLabel}>Target Aktif</AppText>
                  </View>
                </View>
              </SoftCard>

              <SectionTitle
                title="Daftar Target"
                hint={`${targets.length} target`}
                actionLabel="Tambah"
                onAction={() => router.push('/targets/new')}
              />

              {targets.length === 0 ? (
                <EmptyState
                  title={
                    selectedCategoryId
                      ? 'Belum ada target di kategori ini'
                      : 'Apa yang ingin kamu wujudkan?'
                  }
                  description="Mulai dari satu tujuan, misalnya menjadi AI Engineer. Pecah menjadi tahapan dan tugas yang jelas."
                  customIcon={<Sparkles size={30} color={s.forest} strokeWidth={2} />}
                  actionTitle="Buat target"
                  onActionPress={() => router.push('/targets/new')}
                />
              ) : (
                targets.map((target) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    onPress={() =>
                      router.push({
                        pathname: '/targets/[id]',
                        params: { id: target.id },
                      })
                    }
                  />
                ))
              )}
            </>
          )
        )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: s.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.bold,
    color: s.ink,
  },
  addPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: s.sun,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  addPillText: {
    color: s.ink,
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 100,
    gap: space[3],
  },
  notice: {
    marginVertical: space[2],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
  },
  growthCard: {
    backgroundColor: s.card,
    borderRadius: 28,
    paddingTop: space[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1EADA',
  },
  growthTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
  },
  growthRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  growthHeadline: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    color: s.ink,
    textAlign: 'right',
  },
  growthPercentText: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: s.forest,
  },
  ringkasanCard: {
    borderRadius: 26,
    gap: space[3],
  },
  ringkasanHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  statsColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: s.ink,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.inkMuted,
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#EBE3D0',
  },
});
