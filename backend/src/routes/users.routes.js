import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as users from '../controllers/users.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/me',       users.getMe)
router.get('/me/stats', users.getMyStats)

export default router

