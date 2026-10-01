'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Check, ExternalLink, Pencil, Plus, Target, Trash2, Trophy, X } from 'lucide-react';
import { borrarCreativo, guardarCreativo } from '@/app/portal/software/actions';
import type { SwCreativo, SwProducto } from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

/**
 * El banco de creativos.
 *
 * Se agrupa por ángulo y no por fecha porque la pregunta útil nunca es "qué
 * grabé el martes" sino "qué les dije a los clientes que sí funcionó". Un
 * ángulo que ganó se vuelve a grabar con otro actor, otra música y otro hook;
 * el ángulo es el activo, el video es la versión.
 *
 * Es el mismo criterio con el que agrupo los míos en LUMENS OS.
 */

export const ANGULOS = [
  {
    id: 'problema-solucion',
    nombre: 'Problema → solución',
    pista: 'Abres con el dolor exacto, en las palabras del cliente, y el producto aparece como la salida.',
  },
  {
    id: 'antes-despues',
    nombre: 'Antes y después',
    pista: 'La transformación visible en los primeros tres segundos. Funciona cuando el resultado se ve.',
  },
  {
    id: 'demostracion',
    nombre: 'Demostración',
    pista: 'El producto haciendo lo que promete, sin hablar. Gana cuando el producto es raro o satisfactorio.',
  },
  {
    id: 'testimonio',
    nombre: 'Testimonio',
    pista: 'Una persona real contándolo. Baja la desconfianza, que es el freno número uno en contra entrega.',
  },
  {
    id: 'objecion',
    nombre: 'Rompe-objeción',
    pista: 'Atacas de frente lo que los detiene: "¿y si no me sirve?", "¿y si no llega?".',
  },
  {
    id: 'comparacion',
    nombre: 'Comparación',
    pista: 'Lo tuyo contra lo que ya usan. Sirve cuando el cliente ya compró algo parecido y falló.',
  },
  {
    id: 'ugc',
    nombre: 'UGC crudo',
    pista: 'Grabado como si fuera un amigo. Lo imperfecto vende más que lo producido.',
  },
  {
    id: 'urgencia',
    nombre: 'Urgencia / oferta',
    pista: 'El último recurso, no el primero. Quema audiencia si lo usas solo.',
  },
] as const;

const ESTADOS = [
  { id: 'ganador', nombre: 'Ganador', color: '#10B981' },
  { id: 'probando', nombre: 'Probando', color: '#F5C518' },
  { id: 'pausado', nombre: 'Pausado', color: '#75757F' },
  { id: 'archivado', nombre: 'Archivado', color: '#4A4A55' },
] as const;

const PLATAFORMAS = [
  { id: 'meta', nombre: 'Meta' },
  { id: 'tiktok', nombre: 'TikTok' },
  { id: 'ambas', nombre: 'Ambas' },
] as const;

export function Creativos({
  creativos,
  productos,
}: {
  creativos: SwCreativo[];
  productos: SwProducto[];
}) {
  const [editando, setEditando] = useState<SwCreativo | 'nuevo' | null>(null);

  // Agrupados por ángulo, con los ganadores arriba dentro de cada grupo.
  const grupos = useMemo(() => {
    const mapa = new Map<string, SwCreativo[]>();
    for (const c of creativos) {
      const clave = c.angulo ?? 'sin-angulo';
      mapa.set(clave, [...(mapa.get(clave) ?? []), c]);
    }
    return [...mapa.entries()]
      .map(([clave, items]) => ({
        clave,
        nombre: ANGULOS.find((a) => a.id === clave)?.nombre ?? (clave === 'sin-angulo' ? 'Sin ángulo asignado' : clave),
        items: [...items].sort(
          (a, b) => (b.estado === 'ganador' ? 1 : 0) - (a.estado === 'ganador' ? 1 : 0)
        ),
      }))
      // Los que no tienen ángulo van al final: son los que falta clasificar.
      .sort((a, b) =>
        a.clave === 'sin-angulo' ? 1 : b.clave === 'sin-angulo' ? -1 : b.items.length - a.items.length
      );
  }, [creativos]);

  return (
    <div className="space-y-6">
      {editando ? (
        <EditorCreativo
          creativo={editando === 'nuevo' ? null : editando}
          productos={productos}
          onCerrar={() => setEditando(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditando('nuevo')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[13.5px] font-bold text-text-secondary transition-colors hover:border-brand-yellow/50 hover:text-white"
        >
          <Plus className="h-4 w-4" /> Guardar un creativo
        </button>
      )}

      {creativos.length === 0 ? (
        <BibliotecaAngulos />
      ) : (
        <>
          {grupos.map((g) => (
            <section key={g.clave}>
              <h2 className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-yellow" />
                <span className="font-display text-[15px] font-extrabold tracking-tight">
                  {g.nombre}
                </span>
                <span className="font-mono text-[11px] text-text-muted">({g.items.length})</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {g.items.map((c) => (
                  <TarjetaCreativo
                    key={c.id}
                    creativo={c}
                    productos={productos}
                    onEditar={() => setEditando(c)}
                  />
                ))}
              </div>
            </section>
          ))}
          <details className="rounded-2xl border border-border bg-bg-card">
            <summary className="cursor-pointer list-none px-5 py-4 text-[13.5px] font-bold text-text-secondary transition-colors hover:text-white">
              Los ocho ángulos, por si te quedas en blanco
            </summary>
            <div className="border-t border-border px-5 pb-5 pt-4">
              <ListaAngulos />
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function BibliotecaAngulos() {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6">
      <h2 className="font-display text-[17px] font-extrabold tracking-tight">
        Antes de grabar, escoge el ángulo
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
        Un creativo no falla por la edición. Falla porque le está hablando a alguien que no tiene
        ese problema, o se lo está diciendo de una forma que no reconoce como suya. El ángulo es
        esa decisión, y es la única que de verdad mueve el CPA.
      </p>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
        Graba tres ángulos distintos antes de grabar tres versiones del mismo.
      </p>
      <div className="mt-6">
        <ListaAngulos />
      </div>
    </div>
  );
}

function ListaAngulos() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ANGULOS.map((a, i) => (
        <li key={a.id} className="rounded-xl border border-border bg-bg-secondary p-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-brand-yellow">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="text-[13.5px] font-bold">{a.nombre}</h3>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-snug text-text-muted">{a.pista}</p>
        </li>
      ))}
    </ul>
  );
}

function TarjetaCreativo({
  creativo,
  productos,
  onEditar,
}: {
  creativo: SwCreativo;
  productos: SwProducto[];
  onEditar: () => void;
}) {
  const [pendiente, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  const estado = ESTADOS.find((e) => e.id === creativo.estado) ?? ESTADOS[1];
  const producto = creativo.producto_id
    ? productos.find((p) => p.id === creativo.producto_id)?.nombre
    : null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-bg-card p-5',
        creativo.estado === 'ganador' ? 'border-brand-success/35' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 truncate font-display text-[15px] font-extrabold tracking-tight">
            {creativo.estado === 'ganador' && (
              <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-brand-success" />
            )}
            {creativo.nombre}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider"
              style={{ backgroundColor: `${estado.color}1F`, color: estado.color }}
            >
              {estado.nombre}
            </span>
            <span className="font-mono text-[10.5px] text-text-muted">
              {PLATAFORMAS.find((p) => p.id === creativo.plataforma)?.nombre}
              {creativo.formato && ` · ${creativo.formato}`}
              {producto && ` · ${producto}`}
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={onEditar}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label={`Editar ${creativo.nombre}`}
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
                const r = await borrarCreativo(creativo.id);
                if (r.ok) toast.success('Creativo borrado');
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
            aria-label={
              confirmando ? `Confirmar borrado de ${creativo.nombre}` : `Borrar ${creativo.nombre}`
            }
          >
            {confirmando ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {creativo.hook && (
        <blockquote className="mt-4 border-l-2 border-brand-yellow/50 pl-3 text-[13px] italic leading-snug text-text-secondary">
          “{creativo.hook}”
        </blockquote>
      )}

      {creativo.cta && (
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
          CTA · <span className="normal-case text-text-secondary">{creativo.cta}</span>
        </p>
      )}

      {creativo.video_url && (
        <a
          href={creativo.video_url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-purpleLight transition-colors hover:text-white"
        >
          Ver el video <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function EditorCreativo({
  creativo,
  productos,
  onCerrar,
}: {
  creativo: SwCreativo | null;
  productos: SwProducto[];
  onCerrar: () => void;
}) {
  const [pendiente, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const [angulo, setAngulo] = useState(creativo?.angulo ?? '');

  const pista = ANGULOS.find((a) => a.id === angulo)?.pista;

  return (
    <form
      ref={form}
      action={(fd) =>
        startTransition(async () => {
          const r = await guardarCreativo(fd);
          if (r.ok) {
            toast.success(creativo ? 'Creativo actualizado' : 'Creativo guardado');
            onCerrar();
          } else {
            toast.error(r.error);
          }
        })
      }
      className="overflow-hidden rounded-2xl border border-brand-yellow/25 bg-bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="font-display text-[15px] font-extrabold tracking-tight">
          {creativo ? 'Editar creativo' : 'Guardar un creativo'}
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

      <div className="space-y-3.5 p-5">
        {creativo && <input type="hidden" name="id" value={creativo.id} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <input
              name="nombre"
              type="text"
              required
              defaultValue={creativo?.nombre ?? ''}
              placeholder="Lámpara · testimonio mamá"
              className={estiloInput}
            />
          </Campo>
          <Campo etiqueta="Ángulo">
            <select
              name="angulo"
              value={angulo}
              onChange={(e) => setAngulo(e.target.value)}
              className={estiloInput}
            >
              <option value="">Sin asignar</option>
              {ANGULOS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {pista && (
          <p className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/[0.05] px-3.5 py-2.5 text-[12.5px] leading-snug text-text-secondary">
            {pista}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Campo etiqueta="Plataforma">
            <select
              name="plataforma"
              defaultValue={creativo?.plataforma ?? 'ambas'}
              className={estiloInput}
            >
              {PLATAFORMAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Estado">
            <select
              name="estado"
              defaultValue={creativo?.estado ?? 'probando'}
              className={estiloInput}
            >
              {ESTADOS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Formato" opcional>
            <input
              name="formato"
              type="text"
              defaultValue={creativo?.formato ?? ''}
              placeholder="UGC 9:16"
              className={estiloInput}
            />
          </Campo>
        </div>

        {productos.length > 0 && (
          <Campo etiqueta="Producto" opcional>
            <select
              name="producto_id"
              defaultValue={creativo?.producto_id ?? ''}
              className={estiloInput}
            >
              <option value="">Sin asignar</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <Campo
          etiqueta="Hook"
          ayuda="Las primeras palabras exactas. Si no las anotas, el que ganó no se puede repetir."
        >
          <input
            name="hook"
            type="text"
            defaultValue={creativo?.hook ?? ''}
            placeholder="Llevaba dos años durmiendo mal y no era el colchón."
            className={estiloInput}
          />
        </Campo>

        <Campo etiqueta="Guion" opcional>
          <textarea
            name="guion"
            rows={4}
            defaultValue={creativo?.guion ?? ''}
            placeholder="Escena por escena, o el texto completo."
            className={cn(estiloInput, 'resize-y')}
          />
        </Campo>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="CTA" opcional>
            <input
              name="cta"
              type="text"
              defaultValue={creativo?.cta ?? ''}
              placeholder="Pídela y paga cuando llegue"
              className={estiloInput}
            />
          </Campo>
          <Campo etiqueta="Link del video" opcional>
            <input
              name="video_url"
              type="url"
              defaultValue={creativo?.video_url ?? ''}
              placeholder="https://drive.google.com/…"
              className={estiloInput}
            />
          </Campo>
        </div>

        <Campo etiqueta="Notas" opcional>
          <textarea
            name="notas"
            rows={2}
            defaultValue={creativo?.notas ?? ''}
            placeholder="Qué funcionó, qué cambiarías, con qué CPA corrió."
            className={cn(estiloInput, 'resize-none')}
          />
        </Campo>

        <button
          type="submit"
          disabled={pendiente}
          className="w-full rounded-xl bg-brand-yellow py-3 text-[14px] font-extrabold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pendiente ? 'Guardando…' : creativo ? 'Guardar cambios' : 'Guardar creativo'}
        </button>
      </div>
    </form>
  );
}

const estiloInput =
  'w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors placeholder:text-text-muted focus:border-brand-yellow/60';

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
