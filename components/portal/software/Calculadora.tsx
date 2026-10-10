'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Info, TriangleAlert } from 'lucide-react';
import {
  CANCELACIONES_POR_DEFECTO,
  DEVOLUCIONES_POR_DEFECTO,
  costear,
  precioParaMargen,
  precioParaUtilidad,
  veredicto,
  type EntradaCosteo,
} from '@/lib/costeo-pce';
import {
  MONEDAS,
  MONEDA_POR_DEFECTO,
  formatear,
  formatearSeco,
  moneda as buscarMoneda,
  valoresIniciales,
} from '@/lib/monedas';
import { cn } from '@/lib/utils';

/**
 * La calculadora de costeo.
 *
 * Tres preguntas, no tres fórmulas: "¿a cuánto lo vendo?", "ya tengo precio"
 * y "quiero que me queden X". Es la misma matemática despejada por distintos
 * lados, pero el estudiante no llega pensando en despejes.
 *
 * Todo se calcula aquí, en el navegador. Ningún número sale del equipo.
 */

type Modo = 'precio' | 'tengo' | 'quiero';

const MODOS: { id: Modo; etiqueta: string }[] = [
  { id: 'precio', etiqueta: '¿A cuánto lo vendo?' },
  { id: 'tengo', etiqueta: 'Ya tengo precio' },
  { id: 'quiero', etiqueta: 'Quiero que me queden…' },
];

export function Calculadora() {
  const [modo, setModo] = useState<Modo>('precio');
  const [monedaId, setMonedaId] = useState(MONEDA_POR_DEFECTO.id);
  const m = buscarMoneda(monedaId);

  const [v, setV] = useState(() => {
    const ini = valoresIniciales(MONEDA_POR_DEFECTO);
    return {
      ...ini,
      fleteDevolucion: ini.flete,
      cancelacionesPct: CANCELACIONES_POR_DEFECTO,
      devolucionesPct: DEVOLUCIONES_POR_DEFECTO,
      margenPct: 25,
      precioManual: 0,
      utilidadDeseada: 0,
    };
  });

  /** Al cambiar de moneda los montos no se convierten: se reescalan a un
   *  arranque creíble en la nueva. Convertirlos exigiría una tasa de cambio
   *  que nadie mantiene y que envejece mal. */
  function cambiarMoneda(id: string) {
    const nueva = buscarMoneda(id);
    const ini = valoresIniciales(nueva);
    setMonedaId(id);
    setV((p) => ({
      ...p,
      ...ini,
      fleteDevolucion: ini.flete,
      precioManual: 0,
      utilidadDeseada: 0,
    }));
  }

  const entrada: EntradaCosteo = {
    costoProducto: v.costoProducto,
    flete: v.flete,
    fleteDevolucion: v.fleteDevolucion,
    cancelacionesPct: v.cancelacionesPct,
    devolucionesPct: v.devolucionesPct,
    cpa: v.cpa,
  };

  // El precio sale de la pregunta que el estudiante escogió.
  const precio = useMemo(() => {
    if (modo === 'precio') return precioParaMargen(entrada, v.margenPct);
    if (modo === 'quiero') return precioParaUtilidad(entrada, v.utilidadDeseada);
    return v.precioManual;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, v]);

  const c = useMemo(() => costear(entrada, precio), [entrada, precio]);
  const ver = veredicto(c, precio);

  return (
    <div className="space-y-5">
      {/* Las tres preguntas */}
      <div className="grid grid-cols-1 gap-1.5 rounded-2xl border border-border bg-bg-secondary p-1.5 sm:grid-cols-3">
        {MODOS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setModo(x.id)}
            className={cn(
              'rounded-xl px-4 py-3 text-[13.5px] font-extrabold transition-colors',
              modo === x.id
                ? 'bg-brand-yellow text-black shadow-[0_0_30px_-8px_rgba(245,158,11,0.6)]'
                : 'text-text-muted hover:text-white'
            )}
          >
            {x.etiqueta}
          </button>
        ))}
      </div>

      {/* El resultado, arriba del todo */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Resultado
          destacado
          etiqueta={modo === 'tengo' ? 'Tu precio' : 'Véndelo a'}
          valor={formatear(precio, m)}
          pie={
            modo === 'tengo'
              ? 'el que ya tienes puesto'
              : `para que te quede ${
                  modo === 'precio'
                    ? `un ${v.margenPct}% de margen`
                    : `${formatear(v.utilidadDeseada, m)} por pedido`
                }`
          }
        />
        <Resultado
          etiqueta="CPA máximo"
          valor={formatear(c.cpaMaximo, m)}
          tono={v.cpa <= c.cpaMaximo ? 'bien' : 'mal'}
          pie={
            v.cpa <= c.cpaMaximo
              ? `hoy vas en ${formatear(v.cpa, m)}, con aire`
              : `hoy vas en ${formatear(v.cpa, m)} — estás por encima`
          }
        />
        <Resultado
          etiqueta="Te queda por pedido"
          valor={formatear(c.utilidadPorEntregado, m)}
          tono={c.rentable ? undefined : 'mal'}
          pie={`${c.embudo.entregados.toFixed(0)} de cada 100 pedidos pagan · margen real ${c.margenPct.toFixed(0)}%`}
        />
      </div>

      {/* El veredicto en una frase */}
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border px-5 py-4',
          ver.tipo === 'vende-y-deja' && 'border-brand-success/30 bg-brand-success/[0.06]',
          ver.tipo === 'apretado' && 'border-brand-yellow/30 bg-brand-yellow/[0.06]',
          ver.tipo === 'no-da' && 'border-brand-danger/30 bg-brand-danger/[0.06]'
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md',
            ver.tipo === 'vende-y-deja' && 'bg-brand-success/20 text-brand-success',
            ver.tipo === 'apretado' && 'bg-brand-yellow/20 text-brand-yellow',
            ver.tipo === 'no-da' && 'bg-brand-danger/20 text-brand-danger'
          )}
        >
          {ver.tipo === 'vende-y-deja' ? <Check className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
        </span>
        <div>
          <h3 className="font-display text-[16px] font-extrabold tracking-tight">{ver.titulo}</h3>
          <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">{ver.detalle}</p>
        </div>
      </div>

      {/* Los números */}
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-extrabold tracking-tight">
            <span className="h-2 w-2 rounded-full bg-brand-yellow" /> Tus números
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {m.codigo} · {m.pais}
          </span>
        </div>

        {/* Monedas */}
        <div className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {MONEDAS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => cambiarMoneda(x.id)}
              className={cn(
                'flex-shrink-0 rounded-xl border px-3.5 py-2 text-left transition-colors',
                monedaId === x.id
                  ? 'border-brand-yellow/50 bg-brand-yellow/12'
                  : 'border-border bg-bg-secondary hover:border-white/20'
              )}
            >
              <span
                className={cn(
                  'block font-mono text-[11.5px] font-bold',
                  monedaId === x.id ? 'text-brand-yellow' : 'text-text-secondary'
                )}
              >
                {x.codigo}
              </span>
              <span className="mt-0.5 block whitespace-nowrap font-mono text-[9px] uppercase tracking-wider text-text-muted">
                {x.pais}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
          <Deslizador
            etiqueta="Precio del proveedor"
            valor={v.costoProducto}
            onChange={(n) => setV((p) => ({ ...p, costoProducto: n }))}
            max={m.techo}
            paso={m.paso}
            formato={(n) => formatear(n, m)}
          />
          <Deslizador
            etiqueta="Flete de ida"
            valor={v.flete}
            onChange={(n) => setV((p) => ({ ...p, flete: n, fleteDevolucion: n }))}
            max={m.techo / 2}
            paso={m.paso}
            formato={(n) => formatear(n, m)}
          />
          <Deslizador
            etiqueta="% cancelaciones"
            ayuda="De cada 100 pedidos, cuántos se caen antes de que salga el paquete. La pauta ya la pagaste."
            valor={v.cancelacionesPct}
            onChange={(n) => setV((p) => ({ ...p, cancelacionesPct: n }))}
            max={80}
            paso={1}
            formato={(n) => `${n} %`}
          />
          <Deslizador
            etiqueta="% devoluciones"
            ayuda="De los que sí se despachan, cuántos vuelven. Pagas ida y vuelta y no entra un peso."
            valor={v.devolucionesPct}
            onChange={(n) => setV((p) => ({ ...p, devolucionesPct: n }))}
            max={80}
            paso={1}
            formato={(n) => `${n} %`}
          />
          <Deslizador
            etiqueta="CPA en el administrador"
            ayuda="Lo que te cuesta cada pedido en Meta. Se paga por pedido generado, incluidos los que cancelan."
            valor={v.cpa}
            onChange={(n) => setV((p) => ({ ...p, cpa: n }))}
            max={m.techo / 2}
            paso={m.paso}
            formato={(n) => formatear(n, m)}
          />

          {modo === 'precio' && (
            <Deslizador
              etiqueta="Margen que quiero"
              valor={v.margenPct}
              onChange={(n) => setV((p) => ({ ...p, margenPct: n }))}
              min={5}
              max={70}
              paso={1}
              formato={(n) => `${n} %`}
            />
          )}
          {modo === 'tengo' && (
            <Deslizador
              etiqueta="Mi precio de venta"
              valor={v.precioManual}
              onChange={(n) => setV((p) => ({ ...p, precioManual: n }))}
              max={m.techo * 2}
              paso={m.paso}
              formato={(n) => formatear(n, m)}
            />
          )}
          {modo === 'quiero' && (
            <Deslizador
              etiqueta="Lo que quiero que me quede"
              valor={v.utilidadDeseada}
              onChange={(n) => setV((p) => ({ ...p, utilidadDeseada: n }))}
              max={m.techo}
              paso={m.paso}
              formato={(n) => formatear(n, m)}
            />
          )}
        </div>

        <p className="mt-6 flex items-start gap-2.5 border-t border-border pt-4 text-[12.5px] leading-relaxed text-text-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-yellow" />
          <span>
            Costea con <strong className="text-text-secondary">25% de cancelaciones y 25% de
            devoluciones</strong>: a la mitad de lo que pidas le toca llegar y pagar. Si tus
            números salen mejores, ganas más de lo que costeaste. Si costeas con los números
            bonitos, te quiebras.
          </span>
        </p>
      </div>

      <Embudo costeo={c} moneda={m} precio={precio} />
    </div>
  );
}

/** De 100 pedidos, a dónde se fue cada uno y qué cuesta el que sí llega. */
function Embudo({
  costeo,
  moneda: m,
  precio,
}: {
  costeo: ReturnType<typeof costear>;
  moneda: ReturnType<typeof buscarMoneda>;
  precio: number;
}) {
  const e = costeo.embudo;
  const tramos = [
    { n: e.entregados, etiqueta: 'pagan', color: '#10B981' },
    { n: e.devueltos, etiqueta: 'se devuelven', color: '#F87171' },
    { n: e.cancelados, etiqueta: 'cancelan', color: '#75757F' },
  ];

  const partes = [
    { etiqueta: 'Producto', v: costeo.desglose.producto },
    { etiqueta: 'Flete de ida', v: costeo.desglose.fleteIda },
    { etiqueta: 'Fletes de devolución', v: costeo.desglose.fleteVuelta },
    { etiqueta: 'Pauta', v: costeo.desglose.pauta },
  ].filter((x) => x.v > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h3 className="font-display text-[15px] font-extrabold tracking-tight">
          De cada 100 pedidos
        </h3>

        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-bg-secondary">
          {tramos.map((t) => (
            <div key={t.etiqueta} style={{ width: `${t.n}%`, backgroundColor: t.color }} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {tramos.map((t) => (
            <li key={t.etiqueta} className="flex items-center gap-2.5 text-[13px]">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
              <strong className="tabular-nums">{t.n.toFixed(0)}</strong>
              <span className="text-text-secondary">{t.etiqueta}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-border pt-3 text-[12.5px] leading-relaxed text-text-muted">
          Sólo esos <strong className="text-text-secondary">{e.entregados.toFixed(0)}</strong> dejan
          plata, pero los otros {(100 - e.entregados).toFixed(0)} ya te costaron. Esa es tu
          efectividad real: <strong className="text-text-secondary">{e.efectividadReal.toFixed(0)}%</strong>.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h3 className="font-display text-[15px] font-extrabold tracking-tight">
          Qué cuesta un pedido que sí llega
        </h3>

        <dl className="mt-4 space-y-2.5 text-[13px]">
          {partes.map((x) => (
            <div key={x.etiqueta} className="flex items-baseline justify-between gap-3">
              <dt className="text-text-muted">{x.etiqueta}</dt>
              <dd className="font-bold tabular-nums text-text-secondary">{formatear(x.v, m)}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
            <dt className="font-bold text-white">Total</dt>
            <dd className="text-[16px] font-extrabold tabular-nums text-brand-yellow">
              {formatear(costeo.costoPorEntregado, m)}
            </dd>
          </div>
        </dl>

        {costeo.desglose.pauta > 0 && (
          <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-[12px] leading-snug text-text-muted">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-yellow" />
            <span>
              Mira la pauta: pagas {formatearSeco(costeo.desglose.pauta, m)} por cada venta que
              cobras, no lo que marca el administrador. Es lo que cuesta pagarle también a los que
              cancelan.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function Resultado({
  etiqueta,
  valor,
  pie,
  destacado = false,
  tono,
}: {
  etiqueta: string;
  valor: string;
  pie: string;
  destacado?: boolean;
  tono?: 'bien' | 'mal';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-5 py-4',
        destacado
          ? 'border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/[0.09] to-transparent'
          : 'border-border bg-bg-card'
      )}
    >
      <span className="block text-[13.5px] font-extrabold">{etiqueta}</span>
      <span
        className={cn(
          'mt-1.5 block font-display font-extrabold leading-none tracking-tight tabular-nums',
          destacado ? 'text-[38px] text-brand-yellow' : 'text-[30px]',
          tono === 'mal' && 'text-brand-danger',
          tono === 'bien' && !destacado && 'text-white'
        )}
      >
        {valor}
      </span>
      <span className="mt-2 block font-mono text-[10.5px] leading-snug text-text-muted">{pie}</span>
    </div>
  );
}

function Deslizador({
  etiqueta,
  ayuda,
  valor,
  onChange,
  min = 0,
  max,
  paso,
  formato,
}: {
  etiqueta: string;
  ayuda?: string;
  valor: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  paso: number;
  formato: (n: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-text-secondary">{etiqueta}</span>
        {/* Se puede arrastrar o escribir: con pesos colombianos el deslizador
            solo es muy impreciso. */}
        <input
          type="text"
          inputMode="numeric"
          value={formato(valor)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d.]/g, ''));
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          className="w-[108px] border-b border-dashed border-border bg-transparent pb-0.5 text-right font-mono text-[14px] font-bold text-white outline-none transition-colors focus:border-brand-yellow"
          aria-label={etiqueta}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={Math.min(max, Math.max(min, valor))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5 w-full accent-brand-yellow"
        aria-label={etiqueta}
      />
      {ayuda && <p className="mt-1.5 text-[11px] leading-snug text-text-muted">{ayuda}</p>}
    </div>
  );
}
