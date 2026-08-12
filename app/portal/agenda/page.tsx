import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { Agenda } from '@/components/portal/Agenda';
import { EncuestaDia } from '@/components/portal/ClasesCliente';
import {
  getSesionesDeEstudiante,
  getClases,
  getEncuestaAbierta,
  getVotos,
} from '@/lib/portal-data';
import { construirAgenda } from '@/lib/agenda';

export const metadata = { title: 'Mi agenda | Portal Generación 1K' };

export default async function AgendaPage() {
  const session = await requireSession();
  const [sesiones, clases, encuesta] = await Promise.all([
    getSesionesDeEstudiante(session.sid),
    getClases(true),
    getEncuestaAbierta(),
  ]);

  const votos = encuesta ? await getVotos(encuesta.id) : [];
  const conteos: Record<string, number> = {};
  for (const v of votos) conteos[v.option_id] = (conteos[v.option_id] ?? 0) + 1;
  const miVoto = votos.find((v) => v.student_id === session.sid)?.option_id ?? null;

  const eventos = construirAgenda(sesiones, clases);
  const hechas = sesiones.filter((s) => s.status === 'hecha').length;

  return (
    <PortalShell session={session}>
      <div className="mb-9">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Agendamiento
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Mi <span className="accent-text">agenda</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          Tres encuentros por semana: dos sesiones 1:1 contigo y una clase grupal con el resto.
          Toca cualquiera para ver el detalle, entrar y proponer qué quieres tratar.
        </p>
        <AnimatedDivider className="mt-4" />
      </div>

      {sesiones.length > 0 && (
        <p className="mb-5 text-[13.5px] text-text-secondary">
          <span className="font-mono text-[16px] font-medium text-white">
            {hechas}/{sesiones.length}
          </span>{' '}
          sesiones 1:1 completadas
        </p>
      )}

      <Agenda eventos={eventos} />

      {encuesta && (
        <div className="mt-10">
          <EncuestaDia encuesta={encuesta} conteos={conteos} miVoto={miVoto} />
        </div>
      )}
    </PortalShell>
  );
}
