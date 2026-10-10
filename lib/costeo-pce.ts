// El costeo de contra entrega, con la cadena completa.
//
// Es la corrección que separa un costeo de verdad de uno de Excel ingenuo. De
// cada 100 pedidos que pides:
//
//   · unos cancelan antes de despachar  → pagaste la pauta y nada más
//   · de los que sí despachas, otros se devuelven → pagaste pauta, flete de
//     ida y flete de vuelta, y no entró un peso
//   · los que quedan son los únicos que pagan
//
// Por eso el margen NUNCA se calcula sobre el precio: se calcula sobre lo que
// queda repartido entre los pedidos que de verdad cobras. Juan costea con 25%
// de cancelaciones y 25% de devoluciones a propósito — si tus números salen
// mejores ganas más de lo que costeaste, y si sales a costear con los números
// bonitos, te quiebras.
//
// Puro: corre igual en el servidor y en el navegador.

export const CANCELACIONES_POR_DEFECTO = 25;
export const DEVOLUCIONES_POR_DEFECTO = 25;

export interface EntradaCosteo {
  /** Lo que te cuesta el producto al proveedor, por unidad. */
  costoProducto: number;
  /** El flete de ida, por pedido despachado. */
  flete: number;
  /**
   * Lo que cuesta además traer de vuelta un pedido devuelto. Si la
   * transportadora te cobra el regreso igual que la ida, va el mismo flete.
   */
  fleteDevolucion: number;
  /** De cada 100 pedidos, cuántos cancelan antes de que salga el paquete. */
  cancelacionesPct: number;
  /** De los que SÍ se despachan, cuántos se devuelven. */
  devolucionesPct: number;
  /** Lo que te cuesta cada pedido en el administrador de anuncios. */
  cpa: number;
  /** Costos fijos repartidos por pedido (empaque, plataforma, lo que sea). */
  otrosPorPedido?: number;
}

/** De 100 pedidos pedidos, en qué terminan. */
export interface Embudo {
  pedidos: number;
  cancelados: number;
  despachados: number;
  devueltos: number;
  /** Los únicos que dejan plata. */
  entregados: number;
  /** Qué porcentaje de lo que pides termina pagando. */
  efectividadReal: number;
}

export function embudo(cancelacionesPct: number, devolucionesPct: number, pedidos = 100): Embudo {
  const c = acotar(cancelacionesPct) / 100;
  const d = acotar(devolucionesPct) / 100;

  const cancelados = pedidos * c;
  const despachados = pedidos - cancelados;
  const devueltos = despachados * d;
  const entregados = despachados - devueltos;

  return {
    pedidos,
    cancelados,
    despachados,
    devueltos,
    entregados,
    efectividadReal: pedidos > 0 ? (entregados / pedidos) * 100 : 0,
  };
}

export interface Costeo {
  embudo: Embudo;
  /** Lo que cuesta cada pedido ENTREGADO una vez repartes todo lo demás. */
  costoPorEntregado: number;
  /** El desglose de ese costo, para poder ver de dónde sale. */
  desglose: {
    producto: number;
    fleteIda: number;
    fleteVuelta: number;
    pauta: number;
    otros: number;
  };
  /** Lo que te queda limpio por pedido entregado. */
  utilidadPorEntregado: number;
  /** Esa utilidad como porcentaje del precio. */
  margenPct: number;
  /** El CPA más alto que puedes pagar sin perder, medido como lo cobra Meta. */
  cpaMaximo: number;
  rentable: boolean;
}

/**
 * El costo de un pedido entregado, con todo lo que se perdió por el camino ya
 * repartido encima. No depende del precio: es lo que hay que cubrir.
 */
export function costoPorEntregado(e: EntradaCosteo): Costeo['desglose'] & { total: number } {
  const emb = embudo(e.cancelacionesPct, e.devolucionesPct);
  const E = emb.entregados;

  // Sin entregados no hay sobre qué repartir: todo pedido es pérdida pura.
  if (E <= 0) {
    return { producto: 0, fleteIda: 0, fleteVuelta: 0, pauta: 0, otros: 0, total: Infinity };
  }

  const desglose = {
    // El producto sólo se consume en los que llegan: el devuelto vuelve al
    // inventario y el cancelado nunca salió.
    producto: e.costoProducto,
    // El flete de ida se paga por todo lo que se despacha, llegue o no.
    fleteIda: (emb.despachados * e.flete) / E,
    // El de vuelta, sólo por los devueltos.
    fleteVuelta: (emb.devueltos * e.fleteDevolucion) / E,
    // La pauta se paga por CADA pedido generado, incluidos los que cancelan.
    // Es el costo que más se subestima.
    pauta: (emb.pedidos * e.cpa) / E,
    otros: e.otrosPorPedido ?? 0,
  };

  return {
    ...desglose,
    total:
      desglose.producto +
      desglose.fleteIda +
      desglose.fleteVuelta +
      desglose.pauta +
      desglose.otros,
  };
}

/** El costeo completo para un precio dado. */
export function costear(e: EntradaCosteo, precio: number): Costeo {
  const emb = embudo(e.cancelacionesPct, e.devolucionesPct);
  const { total, ...desglose } = costoPorEntregado(e);

  const utilidad = precio - total;

  // El techo del CPA: lo que sobra sin contar pauta, devuelto a "por pedido
  // generado", que es como lo reporta el administrador de anuncios.
  const sinPauta = total - desglose.pauta;
  const cpaMaximo =
    emb.pedidos > 0 && emb.entregados > 0
      ? ((precio - sinPauta) * emb.entregados) / emb.pedidos
      : 0;

  return {
    embudo: emb,
    costoPorEntregado: total,
    desglose,
    utilidadPorEntregado: utilidad,
    margenPct: precio > 0 ? (utilidad / precio) * 100 : 0,
    cpaMaximo: Math.max(0, cpaMaximo),
    rentable: utilidad > 0,
  };
}

/**
 * ¿A cuánto lo vendo? Despeja el precio para que quede el margen que quieres.
 *
 *   utilidad = precio − costo        y      utilidad = margen% × precio
 *   ⇒ precio = costo ÷ (1 − margen%)
 */
export function precioParaMargen(e: EntradaCosteo, margenPct: number): number {
  const { total } = costoPorEntregado(e);
  const m = acotar(margenPct, 0, 95) / 100;
  if (!Number.isFinite(total)) return 0;
  return total / (1 - m);
}

/** Quiero que me queden X limpios por pedido entregado. */
export function precioParaUtilidad(e: EntradaCosteo, utilidad: number): number {
  const { total } = costoPorEntregado(e);
  if (!Number.isFinite(total)) return 0;
  return total + utilidad;
}

function acotar(n: number, min = 0, max = 100): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// ---------------------------------------------------------------------------
// El veredicto, en una frase
// ---------------------------------------------------------------------------

export type Veredicto = 'vende-y-deja' | 'apretado' | 'no-da';

export function veredicto(c: Costeo, precio: number): {
  tipo: Veredicto;
  titulo: string;
  detalle: string;
} {
  if (!c.rentable) {
    return {
      tipo: 'no-da',
      titulo: 'Así no da',
      detalle:
        'Con estos números cada pedido que llega te cuesta plata. Sube el precio, baja el costo del producto o arregla la confirmación antes de pautar un peso.',
    };
  }
  if (c.margenPct < 12) {
    return {
      tipo: 'apretado',
      titulo: 'Deja, pero muy apretado',
      detalle:
        'Un margen así no aguanta una mala semana: si el CPA sube un poco o la efectividad baja, se va a cero. Sirve para validar, no para escalar.',
    };
  }
  return {
    tipo: 'vende-y-deja',
    titulo: 'Este se vende y deja',
    detalle: 'Hay aire entre lo que cuesta y lo que cobras, y aguanta que el CPA se mueva.',
  };
}
