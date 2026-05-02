import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router({ mergeParams: true })

// List announcements
router.get('/', authenticate, async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    where: { workspaceId: req.params.workspaceId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: true,
comments: {
  include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  orderBy: { createdAt: 'asc' }
}
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
  })
  res.json(announcements)
})

// Create (admin only)
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
const { title, content } = req.body
if (!title || !content) return res.status(400).json({ error: 'Title and content required' })
const announcement = await prisma.announcement.create({
  data: { title, content, workspaceId: req.params.workspaceId, authorId: req.user.id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      reactions: true,
      comments: []
    }
  })
  req.io.to(`workspace:${req.params.workspaceId}`).emit('announcement:created', { announcement })
  res.status(201).json(announcement)
})

// Pin toggle (admin only)
router.patch('/:announcementId/pin', authenticate, requireRole('ADMIN'), async (req, res) => {
  const current = await prisma.announcement.findUnique({ where: { id: req.params.announcementId } })
  const updated = await prisma.announcement.update({
    where: { id: req.params.announcementId },
    data: { pinned: !current.pinned }
  })
  req.io.to(`workspace:${req.params.workspaceId}`).emit('announcement:pinned', { announcementId: req.params.announcementId, pinned: updated.pinned })
  res.json(updated)
})

// Delete (admin only)
router.delete('/:announcementId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.announcementId } })
  res.json({ ok: true })
})

// Toggle reaction
router.post('/:announcementId/reactions', authenticate, async (req, res) => {
  const { emoji } = req.body
  const { announcementId } = req.params
  const existing = await prisma.reaction.findFirst({
    where: { announcementId, userId: req.user.id, emoji }
  })
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.reaction.create({
      data: { emoji, announcementId, userId: req.user.id }
    })
  }
  const reactions = await prisma.reaction.findMany({ where: { announcementId } })
  req.io.to(`workspace:${req.params.workspaceId}`).emit('reaction:updated', { announcementId, reactions })
  res.json(reactions)
})

// Add comment
router.post('/:announcementId/comments', authenticate, async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Content required' })
const comment = await prisma.comment.create({
  data: { content, announcementId: req.params.announcementId, userId: req.user.id },
  include: { user: { select: { id: true, name: true, avatarUrl: true } } }
})
  res.status(201).json(comment)
  req.io.to(`workspace:${req.params.workspaceId}`).emit('comment:created', { announcementId: req.params.announcementId, comment })
})

export default router