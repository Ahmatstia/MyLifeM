import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
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

/**
 * ProjectCard: Desain Cute Marshmallow Minimal.
 * - Tanpa tumpukan ikon (flag, layers, target).
 * - Pil kategori pastel bertekstur empuk.
 * - Progress bar chubby.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  const { taskSummary, targetTitle, milestonesCount } = project;
  const isCompleted =
    project.status === 'COMPLETED' ||
    (taskSummary.totalTasks > 0 && taskSummary.progressPercent >= 100);

  return (
    <Card
      variant={isCompleted ? 'filled' : 'elevated'}
      onPress={onPress}
      padding={space[4]}
      style={[styles.card, style]}
    >
      {/* Header: Pil Target / Mandiri & Status */}
      <View style={styles.headerRow}>
        <View style={styles.badgePill}>
          <AppText variant="labelSmall" color="primary" numberOfLines={1}>
            {targetTitle ? targetTitle : 'Proyek Mandiri'}
          </AppText>
        </View>

        <View style={styles.priorityPill}>
          <AppText variant="labelSmall" color="onSurfaceSubtle">
            {project.priority === 'HIGH' ? 'Prioritas Utama' : 'Standar'}
          </AppText>
        </View>
      </View>

      {/* Project Title & Navigation Chevron */}
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
          color="onSurfaceSubtle"
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
            ? `${taskSummary.completedTasks}/${taskSummary.totalTasks} tugas selesai`
            : 'Belum ada tugas'}
        </AppText>

        <View style={styles.percentPill}>
          <AppText
            variant="labelSmall"
            color={isCompleted ? 'success' : 'primary'}
            tabularNums
          >
            {taskSummary.progressPercent}%
          </AppText>
        </View>
      </View>

      {/* Chubby Progress Bar */}
      <ProgressBar
        progress={taskSummary.progressPercent}
        color={isCompleted ? colors.success : colors.primary}
        height={8}
        style={styles.progressBar}
      />

      {/* Footer Meta: Milestones Count */}
      <View style={styles.footerRow}>
        <View style={styles.milestonePill}>
          <AppText variant="labelSmall" color="onSurfaceSubtle">
            {milestonesCount > 0 ? `${milestonesCount} babak kerja` : '1 tahap'}
          </AppText>
        </View>

        {isCompleted && (
          <View style={styles.completedPill}>
            <AppText variant="labelSmall" color="success">
              Selesai
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: space[3],
    borderRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  badgePill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    maxWidth: '70%',
  },
  priorityPill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 3,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: space[1],
    marginBottom: space[1],
  },
  title: {
    flex: 1,
    lineHeight: 22,
    marginRight: space[2],
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    lineHeight: 18,
    marginBottom: space[2],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[2],
    marginBottom: space[2],
  },
  percentPill: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  progressBar: {
    marginVertical: space[1],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
  },
  milestonePill: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  completedPill: {
    backgroundColor: colors.successContainer,
    paddingVertical: 3,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
});
