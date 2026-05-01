import { create } from 'zustand'
import api from '../lib/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    set({ user: res.data })
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  },
}))