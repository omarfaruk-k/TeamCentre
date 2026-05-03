import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30
  })
  res.json(notifications)
})

router.patch('/read', authenticate, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true }
  })
  res.json({ ok: true })
})

router.patch('/:id/read', authenticate, async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true }
  })
  res.json({ ok: true })
})

export default router