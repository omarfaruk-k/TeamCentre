import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router({ mergeParams: true })

router.get('/stats', authenticate, async (req, res) => {
  const { workspaceId } = req.params
  const now = new Date()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

  const [totalGoals, completedThisWeek, overdueGoals, openItems] = await Promise.all([
    prisma.goal.count({ where: { workspaceId } }),
    prisma.goal.count({ where: { workspaceId, status: 'COMPLETED', createdAt: { gte: weekAgo } } }),
    prisma.goal.count({ where: { workspaceId, dueDate: { lt: now }, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
    prisma.actionItem.count({ where: { workspaceId, status: { not: 'DONE' } } }),
  ])

  res.json({ totalGoals, completedThisWeek, overdueGoals, openItems })
})

router.get('/goal-completion', authenticate, async (req, res) => {
  const { workspaceId } = req.params
  const weeks = []
  const now = new Date()

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const count = await prisma.goal.count({
      where: { workspaceId, status: 'COMPLETED', createdAt: { gte: weekStart, lt: weekEnd } }
    })
    weeks.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count
    })
  }

  res.json(weeks)
})

router.get('/export', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { workspaceId } = req.params
  const [goals, items] = await Promise.all([
    prisma.goal.findMany({ where: { workspaceId }, include: { owner: true } }),
    prisma.actionItem.findMany({ where: { workspaceId }, include: { assignee: true } }),
  ])

  const lines = [
    '--- GOALS ---',
    'Title,Status,Progress,Owner,Due Date',
    ...goals.map((g) => `"${g.title}",${g.status},${g.progress}%,"${g.owner?.name || ''}",${g.dueDate ? new Date(g.dueDate).toLocaleDateString() : ''}`),
    '',
    '--- ACTION ITEMS ---',
    'Title,Status,Priority,Assignee,Due Date',
    ...items.map((i) => `"${i.title}",${i.status},${i.priority},"${i.assignee?.name || ''}",${i.dueDate ? new Date(i.dueDate).toLocaleDateString() : ''}`),
  ]

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="workspace-export.csv"')
  res.send(lines.join('\n'))
})

export default router