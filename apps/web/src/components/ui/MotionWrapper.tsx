'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

// Curva de inercia natural (Apple / Linear style)
export const INERTIA_EASING = [0.16, 1, 0.3, 1] as const;

// Constantes de resortes físicos universales (Física natural sin sensación de corte rígido)
export const SPRING_GENTLE = { type: 'spring', damping: 20, stiffness: 120 } as const;
export const SPRING_BOUNCY = { type: 'spring', damping: 15, stiffness: 260 } as const;
export const SPRING_SNAPPY = { type: 'spring', damping: 25, stiffness: 400 } as const;
export const SPRING_TIGHT = { type: 'spring', damping: 30, stiffness: 500 } as const;

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * FadeIn suave para componentes de carga inicial
 */
export const FadeIn: React.FC<MotionProps> = ({ children, className = '', delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: INERTIA_EASING }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScrollReveal: Aparición suave y controlada por viewport al hacer scroll
 */
export const ScrollReveal: React.FC<
  MotionProps & {
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number;
    duration?: number;
    viewportAmount?: number;
    spring?: boolean;
  }
> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 0.55,
  viewportAmount = 0.15,
  spring = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const initialOffset = shouldReduceMotion ? { x: 0, y: 0 } : directions[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: viewportAmount, margin: '0px 0px -40px 0px' }}
      transition={
        spring
          ? { ...SPRING_GENTLE, delay }
          : { duration, delay, ease: INERTIA_EASING }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Variantes para contenedores con efecto cascada (Stagger)
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
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: INERTIA_EASING },
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
    viewport={{ once: true, amount: 0.1, margin: '0px 0px -30px 0px' }}
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

/**
 * HoverLift: Elevación sutil en reposo y micro-compresión al presionar
 */
export const HoverLift: React.FC<MotionProps> = ({ children, className = '' }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.012 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * BouncyTap: Micro-rebote físico elástico para botones y llamadas a la acción
 */
export const BouncyTap: React.FC<MotionProps & { scaleOnHover?: number; scaleOnTap?: number }> = ({
  children,
  className = '',
  scaleOnHover = 1.03,
  scaleOnTap = 0.96,
}) => (
  <motion.div
    whileHover={{ scale: scaleOnHover }}
    whileTap={{ scale: scaleOnTap }}
    transition={SPRING_BOUNCY}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleFade: React.FC<MotionProps> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.93 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * Floating: Levitación continua armónica con función senoidal
 */
export const Floating: React.FC<
  MotionProps & { duration?: number; distance?: number }
> = ({ children, className = '', duration = 4, distance = 6 }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * MagneticHover: Efecto de atracción elástica del cursor hacia botones, iconos o avatares
 */
export const MagneticHover: React.FC<
  MotionProps & {
    pullDistance?: number;
    springConfig?: { damping: number; stiffness: number };
  }
> = ({
  children,
  className = '',
  pullDistance = 8,
  springConfig = { damping: 15, stiffness: 200 },
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (e.clientX - centerX) / (width / 2);
    const deltaY = (e.clientY - centerY) / (height / 2);

    mouseX.set(deltaX * pullDistance);
    mouseY.set(deltaY * pullDistance);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * SpotlightCard: Tarjeta con halo de luz interactivo que persigue la posición exacta del cursor
 */
export const SpotlightCard: React.FC<
  MotionProps & {
    spotlightColor?: string;
    spotlightSize?: number;
  }
> = ({
  children,
  className = '',
  spotlightColor = 'rgba(0, 210, 255, 0.08)',
  spotlightSize = 400,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Halo radial interactivo */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

/**
 * TiltCard: Tarjeta con inclinación 3D en perspectiva física interactiva y brillo especular
 */
export const TiltCard: React.FC<
  MotionProps & {
    maxTilt?: number;
  }
> = ({ children, className = '', maxTilt = 7 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    damping: 20,
    stiffness: 200,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    damping: 20,
    stiffness: 200,
  });

  const [isInteracting, setIsInteracting] = useState(false);

  const handleMouseEnter = () => {
    if (!shouldReduceMotion) setIsInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
      }}
      className={`${className} ${isInteracting ? 'will-change-transform' : ''}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * GlobalMotionConfig: Wrapper de configuración universal de accesibilidad
 * Activa automáticamente el respeto a prefers-reduced-motion: reduce a nivel de Framer Motion
 */
export const GlobalMotionConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user">
    {children}
  </MotionConfig>
);

export * from './MotionButtons';
export { AnimatePresence, motion, MotionConfig };
