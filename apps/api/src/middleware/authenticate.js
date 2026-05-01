import { verifyAccess } from '../lib/jwt.js'

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.user = verifyAccess(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}