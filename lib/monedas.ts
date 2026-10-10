// Las monedas de contra entrega en Latinoamérica.
//
// No basta con cambiar el símbolo: en Colombia un flete son $12.000 y en
// dólares son $5,94. Si el deslizador se mueve de uno en uno, en pesos no
// llegas nunca y en dólares te pasas de largo. Por eso cada moneda trae su
// propio paso y su propio techo.

export interface Moneda {
  id: string;
  /** Lo que se lee en la pestaña. */
  codigo: string;
  pais: string;
  simbolo: string;
  locale: string;
  /** Cuántos decimales tiene sentido mostrar. */
  decimales: number;
  /** De cuánto en cuánto se mueve el deslizador de dinero. */
  paso: number;
  /** El techo de los deslizadores de costo. */
  techo: number;
}

export const MONEDAS: Moneda[] = [
  { id: 'COP', codigo: 'COP', pais: 'Colombia', simbolo: '$', locale: 'es-CO', decimales: 0, paso: 500, techo: 400_000 },
  { id: 'MXN', codigo: 'MXN', pais: 'México', simbolo: '$', locale: 'es-MX', decimales: 0, paso: 10, techo: 8_000 },
  { id: 'USD', codigo: 'USD', pais: 'EE. UU. · Ecuador · Panamá', simbolo: '$', locale: 'en-US', decimales: 2, paso: 0.5, techo: 400 },
  { id: 'PEN', codigo: 'PEN', pais: 'Perú', simbolo: 'S/', locale: 'es-PE', decimales: 0, paso: 2, techo: 1_500 },
  { id: 'CLP', codigo: 'CLP', pais: 'Chile', simbolo: '$', locale: 'es-CL', decimales: 0, paso: 500, techo: 400_000 },
  { id: 'ARS', codigo: 'ARS', pais: 'Argentina', simbolo: '$', locale: 'es-AR', decimales: 0, paso: 500, techo: 500_000 },
  { id: 'PYG', codigo: 'PYG', pais: 'Paraguay', simbolo: '₲', locale: 'es-PY', decimales: 0, paso: 5_000, techo: 3_000_000 },
  { id: 'BOB', codigo: 'BOB', pais: 'Bolivia', simbolo: 'Bs', locale: 'es-BO', decimales: 0, paso: 5, techo: 3_000 },
  { id: 'GTQ', codigo: 'GTQ', pais: 'Guatemala', simbolo: 'Q', locale: 'es-GT', decimales: 0, paso: 5, techo: 3_000 },
  { id: 'DOP', codigo: 'DOP', pais: 'R. Dominicana', simbolo: 'RD$', locale: 'es-DO', decimales: 0, paso: 25, techo: 25_000 },
];

export const MONEDA_POR_DEFECTO = MONEDAS[0];

export function moneda(id: string): Moneda {
  return MONEDAS.find((m) => m.id === id) ?? MONEDA_POR_DEFECTO;
}

/** El número con su símbolo, redondeado como corresponde a esa moneda. */
export function formatear(valor: number, m: Moneda): string {
  if (!Number.isFinite(valor)) return '—';
  const n = new Intl.NumberFormat(m.locale, {
    minimumFractionDigits: m.decimales,
    maximumFractionDigits: m.decimales,
  }).format(valor);
  return `${m.simbolo}${n}`;
}

/** Sin símbolo, para meterlo dentro de una frase donde el símbolo estorba. */
export function formatearSeco(valor: number, m: Moneda): string {
  if (!Number.isFinite(valor)) return '—';
  return new Intl.NumberFormat(m.locale, {
    minimumFractionDigits: m.decimales,
    maximumFractionDigits: m.decimales,
  }).format(valor);
}

/**
 * Valores de arranque razonables por moneda, para que la calculadora abra con
 * algo creíble en vez de ceros. Son el orden de magnitud de un producto típico
 * de contra entrega en ese país.
 */
export function valoresIniciales(m: Moneda): {
  costoProducto: number;
  flete: number;
  cpa: number;
} {
  const escala = m.techo / 400; // el techo de USD es la referencia
  return {
    costoProducto: Math.round((25 * escala) / m.paso) * m.paso,
    flete: Math.round((14 * escala) / m.paso) * m.paso,
    cpa: Math.round((18 * escala) / m.paso) * m.paso,
  };
}
