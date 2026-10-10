'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Minus, Trophy } from 'lucide-react';
import {
  calcularCierre,
  comparar,
  mesAnterior,
  mesesConDatos,
  nombreMes,
  type MesClave,
} from '@/lib/cierre-mes';
import { formatearCOP, type SwGasto, type SwIngreso } from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

/**
 * El cierre del mes.
 *
 * El orden es el de un estado de resultados y no el de un tablero: ventas,
 * lo que costó traerlas, lo que quedó bruto, la pauta y al final la utilidad.
 * Así el estudiante ve en qué renglón se le fue la plata, que es la pregunta
 * que de verdad tiene al cerrar el mes.
 */
export function CierreDeMes({
  ingresos,
  gastos,
}: {
  ingresos: SwIngreso[];
  gastos: SwGasto[];
}) {
  const meses = useMemo(() => mesesConDatos(ingresos, gastos), [ingresos, gastos]);
  const [sel, setSel] = useState<MesClave | null>(meses[0] ?? null);

  if (!sel) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card px-6 py-14 text-center">
        <p className="text-[14px] text-text-muted">
          Cuando registres movimientos, aquí se arma el cierre de cada mes.
        </p>
      </div>
    );
  }

  const cierre = calcularCierre(ingresos, gastos, sel);
  const previo = calcularCierre(ingresos, gastos, mesAnterior(sel));
  const comps = comparar(cierre, previo);
  const hayPrevio = previo.ventas > 0 || previo.pauta > 0;

  return (
    <div className="space-y-5">
      {/* Qué mes */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {meses.map((m) => {
          const activo = m.anio === sel.anio && m.mes === sel.mes;
          return (
            <button
              key={`${m.anio}-${m.mes}`}
              type="button"
              onClick={() => setSel(m)}
              className={cn(
                'flex-shrink-0 rounded-xl border px-4 py-2.5 text-[13px] font-bold capitalize transition-colors',
                activo
                  ? 'border-brand-purple/50 bg-brand-purple/15 text-white'
                  : 'border-border bg-bg-card text-text-muted hover:text-white'
              )}
            >
              {nombreMes(m)}
            </button>
          );
        })}
      </div>

      {/* El resultado del mes, en grande */}
      <div
        className={cn(
          'rounded-3xl border p-6 sm:p-8',
          cierre.utilidad >= 0
            ? 'border-brand-success/30 bg-gradient-to-br from-brand-success/[0.07] to-transparent'
            : 'border-brand-danger/30 bg-gradient-to-br from-brand-danger/[0.07] to-transparent'
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          {cierre.utilidad >= 0 ? 'Te quedaron' : 'Perdiste'}
        </span>
        <p
          className={cn(
            'mt-2 font-display text-[40px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[52px]',
            cierre.utilidad >= 0 ? 'text-brand-success' : 'text-brand-danger'
          )}
        >
          {formatearCOP(Math.abs(cierre.utilidad))}
        </p>
        <p className="mt-2 text-[13.5px] text-text-secondary">
          sobre {formatearCOP(cierre.ventas)} vendidos ·{' '}
          <strong className="text-white">{cierre.utilidadPct.toFixed(1)}% de margen neto</strong>
        </p>
      </div>

      {/* El estado de resultados */}
      <div className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
        <h3 className="font-display text-[15px] font-extrabold tracking-tight">
          En qué se fue la plata
        </h3>

        <dl className="mt-5 space-y-1">
          <Renglon concepto="Ventas" monto={cierre.ventas} pct={100} tono="entra" fuerte />

          {cierre.costoDirecto.map((l) => (
            <Renglon key={l.concepto} concepto={l.concepto} monto={-l.monto} pct={l.pctVentas} sangria />
          ))}
          <Renglon
            concepto="Margen bruto"
            monto={cierre.margenBruto}
            pct={cierre.margenBrutoPct}
            fuerte
            separador
          />

          <Renglon concepto="Pauta" monto={-cierre.pauta} pct={cierre.pautaPct} sangria />
          {cierre.otrosGastos.map((l) => (
            <Renglon key={l.concepto} concepto={l.concepto} monto={-l.monto} pct={l.pctVentas} sangria />
          ))}

          <Renglon
            concepto="Utilidad del mes"
            monto={cierre.utilidad}
            pct={cierre.utilidadPct}
            tono={cierre.utilidad >= 0 ? 'entra' : 'sale'}
            fuerte
            separador
          />
        </dl>
      </div>

      {/* Las cifras de operación */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Pedidos" valor={String(cierre.pedidos)} />
        <Dato etiqueta="Ticket promedio" valor={formatearCOP(cierre.ticketPromedio)} />
        <Dato
          etiqueta="ROAS"
          valor={cierre.roas > 0 ? `${cierre.roas.toFixed(2)}x` : '—'}
          tono={cierre.roas >= 2 ? 'bien' : undefined}
        />
        <Dato etiqueta="CPA" valor={cierre.cpa > 0 ? formatearCOP(cierre.cpa) : '—'} />
      </div>

      {cierre.mejorDia && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-yellow/25 bg-brand-yellow/[0.05] px-5 py-4">
          <Trophy className="h-4 w-4 flex-shrink-0 text-brand-yellow" />
          <p className="text-[13.5px] text-text-secondary">
            Tu mejor día fue el <strong className="text-white">{cierre.mejorDia.fecha}</strong> con{' '}
            <strong className="text-white">{formatearCOP(cierre.mejorDia.monto)}</strong>. Tuviste
            movimiento {cierre.diasConVentas} {cierre.diasConVentas === 1 ? 'día' : 'días'} del mes.
          </p>
        </div>
      )}

      {/* Contra el mes pasado */}
      {hayPrevio && (
        <div className="rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
          <h3 className="font-display text-[15px] font-extrabold tracking-tight">
            Contra {nombreMes(mesAnterior(sel))}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comps.map((c) => {
              const subio = c.variacionPct !== null && c.variacionPct > 0.5;
              const bajo = c.variacionPct !== null && c.variacionPct < -0.5;
              const bueno = subio ? c.subirEsBueno : bajo ? !c.subirEsBueno : null;
              return (
                <div key={c.concepto} className="rounded-xl border border-border bg-bg-secondary p-4">
                  <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
                    {c.concepto}
                  </span>
                  <span className="mt-1 block truncate text-[16px] font-extrabold tabular-nums">
                    {c.concepto === 'Pedidos'
                      ? c.ahora.toFixed(0)
                      : formatearCOP(c.ahora)}
                  </span>
                  <span
                    className={cn(
                      'mt-1 flex items-center gap-1 font-mono text-[11px] font-bold',
                      bueno === true && 'text-brand-success',
                      bueno === false && 'text-brand-danger',
                      bueno === null && 'text-text-muted'
                    )}
                  >
                    {c.variacionPct === null ? (
                      <>
                        <Minus className="h-3 w-3" /> sin comparación
                      </>
                    ) : (
                      <>
                        {subio ? <ArrowUp className="h-3 w-3" /> : bajo ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {Math.abs(c.variacionPct).toFixed(0)}%
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Renglon({
  concepto,
  monto,
  pct,
  tono,
  fuerte = false,
  sangria = false,
  separador = false,
}: {
  concepto: string;
  monto: number;
  pct: number;
  tono?: 'entra' | 'sale';
  fuerte?: boolean;
  sangria?: boolean;
  separador?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        separador && 'mt-1 border-t border-border pt-3',
        sangria && 'pl-4'
      )}
    >
      <dt
        className={cn(
          'min-w-0 truncate',
          fuerte ? 'text-[14.5px] font-extrabold text-white' : 'text-[13.5px] text-text-secondary'
        )}
      >
        {concepto}
      </dt>
      <dd className="flex flex-shrink-0 items-baseline gap-3">
        <span className="font-mono text-[11px] text-text-muted">{pct.toFixed(1)}%</span>
        <span
          className={cn(
            'tabular-nums',
            fuerte ? 'text-[16px] font-extrabold' : 'text-[14px] font-bold',
            tono === 'entra' && 'text-brand-success',
            tono === 'sale' && 'text-brand-danger',
            !tono && monto < 0 && 'text-text-secondary',
            !tono && monto >= 0 && 'text-white'
          )}
        >
          {monto < 0 ? '−' : ''}
          {formatearCOP(Math.abs(monto))}
        </span>
      </dd>
    </div>
  );
}

function Dato({ etiqueta, valor, tono }: { etiqueta: string; valor: string; tono?: 'bien' }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card px-4 py-3.5">
      <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
        {etiqueta}
      </span>
      <span
        className={cn(
          'mt-1 block truncate text-[17px] font-extrabold tabular-nums',
          tono === 'bien' ? 'text-brand-cyan' : 'text-white'
        )}
      >
        {valor}
      </span>
    </div>
  );
}
