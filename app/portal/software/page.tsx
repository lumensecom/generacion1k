import { Lock, Sparkles } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MapaSoftware } from '@/components/portal/software/MapaSoftware';
import { calcularResumen, getGastos, getIngresos } from '@/lib/software-data';
import { APERTURA_TEXTO, diasParaApertura, puedeUsarSoftware } from '@/lib/software-acceso';

export const metadata = { title: 'Software 1K | Portal Generación 1K' };

export default async function SoftwarePage() {
  const session = await requireSession();
  const abierto = puedeUsarSoftware(session.role);

  // Antes de la apertura no se consulta nada: el mapa va difuminado y las
  // cifras no se leen, así que traerlas sería trabajo para nadie.
  const resumen = abierto
    ? calcularResumen(
        ...(await Promise.all([getIngresos(session.sid, 30), getGastos(session.sid, 30)]))
      )
    : { ingresos: 0, gastos: 0, utilidad: 0, roas: 0 };

  if (!abierto) return <Adelanto session={session} resumen={resumen} />;

  const vacio = resumen.ingresos === 0 && resumen.gastos === 0;

  return (
    <PortalShell session={session}>
      <Encabezado />

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

function Encabezado() {
  return (
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
  );
}

/**
 * Lo que ve el estudiante hasta el 5 de octubre: el mapa completo, con sus
 * colores y su movimiento, pero fuera de foco y sin un solo enlace que abrir.
 */
function Adelanto({
  session,
  resumen,
}: {
  session: Awaited<ReturnType<typeof requireSession>>;
  resumen: { ingresos: number; gastos: number; utilidad: number; roas: number };
}) {
  const faltan = diasParaApertura();

  return (
    <PortalShell session={session}>
      <Encabezado />

      <div className="relative">
        {/* El mapa se pinta entero: así se ve que son seis herramientas de
            verdad y no una pantalla de "muy pronto". */}
        <div
          className="pointer-events-none select-none blur-[7px] saturate-[1.15]"
          aria-hidden
        >
          <MapaSoftware resumen={resumen} soloVista />
        </div>

        {/* El aviso, encima y a foco. */}
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-md rounded-3xl border border-white/12 bg-bg-primary/80 px-8 py-9 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-purple/30 bg-brand-purple/12 text-brand-purpleLight">
              <Lock className="h-5 w-5" />
            </span>

            <p className="mt-5 font-serif text-[26px] italic leading-tight text-white sm:text-[30px]">
              Próximamente
            </p>
            <p className="mt-1 font-serif text-[22px] italic leading-tight text-brand-purpleLight sm:text-[26px]">
              {APERTURA_TEXTO}
            </p>

            <p className="mt-5 text-[13.5px] leading-relaxed text-text-secondary">
              Seis herramientas para llevar tu contabilidad, costear de verdad, guardar tus
              creativos y generar el código de tus landings. Se abren solas ese día.
            </p>

            {faltan > 0 && (
              <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-text-muted">
                {faltan === 1 ? 'Falta 1 día' : `Faltan ${faltan} días`}
              </p>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
