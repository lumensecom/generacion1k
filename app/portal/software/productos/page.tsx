import { Calculator } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { Productos } from '@/components/portal/software/Productos';
import { getProductos } from '@/lib/software-data';

export const metadata = { title: 'Productos y costeo | Software 1K' };

export default async function ProductosPage() {
  const session = await requireSession();
  const productos = await getProductos(session.sid);

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Productos y costeo"
        bajada="Lo que te deja un producto de verdad, cuando le restas las devoluciones y la pauta. Casi siempre es menos de lo que parece."
        icono={Calculator}
        color="#22D3EE"
      >
        <Productos productos={productos} />
      </MarcoSoftware>
    </PortalShell>
  );
}
