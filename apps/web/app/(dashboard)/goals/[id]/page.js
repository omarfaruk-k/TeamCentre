'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useWorkspaceStore } from '../../../../stores/workspaceStore'
import { useGoalStore } from '../../../../stores/goalStore'
import api from '../../../../lib/api'

export default function GoalDetailPage() {
  const { id } = useParams()
  const { active: workspace } = useWorkspaceStore()
  const { active: goal, fetchGoal, addUpdate, toggleMilestone } = useGoalStore()
  const [update, setUpdate] = useState('')
  const [newMilestone, setNewMilestone] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (workspace && id) fetchGoal(workspace.id, id)
  }, [workspace, id])

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

  if (!goal) return <div className="p-8 text-slate-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{goal.title}</h1>
      <p className="text-slate-500 text-sm mb-6">{goal.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase">Milestones</p>
          {goal.milestones?.map((m) => (
            <label key={m.id} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
              <input type="checkbox" checked={m.completed}
                onChange={(e) => toggleMilestone(workspace.id, id, m.id, e.target.checked)}
                className="rounded" />
              <span className={m.completed ? 'line-through text-slate-400' : ''}>{m.title}</span>
            </label>
          ))}
          <form onSubmit={handleAddMilestone} className="flex gap-2 mt-2">
            <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add milestone..." className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-transparent outline-none" />
            <button type="submit" className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">Add</button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase">Progress</p>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-1">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${goal.progress || 0}%` }} />
          </div>
          <p className="text-xs text-slate-400">{goal.progress || 0}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs text-slate-400 mb-3 font-medium uppercase">Activity</p>
        <form onSubmit={handlePostUpdate} className="flex gap-2 mb-4">
          <input value={update} onChange={(e) => setUpdate(e.target.value)}
            placeholder="Post a progress update..."
            className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none" />
          <button type="submit" disabled={posting}
            className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: workspace?.accentColor || '#7C3AED' }}>
            Post
          </button>
        </form>
        {goal.updates?.map((u) => (
          <div key={u.id} className="border-t border-slate-100 dark:border-slate-700 py-3">
            <p className="text-sm font-medium">{u.author?.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{u.content}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(u.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}