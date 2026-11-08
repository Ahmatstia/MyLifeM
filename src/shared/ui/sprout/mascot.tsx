import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path, Ellipse, G, Rect } from 'react-native-svg';

const mascotPeekSource = require('../../../../assets/images/mascot/mascot-peek.png');
const mascotHeadSource = require('../../../../assets/images/mascot/mascot-head.png');
const mascotCozySource = require('../../../../assets/images/mascot/mascot-cozy.png');
const mascotRocketSource = require('../../../../assets/images/mascot/mascot-rocket.png');

export interface MascotProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * MascotPeek – High-resolution storybook illustration (transparent PNG via expo-image, no head sprout)
 * of the girl with happy closed eyes & paws resting seamlessly over the card ledge.
 */
export const MascotPeek: React.FC<MascotProps> = ({ width = 152, height = 109, style }) => {
  const imgWidth = width;
  const imgHeight = Math.round(width * (367 / 512));

  return (
    <View pointerEvents="none" style={[styles.wrap, { width, height: imgHeight }, style]}>
      <Image
        source={mascotPeekSource}
        style={{ width: imgWidth, height: imgHeight }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    </View>
  );
};

/**
 * MascotHead – High-resolution storybook illustration (transparent PNG via expo-image, no head sprout)
 * of the girl peeking from behind the white cloud input box on Form screens,
 * with her little paws gripping over the top edge of the card.
 */
export const MascotHead: React.FC<MascotProps> = ({ width = 144, height = 92, style }) => {
  const imgWidth = width;
  const imgHeight = Math.round(width * (308 / 512));
  // Align hair bottom (91.2% of imgHeight) to y = 69px (card top edge) so her paws overhang the card border
  const hairBottomInImg = Math.round(imgHeight * 0.912);
  const topOffset = 69 - hairBottomInImg;

  return (
    <View pointerEvents="none" style={[styles.headWrap, { width, height }, style]}>
      <Image
        source={mascotHeadSource}
        style={{ width: imgWidth, height: imgHeight, marginTop: topOffset }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    </View>
  );
};

/**
 * MascotCozy – High-resolution storybook illustration (transparent PNG via expo-image, no head sprout)
 * of the girl relaxing in a golden beanbag chair holding a warm mug,
 * paired with a cozy floor shadow and potted plant.
 */
export const MascotCozy: React.FC<MascotProps> = ({ width = 240, height = 168, style }) => {
  const charHeight = Math.round(height * 1.0);
  const charWidth = Math.round(charHeight * (512 / 512));

  return (
    <View pointerEvents="none" style={[styles.cozyContainer, { width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 260 180" style={StyleSheet.absoluteFill}>
        {/* Soft warm floor shadow */}
        <Ellipse cx={118} cy={166} rx={96} ry={11} fill="#DFD5BE" opacity={0.75} />

        {/* Potted Plant on the right */}
        <G transform="translate(198, 76)">
          <Path
            d="M14 54 L18 82 H38 L42 54 Z"
            fill="#8C583A"
            stroke="#4A2E1B"
            strokeWidth={2}
          />
          <Rect
            x={11}
            y={48}
            width={34}
            height={7}
            rx={3}
            fill="#A46B49"
            stroke="#4A2E1B"
            strokeWidth={2}
          />
          <Path d="M28 48 C20 30 6 24 8 12 C18 10 26 24 28 48 Z" fill="#4E8C35" />
          <Path d="M28 48 C28 24 22 6 30 0 C38 8 34 26 28 48 Z" fill="#7CB842" />
          <Path d="M28 48 C36 30 50 22 48 10 C38 10 30 26 28 48 Z" fill="#3B7A57" />
        </G>
      </Svg>

      <Image
        source={mascotCozySource}
        style={{ width: charWidth, height: charHeight, marginLeft: -22, marginTop: -2 }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    </View>
  );
};

/**
 * MascotRocket – High-resolution storybook illustration (transparent PNG via expo-image, no head sprout)
 * of the girl joyfully riding a golden-yellow rocket with star badges for the Target Hidup screen.
 */
export const MascotRocket: React.FC<MascotProps> = ({ width = 166, height = 149, style }) => {
  const imgWidth = width;
  const imgHeight = Math.round(width * (460 / 512));

  return (
    <View pointerEvents="none" style={[styles.wrap, { width, height: imgHeight }, style]}>
      <Image
        source={mascotRocketSource}
        style={{ width: imgWidth, height: imgHeight }}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={0}
      />
    </View>
  );
};

/**
 * MascotAvatar – Circular avatar badge using the high-res mascot illustration (without head sprout).
 */
export const MascotAvatar: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <View
    style={[
      styles.avatarCircle,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    <Image
      source={mascotHeadSource}
      style={{ width: size * 1.18, height: size * 0.82, marginTop: size * 0.12 }}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
    />
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
    justifyContent: 'flex-start',
  },
  headWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cozyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 2,
    borderColor: '#1E5A4C',
    shadowColor: '#8A7A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
});
