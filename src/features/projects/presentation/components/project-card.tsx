import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowRight, Terminal } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui';
import type { ProjectWithSummary } from '../../domain/entities/project.entity';

export interface ProjectCardProps {
  project: ProjectWithSummary;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; bar: string }
> = {
  ACTIVE: {
    label: 'Aktif',
    bg: '#E8F8EE',
    text: '#1E7D42',
    bar: '#10B981',
  },
  PLANNING: {
    label: 'Rencana',
    bg: '#FFF4E5',
    text: '#9A5B00',
    bar: '#FF9E44',
  },
  ON_HOLD: {
    label: 'Ditunda',
    bg: '#F3F4F6',
    text: '#4B5563',
    bar: '#9CA3AF',
  },
  COMPLETED: {
    label: 'Selesai',
    bg: '#ECFDF5',
    text: '#059669',
    bar: '#059669',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress, style }) => {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.ACTIVE;
  const stagesCount = project.stagesCount || project.milestonesCount || 0;
  const isCompleted = project.status === 'COMPLETED';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka rincian proyek ${project.title}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Top Row: Status Pill, Linked Target & Action Arrow */}
      <View style={styles.topRow}>
        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <AppText variant="labelSmall" style={[styles.statusText, { color: config.text }]}>
              {config.label}
            </AppText>
          </View>
          <AppText variant="bodySmall" style={styles.targetLinkText} numberOfLines={1}>
            🔗 {project.targetTitle ? project.targetTitle : 'Proyek mandiri'}
          </AppText>
        </View>

        <View style={styles.arrowCircle}>
          <ArrowRight size={16} color="#121417" strokeWidth={2.4} />
        </View>
      </View>

      {/* Title */}
      <AppText
        variant="titleMedium"
        style={[styles.title, isCompleted && styles.titleCompleted]}
        numberOfLines={2}
      >
        {project.title}
      </AppText>

      {/* Description / Deliverable Output Box */}
      {project.description ? (
        <View style={styles.outputBox}>
          <Terminal size={14} color="#5052ba" strokeWidth={2.2} style={styles.outputIcon} />
          <AppText variant="bodySmall" style={styles.outputText} numberOfLines={2}>
            Output: {project.description}
          </AppText>
        </View>
      ) : null}

      {/* Progress & Metrics Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.metricTextRow}>
          <AppText variant="bodySmall" style={styles.tasksText}>
            {project.taskSummary.completedTasks}/{project.taskSummary.totalTasks} tugas
            {stagesCount > 0 ? ` · ${stagesCount} tahap` : ''}
          </AppText>
          <AppText variant="labelSmall" style={styles.percentText} tabularNums>
            {project.taskSummary.totalTasks > 0
              ? `${project.taskSummary.progressPercent}%`
              : 'Belum ada rencana'}
          </AppText>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, Math.max(0, project.taskSummary.progressPercent))}%`,
                backgroundColor: config.bar,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E3DB',
    marginBottom: 12,
    shadowColor: '#121417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.4,
  },
  targetLinkText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.6)',
    flex: 1,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F5EF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#121417',
    marginTop: 10,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(18, 20, 23, 0.5)',
  },
  outputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F7F5EF',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  outputIcon: {
    marginTop: 2,
  },
  outputText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.75)',
    lineHeight: 16,
  },
  bottomSection: {
    marginTop: 12,
    gap: 6,
  },
  metricTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tasksText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.5)',
  },
  percentText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#F7F5EF',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
});
