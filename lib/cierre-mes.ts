import { claveLocal, partes, instante } from '@/lib/agenda';
import type { SwGasto, SwIngreso } from '@/lib/software-tipos';

// El cierre de mes.
//
// No es "cuánto vendí": es el estado de resultados del mes, con la plata
// ordenada como la ordenaría un contador — primero lo que entró, después lo
// que costó traerlo, y sólo al final lo que de verdad quedó.
//
// La diferencia con el resumen de la contabilidad diaria es que aquí el mes
// se cierra: se compara contra el anterior y se dice qué cambió y por qué.
//
// Todo en hora de Bogotá, no la del servidor.

export interface MesClave {
  anio: number;
  mes: number;
}

export function mesDe(d: Date): MesClave {
  const [anio, mes] = partes(d);
  return { anio, mes };
}

export function mesAnterior(m: MesClave): MesClave {
  return m.mes === 1 ? { anio: m.anio - 1, mes: 12 } : { anio: m.anio, mes: m.mes - 1 };
}

export function nombreMes(m: MesClave): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${meses[m.mes - 1]} de ${m.anio}`;
}

/** El primer y el último día del mes, en clave YYYY-MM-DD de Bogotá. */
export function rangoDelMes(m: MesClave): { desde: string; hasta: string } {
  const primero = instante(m.anio, m.mes, 1);
  const ultimo = new Date(instante(m.anio, m.mes + 1, 1).getTime() - 86_400_000);
  return { desde: claveLocal(primero), hasta: claveLocal(ultimo) };
}

export function esDelMes(fecha: string, m: MesClave): boolean {
  const { desde, hasta } = rangoDelMes(m);
  return fecha >= desde && fecha <= hasta;
}

export interface LineaCierre {
  concepto: string;
  monto: number;
  /** Qué porcentaje de las ventas se lleva esta línea. */
  pctVentas: number;
}

export interface Cierre {
  mes: MesClave;
  ventas: number;
  pedidos: number;
  ticketPromedio: number;

  /** Lo que costó la mercancía y traerla hasta el cliente. */
  costoDirecto: LineaCierre[];
  totalCostoDirecto: number;
  /** Lo que queda antes de pauta y de gastos fijos. */
  margenBruto: number;
  margenBrutoPct: number;

  pauta: number;
  pautaPct: number;
  /** Retorno sobre la inversión publicitaria. */
  roas: number;
  cpa: number;

  otrosGastos: LineaCierre[];
  totalOtrosGastos: number;

  utilidad: number;
  utilidadPct: number;

  /** Los días del mes que tuvieron movimiento. */
  diasConVentas: number;
  mejorDia: { fecha: string; monto: number } | null;
}

const CATEGORIAS_DIRECTAS = new Set(['costo_producto', 'envio', 'devolucion']);
const CATEGORIAS_PAUTA = new Set(['ads_meta', 'ads_tiktok']);

const ETIQUETAS: Record<string, string> = {
  costo_producto: 'Costo del producto',
  envio: 'Fletes',
  devolucion: 'Devoluciones',
  herramientas: 'Herramientas',
  otro: 'Otros',
  ads_meta: 'Pauta · Meta',
  ads_tiktok: 'Pauta · TikTok',
};

export function calcularCierre(
  ingresos: SwIngreso[],
  gastos: SwGasto[],
  m: MesClave
): Cierre {
  const ing = ingresos.filter((i) => esDelMes(i.fecha, m));
  const gas = gastos.filter((g) => esDelMes(g.fecha, m));

  const ventas = ing.reduce((s, i) => s + Number(i.monto), 0);
  const pedidos = ing.reduce((s, i) => s + i.pedidos, 0);
  const pct = (n: number) => (ventas > 0 ? (n / ventas) * 100 : 0);

  const porCategoria = new Map<string, number>();
  for (const g of gas) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + Number(g.monto));
  }

  const linea = (cat: string): LineaCierre => ({
    concepto: ETIQUETAS[cat] ?? cat,
    monto: porCategoria.get(cat) ?? 0,
    pctVentas: pct(porCategoria.get(cat) ?? 0),
  });

  const costoDirecto = [...CATEGORIAS_DIRECTAS].map(linea).filter((l) => l.monto > 0);
  const totalCostoDirecto = costoDirecto.reduce((s, l) => s + l.monto, 0);

  const pauta = [...CATEGORIAS_PAUTA].reduce((s, c) => s + (porCategoria.get(c) ?? 0), 0);

  const otrosGastos = [...porCategoria.keys()]
    .filter((c) => !CATEGORIAS_DIRECTAS.has(c) && !CATEGORIAS_PAUTA.has(c))
    .map(linea)
    .filter((l) => l.monto > 0);
  const totalOtrosGastos = otrosGastos.reduce((s, l) => s + l.monto, 0);

  const margenBruto = ventas - totalCostoDirecto;
  const utilidad = margenBruto - pauta - totalOtrosGastos;

  // Por día, para saber cuántos días hubo movimiento y cuál fue el mejor.
  const porDia = new Map<string, number>();
  for (const i of ing) porDia.set(i.fecha, (porDia.get(i.fecha) ?? 0) + Number(i.monto));
  let mejorDia: Cierre['mejorDia'] = null;
  for (const [fecha, monto] of porDia) {
    if (!mejorDia || monto > mejorDia.monto) mejorDia = { fecha, monto };
  }

  return {
    mes: m,
    ventas,
    pedidos,
    ticketPromedio: pedidos > 0 ? ventas / pedidos : 0,
    costoDirecto,
    totalCostoDirecto,
    margenBruto,
    margenBrutoPct: pct(margenBruto),
    pauta,
    pautaPct: pct(pauta),
    roas: pauta > 0 ? ventas / pauta : 0,
    cpa: pedidos > 0 ? pauta / pedidos : 0,
    otrosGastos,
    totalOtrosGastos,
    utilidad,
    utilidadPct: pct(utilidad),
    diasConVentas: porDia.size,
    mejorDia,
  };
}

export interface Comparacion {
  concepto: string;
  ahora: number;
  antes: number;
  /** Cuánto cambió, en porcentaje. Null si el mes anterior fue cero. */
  variacionPct: number | null;
  /** true cuando subir es bueno (ventas) y false cuando subir es malo (pauta). */
  subirEsBueno: boolean;
}

/** El mes contra el anterior, en las cifras que de verdad se miran. */
export function comparar(actual: Cierre, previo: Cierre): Comparacion[] {
  const fila = (concepto: string, a: number, b: number, subirEsBueno: boolean): Comparacion => ({
    concepto,
    ahora: a,
    antes: b,
    variacionPct: b !== 0 ? ((a - b) / Math.abs(b)) * 100 : null,
    subirEsBueno,
  });

  return [
    fila('Ventas', actual.ventas, previo.ventas, true),
    fila('Pedidos', actual.pedidos, previo.pedidos, true),
    fila('Ticket promedio', actual.ticketPromedio, previo.ticketPromedio, true),
    fila('Pauta', actual.pauta, previo.pauta, false),
    fila('CPA', actual.cpa, previo.cpa, false),
    fila('Utilidad', actual.utilidad, previo.utilidad, true),
  ];
}

/** Los meses que tienen algún movimiento, del más reciente al más viejo. */
export function mesesConDatos(ingresos: SwIngreso[], gastos: SwGasto[]): MesClave[] {
  const vistos = new Set<string>();
  for (const x of [...ingresos, ...gastos]) {
    const [anio, mes] = x.fecha.split('-').map(Number);
    vistos.add(`${anio}-${mes}`);
  }
  return [...vistos]
    .map((k) => {
      const [anio, mes] = k.split('-').map(Number);
      return { anio, mes };
    })
    .sort((a, b) => b.anio - a.anio || b.mes - a.mes);
}
