import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router({ mergeParams: true })


router.post('/', authenticate, async (req, res) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const milestone = await prisma.milestone.create({
    data: { title, goalId: req.params.goalId }
  })
  res.status(201).json(milestone)
})

router.patch('/:milestoneId', authenticate, async (req, res) => {
  const { title, completed } = req.body
  const milestone = await prisma.milestone.update({
    where: { id: req.params.milestoneId },
    data: { ...(title && { title }), ...(completed !== undefined && { completed }) }
  })
  res.json(milestone)
})

router.delete('/:milestoneId', authenticate, async (req, res) => {
  await prisma.milestone.delete({ where: { id: req.params.milestoneId } })
  res.json({ ok: true })
})

export default router