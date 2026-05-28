import { prisma } from './prisma.js'

/**
 * Write an entry to AdminLog. Never throws — logging must not break request flow.
 *
 * @param {number}       adminId      — ID of the admin (or system user) performing the action
 * @param {string}       action       — e.g. 'admin.block', 'report.reject'
 * @param {number|null}  targetUserId — user being acted on (null for report-only actions)
 * @param {string|null}  reason       — optional human-readable reason
 * @param {number|null}  reportId     — report being acted on (null for user-only actions)
 */
export async function logAction(
  adminId,
  action,
  targetUserId = null,
  reason = null,
  reportId = null,
) {
  try {
    await prisma.adminLog.create({
      data: {
        admin_id:       adminId,
        action:         String(action).slice(0, 512),
        target_user_id: targetUserId ?? null,
        report_id:      reportId     ?? null,
        reason:         reason       ? String(reason).slice(0, 1000) : '',
      },
    })
  } catch {
    // Intentionally swallowed — audit failure must never abort the main request
  }
}
