import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as leaderboard from '../controllers/leaderboard.controller.js'

const router = Router()

router.use(requireAuth)
router.get('/', leaderboard.getLeaderboard)

export default router
