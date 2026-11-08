import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import {
  Compass,
  BookOpen,
  Briefcase,
  Heart,
  Sparkles,
  Flame,
  Check,
  ArrowUpRight,
  Clock,
} from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from '@/shared/ui';
import type { TargetEntity } from '../../domain/entities/target.entity';

const s = colors.sprout;

export interface TargetCardProps {
  target: TargetEntity;
  onPress: () => void;
  index?: number;
  isLast?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface TrailTheme {
  canvasBg: string;
  canvasBorder: string;
  waveFill: string;
  accent: string;
  accentSoft: string;
  ringTrack: string;
  badgeBg: string;
  badgeText: string;
}

const TRAIL_THEMES: TrailTheme[] = [
  {
    // Botanical Sage Meadow
    canvasBg: '#F2F7E9',
    canvasBorder: '#D5E5BE',
    waveFill: '#E3F0CE',
    accent: '#1E5A4C',
    accentSoft: '#DCEBC2',
    ringTrack: '#D8E6C3',
    badgeBg: '#1E5A4C',
    badgeText: '#FFFFFF',
  },
  {
    // Warm Storybook Sunburst
    canvasBg: '#FDF6E4',
    canvasBorder: '#EFE0B9',
    waveFill: '#F9EBC8',
    accent: '#B87314',
    accentSoft: '#FDE8B2',
    ringTrack: '#EEDCB0',
    badgeBg: '#F4B428',
    badgeText: '#1C3A32',
  },
  {
    // Misty River Teal
    canvasBg: '#ECF5F3',
    canvasBorder: '#C7E2DC',
    waveFill: '#D9EDE8',
    accent: '#236B63',
    accentSoft: '#CBE6E0',
    ringTrack: '#C5E0DA',
    badgeBg: '#236B63',
    badgeText: '#FFFFFF',
  },
  {
    // Terracotta Blossom
    canvasBg: '#FBF1EC',
    canvasBorder: '#EBD3C7',
    waveFill: '#F5E2D8',
    accent: '#B25038',
    accentSoft: '#F4D8CC',
    ringTrack: '#E8CFC2',
    badgeBg: '#C8644B',
    badgeText: '#FFFFFF',
  },
];

function renderCategoryIcon(categoryName: string | undefined, color: string) {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('belajar') || lower.includes('pendidikan') || lower.includes('ilmu')) {
    return <BookOpen size={19} color={color} strokeWidth={2.4} />;
  }
  if (lower.includes('karier') || lower.includes('kerja') || lower.includes('bisnis')) {
    return <Briefcase size={19} color={color} strokeWidth={2.4} />;
  }
  if (lower.includes('sehat') || lower.includes('olahraga') || lower.includes('fisik')) {
    return <Heart size={19} color={color} strokeWidth={2.4} />;
  }
  return <Compass size={19} color={color} strokeWidth={2.4} />;
}

function getPriorityLabel(priority?: TargetEntity['priority']) {
  if (priority === 'HIGH') return 'Fokus Utama';
  if (priority === 'LOW') return 'Santai';
  return 'Bertahap';
}

export const TargetCard: React.FC<TargetCardProps> = ({
  target,
  onPress,
  index = 0,
  isLast = false,
  style,
}) => {
  const isCompleted = target.status === 'COMPLETED';
  const progress = Math.min(100, Math.max(0, target.progressPercent || 0));
  const theme = TRAIL_THEMES[index % TRAIL_THEMES.length];

  // SVG Circular Medallion geometry
  const size = 62;
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 5 visual stepping stones
  const totalStones = 5;
  const activeStones =
    target.totalTasks === 0
      ? 0
      : isCompleted
        ? totalStones
        : Math.max(progress > 0 ? 1 : 0, Math.round((progress / 100) * totalStones));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail target ${target.title}`}
      style={({ pressed }) => [
        styles.trailRow,
        pressed && styles.trailRowPressed,
        style,
      ]}
    >
      {/* LEFT: Quest Trail Medallion & Botanical Dashed Spine */}
      <View style={styles.trailLeftCol}>
        <View style={styles.medallionWrap}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Outer warm cream halo */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="#FFFDF8"
              stroke={theme.ringTrack}
              strokeWidth={strokeWidth}
            />
            {/* Progress Arc */}
            {progress > 0 && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={isCompleted ? s.leaf : theme.accent}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            )}
          </Svg>

          {/* Center Emblem Icon */}
          <View
            style={[
              styles.medallionCenter,
              { backgroundColor: isCompleted ? s.leaf : theme.accentSoft },
            ]}
          >
            {isCompleted ? (
              <Check size={20} color="#FFFFFF" strokeWidth={3} />
            ) : (
              renderCategoryIcon(target.categoryName, theme.accent)
            )}
          </View>

          {/* Floating Percent Pill at bottom of Medallion */}
          <View
            style={[
              styles.medallionBadge,
              { backgroundColor: isCompleted ? s.forest : theme.badgeBg },
            ]}
          >
            <AppText
              style={[
                styles.medallionBadgeText,
                { color: isCompleted ? '#FFFFFF' : theme.badgeText },
              ]}
              tabularNums
            >
              { `${progress}%` }
            </AppText>
          </View>
        </View>

        {/* Botanical Trail Connector to Next Target */}
        {!isLast && (
          <View style={styles.trailConnectorWrap} pointerEvents="none">
            <Svg width={28} height={54} viewBox="0 0 28 54">
              <Path
                d="M14 2 C14 18 14 36 14 52"
                stroke="#C5BA9F"
                strokeWidth={2.2}
                strokeDasharray="4 5"
                strokeLinecap="round"
              />
              {/* Tiny sprout leaf along the trail */}
              <G transform="translate(14, 24)">
                <Path
                  d="M0 0 C7 -6 12 -2 8 4 C5 7 2 4 0 0 Z"
                  fill="#8CC652"
                />
                <Path
                  d="M0 2 C-7 -4 -12 0 -8 6 C-5 9 -2 6 0 2 Z"
                  fill="#5E9E47"
                />
              </G>
            </Svg>
          </View>
        )}
      </View>

      {/* RIGHT: Organic Storybook Milestone Banner (No boring white box!) */}
      <View
        style={[
          styles.organicBanner,
          {
            backgroundColor: theme.canvasBg,
            borderColor: theme.canvasBorder,
          },
        ]}
      >
        {/* Decorative Organic Wave & Botanical Leaf Watermark in Background */}
        <Svg
          width={140}
          height={110}
          viewBox="0 0 140 110"
          style={styles.bannerWaveDecor}
          pointerEvents="none"
        >
          <Path
            d="M42 0 C78 18 62 56 98 76 C116 86 130 82 140 88 L140 0 Z"
            fill={theme.waveFill}
            opacity={0.75}
          />
          <Path
            d="M108 18 C94 20 88 32 94 42 C104 42 112 30 108 18 Z"
            fill={theme.accent}
            opacity={0.08}
          />
          <Path
            d="M124 34 C112 38 108 48 114 56 C122 54 128 44 124 34 Z"
            fill={theme.accent}
            opacity={0.06}
          />
        </Svg>

        {/* Top Meta Tags Row: Category + Priority/Status */}
        <View style={styles.metaTopRow}>
          <View style={[styles.categoryTag, { backgroundColor: '#FFFDF8' }]}>
            <Sparkles size={11} color={theme.accent} strokeWidth={2.5} />
            <AppText style={[styles.categoryTagText, { color: theme.accent }]}>
              {target.categoryName || 'Umum'}
            </AppText>
          </View>

          <View
            style={[
              styles.priorityTag,
              {
                backgroundColor:
                  target.priority === 'HIGH' ? '#FDE6B0' : 'rgba(255,253,248,0.75)',
              },
            ]}
          >
            {target.priority === 'HIGH' && (
              <Flame size={11} color="#B87314" fill="#F4B428" strokeWidth={2.2} />
            )}
            <AppText
              style={[
                styles.priorityTagText,
                { color: target.priority === 'HIGH' ? '#8A5205' : s.inkMuted },
              ]}
            >
              {isCompleted ? 'Tercapai' : getPriorityLabel(target.priority)}
            </AppText>
          </View>
        </View>

        {/* Title & Optional Description */}
        <View style={styles.titleBlock}>
          <AppText style={styles.title} numberOfLines={2}>
            {target.title}
          </AppText>
          {target.description ? (
            <AppText style={styles.descriptionText} numberOfLines={1}>
              {target.description}
            </AppText>
          ) : null}
        </View>

        {/* Stepping-Stone Milestone Progress Strip + Action Orb */}
        <View style={styles.bottomMilestoneRow}>
          <View style={styles.milestoneLeft}>
            {/* 5 Stepping Stone Capsules */}
            <View style={styles.stonesRow}>
              {Array.from({ length: totalStones }).map((_, stoneIdx) => {
                const isLit = stoneIdx < activeStones;
                return (
                  <View
                    key={stoneIdx}
                    style={[
                      styles.steppingStone,
                      isLit
                        ? {
                            backgroundColor: isCompleted ? s.leaf : theme.accent,
                            width: 22,
                          }
                        : {
                            backgroundColor: theme.ringTrack,
                            width: 14,
                          },
                    ]}
                  />
                );
              })}
            </View>

            {/* Task & Focus Hours Subtext */}
            <View style={styles.metricsInlineRow}>
              <AppText style={styles.subtext} numberOfLines={1}>
                {target.totalTasks > 0
                  ? `${target.completedTasks}/${target.totalTasks} langkah selesai`
                  : 'Belum ada rencana'}
              </AppText>
              {target.totalEstimatedHours > 0 && (
                <View style={styles.hoursChip}>
                  <Clock size={10} color={s.inkMuted} strokeWidth={2.4} />
                  <AppText style={styles.hoursChipText} tabularNums>
                    {target.totalEstimatedHours}j
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Tactile Open Orb */}
          <View style={[styles.openOrb, { backgroundColor: '#FFFDF8', borderColor: theme.canvasBorder }]}>
            <ArrowUpRight size={16} color={theme.accent} strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  trailRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 14,
  },
  trailRowPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  trailLeftCol: {
    width: 64,
    alignItems: 'center',
  },
  medallionWrap: {
    width: 62,
    height: 68,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  medallionCenter: {
    position: 'absolute',
    top: 11,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionBadge: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#FFFDF8',
  },
  medallionBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 13,
  },
  trailConnectorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: -10,
  },
  organicBanner: {
    flex: 1,
    borderRadius: 26,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    gap: 8,
  },
  bannerWaveDecor: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryTagText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    lineHeight: 14,
  },
  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  priorityTagText: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    lineHeight: 14,
  },
  titleBlock: {
    gap: 2,
    paddingRight: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 16.5,
    lineHeight: 22,
    color: s.ink,
  },
  descriptionText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: s.inkMuted,
  },
  bottomMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  milestoneLeft: {
    flex: 1,
    gap: 5,
  },
  stonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  steppingStone: {
    height: 6,
    borderRadius: 999,
  },
  metricsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtext: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: s.inkMuted,
  },
  hoursChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hoursChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    color: s.inkMuted,
  },
  openOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
