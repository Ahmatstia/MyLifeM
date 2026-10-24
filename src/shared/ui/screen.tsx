import React from 'react';
import {
  View,
  ScrollView,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withHorizontalPadding?: boolean;
  withBottomPadding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = true,
  withHorizontalPadding = true,
  withBottomPadding = true,
  style,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
  };

  const horizontalPadding = withHorizontalPadding ? space[4] : 0;
  // Extra bottom padding for Android gesture bar and tabs
  const bottomPadding = (withBottomPadding ? 80 : 0) + insets.bottom + space[4];

  if (scrollable) {
    return (
      <View style={[containerStyle, style]}>
        <StatusBar style="light" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: bottomPadding,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        containerStyle,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: bottomPadding,
        },
        style,
      ]}
    >
      <StatusBar style="light" />
      {children}
    </View>
  );
};
