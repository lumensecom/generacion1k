'use client';

import { motion } from 'framer-motion';
import { Eye, Package, ShoppingCart, CreditCard, CheckCircle2 } from 'lucide-react';

const EVENTS = [
  { key: 'PageView', label: 'PageView', page: '/', icon: Eye, note: 'Alguien entró a tu tienda.' },
  { key: 'ViewContent', label: 'ViewContent', page: '/producto', icon: Package, note: 'Vio el cinturón anticólicos.' },
  { key: 'AddToCart', label: 'AddToCart', page: '/carrito', icon: ShoppingCart, note: 'Lo agregó al carrito.' },
  { key: 'InitiateCheckout', label: 'InitiateCheckout', page: '/checkout', icon: CreditCard, note: 'Empezó a llenar sus datos.' },
  {
    key: 'Purchase',
    label: 'Purchase',
    page: '/gracias',
    icon: CheckCircle2,
    note: 'Compró. Meta y TikTok ya saben optimizar para más gente parecida a ella.',
  },
];

export function PixelEventsFlow({ activeStep, accentColor }: { activeStep: number; accentColor: string }) {
  const current = EVENTS[activeStep];
  const CurrentIcon = current.icon;

  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-2">
        {['Meta', 'TikTok'].map((platform) => (
          <div key={platform} className="relative">
            <motion.span
              key={activeStep + platform}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: accentColor }}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <span
              className="relative rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold text-white"
              style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}1A` }}
            >
              {platform}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
        <div className="border-b border-border px-3.5 py-2 font-mono text-[10.5px] text-text-muted">
          tutienda.myshopify.com{current.page}
        </div>
        <div className="flex items-center gap-3 p-4 sm:p-5">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: accentColor }}
          >
            <CurrentIcon className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="font-mono text-[11px] font-bold" style={{ color: accentColor }}>
              {current.label}
            </p>
            <p className="text-[12.5px] text-text-secondary">{current.note}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {EVENTS.map((ev, i) => (
          <span
            key={ev.key}
            className={`rounded-full border px-2.5 py-1 font-mono text-[10.5px] transition-colors duration-300 ${
              i <= activeStep ? 'text-white' : 'border-border text-text-muted'
            }`}
            style={i <= activeStep ? { borderColor: accentColor, backgroundColor: `${accentColor}18` } : undefined}
          >
            {i < activeStep ? '✓ ' : ''}
            {ev.label}
          </span>
        ))}
      </div>
    </div>
  );
}
