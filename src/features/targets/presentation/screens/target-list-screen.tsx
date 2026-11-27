import { backOrHome } from '@/shared/utils/back-or-home';
import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plus, Flag } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, radius, space, touchTarget } from '@/theme/tokens';
import {
  Screen,
  FormScreenHeader,
  AppText,
  Banner,
  EmptyState,
  ProgressBar,
} from '@/shared/ui';
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
      style={styles.screenBg}
      floatingAction={
        <Pressable
          onPress={() => router.push('/targets/new')}
          accessibilityRole="button"
          accessibilityLabel="Tambah Target Baru"
          style={({ pressed }) => [
            styles.fabSquare,
            pressed && styles.fabSquarePressed,
          ]}
        >
          <Plus size={space[6]} color={colors.onHighlight} />
        </Pressable>
      }
      overlay={
        <>
          <AddTargetModal
            visible={isModalVisible}
            categories={categories}
            onClose={() => setIsModalVisible(false)}
            onSubmit={addTarget}
          />
        </>
      }
    >
      <FormScreenHeader title="Target hidup" onBack={backOrHome} />
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
        <View style={styles.loading} accessibilityState={{ busy: true }}>
          <AppText variant="bodyMedium" color="onSurfaceVariant">Memuat target…</AppText>
          <View style={styles.placeholderLong} />
          <View style={styles.placeholderShort} />
        </View>
      ) : (
        !error && (
          <>
            {totalTasks > 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <AppText variant="titleMedium" accessibilityRole="header">Progres tugas</AppText>
                  <AppText variant="titleMedium" color="primary" tabularNums>{progress}%</AppText>
                </View>
                <ProgressBar progress={progress} height={space[1]} />
                <AppText variant="bodyMedium" color="onSurfaceVariant" tabularNums>
                  {completedTasks} dari {totalTasks} tugas selesai
                  {totalEstimatedHours > 0 ? `, estimasi ${totalEstimatedHours} jam` : ''}
                </AppText>
              </View>
            )}

            {targets.length === 0 ? (
              <EmptyState
                title={selectedCategoryId ? 'Belum ada target di kategori ini' : 'Belum ada target'}
                description="Buat satu target, lalu tambahkan tahap pertamanya."
                customIcon={<Flag size={space[6]} color={colors.primary} />}
                actionTitle="Buat target"
                onActionPress={() => router.push('/targets/new')}
              />
            ) : (
              <View style={styles.trailListWrap}>
                {targets.map((target) => (
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
  screenBg: { backgroundColor: colors.background },
  heading: { fontFamily: fontFamily.display },
  notice: { marginBottom: space[2] },
  loading: { gap: space[3], paddingVertical: space[4] },
  placeholderLong: { width: '70%', height: space[3], backgroundColor: colors.surfaceContainer },
  placeholderShort: { width: '45%', height: space[2], backgroundColor: colors.surfaceContainer },
  summary: { padding: space[4], gap: space[2], backgroundColor: colors.folderMint, borderRadius: radius.xl },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: space[2] },
  trailListWrap: { gap: space[4] },
  fabSquare: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.md,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabSquarePressed: { backgroundColor: colors.sprout.sunDeep },
});
