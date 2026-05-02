import { useEffect } from 'react'
import { getSocket } from '../lib/socket'
import { useAuthStore } from '../stores/authStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { useAnnouncementStore } from '../stores/announcementStore'
import { useActionItemStore } from '../stores/actionItemStore'
import { useGoalStore } from '../stores/goalStore'

export function useSocket() {
  const { user } = useAuthStore()
  const { active: workspace } = useWorkspaceStore()
  const announcementStore = useAnnouncementStore()
  const actionItemStore = useActionItemStore()
  const goalStore = useGoalStore()

  useEffect(() => {
    if (!user || !workspace) return
    const socket = getSocket()

    socket.connect()
    socket.emit('join:workspace', { workspaceId: workspace.id, userId: user.id })

    socket.on('announcement:created', ({ announcement }) => {
      announcementStore.fetchAnnouncements(workspace.id)
    })

    socket.on('announcement:pinned', ({ announcementId, pinned }) => {
      useAnnouncementStore.setState((s) => ({
        announcements: s.announcements
          .map((a) => a.id === announcementId ? { ...a, pinned } : a)
          .sort((a, b) => b.pinned - a.pinned)
      }))
    })

    socket.on('reaction:updated', ({ announcementId, reactions }) => {
      useAnnouncementStore.setState((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === announcementId ? { ...a, reactions } : a
        )
      }))
    })

socket.on('comment:created', ({ announcementId, comment }) => {
  useAnnouncementStore.setState((s) => ({
    announcements: s.announcements.map((a) => {
      if (a.id !== announcementId) return a
      const already = a.comments?.some(c => c.id === comment.id)
      if (already) return a
      return { ...a, comments: [...(a.comments || []), comment] }
    })
  }))
})

    socket.on('actionItem:updated', ({ actionItem }) => {
      useActionItemStore.setState((s) => ({
        items: s.items.map((i) => i.id === actionItem.id ? actionItem : i)
      }))
    })

socket.on('goal:updated', ({ goal }) => {
  useGoalStore.setState((s) => ({
    goals: s.goals.map((g) => g.id === goal.id ? goal : g),
    active: s.active?.id === goal.id ? goal : s.active
  }))
})

socket.on('goal:update:added', ({ update }) => {
  useGoalStore.setState((s) => ({
    active: s.active?.id === update.goalId
      ? { ...s.active, updates: [update, ...(s.active.updates || [])] }
      : s.active
  }))
})

    return () => {
      socket.emit('leave:workspace', { workspaceId: workspace.id, userId: user.id })
      socket.off('announcement:created')
      socket.off('announcement:pinned')
      socket.off('reaction:updated')
      socket.off('comment:created')
      socket.off('actionItem:updated')
      socket.off('goal:updated')
      socket.off('goal:update:added')
      socket.disconnect()
    }
  }, [user, workspace?.id])
}