'use client';

import { useState } from 'react';
import { Compass, PlayCircle, BookOpen, PenLine, Clock, Quote, ArrowRight } from 'lucide-react';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { cn } from '@/lib/utils';
import { PRINCIPIOS, LIBROS, ACTIVIDADES } from '@/lib/mentalidad-data';

/**
 * El módulo de mentalidad, con su propia cara.
 *
 * No usa las cuatro pestañas del resto (Teoría / Video / Práctica / Test)
 * porque no se consume igual: los demás módulos se leen una vez y se
 * ejecutan; a este se vuelve el día que algo sale mal. Por eso son cuatro
 * entradas visitables en cualquier orden, y ninguna bloquea a otra.
 *
 * El oro y la serif solo viven aquí. Es el único sitio del portal donde el
 * contenido no es una instrucción, y el cambio de tipografía avisa de eso
 * antes de leer una palabra.
 */

const PESTANAS = [
  { id: 'principios', label: 'Principios', icon: Compass },
  { id: 'videos', label: 'Videos', icon: PlayCircle },
  { id: 'libros', label: 'Libros', icon: BookOpen },
  { id: 'actividades', label: 'Actividades', icon: PenLine },
] as const;

type Pestana = (typeof PESTANAS)[number]['id'];

export function MentalidadGanadora({ videos }: { videos: string[] }) {
  const [tab, setTab] = useState<Pestana>('principios');

  return (
    <div>
      {/* Portada */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-yellow/20 bg-[radial-gradient(120%_90%_at_20%_0%,rgba(245,197,24,0.10),transparent_60%),radial-gradient(90%_80%_at_90%_100%,rgba(124,58,237,0.16),transparent_62%)] px-7 py-12 sm:px-12 sm:py-16">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-yellow">
          Formación de mentalidad
        </span>
        <h2 className="mt-4 max-w-2xl font-serif text-3xl italic leading-[1.15] text-white sm:text-[44px]">
          El negocio se construye con lo que haces la semana en que no pasa nada.
        </h2>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-text-secondary">
          Esta parte no se aprueba con un test ni se termina. Vuelve aquí cuando algo salga mal —
          que va a salir — y lee el principio que te toque ese día.
        </p>
      </div>

      {/* Pestañas */}
      <div className="mt-8 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-bg-card p-1.5">
        {PESTANAS.map((p) => {
          const activa = tab === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setTab(p.id)}
              aria-pressed={activa}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13.5px] font-bold transition-colors',
                activa ? 'bg-brand-yellow text-black' : 'text-text-secondary hover:text-white'
              )}
            >
              <p.icon className="h-4 w-4" /> {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === 'principios' && (
          <div className="space-y-5">
            {PRINCIPIOS.map((p) => (
              <article
                key={p.n}
                className="rounded-2xl border border-border bg-bg-card p-6 transition-colors hover:border-brand-yellow/30 sm:p-8"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-[34px] italic leading-none text-brand-yellow/50">
                    {String(p.n).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl font-extrabold leading-tight tracking-tight">
                    {p.titulo}
                  </h3>
                </div>

                <p className="mt-5 flex gap-3 font-serif text-[19px] italic leading-snug text-white">
                  <Quote className="mt-1 h-4 w-4 shrink-0 text-brand-yellow/60" />
                  {p.frase}
                </p>

                <p className="mt-5 text-[14.5px] leading-relaxed text-text-secondary">{p.cuerpo}</p>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-brand-yellow">
                    En la práctica
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white">{p.enLaPractica}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'videos' && (
          <div>
            {videos.length > 0 ? (
              <div className="space-y-8">
                {videos.map((v) => (
                  <VideoPlayer key={v} url={v} titulo="Mentalidad" />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-bg-card/50 px-6 py-16 text-center">
                <PlayCircle className="mx-auto h-7 w-7 text-text-muted" />
                <p className="mt-4 font-display text-[16px] font-extrabold">
                  Juan está eligiendo los videos
                </p>
                <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-text-muted">
                  Mientras tanto, los principios y las actividades son lo que de verdad mueve esto.
                  El video se ve una vez; la revisión de domingo se hace todas las semanas.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'libros' && (
          <div className="space-y-4">
            <p className="text-[14.5px] leading-relaxed text-text-secondary">
              Seis, no sesenta. Y en este orden: si solo vas a leer uno, que sea el primero.
            </p>
            {LIBROS.map((l, i) => (
              <article
                key={l.titulo}
                className={cn(
                  'rounded-2xl border p-6',
                  i === 0 ? 'border-brand-yellow/30 bg-brand-yellow/[0.05]' : 'border-border bg-bg-card'
                )}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-serif text-xl italic text-white">{l.titulo}</h3>
                  <span className="text-[13px] text-text-muted">{l.autor}</span>
                  {i === 0 && (
                    <span className="rounded-full bg-brand-yellow px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-black">
                      empieza aquí
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">{l.porQue}</p>
                <p className="mt-3 flex items-center gap-2 text-[13px] text-brand-yellow">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" /> {l.paraCuando}
                </p>
              </article>
            ))}
          </div>
        )}

        {tab === 'actividades' && (
          <div className="space-y-5">
            {ACTIVIDADES.map((a) => (
              <article key={a.n} className="rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow font-mono text-[14px] font-extrabold text-black">
                    {a.n}
                  </span>
                  <h3 className="font-display text-lg font-extrabold tracking-tight">{a.titulo}</h3>
                  <span className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-muted">
                    <Clock className="h-3 w-3" /> {a.duracion}
                  </span>
                </div>

                <p className="mt-4 text-[13px] text-brand-yellow">Cuándo: {a.cuando}</p>

                <ol className="mt-5 space-y-2.5">
                  {a.pasos.map((paso, j) => (
                    <li key={j} className="flex gap-3 text-[14px] leading-relaxed text-text-secondary">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.07] font-mono text-[11px] text-text-muted">
                        {j + 1}
                      </span>
                      {paso}
                    </li>
                  ))}
                </ol>

                <div className="mt-6 rounded-xl border border-border bg-bg-secondary/60 p-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                    Por qué funciona
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
                    {a.porQueFunciona}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
