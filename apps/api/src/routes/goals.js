import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'
import { notify, parseMentions } from '../lib/notify.js'
import { sendMail, templates } from '../lib/mailer.js'

const router = Router({ mergeParams: true })

router.get('/', authenticate, async (req, res) => {
  const { status } = req.query
  const goals = await prisma.goal.findMany({
    where: { workspaceId: req.params.workspaceId, ...(status && { status }) },
    include: { owner: { select: { id: true, name: true, avatarUrl: true } }, milestones: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(goals)
})

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

  if (goal.ownerId !== req.user.id) {
    try {
      await notify(req.io, {
        userIds: [goal.ownerId],
        message: `You were assigned as owner of goal: ${goal.title}`,
        link: `/goals/${goal.id}`
      })
      const t = templates.goalAssigned(goal.title)
      await sendMail({ to: goal.owner.email, ...t })
    } catch (err) {
      console.error('Goal assign notify failed:', err.message)
    }
  }

  res.status(201).json(goal)
})

router.get('/:goalId', authenticate, async (req, res) => {
  const goal = await prisma.goal.findUnique({
    where: { id: req.params.goalId },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      milestones: true,
      updates: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      },
      actionItems: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  if (!goal) return res.status(404).json({ error: 'Goal not found' })
  res.json(goal)
})

router.patch('/:goalId', authenticate, async (req, res) => {
  const { title, description, status, dueDate, ownerId, progress } = req.body

  // fetch existing to compare status
  const existing = await prisma.goal.findUnique({
    where: { id: req.params.goalId },
    include: { owner: { select: { id: true, email: true } } }
  })

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
    include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } }, milestones: true }
  })

  // notify owner if status changed
  if (status && status !== existing.status) {
    try {
      await notify(req.io, {
        userIds: [goal.ownerId],
        message: `Goal "${goal.title}" status changed to ${status.replace('_', ' ')}`,
        link: `/goals/${goal.id}`
      })
      const t = templates.goalStatusChanged(goal.title, status)
      await sendMail({ to: goal.owner.email, ...t })
    } catch (err) {
      console.error('Goal status notify failed:', err.message)
    }
  }

  res.json(goal)
})

router.delete('/:goalId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.goal.delete({ where: { id: req.params.goalId } })
  res.json({ ok: true })
})

router.post('/:goalId/updates', authenticate, async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })

  const update = await prisma.goalUpdate.create({
    data: { content, goalId: req.params.goalId, authorId: req.user.id },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } }
  })

  // handle @mentions in goal updates
  try {
    const mentioned = await parseMentions(content, req.params.workspaceId)
    for (const u of mentioned) {
      if (u.id === req.user.id) continue
      await notify(req.io, {
        userIds: [u.id],
        message: `${req.user.name} mentioned you in a goal update`,
        link: `/goals/${req.params.goalId}`
      })
      const t = templates.mention(req.user.name, content)
      await sendMail({ to: u.email, ...t }).catch(() => {})
    }
  } catch (err) {
    console.error('Mention notify failed:', err.message)
  }

  req.io.to(`workspace:${req.params.workspaceId}`).emit('goal:update:added', { update })
  res.status(201).json(update)
})

router.patch('/:goalId/milestones/:milestoneId', authenticate, async (req, res) => {
  const { completed } = req.body
  await prisma.milestone.update({
    where: { id: req.params.milestoneId },
    data: { completed }
  })

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
      },
      actionItems: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  req.io.to(`workspace:${req.params.workspaceId}`).emit('goal:updated', { goal })
  res.json(goal)
})

router.post('/:goalId/milestones', authenticate, async (req, res) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const milestone = await prisma.milestone.create({
    data: { title, goalId: req.params.goalId }
  })
  res.status(201).json(milestone)
})

export default router