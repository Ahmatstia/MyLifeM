import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { fontFamily, radius, space, touchTarget, typography } from '@/theme/tokens';
import { colors } from '@/theme/colors';
import { AppText } from './app-text';

const s = colors.sprout;

export interface FormScreenHeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const FormScreenHeader: React.FC<FormScreenHeaderProps> = ({
  title,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
      >
        <ArrowLeft size={20} color={s.ink} strokeWidth={2.5} />
      </Pressable>

      <AppText accessibilityRole="header" variant="titleMedium" style={styles.headerTitle}>
        {title}
      </AppText>

      <View style={styles.rightSlot}>
        {rightAction || null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[1],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: { backgroundColor: colors.primaryContainer },
  headerTitle: {
    ...typography.titleMedium,
    fontFamily: fontFamily.bold,
    color: s.ink,
    flex: 1,
    textAlign: 'left',
  },
  rightSlot: { alignItems: 'flex-end', justifyContent: 'center' },
});
