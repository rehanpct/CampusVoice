import { motion } from 'framer-motion'

const COUNT = 18

function Particle({ i }) {
  const left = `${(i * 37) % 100}%`
  const top = `${(i * 23) % 100}%`
  const delay = (i % 7) * 0.4
  const duration = 8 + (i % 5) * 2

  return (
    <motion.span
      className="absolute h-1 w-1 rounded-full bg-cine-rose/40 shadow-[0_0_8px_rgba(255,77,109,0.6)]"
      style={{ left, top }}
      animate={{
        y: [0, -24, 0],
        opacity: [0.15, 0.55, 0.15],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export function FloatingParticles() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle key={i} i={i} />
      ))}
    </div>
  )
}
