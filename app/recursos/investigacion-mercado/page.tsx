import Link from 'next/link';
import { ArrowLeft, Check, X, Clock, Search, MessageSquare, Sparkles, ListChecks } from 'lucide-react';
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
} from '@/lib/investigacion-data';

export const metadata = {
  title: 'Investigación de mercado paso a paso | Recursos Generación 1K',
  description:
    'Cómo validar que un producto ya vende, sacar los ángulos que nadie está usando y convertir comentarios reales en creativos. Con el prompt exacto.',
};

const ICONOS = [Search, MessageSquare, MessageSquare, Sparkles];

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
        return (
          <section key={p.n} className="relative mx-auto max-w-3xl px-5 pb-14">
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
        );
      })}

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
    </main>
  );
}
