'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useOnlineMembers } from '../../../hooks/useOnlineMembers'
import api from '../../../lib/api'

export default function MembersPage() {
  const { active: workspace, role } = useWorkspaceStore()
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const onlineIds = useOnlineMembers()
  const accent = workspace?.accentColor || '#7C3AED'

  const load = () => {
    if (workspace) api.get(`/workspaces/${workspace.id}/members`).then((r) => {
  const sorted = r.data.sort((a, b) => {
    if (a.role !== b.role) return a.role === 'ADMIN' ? -1 : 1
    return a.user.name.localeCompare(b.user.name)
  })
  setMembers(sorted)
})
  }

  useEffect(() => { load() }, [workspace])

  const handleInvite = async (e) => {
    e.preventDefault()
    setError('')
    setInviting(true)
    try {
      await api.post(`/workspaces/${workspace.id}/invite`, { email: inviteEmail })
      setInviteEmail('')
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    await api.patch(`/workspaces/${workspace.id}/members/${userId}`, { role: newRole })
    load()
  }

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return
    await api.delete(`/workspaces/${workspace.id}/members/${userId}`)
    load()
  }

  const onlineCount = members.filter((m) => onlineIds.has(m.user.id)).length

  return (
    <div className="flex flex-col h-full">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Members</h1>
          <p className="text-sm text-[var(--text2)] mt-0.5">
            {members.length} members · {' '}
            <span className="text-emerald-400">{onlineCount} online</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">

        {/* Left — member list */}
        <div className="flex-1 min-w-0">
          <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 sm:px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
              <span className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">Member</span>
              <span className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">Role</span>
              {role === 'ADMIN' && (
                <span className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">Actions</span>
              )}
            </div>

            {members.length === 0 && (
              <div className="py-16 text-center text-[var(--text3)] text-sm">No members yet.</div>
            )}

            {members.map((m, i) => {
              const isOnline = onlineIds.has(m.user.id)
              return (
                <div
                  key={m.user.id}
                  className="grid grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 items-center px-3 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                >
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {m.user.avatarUrl ? (
                        <img
                          src={m.user.avatarUrl}
                          alt={m.user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full text-white text-sm flex items-center justify-center font-bold"
                          style={{ backgroundColor: accent }}>
                          {m.user.name[0].toUpperCase()}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg2)] ${isOnline ? 'bg-emerald-400' : 'bg-[var(--bg4)]'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">{m.user.name}</p>
                      <p className="text-xs text-[var(--text3)] truncate hidden sm:block">{m.user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    {role === 'ADMIN' ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                        className="text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-[var(--bg3)] text-[var(--text2)] outline-none cursor-pointer hover:border-[var(--border2)] transition-colors">
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    ) : (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: m.role === 'ADMIN' ? `${accent}20` : 'var(--bg3)',
                          color: m.role === 'ADMIN' ? accent : 'var(--text2)',
                          border: `1px solid ${m.role === 'ADMIN' ? `${accent}40` : 'var(--border)'}`
                        }}>
                        {m.role}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => handleRemove(m.user.id)}
                      className="text-xs text-[var(--text3)] hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — invite panel */}
        {role === 'ADMIN' && (
          <div className="w-full md:w-72 md:shrink-0">
            <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5 md:sticky md:top-0">
              <p className="text-sm font-semibold text-[var(--text)] mb-1">Invite a member</p>
              <p className="text-xs text-[var(--text3)] mb-4">They'll receive an email to join this workspace.</p>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-3">
                <input
                  type="email" required placeholder="colleague@company.com"
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm placeholder:text-[var(--text3)] focus:border-[var(--border2)] transition-colors"
                />
                <button
                  type="submit" disabled={inviting}
                  className="w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accent }}>
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </form>

              {/* Online members summary */}
              <div className="mt-5 pt-4 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-3">Online now</p>
                <div className="flex flex-wrap gap-2">
                  {members.filter((m) => onlineIds.has(m.user.id)).length === 0 && (
                    <p className="text-xs text-[var(--text3)]">No one online</p>
                  )}
                  {members.filter((m) => onlineIds.has(m.user.id)).map((m) => (
                    <div key={m.user.id} className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: accent }}>
                        {m.user.name[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-[var(--text2)]">{m.user.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}