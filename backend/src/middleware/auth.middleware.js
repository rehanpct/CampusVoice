import { prisma } from '../utils/prisma.js'
import { verifyToken } from '../utils/jwt.js'
import { AppError } from '../utils/AppError.js'

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required')
    }
    const token = header.slice(7)
    const decoded = verifyToken(token)

    const rawId = decoded.sub ?? decoded.userId
    const id = Number(rawId)
    if (!Number.isInteger(id) || id < 1) {
      throw new AppError(401, 'Invalid token subject')
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new AppError(401, 'User not found')
    }
    if (user.status === 'banned') {
      throw new AppError(403, 'Account suspended')
    }

    req.user = {
      id: user.id,
      role: user.role,
      status: user.status,
      nickname: user.nickname,
      email: user.email,
    }
    next()
  } catch (err) {
    next(err)
  }
}
