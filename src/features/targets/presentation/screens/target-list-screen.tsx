import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
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
import { PillarFilterChips } from '../components/pillar-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { calculateTargetProgress } from '../../domain/entities/target.entity';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

export const TargetListScreen: React.FC = () => {
  const {
    targets,
    pillars,
    selectedPillarId,
    setSelectedPillarId,
    isLoading,
    error,
    refresh,
    addTarget,
    updateProgress,
  } = useTargets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));

  // Calculate high-level summary metrics
  const activeTargets = targets.filter((t) => t.status === 'ACTIVE');
  const totalProgress =
    targets.length > 0
      ? Math.round(
          targets.reduce((acc, curr) => acc + calculateTargetProgress(curr), 0) /
            targets.length
        )
      : 0;

  const getPillarForTarget = (pillarId: string) =>
    pillars.find((p) => p.id === pillarId);

  return (
    <Screen>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="headlineLarge" color="onSurface" style={styles.headerTitle}>
            Target Hidup
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Arah dan pencapaian masa depanmu
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
              {activeTargets.length} target aktif berjalan
            </AppText>
          </View>
          <View style={styles.heroScoreCol}>
            <View style={styles.percentBadge}>
              <AppText variant="titleLarge" color="primary" tabularNums>
                {totalProgress}%
              </AppText>
            </View>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Rata-rata
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

      {/* Filter Chips per Pilar Kehidupan */}
      <PillarFilterChips
        pillars={pillars}
        selectedPillarId={selectedPillarId}
        onSelectPillar={setSelectedPillarId}
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
            selectedPillarId
              ? 'Belum Ada Target di Pilar Ini'
              : 'Mulai Petualangan Hidupmu'
          }
          description="Tetapkan target pertamamu sekarang. Target akan menjadi panduan untuk seluruh proyek dan fokus harianmu."
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
            pillar={getPillarForTarget(target.pillarId)}
            onIncrement={() => updateProgress(target.id, target.currentValue + 1)}
          />
        ))}

      {/* Modal Form Tambah Target */}
      <AddTargetModal
        visible={isModalVisible}
        pillars={pillars}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addTarget}
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
  bannerMargin: {
    marginVertical: space[3],
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[12],
  },
  loadingText: {
    marginTop: space[3],
  },
  emptyStateMargin: {
    marginTop: space[4],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
