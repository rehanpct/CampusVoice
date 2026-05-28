import { prisma } from '../utils/prisma.js'
import { AppError } from '../utils/AppError.js'
import { filterBadWords } from '../utils/badWords.js'
import { logAction } from '../utils/logAction.js'

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** Canonical conversation key — always "smallerId_largerId" (numeric, never lexicographic) */
function makeConversationId(a, b) {
  return `${Math.min(a, b)}_${Math.max(a, b)}`
}

/** Safe public view of a user (never expose email/password/college_id) */
function publicPeer(user) {
  return { id: user.id, nickname: user.nickname, rating: user.rating ?? 100 }
}

/**
 * Format a single message row for API response.
 * `viewerId` is the currently authenticated user — used to compute `sentByMe`.
 */
function formatMsg(m, viewerId) {
  const base = {
    id:             m.id,
    type:           m.type,
    message:        m.message,
    isAnonymous:    m.is_anonymous,
    createdAt:      m.created_at,
    sentByMe:       m.sender_id === viewerId,
    conversationId: m.conversation_id,
    parentId:       m.parent_id ?? null,
  }

  // Embed parent preview (quoted reply)
  if (m.parent) {
    base.parent = {
      id:      m.parent.id,
      message: m.parent.message,
      sender:  m.parent.is_anonymous
        ? null
        : m.parent.sender
          ? publicPeer(m.parent.sender)
          : null,
    }
  }

  if (m.is_anonymous) {
    return {
      ...base,
      sender:   null,
      receiver: m.receiver ? publicPeer(m.receiver) : null,
    }
  }

  return {
    ...base,
    sender:   m.sender   ? publicPeer(m.sender)   : null,
    receiver: m.receiver ? publicPeer(m.receiver) : null,
  }
}

/** Standard includes for messages */
const MSG_INCLUDE = {
  sender:   { select: { id: true, nickname: true, rating: true } },
  receiver: { select: { id: true, nickname: true, rating: true } },
  parent: {
    include: {
      sender: { select: { id: true, nickname: true } },
    },
  },
}

/* =========================
   SEND MESSAGE
   Accepts optional parent_id for threaded replies.
========================= */
export async function sendMessage(req, res, next) {
  try {
    if (req.user.status === 'blocked') {
      throw new AppError(403, 'Your account cannot send messages')
    }

    const {
      receiver_college_id,
      receiver_email,
      receiver_id: rawReceiverId,
      type,
      message: text,
      isAnonymous,
      parent_id: rawParentId,
    } = req.body

    if (type !== 'compliment' && type !== 'complaint') {
      throw new AppError(400, 'Invalid message type')
    }
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new AppError(400, 'Message cannot be empty')
    }
    if (typeof isAnonymous !== 'boolean') {
      throw new AppError(400, 'isAnonymous must be a boolean')
    }

    // Resolve receiver — supports college_id, email, or direct numeric id (chat page)
    let receiver
    if (receiver_college_id) {
      receiver = await prisma.user.findUnique({ where: { college_id: receiver_college_id } })
    } else if (receiver_email) {
      receiver = await prisma.user.findUnique({ where: { email: receiver_email.trim().toLowerCase() } })
    } else if (rawReceiverId != null) {
      const rid = Number(rawReceiverId)
      if (Number.isInteger(rid) && rid > 0) {
        receiver = await prisma.user.findUnique({ where: { id: rid } })
      }
    } else {
      throw new AppError(400, 'Provide receiver college ID, email, or id')
    }

    if (!receiver) throw new AppError(404, 'Receiver not found')
    if (receiver.id === req.user.id) throw new AppError(400, 'Cannot message yourself')

    // Resolve parent message (optional)
    let parentId        = null
    let conversationId  = makeConversationId(req.user.id, receiver.id)

    if (rawParentId != null) {
      const parentIdNum = Number(rawParentId)
      if (!Number.isInteger(parentIdNum) || parentIdNum < 1) {
        throw new AppError(400, 'Invalid parent_id')
      }
      const parent = await prisma.message.findUnique({
        where:  { id: parentIdNum },
        select: { id: true, conversation_id: true, sender_id: true, receiver_id: true, is_deleted: true },
      })
      if (!parent || parent.is_deleted) {
        throw new AppError(404, 'Parent message not found')
      }
      // Ensure the reply is within the same conversation pair
      const participants = [parent.sender_id, parent.receiver_id]
      if (!participants.includes(req.user.id) || !participants.includes(receiver.id)) {
        throw new AppError(400, 'Reply must be in the same conversation')
      }
      parentId       = parent.id
      conversationId = parent.conversation_id || conversationId
    }

    // Filter bad words
    const { filtered } = filterBadWords(text)

    const created = await prisma.message.create({
      data: {
        sender_id:       req.user.id,
        receiver_id:     receiver.id,
        type,
        message:         filtered,
        is_anonymous:    isAnonymous,
        is_deleted:      false,
        conversation_id: conversationId,
        parent_id:       parentId,
      },
    })

    await logAction(req.user.id, 'message.send', receiver.id, null, null)

    res.status(201).json({ message: 'Message sent', id: created.id })
  } catch (err) {
    next(err)
  }
}

/* =========================
   CHAT — full conversation thread
   GET /messages/chat/:userId
   Returns all messages between the two users, ASC order (oldest first).
========================= */
export async function getChat(req, res, next) {
  try {
    const otherId = Number(req.params.userId)
    if (!Number.isInteger(otherId) || otherId < 1) throw new AppError(400, 'Invalid user id')

    const me = req.user.id
    if (otherId === me) throw new AppError(400, 'Invalid conversation')

    const conversationId = makeConversationId(me, otherId)

    // Single query: match by conversation_id OR by the sender/receiver pair with empty/missing id.
    // This ensures the very first message (sent before conversation_id was stored) always appears.
    const rows = await prisma.message.findMany({
      where: {
        is_deleted: false,
        OR: [
          // Primary: correct conversation_id
          { conversation_id: conversationId },
          // Legacy: messages stored before conversation_id was introduced (default "")
          {
            conversation_id: '',
            OR: [
              { sender_id: me,      receiver_id: otherId },
              { sender_id: otherId, receiver_id: me     },
            ],
          },
        ],
      },
      orderBy: { created_at: 'asc' },
      include: MSG_INCLUDE,
    })

    // Deduplicate by id (safety — shouldn't be needed but guards against edge cases)
    const seen = new Set()
    const unique = rows.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true })

    const data = unique.map((m) => formatMsg(m, me))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/* =========================
   INBOX — one entry per conversation (latest message)
   GET /messages/inbox
========================= */
export async function getInbox(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const me    = req.user.id

    // Get all messages involving the current user, ordered newest first
    const allMessages = await prisma.message.findMany({
      where: {
        is_deleted: false,
        OR: [
          { sender_id: me },
          { receiver_id: me },
        ],
      },
      orderBy: { created_at: 'desc' },
      include: MSG_INCLUDE,
    })

    // Deduplicate to one entry per conversation (the latestmessage)
    const seen = new Set()
    const conversations = []
    for (const m of allMessages) {
      // Build a stable key for the conversation
      const key = m.conversation_id && m.conversation_id !== ''
        ? m.conversation_id
        : makeConversationId(m.sender_id, m.receiver_id)

      if (!seen.has(key)) {
        seen.add(key)
        // Determine the "other" user for this conversation
        const otherId = m.sender_id === me ? m.receiver_id : m.sender_id
        conversations.push({ ...formatMsg(m, me), otherId, conversationKey: key })
      }
    }

    const total  = conversations.length
    const paged  = conversations.slice((page - 1) * limit, page * limit)

    res.json({ data: paged, page, limit, total })
  } catch (err) {
    next(err)
  }
}

/* =========================
   LIST CONVERSATION (legacy endpoint — kept for backward compat)
   GET /messages/:userId
========================= */
export async function listConversation(req, res, next) {
  try {
    const otherId = Number(req.params.userId)
    if (!Number.isInteger(otherId) || otherId < 1) throw new AppError(400, 'Invalid user id')

    const me = req.user.id
    if (otherId === me) throw new AppError(400, 'Invalid conversation')

    const conversationId = makeConversationId(me, otherId)

    const rows = await prisma.message.findMany({
      where: {
        is_deleted: false,
        OR: [
          { conversation_id: conversationId },
          // Legacy: messages before conversation_id existed
          {
            conversation_id: '',
            OR: [
              { sender_id: me, receiver_id: otherId },
              { sender_id: otherId, receiver_id: me },
            ],
          },
        ],
      },
      orderBy: { created_at: 'asc' },
      include: MSG_INCLUDE,
    })

    const data = rows.map((m) => formatMsg(m, me))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}