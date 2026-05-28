import { motion } from 'framer-motion'

export function GlowButton({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const base =
    'relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cine-purple/80 focus-visible:ring-offset-2 focus-visible:ring-offset-cine-base disabled:opacity-50'

  const variants = {
    primary:
      'bg-gradient-to-r from-cine-red/90 to-cine-rose/90 text-white shadow-lg shadow-cine-rose/20 hover:from-cine-red hover:to-cine-rose',
    ghost:
      'border border-white/15 bg-white/5 text-zinc-100 backdrop-blur-md hover:border-cine-purple/40 hover:bg-white/10',
    subtle: 'bg-cine-card/80 text-zinc-200 ring-1 ring-white/10 hover:ring-cine-purple/30',
  }

  return (
    <motion.button
      type={type}
      className={`${base} ${variants[variant]} ${className} ${variant === 'primary' ? 'animate-btn-glow' : ''}`}
      whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
