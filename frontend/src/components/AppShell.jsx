import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CinematicBackground } from './CinematicBackground'
import { PageFade } from './PageFade'
import { getToken, removeToken, isAdmin } from '../utils/auth'
import { GlowButton } from './GlowButton'

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white/10 text-white'
      : 'text-cine-muted hover:bg-white/5 hover:text-zinc-200'
  }`

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const authed = !!getToken()
  const admin = authed && isAdmin()

  function handleLogout() {
    removeToken()
    navigate('/')
  }

  return (
    <div className="relative min-h-screen">
      <CinematicBackground />
      <div className="relative z-10">
        <motion.header
          key={location.pathname + (authed ? '1' : '0')}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-20 border-b border-white/10 bg-cine-base/70 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <NavLink
              to="/"
              className="text-sm font-semibold tracking-tight text-white"
            >
              Campus<span className="text-cine-rose">Voice</span>
            </NavLink>
            <nav className="flex flex-wrap items-center gap-1">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              {authed ? (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/inbox" className={linkClass}>
                    Inbox
                  </NavLink>
                  <NavLink to="/profile" className={linkClass}>
                    Profile
                  </NavLink>
                  {admin ? (
                    <NavLink to="/admin" className={linkClass}>
                      Admin
                    </NavLink>
                  ) : null}
                </>
              ) : null}
              {!authed ? (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Sign in
                  </NavLink>
                  <NavLink to="/register" className={linkClass}>
                    Register
                  </NavLink>
                </>
              ) : (
                <GlowButton
                  type="button"
                  variant="subtle"
                  className="!px-3 !py-2 !text-xs"
                  onClick={handleLogout}
                >
                  Sign out
                </GlowButton>
              )}
            </nav>
          </div>
        </motion.header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <PageFade>
            <Outlet />
          </PageFade>
        </main>
      </div>
    </div>
  )
}
