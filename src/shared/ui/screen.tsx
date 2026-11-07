import React from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { space } from '@/theme/tokens';

export interface ScreenProps {
  children: React.ReactNode;
   overlay?: React.ReactNode;
  scrollable?: boolean;
  withHorizontalPadding?: boolean;
  withBottomPadding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  overlay,
  scrollable = true,
  withHorizontalPadding = true,
  withBottomPadding = true,
  style,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const horizontalPadding = withHorizontalPadding ? (width < 360 ? space[4] : space[5]) : 0;
  // Extra bottom padding for Android gesture bar and tabs
  const bottomPadding = (withBottomPadding ? 80 : 0) + insets.bottom + space[4];

  if (scrollable) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
        <StatusBar style="dark" />
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              paddingTop: insets.top,
              paddingHorizontal: horizontalPadding,
              paddingBottom: bottomPadding,
              flexGrow: 1,
              width: '100%',
              maxWidth: 640,
              alignSelf: 'center',
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
        {overlay}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingHorizontal: horizontalPadding,
          paddingBottom: bottomPadding,
        },
        style,
      ]}
    >
      <StatusBar style="dark" />
      {children}
    </View>
  );
};
