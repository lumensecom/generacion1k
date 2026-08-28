// Videos de apoyo, uno por lección.
//
// Son de terceros — clases de YouTube que explican bien un punto concreto —
// mientras Juan graba las suyas. Van aparte del video del módulo
// (modules.video_url) y NO pasan por la fecha de estreno: eso solo cubre el
// hueco donde todavía no hay nada, y esto ya es algo.
//
// La clave es "slug-del-modulo/id-de-la-leccion", tal como sale en la lista de
// lecciones. Para añadir uno, se pega la URL de YouTube y ya: el reproductor
// del portal la reconoce sola.
//
// Cómo sacar la clave de una lección: es el título en minúsculas, sin tildes y
// con guiones. Si dudas, míralo en la URL o pídemelo.

export const VIDEOS_LECCIONES: Record<string, string> = {
  // ---- Módulo 1 · Mentalidad ----
  // 'mentalidad-pce/que-es-el-modelo-pce-y-por-que-funciona-en-colom': '',
  // 'mentalidad-pce/las-4-barreras-que-detienen-al-90-de-los-emprend': '',
  // 'mentalidad-pce/todos-vamos-a-pasar-por-el-valle-la-pregunta-es-': '',
  // 'mentalidad-pce/los-3-tipos-de-emprendedores': '',

  // ---- Módulo 3 · Shopify ----
  // 'setup-shopify/que-es-shopify': '',
  // 'setup-shopify/creacion-de-cuenta': '',
  // 'setup-shopify/dominio': '',
  // 'setup-shopify/logo': '',
  // 'setup-shopify/dropify': '',
  // 'setup-shopify/releasit': '',
  // 'setup-shopify/trustoo': '',
  // 'setup-shopify/diseno-de-la-tienda': '',
  // 'setup-shopify/politicas': '',
  // 'setup-shopify/desarrollo-de-producto': '',
};

export function videoDeLeccion(slugModulo: string, idLeccion: string): string | null {
  return VIDEOS_LECCIONES[`${slugModulo}/${idLeccion}`] ?? null;
}
