'use client';

import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#7C3AED', '#F59E0B', '#EC4899', '#10B981'];

export function fireConfetti() {
  const duration = 1200;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: BRAND_COLORS });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: BRAND_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function fireBigConfetti() {
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: BRAND_COLORS });
}
