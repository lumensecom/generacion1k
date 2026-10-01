'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
  UploadCloud,
} from 'lucide-react';
import {
  BUCKET_COLORS,
  BUCKET_LABELS,
  buildDataset,
  computeKpis,
  daysPending,
  netUtility,
  normalizePhone,
  topCities,
  weeklySeries,
  type DropiDataset,
} from '@/lib/software-dropi';
import { formatearCOP } from '@/lib/software-costeo';
import { cn } from '@/lib/utils';

/**
 * Análisis del reporte de Dropi.
 *
 * Todo pasa en el navegador: el .xlsx no se sube a ningún lado. Los pedidos de
 * un estudiante traen nombres, teléfonos y direcciones de sus clientes, y no
 * hay ninguna razón para que eso toque nuestro servidor.
 *
 * Lo que de verdad saca este módulo es un número: la efectividad real. En
 * Productos esa cifra se teclea a ojo, y aquí sale del reporte. Con ella el
 * costeo deja de ser una estimación.
 */
export function AnalisisDropi({ pautaRegistrada }: { pautaRegistrada: number }) {
  const [dataset, setDataset] = useState<DropiDataset | null>(null);
  const [archivo, setArchivo] = useState('');
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pauta, setPauta] = useState(pautaRegistrada);

  async function leer(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLeyendo(true);
    try {
      // Carga diferida: la librería pesa y sólo hace falta cuando hay archivo.
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { cellDates: true });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const grid = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
        header: 1,
        blankrows: false,
        defval: '',
      });
      const ds = buildDataset(grid as unknown[][]);
      if (ds.orders.length === 0) {
        setError('No encontré pedidos en ese archivo. ¿Es el export de Dropi?');
        return;
      }
      setDataset(ds);
      setArchivo(file.name);
    } catch {
      setError('No pude leer el archivo. Tiene que ser el .xlsx que descargas de Dropi.');
    } finally {
      setLeyendo(false);
    }
  }

  if (!dataset) {
    return <Cargador onArchivo={leer} leyendo={leyendo} error={error} />;
  }

  return (
    <Resultados
      dataset={dataset}
      archivo={archivo}
      pauta={pauta}
      onPauta={setPauta}
      onOtroArchivo={leer}
      leyendo={leyendo}
    />
  );
}

function Cargador({
  onArchivo,
  leyendo,
  error,
}: {
  onArchivo: (f: File | undefined) => void;
  leyendo: boolean;
  error: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [encima, setEncima] = useState(false);

  return (
    <div className="mx-auto max-w-xl">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          onArchivo(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-all',
          encima
            ? 'border-brand-success bg-brand-success/10'
            : 'border-border hover:border-brand-success/50 hover:bg-white/[0.02]'
        )}
      >
        <input
          ref={input}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => onArchivo(e.target.files?.[0])}
        />
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-success/12 text-brand-success">
          {leyendo ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-7 w-7" />
          )}
        </span>
        <div>
          <h3 className="font-display text-[17px] font-extrabold tracking-tight">
            Sube tu reporte de Dropi
          </h3>
          <p className="mt-1.5 text-[13.5px] text-text-secondary">
            Arrastra el .xlsx o toca para buscarlo
          </p>
        </div>
        <p className="max-w-sm text-[11.5px] leading-snug text-text-muted">
          El archivo se lee en tu navegador y no se sube a ningún lado. Los datos de tus
          clientes no salen de tu computador.
        </p>
      </button>

      {error && (
        <p className="mt-3 rounded-xl border border-brand-danger/25 bg-brand-danger/[0.07] px-4 py-3 text-center text-[13px] text-brand-danger">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-bg-card p-5">
        <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Dónde sacarlo
        </h4>
        <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
          En Dropi: <strong className="text-white">Mis órdenes → Exportar</strong>. Baja el
          Excel del rango de fechas que quieras revisar y súbelo aquí tal cual, sin abrirlo ni
          tocarle nada.
        </p>
      </div>
    </div>
  );
}

function Resultados({
  dataset,
  archivo,
  pauta,
  onPauta,
  onOtroArchivo,
  leyendo,
}: {
  dataset: DropiDataset;
  archivo: string;
  pauta: number;
  onPauta: (n: number) => void;
  onOtroArchivo: (f: File | undefined) => void;
  leyendo: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  const kpis = useMemo(() => computeKpis(dataset.orders), [dataset]);
  const semanas = useMemo(() => weeklySeries(dataset.orders), [dataset]);
  const ciudades = useMemo(() => topCities(dataset.orders, 6), [dataset]);
  const pendientes = useMemo(
    () =>
      dataset.orders
        .filter((o) => o.bucket === 'pending')
        .sort((a, b) => daysPending(b.date) - daysPending(a.date))
        .slice(0, 25),
    [dataset]
  );

  const neta = netUtility(kpis, { meta: pauta, tiktok: 0, otros: 0 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card px-5 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold">{archivo}</p>
          <p className="font-mono text-[10.5px] text-text-muted">
            {dataset.orders.length} pedidos
            {dataset.minDate && dataset.maxDate && ` · ${dataset.minDate} a ${dataset.maxDate}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-[12.5px] font-bold text-text-secondary transition-colors hover:text-white"
        >
          <input
            ref={input}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => onOtroArchivo(e.target.files?.[0])}
          />
          {leyendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          Otro archivo
        </button>
      </div>

      {dataset.unmatchedColumns.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl border border-brand-yellow/25 bg-brand-yellow/[0.06] px-4 py-3 text-[12.5px] leading-snug text-text-secondary">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-yellow" />
          No encontré estas columnas: <strong>{dataset.unmatchedColumns.join(', ')}</strong>. Las
          cifras que dependen de ellas van a salir en cero.
        </p>
      )}

      {/* La efectividad real: el número que conecta esto con el costeo. */}
      <Efectividad tasa={kpis.deliveryRate} devoluciones={kpis.returnRate} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi etiqueta="Pedidos" valor={String(kpis.total)} />
        <Kpi etiqueta="Entregados" valor={String(kpis.delivered)} tono="text-brand-success" />
        <Kpi etiqueta="En tránsito" valor={String(kpis.inTransit)} tono="text-brand-cyan" />
        <Kpi etiqueta="Por confirmar" valor={String(kpis.pending)} tono="text-brand-yellow" />
        <Kpi etiqueta="Devueltos" valor={String(kpis.returned)} tono="text-brand-danger" />
        <Kpi etiqueta="Cancelados" valor={String(kpis.cancelled)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="font-display text-[15px] font-extrabold tracking-tight">
            Lo que quedó
          </h3>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <Fila t="Ventas entregadas" v={formatearCOP(kpis.ventasBrutas)} />
            <Fila t="Ganancia de lo entregado" v={formatearCOP(kpis.gananciaReal)} tono="text-brand-success" />
            <Fila t="Fletes de devoluciones" v={`− ${formatearCOP(kpis.costoDevoluciones)}`} tono="text-brand-danger" />

            <div className="border-t border-border pt-3">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
                  Pauta del período
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pauta ? pauta.toLocaleString('es-CO') : ''}
                  onChange={(e) => onPauta(Number(e.target.value.replace(/\D/g, '')) || 0)}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors focus:border-brand-success/60"
                />
                <span className="mt-1.5 block text-[11px] text-text-muted">
                  {pautaRegistradaTexto(pauta)}
                </span>
              </label>
            </div>

            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <dt className="font-bold text-white">Utilidad neta</dt>
              <dd
                className={cn(
                  'text-[19px] font-extrabold tabular-nums',
                  neta >= 0 ? 'text-brand-success' : 'text-brand-danger'
                )}
              >
                {formatearCOP(neta)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="font-display text-[15px] font-extrabold tracking-tight">
            Dónde entregas mejor
          </h3>
          <ul className="mt-4 space-y-2.5">
            {ciudades.map((c) => (
              <li key={c.city}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="truncate font-semibold">{c.city}</span>
                  <span className="flex-shrink-0 font-mono text-[11px] text-text-muted">
                    {c.orders} pedidos · {c.deliveryRate.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      c.deliveryRate >= 70
                        ? 'bg-brand-success'
                        : c.deliveryRate >= 50
                          ? 'bg-brand-yellow'
                          : 'bg-brand-danger'
                    )}
                    style={{ width: `${Math.min(100, Math.max(2, c.deliveryRate))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-[11.5px] leading-snug text-text-muted">
            Una ciudad por debajo del 50% casi siempre no es la ciudad: es que esos pedidos
            llegaron sin confirmar.
          </p>
        </div>
      </div>

      {semanas.length > 1 && <GraficaSemanal semanas={semanas} />}

      {pendientes.length > 0 && (
        <div className="rounded-2xl border border-brand-yellow/25 bg-bg-card p-5">
          <h3 className="font-display text-[15px] font-extrabold tracking-tight">
            Por confirmar{' '}
            <span className="font-mono text-[11px] font-normal text-text-muted">
              ({kpis.pending})
            </span>
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
            Cada día que un pedido pasa aquí baja la probabilidad de que se entregue.
            Escríbeles por WhatsApp hoy: es la palanca más barata que tienes sobre la
            efectividad.
          </p>

          <ul className="mt-4 max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
            {pendientes.map((o) => {
              const dias = daysPending(o.date);
              const tel = normalizePhone(o.phone);
              return (
                <li
                  key={o.orderId}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-bg-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{o.customerName || 'Sin nombre'}</p>
                    <p className="truncate font-mono text-[10.5px] text-text-muted">
                      {o.city}
                      {o.date && ` · ${o.date}`} · {formatearCOP(o.saleValue)}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase',
                      dias >= 3
                        ? 'bg-brand-danger/15 text-brand-danger'
                        : 'bg-brand-yellow/15 text-brand-yellow'
                    )}
                  >
                    {dias}d
                  </span>

                  {tel && (
                    <a
                      href={`https://wa.me/${tel}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-brand-success/12 px-2.5 py-1.5 text-[11.5px] font-bold text-brand-success transition-colors hover:bg-brand-success/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Escribir
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** El puente con el costeo: esta es la efectividad que hay que poner allá. */
function Efectividad({ tasa, devoluciones }: { tasa: number; devoluciones: number }) {
  const bien = tasa >= 70;
  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        bien ? 'border-brand-success/30 bg-brand-success/[0.05]' : 'border-brand-yellow/30 bg-brand-yellow/[0.05]'
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Tu efectividad real
          </span>
          <p
            className={cn(
              'mt-1.5 font-display text-[46px] font-extrabold leading-none tracking-tight tabular-nums',
              bien ? 'text-brand-success' : 'text-brand-yellow'
            )}
          >
            {tasa.toFixed(1)}%
          </p>
          <p className="mt-1.5 text-[12.5px] text-text-muted">
            {devoluciones.toFixed(1)}% se devuelve · sobre pedidos ya resueltos
          </p>
        </div>

        <Link
          href="/portal/software/productos"
          className="group flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-3 text-[13px] font-bold transition-colors hover:border-white/25"
        >
          Ponla en tu costeo
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="mt-4 max-w-2xl border-t border-white/8 pt-4 text-[13px] leading-relaxed text-text-secondary">
        Este es el número que en Productos estabas poniendo a ojo. Cámbialo por el real y vas a
        ver el margen que de verdad te queda — en contra entrega la diferencia entre 70% y 55%
        decide si el producto sirve o no.
      </p>
    </div>
  );
}

function GraficaSemanal({
  semanas,
}: {
  semanas: { week: string; delivered: number; in_transit: number; pending: number; returned: number }[];
}) {
  const techo = Math.max(
    1,
    ...semanas.map((s) => s.delivered + s.in_transit + s.pending + s.returned)
  );
  const capas = [
    { k: 'delivered', c: BUCKET_COLORS.delivered },
    { k: 'in_transit', c: BUCKET_COLORS.in_transit },
    { k: 'pending', c: BUCKET_COLORS.pending },
    { k: 'returned', c: BUCKET_COLORS.returned },
  ] as const;

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-[15px] font-extrabold tracking-tight">Semana a semana</h3>
        <div className="flex flex-wrap gap-3 font-mono text-[9.5px] uppercase tracking-wider">
          {capas.map((c) => (
            <span key={c.k} className="flex items-center gap-1.5 text-text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.c }} />
              {BUCKET_LABELS[c.k]}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 overflow-x-auto pb-2">
        {semanas.map((s) => {
          const total = s.delivered + s.in_transit + s.pending + s.returned;
          return (
            <div key={s.week} className="flex min-w-[42px] flex-1 flex-col items-center gap-2">
              <span className="font-mono text-[10px] font-bold tabular-nums text-text-secondary">
                {total}
              </span>
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-md"
                style={{ height: `${Math.max(8, (total / techo) * 150)}px` }}
                title={`Semana del ${s.week}: ${total} pedidos`}
              >
                {capas.map((c) => {
                  const v = s[c.k];
                  if (v === 0) return null;
                  return (
                    <div
                      key={c.k}
                      style={{ backgroundColor: c.c, height: `${(v / total) * 100}%` }}
                    />
                  );
                })}
              </div>
              <span className="font-mono text-[9px] text-text-muted">{s.week.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ etiqueta, valor, tono }: { etiqueta: string; valor: string; tono?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card px-4 py-3.5">
      <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
        {etiqueta}
      </span>
      <span className={cn('mt-1 block text-[20px] font-extrabold tabular-nums', tono ?? 'text-white')}>
        {valor}
      </span>
    </div>
  );
}

function Fila({ t, v, tono }: { t: string; v: string; tono?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-text-muted">{t}</dt>
      <dd className={cn('flex-shrink-0 font-bold tabular-nums', tono ?? 'text-text-secondary')}>
        {v}
      </dd>
    </div>
  );
}

function pautaRegistradaTexto(pauta: number): string {
  return pauta > 0
    ? 'Viene de lo que registraste en Contabilidad. Puedes ajustarlo.'
    : 'Si registras la pauta en Contabilidad, aparece aquí sola.';
}
