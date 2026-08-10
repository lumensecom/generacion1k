import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { AnatomiaLanding } from '@/components/recursos/AnatomiaLanding';
import { BLOQUES, TEMPERATURAS } from '@/lib/recursos-data';

export const metadata = {
  title: 'Anatomía de una landing que vende | Recursos Generación 1K',
  description:
    'Las 14 secciones de una página de ventas de contra entrega, en orden, y por qué cada una está donde está.',
};

export default function AnatomiaLandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="grid-dots pointer-events-none absolute inset-x-0 top-0 h-[600px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <FloatingOrb color="purple" size={460} style={{ top: '-8%', right: '-10%' }} />
      <FloatingOrb color="cyan" size={300} style={{ top: '30%', left: '-8%' }} delay={5} />

      <section className="relative mx-auto max-w-4xl px-5 pb-10 pt-16 sm:pt-24">
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={13} /> Recursos
        </Link>

        <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Anatomía de una landing{' '}
          <span className="accent-text">que vende</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Una página de ventas no es una lista de secciones bonitas: es un orden.
          Arriba va lo que necesita quien ya viene decidido, abajo lo que necesita
          quien acaba de llegar del anuncio y todavía no confía en ti.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          {(['hot', 'tibio', 'frio'] as const).map((t) => (
            <div
              key={t}
              className="flex items-center gap-2.5 rounded-full border border-border bg-bg-card px-4 py-2.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: TEMPERATURAS[t].color }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white">
                {TEMPERATURAS[t].etiqueta}
              </span>
              <span className="text-[12.5px] text-text-muted">
                {TEMPERATURAS[t].descripcion}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Escenario interactivo */}
      <AnatomiaLanding />

      {/* Índice plano: sirve de navegación alterna y de resumen imprimible */}
      <section className="relative mx-auto max-w-4xl px-5 py-24">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          El orden completo
        </span>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Las {BLOQUES.length} secciones, de arriba abajo
        </h2>

        <ol className="mt-10 space-y-px overflow-hidden rounded-2xl border border-border">
          {BLOQUES.map((bloque, i) => (
            <li
              key={bloque.id}
              className="flex items-start gap-4 bg-bg-card px-5 py-5 transition-colors hover:bg-bg-card/60 sm:px-7"
            >
              <span className="mt-[3px] font-mono text-[12px] text-text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="font-display text-[16px] font-extrabold tracking-tight">
                    {bloque.nombre}
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em]"
                    style={{
                      color: TEMPERATURAS[bloque.temperatura].color,
                      background: `${TEMPERATURAS[bloque.temperatura].color}18`,
                    }}
                  >
                    {TEMPERATURAS[bloque.temperatura].etiqueta}
                  </span>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-text-secondary">
                  {bloque.resumen}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">
            Esto es el mapa. Falta tu producto.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-text-secondary">
            Saber el orden es la mitad. La otra mitad es qué poner en cada bloque
            para lo que tú vendes — y eso se decide caso por caso.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-yellow px-7 font-extrabold text-black transition-colors hover:bg-brand-yellowHover"
          >
            Agenda tu llamada <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
