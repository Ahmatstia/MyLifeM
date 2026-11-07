import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';

export interface MascotProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * MascotPeek – Chibi girl with dark teal hair & green 2-leaf sprout on top,
 * happy closed eyes, rosy cheeks, and little hands resting over the card ledge.
 * Matches the "Halo, Pejuang!" Home Hero card in the reference UI.
 */
export const MascotPeek: React.FC<MascotProps> = ({ width = 148, height = 112, style }) => (
  <View pointerEvents="none" style={[styles.wrap, { width, height }, style]}>
    <Svg width={width} height={height} viewBox="0 0 160 120">
      {/* Sparkles on the left */}
      <Path
        d="M18 42 L21 49 L28 52 L21 55 L18 62 L15 55 L8 52 L15 49 Z"
        fill="#F7C948"
      />
      <Circle cx={32} cy={36} r={3} fill="#F7C948" />

      {/* Back Hair Wave */}
      <Path
        d="M42 98 C36 62 56 36 88 36 C122 36 140 62 146 98 C148 106 142 112 134 112 H48 C42 112 40 105 42 98 Z"
        fill="#133E35"
      />
      <Path
        d="M48 96 C44 64 60 40 88 40 C118 40 134 64 140 96 Z"
        fill="#1B5246"
      />

      {/* Two-leaf Sprout on top of head */}
      <Path
        d="M88 39 C88 28 90 22 92 16"
        stroke="#4E8C35"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <Path
        d="M90 24 C76 10 62 14 66 26 C70 36 84 32 90 24 Z"
        fill="#8CC152"
        stroke="#274C3E"
        strokeWidth={2}
      />
      <Path d="M72 22 C78 22 84 23 89 24" stroke="#4E8C35" strokeWidth={1.6} strokeLinecap="round" />
      {/* Right leaf */}
      <Path
        d="M91 22 C102 6 120 10 116 24 C112 34 98 30 91 22 Z"
        fill="#A3D55F"
        stroke="#274C3E"
        strokeWidth={2}
      />
      <Path d="M109 19 C103 20 96 21 92 22" stroke="#4E8C35" strokeWidth={1.6} strokeLinecap="round" />

      {/* Face */}
      <Ellipse cx={88} cy={82} rx={33} ry={27} fill="#FFE3C8" stroke="#133E35" strokeWidth={2.5} />

      {/* Front Hair Bangs */}
      <Path
        d="M54 76 C56 52 72 42 90 42 C108 42 122 52 124 76 C116 64 106 58 96 64 C90 54 78 54 72 64 C64 58 58 66 54 76 Z"
        fill="#1E5A4C"
        stroke="#133E35"
        strokeWidth={2.4}
      />
      {/* Hair highlight */}
      <Path
        d="M68 52 C76 47 86 47 94 50"
        stroke="#3C8270"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Happy Closed Eyes (U-shaped curves like reference) */}
      <Path
        d="M71 76 C73 82 79 82 81 76"
        stroke="#133E35"
        strokeWidth={2.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M95 76 C97 82 103 82 105 76"
        stroke="#133E35"
        strokeWidth={2.8}
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy Cheeks */}
      <Ellipse cx={67} cy={83} rx={5.5} ry={3.2} fill="#F59B85" opacity={0.75} />
      <Ellipse cx={109} cy={83} rx={5.5} ry={3.2} fill="#F59B85" opacity={0.75} />

      {/* Cute little smile */}
      <Path
        d="M84 83 C86 87 90 87 92 83"
        stroke="#133E35"
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />

      {/* Paws / Hands resting on the ledge */}
      <Ellipse
        cx={61}
        cy={99}
        rx={11}
        ry={7.5}
        fill="#FFE3C8"
        stroke="#133E35"
        strokeWidth={2.4}
      />
      <Path d="M58 96 V101 M63 96 V101" stroke="#D9A886" strokeWidth={1.6} strokeLinecap="round" />

      <Ellipse
        cx={113}
        cy={101}
        rx={11}
        ry={7.5}
        fill="#FFE3C8"
        stroke="#133E35"
        strokeWidth={2.4}
      />
      <Path d="M110 98 V103 M115 98 V103" stroke="#D9A886" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  </View>
);

/**
 * MascotHead – Chibi girl peeking from behind the white cloud input box on Form screens
 * ("Tambah Tugas" screen in reference UI, with curious open dark eyes).
 */
export const MascotHead: React.FC<MascotProps> = ({ width = 136, height = 88, style }) => (
  <View pointerEvents="none" style={[styles.wrap, { width, height }, style]}>
    <Svg width={width} height={height} viewBox="0 0 150 96">
      {/* Back Hair */}
      <Path
        d="M32 88 C30 52 50 28 76 28 C102 28 122 52 120 88 Z"
        fill="#133E35"
      />
      <Path
        d="M37 88 C36 56 54 32 76 32 C98 32 116 56 115 88 Z"
        fill="#1E5A4C"
      />

      {/* Sprout on top */}
      <Path d="M76 30 V16" stroke="#3E7A2E" strokeWidth={3.2} strokeLinecap="round" />
      <Path
        d="M76 20 C64 8 50 12 54 22 C58 30 70 26 76 20 Z"
        fill="#7CB842"
        stroke="#133E35"
        strokeWidth={2}
      />
      <Path
        d="M76 19 C88 6 102 10 98 21 C94 29 82 25 76 19 Z"
        fill="#9AD15B"
        stroke="#133E35"
        strokeWidth={2}
      />

      {/* Face */}
      <Ellipse cx={76} cy={72} rx={30} ry={23} fill="#FFE3C8" stroke="#133E35" strokeWidth={2.4} />

      {/* Bangs */}
      <Path
        d="M45 68 C48 44 62 34 76 34 C90 34 104 44 107 68 C100 56 91 52 83 58 C77 48 68 48 63 58 C56 52 50 58 45 68 Z"
        fill="#1E5A4C"
        stroke="#133E35"
        strokeWidth={2.2}
      />

      {/* Curious Open Dark Eyes */}
      <Circle cx={64} cy={69} r={3.6} fill="#133E35" />
      <Circle cx={65} cy={67.8} r={1.2} fill="#FFFFFF" />
      <Circle cx={88} cy={69} r={3.6} fill="#133E35" />
      <Circle cx={89} cy={67.8} r={1.2} fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <Ellipse cx={56} cy={74} rx={4.8} ry={2.8} fill="#F59B85" opacity={0.8} />
      <Ellipse cx={96} cy={74} rx={4.8} ry={2.8} fill="#F59B85" opacity={0.8} />

      {/* Little hands gripping the top of the cloud input */}
      <Ellipse cx={48} cy={86} rx={9.5} ry={6.5} fill="#FFE3C8" stroke="#133E35" strokeWidth={2.2} />
      <Ellipse cx={104} cy={86} rx={9.5} ry={6.5} fill="#FFE3C8" stroke="#133E35" strokeWidth={2.2} />
    </Svg>
  </View>
);

/**
 * MascotCozy – Chibi girl relaxing in a golden-yellow beanbag chair holding a warm green mug,
 * with a potted plant beside her. Matches the Detail screen in the reference UI.
 */
export const MascotCozy: React.FC<MascotProps> = ({ width = 240, height = 165, style }) => (
  <View pointerEvents="none" style={[styles.wrap, { width, height }, style]}>
    <Svg width={width} height={height} viewBox="0 0 260 180">
      {/* Soft floor shadow */}
      <Ellipse cx={126} cy={164} rx={96} ry={12} fill="#DFD5BE" opacity={0.7} />

      {/* Potted Plant on the right */}
      <G transform="translate(202, 74)">
        <Path
          d="M14 54 L18 82 H38 L42 54 Z"
          fill="#8C583A"
          stroke="#4A2E1B"
          strokeWidth={2}
        />
        <Rect x={11} y={48} width={34} height={7} rx={3} fill="#A46B49" stroke="#4A2E1B" strokeWidth={2} />
        {/* Leaves */}
        <Path d="M28 48 C20 30 6 24 8 12 C18 10 26 24 28 48 Z" fill="#4E8C35" />
        <Path d="M28 48 C28 24 22 6 30 0 C38 8 34 26 28 48 Z" fill="#7CB842" />
        <Path d="M28 48 C36 30 50 22 48 10 C38 10 30 26 28 48 Z" fill="#3B7A57" />
      </G>

      {/* Golden-Yellow Beanbag Chair */}
      <Path
        d="M36 124 C26 92 52 68 98 68 C144 68 176 90 170 126 C166 150 144 162 102 162 C58 162 42 148 36 124 Z"
        fill="#F7C948"
        stroke="#C9971A"
        strokeWidth={2.5}
      />
      <Path
        d="M48 118 C58 134 90 142 146 132"
        stroke="#DDA520"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* Mascot Hair Back */}
      <Path
        d="M66 94 C62 56 80 34 106 34 C132 34 148 56 146 94 Z"
        fill="#133E35"
      />

      {/* Sprout on Head */}
      <Path d="M104 34 V20" stroke="#4E8C35" strokeWidth={3.2} strokeLinecap="round" />
      <Path d="M104 24 C92 12 78 16 82 26 C86 34 98 30 104 24 Z" fill="#8CC152" stroke="#133E35" strokeWidth={1.8} />
      <Path d="M104 23 C116 10 130 14 126 25 C122 33 110 29 104 23 Z" fill="#A3D55F" stroke="#133E35" strokeWidth={1.8} />

      {/* Mascot Sweater & Legs */}
      <Path
        d="M76 92 C76 82 132 82 134 94 L140 128 H72 Z"
        fill="#2E7D5B"
        stroke="#133E35"
        strokeWidth={2.2}
      />
      {/* Cozy Trousers */}
      <Path
        d="M84 124 H144 C154 124 160 132 156 142 L148 152 H102 C90 152 82 140 84 124 Z"
        fill="#184A3E"
        stroke="#133E35"
        strokeWidth={2.2}
      />
      {/* Cute Feet */}
      <Ellipse cx={154} cy={148} rx={9} ry={6} fill="#FFE3C8" stroke="#133E35" strokeWidth={2} />
      <Ellipse cx={142} cy={153} rx={9} ry={6} fill="#FFE3C8" stroke="#133E35" strokeWidth={2} />

      {/* Face */}
      <Ellipse cx={106} cy={70} rx={26} ry={21} fill="#FFE3C8" stroke="#133E35" strokeWidth={2.2} />
      {/* Bangs */}
      <Path
        d="M79 66 C82 44 94 36 106 36 C120 36 130 44 133 66 C126 56 118 52 111 57 C106 49 97 49 92 57 C86 52 82 58 79 66 Z"
        fill="#1E5A4C"
        stroke="#133E35"
        strokeWidth={2}
      />
      {/* Content Closed Eyes */}
      <Path d="M93 66 C95 70 100 70 102 66" stroke="#133E35" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Path d="M111 66 C113 70 118 70 120 66" stroke="#133E35" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Ellipse cx={89} cy={72} rx={4.5} ry={2.5} fill="#F59B85" opacity={0.8} />
      <Ellipse cx={123} cy={72} rx={4.5} ry={2.5} fill="#F59B85" opacity={0.8} />
      <Path d="M103 72 C105 75 108 75 110 72" stroke="#133E35" strokeWidth={2} strokeLinecap="round" fill="none" />

      {/* Warm Mug in Hands */}
      <Rect x={97} y={84} width={20} height={24} rx={5} fill="#98C39A" stroke="#133E35" strokeWidth={2} />
      <Path d="M117 89 H122 C125 89 125 101 122 101 H117" stroke="#133E35" strokeWidth={2} fill="none" />
      <Ellipse cx={95} cy={96} rx={6} ry={5} fill="#FFE3C8" stroke="#133E35" strokeWidth={2} />
      <Ellipse cx={118} cy={96} rx={6} ry={5} fill="#FFE3C8" stroke="#133E35" strokeWidth={2} />
    </Svg>
  </View>
);

/**
 * MascotAvatar – Circular avatar badge in the top-right of the Home screen.
 */
export const MascotAvatar: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <View
    style={[
      styles.avatarCircle,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={22} fill="#FFFDF8" stroke="#1E5A4C" strokeWidth={2} />
      <Path d="M10 42 C10 26 16 18 24 18 C32 18 38 26 38 42 Z" fill="#1E5A4C" />
      {/* Sprout */}
      <Path d="M24 18 V11" stroke="#4E8C35" strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M24 13 C19 8 14 10 16 15 C18 18 22 16 24 13 Z" fill="#8CC152" />
      <Path d="M24 13 C29 8 34 10 32 15 C30 18 26 16 24 13 Z" fill="#A3D55F" />
      {/* Face */}
      <Circle cx={24} cy={29} r={10} fill="#FFE3C8" stroke="#133E35" strokeWidth={1.6} />
      <Path d="M14 27 C15 20 19 17 24 17 C29 17 33 20 34 27 C30 23 27 23 24 25 C21 23 18 23 14 27 Z" fill="#1E5A4C" />
      <Circle cx={20.5} cy={29} r={1.6} fill="#133E35" />
      <Circle cx={27.5} cy={29} r={1.6} fill="#133E35" />
      <Path d="M22 32.5 C23 34 25 34 26 32.5" stroke="#133E35" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  </View>
);

/**
 * SproutPlant – Small two-leaf sprout icon used on the Hero card and Calendar summary pill.
 */
export const SproutPlant: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M20 36 V18" stroke="#3B7A57" strokeWidth={3.2} strokeLinecap="round" />
    <Path
      d="M20 22 C10 10 2 14 6 24 C9 31 16 27 20 22 Z"
      fill="#7CB842"
      stroke="#1E5A4C"
      strokeWidth={1.8}
    />
    <Path
      d="M20 20 C30 8 38 12 34 22 C31 29 24 25 20 20 Z"
      fill="#9AD15B"
      stroke="#1E5A4C"
      strokeWidth={1.8}
    />
  </Svg>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    overflow: 'hidden',
    backgroundColor: '#FFFDF8',
    shadowColor: '#8A7A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
});

