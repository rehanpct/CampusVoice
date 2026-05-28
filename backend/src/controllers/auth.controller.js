import { prisma } from '../utils/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'
import { AppError } from '../utils/AppError.js'
import { isSaintGitsEmail, normalizeEmail } from '../utils/email.js'
import { logAction } from '../utils/logAction.js'

/* =========================
   REGISTER
========================= */
export async function register(req, res, next) {
  try {
    const { college_id, email, password, nickname } = req.body

    // Validate email domain
    if (!isSaintGitsEmail(email)) {
      throw new AppError(400, 'Email must be a valid @saintgits.org address')
    }

    const emailNorm = normalizeEmail(email)

    // Hash password
    const hashed = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        college_id: String(college_id).trim(),
        email: emailNorm,
        password: hashed,
        nickname: String(nickname).trim(),
        role: 'student',       // 🔐 controlled by backend
        status: 'active',
      },
    })

    // Log action
    await logAction(user.id, 'auth.register')

    res.status(201).json({ message: 'Registration successful' })
  } catch (err) {
    next(err)
  }
}

/* =========================
   LOGIN
========================= */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const emailNorm = normalizeEmail(email)

    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
    })

    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    if (user.status === 'banned') {
      throw new AppError(403, 'Account suspended')
    }

    // Compare password
    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Generate token
    const token = signToken({
      sub: user.id,
      role: user.role,
    })

    await logAction(user.id, 'auth.login')

    res.json({ token })
  } catch (err) {
    next(err)
  }
}

/* =========================
   GET CURRENT USER
========================= */
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nickname: true, role: true, status: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}