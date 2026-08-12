'use client';

import { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  X,
  Video,
  ExternalLink,
  Download,
  Users,
  User,
  Check,
  Clock,
} from 'lucide-react';
import { guardarTema } from '@/app/portal/ayuda/actions';
import { urlGoogleCalendar, urlDescargaICS } from '@/lib/calendario';
import { VideoPlayer } from '@/components/portal/VideoPlayer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type EventoAgenda,
  rejillaDelMes,
  agruparPorDia,
  claveLocal,
  hora,
  fechaLarga,
  nombreMes,
  enVivo,
  yaPaso,
} from '@/lib/agenda';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Un color por tipo: la 1:1 en morado (la marca) y la grupal en cian, que
// es el otro acento del sistema y no se confunde con los estados.
const ESTILO = {
  individual: {
    punto: 'bg-brand-purpleLight',
    chip: 'hover:bg-brand-purple/15 text-brand-purpleLight',
    borde: 'border-brand-purple/35',
    fondo: 'bg-brand-purple/[0.07]',
    Icono: User,
    etiqueta: 'Sesión 1:1',
  },
  grupal: {
    punto: 'bg-brand-cyan',
    chip: 'hover:bg-brand-cyan/15 text-brand-cyan',
    borde: 'border-brand-cyan/35',
    fondo: 'bg-brand-cyan/[0.07]',
    Icono: Users,
    etiqueta: 'Clase grupal',
  },
} as const;

export function Agenda({ eventos }: { eventos: EventoAgenda[] }) {
  const [ancla, setAncla] = useState(() => new Date());
  const [vista, setVista] = useState<'mes' | 'lista'>('mes');
  const [abierto, setAbierto] = useState<EventoAgenda | null>(null);

  const porDia = useMemo(() => agruparPorDia(eventos), [eventos]);
  const dias = useMemo(() => rejillaDelMes(ancla), [ancla]);

  const mover = (meses: number) =>
    setAncla((a) => new Date(a.getFullYear(), a.getMonth() + meses, 1));

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <button
            onClick={() => setAncla(new Date())}
            className="rounded-full border border-border px-4 py-1.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
          >
            Hoy
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => mover(-1)}
              aria-label="Mes anterior"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[150px] text-center font-display text-[15px] font-extrabold capitalize tracking-tight sm:text-base">
              {nombreMes(ancla)}
            </h2>
            <button
              onClick={() => mover(1)}
              aria-label="Mes siguiente"
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* El calendario de rejilla no cabe en un móvil sin volverse
              ilegible, así que abajo de md solo existe la lista. */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:flex">
            {(
              [
                ['lista', List],
                ['mes', CalendarDays],
              ] as const
            ).map(([v, Icono]) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                aria-label={v === 'mes' ? 'Vista de calendario' : 'Vista de lista'}
                aria-pressed={vista === v}
                className={cn(
                  'px-3 py-2 transition-colors',
                  vista === v ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-white'
                )}
              >
                <Icono className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Rejilla del mes — solo en pantallas medianas hacia arriba */}
        <div className={cn('hidden md:block', vista !== 'mes' && 'md:hidden')}>
          <div className="grid grid-cols-7 border-b border-border">
            {DIAS.map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-[12px] font-bold text-text-secondary">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {dias.map((dia, i) => {
              const delDia = porDia.get(dia.clave) ?? [];
              return (
                <div
                  key={dia.clave}
                  className={cn(
                    'min-h-[104px] border-b border-r border-border/60 p-1.5',
                    i % 7 === 6 && 'border-r-0',
                    i >= 35 && 'border-b-0',
                    !dia.delMes && 'bg-black/20'
                  )}
                >
                  <span
                    className={cn(
                      'mb-1 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11.5px]',
                      dia.esHoy
                        ? 'bg-brand-purple font-bold text-white'
                        : dia.delMes
                          ? 'text-text-secondary'
                          : 'text-text-muted/50'
                    )}
                  >
                    {dia.fecha.getDate()}
                  </span>

                  <div className="space-y-0.5">
                    {delDia.map((e) => {
                      const st = ESTILO[e.tipo];
                      return (
                        <button
                          key={e.id}
                          onClick={() => setAbierto(e)}
                          className={cn(
                            'flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-[11px] transition-colors',
                            st.chip,
                            (yaPaso(e) || e.estado === 'cancelada') && 'opacity-45'
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', st.punto)} />
                          <span className="shrink-0 font-mono text-[10px] opacity-80">{hora(e.inicio)}</span>
                          <span className="truncate text-white/85">{e.titulo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista — única vista en móvil, opcional en escritorio */}
        <div className={cn('md:hidden', vista === 'lista' && 'md:block')}>
          <ListaAgenda eventos={eventos} ancla={ancla} onAbrir={setAbierto} />
        </div>
      </div>

      <Leyenda />
      <DetalleEvento evento={abierto} onClose={() => setAbierto(null)} />
    </>
  );
}

function Leyenda() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
      {(['individual', 'grupal'] as const).map((t) => {
        const st = ESTILO[t];
        return (
          <span key={t} className="flex items-center gap-2 text-[12.5px] text-text-muted">
            <span className={cn('h-2 w-2 rounded-full', st.punto)} /> {st.etiqueta}
          </span>
        );
      })}
    </div>
  );
}

function ListaAgenda({
  eventos,
  ancla,
  onAbrir,
}: {
  eventos: EventoAgenda[];
  ancla: Date;
  onAbrir: (e: EventoAgenda) => void;
}) {
  // La lista sigue al mes que se está mirando, para que los botones de
  // navegación signifiquen lo mismo en las dos vistas.
  const delMes = eventos.filter((e) => {
    const d = new Date(e.inicio);
    return d.getFullYear() === ancla.getFullYear() && d.getMonth() === ancla.getMonth();
  });

  if (delMes.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-[14px] text-text-muted">
        No hay sesiones este mes.
      </p>
    );
  }

  const hoy = claveLocal(new Date());
  let ultimoDia = '';

  return (
    <div className="divide-y divide-border/60">
      {delMes.map((e) => {
        const clave = claveLocal(new Date(e.inicio));
        const nuevoDia = clave !== ultimoDia;
        ultimoDia = clave;
        const st = ESTILO[e.tipo];
        const vivo = enVivo(e);

        return (
          <div key={e.id}>
            {nuevoDia && (
              <p className="bg-black/20 px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {new Date(e.inicio).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {clave === hoy && <span className="ml-2 text-brand-purpleLight">· hoy</span>}
              </p>
            )}
            <button
              onClick={() => onAbrir(e)}
              className={cn(
                'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]',
                (yaPaso(e) || e.estado === 'cancelada') && 'opacity-50'
              )}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', st.punto)} />
              <span className="w-16 shrink-0 font-mono text-[12px] text-text-secondary">{hora(e.inicio)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-white">{e.titulo}</span>
                <span className="text-[12px] text-text-muted">
                  {st.etiqueta} · {e.duracionMinutos} min
                </span>
              </span>
              {vivo && (
                <span className="shrink-0 rounded-full bg-brand-success/20 px-2 py-0.5 font-mono text-[9.5px] uppercase text-brand-success">
                  ahora
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DetalleEvento({ evento, onClose }: { evento: EventoAgenda | null; onClose: () => void }) {
  const [tema, setTema] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Al abrir otro evento hay que recargar el borrador, si no se arrastra el
  // texto del anterior.
  useEffect(() => {
    setTema(evento?.temaEstudiante ?? '');
    setGuardado(false);
    setError(null);
  }, [evento]);

  const cerrar = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!evento) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [evento, cerrar]);

  if (!evento) return <AnimatePresence />;

  const st = ESTILO[evento.tipo];
  const vivo = enVivo(evento);
  const pasado = yaPaso(evento);

  const google = urlGoogleCalendar({
    titulo: `${evento.titulo} — Generación 1K`,
    descripcion: evento.descripcion ?? evento.temaEstudiante,
    inicio: evento.inicio,
    duracionMinutos: evento.duracionMinutos,
    url: evento.meetUrl,
  });
  const ics = urlDescargaICS(
    {
      titulo: `${evento.titulo} — Generación 1K`,
      descripcion: evento.descripcion ?? evento.temaEstudiante,
      inicio: evento.inicio,
      duracionMinutos: evento.duracionMinutos,
      url: evento.meetUrl,
    },
    evento.id
  );

  function guardar() {
    if (!evento) return;
    setError(null);
    start(async () => {
      const r = await guardarTema(evento.id, tema);
      if (r?.error) return setError(r.error);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cerrar}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={evento.titulo}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className={cn(
            'relative flex max-h-[90vh] w-full max-w-[540px] flex-col overflow-hidden rounded-t-2xl border bg-bg-secondary shadow-2xl sm:rounded-2xl',
            st.borde
          )}
        >
          <div className={cn('flex items-start justify-between gap-4 border-b border-border/70 p-6', st.fondo)}>
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-secondary">
                <st.Icono className="h-3.5 w-3.5" /> {st.etiqueta}
                {evento.numero && <span className="text-text-muted">· nº {evento.numero}</span>}
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold leading-tight tracking-tight">
                {evento.titulo}
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] capitalize text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {fechaLarga(evento.inicio)}
                <span className="normal-case text-text-muted">· {evento.duracionMinutos} min</span>
              </p>
              {vivo && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-success/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-success">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" /> En vivo ahora
                </span>
              )}
              {evento.estado === 'cancelada' && (
                <span className="mt-3 inline-block rounded-full bg-brand-danger/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-danger">
                  Cancelada
                </span>
              )}
            </div>
            <button
              onClick={cerrar}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto p-6">
            {evento.descripcion && (
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-text-secondary">
                {evento.descripcion}
              </p>
            )}

            {evento.meetUrl && evento.estado !== 'cancelada' && !pasado && (
              <a
                href={evento.meetUrl}
                target="_blank"
                rel="noopener"
                className={cn(
                  'flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl font-bold transition-colors',
                  vivo
                    ? 'bg-brand-success text-black hover:bg-brand-success/85'
                    : 'bg-brand-purple text-white hover:bg-brand-purpleLight'
                )}
              >
                <Video className="h-4 w-4" /> Entrar a la sesión
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {!pasado && evento.estado !== 'cancelada' && (google || ics) && (
              <div className="flex flex-wrap gap-2">
                {google && (
                  <a
                    href={google}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
                  >
                    <CalendarDays className="h-3.5 w-3.5" /> Google Calendar
                  </a>
                )}
                {ics && (
                  <a
                    href={ics}
                    download={`${evento.tipo}-generacion1k.ics`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-[12.5px] font-semibold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" /> Apple / Outlook
                  </a>
                )}
              </div>
            )}

            {/* Proponer tema — solo en las 1:1 que aún no han pasado */}
            {evento.puedeProponerTema && (
              <div className="rounded-xl border border-brand-purple/25 bg-brand-purple/[0.06] p-5">
                <label className="text-[13px] font-bold text-white">
                  ¿Qué quieres tratar en esta sesión?
                </label>
                <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">
                  Escríbelo y Juan llega con la respuesta preparada, en vez de gastar la sesión
                  entendiendo el problema.
                </p>
                <textarea
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Ej: mi campaña tiene CTR alto pero cero ventas y no sé dónde mirar."
                  className="mt-3 w-full resize-none rounded-xl border border-border bg-bg-primary px-4 py-3 text-[13.5px] text-white outline-none placeholder:text-text-muted focus:border-brand-purple/60"
                />
                {error && <p className="mt-2 text-[12.5px] text-brand-danger">{error}</p>}
                <Button type="button" onClick={guardar} disabled={pending} className="mt-3">
                  {guardado && <Check className="mr-1.5 h-4 w-4 text-brand-success" />}
                  {pending ? 'Guardando…' : guardado ? 'Guardado' : 'Guardar tema'}
                </Button>
              </div>
            )}

            {/* Ya pasó y había tema: se muestra, ya no se edita */}
            {!evento.puedeProponerTema && evento.temaEstudiante && (
              <p className="rounded-xl border border-border bg-bg-card p-4 text-[13.5px] leading-relaxed text-text-secondary">
                <span className="font-mono text-[10px] uppercase tracking-wider text-brand-purpleLight">
                  Tema que pediste:{' '}
                </span>
                {evento.temaEstudiante}
              </p>
            )}

            {evento.grabacionUrl && (
              <div>
                <p className="mb-3 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                  <Clock className="h-3.5 w-3.5" /> Grabación
                </p>
                <VideoPlayer url={evento.grabacionUrl} titulo={evento.titulo} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
