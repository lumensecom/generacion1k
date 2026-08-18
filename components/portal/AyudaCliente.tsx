'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, CalendarPlus, Send, CheckCircle2, Clock, Video } from 'lucide-react';
import { enviarPregunta, solicitarReunion } from '@/app/portal/ayuda/actions';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cupoRestante } from '@/lib/reuniones';
import type { StudentQuestion, MeetingRequest } from '@/lib/types';

const ESTADO_PREGUNTA: Record<string, { texto: string; clase: string }> = {
  nueva: { texto: 'Esperando respuesta', clase: 'bg-brand-yellow/15 text-brand-yellow' },
  respondida: { texto: 'Respondida', clase: 'bg-brand-success/15 text-brand-success' },
  en_video: { texto: 'Respondida en video', clase: 'bg-brand-purple/20 text-brand-purpleLight' },
  cerrada: { texto: 'Cerrada', clase: 'bg-white/5 text-text-muted' },
};

const ESTADO_REUNION: Record<string, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente de agendar', clase: 'bg-brand-yellow/15 text-brand-yellow' },
  agendada: { texto: 'Agendada', clase: 'bg-brand-success/15 text-brand-success' },
  hecha: { texto: 'Hecha', clase: 'bg-white/5 text-text-muted' },
  cancelada: { texto: 'Cancelada', clase: 'bg-brand-danger/15 text-brand-danger' },
};

function fecha(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AyudaCliente({
  preguntas,
  reuniones,
}: {
  preguntas: StudentQuestion[];
  reuniones: MeetingRequest[];
}) {
  const [tab, setTab] = useState<'preguntas' | 'reunion'>('preguntas');

  return (
    <>
      <div className="mb-8 flex gap-2 rounded-xl border border-border bg-bg-card p-1.5">
        {(
          [
            ['preguntas', 'Mis preguntas', MessageCircleQuestion],
            ['reunion', 'Reunión 1:1', CalendarPlus],
          ] as const
        ).map(([valor, etiqueta, Icono]) => (
          <button
            key={valor}
            onClick={() => setTab(valor)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13.5px] font-bold transition-colors',
              tab === valor ? 'bg-brand-purple text-white' : 'text-text-secondary hover:text-white'
            )}
          >
            <Icono className="h-4 w-4" /> {etiqueta}
          </button>
        ))}
      </div>

      {tab === 'preguntas' ? (
        <Preguntas preguntas={preguntas} />
      ) : (
        <Reuniones reuniones={reuniones} />
      )}
    </>
  );
}

function Preguntas({ preguntas }: { preguntas: StudentQuestion[] }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [pending, start] = useTransition();

  function enviar() {
    setError(null);
    const fd = new FormData();
    fd.set('question', texto);
    start(async () => {
      const r = await enviarPregunta(fd);
      if (r?.error) return setError(r.error);
      setTexto('');
      setEnviado(true);
      setTimeout(() => setEnviado(false), 4000);
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Pregúntale a Juan</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">
          Para dudas rápidas usa el asistente. Esto es para lo que necesita que Juan lo mire con
          calma — te responde por escrito, y si la pregunta es grande, te graba un video.
        </p>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Cuéntame qué estás intentando hacer, qué probaste y dónde te trabaste…"
          className="mt-5 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-text-muted">{texto.length}/2000</span>
          <Button onClick={enviar} disabled={pending || texto.trim().length < 10}>
            <Send className="mr-2 h-4 w-4" /> {pending ? 'Enviando…' : 'Enviar pregunta'}
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger"
            >
              {error}
            </motion.p>
          )}
          {enviado && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 px-4 py-2.5 text-[13px] text-brand-success"
            >
              <CheckCircle2 className="h-4 w-4" /> Enviada. Juan te responde por aquí mismo.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {preguntas.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-text-muted">
          Todavía no has hecho ninguna pregunta.
        </p>
      ) : (
        <div className="space-y-5">
          {preguntas.map((p) => {
            const estado = ESTADO_PREGUNTA[p.status] ?? ESTADO_PREGUNTA.nueva;
            return (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-bg-card">
                <div className="border-b border-border/70 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className={cn('rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider', estado.clase)}>
                      {estado.texto}
                    </span>
                    <span className="font-mono text-[11px] text-text-muted">{fecha(p.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-white">{p.question}</p>
                </div>

                {p.admin_reply || p.reply_video_url ? (
                  <div className="bg-brand-purple/[0.06] p-5">
                    <p className="mb-3 font-mono text-[10.5px] uppercase tracking-wider text-brand-purpleLight">
                      Respuesta de Juan
                    </p>
                    {p.admin_reply && (
                      <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-text-secondary">
                        {p.admin_reply}
                      </p>
                    )}
                    {p.reply_video_url && (
                      <div className="mt-4">
                        <VideoPlayer url={p.reply_video_url} titulo="Respuesta en video" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="flex items-center gap-2 p-5 text-[13px] text-text-muted">
                    <Clock className="h-4 w-4" /> Juan todavía no la ha respondido.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Reuniones({ reuniones }: { reuniones: MeetingRequest[] }) {
  // El cupo se calcula aquí y también en el servidor. Este es para que se vea
  // antes de escribir; el que manda es el del servidor.
  const restante = cupoRestante(reuniones);
  const sinCupo = restante <= 0;

  const [pregunta, setPregunta] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [pending, start] = useTransition();

  function enviar() {
    setError(null);
    const fd = new FormData();
    fd.set('question', pregunta);
    fd.set('availability', disponibilidad);
    start(async () => {
      const r = await solicitarReunion(fd);
      if (r?.error) return setError(r.error);
      setPregunta('');
      setDisponibilidad('');
      setEnviado(true);
      setTimeout(() => setEnviado(false), 4000);
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-purple/30 bg-gradient-to-b from-brand-purple/[0.09] to-transparent p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold tracking-tight">Solicitar reunión 1:1</h2>
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-bold',
              sinCupo ? 'bg-white/[0.07] text-text-muted' : 'bg-brand-yellow/15 text-brand-yellow'
            )}
          >
            {sinCupo ? 'Ya la usaste esta semana' : 'Te queda 1 esta semana'}
          </span>
        </div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">
          Tienes <strong className="font-semibold text-white">una sesión 1:1 de una hora por
          semana</strong>, además de las tres clases grupales. Dime qué quieres resolver antes de
          la llamada: así Juan llega con la respuesta preparada y no se gasta la reunión
          entendiendo el problema.
        </p>

        {sinCupo && (
          <p className="mt-4 rounded-xl border border-border bg-bg-secondary/60 px-4 py-3 text-[13px] leading-relaxed text-text-secondary">
            Ya usaste la de esta semana. Vuelve el lunes — no se acumula, así que aprovecha las
            tres grupales (martes, jueves y domingo a las 7:30 pm) y déjame lo que sea por{' '}
            <strong className="font-semibold text-white">Mis preguntas</strong>, que eso no tiene tope.
          </p>
        )}

        <label className="mt-5 block text-[12.5px] font-bold text-text-secondary">
          ¿Qué quieres resolver? <span className="text-brand-danger">*</span>
        </label>
        <textarea
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Ej: llevo 2 semanas con la campaña activa, gasté $300.000 y solo tengo 1 venta. No sé si matarla o aguantar."
          className="mt-2 w-full resize-none rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
        />

        <label className="mt-4 block text-[12.5px] font-bold text-text-secondary">
          ¿Cuándo te sirve? <span className="font-normal text-text-muted">(opcional)</span>
        </label>
        <input
          value={disponibilidad}
          onChange={(e) => setDisponibilidad(e.target.value)}
          maxLength={200}
          placeholder="Ej: entre semana después de las 7 pm, o sábados en la mañana"
          className="mt-2 w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-[14px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
        />

        <Button
          onClick={enviar}
          disabled={pending || sinCupo || pregunta.trim().length < 10}
          className="mt-5"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          {pending ? 'Enviando…' : sinCupo ? 'Sin cupo hasta el lunes' : 'Solicitar mi 1:1 de la semana'}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-4 py-2.5 text-[13px] text-brand-danger"
            >
              {error}
            </motion.p>
          )}
          {enviado && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 px-4 py-2.5 text-[13px] text-brand-success"
            >
              <CheckCircle2 className="h-4 w-4" /> Solicitud enviada. Juan te confirma la hora por aquí.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {reuniones.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-text-muted">Todavía no has pedido ninguna reunión.</p>
      ) : (
        <div className="space-y-4">
          {reuniones.map((r) => {
            const estado = ESTADO_REUNION[r.status] ?? ESTADO_REUNION.pendiente;
            return (
              <article key={r.id} className="rounded-2xl border border-border bg-bg-card p-5">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className={cn('rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider', estado.clase)}>
                    {estado.texto}
                  </span>
                  <span className="font-mono text-[11px] text-text-muted">{fecha(r.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-white">{r.question}</p>
                {r.scheduled_at && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg border border-brand-success/25 bg-brand-success/[0.08] px-4 py-2.5 text-[13.5px] font-semibold text-brand-success">
                    <Video className="h-4 w-4" /> Agendada para el {fecha(r.scheduled_at)}
                  </p>
                )}
                {r.admin_note && (
                  <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text-secondary">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-brand-purpleLight">
                      Nota de Juan:{' '}
                    </span>
                    {r.admin_note}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
