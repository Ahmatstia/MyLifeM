import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Bell, CalendarDays, ChevronRight, CheckCheck, Clock3 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Screen, AppText, FormScreenHeader } from '@/shared/ui';
import { todayColors as c } from '@/theme/today';
import { space } from '@/theme/tokens';
import { useNotificationStore } from '@/shared/notifications/notification-store';
import { backOrHome } from '@/shared/utils/back-or-home';

export default function NotificationsScreen() {
  const { notices, markRead } = useNotificationStore();
  const unread = notices.filter(item => !item.read).length;
  return <Screen style={{ backgroundColor: c.paper }}>
    <FormScreenHeader title="Notifikasi" onBack={backOrHome} rightAction={null} />
    <View style={styles.heading}><AppText variant="headlineSmall" color={c.ink}>{unread ? `${unread} perlu dilihat` : 'Kabar untukmu'}</AppText>
      {unread > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Tandai semua dibaca" onPress={() => markRead()} style={styles.mark}><CheckCheck size={20} color={c.ink} /></Pressable>}
    </View>
    <AppText color={c.muted}>Info pengingat berkumpul di sini. Ketuk untuk melihat detail dan menindaklanjutinya.</AppText>
    {notices.length === 0 && <View style={styles.empty}><View style={styles.stamp}><Bell size={30} color={c.mintInk} /></View><AppText variant="titleLarge" color={c.ink}>Tidak ada peringatan</AppText><AppText color={c.muted} align="center">Jika ada pengingat yang perlu diperiksa, kamu akan menemukannya di sini.</AppText></View>}
    {notices.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}${item.read ? '' : ', belum dibaca'}`} onPress={() => { markRead(item.id); router.push({ pathname: '/reminders', params: { kind: item.kind, notice: item.id } }); }} style={[styles.card, !item.read && { borderColor: c.gold }]}>
      <View style={[styles.icon, { backgroundColor: item.kind === 'calendar' ? c.lilac : c.sky }]}>{item.kind === 'calendar' ? <CalendarDays size={22} color={c.ink} /> : <Clock3 size={22} color={c.ink} />}</View>
      <View style={styles.copy}><AppText variant="titleMedium" color={c.ink}>{item.title}</AppText><AppText variant="bodySmall" color={c.muted} numberOfLines={2}>{item.message}</AppText></View>
      <ChevronRight size={18} color={c.muted} />
    </Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="Cara kerja pengingat kalender" onPress={() => router.push({ pathname: '/reminders', params: { kind: 'calendar' } })} style={styles.info}>
      <CalendarDays size={20} color={c.lilacInk} /><AppText variant="labelLarge" color={c.lilacInk} style={styles.copy}>Cara kerja pengingat kalender</AppText><ChevronRight size={18} color={c.lilacInk} />
    </Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
 heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
 mark: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: c.mint },
 card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: c.line, borderRadius: 22, backgroundColor: c.card },
 icon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
 copy: { flex: 1, gap: 4 },
 empty: { alignItems: 'center', gap: 12, paddingVertical: 32, paddingHorizontal: 16 },
 stamp: { width: 64, height: 64, borderRadius: 24, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
 info: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, padding: 14, borderRadius: 18, backgroundColor: c.lilac },
});
