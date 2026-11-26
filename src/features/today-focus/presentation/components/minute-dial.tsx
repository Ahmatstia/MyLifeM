import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';

const ticks = Array.from({ length: 60 }, (_, minute) => (
  <Line key={minute} x1={60} y1={12} x2={60} y2={minute % 5 ? 15 : 21}
    transform={`rotate(${minute * 6} 60 60)`} stroke={colors.clockTick}
    strokeWidth={minute % 5 ? 1 : 2.4} strokeLinecap="round" />
));

/** One turn is an hour. The adjacent text gives the full time for longer sessions. */
export function MinuteDial({ minutes, size = space[16] + space[10] }: { minutes?: number; size?: number }) {
  const known = minutes != null && Number.isFinite(minutes) && minutes >= 0;
  const fraction = known && minutes > 0 ? (minutes % 60 || 60) / 60 : 0;
  const angle = fraction * Math.PI * 2;
  const endX = 60 + 50 * Math.sin(angle);
  const endY = 60 - 50 * Math.cos(angle);
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={62} r={57} fill={colors.clockEdge} />
        <Circle cx={60} cy={59} r={56} fill={colors.clockInk} />
        <Circle cx={60} cy={60} r={51} fill={colors.clockFace} />
        {fraction === 1 ? <Circle cx={60} cy={60} r={50} fill={colors.clockSector} /> :
          fraction > 0 ? <Path d={`M60 60 L60 10 A50 50 0 ${fraction > 0.5 ? 1 : 0} 1 ${endX} ${endY} Z`} fill={colors.clockSector} /> : null}
        {ticks}
        {known ? (
          <G transform={`rotate(${fraction * 360} 60 60)`}>
            <Path d="M57 71 L58.3 25 Q60 20 61.7 25 L63 71 Q60 75 57 71Z" fill={colors.clockInk} />
          </G>
        ) : null}
        <Circle cx={60} cy={60} r={8} fill={colors.clockInk} />
        <Circle cx={60} cy={60} r={3} fill={colors.clockFace} />
      </Svg>
    </View>
  );
}
