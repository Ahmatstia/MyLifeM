import React from 'react';
import { View, type ViewStyle, StyleSheet } from 'react-native';
import { FolderOpen, CheckCircle, AlertOctagon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';
import { AppText } from './app-text';
import { Button } from './button';

export type EmptyStateVariant = 'initial' | 'completed' | 'error';

export interface EmptyStateProps {
  title: string;
  description: string;
  variant?: EmptyStateVariant;
  customIcon?: React.ReactNode;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  variant = 'initial',
  customIcon,
  actionTitle,
  onActionPress,
  style,
}) => {
  let circleBg: string = colors.primaryContainer;
  let iconColor: string = colors.onPrimaryContainer;
  let DefaultIcon = FolderOpen;

  switch (variant) {
    case 'initial':
      circleBg = colors.primaryContainer;
      iconColor = colors.onPrimaryContainer;
      DefaultIcon = FolderOpen;
      break;
    case 'completed':
      circleBg = colors.successContainer;
      iconColor = colors.onSuccessContainer;
      DefaultIcon = CheckCircle;
      break;
    case 'error':
      circleBg = colors.errorContainer;
      iconColor = colors.onErrorContainer;
      DefaultIcon = AlertOctagon;
      break;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Circle Icon with on...Container per DESIGN.md 7.16 */}
      <View style={[styles.iconCircle, { backgroundColor: circleBg }]}>
        {customIcon || <DefaultIcon size={32} color={iconColor} />}
      </View>

      {/* Explanatory Heading */}
      <AppText variant="titleMedium" color="onSurface" align="center" style={styles.title}>
        {title}
      </AppText>

      {/* Guiding Description */}
      <AppText
        variant="bodyMedium"
        color="onSurfaceVariant"
        align="center"
        style={styles.description}
      >
        {description}
      </AppText>

      {/* One single primary action to populate/recover */}
      {actionTitle && onActionPress && (
        <View style={styles.actionWrapper}>
          <Button
            title={actionTitle}
            onPress={onActionPress}
            variant="filled"
            size="standard"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[8], // 32 dp
    paddingHorizontal: space[5], // 20 dp
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[4], // 16 dp
  },
  title: {
    marginBottom: space[2], // 8 dp
  },
  description: {
    maxWidth: 280,
    marginBottom: space[6], // 24 dp
  },
  actionWrapper: {
    minWidth: 160,
  },
});
