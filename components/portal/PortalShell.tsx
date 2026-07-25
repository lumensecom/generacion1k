import type { ReactNode } from 'react';
import { PortalNav } from '@/components/portal/PortalNav';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import type { SessionPayload } from '@/lib/session';

export function PortalShell({ session, children }: { session: SessionPayload; children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <FloatingOrb color="purple" size={480} style={{ top: '-10%', left: '-8%' }} />
        <FloatingOrb color="pink" size={340} style={{ bottom: '-6%', right: '-6%' }} delay={5} />
      </div>
      <div className="relative z-10">
        <PortalNav name={session.name} role={session.role} />
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      </div>
    </div>
  );
}
