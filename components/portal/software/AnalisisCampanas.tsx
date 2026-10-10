'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, FileSpreadsheet, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import {
  DECISIONES,
  PUNTOS,
  diagnosticarTodas,
  type CampanaCruda,
} from '@/lib/campanas-testeo';
import { MONEDAS, MONEDA_POR_DEFECTO, formatear, moneda as buscarMoneda } from '@/lib/monedas';
import { cn } from '@/lib/utils';

/**
 * ¿Cuál sigue y cuál apago?
 *
 * El archivo se lee en el navegador y no se sube a ningún lado: trae los
 * nombres de las campañas del estudiante y no hay razón para que toque el
 * servidor.
 *
 * Quien no quiera subir nada puede anotar sus testeos a mano — en una
 * revisión diaria son tres o cuatro filas y es más rápido que exportar.
 */
export function AnalisisCampanas() {
  const [monedaId, setMonedaId] = useState(MONEDA_POR_DEFECTO.id);
  const m = buscarMoneda(monedaId);

  const [presupuesto, setPresupuesto] = useState(() => MONEDA_POR_DEFECTO.techo / 4);
  const [campanas, setCampanas] = useState<CampanaCruda[]>([]);
  const [archivo, setArchivo] = useState('');
  const [sinMapear, setSinMapear] = useState<string[]>([]);
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aMano, setAMano] = useState(false);

  const input = useRef<HTMLInputElement>(null);
  const [encima, setEncima] = useState(false);

  const diagnosticos = useMemo(
    () => diagnosticarTodas(campanas, presupuesto),
    [campanas, presupuesto]
  );

  async function leer(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLeyendo(true);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await file.arrayBuffer(), { cellDates: false });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const grid = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
        header: 1,
        blankrows: false,
        defval: '',
      });
      const { leerCampanas } = await import('@/lib/campanas-testeo');
      const r = leerCampanas(grid as unknown[][]);
      if (r.campanas.length === 0) {
        setError('No encontré campañas en ese archivo. ¿Es el export de Meta o de TikTok?');
        return;
      }
      setCampanas(r.campanas);
      setSinMapear(r.sinMapear);
      setArchivo(file.name);
      setAMano(false);
    } catch {
      setError('No pude leer el archivo. Tiene que ser el .csv o .xlsx que descargas del administrador.');
    } finally {
      setLeyendo(false);
    }
  }

  const hayDatos = campanas.length > 0;

  return (
    <div className="space-y-5">
      {/* El presupuesto y la moneda: sin eso las reglas no significan nada */}
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Presupuesto por día de cada testeo
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatear(presupuesto, m)}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^\d.]/g, ''));
                if (Number.isFinite(n)) setPresupuesto(n);
              }}
              className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 font-mono text-[15px] font-bold text-white outline-none transition-colors focus:border-brand-yellow/60"
            />
            <span className="mt-1.5 block text-[11px] leading-snug text-text-muted">
              Es lo que convierte las reglas en relativas: los cortes van al{' '}
              {PUNTOS.map((p) => `${p * 100}%`).join(', ')} de este número.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Moneda
            </span>
            <select
              value={monedaId}
              onChange={(e) => {
                const nueva = buscarMoneda(e.target.value);
                setMonedaId(e.target.value);
                setPresupuesto(nueva.techo / 4);
              }}
              className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 font-mono text-[14px] text-white outline-none transition-colors focus:border-brand-yellow/60"
            >
              {MONEDAS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.codigo} · {x.pais}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Cargar */}
      {!hayDatos && !aMano && (
        <>
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
              leer(e.dataTransfer.files[0]);
            }}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-12 text-center transition-all',
              encima
                ? 'border-brand-yellow bg-brand-yellow/10'
                : 'border-border hover:border-brand-yellow/50 hover:bg-white/[0.02]'
            )}
          >
            <input
              ref={input}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => leer(e.target.files?.[0])}
            />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/12 text-brand-yellow">
              {leyendo ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            </span>
            <div>
              <h3 className="font-display text-[16px] font-extrabold tracking-tight">
                Sube el export de Meta o TikTok
              </h3>
              <p className="mt-1.5 font-mono text-[11px] text-text-muted">
                .csv · .xlsx · .xls — se lee aquí, en tu navegador. El archivo no se guarda.
              </p>
            </div>
            <p className="max-w-md text-[12.5px] leading-snug text-text-secondary">
              Expórtalos desde el día que los lanzaste, a nivel de campaña o de conjunto, con la
              columna de <strong className="text-white">pagos iniciados</strong>. Una fila por testeo.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setAMano(true);
              setCampanas([nuevaFila()]);
            }}
            className="flex w-full items-center justify-center gap-2 text-[13px] font-bold text-brand-yellow underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            o anótalos a mano &rarr;
          </button>
        </>
      )}

      {error && (
        <p className="rounded-xl border border-brand-danger/25 bg-brand-danger/[0.07] px-4 py-3 text-center text-[13px] text-brand-danger">
          {error}
        </p>
      )}

      {sinMapear.length > 0 && (
        <p className="flex items-start gap-2 rounded-xl border border-brand-yellow/25 bg-brand-yellow/[0.06] px-4 py-3 text-[12.5px] leading-snug text-text-secondary">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-yellow" />
          No encontré estas columnas: <strong>{sinMapear.join(', ')}</strong>. Lo que dependa de
          ellas va a salir en cero — vuelve a exportar incluyéndolas.
        </p>
      )}

      {hayDatos && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-brand-yellow" />
              <span className="truncate text-[13.5px] font-bold">
                {aMano ? 'Anotados a mano' : archivo}
              </span>
              <span className="flex-shrink-0 font-mono text-[10.5px] text-text-muted">
                {campanas.length} {campanas.length === 1 ? 'testeo' : 'testeos'}
              </span>
            </div>
            <div className="flex gap-2">
              {aMano && (
                <button
                  type="button"
                  onClick={() => setCampanas((c) => [...c, nuevaFila()])}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12.5px] font-bold text-text-secondary transition-colors hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" /> Otra
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCampanas([]);
                  setArchivo('');
                  setSinMapear([]);
                  setAMano(false);
                }}
                className="rounded-xl border border-border px-3 py-2 text-[12.5px] font-bold text-text-secondary transition-colors hover:text-white"
              >
                Empezar de nuevo
              </button>
            </div>
          </div>

          {aMano && (
            <FilasAMano
              campanas={campanas}
              onCambio={setCampanas}
              moneda={m}
            />
          )}

          <div className="space-y-3">
            {diagnosticos.map((d, i) => {
              const info = DECISIONES[d.decision];
              return (
                <div
                  key={`${d.nombre}-${i}`}
                  className="rounded-2xl border bg-bg-card p-5"
                  style={{ borderColor: `${info.color}40` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-[15.5px] font-extrabold tracking-tight">
                        {d.nombre}
                      </h3>
                      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                        {formatear(d.gasto, m)} gastados
                        {d.punto !== null && ` · corte del ${d.punto}%`}
                        {' · '}
                        {d.pagosIniciados} {d.pagosIniciados === 1 ? 'pago iniciado' : 'pagos iniciados'}
                        {' · '}
                        {d.compras} {d.compras === 1 ? 'venta' : 'ventas'}
                        {d.cppi !== null && ` · CPPI ${formatear(d.cppi, m)}`}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${info.color}1F`, color: info.color }}
                    >
                      {info.etiqueta}
                    </span>
                  </div>

                  <p className="mt-3 text-[14px] font-bold" style={{ color: info.color }}>
                    {d.titulo}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{d.porque}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      <LasReglas />
    </div>
  );
}

function nuevaFila(): CampanaCruda {
  return { nombre: '', gasto: 0, pagosIniciados: 0, compras: 0, cpm: null, cpc: null, impresiones: null };
}

function FilasAMano({
  campanas,
  onCambio,
  moneda: m,
}: {
  campanas: CampanaCruda[];
  onCambio: (c: CampanaCruda[]) => void;
  moneda: ReturnType<typeof buscarMoneda>;
}) {
  const set = (i: number, cambio: Partial<CampanaCruda>) =>
    onCambio(campanas.map((c, j) => (i === j ? { ...c, ...cambio } : c)));

  return (
    <div className="space-y-2">
      <div className="hidden gap-3 px-4 font-mono text-[9.5px] uppercase tracking-wider text-text-muted sm:grid sm:grid-cols-[minmax(0,1fr)_110px_90px_80px_36px]">
        <span>Testeo</span>
        <span>Gastado</span>
        <span>Pagos inic.</span>
        <span>Ventas</span>
        <span />
      </div>
      {campanas.map((c, i) => (
        <div
          key={i}
          className="grid gap-3 rounded-xl border border-border bg-bg-card p-3 sm:grid-cols-[minmax(0,1fr)_110px_90px_80px_36px]"
        >
          <input
            type="text"
            value={c.nombre}
            onChange={(e) => set(i, { nombre: e.target.value })}
            placeholder="Nombre del testeo"
            className={estilo}
          />
          <input
            type="text"
            inputMode="numeric"
            value={c.gasto ? formatear(c.gasto, m) : ''}
            onChange={(e) => set(i, { gasto: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })}
            placeholder="0"
            className={cn(estilo, 'font-mono')}
          />
          <input
            type="number"
            min={0}
            value={c.pagosIniciados || ''}
            onChange={(e) => set(i, { pagosIniciados: Number(e.target.value) || 0 })}
            placeholder="0"
            className={cn(estilo, 'font-mono')}
          />
          <input
            type="number"
            min={0}
            value={c.compras || ''}
            onChange={(e) => set(i, { compras: Number(e.target.value) || 0 })}
            placeholder="0"
            className={cn(estilo, 'font-mono')}
          />
          <button
            type="button"
            onClick={() => onCambio(campanas.filter((_, j) => j !== i))}
            className="flex items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
            aria-label={`Quitar ${c.nombre || 'este testeo'}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

const estilo =
  'w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-[13.5px] text-white outline-none transition-colors placeholder:text-text-muted focus:border-brand-yellow/60';

/** Las reglas a la vista, para que el veredicto no sea una caja negra. */
function LasReglas() {
  const reglas = [
    {
      punto: '20%',
      lineas: [
        '0, 1 o 2 pagos iniciados: apágalo, a nadie le interesa (revisa el CPM y el CPC).',
        '3 o 4: flojo, se mantiene.',
        'Si ya hay venta: maravilloso.',
      ],
    },
    {
      punto: '30%',
      lineas: [
        'Sin ventas y con el pago iniciado por encima del 6% del presupuesto: apágalo.',
        'Entre el 5% y el 6%: bastante flojo.',
        'Con venta y por debajo del 4%: buen pronóstico.',
      ],
    },
    {
      punto: '40%',
      lineas: [
        'Sin ninguna venta: apágalo, aunque el pago iniciado esté barato — entonces el problema es el formulario o la oferta.',
        'Con varias ventas rentables: déjalo gastar el día entero.',
      ],
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <h3 className="flex items-center gap-2 font-display text-[15px] font-extrabold tracking-tight">
        <span className="h-2 w-2 rounded-full bg-brand-yellow" /> Los puntos críticos
      </h3>
      <p className="mt-1.5 text-[12.5px] text-text-muted">
        Los tres cortes del día, como fracción de lo que cada testeo tiene asignado.
      </p>

      <div className="mt-5 space-y-4">
        {reglas.map((r) => (
          <div key={r.punto} className="flex gap-4">
            <span className="w-12 flex-shrink-0 font-mono text-[13px] font-bold text-brand-yellow">
              {r.punto}
            </span>
            <ul className="space-y-1.5">
              {r.lineas.map((l) => (
                <li key={l} className="text-[13px] leading-snug text-text-secondary">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
