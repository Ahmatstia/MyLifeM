import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plus, FolderKanban, Sparkles } from 'lucide-react-native';
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
  useOpenAddFromParam(() => router.push('/projects/new'));

  const totalTasks = projects.reduce((sum, project) => sum + project.taskSummary.totalTasks, 0);
  const completedTasks = projects.reduce((sum, project) => sum + project.taskSummary.completedTasks, 0);

  const filterTabs: { label: string; value: any }[] = [
    { label: 'Semua', value: null },
    { label: 'Aktif', value: 'ACTIVE' },
    { label: 'Rencana', value: 'PLANNING' },
    { label: 'Ditunda', value: 'ON_HOLD' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <AppText variant="headlineMedium" style={styles.headerTitle}>Proyek</AppText>
        </View>

        <Pressable
          onPress={() => router.push('/projects/new')}
          accessibilityRole="button"
          accessibilityLabel="Tambah Proyek Baru"
          style={({ pressed }) => [
            styles.addProjectBtn,
            pressed && styles.addProjectBtnPressed,
          ]}
        >
          <Plus size={15} color="#FAF5EB" strokeWidth={3} />
          <AppText variant="labelMedium" style={styles.addProjectText}>
            Proyek Baru
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
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}><FolderKanban size={18} color={colors.primary} /></View>
                <View style={styles.summaryCopy}>
                  <AppText variant="labelMedium" color="onSurfaceVariant">{projects.length} proyek ditampilkan</AppText>
                  <AppText variant="bodySmall" color="onSurfaceVariant">{completedTasks} dari {totalTasks} tugas selesai</AppText>
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
                          color="#1E1E2E"
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
                    <FolderKanban size={30} color={colors.primary} strokeWidth={2.2} />
                  }
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
  screenBg: { backgroundColor: '#FCF8FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space[2], paddingBottom: space[2] },
  titleColumn: { gap: 4 },
  badgeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFEBD9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  badgeText: { fontSize: 11, fontFamily: fontFamily.bold, color: '#A23D28', letterSpacing: 0.6 },
  headerTitle: { fontSize: 22, lineHeight: 28, fontFamily: fontFamily.bold, color: '#1E1E2E' },
  addProjectBtn: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E06B52',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  addProjectBtnPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
  addProjectText: { color: '#FAF5EB', fontFamily: fontFamily.bold, fontSize: 12 },
  scrollContent: { paddingBottom: 90, gap: space[3] },
  summaryCard: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.45)',
    borderRadius: 14,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF5EB',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: { gap: 3 },
  notice: { marginVertical: space[2] },
  loading: { alignItems: 'center', gap: space[3], paddingVertical: space[10] },
  filterStrip: { flexDirection: 'row', gap: space[2], paddingVertical: 4 },
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
  },
  chipSelected: {
    backgroundColor: '#E8A838', // Custard Gold
    boxShadow: '2px 2px 0px #1E1E2E',
  },
  chipUnselected: {
    backgroundColor: '#FAF5EB', // Warm Paper
  },
  chipIcon: { marginRight: 2 },
  chipText: { fontSize: 12, fontFamily: fontFamily.bold },
  chipTextSelected: { color: '#1E1E2E' },
  chipTextUnselected: { color: '#504535' },
  chipGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#76A284' },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
});
