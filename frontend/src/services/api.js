import axios from 'axios'
import { getToken, removeToken } from '../utils/auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      const path = window.location.pathname
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

/** @param {string} email @param {string} password */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

/** @param {{ collegeId: string, email: string, password: string, nickname: string, role?: string }} payload */
export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

/** @param {{ receiverId?: number, receiver_college_id?: string, receiver_email?: string, type: 'compliment' | 'complaint', message: string, isAnonymous: boolean, parent_id?: number|null }} payload */
export async function sendMessage(payload) {
  const { data } = await api.post('/messages/send', payload)
  return data
}

/**
 * Get the full chat thread between the current user and another user (ASC order)
 * @param {number} userId
 */
export async function getChat(userId) {
  const { data } = await api.get(`/messages/chat/${userId}`)
  return data
}

/** @param {number} messageId @param {string} reason */
export async function reportMessage(messageId, reason) {
  const { data } = await api.post('/reports', { messageId, reason })
  return data
}

export async function getLeaderboard() {
  const { data } = await api.get('/leaderboard')
  return data
}

export async function getInbox(page = 1, limit = 20) {
  const { data } = await api.get('/messages/inbox', { params: { page, limit } })
  return data
}

export async function getMyStats() {
  const { data } = await api.get('/users/me/stats')
  return data
}

export async function getMe() {
  const { data } = await api.get('/users/me')
  return data
}

/* ─────────────────── Admin: Reports ─────────────────── */

/** List all reports (optionally filtered by status) */
export async function listAdminReports(status = '') {
  const params = status ? { status } : {}
  const { data } = await api.get('/admin/reports', { params })
  return data
}

export async function getAdminReport(reportId) {
  const { data } = await api.get(`/admin/report/${reportId}`)
  return data
}

/** Mark a report as resolved (penalty stands) */
export async function adminResolveReport(reportId) {
  const { data } = await api.post('/admin/reports/resolve', { reportId })
  return data
}

/** Reject a report and restore the sender's rating */
export async function adminRejectReport(reportId) {
  const { data } = await api.post('/admin/reports/reject', { reportId })
  return data
}

/** Hard-delete a report; restores rating if it was still pending */
export async function adminDeleteReport(reportId) {
  const { data } = await api.delete(`/admin/reports/${reportId}`)
  return data
}

/* ─────────────────── Admin: Users ─────────────────── */

/** List all users with abuse_score and lastReason */
export async function adminListUsers(page = 1, limit = 50) {
  const { data } = await api.get('/admin/users', { params: { page, limit } })
  return data
}

/**
 * Block a user (reason required)
 * @param {number} userId @param {string} reason
 */
export async function adminBlockUser(userId, reason) {
  const { data } = await api.post('/admin/block', { userId, reason })
  return data
}

/**
 * Ban a user (reason required)
 * @param {number} userId @param {string} reason
 */
export async function adminBanUser(userId, reason) {
  const { data } = await api.post('/admin/ban', { userId, reason })
  return data
}

export async function adminUnblockUser(userId) {
  const { data } = await api.post('/admin/unblock', { userId })
  return data
}

export async function adminUnbanUser(userId) {
  const { data } = await api.post('/admin/unban', { userId })
  return data
}
