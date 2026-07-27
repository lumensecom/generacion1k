import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { ProfileForm } from '@/components/portal/ProfileForm';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { getStudentById } from '@/lib/portal-data';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Mi perfil | Portal Generación 1K' };

export default async function PerfilPage() {
  const session = await requireSession();
  const student = await getStudentById(session.sid);
  if (!student) notFound();

  return (
    <PortalShell session={session} theme="light">
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purple">Tu cuenta</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-light-text sm:text-4xl">
          Mi <span className="accent-text-light">perfil</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <ProfileForm student={student} />
    </PortalShell>
  );
}
