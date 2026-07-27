'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';

export function InteractiveChecklist({
  items,
  checked,
  onToggle,
  accentColor,
}: {
  items: string[];
  checked: Set<number>;
  onToggle: (index: number) => void;
  accentColor?: string;
}) {
  const color = accentColor ?? '#10B981';
  const celebrated = useRef(false);
  const allDone = items.length > 0 && checked.size === items.length;

  useEffect(() => {
    if (allDone && !celebrated.current) {
      celebrated.current = true;
      fireConfetti();
    }
    if (!allDone) celebrated.current = false;
  }, [allDone]);

  return (
    <div className="space-y-3">
      {items.map((label, i) => {
        const isChecked = checked.has(i);
        return (
          <motion.button
            key={i}
            type="button"
            onClick={() => onToggle(i)}
            className={cn(
              'flex w-full items-start gap-3 rounded-xl border px-5 py-4 text-left text-sm transition-colors',
              isChecked ? 'text-white' : 'border-border bg-bg-card text-text-secondary'
            )}
            style={isChecked ? { borderColor: `${color}66`, backgroundColor: `${color}12` } : undefined}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            {isChecked ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color }} />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-text-muted" />
            )}
            {label}
          </motion.button>
        );
      })}
      {items.length > 0 && (
        <p className="pt-1 text-xs text-text-muted">
          {checked.size} de {items.length} completados
        </p>
      )}
    </div>
  );
}
