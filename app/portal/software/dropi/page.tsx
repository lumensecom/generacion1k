import { PackageSearch } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { AnalisisDropi } from '@/components/portal/software/AnalisisDropi';
import { getGastos } from '@/lib/software-data';

export const metadata = { title: 'Análisis Dropi | Software 1K' };

export default async function DropiPage() {
  const session = await requireSession();

  // La pauta que ya registró en Contabilidad entra como valor de partida para
  // la utilidad neta, en vez de pedirle el mismo dato dos veces.
  const gastos = await getGastos(session.sid, 30);
  const pauta = gastos
    .filter((g) => g.categoria === 'ads_meta' || g.categoria === 'ads_tiktok')
    .reduce((s, g) => s + Number(g.monto), 0);

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Análisis Dropi"
        bajada="Sube el reporte y te digo tu efectividad real, dónde entregas mejor y a quién tienes que escribirle hoy."
        icono={PackageSearch}
        color="#22C55E"
      >
        <AnalisisDropi pautaRegistrada={pauta} />
      </MarcoSoftware>
    </PortalShell>
  );
}
