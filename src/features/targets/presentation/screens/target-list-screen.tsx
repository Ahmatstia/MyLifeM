import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, fontFamily } from '@/theme/tokens';
import { Screen, AppText, Banner, EmptyState } from '@/shared/ui';
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
  useOpenAddFromParam(() => setIsModalVisible(true));

  const totalTasks = targets.reduce((sum, target) => sum + target.totalTasks, 0);
  const completedTasks = targets.reduce((sum, target) => sum + target.completedTasks, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Screen scrollable={false} withBottomPadding={false} style={styles.screenBg}>
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <AppText variant="headlineMedium" style={styles.headerTitle}>Target</AppText>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah Target Baru"
          style={({ pressed }) => [
            styles.addTargetBtn,
            pressed && styles.addTargetBtnPressed,
          ]}
        >
          <Plus size={15} color="#FAF5EB" strokeWidth={3} />
          <AppText variant="labelMedium" style={styles.addTargetText}>
            Target Baru
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HORIZONTAL CATEGORY FILTER CHIPS */}
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
            <ActivityIndicator color={colors.primary} size="large" />
            <AppText color="onSurfaceVariant">Memuat targetmu…</AppText>
          </View>
        ) : (
          !error && (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryCopy}>
                  <AppText variant="labelMedium" color="onSurfaceVariant">PROGRES RENCANA</AppText>
                  <AppText variant="bodySmall" color="onSurfaceVariant">
                    {completedTasks} dari {totalTasks} tugas · {targets.length} target
                  </AppText>
                </View>
                <AppText variant="titleLarge" style={styles.summaryPercent} tabularNums>
                  {totalTasks ? `${progress}%` : 'Belum ada rencana'}
                </AppText>
              </View>

              {/* SECTION TITLE: DAFTAR TARGET */}
              <View style={styles.sectionTitleRow}>
                <AppText variant="titleMedium" style={styles.sectionHeadingBold}>
                  Daftar Target
                </AppText>
                <AppText variant="labelSmall" style={styles.sectionSortHint}>
                  {targets.length} total
                </AppText>
              </View>

              {/* TARGET CARDS LIST / EMPTY STATE */}
              {targets.length === 0 ? (
                <EmptyState
                  title={
                    selectedCategoryId
                      ? 'Belum ada target di kategori ini'
                      : 'Apa yang ingin kamu wujudkan?'
                  }
                  description="Mulai dari satu tujuan, misalnya menjadi AI Engineer. Pecah menjadi tahapan dan tugas yang jelas."
                  customIcon={
                    <Sparkles size={30} color={colors.primary} strokeWidth={2} />
                  }
                  actionTitle="Buat target"
                  onActionPress={() => setIsModalVisible(true)}
                />
              ) : (
                targets.map((target) => (
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
                ))
              )}
            </>
          )
        )}
      </ScrollView>

      {/* MODAL TAMBAH TARGET */}
      <AddTargetModal
        visible={isModalVisible}
        categories={categories}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addTarget}
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
  addTargetBtn: {
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
  addTargetBtnPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
  },
  addTargetText: { color: '#FAF5EB', fontFamily: fontFamily.bold, fontSize: 12 },
  scrollContent: { paddingBottom: 90, gap: space[3] },
  notice: { marginVertical: space[2] },
  loading: { alignItems: 'center', gap: space[3], paddingVertical: space[10] },
  summaryCard: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: 'rgba(232, 168, 56, 0.45)',
    borderRadius: 14,
  },
  summaryCopy: { gap: 3 },
  summaryPercent: { color: '#805600', fontFamily: fontFamily.bold, fontSize: 18 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[2], marginBottom: space[1] },
  sectionHeadingBold: { fontSize: 17, fontFamily: fontFamily.bold, color: '#1E1E2E' },
  sectionSortHint: { fontSize: 12, fontFamily: fontFamily.medium, color: '#504535' },
  settingsLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  settingsLinkText: { fontSize: 12, fontFamily: fontFamily.medium, color: '#805600' },
});