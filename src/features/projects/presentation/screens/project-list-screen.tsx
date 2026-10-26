import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { FolderKanban } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Card, Button, Banner, EmptyState } from '@/shared/ui';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from '../components/project-card';
import { AddProjectModal } from '../components/add-project-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

export const ProjectListScreen: React.FC = () => {
  const { projects, statusFilter, setStatusFilter, isLoading, error, refresh, addProject } = useProjects();
  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));
  const totalTasks = projects.reduce((sum, project) => sum + project.taskSummary.totalTasks, 0);
  const completedTasks = projects.reduce((sum, project) => sum + project.taskSummary.completedTasks, 0);
  const filterTabs = [
    { label: 'Semua', value: null }, { label: 'Aktif', value: 'ACTIVE' },
    { label: 'Rencana', value: 'PLANNING' }, { label: 'Ditunda', value: 'ON_HOLD' },
    { label: 'Selesai', value: 'COMPLETED' },
  ];

  return (
    <Screen>
      <ScreenHeader title="Proyek." subtitle="Ide menjadi sesuatu yang nyata"
        action={<Button title="+ Proyek" size="compact" onPress={() => setIsModalVisible(true)} />} />
      <Card padding={space[5]} style={styles.summary}>
        <AppText variant="labelMedium" color="onSecondaryContainer">RUANG UNTUK BERKARYA</AppText>
        <AppText variant="headlineMedium" color="onSecondaryContainer" style={styles.summaryTitle}>Bangun sesuatu, selangkah demi selangkah.</AppText>
        {!isLoading && !error && <AppText variant="bodySmall" color="onSecondaryContainer">{projects.length} proyek {statusFilter ? 'pada filter ini' : 'terdaftar'} · {completedTasks}/{totalTasks} tugas rencana selesai</AppText>}
        <AppText variant="bodySmall" color="onSecondaryContainer">Ringkasan mengikuti filter status. Progres rencana menghitung tugas selesai dari tugas yang tidak dibatalkan.</AppText>
      </Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filterTabs.map(tab => <Pressable key={tab.label} onPress={() => setStatusFilter(tab.value)}
          accessibilityRole="button" accessibilityState={{ selected: statusFilter === tab.value }}
          style={[styles.chip, statusFilter === tab.value && styles.selectedChip]}>
          <AppText variant="labelMedium" color={statusFilter === tab.value ? 'onPrimary' : 'onSurfaceVariant'}>{tab.label}</AppText>
        </Pressable>)}
      </ScrollView>
      {error && <Banner variant="error" message={error} actionText="Coba lagi" onActionPress={refresh} style={styles.notice} />}
      {isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><AppText color="onSurfaceVariant">Memuat proyek…</AppText></View> : !error && (
        projects.length === 0 ? <EmptyState title={statusFilter ? 'Belum ada proyek pada filter ini' : 'Wujudkan ide pertamamu'}
          description="Tentukan hasil yang ingin dibuat, lalu bagi pekerjaanmu menjadi tahapan dan tugas."
          customIcon={<FolderKanban size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Buat proyek" onActionPress={() => setIsModalVisible(true)} /> :
          projects.map(project => <ProjectCard key={project.id} project={project}
            onPress={() => router.push({ pathname: '/projects/[id]', params: { id: project.id } })} />)
      )}
      <AddProjectModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={addProject} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.secondaryContainer, marginBottom: space[5] },
  summaryTitle: { marginVertical: space[3] },
  filters: { gap: space[2], paddingBottom: space[5] },
  chip: { minHeight: 48, paddingVertical: space[3], paddingHorizontal: space[4], borderRadius: radius.md, backgroundColor: colors.surfaceContainerLowest, justifyContent: 'center' },
  selectedChip: { backgroundColor: colors.primary },
  notice: { marginBottom: space[4] },
  loading: { alignItems: 'center', gap: space[3], paddingVertical: space[10] },
});
