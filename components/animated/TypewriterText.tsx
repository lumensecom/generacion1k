'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export function TypewriterText({
  text,
  speed = 28,
  className,
  cursor = true,
}: {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setShown(text);
      setDone(true);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [inView, text, speed, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {shown}
      {cursor && !done && <span className="animate-pulse text-brand-purpleLight">|</span>}
    </span>
  );
}
