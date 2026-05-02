import { create } from 'zustand'
import api from '../lib/api'

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],

  fetchAnnouncements: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/announcements`)
    set({ announcements: res.data })
  },

  createAnnouncement: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/announcements`, data)
    set((s) => ({ announcements: [res.data, ...s.announcements] }))
  },

  togglePin: async (workspaceId, id) => {
    const res = await api.patch(`/workspaces/${workspaceId}/announcements/${id}/pin`)
    set((s) => ({
      announcements: s.announcements
        .map((a) => a.id === id ? { ...a, pinned: res.data.pinned } : a)
        .sort((a, b) => b.pinned - a.pinned)
    }))
  },

  deleteAnnouncement: async (workspaceId, id) => {
    await api.delete(`/workspaces/${workspaceId}/announcements/${id}`)
    set((s) => ({ announcements: s.announcements.filter((a) => a.id !== id) }))
  },

  // Optimistic reaction toggle
  toggleReaction: async (workspaceId, announcementId, emoji) => {
    const prev = get().announcements
    const userId = null // will be confirmed by server
    set((s) => ({
      announcements: s.announcements.map((a) => {
        if (a.id !== announcementId) return a
        const exists = a.reactions?.find((r) => r.emoji === emoji && r.userId === userId)
        const reactions = exists
          ? a.reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
          : [...(a.reactions || []), { emoji, userId, id: 'temp' }]
        return { ...a, reactions }
      })
    }))
    try {
      const res = await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, { emoji })
      set((s) => ({
        announcements: s.announcements.map((a) => a.id === announcementId ? { ...a, reactions: res.data } : a)
      }))
    } catch {
      set({ announcements: prev })
    }
  },

  addComment: async (workspaceId, announcementId, content) => {
    const res = await api.post(`/workspaces/${workspaceId}/announcements/${announcementId}/comments`, { content })
    set((s) => ({
      announcements: s.announcements.map((a) =>
        a.id === announcementId ? { ...a, comments: [...(a.comments || []), res.data] } : a
      )
    }))
  }
}))