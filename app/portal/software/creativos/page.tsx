import { Clapperboard } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { Creativos } from '@/components/portal/software/Creativos';
import { getCreativos, getProductos } from '@/lib/software-data';

export const metadata = { title: 'Creativos y ángulos | Software 1K' };

export default async function CreativosPage() {
  const session = await requireSession();
  const [creativos, productos] = await Promise.all([
    getCreativos(session.sid),
    getProductos(session.sid),
  ]);

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="Creativos y ángulos"
        bajada="Tu banco de hooks, guiones y ángulos. Lo que ganó queda escrito para poder repetirlo, que es lo único que hace escalable un creativo."
        icono={Clapperboard}
        color="#F5C518"
      >
        <Creativos creativos={creativos} productos={productos} />
      </MarcoSoftware>
    </PortalShell>
  );
}
