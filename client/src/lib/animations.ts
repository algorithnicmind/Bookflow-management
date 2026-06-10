import { type Variants, type Transition } from "framer-motion";

// ─── Easing Presets ────────────────────────────────
export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.27, 1.55] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
};

// ─── Transition Presets ────────────────────────────
export const transition = {
  fast: { duration: 0.15, ease: easing.smooth } as Transition,
  normal: { duration: 0.25, ease: easing.smooth } as Transition,
  slow: { duration: 0.4, ease: easing.smooth } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 25 } as Transition,
  springBouncy: { type: "spring", stiffness: 400, damping: 17 } as Transition,
};

// ─── Page / Section Transitions ────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.normal },
  exit: { opacity: 0, transition: transition.fast },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
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

// ─── Stagger Items ──────────────────────────────────
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easing.smooth },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easing.smooth },
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

// ─── Hover Lift Effect ─────────────────────────────
export const hoverLift = {
  whileHover: { y: -4, transition: transition.fast },
  whileTap: { y: 0, scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: transition.fast },
  whileTap: { scale: 0.98 },
};
