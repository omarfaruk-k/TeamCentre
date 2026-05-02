import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router({ mergeParams: true })

// List goals
router.get('/', authenticate, async (req, res) => {
  const { status } = req.query
  const goals = await prisma.goal.findMany({
    where: { workspaceId: req.params.workspaceId, ...(status && { status }) },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } }, milestones: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(goals)
})

// Create goal
router.post('/', authenticate, async (req, res) => {
  const { title, description, status, dueDate, ownerId } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const goal = await prisma.goal.create({
    data: {
      title, description, status: status || 'ON_TRACK',
      dueDate: dueDate ? new Date(dueDate) : null,
      workspaceId: req.params.workspaceId,
      ownerId: ownerId || req.user.id
    },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } }, milestones: true }
  })
  res.status(201).json(goal)
})

// Get single goal
router.get('/:goalId', authenticate, async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.goalId },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: true,
      updates: { include: { author: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } }
    }
  })
  if (!goal) return res.status(404).json({ error: 'Goal not found' })
  res.json(goal)
})

// Update goal
router.patch('/:goalId', authenticate, async (req, res) => {
  const { title, description, status, dueDate, ownerId, progress } = req.body
  const goal = await prisma.goal.update({
    where: { id: req.params.goalId },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(ownerId && { ownerId }),
      ...(progress !== undefined && { progress })
    },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } }, milestones: true }
  })
  res.json(goal)
})

// Delete goal (admin only)
router.delete('/:goalId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.goal.delete({ where: { id: req.params.goalId } })
  res.json({ ok: true })
})

// Post progress update
router.post('/:goalId/updates', authenticate, async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })
  const update = await prisma.goalUpdate.create({
    data: { content, goalId: req.params.goalId, authorId: req.user.id },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } }
  })
  req.io.to(`workspace:${req.params.workspaceId}`).emit('goal:updated', { goal })
  res.status(201).json(update)
})

// Toggle milestone + recalculate progress
router.patch('/:goalId/milestones/:milestoneId', authenticate, async (req, res) => {
  const { completed } = req.body
  await prisma.milestone.update({
    where: { id: req.params.milestoneId },
    data: { completed }
  })

  // Recalculate progress from milestones
  const milestones = await prisma.milestone.findMany({
    where: { goalId: req.params.goalId }
  })
  const progress = milestones.length === 0
    ? 0
    : Math.round((milestones.filter((m) => m.completed).length / milestones.length) * 100)

  const goal = await prisma.goal.update({
    where: { id: req.params.goalId },
    data: { progress },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: true,
      updates: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  req.io.to(`workspace:${req.params.workspaceId}`).emit('goal:updated', { goal })
  res.json(goal)
})

// Add milestone
router.post('/:goalId/milestones', authenticate, async (req, res) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const milestone = await prisma.milestone.create({
    data: { title, goalId: req.params.goalId }
  })
  res.status(201).json(milestone)
})

export default router