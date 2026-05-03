import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { notify } from '../lib/notify.js'
import { sendMail, templates } from '../lib/mailer.js'

const router = Router({ mergeParams: true })

router.get('/', authenticate, async (req, res) => {
  const { status, assigneeId } = req.query
  const items = await prisma.actionItem.findMany({
    where: {
      workspaceId: req.params.workspaceId,
      ...(status && { status }),
      ...(assigneeId && { assigneeId })
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
})

router.post('/', authenticate, async (req, res) => {
  const { title, priority, dueDate, assigneeId, goalId } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const item = await prisma.actionItem.create({
    data: {
      title,
      priority: priority || 'MEDIUM',
      status: 'TODO',
      workspaceId: req.params.workspaceId,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(assigneeId && { assigneeId }),
      ...(goalId && { goalId })
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } }
    }
  })

  // notify assignee if not self
  if (item.assigneeId && item.assigneeId !== req.user.id) {
    try {
      await notify(req.io, {
        userIds: [item.assigneeId],
        message: `You were assigned an action item: "${item.title}"`,
        link: `/action-items`
      })
      const t = templates.actionItemAssigned(item.title)
      await sendMail({ to: item.assignee.email, ...t })
    } catch (err) {
      console.error('Action item assign notify failed:', err.message)
    }
  }

  res.status(201).json(item)
})

router.patch('/:itemId', authenticate, async (req, res) => {
  const { title, status, priority, dueDate, assigneeId } = req.body

  const existing = await prisma.actionItem.findUnique({ where: { id: req.params.itemId } })

  const item = await prisma.actionItem.update({
    where: { id: req.params.itemId },
    data: {
      ...(title && { title }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(assigneeId !== undefined && { assigneeId })
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } }
    }
  })

  // notify new assignee if assignee changed
  if (assigneeId && assigneeId !== existing.assigneeId && assigneeId !== req.user.id) {
    try {
      await notify(req.io, {
        userIds: [assigneeId],
        message: `You were assigned an action item: "${item.title}"`,
        link: `/action-items`
      })
      const t = templates.actionItemAssigned(item.title)
      await sendMail({ to: item.assignee.email, ...t })
    } catch (err) {
      console.error('Action item reassign notify failed:', err.message)
    }
  }

  req.io.to(`workspace:${req.params.workspaceId}`).emit('actionItem:updated', { actionItem: item })
  res.json(item)
})

router.delete('/:itemId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.actionItem.delete({ where: { id: req.params.itemId } })
  res.json({ ok: true })
})

export default router