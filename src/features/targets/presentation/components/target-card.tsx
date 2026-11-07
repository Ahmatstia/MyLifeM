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

export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, style }) => {
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
            <AppText variant="labelSmall" style={styles.categoryText}>
              {target.categoryName || 'Umum'}
            </AppText>
            {target.status === 'ACTIVE' && (
              <AppText variant="labelSmall" style={styles.stageText}>
                · Aktif
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
          <ArrowRight size={16} color="#1E1E2E" strokeWidth={2.4} />
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
                backgroundColor: isCompleted ? '#76A284' : '#E8A838',
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
              <Check size={12} color="#FAF5EB" strokeWidth={2.6} />
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E1E2E',
    borderLeftWidth: 4,
    borderLeftColor: '#E8A838',
    boxShadow: '2px 2px 0px #1E1E2E',
    marginBottom: 12,
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    boxShadow: '0px 0px 0px #1E1E2E',
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
    backgroundColor: '#FAF5EB',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.2)',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#805600',
  },
  stageText: {
    fontSize: 11,
    fontFamily: fontFamily.semibold,
    color: '#504535',
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#1E1E2E',
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: '#504535',
    marginTop: 3,
    lineHeight: 18,
  },
  circleArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF5EB',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 30, 46, 0.08)',
    gap: 6,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#FAF5EB',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 46, 0.15)',
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
    color: '#1E1E2E',
  },
  taskCountSub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: '#504535',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#76A284',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  completedText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
});
