import { CalendarCheck, Flag, MapPin } from 'lucide-react';
import { ETAPAS, fechaBonita, type Recorrido } from '@/lib/recorrido';
import { cn } from '@/lib/utils';

/**
 * Dónde va el estudiante dentro de sus tres meses.
 *
 * El camino en perspectiva es lo que se queda en la cabeza, pero el dato va
 * primero en palabras: "semana 3 de 13, terminas el 20 de diciembre". Si el
 * dibujo no se entiende, la frase sí, y nadie se queda sin saber en qué punto
 * está.
 *
 * Todo es CSS: no carga una línea de JavaScript al cliente.
 */
export function RecorridoMentoria({
  recorrido,
  nombre,
}: {
  recorrido: Recorrido;
  nombre: string;
}) {
  const etapa = ETAPAS[recorrido.mesActual - 1] ?? ETAPAS[0];
  const avance = Math.min(100, Math.max(0, recorrido.porcentaje));

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#17102B] via-[#120C22] to-[#0A0A0A]">
      <div className="px-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-purpleLight">
              Tu recorrido
            </span>
            <h2 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
              {resumen(recorrido)}
            </h2>
            <p className="mt-2 text-[14px] text-text-secondary">
              <strong className="text-white">Mes {recorrido.mesActual}</strong> · {etapa.titulo}
              <span className="block text-[13px] text-text-muted">{etapa.foco}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Dato
              icono={<Flag className="h-3.5 w-3.5" />}
              etiqueta="Empezaste"
              valor={fechaBonita(recorrido.inicio)}
            />
            <Dato
              icono={<CalendarCheck className="h-3.5 w-3.5" />}
              etiqueta="Terminas"
              valor={fechaBonita(recorrido.fin)}
              destacado
            />
          </div>
        </div>

        {recorrido.origenInicio !== 'plan' && (
          <p className="mt-4 rounded-xl border border-brand-yellow/20 bg-brand-yellow/[0.05] px-4 py-2.5 text-[12px] leading-snug text-text-secondary">
            Estas fechas salen de{' '}
            {recorrido.origenInicio === 'primer-ingreso'
              ? 'tu primer ingreso al portal'
              : 'el día que te invitamos'}
            , porque tu fecha de inicio todavía no está registrada. Si no cuadra, dile a Juan
            y la ajusta.
          </p>
        )}
      </div>

      <Camino avance={avance} recorrido={recorrido} nombre={nombre} />

      <div className="grid grid-cols-3 gap-px border-t border-white/8 bg-white/8">
        {ETAPAS.map((e) => {
          const pasado = recorrido.mesActual > e.mes;
          const actual = recorrido.mesActual === e.mes;
          return (
            <div
              key={e.mes}
              className={cn(
                'px-4 py-4 sm:px-6',
                actual ? 'bg-brand-purple/10' : 'bg-[#0A0A0A]'
              )}
            >
              <span
                className={cn(
                  'font-mono text-[9.5px] uppercase tracking-wider',
                  actual ? 'text-brand-purpleLight' : pasado ? 'text-brand-success' : 'text-text-muted'
                )}
              >
                Mes {e.mes}
                {pasado && ' ✓'}
                {actual && ' · aquí'}
              </span>
              <p
                className={cn(
                  'mt-1 text-[13px] font-bold leading-snug',
                  actual ? 'text-white' : pasado ? 'text-text-secondary' : 'text-text-muted'
                )}
              >
                {e.titulo}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** La frase que resume todo. Es lo primero que se lee. */
function resumen(r: Recorrido): string {
  if (r.porEmpezar) return 'Tu mentoría arranca pronto';
  if (r.terminado) return 'Completaste los tres meses';
  return `Vas en la semana ${r.semanaActual} de ${r.semanasTotales}`;
}

function Dato({
  icono,
  etiqueta,
  valor,
  destacado = false,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3',
        destacado ? 'border-brand-purple/35 bg-brand-purple/10' : 'border-white/10 bg-white/[0.03]'
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider',
          destacado ? 'text-brand-purpleLight' : 'text-text-muted'
        )}
      >
        {icono} {etiqueta}
      </span>
      <span className="mt-1 block whitespace-nowrap text-[13.5px] font-extrabold">{valor}</span>
    </div>
  );
}

/**
 * El camino en perspectiva.
 *
 * La pista se inclina en X para que se aleje, y todo lo que tiene que leerse
 * —los hitos, el marcador— se contra-rota la misma cantidad para quedar de
 * frente. Sin eso los textos salen aplastados contra el suelo.
 */
function Camino({
  avance,
  recorrido,
  nombre,
}: {
  avance: number;
  recorrido: Recorrido;
  nombre: string;
}) {
  const hitos = [0, 33.33, 66.66, 100];

  return (
    <div className="px-6 pb-2 pt-10 sm:px-8 sm:pb-4 sm:pt-14">
      <div className="[perspective:900px]">
        <div className="relative h-[150px] [transform-style:preserve-3d] [transform:rotateX(52deg)] sm:h-[180px]">
          {/* La pista */}
          <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 rounded-full border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[inset_0_2px_20px_rgba(0,0,0,0.6)]">
            {/* Lo recorrido, encendido */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-purple/70 via-brand-purpleLight/80 to-brand-pink/80 shadow-[0_0_40px_rgba(168,85,247,0.55)]"
              style={{ width: `${Math.max(2, avance)}%` }}
            />

            {/* Las rayas de la vía, para que se lea el movimiento */}
            <div
              className="absolute inset-x-6 top-1/2 h-[2px] -translate-y-1/2 opacity-30"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 14px, transparent 14px 32px)',
              }}
            />
          </div>

          {/* Los hitos: cuatro postes de frente */}
          {hitos.map((pos, i) => {
            const alcanzado = avance >= pos - 0.5;
            return (
              <div
                key={pos}
                className="absolute top-1/2 [transform-style:preserve-3d]"
                style={{
                  left: `${pos}%`,
                  transform: 'translate(-50%, -50%) rotateX(-52deg)',
                }}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-xl border backdrop-blur-sm sm:h-12 sm:w-12',
                    'flex items-center justify-center font-display text-[13px] font-extrabold',
                    alcanzado
                      ? 'border-brand-purpleLight/60 bg-brand-purple/30 text-white shadow-[0_0_28px_rgba(168,85,247,0.5)]'
                      : 'border-white/12 bg-white/[0.04] text-text-muted'
                  )}
                >
                  {i === 0 ? <Flag className="h-4 w-4" /> : i}
                </div>
              </div>
            );
          })}

          {/* Dónde está hoy */}
          {!recorrido.porEmpezar && (
            <div
              className="absolute top-1/2 z-10 [transform-style:preserve-3d]"
              style={{
                left: `${avance}%`,
                transform: 'translate(-50%, -50%) rotateX(-52deg)',
              }}
            >
              <div className="relative flex flex-col items-center">
                <span className="whitespace-nowrap rounded-full border border-brand-yellow/50 bg-brand-yellow/15 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-brand-yellow backdrop-blur-sm">
                  {nombre}
                </span>
                <span className="relative mt-1.5 flex h-7 w-7 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-brand-yellow/35 motion-safe:animate-pulseDot" />
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-yellow bg-bg-primary text-brand-yellow shadow-[0_0_26px_rgba(245,158,11,0.75)]">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
        <span className="font-mono uppercase tracking-wider text-text-muted">
          Día {recorrido.diasTranscurridos} de {recorrido.diasTotales}
        </span>
        <span
          className={cn(
            'font-bold',
            recorrido.terminado ? 'text-brand-success' : 'text-brand-purpleLight'
          )}
        >
          {recorrido.terminado
            ? 'Programa completo'
            : recorrido.porEmpezar
              ? 'Aún no arranca'
              : `${recorrido.diasRestantes} días por delante`}
        </span>
      </div>
    </div>
  );
}
