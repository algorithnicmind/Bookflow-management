import { type Variants, type Transition } from "framer-motion";

// ─── Easing Presets ────────────────────────────────
export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.27, 1.55] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
};

// ─── Transition Presets ────────────────────────────
export const transition = {
  fast: { duration: 0.15, ease: easing.smooth } as Transition,
  normal: { duration: 0.25, ease: easing.smooth } as Transition,
  slow: { duration: 0.4, ease: easing.smooth } as Transition,
  slower: { duration: 0.6, ease: easing.smooth } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 25 } as Transition,
  springBouncy: { type: "spring", stiffness: 400, damping: 17 } as Transition,
  springGentle: { type: "spring", stiffness: 200, damping: 20 } as Transition,
};

// ─── Page / Section Transitions ────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.normal },
  exit: { opacity: 0, transition: transition.fast },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
  exit: { opacity: 0, y: -10, transition: transition.fast },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
  exit: { opacity: 0, y: 10, transition: transition.fast },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: transition.slow },
  exit: { opacity: 0, x: -20, transition: transition.fast },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: transition.slow },
  exit: { opacity: 0, x: 20, transition: transition.fast },
};

// ─── Scale Animations ──────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: transition.spring },
  exit: { opacity: 0, scale: 0.95, transition: transition.fast },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: transition.springBouncy },
  exit: { opacity: 0, scale: 0.9, transition: transition.fast },
};

// ─── Stagger Container ─────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// ─── Stagger Items ──────────────────────────────────
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.smooth },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easing.smooth },
  },
};

export const staggerItemSlide: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: easing.smooth },
  },
};

// ─── Page Transition (for PageTransition wrapper) ──
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: easing.smooth }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.2, ease: easing.smooth }
  },
};

// ─── Modal / Dialog ────────────────────────────────
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15, delay: 0.1 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transition.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: transition.fast,
  },
};

// ─── Dropdown / Popover ────────────────────────────
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -3,
    transition: { duration: 0.1 },
  },
};

// ─── Sidebar ───────────────────────────────────────
export const sidebarExpand: Variants = {
  collapsed: { width: 72 },
  expanded: { width: 260, transition: transition.normal },
};

// ─── Notification Badge Pulse ──────────────────────
export const pulseBadge: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      repeat: 2,
      ease: easing.smooth,
    },
  },
};

// ─── Table Row ─────────────────────────────────────
export const tableRow: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: easing.smooth },
  }),
};

// ─── Card List Item ────────────────────────────────
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      delay: i * 0.05, 
      duration: 0.4, 
      ease: easing.smooth 
    },
  }),
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.2 } 
  },
};

// ─── Hover Lift Effect ─────────────────────────────
export const hoverLift = {
  whileHover: { y: -4, transition: transition.fast },
  whileTap: { y: 0, scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: transition.fast },
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 24px rgba(79, 70, 229, 0.3)",
    transition: transition.fast,
  },
};

// ─── Count Up (for AnimatedCounter) ────────────────
export const countUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing.decelerate },
  },
};

// ─── Skeleton Loading ──────────────────────────────
export const skeletonPulse: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};
