import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import workspaceRouter from './routes/workspaces.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', authRouter)
app.use('/workspaces', workspaceRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API running on port ${PORT}`))