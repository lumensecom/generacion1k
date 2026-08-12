'use client';

import { useState, useTransition } from 'react';
import { CalendarDays, Users, Video, ExternalLink, Check, Download } from 'lucide-react';
import { votarEncuesta } from '@/app/portal/ayuda/actions';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { urlGoogleCalendar, urlDescargaICS } from '@/lib/calendario';
import { cn } from '@/lib/utils';
import type { GroupSession, SessionPoll } from '@/lib/types';

function fechaLarga(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Una clase está "en vivo" desde 15 min antes hasta que termina. */
function estadoClase(c: GroupSession): 'proxima' | 'envivo' | 'pasada' {
  if (!c.scheduled_at) return 'proxima';
  const inicio = new Date(c.scheduled_at).getTime();
  const fin = inicio + c.duration_minutes * 60_000;
  const ahora = Date.now();
  if (ahora >= inicio - 15 * 60_000 && ahora <= fin) return 'envivo';
  return ahora > fin ? 'pasada' : 'proxima';
}

export function ClasesCliente({
  clases,
  encuesta,
  conteos,
  miVoto,
}: {
  clases: GroupSession[];
  encuesta: SessionPoll | null;
  conteos: Record<string, number>;
  miVoto: string | null;
}) {
  const proximas = clases.filter((c) => estadoClase(c) !== 'pasada');
  const pasadas = clases.filter((c) => estadoClase(c) === 'pasada');

  return (
    <div className="space-y-10">
      {encuesta && <EncuestaDia encuesta={encuesta} conteos={conteos} miVoto={miVoto} />}

      <section>
        <h2 className="mb-5 font-display text-xl font-extrabold tracking-tight">Próximas clases</h2>
        {proximas.length === 0 ? (
          <p className="rounded-2xl border border-border bg-bg-card px-6 py-10 text-center text-[14px] text-text-muted">
            No hay ninguna clase programada todavía. Cuando Juan la agende, aparece aquí.
          </p>
        ) : (
          <div className="space-y-4">
            {proximas.map((c) => (
              <TarjetaClase key={c.id} clase={c} />
            ))}
          </div>
        )}
      </section>

      {pasadas.length > 0 && (
        <section>
          <h2 className="mb-5 font-display text-xl font-extrabold tracking-tight">Clases grabadas</h2>
          <div className="space-y-6">
            {pasadas.map((c) => (
              <article key={c.id} className="overflow-hidden rounded-2xl border border-border bg-bg-card">
                <div className="p-5">
                  <h3 className="font-display text-[16px] font-extrabold tracking-tight">{c.title}</h3>
                  {c.scheduled_at && (
                    <p className="mt-1 font-mono text-[11.5px] capitalize text-text-muted">
                      {fechaLarga(c.scheduled_at)}
                    </p>
                  )}
                  {c.description && (
                    <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <VideoPlayer
                    url={c.recording_url}
                    titulo={c.title}
                    vacio="La grabación todavía no está subida."
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TarjetaClase({ clase }: { clase: GroupSession }) {
  const estado = estadoClase(clase);
  const envivo = estado === 'envivo';

  const evento = {
    titulo: `${clase.title} — Clase grupal Generación 1K`,
    descripcion: clase.description,
    inicio: clase.scheduled_at,
    duracionMinutos: clase.duration_minutes,
    url: clase.meet_url,
  };
  const google = urlGoogleCalendar(evento);
  const ics = urlDescargaICS(evento, clase.id);

  return (
    <article
      className={cn(
        'rounded-2xl border p-6',
        envivo
          ? 'border-brand-success/40 bg-brand-success/[0.07]'
          : 'border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.07] to-transparent'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {envivo && (
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-success/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> En vivo ahora
            </span>
          )}
          <h3 className="font-display text-lg font-extrabold tracking-tight">{clase.title}</h3>
          {clase.scheduled_at && (
            <p className="mt-1.5 flex items-center gap-2 text-[13.5px] capitalize text-text-secondary">
              <CalendarDays className="h-4 w-4 shrink-0" /> {fechaLarga(clase.scheduled_at)}
            </p>
          )}
          <p className="mt-1 flex items-center gap-2 text-[12.5px] text-text-muted">
            <Users className="h-3.5 w-3.5" /> {clase.duration_minutes} minutos · máximo 5 personas
          </p>
        </div>

        {clase.meet_url && (
          <a
            href={clase.meet_url}
            target="_blank"
            rel="noopener"
            className={cn(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-5 font-bold transition-colors',
              envivo
                ? 'bg-brand-success text-black hover:bg-brand-success/85'
                : 'bg-brand-purple text-white hover:bg-brand-purpleLight'
            )}
          >
            <Video className="h-4 w-4" /> Entrar a la clase <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {clase.description && (
        <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
          {clase.description}
        </p>
      )}

      {(google || ics) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {google && (
            <a
              href={google}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5" /> Google Calendar
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {ics && (
            <a
              href={ics}
              download="clase-grupal-generacion1k.ics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" /> Apple / Outlook
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function EncuestaDia({
  encuesta,
  conteos,
  miVoto,
}: {
  encuesta: SessionPoll;
  conteos: Record<string, number>;
  miVoto: string | null;
}) {
  const [votado, setVotado] = useState(miVoto);
  const [pending, start] = useTransition();
  const total = Object.values(conteos).reduce((a, b) => a + b, 0);

  function elegir(id: string) {
    // Optimista: el conteo real llega con el revalidate, pero el check
    // inmediato evita que el estudiante piense que no registró el voto.
    setVotado(id);
    start(async () => {
      const r = await votarEncuesta(id);
      if (r?.error) setVotado(miVoto);
    });
  }

  return (
    <section className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/[0.06] p-6">
      <h2 className="font-display text-lg font-extrabold tracking-tight">{encuesta.question}</h2>
      <p className="mt-1.5 text-[13px] text-text-muted">
        Elegimos el día con más votos. Puedes cambiar tu respuesta cuando quieras.
      </p>

      <div className="mt-5 space-y-2.5">
        {encuesta.options.map((o) => {
          const votos = conteos[o.id] ?? 0;
          const pct = total > 0 ? Math.round((votos / total) * 100) : 0;
          const mio = votado === o.id;
          return (
            <button
              key={o.id}
              onClick={() => elegir(o.id)}
              disabled={pending}
              className={cn(
                'relative w-full overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-colors',
                mio ? 'border-brand-yellow bg-brand-yellow/10' : 'border-border bg-bg-card hover:border-brand-yellow/50'
              )}
            >
              {/* Barra de resultado detrás del texto */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-brand-yellow/10 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-[14px] font-semibold text-white">
                  {mio && <Check className="h-4 w-4 shrink-0 text-brand-yellow" />}
                  {o.label}
                </span>
                <span className="shrink-0 font-mono text-[11.5px] text-text-muted">
                  {votos} {votos === 1 ? 'voto' : 'votos'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
