import { verifyAccess } from '../lib/jwt.js'
import prisma from '../lib/prisma.js'

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = verifyAccess(token)
    req.user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true }
    })
    if (!req.user) return res.status(401).json({ error: 'User not found' })
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}