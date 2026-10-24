import React from 'react';
import { View, Pressable, type ViewStyle, StyleSheet } from 'react-native';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from './app-text';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  message: string;
  variant?: BannerVariant;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const Banner: React.FC<BannerProps> = ({
  message,
  variant = 'info',
  actionText,
  onActionPress,
  style,
}) => {
  let backgroundColor: string = colors.primaryContainer;
  let onContainerColor: string = colors.onPrimaryContainer;
  let IconComponent = Info;

  switch (variant) {
    case 'info':
      backgroundColor = colors.primaryContainer;
      onContainerColor = colors.onPrimaryContainer;
      IconComponent = Info;
      break;
    case 'warning':
      backgroundColor = colors.warningContainer;
      onContainerColor = colors.onWarningContainer;
      IconComponent = AlertTriangle;
      break;
    case 'error':
      backgroundColor = colors.errorContainer;
      onContainerColor = colors.onErrorContainer;
      IconComponent = AlertCircle;
      break;
    case 'success':
      backgroundColor = colors.successContainer;
      onContainerColor = colors.onSuccessContainer;
      IconComponent = CheckCircle2;
      break;
  }

  const containerStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.lg,
    padding: space[4], // 16 dp
    flexDirection: 'row',
    alignItems: 'center',
  };

  return (
    <View style={[containerStyle, style]}>
      {/* Icon 24 dp with on...Container color per DESIGN.md */}
      <View style={styles.iconWrapper}>
        <IconComponent size={24} color={onContainerColor} />
      </View>

      {/* Message Text with on...Container color */}
      <View style={styles.textWrapper}>
        <AppText variant="bodyMedium" style={{ color: onContainerColor }}>
          {message}
        </AppText>
      </View>

      {/* Optional action text button */}
      {actionText && onActionPress && (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          style={styles.actionButton}
        >
          <AppText
            variant="labelLarge"
            style={{ color: onContainerColor, textDecorationLine: 'underline' }}
          >
            {actionText}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    marginRight: space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  actionButton: {
    marginLeft: space[3],
    paddingVertical: space[1],
    paddingHorizontal: space[2],
  },
});
