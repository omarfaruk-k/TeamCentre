import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

// Create workspace
router.post('/', authenticate, async (req, res) => {
  const { name, accentColor } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const workspace = await prisma.workspace.create({
    data: {
      name,
      accentColor: accentColor || '#7C3AED',
      members: { create: { userId: req.user.id, role: 'ADMIN' } }
    },
    include: { members: true }
  })
  res.status(201).json(workspace)
})

// List my workspaces
router.get('/', authenticate, async (req, res) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: req.user.id },
    include: { workspace: true }
  })
  res.json(memberships.map((m) => ({ ...m.workspace, role: m.role })))
})

// Get single workspace
router.get('/:workspaceId', authenticate, async (req, res) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: req.user.id, workspaceId: req.params.workspaceId } },
    include: { workspace: true }
  })
  if (!member) return res.status(403).json({ error: 'Not a member' })
  res.json({ ...member.workspace, role: member.role })
})

// Update workspace (admin only)
router.patch('/:workspaceId', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { name, accentColor } = req.body
  const workspace = await prisma.workspace.update({
    where: { id: req.params.workspaceId },
    data: { ...(name && { name }), ...(accentColor && { accentColor }) }
  })
  res.json(workspace)
})

// Delete workspace (admin only)
router.delete('/:workspaceId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.workspace.delete({ where: { id: req.params.workspaceId } })
  res.json({ ok: true })
})

// Invite member by email (admin only)
router.post('/:workspaceId/invite', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { email, role } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'User not found' })
  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: req.params.workspaceId } }
  })
  if (existing) return res.status(409).json({ error: 'Already a member' })
  const member = await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: req.params.workspaceId, role: role || 'MEMBER' },
    include: { user: true }
  })
  res.status(201).json(member)
})

// List members
router.get('/:workspaceId/members', authenticate, async (req, res) => {
  const isMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: req.user.id, workspaceId: req.params.workspaceId } }
  })
  if (!isMember) return res.status(403).json({ error: 'Not a member' })
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: req.params.workspaceId },
    include: { user: true }
  })
  res.json(members)
})

// Change member role (admin only)
router.patch('/:workspaceId/members/:userId', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { role } = req.body
  const member = await prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId: req.params.userId, workspaceId: req.params.workspaceId } },
    data: { role }
  })
  res.json(member)
})

// Remove member (admin only)
router.delete('/:workspaceId/members/:userId', authenticate, requireRole('ADMIN'), async (req, res) => {
  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: req.params.userId, workspaceId: req.params.workspaceId } }
  })
  res.json({ ok: true })
})

export default router