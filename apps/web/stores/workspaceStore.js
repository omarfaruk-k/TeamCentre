import { create } from 'zustand'
import api from '../lib/api'

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  active: null,
  role: null,

  fetchWorkspaces: async () => {
    const res = await api.get('/workspaces')
    set({ workspaces: res.data })
    return res.data
  },

  setActive: (workspace) => set({ active: workspace, role: workspace.role }),

  createWorkspace: async (name, accentColor) => {
    const res = await api.post('/workspaces', { name, accentColor })
    set((s) => ({ workspaces: [...s.workspaces, res.data] }))
    return res.data
  },
}))