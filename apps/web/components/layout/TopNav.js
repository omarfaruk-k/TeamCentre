'use client'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useOnlineMembers } from '../../hooks/useOnlineMembers'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { Bell, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useNotificationStore } from '../../stores/notificationStore'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function TopNav({ onMenuClick }) {
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'
  const onlineIds = useOnlineMembers()
  const [members, setMembers] = useState([])
  const { notifications, unread, fetchNotifications, markAllRead } = useNotificationStore()
const [open, setOpen] = useState(false)
const bellRef = useRef(null)
const router = useRouter()

useEffect(() => { fetchNotifications() }, [])

  useEffect(() => {
    if (active) {
      api.get(`/workspaces/${active.id}/members`).then((r) => setMembers(r.data))
    }
  }, [active?.id])

  const onlineMembers = members.filter((m) => onlineIds.has(m.user.id))
  const MAX_SHOWN = 3

  return (
    <header
      className="h-12 flex items-center justify-between px-4 shrink-0"
      style={{
        backgroundColor: 'var(--bg-panel)',
        // borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left — workspace switcher */}
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="p-1.5 rounded-lg md:hidden hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <Menu size={18} />
        </button>
        <WorkspaceSwitcher />
      </div>

      {/* Right — online members + notif bell */}
      <div className="flex items-center gap-3">

        {/* Online member avatars */}
        {onlineMembers.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {onlineMembers.slice(0, MAX_SHOWN).map((m) => (
                <div
                  key={m.user.id}
                  title={m.user.name}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-[var(--text)] ring-1 ring-black"
                  style={{ backgroundColor: accent, borderColor: 'var(--bg-panel)' }}
                >
                  {m.user.avatarUrl ? (
                    <img src={m.user.avatarUrl} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    m.user.name[0].toUpperCase()
                  )}
                </div>
              ))}
            </div>
            {onlineMembers.length > MAX_SHOWN && (
              <span className="ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                +{onlineMembers.length - MAX_SHOWN}
              </span>
            )}
            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {onlineMembers.length} online
            </span>
          </div>
        )}

        {/* Notification bell */}
<div ref={bellRef} className="relative">
  <button
    onClick={() => { setOpen(!open); if (!open) markAllRead() }}
    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 relative"
    style={{ color: 'var(--text-muted)' }}>
    <Bell size={16} />
    {unread > 0 && (
      <span
        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
        style={{ backgroundColor: accent }}>
        {unread > 9 ? '9+' : unread}
      </span>
    )}
  </button>

  {open && (
    <div className="absolute right-0 top-10 w-80 bg-[var(--bg2)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
        <button onClick={markAllRead} className="text-xs text-[var(--text3)] hover:text-[var(--text2)] transition-colors">
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 && (
          <p className="text-xs text-[var(--text3)] text-center py-8">No notifications yet</p>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => { setOpen(false); if (n.link) router.push(n.link) }}
            className={`px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--bg3)] transition-colors ${!n.read ? 'bg-[var(--bg3)]' : ''}`}>
            <div className="flex items-start gap-2">
              {!n.read && (
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent }} />
              )}
              <div className={!n.read ? '' : 'ml-3.5'}>
                <p className="text-xs text-[var(--text)] leading-relaxed">{n.message}</p>
                <p className="text-xs text-[var(--text3)] mt-0.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
      </div>
    </header>
  )
}