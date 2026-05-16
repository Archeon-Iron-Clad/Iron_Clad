import { motion } from 'framer-motion'
import { fadeUp, stagger } from './motion'

const PILLARS = [
  {
    icon: 'groups',
    title: 'Collaborate live',
    description:
      'See teammates on the same page. Presence, shared redaction boxes, and instant sync through Convex.',
  },
  {
    icon: 'crop_free',
    title: 'Redact with precision',
    description:
      'Draw visual boxes on the PDF canvas. Coordinates persist in the database and burn into exports.',
  },
  {
    icon: 'history',
    title: 'Audit every change',
    description:
      'Track annotations and activity. Ship release-ready PDFs with confidence for matters and cases.',
  },
] as const

export function AboutAimSection() {
  return (
    <section id="about" className="relative scroll-mt-24 py-28 sm:py-32">
      <motion.div
        className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#316bf3]/10 blur-[80px]"
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.p
              variants={fadeUp}
              className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#aac7ff]"
            >
              About us
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl leading-tight text-white sm:text-5xl"
            >
              Built for teams who can&apos;t afford redaction mistakes.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-white/60">
              Iron Clad was born from a buildathon challenge: make PDF redaction visual,
              collaborative, and real-time. We replace opaque black bars with coordinate-precise
              overlays—so your team sees exactly what will ship.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed text-white/60">
              Our aim is simple: give legal and operations teams a workspace that feels as
              polished as the documents they protect.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/50">
              Our aim
            </p>
            {PILLARS.map((pillar) => (
              <motion.article
                key={pillar.title}
                variants={fadeUp}
                className="marketing-card flex gap-5 rounded-2xl p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0051d5]/20 text-[#aac7ff]">
                  <span className="material-symbols-outlined text-2xl">{pillar.icon}</span>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {pillar.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
