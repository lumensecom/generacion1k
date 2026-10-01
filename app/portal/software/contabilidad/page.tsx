import { Receipt } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { TarjetasResumen } from '@/components/portal/software/TarjetasResumen';
import { GraficaFlujo } from '@/components/portal/software/GraficaFlujo';
import { Contabilidad } from '@/components/portal/software/Contabilidad';
import { claveLocal } from '@/lib/agenda';
import {
  calcularResumen,
  getGastos,
  getIngresos,
  getProductos,
  serieDiaria,
} from '@/lib/software-data';

export const metadata = { title: 'Contabilidad | Software 1K' };

export default async function ContabilidadPage() {
  const session = await requireSession();

  const [ingresos, gastos, productos] = await Promise.all([
    getIngresos(session.sid, 90),
    getGastos(session.sid, 90),
    getProductos(session.sid),
  ]);

  // Las cifras de arriba miran los últimos 30 días; la lista guarda 90 para
  // que se pueda revisar el mes pasado sin volver a consultar.
  const corte = claveLocal(new Date(Date.now() - 30 * 86_400_000));
  const resumen = calcularResumen(
    ingresos.filter((i) => i.fecha >= corte),
    gastos.filter((g) => g.fecha >= corte)
  );

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Contabilidad"
        bajada="Cada peso que entra y cada peso que sale. Si esto no está al día, todo lo demás son suposiciones."
        icono={Receipt}
        color="#A855F7"
      >
        <TarjetasResumen resumen={resumen} />
        <div className="mb-6">
          <GraficaFlujo serie={serieDiaria(ingresos, gastos, 30)} />
        </div>
        <Contabilidad
          ingresos={ingresos}
          gastos={gastos}
          productos={productos}
          hoy={claveLocal(new Date())}
        />
      </MarcoSoftware>
    </PortalShell>
  );
}
