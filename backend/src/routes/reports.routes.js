import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as reports from '../controllers/reports.controller.js'
import { handleValidation } from '../middleware/validate.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  body('messageId').toInt().isInt({ min: 1 }),
  body('reason').isString().trim().isLength({ min: 1, max: 4000 }),
  handleValidation,
  reports.createReport,
)

export default router
