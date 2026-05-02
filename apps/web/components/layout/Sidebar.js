'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useOnlineMembers } from '../../hooks/useOnlineMembers'
import { useState, useEffect } from 'react'
import api from '../../lib/api'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '⊞' },
  { label: 'Goals', href: '/goals', icon: '◎' },
  { label: 'Action Items', href: '/action-items', icon: '✓' },
  { label: 'Announcements', href: '/announcements', icon: '📢' },
  { label: 'Members', href: '/members', icon: '👥' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuthStore()
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'
  const onlineIds = useOnlineMembers()

const [members, setMembers] = useState([])

useEffect(() => {
  if (active) {
    api.get(`/workspaces/${active.id}/members`).then((r) => setMembers(r.data))
  }
}, [active?.id])

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full border-r border-slate-200 dark:border-slate-700"
      style={{
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: accent,
        backgroundColor: accent + '10',
      }}
    >
      <div className="p-4 font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
        {active?.name || 'Team Hub'}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={isActive ? {
                backgroundColor: accent + '20',
                color: accent,
              } : {}}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      {members.length > 0 && (
  <div className="px-4 pb-3">
    <p className="text-xs text-slate-400 uppercase font-medium mb-2">Members</p>
    {members.map((m) => (
      <div key={m.user.id} className="flex items-center gap-2 py-1">
        <div className="relative">
          <div className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ backgroundColor: accent }}>
            {m.user.name[0].toUpperCase()}
          </div>
          {onlineIds.has(m.user.id) && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
          )}
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-300">{m.user.name}</span>
      </div>
    ))}
  </div>
)}

      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          ⚙ Settings
        </Link>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 w-full text-left">
          ⇥ Logout
        </button>
      </div>
    </aside>
  )
}