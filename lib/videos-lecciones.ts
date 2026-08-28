// Videos de apoyo dentro de cada lección.
//
// Son de otros creadores — clases de YouTube que explican bien un punto
// concreto — mientras Juan graba las suyas. Van aparte del video del módulo
// y NO pasan por la fecha de estreno: esa cubre el hueco donde no hay nada, y
// esto ya es algo.
//
// La clave es "slug-del-modulo/id-de-la-leccion". Cada lección admite varios.
//
// Están colocados por lo que dice el TÍTULO real del video, no por el orden en
// que llegaron: dos venían etiquetados al revés y ponerlos donde tocaba era
// más útil que respetar la etiqueta. Cualquiera se mueve cambiando su clave.

export const VIDEOS_LECCIONES: Record<string, string[]> = {
  // ---- 1 · Mentalidad ----
  'mentalidad-pce/que-es-el-modelo-pce-y-por-que-funciona-en-colom': [
    // Antonia Villa — "Paso a Paso para ganar $10.000 con Ecommerce"
    'https://youtu.be/R7KaudCaym4',
  ],
  'mentalidad-pce/los-3-tipos-de-emprendedores': [
    // Juan Herrera — "$300.000 USD en 30 días con Dropshipping en LATAM"
    'https://youtu.be/_vAgTPB4kNw',
  ],

  // ---- 2 · Producto ganador ----
  'producto-ganador/el-framework-para-elegir-tu-producto-ganador': [
    // Antonia Villa — "Cómo Encontrar Productos Ganadores para Dropshipping 2026"
    'https://youtu.be/o59LjuQ_KSw',
  ],

  // ---- 3 · Shopify ----
  'setup-shopify/creacion-de-cuenta': [
    // Marc Verdú — "Cómo Hacer Desde Cero una Tienda de Shopify Dropshipping"
    'https://youtu.be/Dh__yIvnEUM',
  ],
  // El mismo capítulo cubre nombre, logo y dominio, así que va en las dos.
  'setup-shopify/logo': [
    // Antonia Villa — "Cap. 4: Creando el Nombre, Logo y Dominio"
    'https://youtu.be/fGEWwhjpKic',
  ],
  'setup-shopify/dominio': ['https://youtu.be/fGEWwhjpKic'],

  // ---- 4 · Dropi / ADMA ----
  'dropi-adma/que-es-dropi': [
    // Antonia Villa — "Cap. 3: ¿Es posible hacer Dropshipping en LATAM 2026?"
    'https://youtu.be/MGPwyVM5KUk',
  ],

  // ---- 5 · Releasit ----
  'releasit-cod/que-hace-releaseit-cod': [
    // Keiner Chará — "Cómo CONFIGURAR el FORMULARIO de Releasit paso a paso"
    'https://youtu.be/xECGRwwzkq8',
  ],

  // ---- 6 · Pixel ----
  'pixel-tracking/que-es-un-pixel': [
    // Felipe Vergara — "PIXEL de FACEBOOK (Meta): TODO lo que necesitas saber"
    'https://youtu.be/nRci9StzARQ',
  ],
  'pixel-tracking/setup-paso-a-paso': [
    // David Betancourt — "Vincular Pixel de Facebook a Shopify y Releasit 2026"
    'https://youtu.be/V0E5n92iaAw',
  ],

  // ---- 7 · Creativos ----
  'primer-creativo/los-6-angulos-validados-en-colombia': [
    // Iván Caicedo — "La Fórmula de Creativos Ganadores"
    'https://youtu.be/xIf0XBnZZ3g',
    // Brayan Hernández — "Cómo hacer CREATIVOS GANADORES para FB y TikTok"
    'https://youtu.be/CXRDAknGjzg',
  ],
  'primer-creativo/capcut-vs-google-flow-vs-ugc-real': [
    // Juan Trim — "Cómo hacer creativos millonarios para escalar"
    'https://youtu.be/48iAH1LEu2I',
    // Felipe Vergara — "TRUCO para tener ANUNCIOS GANADORES en Meta Ads"
    'https://youtu.be/59I305cbE3Y',
  ],

  // ---- 8 · Lanzamiento ----
  'lanzamiento/estructura-de-cuenta': [
    // Brayan Hernández — "Esta ESTRUCTURA de ANUNCIOS me hizo facturar +280.000"
    'https://youtu.be/xvWua3o8hXE',
    // Laura Guevara — "Cómo Crear ANUNCIOS en FACEBOOK ADS para Dropshipping 2026"
    'https://youtu.be/Mx_k0K3eKf8',
  ],

  // ---- 9 · Escalado ----
  'escalado/las-6-reglas-de-oro': [
    // Antonia Villa — "Cap. 9: Cómo hacer campañas de Facebook efectivas"
    'https://youtu.be/QqejXMoUf2k',
  ],
  'escalado/cuando-pausar-un-creativo': [
    // Felipe Vergara — "Cómo OPTIMIZAR tus campañas · Auditoría"
    'https://youtu.be/G6Flvlbc6hQ',
  ],
  'escalado/cuando-escalar-ejemplo-real-lumens': [
    // Felipe Vergara — "La MEJOR FORMA de ESCALAR en Meta Ads"
    'https://youtu.be/lclqlJbHQuE',
  ],

  // ---- 10 · Devoluciones ----
  'devoluciones-cs/las-6-palancas-para-reducir-devoluciones': [
    // Iván Caicedo — "Así SUPERAS EL 80% DE EFECTIVIDAD de entregas"
    'https://youtu.be/XLtF3fUrdX8',
  ],
};

export function videosDeLeccion(slugModulo: string, idLeccion: string): string[] {
  return VIDEOS_LECCIONES[`${slugModulo}/${idLeccion}`] ?? [];
}
