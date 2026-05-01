'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import api from '../../../lib/api'

const ROLE_COLORS = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  MEMBER: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function MembersPage() {
  const { active, role } = useWorkspaceStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    if (!active) return
    fetchMembers()
  }, [active])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/workspaces/${active.id}/members`)
      setMembers(res.data)
    } catch {
      setError('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setInviting(true)
    try {
      const res = await api.post(`/workspaces/${active.id}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      })
      setMembers((prev) => [...prev, res.data])
      setSuccess(`${inviteEmail} added successfully!`)
      setInviteEmail('')
      setShowInvite(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Invite failed')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/workspaces/${active.id}/members/${userId}`, { role: newRole })
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      )
    } catch {
      setError('Failed to update role')
    }
  }

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/workspaces/${active.id}/members/${userId}`)
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
    } catch {
      setError('Failed to remove member')
    }
  }

  if (loading) return <div className="text-slate-500">Loading members...</div>

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Members</h1>
          <p className="text-sm text-slate-500 mt-1">{members.length} member{members.length !== 1 ? 's' : ''} in {active?.name}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{ backgroundColor: active?.accentColor || '#7C3AED' }}
          >
            + Invite member
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      {/* Invite form */}
      {showInvite && isAdmin && (
        <form
          onSubmit={handleInvite}
          className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm outline-none"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: active?.accentColor || '#7C3AED' }}
          >
            {inviting ? 'Inviting...' : 'Send invite'}
          </button>
        </form>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: active?.accentColor || '#7C3AED' }}
              >
                {m.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.user?.name}</p>
                <p className="text-xs text-slate-500">{m.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Role badge / selector */}
              {isAdmin ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              ) : (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                  {m.role}
                </span>
              )}

              {/* Remove button (admin only, can't remove yourself) */}
              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}