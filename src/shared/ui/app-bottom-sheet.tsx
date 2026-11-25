import React from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { layout, screenGutter, fontFamily, radius, space, touchTarget, stroke } from '@/theme/tokens';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { AppText } from './app-text';

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: DimensionValue;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

/**
 * Full-screen form container modal yang menggantikan modal setengah layar sebelumnya.
 * Menampilkan formulir secara penuh 100% layar (edge-to-edge), dengan header terstruktur,
 * tombol tutup yang jelas, area formulir scrollable yang leluasa, dan footer aksi di bawah.
 */
export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  children,
  footer,
  scrollable = true,
  contentContainerStyle,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const gutter = screenGutter(width - insets.left - insets.right);
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType={reducedMotion ? 'none' : 'slide'}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View
            style={[
              styles.sheetContainer,
              {
                paddingTop: insets.top + layout.screenTop,
                paddingBottom: insets.bottom,
              },
              style,
            ]}
          >
            {/* Standard Full-Screen Header */}
            {(title || icon || headerRight !== undefined) && (
              <View style={[styles.header, { paddingHorizontal: gutter }]}>
                <View style={styles.headerLeft}>
                  {icon && <View style={styles.iconCircle}>{icon}</View>}
                  <View style={styles.titleCol}>
                    {title && (
                      <AppText accessibilityRole="header" variant="titleLarge" style={{ fontFamily: fontFamily.display }}>
                        {title}
                      </AppText>
                    )}
                    {subtitle && (
                      <AppText variant="bodyMedium" color="onSurfaceVariant">
                        {subtitle}
                      </AppText>
                    )}
                  </View>
                </View>

                {headerRight !== undefined ? (
                  headerRight
                ) : (
                  <Pressable
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Tutup modal"
                    style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
                  >
                    <X size={20} color={colors.onSurface} strokeWidth={2.4} />
                  </Pressable>
                )}
              </View>
            )}

            {/* Full-Screen Content Area */}
            {scrollable ? (
              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.scrollContent, contentContainerStyle, { paddingHorizontal: gutter }]}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.staticContent, contentContainerStyle, { paddingHorizontal: gutter }]}>{children}</View>
            )}

            {footer && <View style={[styles.footer, { paddingHorizontal: gutter }]}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  sheetContainer: {
    flex: 1,
    alignSelf: 'center',
    maxWidth: layout.maxWidth,
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[1],
    borderBottomWidth: stroke.hairline,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: space[3],
    marginRight: space[2],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  closeBtnPressed: { backgroundColor: colors.surfaceContainerHigh },
  closeBtn: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: stroke.hairline,
    borderColor: colors.outlineVariant,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    paddingTop: space[3],
    paddingBottom: space[2],
    borderTopWidth: stroke.hairline,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  scrollContent: {
    paddingVertical: space[4],
    paddingBottom: space[6],
    gap: layout.sectionGap,
  },
  staticContent: {
    flex: 1,
    paddingVertical: space[4],
    gap: space[3],
  },
});
