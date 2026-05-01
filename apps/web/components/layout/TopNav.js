'use client'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import WorkspaceSwitcher from './WorkspaceSwitcher'

export default function TopNav() {
  const { user } = useAuthStore()
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
      style={{ borderBottomWidth: 1, borderBottomColor: accent }}
    >
      <WorkspaceSwitcher />

      <input
        type="text"
        placeholder="Search..."
        className="hidden md:block w-64 px-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
      />

      <div className="flex items-center gap-3">
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-lg">🔔</button>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: accent }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}