'use client';

import { motion } from 'framer-motion';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';
import { cn } from '@/lib/utils';

export function CircularProgress({
  percent,
  size = 176,
  theme = 'dark',
}: {
  percent: number;
  size?: number;
  theme?: 'dark' | 'light';
}) {
  const light = theme === 'light';
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={light ? 'rgba(16,16,22,0.08)' : 'rgba(255,255,255,0.08)'}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (clamped / 100) * circumference }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-mono text-3xl font-medium', light ? 'text-light-text' : 'text-white')}>
          <AnimatedNumber value={clamped} suffix="%" />
        </span>
        <span className={cn('text-[10px] uppercase tracking-widest', light ? 'text-light-muted' : 'text-text-muted')}>
          completado
        </span>
      </div>
    </div>
  );
}
