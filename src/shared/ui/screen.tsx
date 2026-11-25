import React from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { layout, screenGutter, space, touchTarget } from '@/theme/tokens';

export interface ScreenProps {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  floatingAction?: React.ReactNode;
  insideTabs?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children, overlay, floatingAction, insideTabs = false, scrollable = true,
  style, contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const gutter = screenGutter(width - insets.left - insets.right);
  const bottom = insideTabs ? 0 : insets.bottom;
  const content = [
    styles.content,
    contentContainerStyle,
    {
      paddingHorizontal: gutter,
      paddingBottom: space[4] + bottom + (floatingAction ? touchTarget.min + space[4] : 0),
    },
  ];

  return (
    <View style={[styles.root, style, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <StatusBar style="dark" />
      <View style={styles.column}>
        {scrollable ? (
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false} contentContainerStyle={content}>
            {children}
          </ScrollView>
        ) : <View style={content}>{children}</View>}
        {floatingAction && (
          <View style={[styles.floating, { right: gutter, bottom: bottom + space[4] }]}>{floatingAction}</View>
        )}
      </View>
      {overlay}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  column: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: layout.maxWidth },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingTop: layout.screenTop, gap: layout.sectionGap },
  floating: { position: 'absolute' },
});
