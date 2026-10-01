'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { borrarProducto, guardarProducto } from '@/app/portal/software/actions';
import { calcularCosteo, formatearCOP } from '@/lib/software-costeo';
import type { SwProducto } from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

const ESTADOS = [
  { id: 'probando', nombre: 'Probando', color: '#F5C518' },
  { id: 'activo', nombre: 'Activo', color: '#10B981' },
  { id: 'pausado', nombre: 'Pausado', color: '#75757F' },
  { id: 'archivado', nombre: 'Archivado', color: '#4A4A55' },
] as const;

/**
 * Productos y costeo.
 *
 * El centro de esto no es el listado sino la calculadora: recalcula mientras
 * escribes y pone lado a lado el margen que crees que tienes y el que de
 * verdad te queda después de las devoluciones. La diferencia entre esos dos
 * números es la razón más común por la que un negocio de contra entrega
 * escala hasta quebrar.
 */
export function Productos({ productos }: { productos: SwProducto[] }) {
  const [editando, setEditando] = useState<SwProducto | 'nuevo' | null>(
    productos.length === 0 ? 'nuevo' : null
  );

  return (
    <div className="space-y-6">
      {editando ? (
        <EditorProducto
          producto={editando === 'nuevo' ? null : editando}
          onCerrar={() => setEditando(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditando('nuevo')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[13.5px] font-bold text-text-secondary transition-colors hover:border-brand-cyan/50 hover:text-white"
        >
          <Plus className="h-4 w-4" /> Costear un producto nuevo
        </button>
      )}

      {productos.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {productos.map((p) => (
            <TarjetaProducto key={p.id} producto={p} onEditar={() => setEditando(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaProducto({
  producto,
  onEditar,
}: {
  producto: SwProducto;
  onEditar: () => void;
}) {
  const [pendiente, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  const c = calcularCosteo({
    precioVenta: Number(producto.precio_venta),
    costoProducto: Number(producto.costo_producto),
    costoEnvio: Number(producto.costo_envio),
    costoDevolucion: Number(producto.costo_devolucion),
    efectividadPct: Number(producto.efectividad_pct),
  });

  const estado = ESTADOS.find((e) => e.id === producto.estado) ?? ESTADOS[0];

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[16px] font-extrabold tracking-tight">
            {producto.nombre}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider"
              style={{ backgroundColor: `${estado.color}1F`, color: estado.color }}
            >
              {estado.nombre}
            </span>
            <span className="font-mono text-[10.5px] text-text-muted">
              {formatearCOP(Number(producto.precio_venta))} · {Number(producto.efectividad_pct)}%
              entregado
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={onEditar}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label={`Editar ${producto.nombre}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              if (!confirmando) {
                setConfirmando(true);
                return;
              }
              startTransition(async () => {
                const r = await borrarProducto(producto.id);
                if (r.ok) toast.success('Producto borrado');
                else toast.error(r.error);
                setConfirmando(false);
              });
            }}
            onBlur={() => setConfirmando(false)}
            className={cn(
              'rounded-lg p-1.5 transition-colors disabled:opacity-40',
              confirmando
                ? 'bg-brand-danger/15 text-brand-danger'
                : 'text-text-muted hover:bg-brand-danger/10 hover:text-brand-danger'
            )}
            aria-label={confirmando ? `Confirmar borrado de ${producto.nombre}` : `Borrar ${producto.nombre}`}
          >
            {confirmando ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
            Margen en el papel
          </span>
          <span className="mt-0.5 block text-[15px] font-bold text-text-secondary tabular-nums line-through decoration-text-muted/50">
            {formatearCOP(c.margenBruto)}
          </span>
        </div>
        <div>
          <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
            Lo que queda de verdad
          </span>
          <span
            className={cn(
              'mt-0.5 block text-[15px] font-extrabold tabular-nums',
              c.rentable ? 'text-brand-success' : 'text-brand-danger'
            )}
          >
            {formatearCOP(c.margenReal)}
          </span>
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-3 font-mono text-[10.5px] text-text-muted">
        CPA máximo {formatearCOP(c.cpaMaximo)} · equilibrio en {c.efectividadMinima.toFixed(0)}% de
        efectividad
      </p>
    </div>
  );
}

function EditorProducto({
  producto,
  onCerrar,
}: {
  producto: SwProducto | null;
  onCerrar: () => void;
}) {
  const [pendiente, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);

  // El estado vive aquí para que la calculadora de la derecha se mueva con
  // cada tecla. Son cinco números; no vale la pena nada más sofisticado.
  const [v, setV] = useState({
    precioVenta: Number(producto?.precio_venta ?? 0),
    costoProducto: Number(producto?.costo_producto ?? 0),
    costoEnvio: Number(producto?.costo_envio ?? 0),
    costoDevolucion: Number(producto?.costo_devolucion ?? 0),
    efectividadPct: Number(producto?.efectividad_pct ?? 70),
    cpaReal: 0,
  });

  const c = useMemo(() => calcularCosteo(v), [v]);
  const num = (s: string) => Number(s.replace(/\D/g, '')) || 0;

  return (
    <form
      ref={form}
      action={(fd) =>
        startTransition(async () => {
          const r = await guardarProducto(fd);
          if (r.ok) {
            toast.success(producto ? 'Producto actualizado' : 'Producto guardado');
            onCerrar();
          } else {
            toast.error(r.error);
          }
        })
      }
      className="overflow-hidden rounded-2xl border border-brand-cyan/25 bg-bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="font-display text-[15px] font-extrabold tracking-tight">
          {producto ? 'Editar producto' : 'Costear un producto'}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="space-y-3.5">
          {producto && <input type="hidden" name="id" value={producto.id} />}

          <Campo etiqueta="Nombre del producto">
            <input
              name="nombre"
              type="text"
              required
              defaultValue={producto?.nombre ?? ''}
              placeholder="Lámpara de luna 3D"
              className={estiloInput}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Precio de venta">
              <input
                name="precio_venta"
                type="text"
                inputMode="numeric"
                required
                defaultValue={producto ? String(Number(producto.precio_venta)) : ''}
                placeholder="120.000"
                onChange={(e) => setV((p) => ({ ...p, precioVenta: num(e.target.value) }))}
                className={estiloInput}
              />
            </Campo>
            <Campo etiqueta="Precio tachado" opcional>
              <input
                name="precio_tachado"
                type="text"
                inputMode="numeric"
                defaultValue={
                  producto?.precio_tachado ? String(Number(producto.precio_tachado)) : ''
                }
                placeholder="180.000"
                className={estiloInput}
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Costo del producto">
              <input
                name="costo_producto"
                type="text"
                inputMode="numeric"
                defaultValue={producto ? String(Number(producto.costo_producto)) : ''}
                placeholder="35.000"
                onChange={(e) => setV((p) => ({ ...p, costoProducto: num(e.target.value) }))}
                className={estiloInput}
              />
            </Campo>
            <Campo etiqueta="Flete de ida">
              <input
                name="costo_envio"
                type="text"
                inputMode="numeric"
                defaultValue={producto ? String(Number(producto.costo_envio)) : ''}
                placeholder="12.000"
                onChange={(e) => setV((p) => ({ ...p, costoEnvio: num(e.target.value) }))}
                className={estiloInput}
              />
            </Campo>
          </div>

          <Campo
            etiqueta="Costo extra por devolución"
            ayuda="El flete de regreso más lo que pierdas del producto si vuelve dañado. El flete de ida ya se cuenta aparte."
          >
            <input
              name="costo_devolucion"
              type="text"
              inputMode="numeric"
              defaultValue={producto ? String(Number(producto.costo_devolucion)) : ''}
              placeholder="12.000"
              onChange={(e) => setV((p) => ({ ...p, costoDevolucion: num(e.target.value) }))}
              className={estiloInput}
            />
          </Campo>

          <Campo
            etiqueta={`Efectividad: ${v.efectividadPct}% se entrega y se cobra`}
            ayuda="De cada 100 pedidos, cuántos terminan pagados. Si no la has medido, 70% es un punto de partida honesto en Colombia."
          >
            <input
              name="efectividad_pct"
              type="range"
              min={10}
              max={100}
              step={1}
              value={v.efectividadPct}
              onChange={(e) => setV((p) => ({ ...p, efectividadPct: Number(e.target.value) }))}
              className="w-full accent-brand-cyan"
            />
          </Campo>

          <Campo
            etiqueta="CPA actual (sólo para simular)"
            ayuda="Lo que te cuesta cada pedido en Meta. No se guarda: es para ver si el producto aguanta ese costo."
            opcional
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="30.000"
              onChange={(e) => setV((p) => ({ ...p, cpaReal: num(e.target.value) }))}
              className={estiloInput}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Estado">
              <select
                name="estado"
                defaultValue={producto?.estado ?? 'probando'}
                className={estiloInput}
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Landing" opcional>
              <input
                name="landing_url"
                type="url"
                defaultValue={producto?.landing_url ?? ''}
                placeholder="https://…"
                className={estiloInput}
              />
            </Campo>
          </div>

          <Campo etiqueta="Notas" opcional>
            <textarea
              name="notas"
              rows={2}
              defaultValue={producto?.notas ?? ''}
              placeholder="Proveedor, tiempos de entrega, lo que sea que se te olvide después."
              className={cn(estiloInput, 'resize-none')}
            />
          </Campo>

          <button
            type="submit"
            disabled={pendiente}
            className="w-full rounded-xl bg-brand-cyan py-3 text-[14px] font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pendiente ? 'Guardando…' : producto ? 'Guardar cambios' : 'Guardar producto'}
          </button>
        </div>

        <ResultadoCosteo costeo={c} efectividad={v.efectividadPct} />
      </div>
    </form>
  );
}

/** El panel que convierte los cinco números en una decisión. */
function ResultadoCosteo({
  costeo,
  efectividad,
}: {
  costeo: ReturnType<typeof calcularCosteo>;
  efectividad: number;
}) {
  const margen = costeo.margenReal;
  const holgura = efectividad - costeo.efectividadMinima;

  return (
    <div className="h-fit rounded-2xl border border-border bg-bg-secondary p-5 lg:sticky lg:top-24">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-brand-cyan">
        Por cada venta entregada
      </span>

      <p
        className={cn(
          'mt-2 font-display text-[32px] font-extrabold leading-none tracking-tight tabular-nums',
          margen > 0 ? 'text-brand-success' : margen < 0 ? 'text-brand-danger' : 'text-text-muted'
        )}
      >
        {formatearCOP(margen)}
      </p>
      <p className="mt-1 text-[11.5px] text-text-muted">
        {costeo.margenRealPct.toFixed(1)}% del precio
      </p>

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-[12.5px]">
        <Linea termino="Costo puesto en la puerta" valor={formatearCOP(costeo.cogs)} />
        <Linea
          termino="Margen antes de devoluciones"
          valor={formatearCOP(costeo.margenBruto)}
          apagado
        />
        <Linea
          termino="Se lo comen las devoluciones"
          valor={`− ${formatearCOP(costeo.devolucionesPorVenta)}`}
          tono="text-brand-danger"
        />
        {costeo.pautaPorVenta > 0 && (
          <Linea
            termino="Se lo come la pauta"
            valor={`− ${formatearCOP(costeo.pautaPorVenta)}`}
            tono="text-brand-danger"
          />
        )}
        <Linea
          termino="CPA máximo que aguantas"
          valor={formatearCOP(costeo.cpaMaximo)}
          tono="text-brand-cyan"
        />
      </dl>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
            Punto de equilibrio
          </span>
          <span className="text-[12px] font-bold">{costeo.efectividadMinima.toFixed(0)}%</span>
        </div>

        {/* Dónde está tu efectividad respecto al mínimo. La franja roja es la
            zona en la que vendes y pierdes al mismo tiempo. */}
        <div className="relative h-2.5 overflow-hidden rounded-full bg-bg-card">
          <div
            className="absolute inset-y-0 left-0 bg-brand-danger/35"
            style={{ width: `${Math.min(100, Math.max(0, costeo.efectividadMinima))}%` }}
          />
          <div
            className="absolute inset-y-0 w-[3px] rounded-full bg-white"
            style={{ left: `calc(${Math.min(100, Math.max(0, efectividad))}% - 1.5px)` }}
          />
        </div>

        <p
          className={cn(
            'mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-snug',
            holgura > 15
              ? 'text-brand-success'
              : holgura > 0
                ? 'text-brand-yellow'
                : 'text-brand-danger'
          )}
        >
          {holgura <= 0 && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />}
          {holgura > 15
            ? `Tienes ${holgura.toFixed(0)} puntos de colchón. Este producto aguanta un mal mes.`
            : holgura > 0
              ? `Sólo ${holgura.toFixed(0)} puntos de colchón. Si la efectividad baja un poco, se va a cero.`
              : `Estás por debajo del equilibrio: cada venta entregada te cuesta plata. Sube el precio, baja el costo o mejora la confirmación.`}
        </p>
      </div>
    </div>
  );
}

function Linea({
  termino,
  valor,
  tono,
  apagado = false,
}: {
  termino: string;
  valor: string;
  tono?: string;
  apagado?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn('text-text-muted', apagado && 'line-through decoration-text-muted/40')}>
        {termino}
      </dt>
      <dd className={cn('flex-shrink-0 font-bold tabular-nums', tono ?? 'text-text-secondary')}>
        {valor}
      </dd>
    </div>
  );
}

const estiloInput =
  'w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-text-muted focus:border-brand-cyan/60';

function Campo({
  etiqueta,
  ayuda,
  opcional = false,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {etiqueta}
        {opcional && <span className="text-[9px] normal-case text-text-muted/60">opcional</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1.5 block text-[11px] leading-snug text-text-muted">{ayuda}</span>}
    </label>
  );
}
