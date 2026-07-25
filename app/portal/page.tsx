import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { AccessGate } from '@/components/portal/AccessGate';

export const metadata = { title: 'Acceso | Portal Generación 1K' };

export default function PortalAccessPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div className="grid-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <FloatingOrb color="purple" size={420} style={{ top: '8%', left: '8%' }} />
      <FloatingOrb color="pink" size={320} style={{ bottom: '10%', right: '6%' }} delay={4} />

      <div className="relative z-10 mb-10 flex flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink font-display text-xl font-extrabold text-white">
          1K
        </div>
        <span className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          Portal privado de estudiantes
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Generación <span className="accent-text">1K Elite</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm text-text-secondary">
          Este espacio es solo para estudiantes activos del programa 1:1. Si tienes tu clave de acceso, entra abajo.
        </p>
      </div>

      <div className="relative z-10">
        <AccessGate />
      </div>

      <p className="relative z-10 mt-10 max-w-sm text-center text-xs text-text-muted">
        ¿Problemas para entrar? Escríbele directo a Juan por WhatsApp.
      </p>
    </main>
  );
}
