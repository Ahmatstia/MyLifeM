import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ChevronRight, Flag, Target, Layers } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Card } from '@/shared/ui/card';
import { AppText } from '@/shared/ui/app-text';
import { ProgressBar } from '@/shared/ui/progress-bar';
import type { ProjectWithSummary } from '../../domain/entities/project.entity';

export interface ProjectCardProps {
  project: ProjectWithSummary;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  const { taskSummary, targetTitle, milestonesCount } = project;
  const isCompleted = project.status === 'COMPLETED' || (taskSummary.totalTasks > 0 && taskSummary.progressPercent >= 100);

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Header: Target Link and Priority */}
      <View style={styles.headerRow}>
        {targetTitle ? (
          <View style={styles.targetBadge}>
            <Target size={12} color={colors.primary} />
            <AppText variant="labelSmall" color="primary" numberOfLines={1} style={styles.targetText}>
              {targetTitle}
            </AppText>
          </View>
        ) : (
          <View style={styles.independentBadge}>
            <AppText variant="labelSmall" color="onSurfaceSubtle">
              Proyek Mandiri
            </AppText>
          </View>
        )}

        <View style={styles.priorityRow}>
          <Flag size={12} color={colors.onSurfaceSubtle} />
          <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.priorityText}>
            {project.priority.toLowerCase()}
          </AppText>
        </View>
      </View>

      {/* Project Title */}
      <View style={styles.titleRow}>
        <AppText
          variant="titleMedium"
          color={isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
          numberOfLines={2}
          style={[styles.title, isCompleted && styles.completedTitle]}
        >
          {project.title}
        </AppText>
        <ChevronRight size={18} color={colors.onSurfaceSubtle} />
      </View>

      {project.description ? (
        <AppText
          variant="bodySmall"
          color="onSurfaceVariant"
          numberOfLines={2}
          style={styles.description}
        >
          {project.description}
        </AppText>
      ) : null}

      {/* Task Summary Metrics */}
      <View style={styles.metricRow}>
        <AppText variant="bodySmall" color="onSurfaceVariant" tabularNums>
          {taskSummary.totalTasks > 0
            ? `${taskSummary.completedTasks} dari ${taskSummary.totalTasks} tugas selesai`
            : 'Belum ada tugas'}
        </AppText>

        <AppText
          variant="labelMedium"
          color={isCompleted ? 'success' : 'primary'}
          tabularNums
        >
          {taskSummary.progressPercent}%
        </AppText>
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={taskSummary.progressPercent}
        color={isCompleted ? colors.success : colors.primary}
        height={8}
        style={styles.progressBar}
      />

      {/* Footer Meta: Milestones Count & Status */}
      <View style={styles.footerRow}>
        <View style={styles.milestoneMeta}>
          <Layers size={13} color={colors.onSurfaceSubtle} />
          <AppText variant="labelSmall" color="onSurfaceSubtle" style={styles.milestoneText}>
            {milestonesCount} babak kerja (milestone)
          </AppText>
        </View>

        <AppText
          variant="labelSmall"
          color={project.status === 'COMPLETED' ? 'success' : 'onSurfaceVariant'}
          style={styles.statusLabel}
        >
          {project.status === 'ACTIVE'
            ? 'Berjalan'
            : project.status === 'PLANNING'
            ? 'Rencana'
            : project.status === 'ON_HOLD'
            ? 'Tertahan'
            : 'Selesai'}
        </AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    maxWidth: '75%',
    gap: 4,
  },
  targetText: {
    fontWeight: '600',
    flexShrink: 1,
  },
  independentBadge: {
    paddingVertical: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[1],
  },
  title: {
    flex: 1,
    marginRight: space[2],
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  description: {
    marginBottom: space[3],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
    marginTop: space[1],
  },
  progressBar: {
    marginBottom: space[3],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24,
  },
  milestoneMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneText: {
    marginLeft: 2,
  },
  statusLabel: {
    fontWeight: '600',
  },
});
