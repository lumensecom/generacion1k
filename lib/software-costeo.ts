// La matemática del costeo. Va aparte de software-data.ts porque ese archivo es
// server-only y esto tiene que correr también en el navegador: la calculadora
// recalcula mientras el estudiante escribe, sin ida y vuelta al servidor.

// ---------------------------------------------------------------------------
// Costeo
//
// La base es la de LUMENS OS, pero con una corrección que en contra entrega lo
// cambia todo: allá el margen se calculaba por venta, y aquí por unidad
// ENTREGADA Y COBRADA. Con 70% de efectividad, de cada 10 pedidos 3 vuelven y
// de esos 3 pagas el envío de ida y el de vuelta sin ingresar un peso.
//
// Un producto que "deja $30.000 por venta" puede estar perdiendo dinero, y esa
// es la cuenta que casi nadie hace antes de escalar.
// ---------------------------------------------------------------------------

export interface Costeo {
  /** Costo del producto puesto en la puerta del cliente. */
  cogs: number;
  /** Margen por venta, sin contar devoluciones. El número optimista. */
  margenBruto: number;
  margenBrutoPct: number;
  /** Lo que de verdad queda por unidad entregada, con las devoluciones dentro. */
  margenReal: number;
  margenRealPct: number;
  /**
   * El CPA máximo que puedes pagar sin perder, medido como lo mide Meta: por
   * pedido generado, no por pedido entregado.
   */
  cpaMaximo: number;
  /** Lo que cuesta cada pedido que se devuelve. */
  costoPorDevolucion: number;
  /** Cuánto le quitan las devoluciones a cada venta que sí cobras. */
  devolucionesPorVenta: number;
  /** Cuánto le quita la pauta a cada venta que sí cobras. */
  pautaPorVenta: number;
  /** A partir de qué efectividad el producto deja de ser rentable. */
  efectividadMinima: number;
  rentable: boolean;
}

export function calcularCosteo(input: {
  precioVenta: number;
  costoProducto: number;
  costoEnvio: number;
  costoDevolucion: number;
  efectividadPct: number;
  cpaReal?: number;
}): Costeo {
  const precio = input.precioVenta || 0;
  const cogs = (input.costoProducto || 0) + (input.costoEnvio || 0);
  const margenBruto = precio - cogs;
  const margenBrutoPct = precio > 0 ? (margenBruto / precio) * 100 : 0;

  const efect = Math.min(100, Math.max(0, input.efectividadPct || 0)) / 100;
  // Cada pedido devuelto cuesta el envío de ida, el de vuelta y lo que se
  // pierda del producto si no vuelve en condiciones de revenderse.
  const costoPorDevolucion = (input.costoEnvio || 0) + (input.costoDevolucion || 0);
  const devueltosPorEntregado = efect > 0 ? (1 - efect) / efect : 0;
  const margenSinPauta = margenBruto - devueltosPorEntregado * costoPorDevolucion;

  // La pauta se paga por pedido generado, que es como la reporta Meta, pero el
  // margen se gana sólo sobre los entregados. Por eso el CPA pesa más de lo que
  // parece: con 70% de efectividad, un CPA de 30.000 cuesta 42.857 por venta
  // que de verdad cobras. Confundir las dos cosas es lo que hace que un
  // producto "rentable en el papel" cierre el mes en rojo.
  const cpaPorEntregado = efect > 0 ? (input.cpaReal ?? 0) / efect : 0;
  const margenReal = margenSinPauta - cpaPorEntregado;
  const margenRealPct = precio > 0 ? (margenReal / precio) * 100 : 0;

  // Y al revés: el techo del CPA que puedes pagar por pedido generado.
  const cpaMaximo = margenSinPauta * efect;

  // Efectividad a la que el margen real llega a cero, sin contar pauta.
  const efectividadMinima =
    margenBruto + costoPorDevolucion > 0
      ? (costoPorDevolucion / (margenBruto + costoPorDevolucion)) * 100
      : 100;

  return {
    cogs,
    margenBruto,
    margenBrutoPct,
    margenReal,
    margenRealPct,
    cpaMaximo,
    costoPorDevolucion,
    devolucionesPorVenta: devueltosPorEntregado * costoPorDevolucion,
    pautaPorVenta: cpaPorEntregado,
    efectividadMinima,
    rentable: margenReal > 0,
  };
}

export function formatearCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}
