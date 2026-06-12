/** FBR AI — unified motion design tokens */
export const MOTION = {
  scroll: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  hover: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  modal: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  stagger: 0.1,
} as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.scroll.duration, ease: MOTION.scroll.ease },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION.scroll.duration, ease: MOTION.scroll.ease },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION.scroll.duration, ease: MOTION.scroll.ease },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: MOTION.stagger, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.scroll.duration, ease: MOTION.scroll.ease },
  },
};

export const pageLoadContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: MOTION.stagger, delayChildren: 0.08 },
  },
};

export const pageLoadItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.scroll.duration, ease: MOTION.scroll.ease },
  },
};

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MOTION.modal.duration } },
  exit: { opacity: 0, transition: { duration: MOTION.modal.duration } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOTION.modal.duration, ease: MOTION.modal.ease },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: MOTION.modal.duration },
  },
};

/** Client-side route changes (App Router) */
export const pageTransition = {
  duration: 0.42,
  ease: MOTION.scroll.ease,
};

export const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: pageTransition.duration, ease: pageTransition.ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.28, ease: pageTransition.ease },
  },
};

export const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const adminPageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.32, ease: pageTransition.ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22, ease: pageTransition.ease },
  },
};
