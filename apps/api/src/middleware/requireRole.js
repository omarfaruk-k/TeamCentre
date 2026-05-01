import prisma from '../lib/prisma.js'

export const requireRole = (...roles) => async (req, res, next) => {
  const { workspaceId } = req.params
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' })
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: req.user.id, workspaceId } }
  })
  if (!member || !roles.includes(member.role))
    return res.status(403).json({ error: 'Insufficient permissions' })
  req.member = member
  next()
}