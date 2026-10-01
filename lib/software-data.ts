import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { claveLocal, diasAntes } from '@/lib/agenda';

// Se reexportan para que el servidor tenga todo en un solo import.
export {
  calcularCosteo,
  formatearCOP,
  type Costeo,
} from '@/lib/software-costeo';
export {
  CATEGORIAS_GASTO,
  FUENTES_INGRESO,
  calcularResumen,
  serieDiaria,
  type ResumenMes,
  type SwAjustes,
  type SwCreativo,
  type SwGasto,
  type SwIngreso,
  type SwProducto,
} from '@/lib/software-tipos';

import type { SwAjustes, SwCreativo, SwGasto, SwIngreso, SwProducto } from '@/lib/software-tipos';

// Software 1K: la capa de datos de las herramientas del estudiante.
//
// Portado de LUMENS OS, que es la app interna de Juan, con un cambio de fondo:
// allá todo colgaba de un único perfil y aquí cada consulta filtra por
// student_id. Ninguna función de este archivo acepta datos sin ese filtro —
// es lo que impide que un estudiante vea la contabilidad de otro.

// ---------------------------------------------------------------------------
// Consultas — todas filtran por student_id, sin excepción
// ---------------------------------------------------------------------------

export async function getProductos(studentId: string): Promise<SwProducto[]> {
  const { data } = await supabaseAdmin()
    .from('sw_productos')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return (data as unknown as SwProducto[]) ?? [];
}

export async function getIngresos(studentId: string, dias = 90): Promise<SwIngreso[]> {
  const { data } = await supabaseAdmin()
    .from('sw_ingresos')
    .select('*')
    .eq('student_id', studentId)
    .gte('fecha', claveLocal(diasAntes(dias)))
    .order('fecha', { ascending: false });
  return (data as unknown as SwIngreso[]) ?? [];
}

export async function getGastos(studentId: string, dias = 90): Promise<SwGasto[]> {
  const { data } = await supabaseAdmin()
    .from('sw_gastos')
    .select('*')
    .eq('student_id', studentId)
    .gte('fecha', claveLocal(diasAntes(dias)))
    .order('fecha', { ascending: false });
  return (data as unknown as SwGasto[]) ?? [];
}

export async function getCreativos(studentId: string): Promise<SwCreativo[]> {
  const { data } = await supabaseAdmin()
    .from('sw_creativos')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return (data as unknown as SwCreativo[]) ?? [];
}

/** Los ajustes del estudiante, con los valores por defecto si aún no guardó nada. */
export async function getAjustes(studentId: string): Promise<SwAjustes> {
  const { data } = await supabaseAdmin()
    .from('sw_ajustes')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();
  return (
    (data as unknown as SwAjustes) ?? {
      student_id: studentId,
      moneda: 'COP',
      costo_envio_default: 0,
      efectividad_default: 70,
      meta_mensual: 0,
      contexto_marca: null,
    }
  );
}
