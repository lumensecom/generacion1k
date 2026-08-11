import type { ReactNode } from 'react';
import { MODULES_CONTENT, type ModuleContent, type TheoryBlock2 } from '@/lib/modules-content';

// Convierte el contenido de los módulos (que es JSX, no texto) en texto plano
// para poder mandárselo al modelo como material de consulta.
//
// El asistente NO habla de ecommerce en general: responde con LO QUE JUAN
// ENSEÑA. Por eso el contexto sale de MODULES_CONTENT y no de la base de
// datos: así el asistente sigue funcionando aunque Supabase esté caído, y
// responde exactamente lo mismo que el estudiante acaba de leer.

// Los títulos viven en supabase/seed.sql, pero duplicarlos aquí mantiene al
// asistente independiente de la base de datos. Si cambias un título allá,
// cámbialo aquí — es la única duplicación deliberada del archivo.
const TITULOS: Record<string, string> = {
  'mentalidad-pce': 'Mentalidad del emprendedor PCE',
  'producto-ganador': 'Cómo elegir tu producto ganador',
  'setup-shopify': 'Setup Shopify completo',
  'dropi-adma': 'Dropi + ADMA: configuración',
  'releasit-cod': 'ReleasIt COD: pagos y confirmación',
  'pixel-tracking': 'Meta Pixel + TikTok Pixel',
  'primer-creativo': 'Cómo crear tu primer creativo ganador',
  lanzamiento: 'Lanzamiento de tu primera campaña',
  escalado: 'Optimización y escalado',
  'devoluciones-cs': 'Gestión de devoluciones y customer service',
};

const ORDEN = Object.keys(TITULOS);

/**
 * Extrae el texto de un ReactNode sin renderizarlo. La teoría mezcla strings
 * sueltos con JSX (`<span><B>Miedo</B> — "¿y si no funciona?"</span>`), así
 * que hay que bajar por props.children recursivamente.
 */
function textoDe(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textoDe).join('');

  // Elemento de React: puede ser <B> (nuestro helper) o cualquier etiqueta.
  const props = (node as { props?: { children?: ReactNode } }).props;
  return props?.children ? textoDe(props.children) : '';
}

function bloqueATexto(b: TheoryBlock2): string {
  switch (b.type) {
    case 'heading':
      return `\n## ${b.text}`;
    case 'paragraph':
      return textoDe(b.content);
    case 'list':
      return b.items.map((i) => `- ${textoDe(i)}`).join('\n');
    case 'stats':
      return b.items.map((s) => `- ${s.prefix ?? ''}${s.number}${s.suffix ?? ''}: ${s.label}`).join('\n');
    case 'diagram':
      return `Flujo: ${b.steps.join(' → ')}`;
    case 'callout':
      return `[${b.variant.toUpperCase()}] ${textoDe(b.content)}`;
    case 'example':
      return `Ejemplo${b.company ? ` (${b.company})` : ''}: ${textoDe(b.content)}`;
    case 'comparison':
      return b.columns
        .map((c) => `${c.label}:\n${c.items.map((i) => `  - ${textoDe(i)}`).join('\n')}`)
        .join('\n');
    case 'timeline':
      return b.steps.map((s, i) => `${i + 1}. ${textoDe(s.title)} — ${textoDe(s.description)}`).join('\n');
    case 'toolGrid':
      return `Herramientas: ${b.tools.map((t) => `${t.name} (${t.url}) — ${t.description}`).join('; ')}`;
    case 'toolExplainer':
      return `[Animación explicativa: ${b.tool}]`;
    default: {
      // Si algún día se añade un tipo de bloque nuevo, TypeScript avisa aquí
      // en vez de dejar el bloque fuera del contexto en silencio.
      const _exhaustivo: never = b;
      return String(_exhaustivo);
    }
  }
}

export interface ModuloTexto {
  slug: string;
  titulo: string;
  numero: number;
  texto: string;
  /** Texto normalizado (sin tildes, minúsculas) para la búsqueda. */
  indice: string;
}

function moduloATexto(m: ModuleContent, numero: number): ModuloTexto {
  const titulo = TITULOS[m.slug] ?? m.slug;
  const cuerpo = [
    `# MÓDULO ${numero}: ${titulo}`,
    `${m.introLine1} ${m.introLine2 ?? ''}`.trim(),
    ...m.theory.map(bloqueATexto),
    '\n## Práctica de este módulo',
    ...m.practiceChecklist.map((p) => `- ${p}`),
  ].join('\n');

  return { slug: m.slug, titulo, numero, texto: cuerpo, indice: normalizar(cuerpo) };
}

export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Se construye una sola vez por instancia del servidor. */
export const MODULOS_TEXTO: ModuloTexto[] = ORDEN.map((slug, i) => {
  const contenido = MODULES_CONTENT[slug];
  return contenido ? moduloATexto(contenido, i + 1) : null;
}).filter((m): m is ModuloTexto => m !== null);

/** Índice corto que SIEMPRE se manda: le da al modelo el mapa del programa. */
export const INDICE_PROGRAMA = MODULOS_TEXTO.map((m) => `${m.numero}. ${m.titulo} (${m.slug})`).join('\n');

// Palabras que aparecen en cualquier pregunta y no discriminan nada.
const VACIAS = new Set(
  normalizar(
    'que como cual cuales cuando donde quien por para con sin los las una unos unas del al es son esta este' +
      ' estoy tengo hacer puedo debo mi me te se lo la el en de y o a si no mas muy pero tambien hay ser' +
      ' sobre entre desde hasta bien mejor todo todos nada algo cosa forma manera vez veces'
  ).split(' ')
);

/**
 * Elige los módulos más relevantes para la pregunta.
 *
 * Es coincidencia de palabras, no embeddings: son 10 módulos de vocabulario
 * muy específico (Dropi, ReleasIt, ROAS, pixel), donde el término exacto ya
 * separa bien. Añadir un modelo de embeddings traería una segunda llamada de
 * red y una clave más que configurar, para ganar poco.
 */
export function modulosRelevantes(pregunta: string, slugActual?: string | null, limite = 3): ModuloTexto[] {
  const terminos = [...new Set(normalizar(pregunta).match(/[a-z0-9]{3,}/g) ?? [])].filter((t) => !VACIAS.has(t));

  const puntuados = MODULOS_TEXTO.map((m) => {
    let puntos = 0;
    for (const t of terminos) {
      // Frecuencia con tope: que una palabra aparezca 40 veces no hace al
      // módulo 40 veces más relevante, y sin tope un módulo largo gana siempre.
      const veces = m.indice.split(t).length - 1;
      if (veces > 0) puntos += Math.min(veces, 4);
      // El título pesa: si preguntan "escalado", ese módulo va primero.
      if (normalizar(m.titulo).includes(t)) puntos += 6;
    }
    return { modulo: m, puntos };
  });

  const elegidos: ModuloTexto[] = [];

  // El módulo que el estudiante tiene abierto entra siempre: casi todas las
  // preguntas son sobre lo que está leyendo en ese momento, aunque las
  // palabras que use no coincidan con el texto.
  const actual = MODULOS_TEXTO.find((m) => m.slug === slugActual);
  if (actual) elegidos.push(actual);

  for (const { modulo, puntos } of puntuados.sort((a, b) => b.puntos - a.puntos)) {
    if (elegidos.length >= limite) break;
    if (puntos > 0 && !elegidos.some((e) => e.slug === modulo.slug)) elegidos.push(modulo);
  }

  return elegidos;
}

/** Tope de caracteres del material inyectado, para no disparar el costo por pregunta. */
const TOPE_CONTEXTO = 26_000;

export function construirContexto(pregunta: string, slugActual?: string | null): string {
  const elegidos = modulosRelevantes(pregunta, slugActual);
  if (elegidos.length === 0) return '';

  const partes: string[] = [];
  let total = 0;
  for (const m of elegidos) {
    if (total + m.texto.length > TOPE_CONTEXTO) break;
    partes.push(m.texto);
    total += m.texto.length;
  }
  return partes.join('\n\n---\n\n');
}
