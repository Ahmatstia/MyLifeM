import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { FolderKanban } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius, elevation } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressBar } from '@/shared/ui/progress-bar';
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

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const totalTasksCount = projects.reduce(
    (acc, curr) => acc + curr.taskSummary.totalTasks,
    0
  );
  const completedTasksCount = projects.reduce(
    (acc, curr) => acc + curr.taskSummary.completedTasks,
    0
  );
  const averageProgress =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  const filterTabs = [
    { label: 'Semua', value: null },
    { label: 'Aktif', value: 'ACTIVE' },
    { label: 'Rencana', value: 'PLANNING' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="headlineLarge" color="onSurface" style={styles.headerTitle}>
            Proyek Eksekusi
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Wadah kerja nyata untuk target hidupmu
          </AppText>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah proyek baru"
          style={({ pressed }) => [styles.addPillBtn, pressed && styles.pressed]}
        >
          <AppText variant="labelMedium" color="onPrimary">
            + Tambah
          </AppText>
        </Pressable>
      </View>

      {/* Hero Summary Card */}
      <Card variant="elevated" padding={space[4]} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <AppText variant="titleMedium" color="onSurface">
              Ikhtisar Eksekusi
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {activeProjects.length} proyek aktif • {completedTasksCount}/{totalTasksCount} tugas
            </AppText>
          </View>
          <View style={styles.heroScoreCol}>
            <View style={styles.percentBadge}>
              <AppText variant="titleLarge" color="primary" tabularNums>
                {averageProgress}%
              </AppText>
            </View>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Progres
            </AppText>
          </View>
        </View>

        <ProgressBar
          progress={averageProgress}
          color={colors.primary}
          height={8}
          style={styles.heroProgress}
        />
      </Card>

      {/* Status Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <Pressable
                key={tab.label}
                onPress={() => setStatusFilter(tab.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipSelected : styles.filterChipUnselected,
                ]}
              >
                <AppText
                  variant="labelMedium"
                  color={isSelected ? 'onPrimary' : 'onSurfaceVariant'}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Error Banner */}
      {error && (
        <Banner
          variant="error"
          message={error}
          actionText="Coba Lagi"
          onActionPress={refresh}
          style={styles.bannerMargin}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.loadingText}>
            Memuat daftar proyek...
          </AppText>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <EmptyState
          title={statusFilter ? 'Tidak Ada Proyek Pada Kategori Ini' : 'Belum Ada Proyek Aktif'}
          description="Pecah sasaran hidupmu menjadi proyek nyata dengan babak kerja (milestone) dan tugas-tugas konkret."
          customIcon={<FolderKanban size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Buat Proyek Pertama"
          onActionPress={() => setIsModalVisible(true)}
          style={styles.emptyMargin}
        />
      )}

      {/* Projects List */}
      {!isLoading &&
        projects.map((proj) => (
          <ProjectCard
            key={proj.id}
            project={proj}
            onPress={() => router.push(`/projects/${proj.id}` as any)}
          />
        ))}

      {/* Modal Tambah Proyek */}
      <AddProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addProject}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[4],
  },
  headerTitle: {
    letterSpacing: -0.5,
  },
  addPillBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
  },
  heroCard: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  heroTextCol: {
    flex: 1,
  },
  heroScoreCol: {
    alignItems: 'flex-end',
  },
  percentBadge: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    marginBottom: 2,
  },
  heroProgress: {
    marginTop: space[1],
  },
  filtersContainer: {
    marginBottom: space[3],
  },
  filterScroll: {
    gap: space[2],
    paddingHorizontal: 2,
  },
  filterChip: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    ...elevation.level1,
  },
  filterChipUnselected: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  bannerMargin: {
    marginVertical: space[2],
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[10],
  },
  loadingText: {
    marginTop: space[2],
  },
  emptyMargin: {
    marginTop: space[4],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
