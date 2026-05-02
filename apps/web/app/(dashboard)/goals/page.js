'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useGoalStore } from '../../../stores/goalStore'
import Link from 'next/link'

const STATUS_COLORS = {
  ON_TRACK: 'bg-emerald-100 text-emerald-700',
  AT_RISK: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

export default function GoalsPage() {
  const { active: workspace } = useWorkspaceStore()
  const { goals, fetchGoals, deleteGoal } = useGoalStore()
  const [tab, setTab] = useState('ALL')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (workspace) fetchGoals(workspace.id, tab === 'ALL' ? undefined : tab)
  }, [workspace, tab])

  const tabs = ['ALL', 'ON_TRACK', 'AT_RISK', 'COMPLETED', 'CANCELLED']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: workspace?.accentColor || '#7C3AED' }}
        >
          + New Goal
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${tab === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {goals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No goals yet. Create one!</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Progress</th>
                <th className="text-left px-4 py-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <Link href={`/goals/${goal.id}`} className="font-medium hover:underline">{goal.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{goal.owner?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[goal.status]}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${goal.progress || 0}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <GoalFormModal workspaceId={workspace?.id} onClose={() => setShowForm(false)} />}
    </div>
  )
}

function GoalFormModal({ workspaceId, onClose }) {
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">New Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm" />
          <textarea placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm h-20 resize-none" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm">
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white disabled:opacity-50">
              {loading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}