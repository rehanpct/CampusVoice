import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma.js'
import { AppError } from '../utils/AppError.js'
import { logAction } from '../utils/logAction.js'

/* =========================
   CREATE REPORT (user-facing)
   - Auto rating drop on sender
   - Auto abuse_score increment
========================= */
export async function createReport(req, res, next) {
  try {
    const messageId = Number(req.body.messageId)
    const reason    = req.body.reason

    if (!Number.isInteger(messageId) || messageId < 1) {
      throw new AppError(400, 'Invalid message')
    }
    if (typeof reason !== 'string' || reason.trim().length === 0) {
      throw new AppError(400, 'Reason is required')
    }

    const msg = await prisma.message.findUnique({ where: { id: messageId } })
    if (!msg || msg.is_deleted) {
      throw new AppError(404, 'Message not found')
    }
    if (msg.sender_id === req.user.id) {
      throw new AppError(400, 'You cannot report your own message')
    }

    // Create report + increment abuse_score + decrement rating atomically
    try {
      await prisma.$transaction([
        prisma.report.create({
          data: {
            reporter_id: req.user.id,
            message_id:  msg.id,
            reason:      reason.trim(),
            status:      'pending',
          },
        }),
        prisma.user.update({
          where: { id: msg.sender_id },
          data: {
            abuse_score: { increment: 1 },
            rating:      { decrement: 5 },
          },
        }),
      ])
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'You have already reported this message')
      }
      throw err
    }

    // Auto-moderate based on updated abuse_score
    const sender = await prisma.user.findUnique({
      where:  { id: msg.sender_id },
      select: { abuse_score: true, status: true },
    })
    if (sender && sender.status === 'active') {
      if (sender.abuse_score > 10) {
        await prisma.user.update({ where: { id: msg.sender_id }, data: { status: 'banned' } })
        await logAction(msg.sender_id, 'auto.ban', msg.sender_id, 'Abuse score exceeded 10')
      } else if (sender.abuse_score > 5) {
        await prisma.user.update({ where: { id: msg.sender_id }, data: { status: 'blocked' } })
        await logAction(msg.sender_id, 'auto.block', msg.sender_id, 'Abuse score exceeded 5')
      }
    }

    await logAction(req.user.id, 'report.create', msg.sender_id, reason.trim(), messageId)
    res.status(201).json({ message: 'Report submitted' })
  } catch (err) {
    next(err)
  }
}

/* =========================
   RESOLVE REPORT (admin)
   - Marks resolved; rating stays (penalty stands)
========================= */
export async function resolveReport(req, res, next) {
  try {
    const reportId = Number(req.body.reportId)
    if (!Number.isInteger(reportId) || reportId < 1) throw new AppError(400, 'Invalid report id')

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) throw new AppError(404, 'Report not found')
    if (report.status !== 'pending') throw new AppError(400, 'Report is already resolved or rejected')

    await prisma.report.update({ where: { id: reportId }, data: { status: 'resolved' } })
    await logAction(req.user.id, 'report.resolve', null, null, reportId)
    res.json({ message: 'Report resolved' })
  } catch (err) { next(err) }
}

/* =========================
   REJECT REPORT + RESTORE (admin)
   - Restore rating by rating_penalty
   - Restore abuse_score (floor at 0)
========================= */
export async function rejectReport(req, res, next) {
  try {
    const reportId = Number(req.body.reportId)
    if (!Number.isInteger(reportId) || reportId < 1) throw new AppError(400, 'Invalid report id')

    const report = await prisma.report.findUnique({
      where:   { id: reportId },
      include: { message: { select: { sender_id: true } } },
    })
    if (!report) throw new AppError(404, 'Report not found')
    if (report.status === 'rejected') throw new AppError(400, 'Report already rejected')

    const senderId = report.message.sender_id
    const penalty  = report.rating_penalty ?? 5

    // Fetch current abuse_score to enforce floor of 0
    const sender = await prisma.user.findUnique({
      where:  { id: senderId },
      select: { abuse_score: true },
    })
    const newAbuseScore = Math.max(0, (sender?.abuse_score ?? 0) - 1)

    await prisma.$transaction([
      prisma.report.update({ where: { id: reportId }, data: { status: 'rejected' } }),
      prisma.user.update({
        where: { id: senderId },
        data: {
          rating:      { increment: penalty },
          abuse_score: newAbuseScore,
        },
      }),
    ])

    await logAction(req.user.id, 'report.reject', senderId, `Rating restored by ${penalty}`, reportId)
    res.json({ message: 'Report rejected and rating restored' })
  } catch (err) { next(err) }
}

/* =========================
   DELETE REPORT (admin)
   - Restore rating ONLY if status was 'pending'
   - Enforce abuse_score floor at 0
   - Then hard-delete the report
========================= */
export async function deleteReport(req, res, next) {
  try {
    const reportId = Number(req.params.id)
    if (!Number.isInteger(reportId) || reportId < 1) throw new AppError(400, 'Invalid report id')

    const report = await prisma.report.findUnique({
      where:   { id: reportId },
      include: { message: { select: { sender_id: true } } },
    })
    if (!report) throw new AppError(404, 'Report not found')

    const wasPending = report.status === 'pending'
    const senderId   = report.message.sender_id
    const penalty    = report.rating_penalty ?? 5

    if (wasPending) {
      // Restore rating and abuse_score only if penalty was still active
      const sender = await prisma.user.findUnique({
        where:  { id: senderId },
        select: { abuse_score: true },
      })
      const newAbuseScore = Math.max(0, (sender?.abuse_score ?? 0) - 1)

      await prisma.$transaction([
        prisma.user.update({
          where: { id: senderId },
          data: {
            rating:      { increment: penalty },
            abuse_score: newAbuseScore,
          },
        }),
        prisma.report.delete({ where: { id: reportId } }),
      ])

      await logAction(req.user.id, 'report.delete.restored', senderId, `Rating restored by ${penalty}`, reportId)
    } else {
      // Resolved/rejected reports: just delete, no rating change
      await prisma.report.delete({ where: { id: reportId } })
      await logAction(req.user.id, 'report.delete', senderId, 'No rating change (not pending)', reportId)
    }

    res.json({ message: 'Report deleted' })
  } catch (err) { next(err) }
}
