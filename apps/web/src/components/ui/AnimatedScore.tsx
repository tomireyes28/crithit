'use client';

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, useInView, useReducedMotion } from 'framer-motion';

export interface AnimatedScoreProps {
  value: number;
  from?: number;
  animateOnMount?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  damping?: number;
  stiffness?: number;
  className?: string;
}

/**
 * AnimatedScore / RollingNumber:
 * Contador de números rodantes ultra-suave impulsado por resortes físicos de Framer Motion.
 * Se activa automáticamente al entrar en el viewport del usuario con 'useInView'.
 * Actualiza el DOM en 60 FPS sin provocar re-renders de React.
 */
export function AnimatedScore({
  value,
  from = 0,
  animateOnMount = true,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = false,
  damping = 24,
  stiffness = 110,
  className = '',
}: AnimatedScoreProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const motionVal = useMotionValue(shouldReduceMotion || !animateOnMount ? value : from);
  const springVal = useSpring(motionVal, {
    damping,
    stiffness,
    mass: 0.6,
  });

  const formatNumber = (num: number) => {
    let rounded = decimals > 0 ? num.toFixed(decimals) : String(Math.round(num));
    if (separator) {
      const parts = rounded.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      rounded = parts.join('.');
    }
    return `${prefix}${rounded}${suffix}`;
  };

  const displayVal = useTransform(springVal, (current) => formatNumber(current));

  useEffect(() => {
    if (shouldReduceMotion) {
      motionVal.set(value);
      if (ref.current) ref.current.textContent = formatNumber(value);
      return;
    }

    if (isInView || !animateOnMount) {
      motionVal.set(value);
    }
  }, [value, isInView, shouldReduceMotion, animateOnMount, motionVal]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    return displayVal.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
  }, [displayVal, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(shouldReduceMotion || !animateOnMount ? value : from)}
    </span>
  );
}

/**
 * RollingNumber: Alias utilitario para métricas, horas y contadores de comunidad
 */
export const RollingNumber = AnimatedScore;
