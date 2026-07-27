import type { ReactNode } from 'react';
import { PortalNav } from '@/components/portal/PortalNav';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { cn } from '@/lib/utils';
import type { SessionPayload } from '@/lib/session';

export function PortalShell({
  session,
  children,
  theme = 'dark',
}: {
  session: SessionPayload;
  children: ReactNode;
  theme?: 'dark' | 'light';
}) {
  const light = theme === 'light';

  return (
    <div className={cn('relative min-h-screen', light ? 'bg-light-bg text-light-text' : 'bg-bg-primary')}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <FloatingOrb
          color="purple"
          size={480}
          style={{ top: '-10%', left: '-8%', opacity: light ? 0.35 : 1 }}
        />
        <FloatingOrb
          color="pink"
          size={340}
          style={{ bottom: '-6%', right: '-6%', opacity: light ? 0.3 : 1 }}
          delay={5}
        />
      </div>
      {/* La barra superior se mantiene siempre oscura, como ancla visual consistente
          entre zonas claras y oscuras (mismo criterio que el nav de la landing pública). */}
      <div className="relative z-10">
        <PortalNav name={session.name} role={session.role} />
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      </div>
    </div>
  );
}
