import { CalendarClock, PlayCircle } from 'lucide-react';
import { requireSession } from '@/app/portal/actions';
import { PortalShell } from '@/components/portal/PortalShell';
import { RevealCard } from '@/components/animated/RevealCard';
import { AnimatedDivider } from '@/components/animated/AnimatedDivider';
import { getMentors } from '@/lib/portal-data';

export const metadata = { title: 'Mentores invitados | Portal Generación 1K' };

function loomEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://www.loom.com/embed/${match[1]}`;
}

export default async function MentoresPage() {
  const session = await requireSession();
  const mentors = await getMentors();

  return (
    <PortalShell session={session}>
      <div className="mb-10">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-purpleLight">
          Mentores invitados
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Aprende de <span className="accent-text">quienes ya lo hicieron</span>
        </h1>
        <AnimatedDivider className="mt-4" />
      </div>

      <div className="space-y-6">
        {mentors.map((mentor, i) => {
          const embedUrl = loomEmbedUrl(mentor.session_loom_url);
          return (
            <RevealCard key={mentor.id} delay={i * 0.08} hover={false} className="overflow-hidden">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
                <div className="flex flex-col justify-center gap-4 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple/30 to-brand-pink/15 font-display text-xl font-extrabold text-white">
                    {mentor.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-extrabold tracking-tight">{mentor.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-brand-purpleLight">{mentor.role}</p>
                  </div>
                  {mentor.bio && <p className="text-sm leading-relaxed text-text-secondary">{mentor.bio}</p>}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-text-muted">
                    {mentor.years_experience && <span>{mentor.years_experience}</span>}
                    {mentor.companies && <span>{mentor.companies}</span>}
                    {mentor.session_date && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" /> {mentor.session_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="aspect-video bg-bg-primary md:aspect-auto">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      frameBorder="0"
                      allowFullScreen
                      className="h-full w-full"
                      title={`Sesión de ${mentor.name}`}
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 text-text-muted">
                      <PlayCircle className="h-8 w-8" />
                      <p className="text-sm">Sesión por grabar — vuelve pronto.</p>
                    </div>
                  )}
                </div>
              </div>
            </RevealCard>
          );
        })}
      </div>
    </PortalShell>
  );
}
