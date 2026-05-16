import { motion } from 'framer-motion'
import { fadeUp, stagger } from './motion'
import { scrollToId } from '../../lib/scrollTo'

function ProductMock() {
  return (
    <div className="marketing-doc-mock relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[12%] top-[18%] h-[3%] w-[55%] rounded-sm bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
      <motion.div
        className="absolute left-[12%] top-[26%] h-[2%] w-[72%] rounded-sm bg-white/[0.06]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.55, duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
      <motion.div
        className="absolute left-[12%] top-[32%] h-[2%] w-[65%] rounded-sm bg-white/[0.06]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.65, duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
      <motion.div
        className="absolute left-[10%] top-[42%] h-[8%] w-[78%] rounded border-2 border-dashed border-[#9333ea] bg-[#9333ea]/15"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      />
      <motion.div
        className="absolute left-[10%] top-[54%] h-[6%] w-[45%] rounded bg-black/80 ring-1 ring-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      />
      <motion.div
        className="absolute right-[14%] top-[48%] flex items-center gap-1 rounded-full bg-[#0051d5]/90 px-2 py-1 text-[10px] font-medium text-white shadow-lg"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Live
      </motion.div>
      <motion.div
        className="absolute bottom-[18%] left-[12%] h-[2%] w-[80%] rounded-sm bg-white/[0.05]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
      <motion.div
        className="absolute bottom-[12%] left-[12%] h-[2%] w-[60%] rounded-sm bg-white/[0.05]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      id="home"
      className="marketing-mesh relative flex min-h-screen flex-col justify-center overflow-hidden pt-28 pb-20"
    >
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[#0051d5]/20 blur-[100px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-medium uppercase tracking-[0.2em] text-[#aac7ff]"
          >
            Collaborative PDF redaction
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Redact together.
            <br />
            <span className="italic text-[#aac7ff]">Ship faster.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-lg text-lg leading-relaxed text-white/65"
          >
            Iron Clad is real-time visual PDF redaction for legal and ops teams—draw
            boxes on the canvas, sync with your team, export audit-ready releases.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => scrollToId('signup')}
              className="rounded-full bg-[#0051d5] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#0051d5]/35 transition hover:bg-[#316bf3]"
            >
              Get started free
            </button>
            <button
              type="button"
              onClick={() => scrollToId('about')}
              className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/5"
            >
              Our mission
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <ProductMock />
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <button
          type="button"
          onClick={() => scrollToId('about')}
          className="flex flex-col items-center gap-1 border-0 bg-transparent text-white/40"
          aria-label="Scroll to about"
        >
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </motion.div>
    </section>
  )
}
