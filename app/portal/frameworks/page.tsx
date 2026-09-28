import Link from 'next/link';
import { ArrowRight, Clock, Workflow } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { PestanasPrograma } from '@/components/portal/PestanasPrograma';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { FRAMEWORKS, FASES } from '@/lib/frameworks-data';

export const metadata = { title: 'Frameworks | Portal Generación 1K' };

export default async function FrameworksPage() {
  const session = await requireSession();

  return (
    <PortalShell session={session} theme="light">
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purple">
          El programa
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-light-text sm:text-4xl">
          Los <span className="accent-text-light">frameworks</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <PestanasPrograma activa="frameworks" />

      <p className="mb-9 max-w-2xl text-[15px] leading-relaxed text-light-text2">
        Un módulo se estudia una vez. Un framework se abre cada vez que toca hacer ese proceso:
        es el flujo completo dibujado, y entras directo a la caja que necesitas hoy — el prompt,
        el filtro, la plantilla. <strong className="text-light-text">No tienen test</strong> ni hay
        nada que aprobar.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {FRAMEWORKS.map((f) => {
          const fases = [...new Set(f.nodos.map((n) => n.fase))];
          return (
            <Link
              key={f.slug}
              href={`/portal/frameworks/${f.slug}`}
              className="group flex flex-col rounded-2xl border border-light-border bg-light-card p-7 shadow-[0_10px_26px_rgba(20,20,60,0.06)] transition-all hover:-translate-y-1 hover:border-brand-purple/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-purple">
                  <Workflow className="h-3.5 w-3.5" /> Framework {f.numero}
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-light-muted">
                  <Clock className="h-3 w-3" /> {f.duracion}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-extrabold leading-snug tracking-tight text-light-text">
                {f.titulo}
              </h2>
              <p className="mt-1 text-[13px] font-semibold text-light-muted">{f.subtitulo}</p>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-light-text2">
                {f.descripcion}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {fases.map((id) => (
                  <span
                    key={id}
                    className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                    style={{ backgroundColor: `${FASES[id].color}1F`, color: FASES[id].color }}
                  >
                    {FASES[id].nombre}
                  </span>
                ))}
              </div>

              <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-brand-purple">
                Abrir el tablero
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </PortalShell>
  );
}
