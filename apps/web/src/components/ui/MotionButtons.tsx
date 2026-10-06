'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { SPRING_BOUNCY, SPRING_SNAPPY } from './MotionWrapper';

export interface ButtonBaseProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: (e: React.MouseEvent<any>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  shimmer?: boolean;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-secondary text-white shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:shadow-[0_0_30px_rgba(0,210,255,0.55)] border border-cyan-400/30',
  secondary:
    'bg-brand-surface/90 hover:bg-brand-surface text-brand-text border border-brand-border/80 hover:border-brand-secondary/50 backdrop-blur-md shadow-md',
  glass:
    'glass-card-v2 text-white border border-white/10 hover:border-cyan-400/40 shadow-lg',
  outline:
    'bg-transparent hover:bg-brand-surface/60 text-brand-text border border-brand-border hover:border-white/30',
  ghost:
    'bg-transparent hover:bg-brand-surface/60 text-brand-muted hover:text-white',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-bold',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-bold',
};

/**
 * ShimmerButton:
 * Botón con micro-rebote elástico, elevación háptica y destello diagonal (shimmer streak) continuo
 */
export const ShimmerButton: React.FC<ButtonBaseProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
  icon,
  shimmer = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `relative inline-flex items-center justify-center font-bold overflow-hidden select-none transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  const content = (
    <>
      {/* Destello Shimmer Streak */}
      {shimmer && !shouldReduceMotion && (
        <motion.div
          animate={{ x: ['-130%', '220%'] }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: 'easeInOut',
            repeatDelay: 1.5,
          }}
          className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
        />
      )}

      {/* Halo de brillo interno en hover */}
      {isHovered && !shouldReduceMotion && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none transition-opacity" />
      )}

      {/* Contenido con icono */}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </>
  );

  const motionProps = {
    whileHover: disabled ? undefined : { y: -2, scale: 1.025 },
    whileTap: disabled ? undefined : { scale: 0.96 },
    transition: SPRING_BOUNCY,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={baseClasses} onClick={onClick}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
      className={baseClasses}
    >
      {content}
    </motion.button>
  );
};

/**
 * LiquidButton:
 * Botón con micro-rebote y foco interactivo líquido que sigue la posición del puntero dentro del botón
 */
export const LiquidButton: React.FC<ButtonBaseProps> = ({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
  icon,
}) => {
  const buttonRef = useRef<any>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current || shouldReduceMotion) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const baseClasses = `relative inline-flex items-center justify-center font-bold overflow-hidden select-none transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  } ${className}`;

  const content = (
    <>
      {/* Halo líquido interactivo */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.2 : 0,
            background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, rgba(0, 210, 255, 0.7), transparent 70%)`,
          }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </>
  );

  const motionProps = {
    whileHover: disabled ? undefined : { y: -2, scale: 1.02 },
    whileTap: disabled ? undefined : { scale: 0.96 },
    transition: SPRING_SNAPPY,
    onMouseMove: handleMouseMove as any,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  if (href) {
    return (
      <motion.div ref={buttonRef} {...motionProps} className="inline-block">
        <Link href={href} className={baseClasses} onClick={onClick}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      ref={buttonRef as any}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
      className={baseClasses}
    >
      {content}
    </motion.button>
  );
};
