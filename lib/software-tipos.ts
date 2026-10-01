import { claveLocal, diasAntes } from '@/lib/agenda';

// Se reexporta desde aquí para que un formulario no tenga que saber en cuál de
// los dos archivos vive cada cosa.
export { formatearCOP } from '@/lib/software-costeo';

// Las formas de los datos del Software 1K y las etiquetas que se muestran.
//
// Va aparte de software-data.ts porque ese archivo es server-only y los
// formularios son componentes de cliente: necesitan los mismos tipos y las
// mismas listas de categorías, pero no pueden arrastrar el cliente de Supabase
// al navegador.

export interface SwProducto {
  id: string;
  student_id: string;
  nombre: string;
  estado: 'activo' | 'pausado' | 'probando' | 'archivado';
  precio_venta: number;
  precio_tachado: number | null;
  costo_producto: number;
  costo_envio: number;
  costo_devolucion: number;
  efectividad_pct: number;
  landing_url: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwIngreso {
  id: string;
  student_id: string;
  fecha: string;
  fuente: 'tienda' | 'marketplace' | 'otro';
  producto_id: string | null;
  monto: number;
  pedidos: number;
  notas: string | null;
}

export interface SwGasto {
  id: string;
  student_id: string;
  fecha: string;
  categoria: 'ads_meta' | 'ads_tiktok' | 'envio' | 'costo_producto' | 'devolucion' | 'herramientas' | 'otro';
  producto_id: string | null;
  monto: number;
  descripcion: string | null;
}

export interface SwCreativo {
  id: string;
  student_id: string;
  nombre: string;
  producto_id: string | null;
  plataforma: 'meta' | 'tiktok' | 'ambas';
  estado: 'ganador' | 'probando' | 'pausado' | 'archivado';
  formato: string | null;
  angulo: string | null;
  hook: string | null;
  guion: string | null;
  cta: string | null;
  video_url: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwAjustes {
  student_id: string;
  moneda: string;
  costo_envio_default: number;
  efectividad_default: number;
  meta_mensual: number;
  contexto_marca: string | null;
}

export const CATEGORIAS_GASTO: { id: SwGasto['categoria']; nombre: string }[] = [
  { id: 'ads_meta', nombre: 'Pauta · Meta' },
  { id: 'ads_tiktok', nombre: 'Pauta · TikTok' },
  { id: 'costo_producto', nombre: 'Costo del producto' },
  { id: 'envio', nombre: 'Envíos' },
  { id: 'devolucion', nombre: 'Devoluciones' },
  { id: 'herramientas', nombre: 'Herramientas' },
  { id: 'otro', nombre: 'Otro' },
];

export const FUENTES_INGRESO: { id: SwIngreso['fuente']; nombre: string }[] = [
  { id: 'tienda', nombre: 'Mi tienda' },
  { id: 'marketplace', nombre: 'Marketplace' },
  { id: 'otro', nombre: 'Otro' },
];

// Lo que se muestra arriba de la contabilidad. Puro cálculo sobre lo ya consultado.
export interface ResumenMes {
  ingresos: number;
  gastos: number;
  utilidad: number;
  pedidos: number;
  ticketPromedio: number;
  gastoPauta: number;
  /** Retorno sobre la inversión publicitaria. */
  roas: number;
  /** Lo que cuesta conseguir un pedido. */
  cpa: number;
  margenPct: number;
}

export function calcularResumen(ingresos: SwIngreso[], gastos: SwGasto[]): ResumenMes {
  const totalIngresos = ingresos.reduce((s, i) => s + Number(i.monto), 0);
  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const pedidos = ingresos.reduce((s, i) => s + i.pedidos, 0);
  const gastoPauta = gastos
    .filter((g) => g.categoria === 'ads_meta' || g.categoria === 'ads_tiktok')
    .reduce((s, g) => s + Number(g.monto), 0);

  return {
    ingresos: totalIngresos,
    gastos: totalGastos,
    utilidad: totalIngresos - totalGastos,
    pedidos,
    ticketPromedio: pedidos > 0 ? totalIngresos / pedidos : 0,
    gastoPauta,
    roas: gastoPauta > 0 ? totalIngresos / gastoPauta : 0,
    cpa: pedidos > 0 ? gastoPauta / pedidos : 0,
    margenPct: totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0,
  };
}

/** Serie diaria de los últimos N días, para la gráfica. */
export function serieDiaria(
  ingresos: SwIngreso[],
  gastos: SwGasto[],
  dias = 30
): { fecha: string; ingresos: number; gastos: number }[] {
  const mapa = new Map<string, { ingresos: number; gastos: number }>();
  for (let i = dias - 1; i >= 0; i--) {
    mapa.set(claveLocal(diasAntes(i)), { ingresos: 0, gastos: 0 });
  }
  for (const n of ingresos) {
    const d = mapa.get(n.fecha);
    if (d) d.ingresos += Number(n.monto);
  }
  for (const g of gastos) {
    const d = mapa.get(g.fecha);
    if (d) d.gastos += Number(g.monto);
  }
  return [...mapa.entries()].map(([fecha, v]) => ({ fecha, ...v }));
}
