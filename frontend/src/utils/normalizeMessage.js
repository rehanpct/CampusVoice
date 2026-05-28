export function normalizeInboxItem(row) {
  const senderLabel =
    row.senderLabel ??
    (row.isAnonymous && !row.sentByMe
      ? 'Anonymous'
      : row.sender?.nickname || (row.sentByMe ? 'You' : 'Peer'))

  const rawId = row.id ?? row.messageId
  return {
    messageId: typeof rawId === 'number' ? rawId : null,
    message: row.message,
    type: row.type,
    isAnonymous: row.isAnonymous,
    createdAt: row.createdAt,
    senderLabel,
    sentByMe: row.sentByMe,
  }
}
