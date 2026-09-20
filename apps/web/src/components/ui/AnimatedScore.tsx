'use client';

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedScoreProps {
  value: number;
  animateOnMount?: boolean;
  className?: string;
}

export function AnimatedScore({
  value,
  animateOnMount = true,
  className = '',
}: AnimatedScoreProps) {
  const initial = animateOnMount ? 0 : value;
  const motionVal = useMotionValue(initial);
  const springVal = useSpring(motionVal, {
    damping: 22,
    stiffness: 110,
    mass: 0.7,
  });

  const displayVal = useTransform(springVal, (current) => Math.round(current));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return displayVal.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest);
      }
    });
  }, [displayVal]);

  return (
    <span ref={ref} className={className}>
      {Math.round(value)}
    </span>
  );
}
