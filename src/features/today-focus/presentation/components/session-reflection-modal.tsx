import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Star, Sparkles } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText, Button, AppBottomSheet, Banner } from '@/shared/ui';

export interface SessionReflectionData { rating: number; obstacle?: string; nextAction?: string; }
export interface SessionReflectionModalProps {
  visible: boolean; durationMinutes: number; taskTitle?: string; onClose: () => void;
  onSubmit: (data: SessionReflectionData) => Promise<void>;
}
export const SessionReflectionModal: React.FC<SessionReflectionModalProps> = ({ visible, durationMinutes, taskTitle, onClose, onSubmit }) => {
  const lock = useRef(false);
  const [rating, setRating] = useState(4);
  const [obstacle, setObstacle] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSave = async () => {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ rating, obstacle: obstacle.trim() || undefined, nextAction: nextAction.trim() || undefined });
      setObstacle(''); setNextAction(''); setRating(4);
      onClose();
    } catch {
      setError('Refleksi belum tersimpan. Coba lagi; isianmu tetap ada.');
    } finally { lock.current = false; setSaving(false); }
  };
  return (
    <AppBottomSheet visible={visible} onClose={() => { if (!lock.current) onClose(); }}
      title="Satu sesi, satu kemajuan." subtitle={(durationMinutes === 0 ? 'Kurang dari 1 menit fokus' : durationMinutes + ' menit fokus') + (taskTitle ? ' · ' + taskTitle : '')}
      icon={<Sparkles size={22} color={colors.primary} />}
      footer={<Button title="Simpan refleksi" loading={saving} onPress={handleSave} />}>
      <View style={styles.intro}><AppText variant="bodyMedium" color="onSecondaryContainer">Sesi sudah tercatat. Refleksi ini opsional; kamu boleh menutup dialog tanpa kehilangan aktivitas.</AppText></View>
      {error && <Banner variant="error" message={error} />}
      <AppText variant="titleSmall" style={styles.label}>Bagaimana kualitas fokusmu?</AppText>
      <View style={styles.stars}>{[1, 2, 3, 4, 5].map(star => <Pressable key={star}
        disabled={saving} onPress={() => setRating(star)} accessibilityRole="button" accessibilityLabel={star + ' dari 5 bintang'}
        accessibilityState={{ selected: rating === star }} style={styles.star}>
        <Star size={28} color={star <= rating ? colors.onHighlight : colors.outline} fill={star <= rating ? colors.highlight : 'transparent'} />
      </Pressable>)}</View>
      <AppText variant="labelLarge" style={styles.label}>Hambatan atau distraksi (opsional)</AppText>
      <TextInput accessibilityLabel="Hambatan atau distraksi" editable={!saving} value={obstacle} onChangeText={setObstacle}
        placeholder="Apa yang mengganggu fokusmu?" placeholderTextColor={colors.onSurfaceSubtle} style={styles.input} />
      <AppText variant="labelLarge" style={styles.label}>Langkah berikutnya (opsional)</AppText>
      <TextInput accessibilityLabel="Langkah berikutnya" editable={!saving} value={nextAction} onChangeText={setNextAction}
        placeholder="Langkah kecil setelah beristirahat…" placeholderTextColor={colors.onSurfaceSubtle} multiline style={[styles.input, styles.multiline]} />
    </AppBottomSheet>
  );
};
const styles = StyleSheet.create({
  intro: { backgroundColor: colors.secondaryContainer, padding: space[4], borderRadius: radius.lg, marginBottom: space[4] },
  label: { marginBottom: space[2], marginTop: space[3] },
  stars: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: space[3] },
  star: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  input: { minHeight: 56, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.md, padding: space[3], color: colors.onSurface, fontSize: 14, fontFamily: fontFamily.regular },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
