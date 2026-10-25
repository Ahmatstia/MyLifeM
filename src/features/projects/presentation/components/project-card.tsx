import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space, radius } from '@/theme/tokens';
import { Card, AppText, ProgressBar } from '@/shared/ui';
import type { ProjectWithSummary } from '../../domain/entities/project.entity';

export interface ProjectCardProps { project: ProjectWithSummary; onPress: () => void; style?: StyleProp<ViewStyle>; }
const STATUS_LABELS = { PLANNING: 'Rencana', ACTIVE: 'Aktif', ON_HOLD: 'Ditunda', COMPLETED: 'Selesai' };
export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress, style }) => (
  <Card variant="elevated" onPress={onPress} padding={space[5]} style={[styles.card, style]}>
    <View style={styles.top}><AppText variant="labelMedium" color="onSecondaryContainer" style={styles.status}>{STATUS_LABELS[project.status] || project.status}</AppText><ArrowUpRight size={20} color={colors.primary} /></View>
    <AppText variant="headlineSmall" style={styles.title} numberOfLines={3}>{project.title}</AppText>
    <AppText variant="bodySmall" color="primary" style={styles.target} numberOfLines={2}>{project.targetTitle || 'Proyek mandiri'}</AppText>
    {project.description && <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={2} style={styles.description}>{project.description}</AppText>}
    <View style={styles.metric}><AppText variant="bodySmall" color="onSurfaceVariant" style={styles.label}>{project.taskSummary.completedTasks}/{project.taskSummary.totalTasks} tugas rencana · {project.stagesCount || project.milestonesCount} tahap</AppText><AppText variant="titleMedium" color="primary" tabularNums>{project.taskSummary.progressPercent}%</AppText></View>
    <ProgressBar progress={project.taskSummary.progressPercent} height={6} />
  </Card>
);
const styles = StyleSheet.create({
  card: { marginBottom: space[4] },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  status: { backgroundColor: colors.secondaryContainer, borderRadius: radius.sm, paddingHorizontal: space[3], paddingVertical: space[1] },
  title: { marginTop: space[4], marginBottom: space[2] },
  target: { marginBottom: space[3] },
  description: { marginBottom: space[3] },
  metric: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginVertical: space[3] },
  label: { flex: 1 },
});
