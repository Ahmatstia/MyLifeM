import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  CircleUserRound,
  Sparkles,
  Lightbulb,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from '../components/project-card';
import { AddProjectModal } from '../components/add-project-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

export const ProjectListScreen: React.FC = () => {
  const {
    projects,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    refresh,
    addProject,
  } = useProjects();

  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));

  const totalTasks = projects.reduce((sum, project) => sum + project.taskSummary.totalTasks, 0);
  const completedTasks = projects.reduce((sum, project) => sum + project.taskSummary.completedTasks, 0);
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;

  const filterTabs: { label: string; value: any; hasDot?: boolean }[] = [
    { label: 'Semua', value: null },
    { label: 'Aktif', value: 'ACTIVE', hasDot: true },
    { label: 'Rencana', value: 'PLANNING' },
    { label: 'Ditunda', value: 'ON_HOLD' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <Screen style={styles.screenBg}>
      {/* TOP HEADER (Exact Stitch: Sandra Avatar + Citron Dot + "Halo, Sandra ✨" + "+ Proyek" Pill) */}
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
              Proyek.
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah Proyek Baru"
          style={styles.addProjectBtn}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <AppText variant="labelMedium" style={styles.addProjectText}>
            Proyek
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            <AppText color="onSurfaceVariant">Memuat proyek…</AppText>
          </View>
        ) : (
          !error && (
            <>
              {/* HERO CREATIVE BANNER (Neo-Playful Coral Peach Bento #FFE3D5) */}
              <View style={styles.heroCard}>
                {/* 3D Decorative Clay Flower Accent */}
                <View style={styles.flowerContainer} pointerEvents="none">
                  <Svg width={110} height={110} viewBox="0 0 100 100">
                    <Path
                      d="M50 8C52 28 72 28 72 50C72 72 52 72 50 92C48 72 28 72 28 50C28 28 48 28 50 8Z"
                      fill="#FFA858"
                    />
                    <Circle cx="50" cy="50" r="14" fill="#8F4E00" />
                    <Circle cx="46" cy="46" r="4" fill="#FFFFFF" fillOpacity={0.6} />
                  </Svg>
                </View>

                {/* Eyebrow Pill */}
                <View style={styles.heroEyebrow}>
                  <Sparkles size={13} color="#8F4E00" strokeWidth={2.4} />
                  <AppText variant="labelSmall" style={styles.eyebrowText}>
                    Ruang Untuk Berkarya
                  </AppText>
                </View>

                {/* Main Headline */}
                <View style={styles.heroTextSection}>
                  <AppText variant="headlineMedium" style={styles.heroHeadline}>
                    Bangun sesuatu, selangkah demi selangkah.
                  </AppText>
                  <AppText variant="bodySmall" style={styles.heroSubtext}>
                    {activeCount} Proyek Aktif • {completedTasks} dari {totalTasks} tugas selesai dikerjakan.
                  </AppText>
                </View>

                {/* Action button inside hero */}
                <View style={styles.heroActionRow}>
                  <Pressable
                    onPress={() => router.push('/targets')}
                    accessibilityRole="button"
                    accessibilityLabel="Lihat Target"
                    style={styles.heroActionBtn}
                  >
                    <AppText variant="labelSmall" style={styles.heroActionBtnText}>
                      Lihat Target
                    </AppText>
                    <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.4} />
                  </Pressable>
                </View>
              </View>

              {/* DUAL METRIC BENNY CARDS */}
              <View style={styles.statsGrid}>
                {/* Left Card: Warm Tangerine */}
                <View style={styles.statCardTangerine}>
                  <View style={styles.statHeader}>
                    <AppText variant="labelSmall" style={styles.statLabelTangerine}>
                      PROYEK AKTIF
                    </AppText>
                    <View style={styles.statIconCircleTangerine}>
                      <FolderKanban size={15} color="#8F4E00" strokeWidth={2.4} />
                    </View>
                  </View>
                  <View style={styles.statNumberBox}>
                    <AppText variant="headlineLarge" tabularNums style={styles.statBigNumber}>
                      {activeCount}
                    </AppText>
                    <AppText variant="bodySmall" style={styles.statSubText}>
                      Sedang Dikerjakan
                    </AppText>
                  </View>
                </View>

                {/* Right Card: Clean White Deliverable Card */}
                <View style={styles.statCardWhite}>
                  <View style={styles.statHeader}>
                    <AppText variant="labelSmall" style={styles.statLabelDark}>
                      DELIVERABLE
                    </AppText>
                    <View style={styles.statIconCircleLavender}>
                      <CheckCircle2 size={15} color="#5052ba" strokeWidth={2.4} />
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

              {/* HORIZONTAL STATUS FILTER CHIPS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterStrip}
              >
                {filterTabs.map((tab) => {
                  const isSelected = statusFilter === tab.value;
                  return (
                    <Pressable
                      key={tab.label}
                      onPress={() => setStatusFilter(tab.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                        pressed && styles.pressed,
                      ]}
                    >
                      {tab.value === null && (
                        <Sparkles
                          size={12}
                          color={isSelected ? '#FFFFFF' : 'rgba(18, 20, 23, 0.6)'}
                          strokeWidth={2.4}
                          style={styles.chipIcon}
                        />
                      )}
                      <AppText
                        variant="labelMedium"
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {tab.label}
                      </AppText>
                      {tab.hasDot && <View style={styles.chipGreenDot} />}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* PROJECT CARDS LIST / EMPTY STATE */}
              {projects.length === 0 ? (
                <EmptyState
                  title={
                    statusFilter
                      ? 'Belum ada proyek pada filter ini'
                      : 'Wujudkan ide pertamamu'
                  }
                  description="Tentukan hasil yang ingin dibuat, lalu bagi pekerjaanmu menjadi tahapan dan tugas."
                  customIcon={
                    <FolderKanban size={36} color="#8F4E00" strokeWidth={2.4} />
                  }
                  actionTitle="Buat proyek"
                  onActionPress={() => setIsModalVisible(true)}
                />
              ) : (
                projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onPress={() =>
                      router.push({
                        pathname: '/projects/[id]',
                        params: { id: project.id },
                      })
                    }
                  />
                ))
              )}

              {/* MOTIVATIONAL TIPS FOOTER CARD */}
              <View style={styles.tipBox}>
                <View style={styles.tipIconCircle}>
                  <Lightbulb size={18} color="#5052ba" strokeWidth={2.4} />
                </View>
                <View style={styles.tipTextCol}>
                  <AppText variant="labelMedium" style={styles.tipTitle}>
                    Tips Produktivitas
                  </AppText>
                  <AppText variant="bodySmall" style={styles.tipSubtitle}>
                    Pecah deliverable besar jadi sprint harian 45 menit.
                  </AppText>
                </View>
              </View>
            </>
          )
        )}
      </ScrollView>

      {/* MODAL TAMBAH PROYEK */}
      <AddProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addProject}
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
  addProjectBtn: {
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
  addProjectText: {
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

  /* HERO BANNER */
  heroCard: {
    backgroundColor: '#FFE3D5',
    borderRadius: 28,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#FF9E44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
  },
  flowerContainer: {
    position: 'absolute',
    bottom: -15,
    right: -15,
  },
  heroEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eyebrowText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#8F4E00',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTextSection: {
    marginTop: 12,
    paddingRight: 60,
  },
  heroHeadline: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#2D1609',
    lineHeight: 26,
  },
  heroSubtext: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(143, 78, 0, 0.9)',
    marginTop: 4,
    lineHeight: 16,
  },
  heroActionRow: {
    marginTop: 14,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121417',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: 'flex-start',
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
  statCardTangerine: {
    flex: 1,
    backgroundColor: '#FFA858',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#FFA858',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabelTangerine: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: 'rgba(45, 22, 9, 0.85)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statIconCircleTangerine: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statIconCircleLavender: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECEBFE',
    alignItems: 'center',
    justifyContent: 'center',
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

  /* FILTER STRIP */
  filterStrip: {
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  chipSelected: {
    backgroundColor: '#173C36',
    shadowColor: '#173C36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
  },
  chipIcon: {
    marginRight: 5,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: 'rgba(18, 20, 23, 0.75)',
  },
  chipGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  /* MOTIVATIONAL TIPS FOOTER */
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    marginTop: 4,
  },
  tipIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECEBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextCol: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  tipSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.65)',
    lineHeight: 15,
  },
});
