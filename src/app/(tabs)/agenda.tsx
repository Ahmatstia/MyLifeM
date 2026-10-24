import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { EmptyState } from '@/shared/ui/empty-state';
import { Button } from '@/shared/ui/button';
import { space } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { Plus, Calendar } from 'lucide-react-native';

export default function AgendaRoute() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="headlineLarge">Agenda & Jadwal</AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            Timeline kronologis harian dan to-do bebas jam
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
        title="Agenda Hari Ini Kosong"
        description="Jadwalkan kegiatan penting atau blok waktu kerja fokus agar harimu berjalan produktif."
        customIcon={<Calendar size={32} color={colors.onPrimaryContainer} />}
        actionTitle="Jadwalkan Acara Baru"
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
