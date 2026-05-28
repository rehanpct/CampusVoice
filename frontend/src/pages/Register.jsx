import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'
import { setStoredProfile } from '../utils/storage'
import { getErrorMessage } from '../utils/errors'
import { GlassCard } from '../components/GlassCard'
import { GlowButton } from '../components/GlowButton'
import { ErrorBanner } from '../components/ErrorBanner'

export default function Register() {
  const navigate = useNavigate()
  const [collegeId, setCollegeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim().toLowerCase().endsWith('@saintgits.org')) {
      setError('Email must end with @saintgits.org')
      return
    }

    setLoading(true)

    try {
      await register({
        college_id: collegeId.trim(), // ✅ FIXED
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      })

      setStoredProfile({
        nickname: nickname.trim(),
        communityScore: 90,
        complimentsIn: 0,
        sentCount: 0,
        reportsOut: 0,
      })

      navigate('/login')
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Registration failed. Email or college ID may already be in use.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-white">Create account</h1>

      <GlassCard className="p-6">
        <ErrorBanner message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* College ID */}
          <div>
            <label htmlFor="cid" className="text-xs font-medium text-cine-muted">
              College ID
            </label>
            <input
              id="cid"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="em" className="text-xs font-medium text-cine-muted">
              Email (@saintgits.org)
            </label>
            <input
              id="em"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Nickname */}
          <div>
            <label htmlFor="nick" className="text-xs font-medium text-cine-muted">
              Nickname
            </label>
            <input
              id="nick"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="pw" className="text-xs font-medium text-cine-muted">
              Password (min 8 characters)
            </label>
            <input
              id="pw"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <GlowButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Register'}
          </GlowButton>
        </form>

        <p className="mt-4 text-center text-sm text-cine-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-cine-rose hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}