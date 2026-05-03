'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWorkspaceStore } from '../../../../stores/workspaceStore'
import { useGoalStore } from '../../../../stores/goalStore'
import api from '../../../../lib/api'


const STATUS_CONFIG = {
  ON_TRACK:  { label: 'On Track',  bg: 'bg-[#14532d25]', text: 'text-emerald-400', border: 'border-[#14532d40]', dot: 'bg-emerald-400' },
  AT_RISK:   { label: 'At Risk',   bg: 'bg-[#78350f25]', text: 'text-amber-400',   border: 'border-[#78350f40]', dot: 'bg-amber-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-[#1e3a5f25]', text: 'text-blue-400',    border: 'border-[#1e3a5f40]', dot: 'bg-blue-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-[var(--bg4)]', text: 'text-[var(--text3)]', border: 'border-[var(--border)]', dot: 'bg-[var(--text3)]' },
}

export default function GoalDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { active: workspace, role } = useWorkspaceStore()
  const { active: goal, fetchGoal, addUpdate, toggleMilestone, updateGoal, deleteGoal } = useGoalStore()
  const [update, setUpdate] = useState('')
  const [newMilestone, setNewMilestone] = useState('')
  const [posting, setPosting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const accent = workspace?.accentColor || '#7C3AED'

  useEffect(() => {
    if (workspace && id) fetchGoal(workspace.id, id)
  }, [workspace, id])

  useEffect(() => {
    if (goal) setEditForm({
      title: goal.title,
      description: goal.description || '',
      status: goal.status,
      dueDate: goal.dueDate ? goal.dueDate.split('T')[0] : ''
    })
  }, [goal])

  const handlePostUpdate = async (e) => {
    e.preventDefault()
    if (!update.trim()) return
    setPosting(true)
    await addUpdate(workspace.id, id, update)
    setUpdate('')
    setPosting(false)
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!newMilestone.trim()) return
    await api.post(`/workspaces/${workspace.id}/goals/${id}/milestones`, { title: newMilestone })
    setNewMilestone('')
    fetchGoal(workspace.id, id)
  }

  const handleSaveEdit = async () => {
    await updateGoal(workspace.id, id, editForm)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    await deleteGoal(workspace.id, id)
    router.push('/goals')
  }

  if (!goal) return (
    <div className="flex items-center justify-center h-full text-[var(--text2)]">Loading...</div>
  )

  const cfg = STATUS_CONFIG[goal.status]
  const progress = goal.progress || 0
  const totalMilestones = goal.milestones?.length || 0
  const doneMilestones = goal.milestones?.filter((m) => m.completed).length || 0

  return (
    <div className="flex flex-col h-full">

      {/* Back */}
      <button
        onClick={() => router.push('/goals')}
        className="flex items-center gap-1.5 text-xs text-[var(--text2)] hover:text-[var(--text)] transition-colors mb-5 w-fit">
        ← Back to Goals
      </button>

      {/* Header card */}
      <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4 sm:p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xl font-bold bg-[var(--bg3)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--border2)]"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description..."
                  className="w-full text-sm bg-[var(--bg3)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] outline-none resize-none h-16 placeholder:text-[var(--text3)]"
                />
                <div className="flex flex-wrap gap-3">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm">
                    <option value="ON_TRACK">On Track</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <input
                    type="date" value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accent }}>
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 rounded-lg text-sm border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {goal.dueDate && (
                    <span className="text-xs text-[var(--text3)]">
                      Due {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-1">{goal.title}</h1>
                {goal.description && (
                  <p className="text-sm text-[var(--text2)] leading-relaxed">{goal.description}</p>
                )}
              </>
            )}
          </div>

          {/* Admin actions */}
          {role === 'ADMIN' && !editing && (
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!editing && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text2)]">Overall Progress</span>
                {totalMilestones > 0 && (
                  <span className="text-xs text-[var(--text3)]">{doneMilestones}/{totalMilestones} milestones</span>
                )}
              </div>
              <span className="text-sm font-bold" style={{ color: accent }}>{progress}%</span>
            </div>
            <div className="w-full bg-[var(--bg4)] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: accent }}
              />
            </div>
          </div>
        )}

        {/* Owner */}
        {!editing && goal.owner && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
            <div
              className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
              style={{ backgroundColor: accent }}>
              {goal.owner.name[0].toUpperCase()}
            </div>
            <span className="text-xs text-[var(--text2)]">Owned by <span className="text-[var(--text)]">{goal.owner.name}</span></span>
          </div>
        )}
      </div>

      {/* Bottom two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 flex-1 min-h-0">

        {/* Left — milestones + activity */}
        <div className="flex flex-col gap-5">

          {/* Milestones */}
          <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
            <p className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-4">Milestones</p>
            <div className="space-y-2 mb-4">
              {goal.milestones?.length === 0 && (
                <p className="text-xs text-[var(--text3)]">No milestones yet.</p>
              )}
              {goal.milestones?.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--bg3)] cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={(e) => toggleMilestone(workspace.id, id, m.id, e.target.checked)}
                    className="rounded accent-violet-500 w-4 h-4 shrink-0"
                  />
                  <span className={`text-sm flex-1 ${m.completed ? 'line-through text-[var(--text3)]' : 'text-[var(--text)]'}`}>
                    {m.title}
                  </span>
                  {m.completed && (
                    <span className="text-xs text-emerald-400 shrink-0">✓ Done</span>
                  )}
                </label>
              ))}
            </div>
            <form onSubmit={handleAddMilestone} className="flex gap-2">
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add a milestone..."
                className="flex-1 text-xs border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none placeholder:text-[var(--text3)] focus:border-[var(--border2)] transition-colors"
              />
              <button
                type="submit"
                className="text-xs px-3 py-2 rounded-lg text-white hover:opacity-90 transition-opacity shrink-0"
                style={{ backgroundColor: accent }}>
                Add
              </button>
            </form>
          </div>

          {/* Activity */}
          <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
            <p className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-4">Activity</p>
            <form onSubmit={handlePostUpdate} className="flex gap-2 mb-5">
              <input
                value={update}
                onChange={(e) => setUpdate(e.target.value)}
                placeholder="Post a progress update..."
                className="flex-1 text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none placeholder:text-[var(--text3)] focus:border-[var(--border2)] transition-colors"
              />
              <button
                type="submit" disabled={posting}
                className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0"
                style={{ backgroundColor: accent }}>
                Post
              </button>
            </form>
            <div className="space-y-4">
              {(!goal.updates || goal.updates.length === 0) && (
                <p className="text-xs text-[var(--text3)]">No updates yet.</p>
              )}
              {goal.updates?.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: accent }}>
                    {u.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--text)]">{u.author?.name}</span>
                      <span className="text-xs text-[var(--text3)]">{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[var(--text2)] leading-relaxed">{u.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — linked action items */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5 flex flex-col lg:min-h-0">
          <p className="text-xs font-semibold text-[var(--text2)] uppercase tracking-wider mb-4 shrink-0">
            Linked Action Items
            {goal.actionItems?.length > 0 && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium normal-case"
                style={{ backgroundColor: `${accent}20`, color: accent }}>
                {goal.actionItems.filter((i) => i.status === 'DONE').length}/{goal.actionItems.length}
              </span>
            )}
          </p>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {(!goal.actionItems || goal.actionItems.length === 0) && (
              <p className="text-xs text-[var(--text3)]">No action items linked to this goal.</p>
            )}
            {goal.actionItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--bg3)] border border-[var(--border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.status === 'DONE' ? 'bg-emerald-400' :
                    item.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-[var(--text3)]'
                  }`} />
                  <span className={`text-xs truncate ${item.status === 'DONE' ? 'line-through text-[var(--text3)]' : 'text-[var(--text)]'}`}>
                    {item.title}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  item.priority === 'HIGH' ? 'bg-[#7f1d1d25] text-red-400' :
                  item.priority === 'MEDIUM' ? 'bg-[#78350f25] text-amber-400' :
                  'bg-[var(--bg4)] text-[var(--text3)]'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}