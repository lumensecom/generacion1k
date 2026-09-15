// Recurso público: cómo investigar un mercado antes de vender.
//
// El orden no es casual y es la mitad del valor: primero se comprueba que el
// producto YA vende (Ads Library), después por qué lo compran (comentarios) y
// solo al final se generan ángulos. Hacerlo al revés —inventar el ángulo y
// buscar datos que lo confirmen— es lo que hace casi todo el mundo.

export interface PasoInvestigacion {
  n: number;
  fase: string;
  titulo: string;
  objetivo: string;
  pasos: string[];
  senales: { buena: string; mala: string };
  tiempo: string;
}

export const PASOS: PasoInvestigacion[] = [
  {
    n: 1,
    fase: '¿Ya vende?',
    titulo: 'Biblioteca de anuncios de Meta',
    objetivo:
      'Antes de nada, comprobar que alguien ya está gastando dinero en vender esto. No para copiarlo: para saber que el mercado existe.',
    pasos: [
      'Entra a facebook.com/ads/library y pon "Todos los anuncios".',
      'Busca el NOMBRE DEL PRODUCTO, no tu marca ni la categoría.',
      'Filtra por tu país primero: valida que se vende donde tú vas a vender.',
      'Repite la búsqueda en España, México, Estados Unidos y Brasil.',
      'Anota de cada anuncio: fecha de inicio, formato y cuántas versiones tiene.',
      'Guarda capturas de los 10 que más tiempo lleven activos.',
    ],
    senales: {
      buena: 'Anuncios activos hace más de 2 meses y varias versiones del mismo creativo.',
      mala: 'Todos los anuncios tienen menos de una semana, o no hay ninguno.',
    },
    tiempo: '40 min',
  },
  {
    n: 2,
    fase: '¿Por qué lo compran?',
    titulo: 'Comentarios de TikTok',
    objetivo:
      'La ficha del producto dice lo que hace. Los comentarios dicen lo que la gente SIENTE, y ahí es donde está el ángulo que nadie usa.',
    pasos: [
      'Busca el producto en TikTok y ordena por más vistos.',
      'Abre los 10 videos con más visualizaciones.',
      'Copia TODOS los comentarios, no solo los que te gusten.',
      'Busca también el PROBLEMA, no el producto: "calvicie", "se me cae el pelo".',
      'Pega todo en un documento, sin editar ni resumir.',
      'Marca en amarillo los que se repiten con otras palabras.',
    ],
    senales: {
      buena: 'Frases sobre vergüenza, pareja, fotos o edad: dolor emocional, no técnico.',
      mala: 'Solo preguntas de precio y envío: el video vendió, pero no conecta.',
    },
    tiempo: '1 h',
  },
  {
    n: 3,
    fase: '¿Qué dicen en frío?',
    titulo: 'Reseñas de Reddit',
    objetivo:
      'En TikTok la gente comenta en caliente. En Reddit escribe párrafos largos, sin vender nada a nadie y sin filtro. Es la fuente más honesta que hay.',
    pasos: [
      'Busca en Google: site:reddit.com + el producto o el problema.',
      'Entra a los hilos con más respuestas, no a los más recientes.',
      'Copia las reseñas completas, con lo bueno Y lo malo.',
      'Fíjate en lo que la gente probó ANTES y por qué falló.',
      'Añádelo al mismo documento del paso anterior.',
    ],
    senales: {
      buena: 'Gente contando qué probó antes y por qué no le funcionó: ahí está tu comparativa.',
      mala: 'Solo hilos promocionales o de hace cinco años.',
    },
    tiempo: '45 min',
  },
  {
    n: 4,
    fase: 'Convertir datos en ángulos',
    titulo: 'Pasarle todo a la IA',
    objetivo:
      'Ahora sí. Con el documento lleno, la IA agrupa patrones que tú no ves de tanto leerlos. No le pides ideas: le pides que ordene lo que ya está ahí.',
    pasos: [
      'Junta en un solo documento: copys de los anuncios, comentarios y reseñas.',
      'Pégalo completo. No lo resumas: el volumen es lo que hace que salgan patrones.',
      'Usa el prompt de abajo tal cual.',
      'Pídele que cada ángulo vaya con la cita textual que lo respalda.',
      'Descarta cualquier ángulo que no puedas rastrear hasta una frase real.',
    ],
    senales: {
      buena: 'Ángulos que puedes rastrear hasta un comentario concreto.',
      mala: 'Frases bonitas que podrían servir para cualquier producto.',
    },
    tiempo: '30 min',
  },
];

export const PROMPT_ANGULOS = `Eres analista de mercado para ecommerce de pago contra entrega en Colombia.

Te paso material CRUDO sobre un producto, en tres bloques:
1. COPYS DE ANUNCIOS que hoy están activos en Meta.
2. COMENTARIOS de TikTok de videos del producto y del problema.
3. RESEÑAS de Reddit, completas.

[PEGA AQUÍ LOS TRES BLOQUES]

Hazme esto, en este orden:

A) QUÉ SE ESTÁ DICIENDO YA
Agrupa los copys de los anuncios por ángulo. Dime cuántos usan cada uno.
Ese es el terreno saturado: NO quiero competir ahí.

B) QUÉ DICE LA GENTE QUE NADIE ESTÁ USANDO
Recorre los comentarios y reseñas y saca los dolores, miedos y deseos que
aparezcan varias veces Y que NO estén en ningún copy del bloque A.
Para cada uno cita textualmente 2 o 3 frases reales. Sin cita, no lo incluyas.

C) BAJA A LA CAPA PROFUNDA
Por cada dolor del bloque B, dime qué hay DEBAJO: la consecuencia social,
sentimental o de identidad. Ejemplo del razonamiento que quiero:
  superficie: "se me cae el pelo"
  debajo:     "me veo mayor"
  fondo:      "mi pareja dejó de mirarme igual"
El fondo es lo que mueve la compra. Quiero llegar ahí.

D) FORMATOS QUE FUNCIONAN
Según los anuncios que llevan más tiempo activos, dime qué formatos se
repiten (UGC hablando a cámara, antes/después, demostración en silencio,
lista de razones...) y con qué ángulo va cada uno.

E) DAME 5 ÁNGULOS PARA PROBAR
Cada uno con: el dolor profundo que ataca, la frase real que lo respalda,
el formato recomendado y un hook de 3 segundos.

REGLAS:
- Nada que no puedas rastrear hasta una frase del material. Si te falta base
  para algo, dilo en vez de rellenar.
- Español de Colombia, como habla el cliente.
- Si un ángulo sirve para cualquier producto de la categoría, deséchalo:
  es genérico y no me sirve.`;

export const ERRORES_INVESTIGACION = [
  {
    t: 'Empezar por el producto que te gusta',
    d: 'La investigación deja de ser investigación y pasa a ser buscar excusas para confirmar lo que ya decidiste. Primero los datos, después el favorito.',
  },
  {
    t: 'Leer solo los comentarios buenos',
    d: 'Los negativos son los más útiles: ahí está lo que falla en la competencia y lo que tú puedes prometer con cara.',
  },
  {
    t: 'Resumir antes de pasarlo a la IA',
    d: 'Al resumir ya estás eligiendo, y eliges lo que confirma tu idea. El volumen bruto es lo que hace que salgan los patrones.',
  },
  {
    t: 'Quedarse en el primer país',
    d: 'Un formato que en Colombia no ha probado nadie puede llevar un año funcionando en México o España. Ahí no hay que inventar: hay que traducir.',
  },
  {
    t: 'Confundir "no hay competencia" con oportunidad',
    d: 'Casi siempre significa que ya lo intentaron y no funcionó. Un mercado con anuncios vivos es una buena señal, no una mala.',
  },
];

export const CHECKLIST_FINAL = [
  'Tengo 10 capturas de anuncios activos hace más de 2 meses',
  'Los busqué en mi país y en 3 países más',
  'Tengo un documento con todos los comentarios, sin filtrar',
  'Tengo reseñas de Reddit completas, con lo bueno y lo malo',
  'Sé qué ángulo está usando la mayoría de la competencia',
  'Tengo al menos 3 dolores que NADIE está atacando',
  'Cada ángulo mío tiene una frase real que lo respalda',
  'Sé qué formato de video usa cada ángulo',
];

// ---------------------------------------------------------------------------
// Con qué IA hacerlo
//
// La tarea es leer MUCHO texto crudo y encontrar patrones, así que lo que
// manda es cuánto texto aguanta de una vez. Un modelo brillante al que hay
// que darle los comentarios en cinco tandas pierde justo lo que buscamos:
// ver que la misma queja aparece cuarenta veces.
// ---------------------------------------------------------------------------

export interface OpcionIA {
  nombre: string;
  url: string;
  paraQue: string;
  fuerte: string;
  ojo: string;
  destacado?: boolean;
}

export const IAS: OpcionIA[] = [
  {
    nombre: 'Gemini',
    url: 'https://gemini.google.com',
    paraQue: 'Cuando el documento es enorme',
    fuerte:
      'Es el que más texto acepta de una sola vez, y en la capa gratuita. Si juntaste cientos de comentarios y varias reseñas largas, empieza por aquí: podrás pegarlo entero sin trocearlo.',
    ojo: 'Tiende a resumir de más. Si lo hace, pídele explícitamente que cite frases completas.',
    destacado: true,
  },
  {
    nombre: 'Claude',
    url: 'https://claude.ai',
    paraQue: 'Cuando quieres que NO se invente nada',
    fuerte:
      'Es el que mejor respeta la regla de "sin cita textual no lo incluyas", que es la que sostiene todo este método. También escribe los ángulos en un español más natural.',
    ojo: 'En la capa gratuita el límite de mensajes se agota rápido con documentos largos.',
  },
  {
    nombre: 'ChatGPT',
    url: 'https://chatgpt.com',
    paraQue: 'Cuando quieres la salida ordenada',
    fuerte:
      'Devuelve tablas y listas muy limpias, cómodo si vas a pasar los ángulos a una hoja de cálculo para repartirlos entre creativos.',
    ojo: 'Es el más propenso a rellenar con frases que suenan bien pero no salen de tus datos. Revísale las citas una a una.',
  },
];

export const CONSEJO_IA =
  'Hagas lo que hagas, pásalo por DOS de ellas con el mismo prompt. Los ángulos que aparecen en las dos son los que de verdad están en tus datos; los que solo salen en una, casi siempre los puso el modelo.';
