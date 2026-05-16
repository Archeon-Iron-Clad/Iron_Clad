export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const fadeUp = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export const stagger = {
  visible: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.12,
    },
  },
}
