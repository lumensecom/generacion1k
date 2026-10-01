import { Sparkles } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MapaSoftware } from '@/components/portal/software/MapaSoftware';
import { calcularResumen, getGastos, getIngresos } from '@/lib/software-data';

export const metadata = { title: 'Software 1K | Portal Generación 1K' };

export default async function SoftwarePage() {
  const session = await requireSession();

  const [ingresos, gastos] = await Promise.all([
    getIngresos(session.sid, 30),
    getGastos(session.sid, 30),
  ]);
  const resumen = calcularResumen(ingresos, gastos);

  const vacio = ingresos.length === 0 && gastos.length === 0;

  return (
    <PortalShell session={session}>
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand-purpleLight">
          <Sparkles className="h-3 w-3" /> Software 1K
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[42px]">
          Tu negocio, <span className="accent-text">en un solo tablero</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary">
          Las mismas herramientas con las que opero mi ecommerce, ahora dentro de tu portal.
          En el centro está lo único que decide si esto funciona. Alrededor, lo que lo mueve.
        </p>
      </div>

      {vacio && (
        <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-brand-yellow/25 bg-brand-yellow/[0.06] px-5 py-4 text-center">
          <p className="text-[13.5px] leading-relaxed text-text-secondary">
            Todavía no has registrado nada, así que el centro está en cero. Empieza por{' '}
            <strong className="text-brand-yellow">Contabilidad</strong>: con anotar la pauta de
            hoy y lo que vendiste ya tienes de dónde agarrarte.
          </p>
        </div>
      )}

      <MapaSoftware resumen={resumen} />
    </PortalShell>
  );
}
