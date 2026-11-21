import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { fontFamily } from '@/theme/tokens';
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

      <AppText variant="titleMedium" style={styles.headerTitle}>
        {title}
      </AppText>

      <View style={styles.rightSlot}>
        {rightAction || null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: s.card, alignItems: 'center', justifyContent: 'center', },
  backBtnPressed: {
    transform: [{ scale: 0.95 }],
  },
  headerTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: s.ink, flex: 1, textAlign: 'left', },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
