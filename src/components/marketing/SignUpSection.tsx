import { motion } from 'framer-motion'
import { EmailSignInForm } from '../auth/EmailSignInForm'
import { fadeUp, stagger } from './motion'

export function SignUpSection() {
  return (
    <section
      id="signup"
      className="relative scroll-mt-24 py-28 sm:py-32"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="marketing-card mx-auto max-w-xl rounded-3xl p-8 sm:p-10">
          <motion.div variants={fadeUp} className="text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#aac7ff]">
              Sign up
            </p>
            <h2 className="font-display text-3xl text-white sm:text-4xl">
              Start redacting in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
              Enter your work email to open the workspace. Your session labels edits;
              identity is not verified by a third party.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <EmailSignInForm
              variant="marketing"
              submitLabel="Sign up & continue"
              className="max-w-sm mx-auto"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
