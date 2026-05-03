'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useAuthStore } from '../../../stores/authStore'
import { useGoalStore } from '../../../stores/goalStore'
import { useAnnouncementStore } from '../../../stores/announcementStore'
import { useActionItemStore } from '../../../stores/actionItemStore'
import api from '../../../lib/api'
import Link from 'next/link'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const STATUS_CONFIG = {
  ON_TRACK:  { label: 'On Track',  color: '#4ade80', bg: 'bg-[#14532d25]', text: 'text-emerald-400', border: 'border-[#14532d40]', dot: 'bg-emerald-400' },
  AT_RISK:   { label: 'At Risk',   color: '#fbbf24', bg: 'bg-[#78350f25]', text: 'text-amber-400',   border: 'border-[#78350f40]', dot: 'bg-amber-400' },
  COMPLETED: { label: 'Completed', color: '#60a5fa', bg: 'bg-[#1e3a5f25]', text: 'text-blue-400',    border: 'border-[#1e3a5f40]', dot: 'bg-blue-400' },
  CANCELLED: { label: 'Cancelled', color: '#5C5975', bg: 'bg-[var(--bg4)]', text: 'text-[var(--text3)]', border: 'border-[var(--border)]', dot: 'bg-[var(--text3)]' },
}

const PRIORITY_CONFIG = {
  HIGH:   { color: '#f87171', bg: 'bg-[#7f1d1d25]', text: 'text-red-400',   border: 'border-[#7f1d1d40]' },
  MEDIUM: { color: '#fbbf24', bg: 'bg-[#78350f25]', text: 'text-amber-400', border: 'border-[#78350f40]' },
  LOW:    { color: '#9B98B0', bg: 'bg-[var(--bg4)]', text: 'text-[var(--text3)]', border: 'border-[var(--border)]' },
}

const CustomTooltip = ({ active, payload, label, accent }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-[var(--text2)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || accent }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
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

  // Derived data
  const goalStatusCounts = Object.keys(STATUS_CONFIG).map((s) => ({
    name: STATUS_CONFIG[s].label,
    value: goals.filter((g) => g.status === s).length,
    color: STATUS_CONFIG[s].color,
  })).filter((d) => d.value > 0)

  const itemStatusCounts = [
    { name: 'To Do',       value: items.filter((i) => i.status === 'TODO').length,        color: '#9B98B0' },
    { name: 'In Progress', value: items.filter((i) => i.status === 'IN_PROGRESS').length, color: accent },
    { name: 'Done',        value: items.filter((i) => i.status === 'DONE').length,        color: '#4ade80' },
  ].filter((d) => d.value > 0)

  const overdueItems = items.filter((i) =>
    i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE'
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const activeGoals = goals.filter((g) => g.status === 'ON_TRACK' || g.status === 'AT_RISK')

  const recentActivity = [
    ...goals.flatMap((g) => (g.updates || []).map((u) => ({
      type: 'goal_update', text: u.content, author: u.author?.name,
      time: u.createdAt, goalTitle: g.title
    }))),
    ...announcements.map((a) => ({
      type: 'announcement', text: a.title, author: a.author?.name,
      time: a.createdAt
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)

  const statsCards = stats ? [
    {
      label: 'Total Goals', value: stats.totalGoals,
      sub: `${goals.filter(g => g.status === 'COMPLETED').length} completed`,
      color: accent, icon: '◎'
    },
    {
      label: 'Completed This Week', value: stats.completedThisWeek,
      sub: 'vs last week',
      color: '#4ade80', icon: '✓'
    },
    {
      label: 'Overdue Goals', value: stats.overdueGoals,
      sub: overdueItems.length > 0 ? 'needs attention' : 'all good',
      color: stats.overdueGoals > 0 ? '#f87171' : '#4ade80', icon: '⚠'
    },
    {
      label: 'Open Action Items', value: stats.openItems,
      sub: `${items.filter(i => i.status === 'IN_PROGRESS').length} in progress`,
      color: '#fbbf24', icon: '⬡'
    },
  ] : []

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
          <p className="text-[var(--text2)] text-sm mt-0.5">
            Welcome back, <span style={{ color: accent }}>{user?.name}</span>
          </p>
        </div>
        {role === 'ADMIN' && (
          
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspace?.id}/analytics/export`}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent }}>
            ↓ Export CSV
          </a>
        )}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((s) => (
            <div key={s.label} className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text2)] font-medium uppercase tracking-wider">{s.label}</p>
                <span className="text-base" style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[var(--text3)]">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Area chart — goal completions trend */}
        <div className="col-span-2 bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Goal Completion Trend</h2>
              <p className="text-xs text-[var(--text3)] mt-0.5">Last 8 weeks</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip accent={accent} />} />
                <Area
                  type="monotone" dataKey="completed" name="Completed"
                  stroke={accent} strokeWidth={2}
                  fill="url(#areaGrad)" dot={{ fill: accent, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: accent }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[var(--text3)] text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Donut — goal status distribution */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Goal Status</h2>
          <p className="text-xs text-[var(--text3)] mb-4">Distribution</p>
          {goalStatusCounts.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={goalStatusCounts} cx="50%" cy="50%"
                    innerRadius={35} outerRadius={55}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {goalStatusCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip accent={accent} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {goalStatusCounts.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-[var(--text2)]">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text)]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-[var(--text3)] text-sm">No goals yet</div>
          )}
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Action items donut */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Action Items</h2>
          <p className="text-xs text-[var(--text3)] mb-4">By status</p>
          {itemStatusCounts.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={itemStatusCounts} cx="50%" cy="50%"
                    innerRadius={35} outerRadius={55}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {itemStatusCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip accent={accent} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {itemStatusCounts.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-[var(--text2)]">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text)]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-[var(--text3)] text-sm">No items yet</div>
          )}
        </div>

        {/* Overdue items */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Overdue Items</h2>
              <p className="text-xs text-[var(--text3)] mt-0.5">Needs attention</p>
            </div>
            {overdueItems.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#7f1d1d25] text-red-400 border border-[#7f1d1d40]">
                {overdueItems.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {overdueItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 gap-1">
                <span className="text-emerald-400 text-lg">✓</span>
                <p className="text-xs text-[var(--text3)]">All caught up!</p>
              </div>
            )}
            {overdueItems.slice(0, 4).map((item) => {
              const pc = PRIORITY_CONFIG[item.priority]
              return (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg3)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--text)] truncate flex-1">{item.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${pc.bg} ${pc.text} border ${pc.border}`}>
                    {item.priority}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Recent Activity</h2>
          <p className="text-xs text-[var(--text3)] mb-4">Latest updates</p>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-xs text-[var(--text3)] text-center py-6">No activity yet</p>
            )}
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-2.5">
                <div
                  className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: accent }}>
                  {a.author?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text)] truncate">{a.text}</p>
                  <p className="text-xs text-[var(--text3)]">
                    {a.author} · {new Date(a.time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Active goals with progress */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Active Goals</h2>
              <p className="text-xs text-[var(--text3)] mt-0.5">{activeGoals.length} in progress</p>
            </div>
            <Link href="/goals" className="text-xs hover:opacity-80 transition-opacity" style={{ color: accent }}>
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {activeGoals.length === 0 && (
              <p className="text-xs text-[var(--text3)] text-center py-4">No active goals</p>
            )}
            {activeGoals.slice(0, 4).map((g) => {
              const cfg = STATUS_CONFIG[g.status]
              return (
                <Link key={g.id} href={`/goals/${g.id}`} className="block hover:bg-[var(--bg3)] rounded-lg p-2 -mx-2 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-[var(--text)] truncate flex-1">{g.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[var(--bg4)] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${g.progress || 0}%`, backgroundColor: accent }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text3)] shrink-0">{g.progress || 0}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent announcements */}
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Announcements</h2>
              <p className="text-xs text-[var(--text3)] mt-0.5">Latest posts</p>
            </div>
            <Link href="/announcements" className="text-xs hover:opacity-80 transition-opacity" style={{ color: accent }}>
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 && (
              <p className="text-xs text-[var(--text3)] text-center py-4">No announcements yet</p>
            )}
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--bg3)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  {a.pinned && <span className="text-amber-400 text-xs">📌</span>}
                  <p className="text-xs font-medium text-[var(--text)] truncate">{a.title}</p>
                </div>
                <p className="text-xs text-[var(--text3)]">
                  {a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-[var(--text2)] line-clamp-2 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}