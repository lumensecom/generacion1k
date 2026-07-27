'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedTab {
  value: string;
  label: string;
  icon?: ReactNode;
}

export function TabsAnimated({
  tabs,
  active,
  onChange,
  accentColor,
  className,
}: {
  tabs: AnimatedTab[];
  active: string;
  onChange: (value: string) => void;
  accentColor?: string;
  className?: string;
}) {
  const color = accentColor ?? '#7C3AED';

  return (
    <div className={cn('flex flex-wrap gap-1 rounded-xl border border-border bg-bg-card p-1', className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors',
              isActive ? 'text-white' : 'text-text-secondary hover:text-white'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tabs-animated-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: color }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ value, active, children }: { value: string; active: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {value === active && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
