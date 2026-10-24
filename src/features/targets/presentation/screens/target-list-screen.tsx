import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Plus, Compass, Target as TargetIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { useTargets } from '../hooks/use-targets';
import { PillarFilterChips } from '../components/pillar-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { calculateTargetProgress } from '../../domain/entities/target.entity';

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
          <AppText variant="headlineLarge" color="onSurface">
            Target Hidup
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Kompas utama & arah pencapaian masa depanmu
          </AppText>
        </View>

        <Button
          title="Tambah"
          variant="filled"
          size="compact"
          leftIcon={<Plus size={16} color={colors.onPrimary} />}
          onPress={() => setIsModalVisible(true)}
        />
      </View>

      {/* Summary Hero Card */}
      <Card variant="highlight" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroIconBox}>
            <Compass size={24} color={colors.primary} />
          </View>
          <View style={styles.heroTextCol}>
            <AppText variant="titleMedium">Ikhtisar Target</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {activeTargets.length} target aktif berjalan
            </AppText>
          </View>
          <View style={styles.heroScoreCol}>
            <AppText variant="headlineSmall" color="primary" tabularNums>
              {totalProgress}%
            </AppText>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Rata-rata
            </AppText>
          </View>
        </View>

        <ProgressBar
          progress={totalProgress}
          color={colors.primary}
          height={6}
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
  heroCard: {
    marginBottom: space[2],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space[3],
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[3],
  },
  heroTextCol: {
    flex: 1,
  },
  heroScoreCol: {
    alignItems: 'flex-end',
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
});
