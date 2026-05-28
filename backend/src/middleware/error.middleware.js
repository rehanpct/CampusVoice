import { Prisma } from '@prisma/client'
import { AppError } from '../utils/AppError.js'

function isAppError(err) {
  return err instanceof AppError && err.isOperational
}

export function errorHandler(err, _req, res, _next) {
  if (isAppError(err)) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Resource already exists' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Resource not found' })
    }
    return res.status(400).json({ message: 'Request could not be processed' })
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }

  return res.status(500).json({ message: 'Something went wrong' })
}
