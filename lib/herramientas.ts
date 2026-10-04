import 'server-only';

/**
 * Las herramientas de la cuenta de la mentoría.
 *
 * Este archivo es server-only a propósito. La contraseña se pasa como prop
 * desde un componente de servidor y se renderiza dentro del portal, que ya
 * exige sesión. Si viviera en un componente de cliente terminaría dentro de
 * un chunk de /_next/static/, que se sirve sin autenticación: cualquiera con
 * el link podría leerla.
 *
 * La clave se puede mover a una variable de entorno en Vercel
 * (CLAVE_MENTORIA) sin tocar código; el valor de aquí es el respaldo.
 */

export const CORREO_MENTORIA = 'generacion1k@gmail.com';

export const CLAVE_MENTORIA = process.env.CLAVE_MENTORIA ?? 'Ecom2026100k.';

/** El WhatsApp de Juan, el mismo de la landing. */
export const WHATSAPP_JUAN = '573125923915';

export interface Herramienta {
  id: string;
  nombre: string;
  queHace: string;
  url: string;
  /** Un color por herramienta, para distinguirlas de un vistazo. */
  color: string;
  /**
   * No viene incluida: se pide. En vez de un botón que no abre nada, lleva a
   * escribirle a Juan.
   */
  aPedido?: boolean;
}

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: 'dropkiller',
    nombre: 'DropKiller',
    queHace:
      'Productos ganadores, espía de anuncios en Facebook y TikTok, y ventas y stock en vivo de Dropi.',
    url: 'https://dropkiller.com',
    color: '#EF4444',
  },
  {
    id: 'scalboost',
    nombre: 'ScalBoost',
    queHace: 'El paquete de herramientas de ecommerce para investigar y escalar.',
    url: 'https://whop.com/scalboost',
    color: '#22D3EE',
  },
  {
    id: 'capcut',
    nombre: 'CapCut Pro',
    queHace: 'Edición de los creativos sin marca de agua y con todas las plantillas.',
    url: 'https://www.capcut.com',
    color: '#A855F7',
  },
  {
    id: 'productmaker',
    nombre: 'Product Maker',
    queHace: 'Fotos y videos de producto generados. Se activa a pedido.',
    url: '',
    color: '#F5C518',
    aPedido: true,
  },
];

/**
 * Qué herramientas tiene activas cada estudiante.
 *
 * La llave es el correo en minúsculas. Quien no esté en el mapa las tiene
 * todas: es el caso normal, y así un estudiante nuevo no se queda sin nada
 * por un olvido.
 *
 * Para quitarle o darle una herramienta a alguien, edita este mapa. Todavía
 * no hay interruptores en el panel de admin porque eso necesita una columna
 * nueva en la base.
 */
const EXCEPCIONES: Record<string, string[]> = {
  // Zabdiel sólo tiene DropKiller activado.
  //
  // Va por nombre y no por correo porque en el momento de escribirlo no se
  // pudo consultar la base. Apenas se sepa el correo, cámbialo por la llave
  // de correo, que es la identidad estable: dos estudiantes podrían llamarse
  // igual, y un nombre se edita.
  'nombre:zabdiel': ['dropkiller'],
};

/** Normaliza para comparar: sin acentos, sin espacios de más, en minúsculas. */
function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Las herramientas activas de un estudiante. Las que se piden a parte
 * (Product Maker) nunca entran aquí: esas siempre se solicitan.
 */
export function herramientasDe(correo: string, nombre: string): Herramienta[] {
  const porCorreo = EXCEPCIONES[normalizar(correo)];

  // El respaldo por nombre mira cada palabra, para que "Zabdiel Pérez" y
  // "zabdiel" caigan en la misma excepción.
  const palabras = normalizar(nombre).split(/\s+/);
  const porNombre = palabras
    .map((p) => EXCEPCIONES[`nombre:${p}`])
    .find((x) => x !== undefined);

  const permitidas = porCorreo ?? porNombre;
  const incluidas = HERRAMIENTAS.filter((h) => !h.aPedido);

  return permitidas ? incluidas.filter((h) => permitidas.includes(h.id)) : incluidas;
}

/** Las que NO tiene activas, para poder decirle cómo pedirlas. */
export function herramientasFaltantes(correo: string, nombre: string): Herramienta[] {
  const activas = new Set(herramientasDe(correo, nombre).map((h) => h.id));
  return HERRAMIENTAS.filter((h) => !h.aPedido && !activas.has(h.id));
}

/** Las que se piden aparte, como Product Maker. */
export const HERRAMIENTAS_A_PEDIDO = HERRAMIENTAS.filter((h) => h.aPedido);

/** El link de WhatsApp con el mensaje ya escrito. */
export function linkWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_JUAN}?text=${encodeURIComponent(mensaje)}`;
}
