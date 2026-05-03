import { create } from 'zustand'
import api from '../lib/api'

export const useNotificationStore = create((set) => ({
  notifications: [],
  unread: 0,

  fetchNotifications: async () => {
    const res = await api.get('/notifications')
    set({
      notifications: res.data,
      unread: res.data.filter((n) => !n.read).length
    })
  },

  markAllRead: async () => {
    await api.patch('/notifications/read')
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unread: 0
    }))
  },

  addNotification: (notif) => set((s) => ({
    notifications: [notif, ...s.notifications],
    unread: s.unread + 1
  }))
}))