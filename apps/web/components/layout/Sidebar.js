'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import UserMenu from './UserMenu'
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Megaphone,
  Users
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Action Items', href: '/action-items', icon: CheckSquare },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Members', href: '/members', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-full"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderLeft: '3px solid var(--accent)',
      }}
    >
      {/* App name — top left */}
      <div className="px-4 h-12 flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
<Link href="/">
  <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
    Team Hub
  </span>
</Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={isActive ? {
                backgroundColor: accent + '20',
                color: accent,
              } : {
                color: 'var(--text-muted)',
              }}
              onMouseEnter={e => {
  if (!isActive) {
    e.currentTarget.style.backgroundColor = accent + '10'
    e.currentTarget.style.color = accent
  }
}}
onMouseLeave={e => {
  if (!isActive) {
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.color = 'var(--text-muted)'
  }
}}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.label}


            </Link>
          )
        })}
      </nav>

      {/* Bottom — user menu */}
      <div className="p-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <UserMenu />
      </div>
    </aside>
  )
}