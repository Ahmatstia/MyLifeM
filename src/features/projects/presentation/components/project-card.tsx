import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowRight, Terminal } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
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
    bg: '#FFEBD9',
    text: '#A23D28',
    bar: '#E8A838',
  },
  PLANNING: {
    label: 'Rencana',
    bg: '#FAF5EB',
    text: '#504535',
    bar: '#B7A4CF',
  },
  ON_HOLD: {
    label: 'Ditunda',
    bg: '#E8E3D7',
    text: '#504535',
    bar: '#837563',
  },
  COMPLETED: {
    label: 'Selesai',
    bg: '#C2E0CC',
    text: '#254F36',
    bar: '#76A284',
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
            {project.targetTitle ? `Target · ${project.targetTitle}` : 'Proyek mandiri'}
          </AppText>
        </View>

        <View style={styles.arrowCircle}>
          <ArrowRight size={16} color={colors.primary} strokeWidth={2.2} />
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
          <Terminal size={14} color={colors.primary} strokeWidth={2} style={styles.outputIcon} />
          <AppText variant="bodySmall" style={styles.outputText} numberOfLines={2}>
            {project.description}
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
    backgroundColor: '#FAF5EB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '2px 2px 0px #1E1E2E',
    marginBottom: 12,
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  statusText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.4,
  },
  targetLinkText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: '#504535',
    flex: 1,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FAF5EB',
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    boxShadow: '1.5px 1.5px 0px #1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.onSurface,
    marginTop: 8,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.onSurfaceVariant,
  },
  outputBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5EFE6',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  outputIcon: {
    marginTop: 2,
  },
  outputText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.onSurfaceVariant,
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
    color: colors.onSurfaceVariant,
  },
  percentText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.onSurface,
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#E8E3D7',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
});
