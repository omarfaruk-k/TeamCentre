import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router({ mergeParams: true })

router.get('/', authenticate, async (req, res) => {
  const { status, assigneeId } = req.query
  const items = await prisma.actionItem.findMany({
    where: {
      workspaceId: req.params.workspaceId,
      ...(status && { status }),
      ...(assigneeId && { assigneeId })
    },
    include: { assignee: { select: { id: true, name: true, avatarUrl: true } },
  goal: { select: { id: true, title: true } } },
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
    include: { assignee: { select: { id: true, name: true, avatarUrl: true } },
              goal: { select: { id: true, title: true } }
  }
    
  })
  res.status(201).json(item)
})

router.patch('/:itemId', authenticate, async (req, res) => {
  const { title, status, priority, dueDate, assigneeId } = req.body
  const item = await prisma.actionItem.update({
    where: { id: req.params.itemId },
    data: {
      ...(title && { title }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(assigneeId !== undefined && { assigneeId })
    },
    include: { assignee: { select: { id: true, name: true, avatarUrl: true } },
              goal: { select: { id: true, title: true } } 
            }
    
  })
  req.io.to(`workspace:${req.params.workspaceId}`).emit('actionItem:updated', { actionItem: item })
  res.json(item)
})

router.delete('/:itemId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.actionItem.delete({ where: { id: req.params.itemId } })
  res.json({ ok: true })
})

export default router