import express from 'express'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'
import { signAccess, signRefresh, verifyAccess, verifyRefresh } from '../lib/jwt.js'
import { authenticate } from '../middleware/authenticate.js'
import { sendOtpEmail } from '../lib/mailer.js'
import crypto from 'crypto'

 
const router = express.Router()
 
const cookieOpts = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
}
 
// Helper: generate 6-digit OTP
const makeOtp = () => Math.floor(100000 + Math.random() * 900000).toString()
 
// Helper: set OTP on user record
const setOtp = (userId) =>
  prisma.user.update({
    where: { id: userId },
    data: {
      otpCode: makeOtp(),
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      otpAttempts: 0,
    },
    select: { otpCode: true },
  })
 
 
// ── POST /auth/register ─────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
 
const exists = await prisma.user.findUnique({ where: { email } })
    if (exists && exists.emailVerified)
      return res.status(409).json({ error: 'Email already registered. Try logging in or reset your password.' })
    if (exists && !exists.emailVerified) {
      // Resend OTP to finish registration they started
      const { otpCode } = await setOtp(exists.id)
      await sendOtpEmail(email, otpCode, exists.name, 'verify')
      return res.status(200).json({ message: 'Account exists but unverified. A new code has been sent.' })
    }
 
    // const hash = await bcrypt.hash(password, 10)
    // const user = await prisma.user.create({
    //   data: { name, email, password: hash },
    // })
    const hash = await bcrypt.hash(password, 10)
         const user = await prisma.user.create({
           data: { name, email, passwordHash: hash },
         })
 
    // Generate + send OTP
    const { otpCode } = await setOtp(user.id)
    await sendOtpEmail(email, otpCode, name, 'verify')
 
    res.status(201).json({ message: 'Account created. Check your email for the verification code.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── POST /auth/verify-otp ───────────────────────────────────
// mode: 'verify' (register) | 'reset' (forgot password)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, mode = 'verify' } = req.body
    if (!email || !otp) return res.status(400).json({ error: 'Email and code are required' })
 
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'Account not found' })
 
if (mode === 'verify' && user.emailVerified)
      return res.status(400).json({ error: 'Email already verified' })
    
    if (mode === 'reset' && !user.emailVerified)
      return res.status(400).json({ error: 'Email not found or not verified' })
 
    // Too many attempts
    if (user.otpAttempts >= 5)
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' })
 
    // Expired
    if (!user.otpExpiry || new Date() > user.otpExpiry)
      return res.status(400).json({ error: 'Code expired. Request a new one.' })
 
    // Wrong code
    if (user.otpCode !== otp) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      })
      const left = 4 - user.otpAttempts
      return res.status(400).json({
        error: left > 0 ? `Wrong code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many attempts.',
      })
    }
 
    // ── Correct code ─────────────────────────────────────────
 
    if (mode === 'verify') {
      // Mark verified + issue auth cookies
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, otpCode: null, otpExpiry: null, otpAttempts: 0 },
      })
 
      const accessToken = signAccess({ id: user.id, email: user.email })
      const refreshToken = signRefresh({ id: user.id })
      res.cookie('accessToken', accessToken, cookieOpts)
      res.cookie('refreshToken', refreshToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      return res.json({ message: 'Email verified' })
    }
 
if (mode === 'reset') {
  const resetToken = crypto.randomBytes(32).toString('hex')
  resetTokens.set(email, { token: resetToken, expiry: Date.now() + 15 * 60 * 1000 })
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
  })
  return res.json({ resetToken, message: 'Code verified' })
}
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── POST /auth/resend-otp ───────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, mode = 'verify' } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
 
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'Account not found' })
 
    const { otpCode } = await setOtp(user.id)
    await sendOtpEmail(email, otpCode, user.name, mode)
 
    res.json({ message: 'New code sent' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── POST /auth/forgot-password ──────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })
 
    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a code was sent.' })
 
    const { otpCode } = await setOtp(user.id)
    await sendOtpEmail(email, otpCode, user.name, 'reset')
 
    res.json({ message: 'If that email exists, a code was sent.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── POST /auth/reset-password ───────────────────────────────
// Frontend sends: { email, resetToken, newPassword }
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body
    if (!email || !resetToken || !newPassword)
      return res.status(400).json({ error: 'All fields required' })
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
 
    // Simple validation: we store the resetToken in a Map in memory
    // (works for single-server; for multi-server use Redis or a DB field)
    const stored = resetTokens.get(email)
    if (!stored || stored.token !== resetToken || Date.now() > stored.expiry)
      return res.status(400).json({ error: 'Invalid or expired reset session. Start again.' })
 
    const hash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    })
 
    resetTokens.delete(email)
 
    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
// In-memory store for reset tokens (lives at module scope)
// Simple, no DB field needed. Expires after 15 min.
const resetTokens = new Map()
 
// Update /verify-otp mode=reset to store token here instead:
// After OTP verified, do:
//   const resetToken = crypto.randomBytes(32).toString('hex')
//   resetTokens.set(email, { token: resetToken, expiry: Date.now() + 15 * 60 * 1000 })
//   return res.json({ resetToken })
 
 
// ── POST /auth/login ────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
 
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
 
    if (!user.emailVerified)
      return res.status(403).json({ error: 'Please verify your email before logging in.' })
 
    const accessToken = signAccess({ id: user.id, email: user.email })
    const refreshToken = signRefresh({ id: user.id })
 
    res.cookie('accessToken', accessToken, cookieOpts)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
 
    res.json({ message: 'Logged in' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── POST /auth/logout ───────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', cookieOpts)
  res.clearCookie('refreshToken', cookieOpts)
  res.json({ message: 'Logged out' })
})
 
 
// ── POST /auth/refresh ──────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (!token) return res.status(401).json({ error: 'No refresh token' })
 
    const payload = verifyRefresh(token)
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return res.status(401).json({ error: 'User not found' })
 
    const accessToken = signAccess({ id: user.id, email: user.email })
    res.cookie('accessToken', accessToken, cookieOpts)
    res.json({ message: 'Token refreshed' })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})
 
 
// ── GET /auth/me ────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatarUrl: true, emailVerified: true },
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})
 
 
// ── PATCH /auth/me ──────────────────────────────────────────
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true, emailVerified: true },
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})
 
export default router