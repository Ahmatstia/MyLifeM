import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Target as TargetIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { useTargets } from '../hooks/use-targets';
import { CategoryFilterChips } from '../components/category-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { CategoryManagerModal } from '@/features/categories/presentation/components/category-manager-modal';
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
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));

  // Summary Metrics
  const totalTasks = targets.reduce((acc, curr) => acc + curr.totalTasks, 0);
  const totalCompleted = targets.reduce((acc, curr) => acc + curr.completedTasks, 0);
  const totalProgress =
    totalTasks > 0
      ? Math.round((totalCompleted / totalTasks) * 100)
      : targets.length > 0
        ? Math.round(
            targets.reduce((acc, curr) => acc + curr.progressPercent, 0) / targets.length
          )
        : 0;

  return (
    <Screen>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="headlineLarge" color="onSurface" style={styles.headerTitle}>
            Target Hidup
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Tujuan pengembangan diri yang terstruktur
          </AppText>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah target baru"
          style={({ pressed }) => [styles.addPillBtn, pressed && styles.pressed]}
        >
          <AppText variant="labelMedium" color="onPrimary">
            + Tambah
          </AppText>
        </Pressable>
      </View>

      {/* Summary Hero Card */}
      <Card variant="elevated" padding={space[4]} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <AppText variant="titleMedium" color="onSurface">
              Ikhtisar Target
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {targets.length} target terdaftar • {totalCompleted}/{totalTasks} tugas selesai
            </AppText>
          </View>
          <View style={styles.heroScoreCol}>
            <View style={styles.percentBadge}>
              <AppText variant="titleLarge" color="primary" tabularNums>
                {totalProgress}%
              </AppText>
            </View>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Progres Rata-rata
            </AppText>
          </View>
        </View>

        <ProgressBar
          progress={totalProgress}
          color={colors.primary}
          height={8}
          style={styles.heroProgress}
        />
      </Card>

      {/* Filter Chips per Kategori */}
      <CategoryFilterChips
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onManageCategories={() => setIsCategoryManagerVisible(true)}
      />

      {/* Error state */}
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
            Memuat target hidupmu...
          </AppText>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && targets.length === 0 && (
        <EmptyState
          title={
            selectedCategoryId
              ? 'Belum Ada Target di Kategori Ini'
              : 'Mulai Petualangan Hidupmu'
          }
          description="Tetapkan target pertamamu sekarang. Target akan dipecah menjadi tahapan dan tugas yang jelas untuk dieksekusi."
          customIcon={<TargetIcon size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Buat Target Pertama"
          onActionPress={() => setIsModalVisible(true)}
          style={styles.emptyStateMargin}
        />
      )}

      {/* List of Target Cards */}
      {!isLoading &&
        targets.map((target) => (
          <TargetCard
            key={target.id}
            target={target}
            onPress={() => router.push(`/targets/${target.id}` as any)}
          />
        ))}

      {/* Modal Form Tambah Target */}
      <AddTargetModal
        visible={isModalVisible}
        categories={categories}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addTarget}
        onOpenCategoryManager={() => setIsCategoryManagerVisible(true)}
      />

      {/* Modal Kelola Kategori */}
      <CategoryManagerModal
        visible={isCategoryManagerVisible}
        onClose={() => {
          setIsCategoryManagerVisible(false);
          refresh();
        }}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
        }}
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
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    marginBottom: 2,
  },
  heroProgress: {
    marginTop: space[1],
  },
  loadingBox: {
    paddingVertical: space[8],
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  loadingText: {
    marginTop: space[1],
  },
  bannerMargin: {
    marginBottom: space[3],
  },
  emptyStateMargin: {
    marginTop: space[4],
  },
  pressed: {
    opacity: 0.8,
  },
});
