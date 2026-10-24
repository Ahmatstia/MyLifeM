import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { EmptyState } from '@/shared/ui/empty-state';
import { Button } from '@/shared/ui/button';
import { space } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { Plus, FolderKanban } from 'lucide-react-native';

export default function ProjectsRoute() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="headlineLarge">Proyek Eksekusi</AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Wadah eksekusi terstruktur pendukung Target hidupmu
          </AppText>
        </View>

        <Button
          title="Tambah"
          variant="filled"
          size="compact"
          leftIcon={<Plus size={16} color={colors.onPrimary} />}
          onPress={() => {}}
        />
      </View>

      <EmptyState
        title="Belum Ada Proyek Aktif"
        description="Pecah Target besarmu menjadi babak kerja (milestone) dan tugas konkret di dalam Proyek."
        customIcon={<FolderKanban size={32} color={colors.onPrimaryContainer} />}
        actionTitle="Buat Proyek Pertama"
        onActionPress={() => {}}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
    marginBottom: space[6],
  },
});
