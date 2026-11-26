import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { todayColors as c } from '@/theme/today';
import { AppText } from '@/shared/ui/app-text';
import { useNotificationStore } from './notification-store';

export function NotificationButton() {
  const unread = useNotificationStore(state => state.notices.filter(item => !item.read).length);
  return <Pressable accessibilityRole="button" accessibilityLabel={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
    onPress={() => router.push('/notifications')} style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.96 }] }]}>
    <Bell size={23} color={c.ink} strokeWidth={2} />
    {unread > 0 && <View style={styles.badge}><AppText variant="labelSmall" color={c.ink}>{unread > 9 ? '9+' : unread}</AppText></View>}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 19, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -2, top: -2, minWidth: 21, minHeight: 21, borderRadius: 11, paddingHorizontal: 4, borderWidth: 2, borderColor: c.paper, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
});
