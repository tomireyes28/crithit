'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Curva de inercia natural (Apple / Linear style)
export const INERTIA_EASING = [0.16, 1, 0.3, 1];

// Constantes de resortes físicos universales
export const SPRING_GENTLE = { type: 'spring', damping: 20, stiffness: 120 } as const;
export const SPRING_BOUNCY = { type: 'spring', damping: 15, stiffness: 260 } as const;
export const SPRING_SNAPPY = { type: 'spring', damping: 25, stiffness: 400 } as const;

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn: React.FC<MotionProps> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: INERTIA_EASING }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScrollReveal: React.FC<
  MotionProps & {
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    duration?: number;
    viewportAmount?: number;
  }
> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 32,
  duration = 0.6,
  viewportAmount = 0.15,
}) => {
  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{
        duration,
        delay,
        ease: INERTIA_EASING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay = 0.05) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.04,
    },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: INERTIA_EASING },
  },
};

export const StaggerContainer: React.FC<MotionProps & { staggerDelay?: number }> = ({
  children,
  className = '',
  staggerDelay = 0.04,
}) => (
  <motion.div
    variants={containerVariants}
    custom={staggerDelay}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

export const ScrollStaggerContainer: React.FC<MotionProps & { staggerDelay?: number }> = ({
  children,
  className = '',
  staggerDelay = 0.05,
}) => (
  <motion.div
    variants={containerVariants}
    custom={staggerDelay}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<MotionProps> = ({ children, className = '' }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

export const HoverLift: React.FC<MotionProps> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.015 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleFade: React.FC<MotionProps> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Floating: React.FC<
  MotionProps & { duration?: number; distance?: number }
> = ({ children, className = '', duration = 4, distance = 6 }) => (
  <motion.div
    animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export { AnimatePresence, motion };

