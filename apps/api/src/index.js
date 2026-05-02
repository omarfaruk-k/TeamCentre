import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { initSocket } from './sockets/workspaceSocket.js'
import authRouter from './routes/auth.js'
import workspaceRouter from './routes/workspaces.js'
import goalRouter from './routes/goals.js'
import milestoneRouter from './routes/milestones.js'
import announcementRouter from './routes/announcements.js'
import actionItemRouter from './routes/actionItems.js'
import analyticsRouter from './routes/analytics.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
})

initSocket(io)

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Pass io to every request
app.use((req, res, next) => { req.io = io; next() })

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)
app.use('/workspaces/:workspaceId/goals', goalRouter)
app.use('/workspaces/:workspaceId/goals/:goalId/milestones', milestoneRouter)
app.use('/workspaces/:workspaceId/announcements', announcementRouter)
app.use('/workspaces/:workspaceId/action-items', actionItemRouter)
app.use('/workspaces/:workspaceId/analytics', analyticsRouter)

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => console.log(`API running on port ${PORT}`))