import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { BloqueCodigo } from '@/components/recursos/BloqueCodigo';
import {
  PASOS_PREVIOS,
  PROMPT_GEMINI,
  CAMPOS_GEMINI,
  PROMPTS_IMAGENES,
  NOTA_IMAGENES,
} from '@/lib/prompts-ia';
import { PALETA_DEFECTO } from '@/lib/landing-liquid';

export const metadata = {
  title: 'Cómo armar la landing con IA | Recursos Generación 1K',
  description:
    'El paso a paso y los prompts exactos para que Gemini escriba tus bloques Liquid de Shopify y GPT Image genere las imágenes.',
};

export default function LandingConIAPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="grid-dots pointer-events-none absolute inset-x-0 top-0 h-[560px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <FloatingOrb color="purple" size={440} style={{ top: '-8%', right: '-10%' }} />

      <section className="relative mx-auto max-w-3xl px-5 pb-12 pt-16 sm:pt-24">
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={13} /> Recursos
        </Link>

        <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Arma tu landing <span className="accent-text">con IA</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed text-text-secondary sm:text-lg">
          La estructura ya está decidida y probada — es la de{' '}
          <Link href="/recursos/anatomia-landing" className="text-brand-purpleLight underline underline-offset-4">
            la anatomía
          </Link>
          . La IA no inventa la arquitectura de la página, solo la rellena con tu producto,
          tu ángulo y tu paleta. Eso es lo que separa una landing que vende de algo que se
          nota hecho por IA.
        </p>
      </section>

      {/* Paso a paso previo */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
          Antes de pedirle nada a la IA
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Cuatro cosas que tienen que estar listas
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary">
          Si le pides la landing sin esto, vas a recibir una plantilla genérica y
          vas a culpar a la herramienta. El resultado depende casi todo de lo que entra.
        </p>

        <div className="mt-9 space-y-4">
          {PASOS_PREVIOS.map((paso) => (
            <div
              key={paso.numero}
              className="rounded-2xl border border-border bg-bg-card p-6 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-pink font-mono text-[13px] font-bold text-white">
                  {paso.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-extrabold tracking-tight">
                    {paso.titulo}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-text-secondary">
                    {paso.descripcion}
                  </p>
                  <p className="mt-4 rounded-lg border border-brand-success/25 bg-brand-success/[0.07] px-4 py-2.5 text-[13px] font-semibold text-brand-success">
                    Lo que debes tener: {paso.entrega}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Paleta */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          La paleta por defecto, y por qué
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary">
          Si no tienes marca todavía, usa esta. No está elegida por gusto sino por
          función: el acento existe solo para los botones. En el momento en que ese
          color aparece en un ícono decorativo, el ojo deja de asociarlo con
          &ldquo;aquí se hace clic&rdquo; y el botón pierde fuerza.
        </p>

        <div className="mt-7 overflow-hidden rounded-2xl border border-border">
          {PALETA_DEFECTO.map((c) => (
            <div
              key={c.nombre}
              className="flex items-center gap-4 border-b border-border/70 bg-bg-card px-5 py-4 last:border-b-0"
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg border border-white/10"
                style={{ background: c.valor }}
              />
              <div className="min-w-0 flex-1">
                <code className="font-mono text-[12.5px] text-white">{c.valor}</code>
                <p className="mt-0.5 text-[13px] text-text-secondary">{c.uso}</p>
              </div>
              <code className="hidden font-mono text-[11px] text-text-muted sm:block">
                {c.nombre}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Prompt de Gemini */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-brand-purpleLight" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
            Prompt 1 · Gemini
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          El prompt que escribe tus dos bloques
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary">
          Cópialo entero, reemplaza los cuatro huecos y adjunta las fotos de tu producto
          en el mismo mensaje. Devuelve los dos bloques listos para pegar en Shopify.
        </p>

        <div className="mt-7 space-y-3">
          {CAMPOS_GEMINI.map((campo) => (
            <div key={campo.slot} className="rounded-xl border border-border bg-bg-card p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <code className="font-mono text-[12px] font-semibold text-brand-yellow">
                  {campo.slot}
                </code>
                <span className="text-[13px] font-bold text-white">{campo.etiqueta}</span>
              </div>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-muted">
                <span className="text-text-secondary">Ejemplo:</span> {campo.ejemplo}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <BloqueCodigo codigo={PROMPT_GEMINI} lenguaje="texto" alto="max-h-[520px]" />
        </div>
      </section>

      {/* Prompts de imagen */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <div className="flex items-center gap-2.5">
          <ImageIcon size={18} className="text-brand-cyan" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">
            Prompt 2 · GPT Image
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Las seis imágenes que necesitas
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-text-secondary">
          Reemplaza lo que está entre corchetes con los datos de tu producto. Súbelas a
          Shopify antes de pegar el código y copia las URLs.
        </p>

        <div className="mt-5 flex gap-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/[0.07] p-5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-brand-yellow" />
          <p className="text-[13.5px] leading-relaxed text-text-secondary">{NOTA_IMAGENES}</p>
        </div>

        <div className="mt-7 space-y-6">
          {PROMPTS_IMAGENES.map((p) => (
            <div key={p.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-[16px] font-extrabold tracking-tight">
                  {p.nombre}
                </h3>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-text-muted">
                  {p.donde}
                </span>
              </div>
              <BloqueCodigo codigo={p.prompt} lenguaje="texto" alto="max-h-[220px]" />
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-5 pb-24">
        <div className="rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-8 text-center sm:p-10">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">
            ¿Y si no sé qué producto poner?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-text-secondary">
            Ese es el paso anterior, y es el que más gente se salta. Los prompts no
            arreglan un producto que nadie quiere.
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
