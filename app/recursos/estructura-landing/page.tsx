import Link from 'next/link';
import { ArrowLeft, Check, X, CircleAlert, Image as ImageIcon, Palette, ListChecks } from 'lucide-react';
import { FloatingOrb } from '@/components/animated/FloatingOrb';
import { BloqueCodigo } from '@/components/recursos/BloqueCodigo';
import {
  BLOQUES_AIDA,
  IMAGENES,
  FAQS_OBLIGATORIAS,
  COLORES,
  ERRORES,
  CHECKLIST,
  AUDITORIAS,
} from '@/lib/landing-lumens';

export const metadata = {
  title: 'Estructura ganadora de landing LUMENS | Recursos Generación 1K',
  description:
    'Los 9 bloques AIDA, las 6 imágenes obligatorias con sus prompts y el checklist, sacados de las landings que ya están convirtiendo en LUMENS Colombia.',
};

const FASES = {
  Atención: '#F87171',
  Interés: '#F59E0B',
  Deseo: '#A855F7',
  Acción: '#22D3EE',
} as const;

export default function EstructuraLandingPage() {
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
          Estructura ganadora de <span className="accent-text">landing LUMENS</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed text-text-secondary sm:text-lg">
          Esta guía sale de analizar las landings que <strong className="text-white">ya están
          convirtiendo</strong> en LUMENS Colombia. Todas siguen la misma estructura AIDA con 6
          imágenes clave. Si respetas esta estructura, la landing convierte. Si la cambias,
          apuestas.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {AUDITORIAS.map((a) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-bg-card px-4 py-3 transition-colors hover:border-brand-purple/50"
            >
              <p className="text-[13.5px] font-bold text-white">{a.producto}</p>
              <p className="mt-1 font-mono text-[12px] text-text-muted">
                <span className="line-through">{a.precioAntes}</span>{' '}
                <span className="text-brand-yellow">{a.precioAhora}</span>{' '}
                <span className="text-brand-success">ahorras {a.ahorro}</span>
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- 1. Los 9 bloques ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          1 · Los 9 bloques, en este orden
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Cada landing tiene esta secuencia exacta. No la alteres.
        </p>

        <div className="mt-8 space-y-4">
          {BLOQUES_AIDA.map((b) => (
            <details
              key={b.n}
              className="group rounded-2xl border border-border bg-bg-card p-5 transition-colors open:border-brand-purple/40"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-bold text-black"
                  style={{ backgroundColor: FASES[b.fase] }}
                >
                  {b.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] font-extrabold leading-tight">
                    {b.nombre}
                  </span>
                  <span className="block text-[13px] text-text-muted">{b.contiene}</span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ backgroundColor: `${FASES[b.fase]}22`, color: FASES[b.fase] }}
                >
                  {b.fase}
                </span>
              </summary>
              <div className="mt-4">
                <BloqueCodigo codigo={b.copy} />
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- 2. Las 6 imágenes ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          <ImageIcon className="h-6 w-6 text-brand-purpleLight" /> 2 · Las 6 imágenes obligatorias
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Todas en <strong className="text-white">WebP</strong>, mínimo{' '}
          <strong className="text-white">1080×1350</strong>, y menos de 200 KB cada una. El prompt
          de cada una está listo: cambia solo la parte del producto.
        </p>

        <div className="mt-8 space-y-4">
          {IMAGENES.map((img) => (
            <details key={img.n} className="group rounded-2xl border border-border bg-bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] font-mono text-[13px] font-bold text-text-secondary">
                  {img.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15.5px] font-extrabold">{img.nombre}</span>
                  <span className="block text-[12.5px] text-text-muted">
                    {img.uso} · {img.ratio}
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-[13.5px] text-text-secondary">
                <span className="font-semibold text-white">Fondo:</span> {img.fondo}
              </p>
              <div className="mt-3">
                <BloqueCodigo codigo={img.prompt} />
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- 3. Auditoría real ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          3 · Las dos landings, auditadas
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Esto no es un ejemplo inventado: se midió sobre el HTML real de las dos páginas. Una
          cumple casi todo y la otra se salta tres cosas — comparar las dos enseña más que ver
          solo la perfecta.
        </p>

        <div className="mt-8 space-y-6">
          {AUDITORIAS.map((a) => (
            <div key={a.url} className="rounded-2xl border border-border bg-bg-card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-extrabold tracking-tight">{a.producto}</h3>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11.5px] text-brand-purpleLight hover:underline"
                >
                  ver la página →
                </a>
              </div>

              <p className="mt-3 rounded-lg bg-bg-secondary/60 px-3 py-2 font-mono text-[12px] text-text-secondary">
                CTA: {a.cta}
              </p>

              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {a.senales.map((s) => (
                  <li key={s.etiqueta} className="flex items-center gap-2 text-[13px]">
                    {s.ok ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0 text-brand-danger" />
                    )}
                    <span className={s.ok ? 'text-text-secondary' : 'text-brand-danger'}>
                      {s.etiqueta}
                      {s.veces !== null && s.veces > 0 && (
                        <span className="ml-1 font-mono text-[11px] text-text-muted">×{s.veces}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {a.falla.length > 0 && (
                <ul className="mt-5 space-y-2.5 border-t border-border pt-4">
                  {a.falla.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-text-secondary">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-5 border-t border-border pt-4 text-[13.5px] leading-relaxed text-white">
                {a.veredicto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 4. FAQ + branding ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          4 · Las 6 FAQ obligatorias
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Van siempre estas seis. Las cuatro últimas ya están redactadas y se copian tal cual.
        </p>
        <div className="mt-6 space-y-3">
          {FAQS_OBLIGATORIAS.map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-[14px] font-bold text-white">
                {i + 1}. {f.p}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{f.r}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          <Palette className="h-5 w-5 text-brand-purpleLight" /> Colores obligatorios
        </h3>
        <div className="mt-4 space-y-2">
          {COLORES.map((c) => (
            <div key={c.hex} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <span
                className="h-7 w-7 shrink-0 rounded-lg border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-white">{c.nombre}</span>
                <span className="block text-[12.5px] text-text-muted">{c.uso}</span>
              </span>
              <code className="shrink-0 font-mono text-[12px] text-text-secondary">{c.hex}</code>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13.5px] leading-relaxed text-text-secondary">
          Titulares en <strong className="text-white">Manrope 700–900</strong>, cuerpo en{' '}
          <strong className="text-white">DM Sans 400–500</strong>, precios en Manrope Bold. El botón
          va siempre así:{' '}
          <code className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[12px] text-brand-yellow">
            [EMOJI] QUIERO MI [PRODUCTO] · PAGO AL RECIBIR
          </code>{' '}
          y debajo, sin excepción, <em>&ldquo;Envío gratis · Pagas cuando llega&rdquo;</em>.
        </p>
      </section>

      {/* ---------- 5. Errores ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          5 · Los 8 errores que ya he visto
        </h2>
        <div className="mt-6 space-y-3">
          {ERRORES.map((e, i) => (
            <div key={i} className="rounded-xl border border-brand-danger/20 bg-brand-danger/[0.04] p-4">
              <p className="flex items-start gap-2 text-[14px] font-bold text-white">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-brand-danger" /> {e.t}
              </p>
              <p className="mt-1.5 pl-6 text-[13.5px] leading-relaxed text-text-secondary">{e.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 6. Checklist ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-24">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          <ListChecks className="h-6 w-6 text-brand-purpleLight" /> 6 · Checklist antes de publicar
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CHECKLIST.map((g) => (
            <div key={g.grupo} className="rounded-2xl border border-border bg-bg-card p-5">
              <p className="font-display text-[15px] font-extrabold">{g.grupo}</p>
              <ul className="mt-3 space-y-2">
                {g.items.map((it) => (
                  <li key={it} className="flex gap-2 text-[13px] leading-relaxed text-text-secondary">
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded border border-border" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-8">
          <h3 className="font-display text-xl font-extrabold tracking-tight">Tu próximo paso</h3>
          <ol className="mt-4 space-y-2 text-[14.5px] leading-relaxed text-text-secondary">
            {[
              'Elige tu producto (margen alto, demanda validada)',
              'Genera las 6 imágenes con los prompts de arriba',
              'Escribe el copy siguiendo los 9 bloques',
              'Pídeme el código base de Shopify',
              'Corre el checklist antes de publicar',
              'Testea con 10-20 personas reales antes de meterle pauta',
            ].map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-brand-purpleLight">{i + 1}.</span> {p}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[13.5px] text-text-muted">
            Cualquier duda me escribes. — Juan Felipe López · Mentor Generación 1K
          </p>
        </div>
      </section>
    </main>
  );
}
