import { AlertTriangle, CheckCircle2, Rocket } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { EstudioLanding } from '@/components/portal/software/EstudioLanding';
import { ANTES_DE_EMPEZAR, BLOQUES } from '@/lib/software-landings';

export const metadata = { title: 'Landings que venden | Software 1K' };

export default async function LandingsPage() {
  const session = await requireSession();

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Landings que venden"
        bajada="La estructura exacta con la que armo las mías, bloque por bloque, y el estudio para escribir el primer borrador."
        icono={Rocket}
        color="#EC4899"
      >
        <section className="mb-8 rounded-2xl border border-border bg-bg-card p-6">
          <h2 className="font-display text-[17px] font-extrabold tracking-tight">
            Antes de abrir el editor
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Una landing no se escribe, se arma con material que ya recogiste. Si te sientas sin
            esto, vas a terminar inventando lo que cree el cliente — y ahí es donde se pierden
            las landings.
          </p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {ANTES_DE_EMPEZAR.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-pink" />
                {x}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-[20px] font-extrabold tracking-tight">
            Los seis bloques, en orden
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            El orden no es estético: es el orden en que una persona que no te conoce decide
            comprarte. Si mueves la prueba social antes del problema, la pones a defender algo
            que el visitante todavía no siente que necesita.
          </p>

          <div className="mt-6 space-y-4">
            {BLOQUES.map((b) => (
              <article
                key={b.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-bg-card p-6"
              >
                {/* La línea que une un bloque con el siguiente. */}
                <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-brand-pink/60 to-brand-purple/20" />

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-[11px] text-brand-pink">
                    {String(b.numero).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[18px] font-extrabold tracking-tight">
                    {b.nombre}
                  </h3>
                </div>

                <p className="mt-2 max-w-2xl text-[14.5px] font-semibold leading-relaxed text-white">
                  {b.trabajo}
                </p>

                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {b.piezas.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary"
                    >
                      <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-brand-purpleLight" />
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-brand-danger/20 bg-brand-danger/[0.05] p-4">
                    <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand-danger">
                      <AlertTriangle className="h-3 w-3" /> El error de siempre
                    </span>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">
                      {b.error}
                    </p>
                  </div>
                  <div className="rounded-xl border border-brand-success/20 bg-brand-success/[0.05] p-4">
                    <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-brand-success">
                      <CheckCircle2 className="h-3 w-3" /> Cómo saber si quedó bien
                    </span>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">
                      {b.prueba}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <EstudioLanding />
      </MarcoSoftware>
    </PortalShell>
  );
}
