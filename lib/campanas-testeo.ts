// ¿Cuál sigue y cuál apago?
//
// Las reglas de testeo de Juan, escritas una sola vez. Él las enseña sobre un
// presupuesto de $100.000 COP al día y revisa en tres puntos: a los $20.000,
// a los $30.000 y a los $40.000 gastados. Esos puntos son el 20%, el 30% y el
// 40% del día, así que aquí viven como porcentaje y funcionan igual con
// cualquier presupuesto y en cualquier moneda.
//
// Lo mismo con los topes de CPPI (costo por pago iniciado): $4.000, $5.000 y
// $6.000 sobre un día de $100.000 son el 4%, el 5% y el 6% del presupuesto.
//
// Nada de esto se guarda: el archivo se lee en el navegador y se descarta.

export type Decision = 'apagar' | 'flojo' | 'mantener' | 'escalar' | 'esperar';

export interface CampanaCruda {
  nombre: string;
  gasto: number;
  pagosIniciados: number;
  compras: number;
  cpm: number | null;
  cpc: number | null;
  impresiones: number | null;
}

export interface Diagnostico extends CampanaCruda {
  /** El costo de cada pago iniciado. Null si todavía no hay ninguno. */
  cppi: number | null;
  /** En cuál de los tres puntos críticos cae lo que lleva gastado. */
  punto: 20 | 30 | 40 | null;
  decision: Decision;
  titulo: string;
  porque: string;
}

export const DECISIONES: Record<Decision, { etiqueta: string; color: string; orden: number }> = {
  apagar: { etiqueta: 'Apágala', color: '#F87171', orden: 0 },
  flojo: { etiqueta: 'Floja', color: '#F59E0B', orden: 1 },
  mantener: { etiqueta: 'Mantener', color: '#22D3EE', orden: 2 },
  escalar: { etiqueta: 'Déjala correr', color: '#10B981', orden: 3 },
  esperar: { etiqueta: 'Aún es pronto', color: '#75757F', orden: 4 },
};

/** Los tres puntos de revisión, como fracción del presupuesto del día. */
export const PUNTOS = [0.2, 0.3, 0.4] as const;

/**
 * Juzga una campaña de testeo contra las reglas, según cuánto lleve gastado.
 *
 * `presupuestoDia` es lo que la campaña tiene asignado por día. Es lo que
 * convierte las reglas en relativas: sin él no se sabe si $20.000 gastados es
 * el principio del día o ya se acabó.
 */
export function diagnosticar(c: CampanaCruda, presupuestoDia: number): Diagnostico {
  const cppi = c.pagosIniciados > 0 ? c.gasto / c.pagosIniciados : null;
  const avance = presupuestoDia > 0 ? c.gasto / presupuestoDia : 0;

  const topeCPPI = (pct: number) => presupuestoDia * pct;

  const base = { ...c, cppi };

  // Todavía no llega al primer punto de revisión: no hay nada que juzgar.
  if (avance < PUNTOS[0]) {
    return {
      ...base,
      punto: null,
      decision: 'esperar',
      titulo: 'Déjala llegar al primer corte',
      porque: `Lleva ${pct(avance)} del día. La primera revisión es al ${pct(PUNTOS[0])} del presupuesto; antes de eso los números no dicen nada.`,
    };
  }

  // ---- Punto 3: al 40% del día ----
  if (avance >= PUNTOS[2]) {
    if (c.compras === 0) {
      return {
        ...base,
        punto: 40,
        decision: 'apagar',
        titulo: 'Apágala',
        porque:
          cppi !== null && cppi <= topeCPPI(0.04)
            ? 'Gastó el 40% del día sin una sola venta. Y ojo: el CPPI está bien, así que el problema no es el anuncio — es el formulario o la oferta.'
            : 'Gastó el 40% del día sin una sola venta. No hay por dónde salvarla.',
      };
    }
    if (c.compras >= 2) {
      return {
        ...base,
        punto: 40,
        decision: 'escalar',
        titulo: 'Déjala gastar el día entero',
        porque: `${c.compras} ventas antes del 40% del presupuesto. Si salen rentables, esta es la que hay que dejar correr.`,
      };
    }
    return {
      ...base,
      punto: 40,
      decision: 'mantener',
      titulo: 'Mantener',
      porque: 'Ya tiene venta al 40% del día. Déjala seguir y la revisas al cierre.',
    };
  }

  // ---- Punto 2: al 30% del día ----
  if (avance >= PUNTOS[1]) {
    if (c.compras === 0) {
      if (cppi === null || cppi > topeCPPI(0.06)) {
        return {
          ...base,
          punto: 30,
          decision: 'apagar',
          titulo: 'Apágala',
          porque:
            cppi === null
              ? 'Al 30% del día no tiene ventas ni pagos iniciados. No hay señal.'
              : `Sin ventas y con el pago iniciado por encima del ${pct(0.06)} del presupuesto. Muy caro para lo que está trayendo.`,
        };
      }
      // "Entre 5% y 6%" es inclusivo en los dos extremos.
      if (cppi >= topeCPPI(0.05)) {
        return {
          ...base,
          punto: 30,
          decision: 'flojo',
          titulo: 'Bastante floja',
          porque: 'Sin ventas y el pago iniciado en la franja cara. Dale un poco más, pero con el dedo en el botón.',
        };
      }
      return {
        ...base,
        punto: 30,
        decision: 'mantener',
        titulo: 'Mantener',
        porque: 'Todavía no vende, pero el pago iniciado está barato. Vale la pena dejarla llegar al siguiente corte.',
      };
    }
    if (cppi !== null && cppi < topeCPPI(0.04)) {
      return {
        ...base,
        punto: 30,
        decision: 'escalar',
        titulo: 'Buen pronóstico',
        porque: 'Ya vendió y el pago iniciado está barato al 30% del día. Esta pinta bien.',
      };
    }
    return {
      ...base,
      punto: 30,
      decision: 'mantener',
      titulo: 'Mantener',
      porque: 'Ya tiene venta al 30% del día. Déjala seguir hasta el siguiente corte.',
    };
  }

  // ---- Punto 1: al 20% del día ----
  if (c.compras > 0) {
    return {
      ...base,
      punto: 20,
      decision: 'escalar',
      titulo: 'Maravilloso',
      porque: 'Vendió antes del 20% del presupuesto. Déjala correr sin tocarla.',
    };
  }
  if (c.pagosIniciados <= 2) {
    return {
      ...base,
      punto: 20,
      decision: 'apagar',
      titulo: 'Apágala',
      porque: `${c.pagosIniciados} ${c.pagosIniciados === 1 ? 'pago iniciado' : 'pagos iniciados'} al 20% del día: a nadie le está interesando. Mira el CPM y el CPC antes de volver a lanzarla.`,
    };
  }
  return {
    ...base,
    punto: 20,
    decision: 'flojo',
    titulo: 'Floja, pero se mantiene',
    porque: `${c.pagosIniciados} pagos iniciados al 20% del día. Hay algo de interés; déjala llegar al siguiente corte.`,
  };
}

function pct(f: number): string {
  return `${Math.round(f * 100)}%`;
}

// ---------------------------------------------------------------------------
// Leer el export de Meta o TikTok
// ---------------------------------------------------------------------------

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normal = (h: string) => sinAcentos(String(h ?? '').toLowerCase()).replace(/\s+/g, ' ').trim();

/**
 * Los nombres cambian entre Meta y TikTok, entre español e inglés y entre
 * versiones del exportador. Se buscan por coincidencia parcial y en orden de
 * preferencia, igual que en el análisis de Dropi.
 */
const COLUMNAS = {
  nombre: ['nombre de la campana', 'nombre del conjunto', 'nombre del anuncio', 'campaign name', 'ad set name', 'nombre', 'campana'],
  gasto: ['importe gastado', 'amount spent', 'costo', 'cost', 'gasto', 'spend', 'total gastado'],
  pagosIniciados: ['pagos iniciados', 'inicio de pago', 'inicios de pago', 'checkouts initiated', 'initiate checkout', 'pagar'],
  compras: ['compras', 'purchases', 'conversiones', 'conversions', 'resultados', 'results', 'pedidos'],
  cpm: ['cpm', 'costo por mil'],
  cpc: ['cpc', 'costo por clic'],
  impresiones: ['impresiones', 'impressions'],
} as const;

function buscarCol(headers: string[], patrones: readonly string[]): number {
  const n = headers.map(normal);
  for (const p of patrones) {
    const i = n.findIndex((h) => h.includes(p));
    if (i !== -1) return i;
  }
  return -1;
}

/** "1.234,56" / "$1,234.56" / "1234" → número. */
export function aNumero(crudo: unknown): number {
  if (typeof crudo === 'number') return Number.isFinite(crudo) ? crudo : 0;
  let s = String(crudo ?? '').replace(/[^\d.,-]/g, '').trim();
  if (!s) return 0;
  const decimal = s.match(/[.,](\d{1,2})$/);
  const ultimo = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  if (decimal && ultimo === s.length - decimal[1].length - 1) {
    s = `${s.slice(0, ultimo).replace(/[.,]/g, '')}.${decimal[1]}`;
  } else {
    s = s.replace(/[.,]/g, '');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export interface LecturaCampanas {
  campanas: CampanaCruda[];
  /** Columnas clave que no se pudieron emparejar, para poder avisarlo. */
  sinMapear: string[];
}

/** Convierte la grilla cruda del archivo (fila 0 = encabezados) en campañas. */
export function leerCampanas(grid: unknown[][]): LecturaCampanas {
  if (!grid || grid.length < 2) return { campanas: [], sinMapear: [] };

  const headers = (grid[0] ?? []).map((h) => String(h ?? ''));
  const col = {
    nombre: buscarCol(headers, COLUMNAS.nombre),
    gasto: buscarCol(headers, COLUMNAS.gasto),
    pagosIniciados: buscarCol(headers, COLUMNAS.pagosIniciados),
    compras: buscarCol(headers, COLUMNAS.compras),
    cpm: buscarCol(headers, COLUMNAS.cpm),
    cpc: buscarCol(headers, COLUMNAS.cpc),
    impresiones: buscarCol(headers, COLUMNAS.impresiones),
  };

  const sinMapear: string[] = [];
  if (col.gasto === -1) sinMapear.push('importe gastado');
  if (col.pagosIniciados === -1) sinMapear.push('pagos iniciados');
  if (col.compras === -1) sinMapear.push('compras');

  const celda = (fila: unknown[], i: number) => (i >= 0 ? fila[i] : undefined);

  const campanas: CampanaCruda[] = [];
  for (let i = 1; i < grid.length; i++) {
    const fila = grid[i];
    if (!fila || fila.every((c) => String(c ?? '').trim() === '')) continue;

    const nombre = String(celda(fila, col.nombre) ?? '').trim();
    const gasto = aNumero(celda(fila, col.gasto));
    // Las filas de totales que Meta mete al final no tienen nombre de campaña.
    if (!nombre && gasto === 0) continue;
    if (/^(total|totales)\b/i.test(nombre)) continue;

    campanas.push({
      nombre: nombre || `Fila ${i}`,
      gasto,
      pagosIniciados: Math.round(aNumero(celda(fila, col.pagosIniciados))),
      compras: Math.round(aNumero(celda(fila, col.compras))),
      cpm: col.cpm >= 0 ? aNumero(celda(fila, col.cpm)) : null,
      cpc: col.cpc >= 0 ? aNumero(celda(fila, col.cpc)) : null,
      impresiones: col.impresiones >= 0 ? Math.round(aNumero(celda(fila, col.impresiones))) : null,
    });
  }

  return { campanas, sinMapear };
}

/** Diagnostica todas y las ordena: primero lo que hay que apagar hoy. */
export function diagnosticarTodas(
  campanas: CampanaCruda[],
  presupuestoDia: number
): Diagnostico[] {
  return campanas
    .map((c) => diagnosticar(c, presupuestoDia))
    .sort((a, b) => DECISIONES[a.decision].orden - DECISIONES[b.decision].orden || b.gasto - a.gasto);
}
