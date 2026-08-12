import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { AyudaCliente } from '@/components/portal/AyudaCliente';
import { getPreguntasDeEstudiante, getReunionesDeEstudiante } from '@/lib/portal-data';

export const metadata = { title: 'Ayuda | Portal Generación 1K' };

export default async function AyudaPage() {
  const session = await requireSession();
  const [preguntas, reuniones] = await Promise.all([
    getPreguntasDeEstudiante(session.sid),
    getReunionesDeEstudiante(session.sid),
  ]);

  return (
    <PortalShell session={session}>
      <div className="mb-9">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Ayuda
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          ¿En qué te <span className="accent-text">trabaste</span>?
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <AyudaCliente preguntas={preguntas} reuniones={reuniones} />
    </PortalShell>
  );
}
