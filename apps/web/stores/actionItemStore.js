import { create } from 'zustand'
import api from '../lib/api'

export const useActionItemStore = create((set, get) => ({
  items: [],

  fetchItems: async (workspaceId) => {
    const res = await api.get(`/workspaces/${workspaceId}/action-items`)
    set({ items: res.data })
  },

  createItem: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/action-items`, data)
    set((s) => ({ items: [res.data, ...s.items] }))
    return res.data
  },

  // Optimistic move
  moveItem: (workspaceId, id, newStatus) => {
    const prev = get().items
    set((s) => ({
      items: s.items.map((i) => i.id === id ? { ...i, status: newStatus } : i)
    }))
    api.patch(`/workspaces/${workspaceId}/action-items/${id}`, { status: newStatus })
      .catch(() => {
        set({ items: prev })
      })
  },

  deleteItem: async (workspaceId, id) => {
    await api.delete(`/workspaces/${workspaceId}/action-items/${id}`)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  }
}))