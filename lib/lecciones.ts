import type { ModuleContent, TheoryBlock2 } from '@/lib/modules-content';

// Las lecciones de dentro de un módulo, al estilo Skool: en vez de un muro de
// teoría, una lista de cosas concretas que se van marcando.
//
// No hace falta reescribir el contenido para tenerlas. Cada módulo ya venía
// partido en encabezados, y cada encabezado es justo "una cosa que explicar",
// así que de ahí salen las lecciones solas. Un módulo puede declarar su propia
// lista cuando quiera un desglose más fino que sus encabezados — es lo que
// hace Shopify, que tiene diez pasos y solo tres encabezados.

export interface Leccion {
  /** Estable entre despliegues: es lo que se guarda como "vista". */
  id: string;
  emoji: string | null;
  titulo: string;
  bloques: TheoryBlock2[];
  /** true cuando todavía no hay contenido escrito para esta lección. */
  porEscribir: boolean;
}

/** Lo que un módulo declara a mano en modules-content.tsx. */
export interface LeccionDef {
  id: string;
  emoji?: string;
  titulo: string;
  bloques?: TheoryBlock2[];
}

/** Un id de URL y de base de datos a partir del título. */
export function idDeTitulo(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * Parte la teoría en lecciones por encabezado.
 *
 * Lo que va antes del primer encabezado (la introducción) se queda pegado a la
 * primera lección en vez de convertirse en una lección suelta sin título.
 */
function porEncabezados(theory: TheoryBlock2[]): Leccion[] {
  const lecciones: Leccion[] = [];
  let sueltos: TheoryBlock2[] = [];

  for (const bloque of theory) {
    if (bloque.type === 'heading') {
      lecciones.push({
        id: idDeTitulo(bloque.text),
        emoji: null,
        titulo: bloque.text,
        bloques: [...sueltos],
        porEscribir: false,
      });
      sueltos = [];
    } else if (lecciones.length === 0) {
      sueltos.push(bloque);
    } else {
      lecciones[lecciones.length - 1].bloques.push(bloque);
    }
  }

  // Si nunca hubo encabezado, el módulo entero es una sola lección.
  if (lecciones.length === 0 && sueltos.length > 0) {
    return [{ id: 'contenido', emoji: null, titulo: 'Contenido', bloques: sueltos, porEscribir: false }];
  }
  return lecciones;
}

export function leccionesDe(content: ModuleContent | null): Leccion[] {
  if (!content) return [];
  if (content.lecciones?.length) {
    return content.lecciones.map((l) => ({
      id: l.id,
      emoji: l.emoji ?? null,
      titulo: l.titulo,
      bloques: l.bloques ?? [],
      porEscribir: !l.bloques?.length,
    }));
  }
  return porEncabezados(content.theory);
}

/** Porcentaje del módulo, contando solo las lecciones que ya tienen contenido. */
export function progresoDeLecciones(lecciones: Leccion[], vistas: string[]): number {
  const cuentan = lecciones.filter((l) => !l.porEscribir);
  if (cuentan.length === 0) return 0;
  const hechas = cuentan.filter((l) => vistas.includes(l.id)).length;
  return Math.round((hechas / cuentan.length) * 100);
}
