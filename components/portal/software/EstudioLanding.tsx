'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, Loader2, Sparkles, Square } from 'lucide-react';
import { TAREAS } from '@/lib/software-landings';
import { cn } from '@/lib/utils';

/**
 * El estudio: le das el producto y te devuelve el copy.
 *
 * Responde en streaming porque una landing completa tarda, y ver el texto
 * aparecer es la diferencia entre esperar y creer que se colgó.
 */
export function EstudioLanding() {
  const [tarea, setTarea] = useState(TAREAS[0].id);
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [generando, setGenerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const abortar = useRef<AbortController | null>(null);

  const actual = TAREAS.find((t) => t.id === tarea) ?? TAREAS[0];

  async function generar() {
    if (!entrada.trim() || generando) return;

    const controlador = new AbortController();
    abortar.current = controlador;
    setGenerando(true);
    setSalida('');

    try {
      const r = await fetch('/api/software/estudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarea, entrada }),
        signal: controlador.signal,
      });

      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: 'No se pudo generar.' }));
        toast.error(error ?? 'No se pudo generar.');
        return;
      }
      if (!r.body) {
        toast.error('No llegó respuesta.');
        return;
      }

      const lector = r.body.getReader();
      const decodificador = new TextDecoder();
      while (true) {
        const { done, value } = await lector.read();
        if (done) break;
        setSalida((s) => s + decodificador.decode(value, { stream: true }));
      }
    } catch (e) {
      // Cancelar es una acción del estudiante, no un error que reportarle.
      if (!(e instanceof Error && e.name === 'AbortError')) {
        toast.error('Se cortó la conexión. Intenta otra vez.');
      }
    } finally {
      setGenerando(false);
      abortar.current = null;
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-pink/25 bg-bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-[16px] font-extrabold tracking-tight">
          <Sparkles className="h-4 w-4 text-brand-pink" /> El estudio
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
          Escribe con la estructura de arriba metida adentro. Lo que salga es un primer
          borrador bueno, no el final: las frases de tus reseñas tienes que meterlas tú.
        </p>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {TAREAS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTarea(t.id)}
                className={cn(
                  'rounded-xl border px-3.5 py-3 text-left transition-colors',
                  tarea === t.id
                    ? 'border-brand-pink/50 bg-brand-pink/10'
                    : 'border-border bg-bg-secondary hover:border-white/20'
                )}
              >
                <span
                  className={cn(
                    'block text-[13px] font-bold',
                    tarea === t.id ? 'text-white' : 'text-text-secondary'
                  )}
                >
                  {t.nombre}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">
                  {t.descripcion}
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            rows={8}
            placeholder={actual.marcador}
            className="w-full resize-y rounded-xl border border-border bg-bg-secondary px-3.5 py-3 text-[14px] leading-relaxed text-white outline-none transition-colors placeholder:text-text-muted focus:border-brand-pink/60"
          />

          {generando ? (
            <button
              type="button"
              onClick={() => abortar.current?.abort()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-[14px] font-bold text-text-secondary transition-colors hover:text-white"
            >
              <Square className="h-3.5 w-3.5" /> Detener
            </button>
          ) : (
            <button
              type="button"
              onClick={generar}
              disabled={!entrada.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-pink py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> Generar {actual.nombre.toLowerCase()}
            </button>
          )}
        </div>

        <div className="relative min-h-[320px] rounded-xl border border-border bg-bg-secondary">
          {salida && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(salida).then(
                  () => {
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  },
                  () => toast.error('No se pudo copiar.')
                );
              }}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-white"
            >
              {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          )}

          {salida ? (
            <pre className="max-h-[560px] overflow-y-auto whitespace-pre-wrap px-4 py-4 pr-20 font-body text-[13.5px] leading-relaxed text-text-secondary">
              {salida}
              {generando && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand-pink align-middle" />}
            </pre>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
              {generando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-brand-pink" />
                  <p className="mt-3 text-[13px] text-text-muted">Escribiendo…</p>
                </>
              ) : (
                <p className="max-w-[260px] text-[13px] leading-relaxed text-text-muted">
                  Entre más concreto seas con el producto y con lo que dicen las reseñas,
                  menos vas a tener que reescribir después.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
