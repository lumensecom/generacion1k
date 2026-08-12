import { CalendarClock } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { RevealCard } from '@/components/animated/RevealCard';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { getMentors } from '@/lib/portal-data';
import { VideoPlayer } from '@/components/portal/VideoPlayer';

export const metadata = { title: 'Aliado del programa | Portal Generación 1K' };

export default async function MentoresPage() {
  const session = await requireSession();
  const mentors = await getMentors();

  return (
    <PortalShell session={session} theme="light">
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purple">
          Aliado del programa
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-light-text sm:text-4xl">
          Nuestro <span className="accent-text-light">proveedor aliado</span>
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-light-text2">
          La operación es la parte que hunde a la mayoría de tiendas de contra entrega.
          Por eso trabajamos con un aliado de fulfillment en vez de improvisar los envíos.
        </p>
        <AnimatedDivider className="mt-4" />
      </div>

      <div className="space-y-6">
        {mentors.map((mentor, i) => {
          const urlVideo = mentor.video_url ?? mentor.session_loom_url;
          return (
            <RevealCard key={mentor.id} variant="light" delay={i * 0.08} hover={false} className="overflow-hidden">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
                <div className="flex flex-col justify-center gap-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/25 to-brand-pink/15 font-display text-xl font-extrabold text-brand-purple">
                    {mentor.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-extrabold tracking-tight text-light-text">
                      {mentor.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-brand-purple">{mentor.role}</p>
                  </div>
                  {mentor.bio && <p className="text-sm leading-relaxed text-light-text2">{mentor.bio}</p>}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-light-muted">
                    {mentor.years_experience && <span>{mentor.years_experience}</span>}
                    {mentor.companies && <span>{mentor.companies}</span>}
                    {mentor.session_date && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> {mentor.session_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <VideoPlayer
                    url={urlVideo}
                    titulo={`Sesión de ${mentor.name}`}
                    vacio="Sesión por grabar — vuelve pronto."
                  />
                </div>
              </div>
            </RevealCard>
          );
        })}
      </div>
    </PortalShell>
  );
}
