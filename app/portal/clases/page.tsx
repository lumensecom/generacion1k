import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { ClasesCliente } from '@/components/portal/ClasesCliente';
import { getClases, getEncuestaAbierta, getVotos } from '@/lib/portal-data';

export const metadata = { title: 'Clase grupal | Portal Generación 1K' };

export default async function ClasesPage() {
  const session = await requireSession();
  const [clases, encuesta] = await Promise.all([getClases(true), getEncuestaAbierta()]);

  const votos = encuesta ? await getVotos(encuesta.id) : [];
  const conteos: Record<string, number> = {};
  for (const v of votos) conteos[v.option_id] = (conteos[v.option_id] ?? 0) + 1;
  const miVoto = votos.find((v) => v.student_id === session.sid)?.option_id ?? null;

  return (
    <PortalShell session={session}>
      <div className="mb-9">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Clase grupal
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Hora y media <span className="accent-text">cada semana</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          Somos máximo cinco, así que hay tiempo para que cada uno traiga su caso. Si no
          puedes asistir, la grabación queda publicada aquí.
        </p>
        <AnimatedDivider className="mt-4" />
      </div>

      <ClasesCliente clases={clases} encuesta={encuesta} conteos={conteos} miVoto={miVoto} />
    </PortalShell>
  );
}
