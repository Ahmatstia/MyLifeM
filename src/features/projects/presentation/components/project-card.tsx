import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { FolderKanban, Check } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText, SoftCard, IconTile } from '@/shared/ui';
import type { ProjectWithSummary } from '../../domain/entities/project.entity';

const s = colors.sprout;

export interface ProjectCardProps {
  project: ProjectWithSummary;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; tone: 'leaf' | 'sun' | 'teal' | 'grape' }
> = {
  ACTIVE: { label: 'Aktif', tone: 'leaf' },
  PLANNING: { label: 'Rencana', tone: 'grape' },
  ON_HOLD: { label: 'Ditunda', tone: 'sun' },
  COMPLETED: { label: 'Selesai', tone: 'teal' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress, style }) => {
  const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.ACTIVE;
  const stagesCount = project.stagesCount || project.milestonesCount || 0;
  const isCompleted = project.status === 'COMPLETED';

  return (
    <SoftCard
      onPress={onPress}
      accessibilityLabel={`Buka rincian proyek ${project.title}`}
      style={[styles.card, style]}
    >
      <View style={styles.mainRow}>
        {/* Left Ring */}
        <View style={[styles.statusRing, isCompleted && styles.statusRingDone]}>
          {isCompleted ? (
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <View style={styles.innerDot} />
          )}
        </View>

        {/* Center Info */}
        <View style={styles.centerCol}>
          <AppText
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {project.title}
          </AppText>

          <AppText style={styles.subtext} numberOfLines={1}>
            {project.taskSummary.totalTasks > 0
              ? `${project.taskSummary.completedTasks}/${project.taskSummary.totalTasks} tugas · ${project.taskSummary.progressPercent}%`
              : 'Belum ada rencana'}
            {stagesCount > 0 ? ` · ${stagesCount} tahap` : ''}
            {project.targetTitle ? ` · ${project.targetTitle}` : ''}
          </AppText>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, project.taskSummary.progressPercent))}%`,
                  backgroundColor: isCompleted ? s.leaf : s.forest,
                },
              ]}
            />
          </View>
        </View>

        {/* Right Soft Squircle Icon Tile */}
        <IconTile icon={FolderKanban} tone={config.tone} size={44} />
      </View>
    </SoftCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    marginBottom: space[3],
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  statusRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#B9C49F',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRingDone: {
    backgroundColor: s.forest,
    borderColor: s.forest,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: s.leaf,
  },
  centerCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 21,
    color: s.ink,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: s.inkMuted,
  },
  subtext: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: s.inkMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#EDE6D5',
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
