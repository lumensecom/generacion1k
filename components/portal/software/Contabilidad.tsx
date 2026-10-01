'use client';

import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { borrarGasto, borrarIngreso, crearGasto, crearIngreso } from '@/app/portal/software/actions';
import {
  CATEGORIAS_GASTO,
  FUENTES_INGRESO,
  formatearCOP,
  type SwGasto,
  type SwIngreso,
  type SwProducto,
} from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

/**
 * El registro diario: una entrada o una salida en diez segundos.
 *
 * La fricción es lo que mata una contabilidad, así que el formulario arranca
 * con la fecha de hoy puesta y el foco en el monto. Todo lo demás es opcional.
 */
export function Contabilidad({
  ingresos,
  gastos,
  productos,
  hoy,
}: {
  ingresos: SwIngreso[];
  gastos: SwGasto[];
  productos: SwProducto[];
  /** La fecha de hoy en Bogotá, calculada en el servidor para no depender del reloj del navegador. */
  hoy: string;
}) {
  const [tab, setTab] = useState<'entrada' | 'salida'>('entrada');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-bg-secondary p-1.5">
          <button
            type="button"
            onClick={() => setTab('entrada')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-bold transition-colors',
              tab === 'entrada'
                ? 'bg-brand-success/15 text-brand-success'
                : 'text-text-muted hover:text-white'
            )}
          >
            <ArrowUpRight className="h-4 w-4" /> Entró
          </button>
          <button
            type="button"
            onClick={() => setTab('salida')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-bold transition-colors',
              tab === 'salida'
                ? 'bg-brand-danger/15 text-brand-danger'
                : 'text-text-muted hover:text-white'
            )}
          >
            <ArrowDownRight className="h-4 w-4" /> Salió
          </button>
        </div>

        {tab === 'entrada' ? (
          <FormularioIngreso productos={productos} hoy={hoy} />
        ) : (
          <FormularioGasto productos={productos} hoy={hoy} />
        )}
      </div>

      <Movimientos ingresos={ingresos} gastos={gastos} productos={productos} />
    </div>
  );
}

function FormularioIngreso({ productos, hoy }: { productos: SwProducto[]; hoy: string }) {
  const [pendiente, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={(fd) =>
        startTransition(async () => {
          const r = await crearIngreso(fd);
          if (r.ok) {
            toast.success('Entrada registrada');
            form.current?.reset();
          } else {
            toast.error(r.error);
          }
        })
      }
      className="space-y-3.5"
    >
      <Campo etiqueta="¿Cuánto entró?" destacado>
        <input
          name="monto"
          type="text"
          inputMode="numeric"
          required
          autoComplete="off"
          placeholder="450.000"
          className={estiloInput}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha">
          <input name="fecha" type="date" defaultValue={hoy} className={estiloInput} />
        </Campo>
        <Campo etiqueta="Pedidos">
          <input
            name="pedidos"
            type="number"
            min={1}
            defaultValue={1}
            className={estiloInput}
          />
        </Campo>
      </div>

      <Campo etiqueta="¿De dónde?">
        <select name="fuente" className={estiloInput} defaultValue="tienda">
          {FUENTES_INGRESO.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <SelectorProducto productos={productos} />

      <Campo etiqueta="Nota (opcional)">
        <input name="notas" type="text" placeholder="Día de campaña nueva" className={estiloInput} />
      </Campo>

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-brand-success py-3 text-[14px] font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pendiente ? 'Guardando…' : 'Registrar entrada'}
      </button>
    </form>
  );
}

function FormularioGasto({ productos, hoy }: { productos: SwProducto[]; hoy: string }) {
  const [pendiente, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={(fd) =>
        startTransition(async () => {
          const r = await crearGasto(fd);
          if (r.ok) {
            toast.success('Salida registrada');
            form.current?.reset();
          } else {
            toast.error(r.error);
          }
        })
      }
      className="space-y-3.5"
    >
      <Campo etiqueta="¿Cuánto salió?" destacado>
        <input
          name="monto"
          type="text"
          inputMode="numeric"
          required
          autoComplete="off"
          placeholder="120.000"
          className={estiloInput}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Fecha">
          <input name="fecha" type="date" defaultValue={hoy} className={estiloInput} />
        </Campo>
        <Campo etiqueta="¿En qué?">
          <select name="categoria" className={estiloInput} defaultValue="ads_meta">
            {CATEGORIAS_GASTO.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <SelectorProducto productos={productos} />

      <Campo etiqueta="Descripción (opcional)">
        <input
          name="descripcion"
          type="text"
          placeholder="Campaña ABO interés frío"
          className={estiloInput}
        />
      </Campo>

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-brand-danger py-3 text-[14px] font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pendiente ? 'Guardando…' : 'Registrar salida'}
      </button>
    </form>
  );
}

function SelectorProducto({ productos }: { productos: SwProducto[] }) {
  if (productos.length === 0) return null;
  return (
    <Campo etiqueta="Producto (opcional)">
      <select name="producto_id" className={estiloInput} defaultValue="">
        <option value="">Sin asignar</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </Campo>
  );
}

/** Entradas y salidas en una sola lista, ordenadas por fecha. Es como se lee un extracto. */
function Movimientos({
  ingresos,
  gastos,
  productos,
}: {
  ingresos: SwIngreso[];
  gastos: SwGasto[];
  productos: SwProducto[];
}) {
  const nombreProducto = (id: string | null) =>
    id ? productos.find((p) => p.id === id)?.nombre ?? null : null;

  const filas = [
    ...ingresos.map((i) => ({
      id: i.id,
      tipo: 'entrada' as const,
      fecha: i.fecha,
      monto: Number(i.monto),
      titulo: FUENTES_INGRESO.find((f) => f.id === i.fuente)?.nombre ?? 'Ingreso',
      detalle: i.notas,
      producto: nombreProducto(i.producto_id),
      extra: i.pedidos > 0 ? `${i.pedidos} ${i.pedidos === 1 ? 'pedido' : 'pedidos'}` : null,
    })),
    ...gastos.map((g) => ({
      id: g.id,
      tipo: 'salida' as const,
      fecha: g.fecha,
      monto: Number(g.monto),
      titulo: CATEGORIAS_GASTO.find((c) => c.id === g.categoria)?.nombre ?? 'Gasto',
      detalle: g.descripcion,
      producto: nombreProducto(g.producto_id),
      extra: null,
    })),
  ].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <h2 className="mb-4 font-display text-[15px] font-extrabold tracking-tight">
        Movimientos{' '}
        <span className="font-mono text-[11px] font-normal text-text-muted">
          ({filas.length})
        </span>
      </h2>

      {filas.length === 0 ? (
        <p className="py-14 text-center text-[13.5px] text-text-muted">
          Todavía no hay nada registrado.
        </p>
      ) : (
        <ul className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
          {filas.map((f) => (
            <Fila key={`${f.tipo}-${f.id}`} fila={f} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Fila({
  fila,
}: {
  fila: {
    id: string;
    tipo: 'entrada' | 'salida';
    fecha: string;
    monto: number;
    titulo: string;
    detalle: string | null;
    producto: string | null;
    extra: string | null;
  };
}) {
  const [pendiente, startTransition] = useTransition();
  const entrada = fila.tipo === 'entrada';

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-bg-secondary">
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          entrada ? 'bg-brand-success/12 text-brand-success' : 'bg-brand-danger/12 text-brand-danger'
        )}
      >
        {entrada ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold">
          {fila.titulo}
          {fila.producto && (
            <span className="ml-2 font-mono text-[10.5px] font-normal text-brand-purpleLight">
              {fila.producto}
            </span>
          )}
        </p>
        <p className="truncate font-mono text-[10.5px] text-text-muted">
          {fila.fecha}
          {fila.extra && ` · ${fila.extra}`}
          {fila.detalle && ` · ${fila.detalle}`}
        </p>
      </div>

      <span
        className={cn(
          'flex-shrink-0 text-[13.5px] font-extrabold tabular-nums',
          entrada ? 'text-brand-success' : 'text-brand-danger'
        )}
      >
        {entrada ? '+' : '−'}
        {formatearCOP(fila.monto)}
      </span>

      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          startTransition(async () => {
            const r = entrada ? await borrarIngreso(fila.id) : await borrarGasto(fila.id);
            if (r.ok) toast.success('Borrado');
            else toast.error(r.error);
          })
        }
        className="flex-shrink-0 rounded-lg p-1.5 text-text-muted opacity-0 transition-all hover:bg-brand-danger/10 hover:text-brand-danger focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
        aria-label={`Borrar ${fila.titulo} del ${fila.fecha}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

const estiloInput =
  'w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-text-muted focus:border-brand-purple/60';

function Campo({
  etiqueta,
  destacado = false,
  children,
}: {
  etiqueta: string;
  destacado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className={cn(
          'mb-1.5 block font-mono text-[10px] uppercase tracking-wider',
          destacado ? 'text-white' : 'text-text-muted'
        )}
      >
        {etiqueta}
      </span>
      {children}
    </label>
  );
}
