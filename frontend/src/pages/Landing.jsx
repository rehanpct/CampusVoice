import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CinematicBackground } from '../components/CinematicBackground'
import { FloatingParticles } from '../components/FloatingParticles'
import { GlowButton } from '../components/GlowButton'
import { GlassCard } from '../components/GlassCard'
import { ScrollReveal } from '../components/ScrollReveal'

function HeroBubble({ text, className, delay, rotate }) {
  return (
    <motion.div
      className={`absolute max-w-[220px] rounded-2xl border border-white/15 bg-cine-card/70 p-4 text-left text-sm text-zinc-200 shadow-lg backdrop-blur-xl sm:max-w-[260px] ${className}`}
      initial={{ opacity: 0, y: 30, rotate: rotate - 4 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
        rotate: [rotate, rotate + 2, rotate],
      }}
      transition={{
        opacity: { delay, duration: 0.6 },
        y: { delay: delay + 0.3, duration: 5, repeat: Infinity, ease: 'easeInOut' },
        rotate: { delay: delay + 0.3, duration: 6, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <p className="leading-relaxed text-zinc-300">{text}</p>
      <div className="mt-2 text-xs text-cine-muted">Anonymous · compliment</div>
    </motion.div>
  )
}

const features = [
  {
    title: 'Anonymous by choice',
    body: 'Share gratitude or concerns without revealing your identity when it matters.',
    icon: (
      <svg className="h-8 w-8 text-cine-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Campus-only',
    body: 'Built for your community — verified emails keep conversations within Saintgits.',
    icon: (
      <svg className="h-8 w-8 text-cine-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Safe reporting',
    body: 'Report harmful content. Moderators review context and take action when needed.',
    icon: (
      <svg className="h-8 w-8 text-cine-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

const steps = [
  { n: '01', title: 'Join', body: 'Register with your college email and pick a nickname.' },
  { n: '02', title: 'Send', body: 'Write a compliment or complaint — anonymous or signed.' },
  { n: '03', title: 'Reflect', body: 'Read your inbox and see how your voice lands on campus.' },
]

const btnGhost =
  'inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-100 backdrop-blur-md transition hover:border-cine-purple/40 hover:bg-white/10'

export default function Landing() {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, 60])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CinematicBackground parallax />
      <FloatingParticles />

      <header className="relative z-20 border-b border-white/10 bg-cine-base/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-sm font-semibold text-white">
            Campus<span className="text-cine-rose">Voice</span>
          </span>
          <div className="flex items-center gap-2">
            <a href="#explore" className={btnGhost}>
              Explore
            </a>
            <GlowButton
              type="button"
              variant="subtle"
              className="!py-2 !text-xs"
              onClick={() => navigate('/login')}
            >
              Sign in
            </GlowButton>
          </div>
        </div>
      </header>

      <motion.section
        style={{ y: heroY }}
        className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:pt-24"
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cine-purple">
            Campus Secret Compliment System
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[2.75rem]">
            Unspoken words deserve a voice.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-cine-muted sm:text-lg">
            Send anonymous compliments to brighten someone&apos;s day, or share complaints
            that help your campus grow — always with respect, always within your community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GlowButton type="button" variant="primary" onClick={() => navigate('/register')}>
              Start now
            </GlowButton>
            <a href="#explore" className={`${btnGhost} px-6 py-3 text-sm`}>
              Explore
            </a>
          </div>
        </motion.div>

        <div className="relative hidden h-[420px] lg:block" aria-hidden>
          <HeroBubble
            className="right-8 top-4"
            delay={0.2}
            rotate={-6}
            text="You made the lab session less scary today. Seriously — thank you."
          />
          <HeroBubble
            className="right-0 top-40"
            delay={0.45}
            rotate={4}
            text="Thanks for speaking up in class. It helped more people than you think."
          />
          <HeroBubble
            className="right-24 bottom-8"
            delay={0.65}
            rotate={-2}
            text="Your notes saved my week. Wishing you a calm semester ahead."
          />
        </div>

        <div className="relative flex min-h-[280px] flex-col gap-3 lg:hidden">
          <HeroBubble className="relative right-0 top-0" delay={0.15} rotate={-3} text="Anonymous compliment waiting in your inbox…" />
        </div>
      </motion.section>

      <section id="explore" className="relative z-10 border-t border-white/10 bg-cine-base/30 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-semibold text-white">About</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-cine-muted">
              Campus Voice is a quiet corner for honest feedback — praise that might never be
              said out loud, and concerns that deserve a channel. We combine anonymity,
              accountability, and moderation so the campus stays kind and fair.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-semibold text-white">Features</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-cine-muted">
              Everything you need to speak clearly — without noise.
            </p>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <GlassCard className="h-full p-6">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cine-muted">{f.body}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="text-center text-3xl font-semibold text-white">How it works</h2>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.1}>
                <GlassCard className="h-full p-6">
                  <span className="text-3xl font-bold text-gradient">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-cine-muted">{s.body}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.2} className="mt-14 text-center">
            <GlowButton type="button" variant="primary" onClick={() => navigate('/register')}>
              Create your account
            </GlowButton>
          </ScrollReveal>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-xs text-cine-muted">
        Campus Voice · For Saintgits students & faculty
      </footer>
    </div>
  )
}
