// Los dos planes del programa, tal como se venden en la landing.
//
// Las sesiones salen de "una 1:1 por semana" durante los meses del plan.
// Se guardan también en students.sessions_total para poder ajustarlas caso
// por caso sin cambiar el plan (una semana de vacaciones, una sesión extra
// de regalo): el plan da el valor por defecto, no la última palabra.

export type PlanId = 'start' | 'growth';

export interface Plan {
  id: PlanId;
  nombre: string;
  meses: number;
  sesiones: number;
  /** Precio de referencia en centavos, para prellenar el total a cobrar. */
  precioCents: number;
  descripcion: string;
}

export const PLANES: Record<PlanId, Plan> = {
  start: {
    id: 'start',
    nombre: 'Elite Start',
    meses: 3,
    sesiones: 12,
    precioCents: 250_00,
    descripcion: 'Lanzar desde cero hasta las primeras ventas.',
  },
  growth: {
    id: 'growth',
    nombre: 'Elite Growth',
    meses: 6,
    sesiones: 24,
    precioCents: 480_00,
    descripcion: 'Todo lo de Start más 3 meses para estabilizar y escalar.',
  },
};

export const LISTA_PLANES = Object.values(PLANES);

export function plan(id: string | null | undefined): Plan | null {
  return id === 'start' || id === 'growth' ? PLANES[id] : null;
}

/** Sesiones que le tocan: el ajuste manual manda sobre el plan. */
export function sesionesDelEstudiante(
  planId: string | null | undefined,
  sessionsTotal: number | null | undefined
): number {
  if (typeof sessionsTotal === 'number' && sessionsTotal > 0) return sessionsTotal;
  return plan(planId)?.sesiones ?? 0;
}

// ---------- Dinero ----------

/**
 * Los importes viven en centavos y en entero. En coma flotante, sumar tres
 * abonos de 83.33 no da 250 exacto, y en un panel de pagos esa diferencia
 * se ve.
 */
export function formatearDinero(cents: number, moneda = 'USD'): string {
  const valor = cents / 100;
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: valor % 1 === 0 ? 0 : 2,
    }).format(valor);
  } catch {
    // Moneda no reconocida por Intl: se muestra el número con el código.
    return `${valor.toLocaleString('es-CO')} ${moneda}`;
  }
}

/**
 * Texto escrito a mano a centavos. Acepta lo que Juan vaya a teclear de
 * verdad: "250", "$480", "250,50", "1.234,56", "1.000.000".
 *
 * El separador decimal es el ÚLTIMO punto o coma, y solo si le siguen una o
 * dos cifras; si le siguen tres es un separador de miles ("1.000" son mil,
 * no uno con tres decimales). El resto de puntos y comas se descartan.
 *
 * Vacío devuelve 0 ("todavía no hay importe"), pero un texto sin ningún
 * dígito devuelve null: si alguien escribe cualquier cosa, es un error que
 * hay que mostrarle, no un cero silencioso.
 */
export function aCentavos(texto: string): number | null {
  const bruto = texto.trim();
  if (!bruto) return 0;

  const negativo = /^-/.test(bruto);
  const soloNumeros = bruto.replace(/[^\d,.]/g, '');
  if (!/\d/.test(soloNumeros)) return null;

  const ultimoSep = Math.max(soloNumeros.lastIndexOf('.'), soloNumeros.lastIndexOf(','));
  let enteros = soloNumeros;
  let decimales = '';

  if (ultimoSep !== -1) {
    const cola = soloNumeros.slice(ultimoSep + 1);
    if (/^\d{1,2}$/.test(cola)) {
      enteros = soloNumeros.slice(0, ultimoSep);
      decimales = cola.padEnd(2, '0');
    }
  }

  enteros = enteros.replace(/[.,]/g, '');
  const n = Number(`${enteros || '0'}.${decimales || '0'}`);
  if (!Number.isFinite(n) || negativo) return null;
  return Math.round(n * 100);
}

export function estadoDePago(pagadoCents: number, totalCents: number) {
  if (totalCents <= 0) return { etiqueta: 'Sin definir', pct: 0, alDia: false } as const;
  const pct = Math.min(100, Math.round((pagadoCents / totalCents) * 100));
  if (pagadoCents >= totalCents) return { etiqueta: 'Pagado completo', pct: 100, alDia: true } as const;
  if (pagadoCents <= 0) return { etiqueta: 'Sin pagos', pct: 0, alDia: false } as const;
  return { etiqueta: 'Abono parcial', pct, alDia: false } as const;
}
