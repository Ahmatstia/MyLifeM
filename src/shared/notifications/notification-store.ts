import { create } from 'zustand';

export interface AppNotice {
  id: string;
  title: string;
  message: string;
  kind: 'calendar' | 'tasks';
  read: boolean;
}
interface NoticeState {
  notices: AppNotice[];
  publish: (notice: Omit<AppNotice, 'read'> | null, id: string) => void;
  markRead: (id?: string) => void;
}
// Live status inbox: resolved issues disappear and repeated syncs keep the read state.
export const useNotificationStore = create<NoticeState>((set) => ({
  notices: [],
  publish: (notice, id) => set(state => {
    const previous = state.notices.find(item => item.id === id);
    if (!notice) return previous ? { notices: state.notices.filter(item => item.id !== id) } : state;
    if (previous?.message === notice.message && previous.title === notice.title) return state;
    return { notices: [{ ...notice, id, read: false }, ...state.notices.filter(item => item.id !== id)] };
  }),
  markRead: id => set(state => ({ notices: state.notices.map(item => !id || item.id === id ? { ...item, read: true } : item) })),
}));
