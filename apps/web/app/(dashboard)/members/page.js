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
    if (workspace) api.get(`/workspaces/${workspace.id}/members`).then((r) => setMembers(r.data))
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
      </div>

      {role === 'ADMIN' && (
        <form onSubmit={handleInvite} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <p className="text-sm font-medium mb-3">Invite by email</p>
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <input
              type="email" required placeholder="colleague@company.com"
              value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm"
            />
            <button type="submit" disabled={inviting}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: accent }}>
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {members.map((m) => (
          <div key={m.user.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-bold"
                  style={{ backgroundColor: accent }}>
                  {m.user.name[0].toUpperCase()}
                </div>
                {onlineIds.has(m.user.id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="text-xs text-slate-400">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role === 'ADMIN' ? (
                <>
                  <select value={m.role}
                    onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                    className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 outline-none">
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button onClick={() => handleRemove(m.user.id)}
                    className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                </>
              ) : (
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                  {m.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}