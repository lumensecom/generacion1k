import { Calculator } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { Productos } from '@/components/portal/software/Productos';
import { Calculadora } from '@/components/portal/software/Calculadora';
import { getProductos } from '@/lib/software-data';

export const metadata = { title: 'Productos y costeo | Software 1K' };

export default async function ProductosPage() {
  const session = await requireSession();
  const productos = await getProductos(session.sid);

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Productos y costeo"
        bajada="Ponle precio contando lo que de verdad pasa: los que cancelan, los que devuelven y la pauta que pagaste por todos."
        icono={Calculator}
        color="#22D3EE"
      >
        {/* La calculadora va primero: es la herramienta, y la lista de abajo
            es el archivo de lo que ya costeaste. */}
        <Calculadora />

        <div className="mt-12">
          <h2 className="mb-1 font-display text-[20px] font-extrabold tracking-tight">
            Mis productos
          </h2>
          <p className="mb-6 text-[14px] text-text-secondary">
            Lo que ya costeaste, guardado para volver a mirarlo.
          </p>
          <Productos productos={productos} />
        </div>
      </MarcoSoftware>
    </PortalShell>
  );
}
