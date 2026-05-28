import { motion, useScroll, useTransform } from 'framer-motion'

export function CinematicBackground({ parallax = false }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, parallax ? 80 : 0])
  const y2 = useTransform(scrollY, [0, 500], [0, parallax ? -40 : 0])

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-cine-base" />
      <motion.div
        style={{ y: y1 }}
        className="absolute -left-1/4 top-0 h-[min(80vh,600px)] w-[min(80vw,600px)] rounded-full bg-cine-red/25 blur-[120px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute -right-1/4 top-1/3 h-[min(70vh,520px)] w-[min(70vw,520px)] rounded-full bg-cine-purple/20 blur-[100px]"
      />
      <div className="absolute bottom-0 left-1/2 h-[40vh] w-[120%] -translate-x-1/2 bg-gradient-to-t from-cine-rose/10 via-transparent to-transparent blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(155,93,229,0.15),transparent)]" />
    </div>
  )
}
