import { notFound } from 'next/navigation';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ProfileForm } from '@/components/portal/ProfileForm';
import { PlanYPagos } from '@/components/portal/PlanYPagos';
import { Cronograma } from '@/components/portal/Cronograma';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { getStudentById, getSesionesDeEstudiante } from '@/lib/portal-data';

export const metadata = { title: 'Mi perfil | Portal Generación 1K' };

export default async function PerfilPage() {
  const session = await requireSession();
  const [student, sesiones] = await Promise.all([
    getStudentById(session.sid),
    getSesionesDeEstudiante(session.sid),
  ]);
  if (!student) notFound();

  return (
    <PortalShell session={session}>
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Tu cuenta
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Mi <span className="accent-text">perfil</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <div className="space-y-12">
        <section>
          <PlanYPagos student={student} />
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl font-extrabold tracking-tight">
            Cronograma de tus sesiones 1:1
          </h2>
          <Cronograma sesiones={sesiones} />
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl font-extrabold tracking-tight">Tus datos</h2>
          <ProfileForm student={student} />
        </section>
      </div>
    </PortalShell>
  );
}
