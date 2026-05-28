import { Router } from 'express'
import { body }   from 'express-validator'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as messages from '../controllers/messages.controller.js'
import { handleValidation } from '../middleware/validate.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/send',
  body().custom((_value, { req }) => {
    if (!req.body.receiver_college_id && !req.body.receiver_email && !req.body.receiver_id) {
      throw new Error('Provide receiver college ID, email, or id')
    }
    return true
  }),
  body('receiver_college_id').optional().isString().trim(),
  body('receiver_email').optional().isEmail().normalizeEmail(),
  body('receiver_id').optional({ nullable: true }).toInt().isInt({ min: 1 }),
  body('type').isIn(['compliment', 'complaint']),
  body('message').isString().trim().isLength({ min: 1, max: 8000 }),
  body('isAnonymous').isBoolean(),
  body('parent_id').optional({ nullable: true }).toInt().isInt({ min: 1 }),
  handleValidation,
  messages.sendMessage,
)

// Chat — full ordered thread between two users (new primary endpoint)
router.get('/chat/:userId', messages.getChat)

// Inbox — one entry per conversation (latest message)
router.get('/inbox', messages.getInbox)

// Legacy conversation list (kept for backward compat)
router.get('/:userId', messages.listConversation)

export default router
