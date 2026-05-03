'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useWorkspaceAccent } from '../../hooks/useWorkspaceAccent'
import Sidebar from '../../components/layout/Sidebar'
import TopNav from '../../components/layout/TopNav'
import { useSocket } from '../../hooks/useSocket'

export default function DashboardLayout({ children }) {
  const { user, loading, fetchMe } = useAuthStore()
  const { fetchWorkspaces, setActive, workspaces,restoreActive, active } = useWorkspaceStore()
  const router = useRouter()
  useWorkspaceAccent()
  useSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { fetchMe() }, [])

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return }
    if (user) {
      fetchWorkspaces().then((list) => {
        if (list.length > 0) restoreActive(list)
      })
    }
  }, [user, loading])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-[var(--text2)]">Loading...</div>
  )
  if (!user) return null

return (
  <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
    
    {/* Unified frame — sidebar + right wrapper share same tinted bg */}
    <div className="flex w-full h-full"
      style={{
        backgroundColor: (active?.accentColor || '#7C6EF0') + '12',
      }}>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right side — topnav + main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main content inset — dotted, darker */}
        <main className="flex-1 overflow-y-auto dotted-bg m-2 mt-0 rounded-xl"
          style={{
            backgroundColor: 'var(--bg)',
            border: `1px solid ${active?.accentColor || '#7C6EF0'}60`,
          }}>
          <div className="p-3 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  </div>
)
  // return (
  //   <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
  //     <Sidebar />
  //     <div className="flex-1 flex flex-col overflow-hidden">
  //       <TopNav />
  //       <main className="flex-1 overflow-y-auto p-6 dotted-bg">{children}</main>
  //     </div>
  //   </div>
  // )
}