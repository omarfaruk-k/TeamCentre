import { create } from 'zustand'
import api from '../lib/api'

export const useGoalStore = create((set, get) => ({
  goals: [],
  active: null,

  fetchGoals: async (workspaceId, status) => {
    const res = await api.get(`/workspaces/${workspaceId}/goals`, { params: { status } })
    set({ goals: res.data })
  },

  fetchGoal: async (workspaceId, goalId) => {
    const res = await api.get(`/workspaces/${workspaceId}/goals/${goalId}`)
    set({ active: res.data })
  },

  createGoal: async (workspaceId, data) => {
    const res = await api.post(`/workspaces/${workspaceId}/goals`, data)
    set((s) => ({ goals: [res.data, ...s.goals] }))
    return res.data
  },

  updateGoal: async (workspaceId, goalId, data) => {
    const res = await api.patch(`/workspaces/${workspaceId}/goals/${goalId}`, data)
    set((s) => ({
      goals: s.goals.map((g) => g.id === goalId ? res.data : g),
      active: s.active?.id === goalId ? res.data : s.active
    }))
  },

  deleteGoal: async (workspaceId, goalId) => {
    await api.delete(`/workspaces/${workspaceId}/goals/${goalId}`)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }))
  },

  addUpdate: async (workspaceId, goalId, content) => {
    const res = await api.post(`/workspaces/${workspaceId}/goals/${goalId}/updates`, { content })
    set((s) => ({
      active: s.active ? { ...s.active, updates: [res.data, ...(s.active.updates || [])] } : s.active
    }))
  },

toggleMilestone: async (workspaceId, goalId, milestoneId, completed) => {
  const prev = get().active
  // Optimistic update for milestone only
  set((s) => ({
    active: s.active ? {
      ...s.active,
      milestones: s.active.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed } : m
      )
    } : s.active
  }))
  try {
    const res = await api.patch(
      `/workspaces/${workspaceId}/goals/${goalId}/milestones/${milestoneId}`,
      { completed }
    )
    // Sync full goal including recalculated progress
    set({ active: res.data })
  } catch {
    set({ active: prev })
  }
}
}))