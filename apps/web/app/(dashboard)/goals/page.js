'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useGoalStore } from '../../../stores/goalStore'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG = {
  ON_TRACK:  { label: 'On Track',  bg: 'bg-[#14532d25]', text: 'text-emerald-400', border: 'border-[#14532d40]', dot: 'bg-emerald-400' },
  AT_RISK:   { label: 'At Risk',   bg: 'bg-[#78350f25]', text: 'text-amber-400',   border: 'border-[#78350f40]', dot: 'bg-amber-400' },
  COMPLETED: { label: 'Completed', bg: 'bg-[#1e3a5f25]', text: 'text-blue-400',    border: 'border-[#1e3a5f40]', dot: 'bg-blue-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-[var(--bg4)]', text: 'text-[var(--text3)]', border: 'border-[var(--border)]', dot: 'bg-[var(--text3)]' },
}

const TABS = ['ALL', 'ON_TRACK', 'AT_RISK', 'COMPLETED', 'CANCELLED']

export default function GoalsPage() {
  const { active: workspace, role } = useWorkspaceStore()
  const { goals, fetchGoals, deleteGoal } = useGoalStore()
  const [tab, setTab] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const accent = workspace?.accentColor || '#7C3AED'

  useEffect(() => {
    if (workspace) fetchGoals(workspace.id, tab === 'ALL' ? undefined : tab)
  }, [workspace, tab])

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'ALL' ? goals.length : goals.filter((g) => g.status === t).length
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Goals</h1>
          <p className="text-sm text-[var(--text2)] mt-0.5">{goals.length} goals total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accent }}>
          + New Goal
        </button>
      </div>

      {/* Status summary cards
      <div className="grid grid-cols-4 gap-3 mb-6">
        {['ON_TRACK', 'AT_RISK', 'COMPLETED', 'CANCELLED'].map((s) => {
          const cfg = STATUS_CONFIG[s]
          return (
            <button
              key={s}
              onClick={() => setTab(tab === s ? 'ALL' : s)}
              className={`rounded-xl border p-4 text-left transition-all hover:border-[var(--border2)] ${
                tab === s ? 'ring-1' : ''
              } ${cfg.bg} ${cfg.border}`}
              style={tab === s ? { ringColor: accent } : {}}>
              <div className={`w-2 h-2 rounded-full mb-2 ${cfg.dot}`} />
              <p className={`text-xl font-bold ${cfg.text}`}>{counts[s]}</p>
              <p className="text-xs text-[var(--text2)] mt-0.5">{cfg.label}</p>
            </button>
          )
        })}
      </div> */}

      {/* Tab filter */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={tab === t
              ? { backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }
              : { backgroundColor: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }
            }>
            {t.replace('_', ' ')}
            <span className="ml-1.5 opacity-60">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--text2)] text-sm">
          No goals yet. Create your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const cfg = STATUS_CONFIG[goal.status]
            const progress = goal.progress || 0
            const actionCount = goal.actionItems?.length || 0
            const doneCount = goal.actionItems?.filter((i) => i.status === 'DONE').length || 0

            return (
              <div
                key={goal.id}
                onClick={() => router.push(`/goals/${goal.id}`)}
                className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--border2)] hover:bg-[var(--bg3)] transition-all group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {goal.dueDate && (
                    <span className="text-xs text-[var(--text3)]">
                      {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-[var(--text)] text-sm mb-1 group-hover:text-white transition-colors leading-snug">
                  {goal.title}
                </h3>

                {/* Description */}
                {goal.description && (
                  <p className="text-xs text-[var(--text3)] mb-3 line-clamp-2 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[var(--text3)]">Progress</span>
                    <span className="text-xs font-semibold" style={{ color: accent }}>{progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg4)] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  {/* Owner */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
                      style={{ backgroundColor: accent }}>
                      {goal.owner?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-[var(--text2)]">{goal.owner?.name}</span>
                  </div>

                  {/* Action items count */}
                  {actionCount > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${accent}15`, color: accent }}>
                      {doneCount}/{actionCount} tasks
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <GoalFormModal
          workspaceId={workspace?.id}
          accent={accent}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function GoalFormModal({ workspaceId, accent, onClose }) {
  const { createGoal } = useGoalStore()
  const [form, setForm] = useState({ title: '', description: '', status: 'ON_TRACK', dueDate: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await createGoal(workspaceId, form)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg2)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text)] mb-1">New Goal</h2>
        <p className="text-xs text-[var(--text3)] mb-5">Define a goal to track progress across your team.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required placeholder="Goal title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm placeholder:text-[var(--text3)] focus:border-[var(--border2)] transition-colors" />
          <textarea
            placeholder="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm h-20 resize-none placeholder:text-[var(--text3)] focus:border-[var(--border2)] transition-colors" />
          <select
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm">
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accent }}>
              {loading ? 'Saving...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}