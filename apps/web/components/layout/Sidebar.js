'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'

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