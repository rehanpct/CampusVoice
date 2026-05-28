import jwt from 'jsonwebtoken'
import { AppError } from './AppError.js'

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload) {
  if (!SECRET) {
    throw new AppError(500, 'Server misconfiguration')
  }
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token) {
  if (!SECRET) {
    throw new AppError(500, 'Server misconfiguration')
  }
  try {
    return jwt.verify(token, SECRET)
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }
}
