'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, MousePointerClick, Code2 } from 'lucide-react';
import { BLOQUES, TEMPERATURAS, type Bloque } from '@/lib/recursos-data';
import { BloqueCodigo } from '@/components/recursos/BloqueCodigo';

// Altura de cada recuadro en el esqueleto, según lo que representa. No son
// medidas reales: son proporciones que hacen legible la estructura de un
// vistazo, igual que en un wireframe a mano.
const ALTURA: Record<Bloque['tipo'], number> = {
  anuncio: 28,
  media: 96,
  texto: 54,
  social: 44,
  cta: 40,
  lista: 80,
  datos: 88,
  urgencia: 62,
};

export function AnatomiaLanding() {
  const [activo, setActivo] = useState<Bloque | null>(null);
  const [tocado, setTocado] = useState(false);
  const sinMovimiento = useReducedMotion();

  const cerrar = useCallback(() => setActivo(null), []);

  useEffect(() => {
    if (!activo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', onKey);
    // Bloquea el scroll del fondo mientras la ventana está abierta.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [activo, cerrar]);

  return (
    <>
      <section className="relative px-5 pb-10 pt-4 sm:pt-8">
        {/* Resplandor ambiental: es lo que hace que el esqueleto se lea
            "por encima" del fondo negro, sin necesidad de rotarlo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px]"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-[380px]">
          {/* Marco: da la lectura de "esto es una página" */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[26px] border border-brand-purple/30 bg-gradient-to-b from-white/[0.045] to-white/[0.012] p-3 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.9),0_0_70px_-12px_rgba(124,58,237,0.35)] backdrop-blur-sm sm:p-4"
          >
            {/* Barra superior tipo navegador */}
            <div className="mb-3 flex items-center gap-1.5 px-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="ml-2 h-1.5 flex-1 rounded-full bg-white/[0.07]" />
            </div>

            <div className="space-y-2">
              {BLOQUES.map((bloque, i) => (
                <div key={bloque.id}>
                  {/* Entre el bloque 1 y el 2 va el formulario de pedido, que
                      lo pone la app de contra entrega y no se toca. Marcarlo
                      aquí evita la confusión de por qué son dos bloques. */}
                  {bloque.bloque === 2 && BLOQUES[i - 1]?.bloque === 1 && (
                    <div className="my-3 flex items-center gap-3">
                      <span className="h-px flex-1 bg-brand-yellow/25" />
                      <span className="whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.14em] text-brand-yellow/70">
                        Formulario de pedido
                      </span>
                      <span className="h-px flex-1 bg-brand-yellow/25" />
                    </div>
                  )}
                  <Recuadro
                    bloque={bloque}
                    indice={i}
                    sinMovimiento={!!sinMovimiento}
                    onClick={() => {
                      setActivo(bloque);
                      setTocado(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pista de interacción */}
          <AnimatePresence>
            {!tocado && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="pointer-events-none mt-7 flex justify-center"
              >
                <motion.span
                  animate={sinMovimiento ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-2 rounded-full border border-brand-purple/30 bg-bg-card/90 px-4 py-2.5 text-[12.5px] font-semibold text-text-secondary backdrop-blur"
                >
                  <MousePointerClick size={14} className="text-brand-purpleLight" />
                  Toca cualquier sección para abrirla
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <VentanaDetalle bloque={activo} onClose={cerrar} />
    </>
  );
}

function Recuadro({
  bloque,
  indice,
  sinMovimiento,
  onClick,
}: {
  bloque: Bloque;
  indice: number;
  sinMovimiento: boolean;
  onClick: () => void;
}) {
  const temp = TEMPERATURAS[bloque.temperatura];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: sinMovimiento ? 0 : 0.25 + indice * 0.055,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={sinMovimiento ? undefined : { scale: 1.025 }}
      whileTap={{ scale: 0.985 }}
      style={{ height: ALTURA[bloque.tipo] }}
      className="group relative flex w-full items-center justify-center rounded-xl border border-brand-purple/40 bg-brand-purple/[0.06] transition-colors duration-200 hover:border-brand-purpleLight hover:bg-brand-purple/[0.14]"
      aria-label={`Ver ${bloque.nombre}`}
    >
      {/* Número de orden */}
      <span className="pointer-events-none absolute left-2.5 top-2 font-mono text-[9px] text-brand-purpleLight/50">
        {String(indice + 1).padStart(2, '0')}
      </span>

      {/* Punto de temperatura */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full"
        style={{ background: temp.color }}
        title={temp.etiqueta}
      />

      <span className="pointer-events-none px-4 text-center font-display text-[11px] font-extrabold uppercase leading-tight tracking-[0.04em] text-white/85 transition-colors group-hover:text-white">
        {bloque.nombre}
      </span>

      {/* Brillo que barre el recuadro al pasar el cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent transition-[left] duration-700 ease-out group-hover:left-full" />
      </span>
    </motion.button>
  );
}

function VentanaDetalle({ bloque, onClose }: { bloque: Bloque | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {bloque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={bloque.nombre}
            initial={{ opacity: 0, scale: 0.9, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-brand-purple/40 bg-bg-secondary shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95),0_0_80px_-20px_rgba(124,58,237,0.45)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
              <div className="min-w-0">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: TEMPERATURAS[bloque.temperatura].color }}
                >
                  Tráfico {TEMPERATURAS[bloque.temperatura].etiqueta} ·{' '}
                  {TEMPERATURAS[bloque.temperatura].descripcion}
                </span>
                <h3 className="mt-2 font-display text-xl font-extrabold leading-tight tracking-tight">
                  {bloque.nombre}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-1 shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-7 overflow-y-auto px-6 pb-8 pt-6">
              <p className="text-[15px] leading-relaxed text-text-secondary">
                {bloque.resumen}
              </p>

              <div className="rounded-xl border border-brand-purple/25 bg-brand-purple/[0.07] p-5">
                <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-purpleLight">
                  Por qué va aquí
                </h4>
                <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary">
                  {bloque.porQue}
                </p>
              </div>

              <div>
                <h4 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-muted">
                  Claves
                </h4>
                <ul className="mt-4 space-y-3">
                  {bloque.claves.map((clave, i) => (
                    <motion.li
                      key={clave}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 + i * 0.07, duration: 0.35 }}
                      className="flex gap-3 text-[14.5px] leading-relaxed text-text-secondary"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-purpleLight" />
                      {clave}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-muted">
                    <Code2 size={12} /> Código de esta sección
                  </h4>
                  <span className="whitespace-nowrap rounded-full border border-border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                    Bloque {bloque.bloque}
                  </span>
                </div>
                <BloqueCodigo codigo={bloque.liquid} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
