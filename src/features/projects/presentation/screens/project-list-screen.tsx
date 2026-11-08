import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plus, FolderKanban, CheckCircle2, Clock, Star } from 'lucide-react-native';
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
} from '@/shared/ui';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from '../components/project-card';
import { AddProjectModal } from '../components/add-project-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

const s = colors.sprout;

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
  useOpenAddFromParam(() => router.push('/projects/new'));

  const totalTasks = projects.reduce((sum, project) => sum + project.taskSummary.totalTasks, 0);
  const completedTasks = projects.reduce(
    (sum, project) => sum + project.taskSummary.completedTasks,
    0
  );
  const totalEstimatedHours = projects.reduce(
    (sum, project) => sum + (project.taskSummary.totalEstimatedHours || 0),
    0
  );

  const filterTabs: { label: string; value: any }[] = [
    { label: 'Semua', value: null },
    { label: 'Aktif', value: 'ACTIVE' },
    { label: 'Rencana', value: 'PLANNING' },
    { label: 'Ditunda', value: 'ON_HOLD' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <Screen
      scrollable
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          <View style={styles.floatingFabContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => router.push('/projects/new')}
              accessibilityRole="button"
              accessibilityLabel="Tambah Proyek Baru"
              style={({ pressed }) => [
                styles.fabSquare,
                pressed && styles.fabSquarePressed,
              ]}
            >
              <Plus size={24} color={s.ink} strokeWidth={2.8} />
            </Pressable>
          </View>

          <AddProjectModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSubmit={addProject}
          />
        </>
      }
    >
      <WaveBackdrop variant="home" height={285} />

      <View style={styles.header}>
        <AppText variant="headlineMedium" style={styles.headerTitle}>
          Proyek Kerja
        </AppText>
      </View>

      {/* Segmented Status Filter Bar */}
        <View style={styles.pillFilterContainer}>
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
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <AppText
                    variant="labelMedium"
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {tab.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

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
            <AppText color="onSurfaceVariant">Memuat proyek…</AppText>
          </View>
        ) : (
          !error && (
            <>
              {/* 3-Column Ringkasan Proyek Card */}
              <SoftCard style={styles.ringkasanCard}>
                <AppText style={styles.ringkasanHeading}>Ringkasan Proyek</AppText>
                <View style={styles.statsColumnsRow}>
                  <View style={styles.statCol}>
                    <View style={[styles.statIconCircle, { backgroundColor: s.leafSoft }]}>
                      <CheckCircle2 size={16} color={s.forest} strokeWidth={2.5} />
                    </View>
                    <AppText style={styles.statValue} tabularNums>
                      {completedTasks}/{totalTasks}
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
                    <AppText style={styles.statLabel}>Waktu Kerja</AppText>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statCol}>
                    <View style={[styles.statIconCircle, { backgroundColor: s.sunSoft }]}>
                      <Star size={16} color="#B87E00" fill={s.sun} strokeWidth={2.2} />
                    </View>
                    <AppText style={styles.statValue} tabularNums>
                      {projects.length}
                    </AppText>
                    <AppText style={styles.statLabel}>Total Proyek</AppText>
                  </View>
                </View>
              </SoftCard>

              <SectionTitle
                title="Daftar Proyek"
                hint={`${projects.length} proyek`}
              />

              {projects.length === 0 ? (
                <EmptyState
                  title={
                    statusFilter
                      ? 'Belum ada proyek pada filter ini'
                      : 'Wujudkan ide pertamamu'
                  }
                  description="Tentukan hasil yang ingin dibuat, lalu bagi pekerjaanmu menjadi tahapan dan tugas."
                  customIcon={<FolderKanban size={30} color={s.forest} strokeWidth={2.2} />}
                  actionTitle="Buat proyek"
                  onActionPress={() => router.push('/projects/new')}
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
  pillFilterContainer: {
    backgroundColor: '#F1EBDC',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E7DFCC',
  },
  filterStrip: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  chipSelected: {
    backgroundColor: s.forest,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamily.semibold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  chipTextUnselected: {
    color: s.inkMuted,
  },
  notice: {
    marginVertical: space[2],
  },
  loading: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[10],
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
  floatingFabContainer: {
    position: 'absolute',
    right: space[4],
    bottom: space[4],
    zIndex: 20,
  },
  fabSquare: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: s.sun,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B58105',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fabSquarePressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: s.sunDeep,
  },
});
