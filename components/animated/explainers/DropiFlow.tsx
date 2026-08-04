'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ClipboardList, PackageCheck, Truck, Banknote, Wallet, ArrowDown } from 'lucide-react';
import { AnimatedNumber } from '@/components/animated/AnimatedNumber';

const NODES = [
  {
    icon: ShoppingCart,
    label: 'Cliente compra',
    caption: 'El cliente deja nombre, teléfono, dirección y ciudad en tu checkout — sin pagar todavía.',
  },
  {
    icon: ClipboardList,
    label: 'Orden entra a Dropi',
    caption: 'Dropi recibe el pedido y verifica el stock con tu proveedor, ADMA, en segundos.',
  },
  {
    icon: PackageCheck,
    label: 'Proveedor prepara',
    caption: 'ADMA empaca el producto con los datos de envío del cliente.',
  },
  {
    icon: Truck,
    label: 'Transportadora recoge',
    caption: 'Interrapidísimo recoge y despacha — Coordinadora si es una zona remota.',
  },
  {
    icon: Banknote,
    label: 'Cliente recibe y paga',
    caption: 'El cliente paga en efectivo al mensajero al recibir. Así funciona el PCE.',
  },
  {
    icon: Wallet,
    label: 'Tu ganancia llega al wallet',
    caption: 'El margen queda disponible en tu wallet Dropi, listo para retirar desde $50.000 COP.',
  },
];

export function DropiFlow({ activeStep, accentColor }: { activeStep: number; accentColor: string }) {
  return (
    <div>
      <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
        {NODES.map((node, i) => {
          const Icon = node.icon;
          const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'upcoming';
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-1.5 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:py-0 sm:text-center"
            >
              <div className="relative flex-shrink-0">
                {state === 'active' && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border-2"
                  animate={{
                    backgroundColor: state === 'upcoming' ? 'rgba(0,0,0,0)' : accentColor,
                    borderColor: state === 'upcoming' ? `${accentColor}40` : accentColor,
                    scale: state === 'active' ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <Icon className="h-4 w-4" style={{ color: state === 'upcoming' ? accentColor : '#fff' }} />
                </motion.div>
              </div>
              <span
                className={`text-[11.5px] font-semibold leading-tight sm:max-w-[84px] ${
                  state === 'upcoming' ? 'text-text-muted' : 'text-white'
                }`}
              >
                {node.label}
              </span>
              {i < NODES.length - 1 && (
                <span className="flex flex-none items-center justify-center text-text-muted sm:hidden">
                  <ArrowDown className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-7 rounded-xl border px-4 py-3.5 text-[13.5px] leading-relaxed text-text-secondary"
          style={{ borderColor: `${accentColor}2A`, backgroundColor: `${accentColor}0D` }}
        >
          {NODES[activeStep].caption}
          {activeStep === NODES.length - 1 && (
            <div className="mt-2 font-mono text-lg font-bold" style={{ color: accentColor }}>
              <AnimatedNumber value={32000} prefix="+$" suffix=" COP" duration={1} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
