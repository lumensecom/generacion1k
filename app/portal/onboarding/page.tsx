import { requireSession } from '@/app/portal/actions';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { OnboardingVideo } from '@/components/portal/OnboardingVideo';
import { getPortalConfig } from '@/lib/portal-data';

export const metadata = { title: 'Bienvenido | Portal Generación 1K' };

// La segunda puerta, después del cuestionario. El enlace del video vive en
// portal_config y no en el código: Juan lo cambia desde el panel de admin sin
// que haya que desplegar nada.
export default async function OnboardingPage() {
  const session = await requireSession();
  const url = await getPortalConfig('onboarding_video_url');
  const nombre = session.name.split(' ')[0] || session.name;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="grid-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <FloatingOrb color="purple" size={420} style={{ top: '2%', right: '6%' }} />
      <FloatingOrb color="amber" size={300} style={{ bottom: '4%', left: '4%' }} delay={3} />

      <div className="relative z-10 mb-9 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          Empieza aquí
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-[42px] sm:leading-[1.1]">
          Bienvenido a <span className="accent-text">Generación 1K Elite</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-text-secondary">
          ¡Qué gusto tenerte aquí, {nombre}! 🙌 Aquí encontrarás todo lo que necesitas para aprender
          a vender con dropshipping desde cero y llevar tu negocio al siguiente nivel. Te guiaré
          paso a paso con estrategias probadas, consejos prácticos y apoyo constante para que
          puedas construir una tienda exitosa y rentable.
        </p>
      </div>

      <div className="relative z-10 flex w-full justify-center">
        <OnboardingVideo url={url} nombre={nombre} />
      </div>
    </main>
  );
}
