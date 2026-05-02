import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import workspaceRouter from './routes/workspaces.js'
import goalRouter from './routes/goals.js'
import milestoneRouter from './routes/milestones.js'
import announcementRouter from './routes/announcements.js'
import actionItemRouter from './routes/actionItems.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)
app.use('/workspaces/:workspaceId/goals', goalRouter)
app.use('/workspaces/:workspaceId/goals/:goalId/milestones', milestoneRouter)
app.use('/workspaces/:workspaceId/announcements', announcementRouter)
app.use('/api/workspaces/:workspaceId/action-items', actionItemRouter)
app.use('/workspaces/:workspaceId/action-items', actionItemRouter)


const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API running on port ${PORT}`))