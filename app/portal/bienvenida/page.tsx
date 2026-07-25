import { requireSession } from '@/app/portal/actions';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { OnboardingQuiz } from '@/components/portal/OnboardingQuiz';

export const metadata = { title: 'Bienvenida | Portal Generación 1K' };

export default async function BienvenidaPage() {
  const session = await requireSession();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="grid-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <FloatingOrb color="purple" size={420} style={{ top: '4%', right: '4%' }} />
      <FloatingOrb color="amber" size={280} style={{ bottom: '6%', left: '6%' }} delay={3} />

      <div className="relative z-10 mb-10 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          Antes de empezar
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Cuéntanos <span className="accent-text">quién eres</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
          10 preguntas rápidas para que Juan entienda tu punto de partida. Solo toma un par de minutos, y no puedes
          entrar al contenido sin completarlas.
        </p>
      </div>

      <div className="relative z-10">
        <OnboardingQuiz initialName={session.name} />
      </div>
    </main>
  );
}
