'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const STEP_CAPTIONS = [
  'Cuenta creada con el trial de $1 USD — la tienda todavía está vacía.',
  'Tema Horizon instalado: hero y grid de productos listos, optimizados para móvil.',
  'Moneda configurada en COP — los precios ya se ven como los va a ver tu cliente.',
  'Checkout de 3 pasos colapsado a 1 solo paso — así se comporta el PCE en Shopify.',
  'ReleaseIt COD instalado: el cliente confirma por WhatsApp apenas compra.',
  'Producto ganador publicado. Tu tienda ya puede recibir el primer pedido.',
];

export function ShopifyStoreBuild({ activeStep, accentColor }: { activeStep: number; accentColor: string }) {
  const hasTheme = activeStep >= 1;
  const hasCOP = activeStep >= 2;
  const hasCheckout = activeStep >= 3;
  const hasWhatsApp = activeStep >= 4;
  const isLive = activeStep >= 5;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-bg-secondary">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md" style={{ backgroundColor: accentColor }} />
            <span className="font-display text-[11.5px] font-bold text-white">Mi Tienda</span>
          </div>
          <AnimatePresence>
            {isLive && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-full bg-brand-success/15 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-brand-success"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> live
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 sm:p-5">
          {!hasTheme && (
            <div className="space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
              <p className="pt-2 font-mono text-[10.5px] text-text-muted">Sin publicar todavía</p>
            </div>
          )}

          <AnimatePresence>
            {hasTheme && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="mb-3 h-14 rounded-lg" style={{ backgroundColor: `${accentColor}18` }} />
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="rounded-lg border border-border p-2">
                      <div className="mb-1.5 h-8 rounded" style={{ backgroundColor: `${accentColor}14` }} />
                      <div className="h-1.5 w-4/5 rounded bg-white/10" />
                      <div key={hasCOP ? 'cop' : 'generic'} className="mt-1 font-mono text-[10px] font-bold" style={{ color: accentColor }}>
                        {hasCOP ? '$69.900' : '$--'}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasCheckout && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 flex items-center gap-1.5">
                <span
                  className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  1 paso · Pago contra entrega
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasWhatsApp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-3.5 flex max-w-[240px] items-start gap-2 rounded-xl rounded-tl-sm border border-brand-success/25 bg-brand-success/10 p-2.5"
              >
                <MessageCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-success" />
                <p className="text-[11px] leading-snug text-text-secondary">
                  &ldquo;¡Hola! <b className="text-white">CONFIRMO</b> mi pedido en Mi Tienda...&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-[13.5px] leading-relaxed text-text-secondary"
        >
          {STEP_CAPTIONS[activeStep]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
