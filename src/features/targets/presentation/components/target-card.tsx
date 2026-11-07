import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Target, Check } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText, SoftCard, IconTile } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

const s = colors.sprout;

export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TargetCard: React.FC<TargetCardProps> = ({ target, onPress, style }) => {
  const isCompleted = target.status === 'COMPLETED';

  return (
    <SoftCard
      onPress={onPress}
      accessibilityLabel={`Buka detail target ${target.title}`}
      style={[styles.card, style]}
    >
      <View style={styles.mainRow}>
        {/* Left: Status / Check circle */}
        <View style={[styles.statusRing, isCompleted && styles.statusRingDone]}>
          {isCompleted ? (
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          ) : (
            <View style={styles.innerDot} />
          )}
        </View>

        {/* Center: Title + Subtitle */}
        <View style={styles.centerCol}>
          <AppText style={styles.title} numberOfLines={2}>
            {target.title}
          </AppText>
          <AppText style={styles.subtext} numberOfLines={1}>
            {target.totalTasks > 0
              ? `${target.completedTasks}/${target.totalTasks} tugas · ${target.categoryName || 'Umum'}`
              : `Belum ada rencana · ${target.categoryName || 'Umum'}`}
          </AppText>

          {/* Soft Organic Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, target.progressPercent))}%`,
                  backgroundColor: isCompleted ? s.leaf : s.forest,
                },
              ]}
            />
          </View>
        </View>

        {/* Right: Soft Squircle Icon Tile */}
        <IconTile icon={Target} tone={isCompleted ? 'sun' : 'leaf'} size={44} />
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
