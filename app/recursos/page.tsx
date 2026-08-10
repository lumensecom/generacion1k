import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { RECURSOS } from '@/lib/recursos-data';

export default function RecursosPage() {
  const disponibles = RECURSOS.filter((r) => r.disponible).length;

  return (
    <main className="relative overflow-hidden">
      <div className="grid-dots pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <FloatingOrb color="purple" size={420} style={{ top: '-6%', left: '-8%' }} />
      <FloatingOrb color="pink" size={320} style={{ top: '12%', right: '-6%' }} delay={4} />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-28">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          Recursos abiertos
        </span>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          Todo lo que sé de ecommerce,{' '}
          <span className="accent-text">sin costo</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
          No es teoría de curso. Es lo que uso todos los días operando mi propia tienda
          de contra entrega en Colombia. Ábrelos en el orden que quieras.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[12px] text-text-muted">
          <span>
            <span className="text-white">{disponibles}</span> disponible
            {disponibles === 1 ? '' : 's'} de {RECURSOS.length}
          </span>
          <span>Sin registro</span>
          <span>Sin correo</span>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 sm:grid-cols-2">
          {RECURSOS.map((recurso) => {
            const card = (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    Recurso {recurso.numero} de {RECURSOS.length}
                  </span>
                  <span
                    className={
                      recurso.disponible
                        ? 'rounded-full border border-brand-purple/40 bg-brand-purple/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-purpleLight'
                        : 'flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted'
                    }
                  >
                    {!recurso.disponible && <Lock size={10} />}
                    {recurso.disponible ? recurso.etiqueta : 'Pronto'}
                  </span>
                </div>

                <h2 className="mt-5 font-display text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
                  {recurso.titulo}
                </h2>
                <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-text-secondary">
                  {recurso.descripcion}
                </p>

                <span
                  className={
                    recurso.disponible
                      ? 'mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-brand-purpleLight'
                      : 'mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-text-muted'
                  }
                >
                  {recurso.disponible ? 'Ver recurso' : 'En construcción'}
                  {recurso.disponible && (
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  )}
                </span>
              </>
            );

            const base =
              'group relative flex flex-col rounded-2xl border p-7 transition-all duration-300';

            return recurso.disponible ? (
              <Link
                key={recurso.slug}
                href={`/recursos/${recurso.slug}`}
                className={`${base} border-border bg-bg-card hover:-translate-y-1 hover:border-brand-purple/50 hover:shadow-[0_18px_44px_rgba(124,58,237,0.16)]`}
              >
                {card}
              </Link>
            ) : (
              <div
                key={recurso.slug}
                className={`${base} border-border/60 bg-bg-card/40 opacity-60`}
              >
                {card}
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">
            ¿Quieres ir más rápido?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-text-secondary">
            Estos recursos te dan el mapa. El acompañamiento 1:1 te dice exactamente
            qué hacer con tu producto, tu tienda y tu presupuesto.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-yellow px-7 font-extrabold text-black transition-colors hover:bg-brand-yellowHover"
          >
            Conoce el programa <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
