'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronDown, Code2, Copy, Download, Palette, Type } from 'lucide-react';
import {
  LANDINGS_REFERENCIA,
  PALETA,
  PATRONES,
  REGLAS_CODIGO,
  TIPOGRAFIAS,
} from '@/lib/software-codigo';
import { cn } from '@/lib/utils';

/**
 * El código real de las landings que convierten, con el sistema que las
 * sostiene desenterrado al lado.
 *
 * Copiar el código sirve una vez; entender por qué el botón lleva una sombra
 * sin desenfoque sirve siempre. Por eso la paleta y los patrones van antes que
 * el archivo completo, y el archivo va colapsado.
 */
export function ReferenciaCodigo() {
  return (
    <section className="space-y-8">
      <header>
        <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand-cyan">
          <Code2 className="h-3.5 w-3.5" /> Código real
        </span>
        <h2 className="mt-3 font-display text-[22px] font-extrabold tracking-tight">
          La landing que más me ha convertido
        </h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-text-secondary">
          No es una plantilla: es el código que está corriendo. Abajo está completo para
          copiar, pero antes mira el sistema — es lo que puedes llevarte a cualquier producto.
        </p>
      </header>

      <Paleta />
      <Tipografias />
      <Patrones />
      <Reglas />

      <div className="space-y-4">
        <h3 className="font-display text-[18px] font-extrabold tracking-tight">
          El archivo completo
        </h3>
        {LANDINGS_REFERENCIA.map((l) => (
          <BloqueCodigo key={l.id} landing={l} />
        ))}
      </div>
    </section>
  );
}

function Paleta() {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-display text-[16px] font-extrabold tracking-tight">
        <Palette className="h-4 w-4 text-brand-pink" /> La paleta
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {PALETA.map((g) => (
          <div key={g.titulo} className="rounded-2xl border border-border bg-bg-card p-5">
            <h4 className="text-[14px] font-extrabold">{g.titulo}</h4>
            <p className="mt-1.5 text-[12.5px] leading-snug text-text-muted">{g.nota}</p>
            <ul className="mt-4 space-y-2.5">
              {g.tokens.map((t) => (
                <li key={t.nombre} className="flex items-start gap-3">
                  <span className="mt-0.5 flex flex-shrink-0 gap-1">
                    {muestras(t.valor).map((c, i) => (
                      <span
                        key={i}
                        className="h-5 w-5 rounded-md border border-white/15"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0">
                    <code className="block font-mono text-[11.5px] text-white">{t.valor}</code>
                    <span className="block text-[11.5px] leading-snug text-text-muted">
                      {t.uso}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Saca los hex de un valor que puede traer uno, dos o texto alrededor. */
function muestras(valor: string): string[] {
  return valor.match(/#[0-9A-Fa-f]{6}/g) ?? ['#333333'];
}

function Tipografias() {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-display text-[16px] font-extrabold tracking-tight">
        <Type className="h-4 w-4 text-brand-purpleLight" /> Las fuentes
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {TIPOGRAFIAS.map((f) => (
          <div key={f.familia} className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[14.5px] font-extrabold">{f.familia}</span>
              <code className="font-mono text-[10.5px] text-text-muted">{f.pesos}</code>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">{f.uso}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Patrones() {
  return (
    <div>
      <h3 className="font-display text-[16px] font-extrabold tracking-tight">
        Los patrones que hacen el trabajo
      </h3>
      <div className="mt-4 space-y-3">
        {PATRONES.map((p) => (
          <Patron key={p.id} patron={p} />
        ))}
      </div>
    </div>
  );
}

function Patron({ patron }: { patron: (typeof PATRONES)[number] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={abierto}
      >
        <div className="min-w-0 flex-1">
          <h4 className="text-[14.5px] font-extrabold">{patron.nombre}</h4>
          <p className="mt-1 text-[12.5px] leading-snug text-text-secondary">{patron.queHace}</p>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 flex-shrink-0 text-text-muted transition-transform',
            abierto && 'rotate-180'
          )}
        />
      </button>

      {abierto && (
        <div className="border-t border-border">
          <Codigo texto={patron.fragmento} etiqueta={patron.lenguaje} compacto />
        </div>
      )}
    </div>
  );
}

function Reglas() {
  return (
    <div>
      <h3 className="font-display text-[16px] font-extrabold tracking-tight">
        Reglas que no se rompen
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGLAS_CODIGO.map((r) => (
          <div key={r.titulo} className="rounded-2xl border border-border bg-bg-card p-4">
            <h4 className="text-[13.5px] font-extrabold text-brand-cyan">{r.titulo}</h4>
            <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">{r.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BloqueCodigo({ landing }: { landing: (typeof LANDINGS_REFERENCIA)[number] }) {
  const [abierto, setAbierto] = useState(false);
  const lineas = landing.codigo.split('\n').length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-display text-[16px] font-extrabold tracking-tight">
              {landing.nombre}
            </h4>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
              {landing.ubicacion} · {landing.lenguaje} · {lineas} líneas
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <BotonCopiar texto={landing.codigo} />
            <BotonDescargar
              texto={landing.codigo}
              nombre={`${landing.id}.${landing.lenguaje}`}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {landing.porQueFunciona.map((x) => (
            <li
              key={x}
              className="flex items-start gap-2.5 text-[13px] leading-snug text-text-secondary"
            >
              <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-brand-cyan" />
              {x}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="mt-4 flex items-center gap-2 text-[13px] font-bold text-brand-cyan transition-colors hover:text-white"
          aria-expanded={abierto}
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', abierto && 'rotate-180')} />
          {abierto ? 'Ocultar el código' : 'Ver el código completo'}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-border">
          <Codigo texto={landing.codigo} etiqueta={landing.lenguaje} />
        </div>
      )}
    </div>
  );
}

function Codigo({
  texto,
  etiqueta,
  compacto = false,
}: {
  texto: string;
  etiqueta: string;
  compacto?: boolean;
}) {
  return (
    <div className="relative bg-[#0B0B10]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
          {etiqueta}
        </span>
        <BotonCopiar texto={texto} discreto />
      </div>
      <pre
        className={cn(
          'overflow-auto px-4 py-4 font-mono text-[11.5px] leading-[1.65] text-[#C9D1D9]',
          compacto ? 'max-h-[320px]' : 'max-h-[560px]'
        )}
      >
        <code>{texto}</code>
      </pre>
    </div>
  );
}

function BotonCopiar({ texto, discreto = false }: { texto: string; discreto?: boolean }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(texto).then(
          () => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          },
          () => toast.error('No se pudo copiar.')
        );
      }}
      className={cn(
        'flex items-center gap-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-colors',
        discreto
          ? 'px-2 py-1 text-text-muted hover:text-white'
          : 'border border-border bg-bg-secondary px-3 py-2 text-text-secondary hover:text-white'
      )}
    >
      {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copiado ? 'Copiado' : 'Copiar'}
    </button>
  );
}

function BotonDescargar({ texto, nombre }: { texto: string; nombre: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-secondary px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors hover:text-white"
    >
      <Download className="h-3 w-3" /> Bajar
    </button>
  );
}
