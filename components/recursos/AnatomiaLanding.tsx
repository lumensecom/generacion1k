'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { X, MousePointerClick, Code2, ArrowDown } from 'lucide-react';
import { BLOQUES, TEMPERATURAS, type Bloque } from '@/lib/recursos-data';

// Altura visual de cada bloque en el sketch, según lo que representa.
// No son medidas reales de una landing, son proporciones que hacen legible
// el esqueleto de un vistazo.
const ALTURA: Record<Bloque['tipo'], number> = {
  media: 92,
  texto: 54,
  social: 42,
  cta: 40,
  lista: 76,
  datos: 84,
  urgencia: 34,
};

const TONO: Record<Bloque['temperatura'], { borde: string; glow: string; texto: string }> = {
  hot: {
    borde: 'rgba(248,113,113,0.55)',
    glow: 'rgba(248,113,113,0.20)',
    texto: '#FCA5A5',
  },
  tibio: {
    borde: 'rgba(245,158,11,0.5)',
    glow: 'rgba(245,158,11,0.16)',
    texto: '#FCD34D',
  },
  frio: {
    borde: 'rgba(34,211,238,0.5)',
    glow: 'rgba(34,211,238,0.16)',
    texto: '#67E8F9',
  },
};

export function AnatomiaLanding() {
  const [activo, setActivo] = useState<Bloque | null>(null);
  const [tocado, setTocado] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sinMovimiento = useReducedMotion();

  // El wrapper mide varias pantallas de alto; el escenario queda sticky
  // dentro y el progreso del scroll maneja la rotación y la separación
  // de las capas. Así el 3D se "arma" mientras bajas, sin robarte el scroll.
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  const suave = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // De página plana (como se ve en un navegador) a vista isométrica explotada.
  const rotateX = useTransform(suave, [0, 0.42], [4, 56]);
  const rotateZ = useTransform(suave, [0, 0.42], [0, -26]);
  const separacion = useTransform(suave, [0.15, 0.75], [0, 74]);
  const escala = useTransform(suave, [0, 0.42, 1], [1, 0.86, 0.86]);

  const cerrar = useCallback(() => setActivo(null), []);

  useEffect(() => {
    if (!activo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activo, cerrar]);

  return (
    <>
      <div ref={wrapRef} className="relative h-[320vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4">
          {/* Riel de temperatura */}
          <div className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="flex flex-col items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FCA5A5]">
                Hot
              </span>
              <div className="h-52 w-[3px] rounded-full bg-gradient-to-b from-[#F87171] via-[#F59E0B] to-[#22D3EE]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#67E8F9]">
                Frío
              </span>
            </div>
          </div>

          {/* Escenario 3D */}
          <div
            className="relative w-full max-w-[300px] sm:max-w-[340px]"
            style={{ perspective: 1500, perspectiveOrigin: '50% 40%' }}
          >
            <motion.div
              style={
                sinMovimiento
                  ? undefined
                  : { rotateX, rotateZ, scale: escala, transformStyle: 'preserve-3d' }
              }
              className="relative"
            >
              {BLOQUES.map((bloque, i) => (
                <Capa
                  key={bloque.id}
                  bloque={bloque}
                  indice={i}
                  separacion={separacion}
                  sinMovimiento={!!sinMovimiento}
                  activo={activo?.id === bloque.id}
                  hayActivo={!!activo}
                  onClick={() => {
                    setActivo(bloque);
                    setTocado(true);
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Pista de interacción, se va apenas tocan algo */}
          <AnimatePresence>
            {!tocado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="pointer-events-none absolute bottom-8 flex flex-col items-center gap-2"
              >
                <motion.span
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex items-center gap-2 rounded-full border border-border bg-bg-card/90 px-4 py-2 text-[12.5px] font-semibold text-text-secondary backdrop-blur"
                >
                  <MousePointerClick size={14} className="text-brand-purpleLight" />
                  Toca cualquier sección
                </motion.span>
                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-muted">
                  <ArrowDown size={11} /> Baja para separarlas
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PanelDetalle bloque={activo} onClose={cerrar} />
    </>
  );
}

function Capa({
  bloque,
  indice,
  separacion,
  sinMovimiento,
  activo,
  hayActivo,
  onClick,
}: {
  bloque: Bloque;
  indice: number;
  separacion: ReturnType<typeof useTransform<number, number>>;
  sinMovimiento: boolean;
  activo: boolean;
  hayActivo: boolean;
  onClick: () => void;
}) {
  const tono = TONO[bloque.temperatura];
  // Cada capa se aleja del plano según su posición: la de más abajo queda
  // más "al fondo", que es lo que da la sensación de despiece.
  const z = useTransform(separacion, (v) => v * indice * 0.5);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        delay: sinMovimiento ? 0 : indice * 0.045,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        height: ALTURA[bloque.tipo],
        // En framer-motion la profundidad es `z`, no `translateZ`: como CSS no
        // tiene una propiedad `translateZ` suelta, el valor se descartaría.
        z: sinMovimiento ? undefined : z,
        borderColor: activo ? tono.texto : tono.borde,
        boxShadow: activo
          ? `0 0 0 1px ${tono.texto}, 0 18px 50px ${tono.glow}`
          : `0 10px 30px ${tono.glow}`,
        opacity: hayActivo && !activo ? 0.35 : 1,
      }}
      className="group relative mb-[6px] flex w-full items-center justify-center rounded-[10px] border bg-gradient-to-br from-white/[0.09] to-white/[0.02] backdrop-blur-sm transition-[opacity,filter] duration-300 hover:brightness-125"
      aria-label={`Ver ${bloque.nombre}`}
    >
      <span
        className="pointer-events-none px-3 text-center font-display text-[10.5px] font-extrabold uppercase leading-tight tracking-wide"
        style={{ color: tono.texto }}
      >
        {bloque.nombre}
      </span>

      <span className="pointer-events-none absolute left-2 top-2 font-mono text-[8.5px] text-white/35">
        {String(indice + 1).padStart(2, '0')}
      </span>
    </motion.button>
  );
}

function PanelDetalle({ bloque, onClose }: { bloque: Bloque | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {bloque && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={bloque.nombre}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl border-t border-border bg-bg-secondary sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[460px] sm:rounded-t-none sm:border-l sm:border-t-0"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border/70 bg-bg-secondary/95 px-6 py-5 backdrop-blur">
              <div>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: TONO[bloque.temperatura].texto }}
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

            <div className="space-y-7 px-6 pb-16 pt-6">
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
                      transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}
                      className="flex gap-3 text-[14.5px] leading-relaxed text-text-secondary"
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: TONO[bloque.temperatura].texto }}
                      />
                      {clave}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Hueco reservado para el snippet de Liquid. Se deja explícito
                  para que se note que falta y no se olvide. */}
              <div>
                <h4 className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-muted">
                  <Code2 size={12} /> Código Liquid
                </h4>
                <div className="mt-4 rounded-xl border border-dashed border-border bg-black/30 p-6 text-center">
                  <p className="text-[13.5px] leading-relaxed text-text-muted">
                    Aquí va el snippet de Shopify de esta sección.
                    <br />
                    <span className="text-text-secondary">Pendiente de pegar.</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
