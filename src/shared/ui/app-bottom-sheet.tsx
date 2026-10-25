import React from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius, space, elevation } from '@/theme/tokens';
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
 * Bottom sheet bersama dengan area aksi di luar isi yang dapat digulir.
 * Memastikan overlay menutupi 100% layar (termasuk status bar & navigation bar Android),
 * dilengkapi backdrop dismiss, rounded pill handle, dan safe-area bottom yang rapi.
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
  maxHeight = '90%',
  scrollable = true,
  contentContainerStyle,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Full-screen backdrop: klik luar untuk menutup sheet */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tutup dialog"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardAvoid, { paddingTop: insets.top + space[4] }]}
        >
          <View
            style={[
              styles.sheetContainer,
              {
                maxHeight,
                paddingBottom: Math.max(insets.bottom, space[4]) + space[3],
              },
              style,
            ]}
          >
            {/* Cute Handle Pill */}
            <View style={styles.handleStrip}>
              <View style={styles.handle} />
            </View>

            {/* Standard Header */}
            {(title || icon || headerRight !== undefined) && (
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  {icon && <View style={styles.iconCircle}>{icon}</View>}
                  <View style={styles.titleCol}>
                    {title && (
                      <AppText variant="titleLarge">
                        {title}
                      </AppText>
                    )}
                    {subtitle && (
                      <AppText variant="bodySmall" color="onSurfaceVariant">
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
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={colors.onSurfaceVariant} />
                  </Pressable>
                )}
              </View>
            )}

            {/* Content Area */}
            {scrollable ? (
              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
            )}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flexShrink: 1,
    backgroundColor: colors.surfaceContainerLowest, // Solid murni #FFFFFF
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    width: '100%',
    ...elevation.level3,
  },
  handleStrip: {
    alignItems: 'center',
    paddingTop: space[3],
    paddingBottom: space[1],
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: space[3],
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  closeBtn: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  scroll: { flexShrink: 1 },
  footer: { paddingHorizontal: space[4], paddingTop: space[3], borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  scrollContent: {
    padding: space[4],
  },
  staticContent: {
    padding: space[4],
  },
});
