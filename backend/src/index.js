import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import adminRoutes from './routes/admin.routes.js'
import leaderboardRoutes from './routes/leaderboard.routes.js'
import usersRoutes from './routes/users.routes.js'
import { errorHandler } from './middleware/error.middleware.js'
import { AppError } from './utils/AppError.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set; auth tokens will fail until it is configured.')
}

const corsOrigin = process.env.CORS_ORIGIN
app.use(
  cors(
    corsOrigin
      ? {
          origin: corsOrigin.split(',').map((o) => o.trim()),
          credentials: true,
        }
      : { origin: true },
  ),
)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(express.json({ limit: '128kb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/auth', authRoutes)
app.use('/messages', messagesRoutes)
app.use('/reports', reportsRoutes)
app.use('/leaderboard', leaderboardRoutes)
app.use('/admin', adminRoutes)
app.use('/users', usersRoutes)

app.use((_req, _res, next) => {
  next(new AppError(404, 'Not found'))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
