'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/app/portal/actions';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { claveLocal } from '@/lib/agenda';

/**
 * Las acciones del Software 1K.
 *
 * Regla única y sin excepciones: el student_id sale de la cookie firmada, nunca
 * del formulario. Y cada update o delete lleva su .eq('student_id', sid), de
 * modo que mandar el id de otro estudiante no borra nada — la fila simplemente
 * no entra en el filtro. Como el cliente de Supabase es service_role, esto es
 * lo que separa a un estudiante de otro.
 */

type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Un monto en pesos. Los estudiantes escriben "45.000", "45,000", "$45000" y
 * todas las variantes; en Colombia el punto separa miles y la coma decimales,
 * pero media gente teclea al revés. Como el peso no se usa con centavos, la
 * salida menos ambigua es quedarse con los dígitos: las tres formas dan 45000
 * y ninguna entrada razonable se convierte en otra cosa sin que se note.
 */
function numero(valor: FormDataEntryValue | null): number {
  const crudo = String(valor ?? '').trim();
  const negativo = crudo.startsWith('-');
  const digitos = crudo.replace(/\D/g, '');
  if (digitos === '') return 0;
  const n = Number(digitos);
  if (!Number.isFinite(n)) return 0;
  return negativo ? -n : n;
}

/** Un porcentaje, que sí admite decimales: 72,5 y 72.5 valen lo mismo. */
function porcentaje(valor: FormDataEntryValue | null): number {
  const n = Number(String(valor ?? '').trim().replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function texto(valor: FormDataEntryValue | null): string | null {
  const t = String(valor ?? '').trim();
  return t.length > 0 ? t : null;
}

function fecha(valor: FormDataEntryValue | null): string {
  const t = String(valor ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : claveLocal(new Date());
}

const CATEGORIAS = [
  'ads_meta', 'ads_tiktok', 'envio', 'costo_producto', 'devolucion', 'herramientas', 'otro',
] as const;
const FUENTES = ['tienda', 'marketplace', 'otro'] as const;
const ESTADOS_PRODUCTO = ['activo', 'pausado', 'probando', 'archivado'] as const;
const ESTADOS_CREATIVO = ['ganador', 'probando', 'pausado', 'archivado'] as const;
const PLATAFORMAS = ['meta', 'tiktok', 'ambas'] as const;

/** Acepta el valor sólo si es uno de los del enum; si no, el primero. */
function enumOf<T extends readonly string[]>(lista: T, valor: FormDataEntryValue | null): T[number] {
  const v = String(valor ?? '');
  return (lista as readonly string[]).includes(v) ? (v as T[number]) : lista[0];
}

/** Un id de producto sólo vale si ese producto es del estudiante. */
async function productoPropio(sid: string, valor: FormDataEntryValue | null): Promise<string | null> {
  const id = texto(valor);
  if (!id) return null;
  const { data } = await supabaseAdmin()
    .from('sw_productos')
    .select('id')
    .eq('id', id)
    .eq('student_id', sid)
    .maybeSingle();
  return data?.id ?? null;
}

// --- Ingresos ---------------------------------------------------------------

export async function crearIngreso(formData: FormData): Promise<Resultado> {
  const { sid } = await requireSession();
  const monto = numero(formData.get('monto'));
  if (monto <= 0) return { ok: false, error: 'El monto tiene que ser mayor que cero.' };

  const { error } = await supabaseAdmin().from('sw_ingresos').insert({
    student_id: sid,
    fecha: fecha(formData.get('fecha')),
    fuente: enumOf(FUENTES, formData.get('fuente')),
    producto_id: await productoPropio(sid, formData.get('producto_id')),
    monto,
    pedidos: Math.max(1, Math.round(numero(formData.get('pedidos')) || 1)),
    notas: texto(formData.get('notas')),
  });
  if (error) return { ok: false, error: 'No se pudo guardar. Intenta otra vez.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

export async function borrarIngreso(id: string): Promise<Resultado> {
  const { sid } = await requireSession();
  const { error } = await supabaseAdmin()
    .from('sw_ingresos')
    .delete()
    .eq('id', id)
    .eq('student_id', sid);
  if (error) return { ok: false, error: 'No se pudo borrar.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

// --- Gastos -----------------------------------------------------------------

export async function crearGasto(formData: FormData): Promise<Resultado> {
  const { sid } = await requireSession();
  const monto = numero(formData.get('monto'));
  if (monto <= 0) return { ok: false, error: 'El monto tiene que ser mayor que cero.' };

  const { error } = await supabaseAdmin().from('sw_gastos').insert({
    student_id: sid,
    fecha: fecha(formData.get('fecha')),
    categoria: enumOf(CATEGORIAS, formData.get('categoria')),
    producto_id: await productoPropio(sid, formData.get('producto_id')),
    monto,
    descripcion: texto(formData.get('descripcion')),
  });
  if (error) return { ok: false, error: 'No se pudo guardar. Intenta otra vez.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

export async function borrarGasto(id: string): Promise<Resultado> {
  const { sid } = await requireSession();
  const { error } = await supabaseAdmin()
    .from('sw_gastos')
    .delete()
    .eq('id', id)
    .eq('student_id', sid);
  if (error) return { ok: false, error: 'No se pudo borrar.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

// --- Productos --------------------------------------------------------------

export async function guardarProducto(formData: FormData): Promise<Resultado> {
  const { sid } = await requireSession();
  const nombre = texto(formData.get('nombre'));
  if (!nombre) return { ok: false, error: 'Ponle un nombre al producto.' };

  const campos = {
    nombre,
    estado: enumOf(ESTADOS_PRODUCTO, formData.get('estado')),
    precio_venta: numero(formData.get('precio_venta')),
    precio_tachado: numero(formData.get('precio_tachado')) || null,
    costo_producto: numero(formData.get('costo_producto')),
    costo_envio: numero(formData.get('costo_envio')),
    costo_devolucion: numero(formData.get('costo_devolucion')),
    efectividad_pct: Math.min(100, Math.max(1, porcentaje(formData.get('efectividad_pct')) || 70)),
    landing_url: texto(formData.get('landing_url')),
    notas: texto(formData.get('notas')),
  };

  const id = texto(formData.get('id'));
  const { error } = id
    ? await supabaseAdmin()
        .from('sw_productos')
        .update({ ...campos, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('student_id', sid)
    : await supabaseAdmin().from('sw_productos').insert({ ...campos, student_id: sid });

  if (error) return { ok: false, error: 'No se pudo guardar. Intenta otra vez.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

export async function borrarProducto(id: string): Promise<Resultado> {
  const { sid } = await requireSession();
  const { error } = await supabaseAdmin()
    .from('sw_productos')
    .delete()
    .eq('id', id)
    .eq('student_id', sid);
  if (error) return { ok: false, error: 'No se pudo borrar.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

// --- Creativos --------------------------------------------------------------

export async function guardarCreativo(formData: FormData): Promise<Resultado> {
  const { sid } = await requireSession();
  const nombre = texto(formData.get('nombre'));
  if (!nombre) return { ok: false, error: 'Ponle un nombre al creativo.' };

  const campos = {
    nombre,
    producto_id: await productoPropio(sid, formData.get('producto_id')),
    plataforma: enumOf(PLATAFORMAS, formData.get('plataforma')),
    estado: enumOf(ESTADOS_CREATIVO, formData.get('estado')),
    formato: texto(formData.get('formato')),
    angulo: texto(formData.get('angulo')),
    hook: texto(formData.get('hook')),
    guion: texto(formData.get('guion')),
    cta: texto(formData.get('cta')),
    video_url: texto(formData.get('video_url')),
    notas: texto(formData.get('notas')),
  };

  const id = texto(formData.get('id'));
  const { error } = id
    ? await supabaseAdmin()
        .from('sw_creativos')
        .update({ ...campos, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('student_id', sid)
    : await supabaseAdmin().from('sw_creativos').insert({ ...campos, student_id: sid });

  if (error) return { ok: false, error: 'No se pudo guardar. Intenta otra vez.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}

export async function borrarCreativo(id: string): Promise<Resultado> {
  const { sid } = await requireSession();
  const { error } = await supabaseAdmin()
    .from('sw_creativos')
    .delete()
    .eq('id', id)
    .eq('student_id', sid);
  if (error) return { ok: false, error: 'No se pudo borrar.' };

  revalidatePath('/portal/software', 'layout');
  return { ok: true };
}
