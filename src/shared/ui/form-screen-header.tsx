import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
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

      <AppText variant="titleMedium" style={styles.headerTitle} numberOfLines={1}>
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
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: s.card,
    borderWidth: 1,
    borderColor: '#EBE3D0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8A7A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtnPressed: {
    transform: [{ scale: 0.95 }],
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: s.ink,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: space[2],
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
