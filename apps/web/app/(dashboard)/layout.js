'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useWorkspaceAccent } from '../../hooks/useWorkspaceAccent'
import Sidebar from '../../components/layout/Sidebar'
import TopNav from '../../components/layout/TopNav'

export default function DashboardLayout({ children }) {
  const { user, loading, fetchMe } = useAuthStore()
  const { fetchWorkspaces, setActive, workspaces, active } = useWorkspaceStore()
  const router = useRouter()
  useWorkspaceAccent()

  useEffect(() => { fetchMe() }, [])

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return }
    if (user) {
      fetchWorkspaces().then((list) => {
        if (list.length > 0 && !active) setActive(list[0])
      })
    }
  }, [user, loading])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  )
  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}