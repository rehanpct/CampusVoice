import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { login } from '../services/api'
import { setToken } from '../utils/auth'
import { getErrorMessage } from '../utils/errors'
import { GlassCard } from '../components/GlassCard'
import { GlowButton } from '../components/GlowButton'
import { ErrorBanner } from '../components/ErrorBanner'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const rawFrom = location.state?.from
  const from =
    typeof rawFrom === 'string' &&
    rawFrom !== '/login' &&
    rawFrom !== '/register'
      ? rawFrom
      : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      if (data?.token) {
        setToken(data.token)
        navigate(from, { replace: true })
      } else {
        setError('Unexpected response from server.')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Check your email and password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <GlassCard className="p-6">
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-cine-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-cine-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <GlowButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </GlowButton>
        </form>
        <p className="mt-4 text-center text-sm text-cine-muted">
          No account?{' '}
          <Link to="/register" className="text-cine-rose hover:underline">
            Register
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
