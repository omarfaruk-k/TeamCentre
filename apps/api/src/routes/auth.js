import { Router } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'
import { signAccess, signRefresh, verifyAccess, verifyRefresh } from '../lib/jwt.js'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = Router()


const cookieOpts = {
  httpOnly: true,
  sameSite: 'none',
  secure: true
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email already in use' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash } })
  const access = signAccess({ id: user.id, email: user.email })
  const refresh = signRefresh({ id: user.id })
  res.cookie('accessToken', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.status(201).json({ id: user.id, name: user.name, email: user.email })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  const access = signAccess({ id: user.id, email: user.email })
  const refresh = signRefresh({ id: user.id })
  res.cookie('accessToken', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refresh, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl })
})

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.json({ ok: true })
})

router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ error: 'No refresh token' })
  try {
    const payload = verifyRefresh(token)
    const access = signAccess({ id: payload.id, email: payload.email })
    res.cookie('accessToken', access, { ...cookieOpts, maxAge: 15 * 60 * 1000 })
    res.json({ ok: true })
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
})

router.get('/me', async (req, res) => {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    // const { verifyAccess } = await import('../lib/jwt.js')
    const payload = verifyAccess(token)
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})
router.patch('/me', async (req, res) => {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = verifyAccess(token)
    const { name, avatarUrl, email } = req.body

    // check email not taken if changing
    if (email) {
      const existing = await prisma.user.findUnique({ where: { id: payload.id }, select: { email: true } })
      if (email !== existing.email) {
        const taken = await prisma.user.findUnique({ where: { email } })
        if (taken) return res.status(409).json({ error: 'Email already in use' })
      }
    }

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
        ...(email && { email })
      }
    })
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

router.post('/avatar', async (req, res) => {
  const token = req.cookies?.accessToken
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = verifyAccess(token)
    const { imageBase64 } = req.body
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' })

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'team-hub/avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    })

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { avatarUrl: result.secure_url }
    })

    res.json({ avatarUrl: user.avatarUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router