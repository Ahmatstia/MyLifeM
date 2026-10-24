import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Layers,
  CheckSquare,
  Clock,
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, touchTarget } from '@/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { AppText } from '@/shared/ui/app-text';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Banner } from '@/shared/ui/banner';
import { useProjectDetail } from '../hooks/use-project-detail';

export interface ProjectDetailScreenProps {
  projectId: string;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  projectId,
}) => {
  const {
    project,
    milestones,
    tasks,
    isLoading,
    error,
    refresh,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    addTask,
    toggleTask,
    removeTask,
    deleteThisProject,
  } = useProjectDetail(projectId);

  // Quick inputs
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const handleCreateMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;
    const ok = await addMilestone(newMilestoneTitle.trim());
    if (ok) {
      setNewMilestoneTitle('');
      setShowAddMilestone(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    const ok = await addTask(newTaskTitle.trim());
    if (ok) {
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Hapus Proyek',
      'Apakah kamu yakin ingin menghapus proyek ini beserta seluruh tugas di dalamnya?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Selamanya',
          style: 'destructive',
          onPress: async () => {
            await deleteThisProject();
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!project) {
    return (
      <Screen>
        <Banner
          variant="error"
          message="Proyek tidak ditemukan atau telah dihapus."
          actionText="Kembali"
          onActionPress={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* TopBar 64 dp (DESIGN.md Template B) */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>

        <AppText variant="titleMedium" numberOfLines={1} style={styles.topBarTitle}>
          {project.title}
        </AppText>

        {/* Destructive Action in top right corner (DESIGN.md 9.2) */}
        <Pressable
          onPress={handleDeleteProject}
          accessibilityRole="button"
          accessibilityLabel="Hapus proyek"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteTopButton}
        >
          <Trash2 size={20} color={colors.error} />
        </Pressable>
      </View>

      {/* Project Heading & Description */}
      <View style={styles.headingSection}>
        <AppText variant="headlineMedium">{project.title}</AppText>
        {project.targetTitle && (
          <AppText variant="labelMedium" color="primary" style={styles.targetLink}>
            🎯 Mendukung Target: {project.targetTitle}
          </AppText>
        )}
        {project.description && (
          <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.descText}>
            {project.description}
          </AppText>
        )}
      </View>

      {/* Stats 2 Columns (DESIGN.md Template B) */}
      <View style={styles.statsRow}>
        <Card variant="filled" style={styles.statCol}>
          <AppText variant="labelSmall" color="onSurfaceVariant">
            Kemajuan Tugas
          </AppText>
          <AppText variant="headlineLarge" color="primary" tabularNums style={styles.statValue}>
            {project.taskSummary.progressPercent}%
          </AppText>
          <ProgressBar
            progress={project.taskSummary.progressPercent}
            color={colors.primary}
            height={4}
          />
        </Card>

        <Card variant="filled" style={styles.statCol}>
          <AppText variant="labelSmall" color="onSurfaceVariant">
            Tugas Selesai
          </AppText>
          <AppText variant="headlineLarge" color="onSurface" tabularNums style={styles.statValue}>
            {project.taskSummary.completedTasks}/{project.taskSummary.totalTasks}
          </AppText>
          <AppText variant="labelSmall" color="onSurfaceSubtle">
            {milestones.length} babak aktif
          </AppText>
        </Card>
      </View>

      {/* SECTION 1: BABAK KERJA (MILESTONES) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithIcon}>
          <Layers size={18} color={colors.primary} />
          <AppText variant="titleMedium">Babak Kerja ({milestones.length})</AppText>
        </View>

        <Button
          title="+ Babak"
          variant="text"
          size="compact"
          onPress={() => setShowAddMilestone(!showAddMilestone)}
        />
      </View>

      {/* Input New Milestone */}
      {showAddMilestone && (
        <Card variant="elevated" style={styles.inlineAddCard}>
          <TextInput
            value={newMilestoneTitle}
            onChangeText={setNewMilestoneTitle}
            placeholder="Judul babak (cth: Fase 1 Desain UI)..."
            placeholderTextColor={colors.onSurfaceSubtle}
            style={styles.textInput}
          />
          <View style={styles.inlineActionRow}>
            <Button
              title="Batal"
              variant="text"
              size="compact"
              onPress={() => setShowAddMilestone(false)}
            />
            <Button
              title="Simpan Babak"
              variant="filled"
              size="compact"
              onPress={handleCreateMilestone}
            />
          </View>
        </Card>
      )}

      {milestones.length === 0 && !showAddMilestone && (
        <AppText variant="bodySmall" color="onSurfaceSubtle" style={styles.emptyNote}>
          Belum ada babak kerja. Babak membantu memecah proyek jadi fase terukur.
        </AppText>
      )}

      {milestones.map((m) => (
        <Card key={m.id} variant="filled" padding={space[3]} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Pressable
              onPress={() => toggleMilestone(m.id, m.isCompleted)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.checkTouch}
            >
              {m.isCompleted ? (
                <CheckCircle2 size={22} color={colors.success} />
              ) : (
                <Circle size={22} color={colors.outline} />
              )}
            </Pressable>

            <AppText
              variant="bodyMedium"
              color={m.isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
              style={[styles.itemText, m.isCompleted && styles.completedText]}
            >
              {m.title}
            </AppText>

            <Pressable
              onPress={() => removeMilestone(m.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={16} color={colors.onSurfaceSubtle} />
            </Pressable>
          </View>
        </Card>
      ))}

      {/* SECTION 2: DAFTAR TUGAS (TASKS) */}
      <View style={[styles.sectionHeaderRow, styles.taskSectionMargin]}>
        <View style={styles.sectionTitleWithIcon}>
          <CheckSquare size={18} color={colors.primary} />
          <AppText variant="titleMedium">Tugas Konkret ({tasks.length})</AppText>
        </View>

        <Button
          title="+ Tugas"
          variant="text"
          size="compact"
          onPress={() => setShowAddTask(!showAddTask)}
        />
      </View>

      {/* Input New Task */}
      {showAddTask && (
        <Card variant="elevated" style={styles.inlineAddCard}>
          <TextInput
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder="Tulis tugas konkret (cth: Buat skema DB)..."
            placeholderTextColor={colors.onSurfaceSubtle}
            style={styles.textInput}
          />
          <View style={styles.inlineActionRow}>
            <Button
              title="Batal"
              variant="text"
              size="compact"
              onPress={() => setShowAddTask(false)}
            />
            <Button
              title="Simpan Tugas"
              variant="filled"
              size="compact"
              onPress={handleCreateTask}
            />
          </View>
        </Card>
      )}

      {tasks.length === 0 && !showAddTask && (
        <AppText variant="bodySmall" color="onSurfaceSubtle" style={styles.emptyNote}>
          Belum ada tugas di proyek ini.
        </AppText>
      )}

      {tasks.map((t) => (
        <Card key={t.id} variant="filled" padding={space[3]} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <Pressable
              onPress={() => toggleTask(t.id, t.isCompleted)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.checkTouch}
            >
              {t.isCompleted ? (
                <CheckCircle2 size={22} color={colors.success} />
              ) : (
                <Circle size={22} color={colors.outline} />
              )}
            </Pressable>

            <View style={styles.itemTextCol}>
              <AppText
                variant="bodyMedium"
                color={t.isCompleted ? 'onSurfaceSubtle' : 'onSurface'}
                style={t.isCompleted ? styles.completedText : undefined}
              >
                {t.title}
              </AppText>
              <View style={styles.taskMetaRow}>
                <Clock size={11} color={colors.onSurfaceSubtle} />
                <AppText variant="labelSmall" color="onSurfaceSubtle" tabularNums>
                  {t.actualMinutes}/{t.estimatedMinutes} mnt
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={() => removeTask(t.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={16} color={colors.onSurfaceSubtle} />
            </Pressable>
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginHorizontal: space[2],
    textAlign: 'center',
  },
  deleteTopButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingSection: {
    marginBottom: space[4],
  },
  targetLink: {
    marginTop: space[1],
  },
  descText: {
    marginTop: space[2],
  },
  statsRow: {
    flexDirection: 'row',
    gap: space[3],
    marginBottom: space[4],
  },
  statCol: {
    flex: 1,
    padding: space[3],
  },
  statValue: {
    marginVertical: space[1],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  taskSectionMargin: {
    marginTop: space[4],
  },
  emptyNote: {
    marginBottom: space[3],
  },
  inlineAddCard: {
    marginBottom: space[3],
    padding: space[3],
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    color: colors.onSurface,
    paddingHorizontal: space[3],
    height: 44,
    fontSize: 13,
    marginBottom: space[2],
  },
  inlineActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: space[2],
  },
  itemCard: {
    marginBottom: space[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkTouch: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space[2],
  },
  itemText: {
    flex: 1,
    marginRight: space[2],
  },
  itemTextCol: {
    flex: 1,
    marginRight: space[2],
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[16],
  },
});
