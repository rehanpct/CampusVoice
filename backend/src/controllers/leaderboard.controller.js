import { prisma } from '../utils/prisma.js'

/**
 * Ranks users by number of compliments received (non-deleted, non-banned).
 * Supports ?page=1&limit=20
 */
export async function getLeaderboard(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

    // Group all first (Prisma groupBy doesn't support skip/take with ordering by aggregate in MySQL easily)
    const grouped = await prisma.message.groupBy({
      by: ['receiver_id'],
      where: { type: 'compliment', is_deleted: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    const ids = grouped.map((g) => g.receiver_id)
    if (ids.length === 0) {
      return res.json({ data: [], page, limit })
    }

    const users = await prisma.user.findMany({
      where: { id: { in: ids }, status: { not: 'banned' } },
      select: { id: true, nickname: true },
    })
    const nickById = Object.fromEntries(users.map((u) => [u.id, u.nickname]))

    const ranked = grouped
      .filter((row) => nickById[row.receiver_id] !== undefined)
      .map((row, i) => ({
        rank: i + 1,
        nickname: nickById[row.receiver_id],
        score: row._count.id,
      }))

    const start = (page - 1) * limit
    const data  = ranked.slice(start, start + limit)

    res.json({ data, page, limit, total: ranked.length })
  } catch (err) {
    next(err)
  }
}
