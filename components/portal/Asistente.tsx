'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, ArrowUp, Square, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Turno {
  role: 'user' | 'assistant';
  content: string;
}

// La primera es a propósito la de alguien que acaba de entrar y no sabe
// dónde está parado: es la duda más común del día uno.
const SUGERENCIAS = [
  'Acabo de entrar, ¿por dónde empiezo?',
  '¿Cómo sé si un producto es ganador?',
  '¿Por qué me aparece un módulo bloqueado?',
  '¿Qué hago si mi campaña no vende?',
];

export function Asistente({ nombre }: { nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const sinMovimiento = useReducedMotion();
  const abortRef = useRef<AbortController | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // El slug sale de la ruta en vez de pasarse por props: así el asistente se
  // monta una sola vez en el shell y aun así sabe qué módulo estás leyendo.
  const slug = pathname?.startsWith('/portal/modulos/') ? pathname.split('/')[3] || null : null;

  const cerrar = useCallback(() => {
    abortRef.current?.abort();
    setAbierto(false);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, cerrar]);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turnos]);

  // Al desmontar (navegación, logout) se corta cualquier stream en curso.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function preguntar(texto: string) {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;

    setError(null);
    setEntrada('');

    // El historial que viaja es el previo a este turno; la pregunta nueva va
    // aparte porque el servidor la usa además para buscar el material.
    const historial = turnos.slice(-8);
    setTurnos((prev) => [...prev, { role: 'user', content: pregunta }, { role: 'assistant', content: '' }]);
    setCargando(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta, historial, slug }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detalle = await res.json().catch(() => null);
        throw new Error(detalle?.error ?? 'El asistente no respondió. Intenta de nuevo.');
      }

      const lector = res.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = '';

      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        // Se reescribe solo el último turno, que es el del asistente.
        setTurnos((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: acumulado };
          return next;
        });
      }

      if (!acumulado.trim()) {
        throw new Error('El asistente se quedó callado. Vuelve a preguntar.');
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // Cancelado por el estudiante: se deja lo que alcanzó a escribir.
        setTurnos((prev) => (prev[prev.length - 1]?.content ? prev : prev.slice(0, -2)));
      } else {
        setError(e instanceof Error ? e.message : 'Algo falló.');
        setTurnos((prev) => prev.slice(0, -2));
        setEntrada(pregunta); // no se pierde lo que había escrito
      }
    } finally {
      setCargando(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void preguntar(entrada);
  }

  return (
    <>
      {/* Botón flotante. Lleva texto y no solo un ícono: un estudiante que
          entra por primera vez no tiene por qué adivinar que la chispa de la
          esquina es quien le va a resolver las dudas. En móvil el texto se
          esconde al abrir el panel para no competir con él. */}
      <motion.button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 22 }}
        whileHover={sinMovimiento ? undefined : { scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir el asistente de estudio'}
        className={cn(
          'fixed bottom-5 right-5 z-50 items-center gap-2.5 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink py-3.5 pl-5 pr-6 font-display text-[14px] font-extrabold text-white shadow-[0_12px_40px_-8px_rgba(124,58,237,0.75)] sm:bottom-7 sm:right-7',
          // Abierto en móvil el panel ocupa la pantalla y el botón taparía el
          // campo de escribir; ahí se cierra con la X de la cabecera.
          abierto ? 'hidden pl-4 pr-4 sm:flex' : 'flex'
        )}
      >
        {abierto ? (
          <X size={20} />
        ) : (
          <>
            <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <Sparkles size={19} />
              {!sinMovimiento && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-white/40"
                  animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </span>
            ¿Tienes una duda?
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {abierto && (
          <>
            {/* En móvil el panel ocupa la pantalla, así que hace falta un velo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cerrar}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
            />

            <motion.section
              role="dialog"
              aria-label="Asistente de estudio"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-40 flex h-[85vh] flex-col overflow-hidden rounded-t-2xl border border-border bg-bg-secondary shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-7 sm:h-[min(620px,75vh)] sm:w-[420px] sm:rounded-2xl"
            >
              <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 font-display text-[15px] font-extrabold tracking-tight">
                    <Sparkles size={15} className="shrink-0 text-brand-purpleLight" />
                    Asistente de estudio
                  </h2>
                  <p className="mt-0.5 truncate text-[11.5px] text-text-muted">
                    Responde con el material del programa
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {turnos.length > 0 && (
                    <button
                      onClick={() => {
                        abortRef.current?.abort();
                        setTurnos([]);
                        setError(null);
                      }}
                      aria-label="Empezar de nuevo"
                      className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                  <button
                    onClick={cerrar}
                    aria-label="Cerrar"
                    className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {turnos.length === 0 && (
                  <div>
                    <p className="text-[14.5px] leading-relaxed text-text-secondary">
                      Hola {nombre.split(' ')[0]}. Pregúntame lo que sea del programa — cómo
                      funciona el portal, qué hacer ahora o cualquier duda de los 10 módulos.
                      Te respondo con lo que enseña Juan.
                    </p>
                    <div className="mt-5 space-y-2">
                      {SUGERENCIAS.map((s) => (
                        <button
                          key={s}
                          onClick={() => void preguntar(s)}
                          className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-left text-[13.5px] text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-5 text-[12px] leading-relaxed text-text-muted">
                      Para lo de tu caso concreto — tu producto, tus métricas, tu tienda — habla
                      con Juan en la 1:1.
                    </p>
                  </div>
                )}

                {turnos.map((t, i) => (
                  <div key={i} className={cn('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
                        t.role === 'user'
                          ? 'bg-brand-purple text-white'
                          : 'border border-border bg-bg-card text-text-secondary'
                      )}
                    >
                      {t.content ? <TextoDelAsistente texto={t.content} /> : <Escribiendo />}
                    </div>
                  </div>
                ))}

                {error && (
                  <p className="rounded-xl border border-brand-danger/30 bg-brand-danger/[0.08] px-4 py-3 text-[13px] text-brand-danger">
                    {error}
                  </p>
                )}

                <div ref={finRef} />
              </div>

              <form onSubmit={onSubmit} className="border-t border-border p-3">
                <div className="flex items-end gap-2 rounded-xl border border-border bg-bg-card p-2 focus-within:border-brand-purple/60">
                  <textarea
                    ref={inputRef}
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter envía, Shift+Enter hace salto de línea.
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void preguntar(entrada);
                      }
                    }}
                    rows={1}
                    maxLength={1000}
                    placeholder="Escribe tu pregunta…"
                    className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-white outline-none placeholder:text-text-muted"
                  />
                  {cargando ? (
                    <button
                      type="button"
                      onClick={() => abortRef.current?.abort()}
                      aria-label="Detener"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/15"
                    >
                      <Square size={13} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!entrada.trim()}
                      aria-label="Enviar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-purple text-white transition-colors hover:bg-brand-purpleLight disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowUp size={17} />
                    </button>
                  )}
                </div>
              </form>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// El modelo marca en negrita los nombres de los botones ("ve a **Módulos**"),
// que es justo donde ayuda. Como el mensaje se pinta con whitespace-pre-wrap,
// sin esto se verían los asteriscos literales.
//
// Se resuelven **negrita** y *cursiva* y nada más. Una librería de markdown
// aquí pesaría más que el componente entero y además renderizaría enlaces e
// imágenes, que es justo lo que no queremos venir de un modelo.
//
// Los encabezados y los enlaces se limpian antes de pintar. El prompt los
// prohíbe, pero el asistente corre sobre el router de modelos gratis de
// OpenRouter, que reparte entre modelos distintos en cada llamada y algunos
// obedecen el formato peor que otros. En una prueba real uno se inventó un
// "[Módulo 8](https://ejemplo.com/modulo8)": la URL no existía. Del enlace se
// conserva el texto y se tira el destino — nunca se convierte en <a>.
function limpiarMarkdown(texto: string): string {
  return texto
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}[ \t]+/gm, '');
}

function TextoDelAsistente({ texto }: { texto: string }) {
  const partes = limpiarMarkdown(texto).split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
          return (
            <strong key={i} className="font-semibold text-white">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
          return <em key={i}>{p.slice(1, -1)}</em>;
        }
        return p;
      })}
    </>
  );
}

function Escribiendo() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Escribiendo">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-text-muted"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}
