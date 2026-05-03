import { create } from 'zustand'
import api from '../lib/api'

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  active: null,
  role: null,

  fetchWorkspaces: async () => {
    const res = await api.get('/workspaces')
    set({ workspaces: res.data })
    return res.data
  },

  setActive: (workspace) => {
    // persist chosen workspace id
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWorkspaceId', workspace.id)
    }
    set({ active: workspace, role: workspace.role })
  },

  restoreActive: (list) => {
    if (!list || list.length === 0) return
    const savedId = typeof window !== 'undefined'
      ? localStorage.getItem('activeWorkspaceId')
      : null
    const found = savedId ? list.find((w) => w.id === savedId) : null
    const workspace = found || list[0]
    set({ active: workspace, role: workspace.role })
  },

  createWorkspace: async (name, accentColor) => {
    const res = await api.post('/workspaces', { name, accentColor })
    set((s) => ({ workspaces: [...s.workspaces, res.data] }))
    return res.data
  },
}))