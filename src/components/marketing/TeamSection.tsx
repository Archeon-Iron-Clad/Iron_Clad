import { motion } from 'framer-motion'
import { useState } from 'react'
import { TEAM_GROUP_PHOTO, TEAM_MEMBERS } from '../../data/team'
import { fadeUp, stagger } from './motion'

function LinkedInIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function LinkedInLink({ url, name }: { url: string; name: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on LinkedIn`}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/55 transition hover:border-[#aac7ff]/40 hover:bg-[#0051d5]/20 hover:text-[#aac7ff]"
    >
      <LinkedInIcon />
    </a>
  )
}

export function TeamSection() {
  const [photoMissing, setPhotoMissing] = useState(false)
  return (
    <section id="team" className="relative scroll-mt-24 py-28 sm:py-32">
      <motion.div
        className="mx-auto max-w-6xl px-5 sm:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.div variants={fadeUp} className="mb-12 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#aac7ff]">
            Team
          </p>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            The people behind Iron Clad
          </h2>
          <p className="mt-4 text-lg text-white/55">
            Three friends, one 24-hour buildathon, and Iron Clad—shipped before the buzzer.
          </p>
        </motion.div>

        <motion.figure
          variants={fadeUp}
          className="marketing-card mb-12 overflow-hidden rounded-2xl"
        >
          <div className="relative aspect-[21/9] min-h-[200px] w-full overflow-hidden bg-[#111820] sm:aspect-[2.4/1]">
            {photoMissing ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white/45">
                <span className="material-symbols-outlined text-4xl text-white/25">groups</span>
                <p className="text-sm">
                  Add your group photo as{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">
                    public/team-photo.jpg
                  </code>
                </p>
              </div>
            ) : (
              <img
                src={TEAM_GROUP_PHOTO}
                alt="The Iron Clad team"
                loading="lazy"
                className="h-full w-full object-cover object-center"
                onError={() => setPhotoMissing(true)}
              />
            )}
            {!photoMissing ? (
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060a12]/80 via-transparent to-transparent"
                aria-hidden
              />
            ) : null}
          </div>
          <figcaption className="border-t border-white/8 px-5 py-3 text-center text-xs text-white/40 sm:text-left">
            The Iron Clad team
          </figcaption>
        </motion.figure>

        <ul className="grid gap-6 md:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <motion.li key={member.name} variants={fadeUp}>
              <article className="marketing-card flex h-full flex-col rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-[#aac7ff]">{member.role}</p>
                  </div>
                  {member.linkedinUrl ? (
                    <LinkedInLink url={member.linkedinUrl} name={member.name} />
                  ) : null}
                </div>
                {member.bio ? (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{member.bio}</p>
                ) : null}
              </article>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
