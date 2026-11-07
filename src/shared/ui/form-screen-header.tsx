import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from './app-text';

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
        <ArrowLeft size={18} color="#121316" strokeWidth={2.4} />
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
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
    backgroundColor: '#FCF8FF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: '#121316',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: space[2],
  },
  rightSlot: {
    minWidth: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

