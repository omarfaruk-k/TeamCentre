'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useAuthStore } from '../../../stores/authStore'
import { useGoalStore } from '../../../stores/goalStore'
import { useAnnouncementStore } from '../../../stores/announcementStore'
import { useActionItemStore } from '../../../stores/actionItemStore'
import api from '../../../lib/api'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_COLORS = {
  ON_TRACK: 'bg-emerald-100 text-emerald-700',
  AT_RISK: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-slate-100 text-[var(--text2)]',
}

const PRIORITY_COLORS = {
  LOW: 'bg-slate-100 text-[var(--text2)]',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-600',
}

export default function DashboardPage() {
  const { active: workspace, role } = useWorkspaceStore()
  const { user } = useAuthStore()
  const { goals, fetchGoals } = useGoalStore()
  const { announcements, fetchAnnouncements } = useAnnouncementStore()
  const { items, fetchItems } = useActionItemStore()
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const accent = workspace?.accentColor || '#7C3AED'

  useEffect(() => {
    if (!workspace) return
    fetchGoals(workspace.id)
    fetchAnnouncements(workspace.id)
    fetchItems(workspace.id)
    api.get(`/workspaces/${workspace.id}/analytics/stats`).then((r) => setStats(r.data))
    api.get(`/workspaces/${workspace.id}/analytics/goal-completion`).then((r) => setChartData(r.data))
  }, [workspace])

  const statsCards = stats ? [
    { label: 'Total Goals', value: stats.totalGoals, color: 'text-blue-600' },
    { label: 'Completed This Week', value: stats.completedThisWeek, color: 'text-emerald-600' },
    { label: 'Overdue Goals', value: stats.overdueGoals, color: 'text-red-500' },
    { label: 'Open Action Items', value: stats.openItems, color: 'text-amber-600' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--text2)] text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        {role === 'ADMIN' && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspace?.id}/analytics/export`}
            className="px-4 py-2 rounded-lg text-[var(--text)] text-sm font-medium"
            style={{ backgroundColor: accent }}
          >
            ↓ Export CSV
          </a>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((s) => (
            <div key={s.label} className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text2)] font-medium uppercase mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
        <h2 className="font-semibold mb-4">Goal Completions — Last 8 Weeks</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="completed" fill={accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[var(--text2)] text-sm text-center py-8">No data yet</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Goals Preview */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Recent Goals</h2>
            <Link href="/goals" className="text-xs" style={{ color: accent }}>View all</Link>
          </div>
          <div className="space-y-2">
            {goals.slice(0, 4).map((g) => (
              <div key={g.id} className="flex items-center justify-between">
                <p className="text-sm truncate flex-1">{g.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${STATUS_COLORS[g.status]}`}>
                  {g.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {goals.length === 0 && <p className="text-[var(--text2)] text-sm">No goals yet</p>}
          </div>
        </div>

        {/* Action Items Preview */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Action Items</h2>
            <Link href="/action-items" className="text-xs" style={{ color: accent }}>View all</Link>
          </div>
          <div className="space-y-2">
            {items.filter((i) => i.status !== 'DONE').slice(0, 4).map((i) => (
              <div key={i.id} className="flex items-center justify-between">
                <p className="text-sm truncate flex-1">{i.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${PRIORITY_COLORS[i.priority]}`}>
                  {i.priority}
                </span>
              </div>
            ))}
            {items.filter((i) => i.status !== 'DONE').length === 0 && (
              <p className="text-[var(--text2)] text-sm">All done! 🎉</p>
            )}
          </div>
        </div>

        {/* Announcements Preview */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Announcements</h2>
            <Link href="/announcements" className="text-xs" style={{ color: accent }}>View all</Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id}>
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-[var(--text2)]">{a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-[var(--text2)] text-sm">No announcements</p>}
          </div>
        </div>
      </div>
    </div>
  )
}