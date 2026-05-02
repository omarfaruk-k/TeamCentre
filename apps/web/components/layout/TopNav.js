'use client'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useOnlineMembers } from '../../hooks/useOnlineMembers'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/api'

export default function TopNav() {
  const { active } = useWorkspaceStore()
  const accent = active?.accentColor || '#7C3AED'
  const onlineIds = useOnlineMembers()
  const [members, setMembers] = useState([])

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
      <WorkspaceSwitcher />

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
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}