import { motion } from 'framer-motion'

export function GlassCard({ children, className = '', hoverLift = true, ...props }) {
  return (
    <motion.div
      className={`glass-panel ${className}`}
      whileHover={
        hoverLift
          ? { y: -4, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}
