import { Receipt } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { TarjetasResumen } from '@/components/portal/software/TarjetasResumen';
import { GraficaFlujo } from '@/components/portal/software/GraficaFlujo';
import { Contabilidad } from '@/components/portal/software/Contabilidad';
import { PestanasContabilidad } from '@/components/portal/software/PestanasContabilidad';
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
    getIngresos(session.sid, 400),
    getGastos(session.sid, 400),
    getProductos(session.sid),
  ]);

  // Las cifras de arriba miran los últimos 30 días. Se traen 400 porque el
  // cierre de mes compara contra el mes anterior, y con 90 no alcanzaría a
  // haber dos meses completos a principios de mes.
  const corte = claveLocal(new Date(Date.now() - 30 * 86_400_000));
  const resumen = calcularResumen(
    ingresos.filter((i) => i.fecha >= corte),
    gastos.filter((g) => g.fecha >= corte)
  );

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Contabilidad"
        bajada="Cada peso que entra y cada peso que sale, y el cierre de cada mes. Si esto no está al día, todo lo demás son suposiciones."
        icono={Receipt}
        color="#A855F7"
      >
        <PestanasContabilidad
          diario={
            <>
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
            </>
          }
          ingresos={ingresos}
          gastos={gastos}
        />
      </MarcoSoftware>
    </PortalShell>
  );
}
