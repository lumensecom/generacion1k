import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { Agenda } from '@/components/portal/Agenda';
import { AgendaAdmin } from '@/components/portal/admin/AgendaAdmin';
import { EncuestaDia } from '@/components/portal/ClasesCliente';
import {
  getSesionesDeEstudiante,
  getTodasLasSesiones,
  getAllStudents,
  getClases,
  getEncuestaAbierta,
  getVotos,
  getReunionesDeEstudiante,
  getReunionesConEstudiante,
} from '@/lib/portal-data';
import { construirAgenda } from '@/lib/agenda';

export const metadata = { title: 'Mi agenda | Portal Generación 1K' };

export default async function AgendaPage() {
  const session = await requireSession();
  const esAdmin = session.role === 'admin';

  // Juan ve el calendario de cualquier estudiante y agenda desde aquí; el
  // estudiante solo ve el suyo. Son dos cargas distintas de datos, así que
  // se resuelve antes de pedir nada.
  const [sesiones, estudiantes, clases, encuesta, reuniones] = await Promise.all([
    esAdmin ? getTodasLasSesiones() : getSesionesDeEstudiante(session.sid),
    esAdmin ? getAllStudents() : Promise.resolve([]),
    getClases(true),
    getEncuestaAbierta(),
    // Las 1:1 se piden, así que las confirmadas viven aquí y no en
    // one_on_one_sessions. Sin esto no saldrían en el calendario.
    esAdmin ? getReunionesConEstudiante() : getReunionesDeEstudiante(session.sid),
  ]);

  const votos = encuesta ? await getVotos(encuesta.id) : [];
  const conteos: Record<string, number> = {};
  for (const v of votos) conteos[v.option_id] = (conteos[v.option_id] ?? 0) + 1;
  const miVoto = votos.find((v) => v.student_id === session.sid)?.option_id ?? null;

  const eventos = esAdmin ? [] : construirAgenda(sesiones, clases, undefined, reuniones);
  const hechas = sesiones.filter((s) => s.status === 'hecha').length;

  return (
    <PortalShell session={session}>
      <div className="mb-9">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Agendamiento
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {esAdmin ? (
            <>
              Agenda de <span className="accent-text">tus estudiantes</span>
            </>
          ) : (
            <>
              Mi <span className="accent-text">agenda</span>
            </>
          )}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          {esAdmin
            ? 'Las tres grupales de cada semana y las 1:1 que te hayan pedido y ya confirmaste. El cupo de cada estudiante son dos 1:1 por semana, sin acumular.'
            : 'Tres clases grupales por semana — martes, jueves y domingo a las 7:30 pm — y las 1:1 que pidas desde Ayuda. Toca cualquiera para ver el detalle y entrar.'}
        </p>
        <AnimatedDivider className="mt-4" />
      </div>

      {esAdmin ? (
        <AgendaAdmin
            estudiantes={estudiantes}
            sesiones={sesiones}
            clases={clases}
            reuniones={reuniones}
          />
      ) : (
        <>
          {sesiones.length > 0 && (
            <p className="mb-5 text-[13.5px] text-text-secondary">
              <span className="font-mono text-[16px] font-medium text-white">
                {hechas}/{sesiones.length}
              </span>{' '}
              sesiones 1:1 completadas
            </p>
          )}
          <Agenda eventos={eventos} />
        </>
      )}

      {encuesta && (
        <div className="mt-10">
          <EncuestaDia encuesta={encuesta} conteos={conteos} miVoto={miVoto} />
        </div>
      )}
    </PortalShell>
  );
}
