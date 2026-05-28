import { Router } from 'express'
import { body }   from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import * as admin from '../controllers/admin.controller.js'
import { handleValidation } from '../middleware/validate.js'

const router = Router()

// All admin routes require authentication + admin role
router.use(requireAuth)
router.use(requireRole('admin'))

/* ---------- Reports ---------- */
router.get('/reports',        admin.listReports)
router.get('/report/:id',     admin.getReport)

const reportIdBody = [body('reportId').toInt().isInt({ min: 1 }), handleValidation]

router.post('/reports/resolve', ...reportIdBody, admin.resolveReport)
router.post('/reports/reject',  ...reportIdBody, admin.rejectReport)
router.delete('/reports/:id',                    admin.deleteReport)

/* ---------- Users ---------- */
router.get('/users', admin.listUsers)

const userIdBody   = [body('userId').toInt().isInt({ min: 1 }), handleValidation]
const withReason   = [
  body('userId').toInt().isInt({ min: 1 }),
  body('reason').isString().trim().isLength({ min: 1, max: 500 }),
  handleValidation,
]

router.post('/block',   ...withReason, admin.blockUser)
router.post('/ban',     ...withReason, admin.banUser)
router.post('/unblock', ...userIdBody, admin.unblockUser)
router.post('/unban',   ...userIdBody, admin.unbanUser)

export default router
