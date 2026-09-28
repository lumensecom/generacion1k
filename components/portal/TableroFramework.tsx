'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ArrowRight, Sparkles, AlertTriangle, Check, Maximize2 } from 'lucide-react';
import { BloqueCodigo } from '@/components/recursos/BloqueCodigo';
import { FASES, type Framework, type NodoFramework } from '@/lib/frameworks-data';

/**
 * Un framework dibujado como tablero.
 *
 * El flujo se ve entero de un vistazo y cada caja se abre para ver el detalle
 * —el prompt, los pasos, el aviso—. Es a propósito: un framework no se lee de
 * principio a fin como un módulo, se entra a buscar el nodo que toca hoy.
 *
 * El tablero va en scroll horizontal con columnas, no en una rejilla que se
 * reordena: la dirección izquierda→derecha ES la información, y si las cajas
 * se recolocan en móvil se pierde el orden del proceso. Debajo hay una lista
 * vertical con el mismo contenido para quien prefiera leerlo en fila.
 */
export function TableroFramework({ framework }: { framework: Framework }) {
  const [abierto, setAbierto] = useState<NodoFramework | null>(null);

  const columnas = useMemo(() => {
    const mapa = new Map<number, NodoFramework[]>();
    for (const n of framework.nodos) {
      const lista = mapa.get(n.columna);
      if (lista) lista.push(n);
      else mapa.set(n.columna, [n]);
    }
    return [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([, nodos]) => nodos);
  }, [framework.nodos]);

  const cerrar = useCallback(() => setAbierto(null), []);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    window.addEventListener('keydown', onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [abierto, cerrar]);

  return (
    <div>
      {/* Leyenda de fases */}
      <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2">
        {Object.entries(FASES).map(([id, f]) => (
          <span key={id} className="flex items-center gap-2 text-[12.5px] text-text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
            {f.nombre}
          </span>
        ))}
      </div>

      {/* Tablero */}
      <div className="relative -mx-5 overflow-x-auto px-5 pb-4">
        <div className="flex min-w-max items-stretch gap-3">
          {columnas.map((nodos, ci) => (
            <div key={ci} className="flex items-center gap-3">
              <div className="flex w-[244px] flex-col gap-3">
                {nodos.map((n) => (
                  <NodoCaja key={n.id} nodo={n} onClick={() => setAbierto(n)} />
                ))}
              </div>
              {ci < columnas.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted/50" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-[12px] text-text-muted sm:hidden">
        Desliza el tablero para verlo entero →
      </p>

      {/* El mismo proceso en fila, para leerlo de corrido o en móvil. */}
      <details className="group mt-8">
        <summary className="cursor-pointer list-none rounded-xl border border-border bg-bg-card px-5 py-3.5 text-[13.5px] font-bold text-text-secondary transition-colors hover:text-white">
          Ver los {framework.nodos.length} pasos en lista
          <span className="ml-2 font-normal text-text-muted group-open:hidden">▾</span>
          <span className="ml-2 hidden font-normal text-text-muted group-open:inline">▴</span>
        </summary>
        <ol className="mt-4 space-y-3">
          {framework.nodos.map((n, i) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => setAbierto(n)}
                className="flex w-full items-start gap-4 rounded-xl border border-border bg-bg-card p-4 text-left transition-colors hover:border-brand-purple/40"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold text-black"
                  style={{ backgroundColor: FASES[n.fase].color }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[14.5px] font-extrabold text-white">
                    {n.titulo}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-text-muted">
                    {n.resumen}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </details>

      {/* Detalle */}
      {abierto && <PanelNodo nodo={abierto} onClose={cerrar} />}
    </div>
  );
}

function NodoCaja({ nodo, onClick }: { nodo: NodoFramework; onClick: () => void }) {
  const color = FASES[nodo.fase].color;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full rounded-2xl border bg-bg-card p-4 text-left transition-all hover:-translate-y-0.5"
      style={{ borderColor: `${color}44` }}
    >
      <span
        className="absolute left-0 top-4 h-8 w-[3px] rounded-r"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-[9.5px] uppercase tracking-wider"
          style={{ color }}
        >
          {FASES[nodo.fase].nombre}
        </span>
        <Maximize2 className="h-3 w-3 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-2 font-display text-[14px] font-extrabold leading-snug text-white">
        {nodo.titulo}
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-text-muted">{nodo.resumen}</p>
      {nodo.prompt && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-purple/15 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-brand-purpleLight">
          <Sparkles className="h-2.5 w-2.5" /> prompt
        </span>
      )}
    </button>
  );
}

function PanelNodo({ nodo, onClose }: { nodo: NodoFramework; onClose: () => void }) {
  const color = FASES[nodo.fase].color;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={nodo.titulo}
        className="relative flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-2xl border border-border bg-bg-secondary shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color }}>
              {FASES[nodo.fase].nombre}
            </span>
            <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight tracking-tight">
              {nodo.titulo}
            </h3>
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-text-muted">
              <Check className="h-3.5 w-3.5 shrink-0 text-brand-success" /> Entrega: {nodo.entrega}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6">
          <p className="text-[14.5px] leading-relaxed text-text-secondary">{nodo.cuerpo}</p>

          {nodo.pasos && (
            <ol className="space-y-2.5">
              {nodo.pasos.map((p, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.07] font-mono text-[11px] text-text-muted">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          )}

          {nodo.aviso && (
            <div className="rounded-xl border border-brand-yellow/25 bg-brand-yellow/[0.06] p-4">
              <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-text-secondary">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                {nodo.aviso}
              </p>
            </div>
          )}

          {nodo.nuestro && (
            <div className="rounded-xl border border-brand-purple/30 bg-brand-purple/[0.07] p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-brand-purpleLight">
                Lo que añadimos nosotros
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{nodo.nuestro}</p>
            </div>
          )}

          {nodo.prompt && (
            <div>
              <p className="mb-2.5 flex items-center gap-1.5 font-display text-[14px] font-extrabold">
                <Sparkles className="h-4 w-4 text-brand-purpleLight" /> El prompt, listo para copiar
              </p>
              <BloqueCodigo codigo={nodo.prompt} lenguaje="texto" alto="max-h-[360px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
