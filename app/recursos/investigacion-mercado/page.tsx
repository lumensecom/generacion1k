import Link from 'next/link';
import {
  ArrowLeft, Check, X, Clock, Search, MessageSquare, Sparkles, ListChecks,
  ArrowRight, Bot, ExternalLink,
} from 'lucide-react';
import { BloqueCodigo } from '@/components/recursos/BloqueCodigo';
import {
  EmbudoValidacion,
  BibliotecaAnotada,
  IcebergDelDolor,
  FlujoDatosAngulos,
  ComparativaAngulos,
} from '@/components/recursos/GraficosInvestigacion';
import {
  PASOS,
  PROMPT_ANGULOS,
  ERRORES_INVESTIGACION,
  CHECKLIST_FINAL,
  IAS,
  CONSEJO_IA,
} from '@/lib/investigacion-data';

export const metadata = {
  title: 'Investigación de mercado paso a paso | Recursos Generación 1K',
  description:
    'Cómo validar que un producto ya vende, sacar los ángulos que nadie está usando y convertir comentarios reales en creativos. Con el prompt exacto.',
};

const ICONOS = [Search, MessageSquare, MessageSquare, Sparkles];

/**
 * Franja de ancho completo con fondo propio, para que la página no sea un
 * negro corrido de arriba abajo. El contenido sigue centrado y al mismo
 * ancho: cambia el fondo, no el formato.
 */
function Banda({
  tono = 'liso',
  children,
}: {
  tono?: 'liso' | 'morado' | 'carta';
  children: React.ReactNode;
}) {
  const fondos = {
    liso: '',
    morado:
      'bg-[radial-gradient(90%_80%_at_20%_0%,rgba(124,58,237,0.16),transparent_62%),radial-gradient(80%_70%_at_88%_100%,rgba(168,85,247,0.10),transparent_60%)]',
    carta: 'bg-bg-secondary/60 border-y border-border/60',
  };
  return <div className={`relative ${fondos[tono]}`}>{children}</div>;
}

export default function InvestigacionMercadoPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="grid-dots pointer-events-none absolute inset-x-0 top-0 h-[560px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      {/* ---------- Entrada ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-10 pt-16 sm:pt-24">
        <Link
          href="/recursos"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={13} /> Recursos
        </Link>

        <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Investiga antes de <span className="accent-text">vender</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed text-text-secondary sm:text-lg">
          Casi todo el mundo elige un producto porque le gustó, y después busca datos que le den
          la razón. Esto es al revés: primero compruebas que{' '}
          <strong className="text-white">ya vende</strong>, después descubres{' '}
          <strong className="text-white">por qué lo compran</strong>, y solo al final escribes el
          anuncio. Unas tres horas, y te ahorra quemar presupuesto probando a ciegas.
        </p>

        <EmbudoValidacion />
      </section>

      {/* ---------- Los 4 pasos ---------- */}
      {PASOS.map((p, i) => {
        const Icono = ICONOS[i];
        const tono = (['liso', 'morado', 'carta', 'morado'] as const)[i];
        return (
          <Banda key={p.n} tono={tono}>
          <section className="relative mx-auto max-w-3xl px-5 py-14">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purpleLight">
                <Icono className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-brand-purpleLight">
                  Paso {p.n} · {p.fase}
                </span>
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {p.titulo}
                </h2>
              </div>
              <span className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] text-text-muted">
                <Clock className="h-3 w-3" /> {p.tiempo}
              </span>
            </div>

            <p className="mt-5 text-[15px] leading-relaxed text-text-secondary">{p.objetivo}</p>

            {i === 0 && <BibliotecaAnotada />}
            {i === 1 && <IcebergDelDolor />}
            {i === 3 && <FlujoDatosAngulos />}

            <ol className="mt-6 space-y-2.5">
              {p.pasos.map((paso, j) => (
                <li key={j} className="flex gap-3 text-[14.5px] leading-relaxed text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.07] font-mono text-[11px] text-text-muted">
                    {j + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-success/25 bg-brand-success/[0.05] p-4">
                <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-success">
                  <Check className="h-3.5 w-3.5" /> Buena señal
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{p.senales.buena}</p>
              </div>
              <div className="rounded-xl border border-brand-danger/25 bg-brand-danger/[0.05] p-4">
                <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-danger">
                  <X className="h-3.5 w-3.5" /> Mala señal
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{p.senales.mala}</p>
              </div>
            </div>

            {i === 3 && (
              <div className="mt-8">
                <p className="mb-3 font-display text-[15px] font-extrabold">El prompt, tal cual</p>
                <BloqueCodigo codigo={PROMPT_ANGULOS} lenguaje="texto" alto="max-h-[420px]" />
              </div>
            )}
          </section>
          </Banda>
        );
      })}

      {/* ---------- Con qué IA ---------- */}
      <Banda tono="carta">
        <section className="relative mx-auto max-w-3xl px-5 py-14">
          <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            <Bot className="h-6 w-6 text-brand-purpleLight" /> ¿Con cuál de las tres?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
            La tarea es leer muchísimo texto crudo y encontrar lo que se repite. Lo que más pesa,
            entonces, no es cuál escribe más bonito: es{' '}
            <strong className="text-white">cuánto texto aguanta de una sola vez</strong>. Un modelo
            brillante al que tienes que darle los comentarios en cinco tandas pierde justo lo que
            buscas — ver que la misma queja aparece cuarenta veces.
          </p>

          <div className="mt-8 space-y-4">
            {IAS.map((ia) => (
              <div
                key={ia.nombre}
                className={`rounded-2xl border p-5 ${
                  ia.destacado
                    ? 'border-brand-purple/40 bg-brand-purple/[0.07]'
                    : 'border-border bg-bg-card'
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg font-extrabold tracking-tight">{ia.nombre}</h3>
                  {ia.destacado && (
                    <span className="rounded-full bg-brand-purple px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-white">
                      empieza por aquí
                    </span>
                  )}
                  <span className="text-[13px] text-text-muted">{ia.paraQue}</span>
                  <a
                    href={ia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 font-mono text-[11.5px] text-brand-purpleLight hover:underline"
                  >
                    abrir <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-text-secondary">{ia.fuerte}</p>
                <p className="mt-2.5 flex gap-2 text-[13px] leading-relaxed text-text-muted">
                  <span className="text-brand-yellow">Ojo:</span> {ia.ojo}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-xl border border-brand-yellow/25 bg-brand-yellow/[0.06] p-5 text-[14px] leading-relaxed text-text-secondary">
            {CONSEJO_IA}
          </p>
        </section>
      </Banda>

      {/* ---------- El resultado ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          En qué se nota que lo hiciste bien
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Los dos anuncios venden lo mismo. Uno sale de suponer; el otro, de haber leído
          cuatrocientos comentarios.
        </p>
        <ComparativaAngulos />
      </section>

      {/* ---------- Errores ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Los 5 errores que lo arruinan
        </h2>
        <div className="mt-6 space-y-3">
          {ERRORES_INVESTIGACION.map((e, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-5">
              <p className="flex items-start gap-2 font-display text-[15px] font-extrabold text-white">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-brand-danger" /> {e.t}
              </p>
              <p className="mt-2 pl-6 text-[13.5px] leading-relaxed text-text-secondary">{e.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Checklist ---------- */}
      <section className="relative mx-auto max-w-3xl px-5 pb-24">
        <div className="rounded-2xl border border-brand-purple/25 bg-gradient-to-b from-brand-purple/[0.08] to-transparent p-7 sm:p-9">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
            <ListChecks className="h-5 w-5 text-brand-purpleLight" /> Antes de gastar el primer peso
          </h2>
          <ul className="mt-5 space-y-2.5">
            {CHECKLIST_FINAL.map((c) => (
              <li key={c} className="flex gap-3 text-[14px] leading-relaxed text-text-secondary">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-border pt-5 text-[13.5px] leading-relaxed text-text-muted">
            Si hay una casilla sin marcar, todavía estás adivinando. — Juan Felipe López
          </p>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <Banda tono="morado">
        <section className="relative mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-purpleLight">
            El siguiente paso
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl">
            Esto es lo que hago{' '}
            <span className="accent-text">contigo</span> en la primera semana
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-text-secondary">
            Acabas de leer el método. Hacerlo solo la primera vez cuesta: sabes buscar los datos,
            pero todavía no sabes cuáles pesan. En el acompañamiento 1:1 esa parte no la adivinas.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ['Reviso tu investigación contigo', 'Miramos juntos los anuncios que encontraste y te digo cuáles son señal y cuáles ruido.'],
              ['Elegimos el producto con criterio', 'No el que más te gusta: el que aguanta los tres filtros y deja margen para pagar pauta.'],
              ['Salen los ángulos de tus datos', 'Trabajamos tu documento real, no un ejemplo. Los ángulos salen de lo que tus clientes escribieron.'],
              ['Los convertimos en creativos', 'Cada ángulo con su formato, su hook y su guion, listos para grabar.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-bg-card/70 p-4">
                <p className="flex items-start gap-2 font-display text-[14.5px] font-extrabold text-white">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" /> {t}
                </p>
                <p className="mt-2 pl-6 text-[13px] leading-relaxed text-text-muted">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 rounded-2xl border border-border bg-bg-card/60 p-6">
            <p className="text-[14px] leading-relaxed text-text-secondary">
              Son <strong className="text-white">tres clases grupales en vivo cada semana</strong> —
              martes, jueves y domingo— más{' '}
              <strong className="text-white">una sesión 1:1 conmigo</strong> que pides cuando la
              necesitas. Desde <strong className="text-white">$350 USD</strong> por 3 meses.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://calendly.com/juanfelipelopezlara3/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-brand-yellow px-7 font-display font-extrabold text-black transition-colors hover:bg-brand-yellowHover"
              >
                Agenda una llamada gratis <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-border px-6 text-[14px] font-bold text-text-secondary transition-colors hover:border-brand-purple/50 hover:text-white"
              >
                Ver el programa completo
              </Link>
            </div>
            <p className="mt-4 text-[12.5px] text-text-muted">
              Sin compromiso · Cupos limitados a 5 personas al mes porque el acompañamiento es 1:1
            </p>
          </div>
        </section>
      </Banda>
    </main>
  );
}
