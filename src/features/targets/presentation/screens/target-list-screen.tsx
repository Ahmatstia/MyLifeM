import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Target as TargetIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';
import { Screen, ScreenHeader, AppText, Card, Button, Banner, EmptyState, ProgressBar } from '@/shared/ui';
import { useTargets } from '../hooks/use-targets';
import { CategoryFilterChips } from '../components/category-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

export const TargetListScreen: React.FC = () => {
  const { targets, categories, selectedCategoryId, setSelectedCategoryId, isLoading, error, refresh, addTarget } = useTargets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));
  const totalTasks = targets.reduce((sum, target) => sum + target.totalTasks, 0);
  const completedTasks = targets.reduce((sum, target) => sum + target.completedTasks, 0);
  const progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  const selectedCategory = categories.find(category => category.id === selectedCategoryId);

  return (
    <Screen>
      <ScreenHeader title="Target Hidup." subtitle="Untuk hidup yang kamu pilih"
        action={<Button title="+ Target" onPress={() => setIsModalVisible(true)} size="compact" />} />
      <AppText variant="headlineSmall" style={styles.intro}>Tujuan besar, langkah yang bisa dijalani.</AppText>
      <CategoryFilterChips categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

      {error && <Banner variant="error" message={error} actionText="Coba lagi" onActionPress={refresh} style={styles.notice} />}
      {isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><AppText color="onSurfaceVariant">Memuat targetmu…</AppText></View> : !error && (
        <>
          {targets.length > 0 && <Card variant="highlight" padding={space[5]} style={styles.summary}>
            <AppText variant="labelMedium" color="onPrimaryContainer">{selectedCategory?.name || 'Semua kategori'} · {targets.length} target</AppText>
            <View style={styles.metric}>
              <AppText variant="headlineLarge" color="onPrimaryContainer" tabularNums>{progress}%</AppText>
              <AppText variant="bodySmall" color="onPrimaryContainer" style={styles.metricLabel}>{completedTasks} dari {totalTasks} tugas rencana selesai</AppText>
            </View>
            <ProgressBar progress={progress} />
          </Card>}
          {targets.length === 0 ? <EmptyState
            title={selectedCategoryId ? 'Belum ada target di kategori ini' : 'Apa yang ingin kamu wujudkan?'}
            description="Mulai dari satu tujuan, misalnya menjadi AI Engineer. Pecah menjadi tahapan dan tugas yang jelas."
            customIcon={<TargetIcon size={32} color={colors.onPrimaryContainer} />}
            actionTitle="Buat target" onActionPress={() => setIsModalVisible(true)} /> :
            targets.map(target => <TargetCard key={target.id} target={target} onPress={() => router.push({ pathname: '/targets/[id]', params: { id: target.id } })} />)}
        </>
      )}
      <Button title="Kelola kategori di Pengaturan" variant="text" onPress={() => router.push('/settings')} style={styles.settingsLink} />
      <AddTargetModal visible={isModalVisible} categories={categories} onClose={() => setIsModalVisible(false)} onSubmit={addTarget} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  intro: { marginBottom: space[2] },
  summary: { marginBottom: space[5] },
  metric: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3], marginVertical: space[3] },
  metricLabel: { flex: 1, minWidth: 140 },
  notice: { marginVertical: space[3] },
  loading: { alignItems: 'center', gap: space[3], paddingVertical: space[10] },
  settingsLink: { marginTop: space[4], alignSelf: 'flex-start' },
});
