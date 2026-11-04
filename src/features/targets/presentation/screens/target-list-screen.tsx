import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Plus,
  Flag,
  ArrowRight,
  CircleUserRound,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
import { useTargets } from '../hooks/use-targets';
import { CategoryFilterChips } from '../components/category-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

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
  useOpenAddFromParam(() => setIsModalVisible(true));

  const totalTasks = targets.reduce((sum, target) => sum + target.totalTasks, 0);
  const completedTasks = targets.reduce((sum, target) => sum + target.completedTasks, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Screen style={styles.screenBg}>
      {/* TOP HEADER (Exact Stitch: Avatar with Citron Dot + "Halo, Sandra ✨" + "+ Target" Pill) */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <CircleUserRound size={24} color="#121417" strokeWidth={2.4} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.titleColumn}>
            <AppText variant="bodySmall" style={styles.subtitleGreeting}>
              Halo, Sandra ✨
            </AppText>
            <AppText variant="headlineLarge" style={styles.headerTitle}>
              Target Hidup.
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah Target Baru"
          style={styles.addTargetBtn}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <AppText variant="labelMedium" style={styles.addTargetText}>
            Target
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HORIZONTAL CATEGORY FILTER CHIPS */}
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
            <ActivityIndicator color={colors.primary} size="large" />
            <AppText color="onSurfaceVariant">Memuat targetmu…</AppText>
          </View>
        ) : (
          !error && (
            <>
              {/* HERO METRIC / PROGRESS HIGHLIGHT CARD (Lavender Card matching Stitch) */}
              <View style={styles.heroCard}>
                {/* 3D Star / Flower Graphic Decoration */}
                <View style={styles.flowerContainer} pointerEvents="none">
                  <Svg width={110} height={110} viewBox="0 0 100 100">
                    <Path
                      d="M50 0 C54 22 58 26 80 30 C58 34 54 38 50 60 C46 38 42 34 20 30 C42 26 46 22 50 0 Z"
                      fill="#FFB732"
                    />
                    <Circle cx="50" cy="30" r="14" fill="#FFA31A" />
                    <Path
                      d="M75 12 C78 28 82 32 98 35 C82 38 78 42 75 58 C72 42 68 38 52 35 C68 32 72 28 75 12 Z"
                      fill="#DCF763"
                      opacity={0.9}
                    />
                  </Svg>
                </View>

                {/* Eyebrow Pill */}
                <View style={styles.heroEyebrow}>
                  <View style={styles.pulseDot} />
                  <AppText variant="labelSmall" style={styles.eyebrowText}>
                    {targets.length} Target Aktif
                  </AppText>
                </View>

                {/* Big Progress Headline */}
                <View style={styles.heroTextSection}>
                  <AppText variant="headlineLarge" style={styles.heroProgressTitle}>
                    {totalTasks > 0 ? `${progress}% Tercapai.` : 'Belum ada rencana'}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.heroSubtext}>
                    {totalTasks > 0
                      ? `${completedTasks} dari ${totalTasks} tugas rencana telah selesai dikerjakan.`
                      : 'Mulai dari satu target, pecah menjadi tahapan dan tugas yang jelas.'}
                  </AppText>
                </View>

                {/* Sleek Progress Track with Citron Glow */}
                <View style={styles.heroProgressTrack}>
                  <View
                    style={[
                      styles.heroProgressBar,
                      { width: `${Math.min(100, Math.max(0, progress))}%` },
                    ]}
                  />
                </View>

                {/* Hero Footer */}
                <View style={styles.heroFooter}>
                  <AppText variant="labelSmall" style={styles.heroFooterText}>
                    Tingkat konsistensi:{' '}
                    {progress >= 70
                      ? 'Luar Biasa 🚀'
                      : progress >= 40
                        ? 'Sangat Baik 🔥'
                        : 'Terus Melangkah 🌱'}
                  </AppText>
                  <Pressable
                    onPress={() => router.push('/settings')}
                    style={styles.heroActionBtn}
                  >
                    <AppText variant="labelSmall" style={styles.heroActionBtnText}>
                      Evaluasi
                    </AppText>
                    <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.4} />
                  </Pressable>
                </View>
              </View>

              {/* SECONDARY GRID: MINI DUAL STAT CARDS */}
              <View style={styles.statsGrid}>
                {/* Left Card: Peach/Tangerine Soft */}
                <View style={styles.statCardPeach}>
                  <View style={styles.statHeader}>
                    <AppText variant="labelSmall" style={styles.statLabelTangerine}>
                      TARGET
                    </AppText>
                    <View style={styles.statIconCirclePeach}>
                      <Flag size={14} color="#FF9B42" strokeWidth={2.5} />
                    </View>
                  </View>
                  <View style={styles.statNumberBox}>
                    <AppText variant="headlineLarge" tabularNums style={styles.statBigNumber}>
                      {targets.length}
                    </AppText>
                    <AppText variant="bodySmall" style={styles.statSubText}>
                      Target Berjalan
                    </AppText>
                  </View>
                </View>

                {/* Right Card: Clean White */}
                <View style={styles.statCardWhite}>
                  <View style={styles.statHeader}>
                    <AppText variant="labelSmall" style={styles.statLabelDark}>
                      TUNTAS
                    </AppText>
                    <View style={styles.citronPillBadge}>
                      <AppText variant="labelSmall" style={styles.citronBadgeText}>
                        +{completedTasks} selesai
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.statNumberBox}>
                    <AppText variant="headlineLarge" tabularNums style={styles.statBigNumber}>
                      {completedTasks}
                      <AppText variant="titleSmall" style={styles.statTotalTasksNumber}>
                        /{totalTasks}
                      </AppText>
                    </AppText>
                    <AppText variant="bodySmall" style={styles.statSubText}>
                      Tugas Selesai
                    </AppText>
                  </View>
                </View>
              </View>

              {/* SECTION TITLE: DAFTAR TARGET */}
              <View style={styles.sectionTitleRow}>
                <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                  Daftar Target
                </AppText>
                <AppText variant="labelSmall" style={styles.sectionSortHint}>
                  Urutkan: Progres
                </AppText>
              </View>

              {/* TARGET CARDS LIST / EMPTY STATE */}
              {targets.length === 0 ? (
                <EmptyState
                  title={
                    selectedCategoryId
                      ? 'Belum ada target di kategori ini'
                      : 'Apa yang ingin kamu wujudkan?'
                  }
                  description="Mulai dari satu tujuan, misalnya menjadi AI Engineer. Pecah menjadi tahapan dan tugas yang jelas."
                  customIcon={
                    <Sparkles size={36} color="#6C6AE8" strokeWidth={2.4} />
                  }
                  actionTitle="Buat target"
                  onActionPress={() => setIsModalVisible(true)}
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

              {/* SETTINGS CATEGORY LINK */}
              <Pressable
                onPress={() => router.push('/settings')}
                style={styles.settingsLink}
              >
                <AppText variant="bodySmall" style={styles.settingsLinkText}>
                  ⚙️ Kelola kategori di Pengaturan
                </AppText>
              </Pressable>
            </>
          )
        )}
      </ScrollView>

      {/* MODAL TAMBAH TARGET */}
      <AddTargetModal
        visible={isModalVisible}
        categories={categories}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addTarget}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: '#F7F5EF',
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2E6',
    borderWidth: 1.5,
    borderColor: '#FF9B42',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DCF763',
    borderWidth: 2,
    borderColor: '#F7F5EF',
  },
  titleColumn: {
    gap: 1,
  },
  subtitleGreeting: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.6)',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 26,
  },
  addTargetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121417',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addTargetText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: space[2],
  },
  notice: {
    marginVertical: space[2],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
  },

  /* HERO CARD */
  heroCard: {
    backgroundColor: '#A6A4F9',
    borderRadius: 28,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#A6A4F9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 4,
  },
  flowerContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  heroEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(18, 20, 23, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#121417',
  },
  eyebrowText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#121417',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTextSection: {
    marginTop: 14,
    paddingRight: 60,
  },
  heroProgressTitle: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 32,
  },
  heroSubtext: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.8)',
    marginTop: 4,
    lineHeight: 18,
  },
  heroProgressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(18, 20, 23, 0.15)',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  heroProgressBar: {
    height: '100%',
    backgroundColor: '#DCF763',
    borderRadius: 999,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 4,
  },
  heroFooterText: {
    fontSize: 11,
    fontFamily: fontFamily.semibold,
    color: 'rgba(18, 20, 23, 0.75)',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#121417',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroActionBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },

  /* STATS GRID */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statCardPeach: {
    flex: 1,
    backgroundColor: '#FFE7D6',
    borderWidth: 1,
    borderColor: 'rgba(255, 155, 66, 0.25)',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabelTangerine: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(18, 20, 23, 0.65)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statIconCirclePeach: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 155, 66, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabelDark: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(18, 20, 23, 0.65)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  citronPillBadge: {
    backgroundColor: '#DCF763',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  citronBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  statNumberBox: {
    marginTop: 10,
  },
  statBigNumber: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 28,
  },
  statTotalTasksNumber: {
    fontSize: 16,
    fontFamily: fontFamily.semibold,
    color: 'rgba(18, 20, 23, 0.4)',
  },
  statSubText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.7)',
    marginTop: 2,
  },

  /* SECTION TITLE */
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  sectionHeadingBold: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  sectionSortHint: {
    fontSize: 11,
    fontFamily: fontFamily.semibold,
    color: 'rgba(18, 20, 23, 0.5)',
  },

  /* SETTINGS LINK */
  settingsLink: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLinkText: {
    fontSize: 12,
    fontFamily: fontFamily.semibold,
    color: 'rgba(18, 20, 23, 0.6)',
  },
});
