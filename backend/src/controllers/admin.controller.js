import { prisma } from '../utils/prisma.js'
import { AppError } from '../utils/AppError.js'
import { logAction } from '../utils/logAction.js'
import {
  resolveReport as _resolveReport,
  rejectReport  as _rejectReport,
  deleteReport  as _deleteReport,
} from './reports.controller.js'

// Safe user projection — never expose password or college_id
function safeUser(u) {
  return {
    id:          u.id,
    nickname:    u.nickname,
    role:        u.role,
    status:      u.status,
    rating:      u.rating ?? 100,
    abuse_score: u.abuse_score ?? 0,
  }
}

/* =========================
   LIST ALL REPORTS
========================= */
export async function listReports(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip  = (page - 1) * limit

    // Allow filtering by status; default shows all
    const statusFilter = req.query.status
    const where = statusFilter ? { status: statusFilter } : {}

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          message: {
            include: {
              sender:   { select: { id: true, nickname: true, status: true, rating: true } },
              receiver: { select: { id: true, nickname: true, status: true, rating: true } },
            },
          },
        },
      }),
    ])

    const data = reports.map((r) => ({
      id:            r.id,
      reason:        r.reason,
      created_at:    r.created_at,
      status:        r.status,
      rating_penalty: r.rating_penalty,
      message: {
        id:           r.message.id,
        type:         r.message.type,
        message:      r.message.message,
        is_anonymous: r.message.is_anonymous,
      },
      sender:   r.message.sender   ? safeUser(r.message.sender)   : null,
      receiver: r.message.receiver ? safeUser(r.message.receiver) : null,
    }))

    res.json({ data, page, limit, total })
  } catch (err) {
    next(err)
  }
}

/* =========================
   GET SINGLE REPORT
========================= */
export async function getReport(req, res, next) {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'Invalid report id')

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        message: { include: { sender: true, receiver: true } },
      },
    })
    if (!report) throw new AppError(404, 'Report not found')

    const { message } = report
    res.json({
      data: {
        id:            report.id,
        status:        report.status,
        reason:        report.reason,
        rating_penalty: report.rating_penalty,
        created_at:    report.created_at,
        message: {
          id:           message.id,
          type:         message.type,
          message:      message.message,
          is_anonymous: message.is_anonymous,
          created_at:   message.created_at,
          sender:       safeUser(message.sender),
          receiver:     safeUser(message.receiver),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

/* =========================
   LIST ALL USERS (admin view)
   Returns users with their last AdminLog reason
========================= */
export async function listUsers(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const skip  = (page - 1) * limit

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { id: 'asc' },
        skip,
        take: limit,
        select: {
          id:          true,
          nickname:    true,
          rating:      true,
          status:      true,
          abuse_score: true,
          role:        true,
        },
      }),
    ])

    // Fetch latest AdminLog entry per user using a single query
    const userIds = users.map((u) => u.id)
    const logs = await prisma.adminLog.findMany({
      where:   { target_user_id: { in: userIds } },
      orderBy: { created_at: 'desc' },
    })

    // Build a map: userId → most recent log reason
    const lastLogMap = new Map()
    for (const log of logs) {
      if (log.target_user_id !== null && !lastLogMap.has(log.target_user_id)) {
        lastLogMap.set(log.target_user_id, log.reason || log.action)
      }
    }

    const data = users.map((u) => ({
      ...safeUser(u),
      role:       u.role,
      lastReason: lastLogMap.get(u.id) ?? null,
    }))

    res.json({ data, page, limit, total })
  } catch (err) {
    next(err)
  }
}

/* ========================= BLOCK ========================= */
export async function blockUser(req, res, next) {
  try {
    const targetId = Number(req.body.userId)
    const reason   = String(req.body.reason || '').trim()

    if (!Number.isInteger(targetId) || targetId < 1) throw new AppError(400, 'Invalid user id')
    if (targetId === req.user.id)                    throw new AppError(400, 'Cannot modify own account')
    if (!reason)                                     throw new AppError(400, 'Reason is required')

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { status: true } })
    if (!target)                    throw new AppError(404, 'User not found')
    if (target.status === 'blocked') throw new AppError(400, 'User is already blocked')
    if (target.status === 'banned')  throw new AppError(400, 'User is already banned — unban first')

    await prisma.user.update({ where: { id: targetId }, data: { status: 'blocked' } })
    await logAction(req.user.id, 'admin.block', targetId, reason)
    res.json({ message: 'User blocked' })
  } catch (err) { next(err) }
}

/* ========================= BAN ========================= */
export async function banUser(req, res, next) {
  try {
    const targetId = Number(req.body.userId)
    const reason   = String(req.body.reason || '').trim()

    if (!Number.isInteger(targetId) || targetId < 1) throw new AppError(400, 'Invalid user id')
    if (targetId === req.user.id)                    throw new AppError(400, 'Cannot modify own account')
    if (!reason)                                     throw new AppError(400, 'Reason is required')

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { status: true } })
    if (!target)                   throw new AppError(404, 'User not found')
    if (target.status === 'banned') throw new AppError(400, 'User is already banned')

    await prisma.user.update({ where: { id: targetId }, data: { status: 'banned' } })
    await logAction(req.user.id, 'admin.ban', targetId, reason)
    res.json({ message: 'User banned' })
  } catch (err) { next(err) }
}

/* ========================= UNBLOCK ========================= */
export async function unblockUser(req, res, next) {
  try {
    const targetId = Number(req.body.userId)
    if (!Number.isInteger(targetId) || targetId < 1) throw new AppError(400, 'Invalid user id')
    if (targetId === req.user.id)                    throw new AppError(400, 'Cannot modify own account')

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { status: true } })
    if (!target)                     throw new AppError(404, 'User not found')
    if (target.status !== 'blocked') throw new AppError(400, 'User is not blocked')

    await prisma.user.update({ where: { id: targetId }, data: { status: 'active' } })
    await logAction(req.user.id, 'admin.unblock', targetId, 'Manually unblocked by admin')
    res.json({ message: 'User unblocked' })
  } catch (err) { next(err) }
}

/* ========================= UNBAN ========================= */
export async function unbanUser(req, res, next) {
  try {
    const targetId = Number(req.body.userId)
    if (!Number.isInteger(targetId) || targetId < 1) throw new AppError(400, 'Invalid user id')
    if (targetId === req.user.id)                    throw new AppError(400, 'Cannot modify own account')

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { status: true } })
    if (!target)                    throw new AppError(404, 'User not found')
    if (target.status !== 'banned') throw new AppError(400, 'User is not banned')

    await prisma.user.update({ where: { id: targetId }, data: { status: 'active' } })
    await logAction(req.user.id, 'admin.unban', targetId, 'Manually unbanned by admin')
    res.json({ message: 'User unbanned' })
  } catch (err) { next(err) }
}

/* =========================
   REPORT ACTIONS (delegated to reports.controller)
   — These wrappers allow admin routes to call report logic
     while still going through the same controller functions
     (which handle logAction with correct signatures).
========================= */
export { _resolveReport as resolveReport, _rejectReport as rejectReport, _deleteReport as deleteReport }
