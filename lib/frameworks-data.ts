// Frameworks del portal: procesos completos dibujados como un tablero.
//
// No son módulos y por eso no llevan test ni desbloqueo. Un módulo se estudia
// una vez; un framework se abre cada vez que toca hacer ese proceso, y lo que
// se busca es el nodo concreto —el prompt, el filtro, la plantilla— no la
// lección entera. De ahí el formato de tablero: se ve todo el flujo de un
// vistazo y se entra solo a la caja que hace falta.

export type Fase = 'investigar' | 'elegir' | 'producto' | 'validar' | 'salida';

export interface NodoFramework {
  id: string;
  fase: Fase;
  /** Columna del tablero, de 1 en adelante. Varios nodos pueden compartirla. */
  columna: number;
  titulo: string;
  resumen: string;
  /** Lo que sale de este nodo y entra en el siguiente. */
  entrega: string;
  cuerpo: string;
  pasos?: string[];
  prompt?: string;
  aviso?: string;
  /** Lo que aportamos nosotros encima del método original. */
  nuestro?: string;
}

export interface Framework {
  slug: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  duracion: string;
  nodos: NodoFramework[];
}

export const FASES: Record<Fase, { nombre: string; color: string }> = {
  investigar: { nombre: 'Investigar', color: '#A855F7' },
  elegir: { nombre: 'Elegir', color: '#F5C518' },
  producto: { nombre: 'Producto', color: '#10B981' },
  validar: { nombre: 'Validar', color: '#22D3EE' },
  salida: { nombre: 'Salida', color: '#F87171' },
};

const PROMPT_PROBLEMATICAS = `# ROL
Eres un investigador de mercado senior especializado en comportamiento del
consumidor colombiano. Has trabajado 10 años en Kantar, Nielsen y Raddar
analizando qué compran y qué NO compran los colombianos. Combinas datos duros
del DANE con etnografía de calle, escuchando cómo la gente realmente habla de
sus problemas.

# CONTEXTO DE NEGOCIO
Estoy construyendo un catálogo para una tienda de ecommerce en Colombia que
opera bajo Pago Contra Entrega (PCE). El cliente paga en efectivo cuando el
mensajero llega a su casa.

- Ticket objetivo: $70.000 – $200.000 COP
- Target primario: mujeres 20–45 años, estratos 2–4
- Target secundario: hombres 25–50 que compran para regalar o uso propio
- Canal: TikTok Ads y Meta Ads (funcionan productos con dolor emocional
  demostrable en 15 segundos)
- Mayor conversión en Bogotá, Medellín, Cali, Barranquilla, Bucaramanga

# MISIÓN
Investigación profunda sobre las problemáticas más frecuentes, dolorosas y
monetizables de la vida cotidiana del colombiano promedio, para identificar
oportunidades de producto físico comercializable en PCE.

# FUENTES OBLIGATORIAS (mínimo 3 por problemática)
1. Oficiales: DANE (ECV, ENDS), Ministerio de Salud, Invima, SIC
2. Estudios: Raddar, Kantar Colombia, Fenalco, NubeCommerce
3. Escucha social: TikTok con hashtags colombianos, Reddit r/Colombia,
   r/Bogota, r/Medellin, Google Trends Colombia últimos 12 meses, reseñas en
   Mercado Libre Colombia y Falabella, grupos de Facebook por ciudad
4. Prensa: Semana, El Tiempo, El Espectador, Portafolio, La República

# CÓMO VALIDAR CADA PROBLEMÁTICA
- Cita el dato con su fuente ("47% según X", no "muchos colombianos")
- Incluye al menos una cita textual real de un colombiano hablando del problema
- Di qué productos existen ya alrededor de ese dolor en el mercado local

# ENTREGA
## Bloque 1 · Mapa de 15 problemáticas
5 de salud física · 3 de salud emocional · 3 de hogar y vida diaria ·
2 de relaciones y familia · 2 de seguridad

## Bloque 2 · Ficha por problemática
A. EL DOLOR REAL — qué siente, qué le hace dejar de hacer, cuánto le cuesta
B. EVIDENCIA — 2 datos duros con fuente, volumen en Colombia, tendencia
C. LENGUAJE REAL — 5 frases textuales de la gente, qué buscan en Google,
   cómo lo describen hombres vs mujeres
D. NIVEL DE CONCIENCIA — ¿sabe que lo tiene? ¿sabe que hay solución? ¿qué
   ha intentado antes?
E. COMPETENCIA EN COLOMBIA — qué existe ya, precios, marcas, vacíos
F. SCORE COMERCIAL (1–10 cada factor, y el promedio)
   Urgencia · Frecuencia · Facilidad de mostrarlo en 15 s · Poder adquisitivo
G. RIESGOS — por qué NO comprarían, restricciones Invima o SIC

## Bloque 3 · Tabla resumen ordenada por score
## Bloque 4 · Las 3 más prometedoras, las 3 que NO recomiendas, y los
   patrones transversales que detectaste

# REGLAS CRÍTICAS
- NO inventes datos. Si no encuentras una cifra, di "no disponible" y explica
  qué buscaste.
- NO propongas TODAVÍA productos concretos. Esta fase es SOLO de problemáticas.
- NO recomiendes categorías que exijan registro sanitario complicado
  (ingeribles, claims médicos).
- SÍ prioriza problemáticas VISUALES: si no se puede mostrar en un vertical de
  15 segundos, baja el score.
- SÍ incluye segmentos grandes pero invisibles: adultos mayores, madres
  solteras, trabajadores informales, migrantes.

# INICIO
Confirma qué entendiste y qué fuentes vas a consultar primero. Después procede.
No me pidas más contexto: trabaja con lo que te di.`;

const PROMPT_RESENAS = `Eres analista de producto. Te paso reseñas REALES de Amazon de los productos
que hoy resuelven este dolor: [PROBLEMÁTICA].

Son reseñas de 1, 2 y 3 estrellas a propósito: quiero los fallos, no los
elogios.

[PEGA AQUÍ LAS RESEÑAS, COMPLETAS Y SIN RESUMIR]

Hazme esto:

A) PATRONES DE FALLO
Agrupa las quejas por causa raíz y dime cuántas veces aparece cada una.
Ordénalas de más a menos frecuente. Ignora las quejas de envío y de
vendedor: solo me interesan las del PRODUCTO.

B) CUÁLES SON DE DISEÑO Y CUÁLES DE CALIDAD
Separa las dos. Las de calidad se arreglan cambiando de proveedor; las de
diseño son la oportunidad real, porque significan que NADIE lo ha resuelto.

C) DE QUEJA A ESPECIFICACIÓN
Por cada patrón de diseño, escríbeme la línea de especificación que tendría
que cumplir mi producto para que esa queja no exista. Concreta y verificable.
  queja:           "se despega a la semana"
  especificación:  "adhesión por succión con palanca mecánica, no ventosa
                    simple; probada con 10 kg colgados durante 72 horas"

D) LO QUE SÍ FUNCIONA
De las reseñas de 3 estrellas, saca lo que la gente SÍ valora y que no hay
que tocar al cambiar de proveedor.

E) TRES FRASES DE VENTA
Escríbeme tres frases que ataquen directamente los tres fallos más repetidos,
con las palabras de las reseñas. Nada de lenguaje de marca.

REGLAS
- Cada patrón con 2 o 3 citas textuales. Sin cita, no lo incluyas.
- Si una queja aparece una sola vez, descártala: es un caso, no un patrón.
- Español de Colombia.`;

export const FRAMEWORKS: Framework[] = [
  {
    slug: 'investigacion-a-producto',
    numero: 1,
    titulo: 'De problemática a producto',
    subtitulo: 'Investigación de mercado completa, en 12 pasos',
    descripcion:
      'El proceso entero: de no tener ni idea qué vender a tener una ficha de producto con su ángulo, su formato y su margen. Primero el dolor, después el producto — nunca al revés.',
    duracion: '2 a 3 días',
    nodos: [
      // ---------- FASE 1 · INVESTIGAR ----------
      {
        id: 'research-profundo',
        fase: 'investigar',
        columna: 1,
        titulo: 'Investigación profunda con IA',
        resumen: 'Gemini o Perplexity traen 15 problemáticas con datos y fuente.',
        entrega: 'Un reporte con 15 problemáticas puntuadas',
        cuerpo:
          'El punto de partida no es un producto: es una lista de dolores reales con datos detrás. Se le pide a una IA con navegación —Perplexity o Gemini— que investigue y cite fuentes, no que opine. El prompt es largo a propósito: cuanto más contexto le das de tu operación, menos genérico sale el resultado.',
        prompt: PROMPT_PROBLEMATICAS,
        aviso:
          'Si el modelo no tiene navegación activa te lo va a decir, y entonces trabaja de memoria. Sigue sirviendo como mapa, pero los porcentajes que te dé NO los publiques ni los uses en anuncios sin verificarlos tú.',
        nuestro:
          'La regla de "cero productos" en esta fase es nuestra y es la más importante de todo el framework. En cuanto dejas que la IA proponga productos, deja de investigar dolores y empieza a justificar el producto que ya se le ocurrió. Dolor primero, siempre.',
      },
      {
        id: 'google-trends',
        fase: 'investigar',
        columna: 2,
        titulo: 'Google Trends',
        resumen: '¿El problema crece, está plano o se está muriendo?',
        entrega: 'Curva de 12 meses por problemática',
        cuerpo:
          'Un dolor real pero que lleva tres años cayendo es una trampa: vas a llegar tarde. Aquí se comprueba la dirección, no el volumen.',
        pasos: [
          'Abre trends.google.com y fija el país en Colombia.',
          'Busca el PROBLEMA con las palabras de la gente, no el producto: "dolor de cabeza tensión", no "gorro de gel".',
          'Ventana de 12 meses, y otra de 5 años para ver si es moda o es estructural.',
          'Mira el desglose por región: puede que solo exista en dos ciudades.',
          'Descarta lo que lleve más de un año bajando.',
        ],
        nuestro:
          'Mira siempre la estacionalidad antes de decidir. Un deshumidificador se ve plano en el año, pero si abres la curva verás que todo el volumen está en temporada de lluvias. Eso no lo descarta: te dice cuándo lanzarlo.',
      },
      {
        id: 'escucha-social',
        fase: 'investigar',
        columna: 2,
        titulo: 'Escucha social',
        resumen: 'Cómo habla la gente del problema cuando nadie le pregunta.',
        entrega: 'Documento con comentarios crudos, sin editar',
        cuerpo:
          'Los datos te dicen cuánta gente lo sufre. Los comentarios te dicen con qué palabras lo sufre — y esas palabras son las que después van en el anuncio.',
        pasos: [
          'TikTok: busca el problema, no el producto. Abre los videos más vistos y copia TODOS los comentarios.',
          'Reddit: en Google, site:reddit.com + el problema. Entra a los hilos con más respuestas.',
          'Grupos de Facebook por ciudad: ahí se queja el estrato 2–4, que es tu cliente.',
          'Pega todo en un solo documento. Sin resumir y sin quitar lo que no te guste.',
        ],
        aviso:
          'No resumas al pegar. Al resumir estás eligiendo, y eliges lo que confirma la idea que ya tenías. El volumen bruto es lo que hace que aparezcan los patrones.',
      },

      // ---------- FASE 2 · ELEGIR ----------
      {
        id: 'score-comercial',
        fase: 'elegir',
        columna: 3,
        titulo: 'Score comercial',
        resumen: 'Cuatro notas de 1 a 10. El promedio manda.',
        entrega: 'Las 15 problemáticas ordenadas',
        cuerpo:
          'Cuatro factores, cada uno de 1 a 10, y el promedio decide. Sirve para quitarte de encima tu propio gusto: la problemática que más te emociona casi nunca es la que mejor puntúa.',
        pasos: [
          'URGENCIA — cuando el dolor aparece, ¿qué tan agudo es? El dolor agudo abre billeteras.',
          'FRECUENCIA — ¿cada cuánto lo vive? Un dolor anual no sostiene una tienda.',
          'VISUAL EN 15 SEGUNDOS — ¿se puede MOSTRAR el problema y la solución en un vertical? Si hay que explicarlo, el score baja.',
          'PODER ADQUISITIVO — ¿el que lo sufre tiene los $70k–$200k a la mano el día que llega el mensajero?',
        ],
        nuestro:
          'De los cuatro, el que más gente subestima es el visual. En contra entrega no hay segunda visita: si el anuncio no hace entender el dolor sin sonido y sin leer, no hay venta. Cuando dudes entre dos problemáticas, gana la que se ve.',
      },
      {
        id: 'filtro-pce',
        fase: 'elegir',
        columna: 3,
        titulo: 'Filtro de descarte PCE',
        resumen: 'Cinco preguntas que matan una idea antes de gastar en ella.',
        entrega: 'Una problemática elegida',
        cuerpo:
          'Antes de seguir, la problemática ganadora pasa por cinco preguntas. Si falla una, se vuelve a la lista y se toma la siguiente. Es más barato descartar aquí que en la pauta.',
        pasos: [
          '¿El producto que resolvería esto cabe entre $70.000 y $200.000?',
          '¿Se puede mostrar el problema Y la solución en 15 segundos, sin sonido?',
          '¿Está libre de registro sanitario? (nada ingerible, ningún claim médico)',
          '¿Es lo bastante ligero y pequeño para que el envío no se coma el margen?',
          '¿Puedo sostener lo que promete el anuncio, sin exagerar?',
        ],
        aviso:
          'La tercera es la que más gente se salta. Un producto que promete curar algo no solo es un problema con Invima: Meta y TikTok rechazan el anuncio, y ahí se acabó el negocio antes de empezar.',
        nuestro:
          'Este filtro es nuestro y sale de ver ideas buenísimas morir por logística. Un producto de $150.000 ya roza el techo del impulso en contra entrega: si el cliente no tiene el billete completo cuando llega el mensajero, se devuelve, y la devolución te cuesta el envío de ida y el de vuelta.',
      },

      // ---------- FASE 3 · PRODUCTO ----------
      {
        id: 'amazon-competencia',
        fase: 'producto',
        columna: 4,
        titulo: 'Qué compran hoy en Amazon',
        resumen: 'Los productos que la gente YA usa para ese dolor.',
        entrega: 'Lista de 5 a 10 productos líderes',
        cuerpo:
          'Ahora sí aparece el producto, y aparece desde el dolor. Se busca en Amazon lo que la gente compra hoy para resolverlo. No para copiarlo: para saber contra qué compites y, sobre todo, en qué está fallando.',
        pasos: [
          'Busca en Amazon el PROBLEMA con las palabras del cliente y mira qué le devuelve.',
          'Quédate con los 5–10 con más reseñas, no con los mejor puntuados.',
          'Anota de cada uno: precio, número de reseñas y nota media.',
          'Repite en Mercado Libre Colombia para ver el precio local y si ya está saturado aquí.',
        ],
        nuestro:
          'Amazon se usa aunque no vendas ahí, y por una razón: es el único sitio con miles de reseñas largas y en detalle sobre productos de esta categoría. Mercado Libre Colombia tiene reseñas de dos líneas. Amazon es el laboratorio; Mercado Libre, el termómetro de precio local.',
      },
      {
        id: 'mineria-resenas',
        fase: 'producto',
        columna: 5,
        titulo: 'Minería de reseñas de 1 a 3 estrellas',
        resumen: 'El corazón del método. Las quejas son la especificación.',
        entrega: 'Patrones de fallo ordenados por frecuencia',
        cuerpo:
          'Las reseñas de 5 estrellas no sirven: dicen que funciona. Las de 1 a 3 estrellas son investigación de mercado gratis y te dicen exactamente qué odia la gente de lo que ya existe. Cada queja repetida es un hueco de mercado que nadie ha tapado.',
        pasos: [
          'En cada producto líder, filtra las reseñas por 1, 2 y 3 estrellas.',
          'Copia las reseñas completas al documento. Completas, no la frase que te gustó.',
          'Haz lo mismo con los 5 productos líderes: buscas lo que se repite ENTRE productos distintos.',
          'Pásale todo a la IA con el prompt de este nodo.',
        ],
        prompt: PROMPT_RESENAS,
        nuestro:
          'La distinción que añadimos y que lo cambia todo: separa las quejas de CALIDAD de las de DISEÑO. "Me llegó roto" es calidad y se arregla cambiando de proveedor — no es tu oportunidad, porque cualquiera la arregla. "Es imposible de lavar por dentro" es diseño: nadie en la categoría lo ha resuelto, y ahí sí tienes algo que los demás no pueden copiar mañana.',
      },
      {
        id: 'spec-producto',
        fase: 'producto',
        columna: 6,
        titulo: 'De queja a especificación',
        resumen: 'Cada queja repetida se convierte en un requisito verificable.',
        entrega: 'Ficha técnica para pedirle al proveedor',
        cuerpo:
          'Aquí se traduce. Una queja es una frase suelta; una especificación es algo que le puedes exigir a un proveedor y comprobar cuando llegue la muestra. Sin este paso, la investigación se queda en un documento bonito.',
        pasos: [
          'Toma los tres patrones de diseño más repetidos.',
          'Escribe cada uno como requisito medible, no como deseo.',
          'Marca cuáles son innegociables y cuáles son deseables.',
          'Añade lo que la gente SÍ valora hoy: eso no se puede perder al cambiar de proveedor.',
        ],
        aviso:
          'Si una especificación no se puede comprobar al recibir la muestra, no es una especificación: es una ilusión. "Que sea resistente" no vale. "Que aguante 10 kg colgados 72 horas" sí.',
      },
      {
        id: 'proveedor',
        fase: 'producto',
        columna: 6,
        titulo: 'Buscar al que sí cumple',
        resumen: 'Alibaba o proveedor local, con la ficha en la mano.',
        entrega: 'Muestra pedida y margen calculado',
        cuerpo:
          'Con la ficha técnica escrita, buscar proveedor deja de ser navegar entre miles de productos iguales: ya sabes qué tiene que cumplir y puedes descartar en segundos.',
        pasos: [
          'Busca en Alibaba y AliExpress por el producto genérico.',
          'Manda la ficha a 3 o 4 proveedores y pregunta punto por punto.',
          'Pide muestra SIEMPRE, aunque cueste. La muestra es más barata que mil unidades malas.',
          'Calcula el margen con el costo real: producto + envío + empaque + la devolución esperada.',
        ],
        nuestro:
          'El margen en contra entrega hay que calcularlo sobre unidades ENTREGADAS, no vendidas. Con una efectividad del 70%, cada tres pedidos uno vuelve y te comes el envío de ida y vuelta. Si no lo metes en la cuenta desde aquí, el producto parece rentable y no lo es.',
      },

      // ---------- FASE 4 · VALIDAR ----------
      {
        id: 'ads-library',
        fase: 'validar',
        columna: 7,
        titulo: '¿Ya lo vende alguien?',
        resumen: 'Biblioteca de anuncios de Meta, en tu país y en otros cuatro.',
        entrega: 'Mapa de competencia y formatos',
        cuerpo:
          'Última comprobación antes de invertir: que alguien esté gastando dinero en vender esto. Si nadie lo hace, casi nunca es una oportunidad — suele ser que ya lo intentaron. Y de paso, los anuncios activos te enseñan qué formatos aguantan.',
        pasos: [
          'facebook.com/ads/library, "Todos los anuncios", busca el nombre del producto.',
          'Filtra por Colombia. Después repite en México, España, Estados Unidos y Brasil.',
          'Anota de cada anuncio: fecha de inicio, formato y cuántas versiones tiene.',
          'Los que llevan más de dos meses activos son los que funcionan. Guárdalos.',
        ],
        nuestro:
          'Un formato que aquí no ha probado nadie puede llevar un año funcionando en México. Ahí no hay que inventar: hay que traducir. Es la ventaja más barata que existe.',
      },
      {
        id: 'angulo-libre',
        fase: 'validar',
        columna: 7,
        titulo: 'El ángulo que nadie usa',
        resumen: 'Cruzar lo que dicen los anuncios con lo que dice la gente.',
        entrega: '3 ángulos con su cita real',
        cuerpo:
          'Ya tienes los copys de los anuncios activos y los comentarios de la gente. El ángulo bueno está en la resta: lo que la gente repite y ningún anuncio está diciendo.',
        pasos: [
          'Agrupa los copys de los anuncios por ángulo y cuenta cuántos usan cada uno. Ese terreno está saturado.',
          'Vuelve a tus comentarios y busca los dolores que NO aparecen en ningún copy.',
          'Por cada uno, baja una capa: del síntoma a la consecuencia social o emocional.',
          'Quédate con tres y guarda la frase textual que respalda cada uno.',
        ],
        nuestro:
          'La bajada de capa es lo que separa un anuncio del montón de uno que para el scroll. "Se me cae el pelo" es el síntoma y lo dicen todos. "Dejé de salir en las fotos" es la consecuencia, sale de un comentario real, y no lo está usando nadie.',
      },

      // ---------- SALIDA ----------
      {
        id: 'ficha-final',
        fase: 'salida',
        columna: 8,
        titulo: 'Ficha de producto lista',
        resumen: 'Todo lo anterior en una página. Es lo que se lleva a la 1:1.',
        entrega: 'La decisión tomada, con datos detrás',
        cuerpo:
          'Si llegaste hasta aquí, ya no estás adivinando. Esta es la página que resume el trabajo y con la que se decide si se invierte o se vuelve a la lista de problemáticas.',
        pasos: [
          'La problemática, con su score y los dos datos duros que la sostienen.',
          'El producto, con su ficha técnica y las tres especificaciones innegociables.',
          'Costo, precio de venta y margen por unidad ENTREGADA.',
          'Los tres ángulos, cada uno con su cita real y su formato de video.',
          'Lo que te preocupa: la objeción más probable y qué haría fracasar esto.',
        ],
        aviso:
          'Ese último punto no es pesimismo, es lo que se revisa en la 1:1. Si no sabes qué podría salir mal, todavía no entendiste el producto.',
      },
    ],
  },
];

export function getFramework(slug: string): Framework | null {
  return FRAMEWORKS.find((f) => f.slug === slug) ?? null;
}
