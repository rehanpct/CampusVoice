import { Router } from 'express'
import { body } from 'express-validator'
import * as auth from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { handleValidation } from '../middleware/validate.js'

const router = Router()

// REGISTER
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be at least 8 characters'),

    body('nickname')
      .trim()
      .isLength({ min: 1, max: 191 })
      .withMessage('Nickname is required'),

    body('college_id')
      .trim()
      .notEmpty()
      .withMessage('College ID is required')
      .isLength({ max: 191 }),
  ],
  handleValidation,
  auth.register,
)

// LOGIN
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  handleValidation,
  auth.login,
)

// GET CURRENT USER
router.get('/me', requireAuth, auth.getMe)

export default router