import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Workflow } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { TableroFramework } from '@/components/portal/TableroFramework';
import { getFramework, FRAMEWORKS } from '@/lib/frameworks-data';

export function generateStaticParams() {
  return FRAMEWORKS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const f = getFramework(params.slug);
  return { title: f ? `${f.titulo} | Frameworks` : 'Framework | Portal Generación 1K' };
}

export default async function FrameworkPage({ params }: { params: { slug: string } }) {
  const session = await requireSession();
  const framework = getFramework(params.slug);
  if (!framework) notFound();

  return (
    <PortalShell session={session}>
      <Link
        href="/portal/frameworks"
        className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={13} /> Frameworks
      </Link>

      <div className="mb-9 mt-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-purpleLight">
            <Workflow className="h-3.5 w-3.5" /> Framework {framework.numero}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-muted">
            <Clock className="h-3 w-3" /> {framework.duracion}
          </span>
          <span className="font-mono text-[11px] text-text-muted">
            {framework.nodos.length} pasos
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {framework.titulo}
        </h1>
        <p className="mt-2 text-[15px] font-semibold text-brand-purpleLight">
          {framework.subtitulo}
        </p>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          {framework.descripcion}
        </p>
        <p className="mt-4 text-[13.5px] text-text-muted">
          Toca cualquier caja para abrirla. Las que llevan la etiqueta{' '}
          <span className="font-mono text-brand-purpleLight">prompt</span> traen el texto listo
          para copiar y pegar en la IA.
        </p>
      </div>

      <TableroFramework framework={framework} />
    </PortalShell>
  );
}
