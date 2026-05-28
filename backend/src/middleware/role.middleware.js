import { AppError } from '../utils/AppError.js'

/**
 * @param  {...import('@prisma/client').UserRole} roles
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }
      if (!roles.includes(req.user.role)) {
        throw new AppError(403, 'Insufficient permissions')
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
