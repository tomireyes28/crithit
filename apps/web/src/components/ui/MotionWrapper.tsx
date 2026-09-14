'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn: React.FC<MotionProps> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.25, 1, 0.5, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay = 0.05) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.02,
    },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
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
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.25, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export { AnimatePresence, motion };
