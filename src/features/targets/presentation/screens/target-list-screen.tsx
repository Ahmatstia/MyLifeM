import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Plus, Sparkles, CheckCircle2, Clock, Star, Compass } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  WaveBackdrop,
  MascotRocket,
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

      {/* Header over Sprout Home Wave */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <AppText variant="headlineMedium" style={styles.headerTitle}>
            Target Hidup
          </AppText>
          <AppText style={styles.headerSubtitle}>
            Langkah kecil menuju impian besarmu ✨
          </AppText>
        </View>

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
            {/* Unified Storybook Growth Showcase (Rocket Mascot + Meadow Wave + Ringkasan Target) */}
            <View style={styles.growthShowcase}>
              <View style={styles.growthTopRow}>
                <MascotRocket width={160} height={144} style={styles.rocketMascot} />

                <View style={styles.growthRightCol}>
                  <View style={styles.growthPillBadge}>
                    <AppText style={styles.growthPillBadgeText}>LONJAKAN FOKUS</AppText>
                  </View>
                  <AppText style={styles.growthHeadline}>
                    Produktivitasmu{'\n'}meningkat!
                  </AppText>
                  <AppText style={styles.growthPercentText} tabularNums>
                    {`+${progress}%`}
                  </AppText>
                  <AppText style={styles.growthCaptionText}>
                    {totalTasks > 0
                      ? `${completedTasks} dari ${totalTasks} langkah tuntas`
                      : 'Belum ada rencana'}
                  </AppText>
                </View>
              </View>

              {/* Multi-layered Organic Meadow Trend Line */}
              <View style={styles.waveChartWrap}>
                <Svg width="100%" height={64} viewBox="0 0 320 64" preserveAspectRatio="none">
                  {/* Soft background hill */}
                  <Path
                    d="M0 54 C48 38 92 48 144 30 C196 12 242 28 320 14 L320 64 L0 64 Z"
                    fill="#E5F0D2"
                    opacity={0.7}
                  />
                  {/* Foreground vibrant meadow wave */}
                  <Path
                    d="M0 52 C36 26 68 46 108 30 C148 14 184 38 228 18 C264 4 292 22 320 10 L320 64 L0 64 Z"
                    fill={s.leafSoft}
                  />
                  {/* Hand-drawn forest green trend line */}
                  <Path
                    d="M0 52 C36 26 68 46 108 30 C148 14 184 38 228 18 C264 4 292 22 320 10"
                    stroke={s.forest}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Milestone nodes along the wave */}
                  <Circle cx={108} cy={30} r={4.5} fill="#FFFDF8" stroke={s.forest} strokeWidth={2.5} />
                  <Circle cx={228} cy={18} r={5} fill={s.sun} stroke={s.forest} strokeWidth={2.5} />
                </Svg>
              </View>

              {/* Integrated 3-Column Summary Dock ("Ringkasan Target") */}
              <View style={styles.ringkasanDock}>
                <View style={styles.ringkasanHeaderRow}>
                  <AppText style={styles.ringkasanHeading}>Ringkasan Target</AppText>
                  <AppText style={styles.ringkasanSubheading}>Total Pencapaian</AppText>
                </View>

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
                    <AppText style={styles.statLabel}>Waktu Fokus</AppText>
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
              </View>
            </View>

            {/* Clean Journey Trail Section Header */}
            <View style={styles.trailSectionHeader}>
              <View style={styles.trailHeaderLeft}>
                <View style={styles.trailHeaderIcon}>
                  <Compass size={16} color={s.forest} strokeWidth={2.5} />
                </View>
                <View>
                  <AppText style={styles.trailHeaderTitle}>Peta Perjalanan Target</AppText>
                  <AppText style={styles.trailHeaderSub}>
                    Ketuk salah satu misi untuk mengatur tahapan & langkah
                  </AppText>
                </View>
              </View>

              <View style={styles.trailCountPill}>
                <AppText style={styles.trailCountText} tabularNums>
                  {targets.length} misi
                </AppText>
              </View>
            </View>

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
              <View style={styles.trailListWrap}>
                {targets.map((target, index) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    index={index}
                    isLast={index === targets.length - 1}
                    onPress={() =>
                      router.push({
                        pathname: '/targets/[id]',
                        params: { id: target.id },
                      })
                    }
                  />
                ))}
              </View>
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
    paddingBottom: space[1],
  },
  headerTextCol: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontFamily: fontFamily.bold,
    color: s.ink,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: s.inkMuted,
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
    paddingBottom: 110,
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
  growthShowcase: {
    backgroundColor: '#FFFDF8',
    borderRadius: 30,
    paddingTop: space[2],
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ECE3CE',
    marginTop: 2,
  },
  growthTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[3],
  },
  rocketMascot: {
    marginLeft: -4,
    marginBottom: -8,
  },
  growthRightCol: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
    paddingRight: space[1],
  },
  growthPillBadge: {
    backgroundColor: s.leafSoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 2,
  },
  growthPillBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: s.forest,
  },
  growthHeadline: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 21,
    color: s.ink,
    textAlign: 'right',
  },
  growthPercentText: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    color: s.forest,
  },
  growthCaptionText: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    lineHeight: 15,
    color: s.inkMuted,
    textAlign: 'right',
  },
  waveChartWrap: {
    marginTop: -4,
  },
  ringkasanDock: {
    backgroundColor: '#FAF5E8',
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[4],
    borderTopWidth: 1,
    borderTopColor: '#EAE0C8',
    gap: space[3],
  },
  ringkasanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ringkasanHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: s.ink,
  },
  ringkasanSubheading: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: s.inkMuted,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 16.5,
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
    backgroundColor: '#E5DCC6',
  },
  trailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[2],
    paddingBottom: 2,
    gap: 10,
  },
  trailHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trailHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: s.leafSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailHeaderTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    color: s.ink,
  },
  trailHeaderSub: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    lineHeight: 15,
    color: s.inkMuted,
  },
  trailCountPill: {
    backgroundColor: '#EFE8D5',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  trailCountText: {
    fontFamily: fontFamily.bold,
    fontSize: 11.5,
    color: s.forest,
  },
  trailListWrap: {
    paddingTop: 4,
  },
});
