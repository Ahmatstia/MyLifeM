import React from 'react';
import { View, StyleSheet, Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { ArrowRight, Check } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const getCategoryStyles = (categoryName?: string | null) => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('karier') || name.includes('karir') || name.includes('career')) {
    return { bg: 'rgba(166, 164, 249, 0.3)', text: '#6C6AE8', progress: '#6C6AE8' };
  }
  if (name.includes('didik') || name.includes('edu') || name.includes('belajar')) {
    return { bg: '#FFE7D6', text: '#FF9B42', progress: '#FF9B42' };
  }
  if (name.includes('uang') || name.includes('finan') || name.includes('money')) {
    return { bg: 'rgba(220, 247, 99, 0.45)', text: '#173C36', progress: '#173C36' };
  }
  if (name.includes('sehat') || name.includes('health') || name.includes('raga')) {
    return { bg: '#FFE4E6', text: '#E11D48', progress: '#F43F5E' };
  }
  return { bg: 'rgba(45, 212, 191, 0.25)', text: '#0F766E', progress: '#0D9488' };
};

export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, style }) => {
  const catStyle = getCategoryStyles(target.categoryName);
  const isCompleted = target.status === 'COMPLETED';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail target ${target.title}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.headerTextCol}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <AppText variant="labelSmall" style={[styles.categoryText, { color: catStyle.text }]}>
                {target.categoryName || 'Umum'}
              </AppText>
            </View>
            {target.status === 'ACTIVE' && (
              <AppText variant="labelSmall" style={styles.stageText}>
                Aktif
              </AppText>
            )}
          </View>

          <AppText variant="titleMedium" style={styles.title} numberOfLines={2}>
            {target.title}
          </AppText>

          {target.description ? (
            <AppText variant="bodySmall" style={styles.description} numberOfLines={1}>
              {target.description}
            </AppText>
          ) : null}
        </View>

        {/* Tactile Circular Arrow Button */}
        <View style={styles.circleArrowBtn}>
          <ArrowRight size={16} color="#121417" strokeWidth={2.4} />
        </View>
      </View>

      {/* Progress & Metrics Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, Math.max(0, target.progressPercent))}%`,
                backgroundColor: catStyle.progress,
              },
            ]}
          />
        </View>

        <View style={styles.metricRow}>
          <AppText variant="labelSmall" style={styles.progressPercent}>
            {target.totalTasks > 0 ? (
              <>
                {target.progressPercent}%{' '}
                <AppText variant="bodySmall" style={styles.taskCountSub}>
                  · {target.completedTasks}/{target.totalTasks} tugas
                </AppText>
              </>
            ) : (
              'Belum ada rencana'
            )}
          </AppText>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Check size={12} color="#059669" strokeWidth={2.6} />
              <AppText variant="labelSmall" style={styles.completedText}>
                Selesai
              </AppText>
            </View>
          )}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stageText: {
    fontSize: 11,
    fontFamily: fontFamily.semibold,
    color: 'rgba(18, 20, 23, 0.5)',
  },
  title: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#121417',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: 'rgba(18, 20, 23, 0.6)',
    marginTop: 3,
  },
  circleArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F5EF',
    borderWidth: 1,
    borderColor: '#E6E3DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(230, 227, 219, 0.6)',
    gap: 6,
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
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressPercent: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#121417',
  },
  taskCountSub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: 'rgba(18, 20, 23, 0.5)',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  completedText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
});
