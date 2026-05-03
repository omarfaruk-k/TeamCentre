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
  Users,
  X
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Action Items', href: '/action-items', icon: CheckSquare },
  { label: 'Announcements', href: '/announcements', icon: Megaphone },
  { label: 'Members', href: '/members', icon: Users },
]

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-56 shrink-0 flex flex-col z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderLeft: '3px solid var(--accent)',
        }}
      >
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] md:hidden">
        <X size={16} />
      </button>

      {/* App name — top left */}
      <div className="px-4 h-12 flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
<Link href="/">
  <img
    src="/logo-dark.svg"
    alt="TeamCentre"
    className="h-10 w-auto object-contain logo-dark"
  />
  <img
    src="/logo-light.svg"
    alt="TeamCentre"
    className="h-10 w-auto object-contain logo-light"
  />
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
              onClick={onClose}
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
      {/* Workspace description */}
{active?.description && (
  <div className="px-3 py-2 mx-2 mb-2 rounded-lg shrink-0"
    style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}25` }}>
    <p className="text-xs font-medium mb-0.5" style={{ color: accent }}>
      {active.name}
    </p>
    <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
      {active.description}
    </p>
  </div>
)}

      {/* Bottom — user menu */}
      <div className="p-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <UserMenu />
      </div>
    </aside></>
  )
}