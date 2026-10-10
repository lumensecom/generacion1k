import { FlaskConical } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { MarcoSoftware } from '@/components/portal/software/MarcoSoftware';
import { AnalisisCampanas } from '@/components/portal/software/AnalisisCampanas';

export const metadata = { title: 'Testeos | Software 1K' };

export default async function TesteosPage() {
  const session = await requireSession();

  return (
    <PortalShell session={session}>
      <MarcoSoftware
        titulo="¿Cuál sigue y cuál apago?"
        bajada="Sube el reporte de tus campañas de testeo y te califico cada una contra los tres puntos críticos del día."
        icono={FlaskConical}
        color="#F59E0B"
      >
        <AnalisisCampanas />
      </MarcoSoftware>
    </PortalShell>
  );
}
