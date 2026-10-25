import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Banner } from '@/shared/ui/banner';
import { EmptyState } from '@/shared/ui/empty-state';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { useAgenda } from '../hooks/use-agenda';
import { DateStripHeader } from '../components/date-strip-header';
import { TimelineEventCard } from '../components/timeline-event-card';
import { AddEventModal } from '../components/add-event-modal';
import { useOpenAddFromParam } from '@/shared/hooks/use-open-add-from-param';

export const AgendaScreen: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    error,
    isSelectedDateToday,
    refresh,
    addEvent,
    toggleEvent,
    removeEvent,
  } = useAgenda();

  const [isModalVisible, setIsModalVisible] = useState(false);
  useOpenAddFromParam(() => setIsModalVisible(true));

  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.isCompleted).length;
  const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
  const allDayCount = events.filter((e) => e.isAllDay).length;
  const timedCount = totalEvents - allDayCount;

  // Format date readable (e.g., "Sabtu, 24 Oktober 2026")
  const formattedDateTitle = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  const handleDeleteEvent = (id: string, title: string) => {
    Alert.alert(
      'Hapus Agenda',
      `Apakah kamu yakin ingin menghapus "${title}" dari jadwal?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeEvent(id),
        },
      ]
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <AppText variant="headlineLarge" color="onSurface" style={styles.headerTitle}>
            Agenda & Jadwal
          </AppText>
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {isSelectedDateToday ? 'Jadwal hari ini • ' : ''}{formattedDateTitle}
          </AppText>
        </View>

        <Pressable
          onPress={() => setIsModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Tambah agenda baru"
          style={({ pressed }) => [styles.addPillBtn, pressed && styles.pressed]}
        >
          <AppText variant="labelMedium" color="onPrimary">
            + Tambah
          </AppText>
        </Pressable>
      </View>

      {/* Date Strip Header */}
      <DateStripHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        style={styles.dateStrip}
      />

      {/* Summary Card */}
      <Card variant="elevated" padding={space[4]} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <AppText variant="titleMedium" color="onSurface">
              Ikhtisar Agenda
            </AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {totalEvents} kegiatan ({timedCount} berwaktu, {allDayCount} bebas jam)
            </AppText>
          </View>
          <View style={styles.heroScoreCol}>
            <View style={styles.percentBadge}>
              <AppText variant="titleLarge" color="primary" tabularNums>
                {completedEvents}/{totalEvents}
              </AppText>
            </View>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Tuntas
            </AppText>
          </View>
        </View>

        {totalEvents > 0 ? (
          <ProgressBar
            progress={progressPercent}
            color={colors.primary}
            height={8}
            style={styles.heroProgress}
          />
        ) : null}
      </Card>

      {/* Error Banner */}
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
            Memuat agenda...
          </AppText>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && events.length === 0 && (
        <EmptyState
          title="Tidak Ada Agenda di Tanggal Ini"
          description="Jadwalkan kegiatan penting, janji temu, atau blok waktu kerja fokus agar harimu berjalan produktif."
          customIcon={<Calendar size={32} color={colors.onPrimaryContainer} />}
          actionTitle="Jadwalkan Acara Baru"
          onActionPress={() => setIsModalVisible(true)}
          style={styles.emptyMargin}
        />
      )}

      {/* Timeline Event List */}
      {!isLoading && events.length > 0 && (
        <View style={styles.eventsList}>
          {events.map((item) => (
            <TimelineEventCard
              key={item.id}
              event={item}
              onToggleComplete={() => toggleEvent(item.id, item.isCompleted)}
              onDelete={() => handleDeleteEvent(item.id, item.title)}
            />
          ))}
        </View>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={addEvent}
        selectedDate={selectedDate}
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
    marginBottom: space[3],
  },
  headerTitleBox: {
    flex: 1,
    marginRight: space[2],
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
  dateStrip: {
    marginBottom: space[3],
  },
  heroCard: {
    marginBottom: space[4],
    borderRadius: radius.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop: space[3],
  },
  bannerMargin: {
    marginVertical: space[2],
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[10],
  },
  loadingText: {
    marginTop: space[2],
  },
  emptyMargin: {
    marginTop: space[4],
  },
  eventsList: {
    paddingBottom: space[8],
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
