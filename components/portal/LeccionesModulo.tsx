'use client';

import { useState, useTransition, useMemo } from 'react';
import { Check, ChevronRight, Circle, PenLine, ArrowRight } from 'lucide-react';
import { marcarLeccion } from '@/app/portal/modulos/actions';
import { TheoryRendererV2 } from '@/components/portal/TheoryRendererV2';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { progresoDeLecciones, type Leccion } from '@/lib/lecciones';

/**
 * El módulo por dentro, en lecciones.
 *
 * Antes la teoría era un muro largo del que no se sabía cuánto faltaba. Ahora
 * es una lista de cosas concretas que se marcan una a una, con el porcentaje
 * arriba — que es lo único que de verdad contesta "¿cuánto llevo?".
 *
 * En escritorio la lista vive al lado y no se pierde de vista; en móvil va
 * arriba y al abrir una lección se sube el contenido.
 */
export function LeccionesModulo({
  slug,
  lecciones,
  vistasIniciales,
  accentColor,
}: {
  slug: string;
  lecciones: Leccion[];
  vistasIniciales: string[];
  accentColor: string;
}) {
  const [vistas, setVistas] = useState<string[]>(vistasIniciales);
  const [abierta, setAbierta] = useState(lecciones[0]?.id ?? '');
  const [pending, start] = useTransition();

  const pct = useMemo(() => progresoDeLecciones(lecciones, vistas), [lecciones, vistas]);
  const indice = lecciones.findIndex((l) => l.id === abierta);
  const leccion = lecciones[indice] ?? lecciones[0];
  const siguiente = lecciones[indice + 1] ?? null;

  function alternar(id: string, vista: boolean) {
    // Optimista: marcar una lección tiene que sentirse instantáneo.
    setVistas((v) => (vista ? [...new Set([...v, id])] : v.filter((x) => x !== id)));
    start(async () => {
      const r = await marcarLeccion(slug, id, vista);
      if (r?.lecciones) setVistas(r.lecciones);
    });
  }

  function completarYSeguir() {
    if (leccion && !vistas.includes(leccion.id)) alternar(leccion.id, true);
    if (siguiente) {
      setAbierta(siguiente.id);
      document.getElementById('leccion-actual')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (lecciones.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
              Contenido
            </span>
            <span className="font-mono text-[13px] font-bold" style={{ color: accentColor }}>
              {pct}%
            </span>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, backgroundColor: accentColor }}
            />
          </div>

          <ol className="space-y-0.5">
            {lecciones.map((l, i) => {
              const hecha = vistas.includes(l.id);
              const activa = l.id === leccion?.id;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setAbierta(l.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                      activa ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="w-5 shrink-0 text-center text-[15px] leading-none">
                      {l.emoji ?? (
                        <span className="font-mono text-[11px] text-text-muted">{i + 1}</span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-[13px]',
                        activa ? 'font-semibold text-white' : 'text-text-secondary',
                        hecha && !activa && 'text-text-muted'
                      )}
                    >
                      {l.titulo}
                    </span>
                    {l.porEscribir ? (
                      <PenLine className="h-3.5 w-3.5 shrink-0 text-text-muted/60" />
                    ) : hecha ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-success" />
                    ) : (
                      <Circle className="h-3 w-3 shrink-0 text-text-muted/40" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <div id="leccion-actual" className="min-w-0 scroll-mt-6">
        {leccion && (
          <>
            <div className="mb-5 flex items-start gap-3">
              {leccion.emoji && <span className="text-[26px] leading-none">{leccion.emoji}</span>}
              <div className="min-w-0">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                  Lección {indice + 1} de {lecciones.length}
                </span>
                <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">
                  {leccion.titulo}
                </h2>
              </div>
            </div>

            {leccion.porEscribir ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg-card/60 px-6 py-12 text-center">
                <PenLine className="mx-auto h-6 w-6 text-text-muted" />
                <p className="mt-3 font-display text-[15px] font-bold">Juan está escribiendo esta lección</p>
                <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-text-muted">
                  Sigue con la siguiente — esta no te bloquea, y no cuenta para el porcentaje del
                  módulo hasta que tenga contenido.
                </p>
              </div>
            ) : (
              <TheoryRendererV2 blocks={leccion.bloques} accentColor={accentColor} />
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              {!leccion.porEscribir && (
                <Button
                  type="button"
                  variant={vistas.includes(leccion.id) ? 'subtle' : 'primary'}
                  onClick={() => alternar(leccion.id, !vistas.includes(leccion.id))}
                  disabled={pending}
                >
                  {vistas.includes(leccion.id) ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-brand-success" /> Lección completada
                    </>
                  ) : (
                    'Marcar como vista'
                  )}
                </Button>
              )}
              {siguiente && (
                <button
                  type="button"
                  onClick={completarYSeguir}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text-secondary transition-colors hover:text-white"
                >
                  Siguiente: {siguiente.emoji ?? ''} {siguiente.titulo}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              {!siguiente && pct === 100 && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-success">
                  <Check className="h-4 w-4" /> Terminaste la teoría. Pasa a Práctica.
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
