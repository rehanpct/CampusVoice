import { prisma } from '../utils/prisma.js'
import { AppError } from '../utils/AppError.js'

/* =========================
   GET MY PROFILE
========================= */
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { id: true, nickname: true, email: true, role: true, status: true, rating: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

/* =========================
   MY STATS
========================= */
export async function getMyStats(req, res, next) {
  try {
    const me = req.user.id

    const [sentCount, receivedCount, complimentsReceived, complaintsReceived] =
      await Promise.all([
        prisma.message.count({ where: { sender_id: me, is_deleted: false } }),
        prisma.message.count({ where: { receiver_id: me, is_deleted: false } }),
        prisma.message.count({ where: { receiver_id: me, type: 'compliment', is_deleted: false } }),
        prisma.message.count({ where: { receiver_id: me, type: 'complaint',  is_deleted: false } }),
      ])

    res.json({ sentCount, receivedCount, complimentsReceived, complaintsReceived })
  } catch (err) {
    next(err)
  }
}

