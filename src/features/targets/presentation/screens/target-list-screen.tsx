import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles, ArrowUpRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/tokens';
import {
  Screen,
  AppText,
  Banner,
  EmptyState,
  WaveBackdrop,
} from '@/shared/ui';
import { useTargets } from '../hooks/use-targets';
import { CategoryFilterChips } from '../components/category-filter-chips';
import { TargetCard } from '../components/target-card';
import { AddTargetModal } from '../components/add-target-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

const s = colors.sprout;

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
      withBottomPadding={false}
      style={styles.screenBg}
      contentContainerStyle={styles.scrollContent}
      overlay={
        <>
          <View style={styles.floatingFabContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => router.push('/targets/new')}
              accessibilityRole="button"
              accessibilityLabel="Tambah Target Baru"
              style={({ pressed }) => [
                styles.fabSquare,
                pressed && styles.fabSquarePressed,
              ]}
            >
              <Plus size={24} color={s.ink} strokeWidth={2.8} />
            </Pressable>
          </View>

          <AddTargetModal
            visible={isModalVisible}
            categories={categories}
            onClose={() => setIsModalVisible(false)}
            onSubmit={addTarget}
          />
        </>
      }
    >
      <WaveBackdrop variant="home" height={285} />

      {/* Header over Sprout Home Wave */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <AppText style={styles.eyebrow}>MYLIFE / ARAH & TUJUAN</AppText>
          <AppText variant="headlineMedium" style={styles.headerTitle}>
            Target Hidup
          </AppText>
          <AppText style={styles.headerSubtitle}>
            Hal besar, langkah yang terukur.
          </AppText>
        </View>
      </View>

      {/* Segmented Category Pill Bar */}
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
        <View style={styles.loading}>
          <ActivityIndicator color={s.forest} size="large" />
          <AppText color="onSurfaceVariant">Memuat targetmu…</AppText>
        </View>
      ) : (
        !error && (
          <>
            <View style={styles.progressLedger}>
              <View style={styles.progressCopy}>
                <AppText style={styles.eyebrow}>PROGRES TARGET</AppText>
                <AppText style={styles.progressCaption}>Tugas yang terselesaikan</AppText>
                <AppText style={styles.progressFraction}>{completedTasks} dari {totalTasks} langkah tuntas</AppText>
              </View>
              <AppText style={styles.progressNumber} tabularNums>{progress}%</AppText>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
            </View>
            <View style={styles.summaryLine}>
              <AppText style={styles.summaryText}>{targets.length} target</AppText>
              <AppText style={styles.summaryText}>{totalEstimatedHours} jam estimasi</AppText>
              <ArrowUpRight size={16} color={s.forest} />
            </View>
            <View style={styles.listHeading}>
              <AppText style={styles.listTitle}>Tujuanmu</AppText>
              <AppText style={styles.listHint}>Pilih untuk menyusun langkah</AppText>
            </View>

            {targets.length === 0 ? (
              <EmptyState
                title={
                  selectedCategoryId
                    ? 'Belum ada target di kategori ini'
                    : 'Apa yang ingin kamu wujudkan?'
                }
                description="Mulai dari satu tujuan, misalnya menjadi AI Engineer. Pecah menjadi tahapan dan tugas yang jelas."
                customIcon={<Sparkles size={30} color={s.forest} strokeWidth={2} />}
                actionTitle="Buat target"
                onActionPress={() => router.push('/targets/new')}
              />
            ) : (
              <View style={styles.trailListWrap}>
                {targets.map((target, index) => (
                  <TargetCard
                    key={target.id}
                    target={target}
                    index={index}
                    isLast={index === targets.length - 1}
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
  screenBg: { backgroundColor: s.cream },
  scrollContent: { paddingBottom: 100, gap: 12 },
  header: { paddingTop: 20, paddingBottom: 8 },
  headerTextCol: { gap: 4 },
  eyebrow: { fontFamily: fontFamily.bold, fontSize: 10, lineHeight: 16, letterSpacing: 1.4, color: s.inkMuted },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 36, letterSpacing: -1, color: s.ink },
  headerSubtitle: { fontSize: 12, color: s.inkMuted },
  notice: { marginBottom: 8 },
  loading: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  progressLedger: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderTopLeftRadius: 4, backgroundColor: s.sunSoft },
  progressCopy: { flex: 1, minWidth: 130, gap: 4 },
  progressCaption: { fontFamily: fontFamily.semibold, fontSize: 14, color: s.ink },
  progressFraction: { fontSize: 11, color: s.inkMuted },
  progressNumber: { fontFamily: fontFamily.bold, fontSize: 36, lineHeight: 46, letterSpacing: -1.5, color: s.forest },
  progressTrack: { width: '100%', height: 4, backgroundColor: '#D6DFBB', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: s.forest },
  summaryLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 12, color: s.inkMuted },
  listHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginTop: 8 },
  listTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: s.ink },
  listHint: { fontSize: 11, color: s.inkMuted },
  trailListWrap: { gap: 10 },
  floatingFabContainer: { position: 'absolute', right: 16, bottom: 16, zIndex: 20 },
  fabSquare: { width: 48, height: 48, borderRadius: 14, backgroundColor: s.sun, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: s.forest },
  fabSquarePressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
});
