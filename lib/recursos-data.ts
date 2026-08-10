// Contenido de la zona pública de recursos (/recursos).
//
// Vive aparte de portal-data.ts a propósito: esto es material abierto, no
// requiere sesión y no toca Supabase. Si mañana crece, cada recurso puede
// mudarse a su propia ruta sin tocar el portal.

export type Recurso = {
  slug: string;
  numero: number;
  titulo: string;
  descripcion: string;
  etiqueta: string;
  disponible: boolean;
};

export const RECURSOS: Recurso[] = [
  {
    slug: 'anatomia-landing',
    numero: 1,
    titulo: 'Anatomía de una landing que vende',
    descripcion:
      'Las 14 secciones de una página de ventas, en orden, y por qué cada una está donde está. Explorable pieza por pieza.',
    etiqueta: 'Interactivo',
    disponible: true,
  },
  {
    slug: 'producto-ganador',
    numero: 2,
    titulo: 'Cómo validar un producto ganador',
    descripcion:
      'Los criterios que uso antes de invertir un peso en pauta: margen, dolor, diferencial y prueba de demanda.',
    etiqueta: 'Guía',
    disponible: false,
  },
  {
    slug: 'estructura-campanas',
    numero: 3,
    titulo: 'Estructura de campañas en TikTok Ads',
    descripcion:
      'Cómo armo, leo y escalo una campaña de contra entrega sin quemar presupuesto en los primeros días.',
    etiqueta: 'Guía',
    disponible: false,
  },
  {
    slug: 'contra-entrega',
    numero: 4,
    titulo: 'Contra entrega en Colombia, de punta a punta',
    descripcion:
      'Dropi, transportadoras, tasa de entrega y qué hacer con las devoluciones para que no se coman el margen.',
    etiqueta: 'Guía',
    disponible: false,
  },
];

// ---------------------------------------------------------------------------
// Anatomía de una landing
//
// El orden es el del esquema original: arriba lo que ve el tráfico HOT (ya
// conoce el producto, viene a comprar) y abajo lo que necesita el tráfico
// FRÍO (llegó del anuncio y aún no confía). Por eso el botón de compra
// aparece antes que las reseñas: quien ya está listo no debería tener que
// bajar hasta el final.
// ---------------------------------------------------------------------------

export type Bloque = {
  id: string;
  nombre: string;
  tipo: 'media' | 'texto' | 'social' | 'cta' | 'lista' | 'datos' | 'urgencia';
  temperatura: 'hot' | 'tibio' | 'frio';
  resumen: string;
  porQue: string;
  claves: string[];
  // Espacio reservado para el snippet de Liquid de cada bloque. Se deja
  // vacío a propósito hasta que peguemos los nuestros.
  liquid: string | null;
};

export const BLOQUES: Bloque[] = [
  {
    id: 'oferta',
    nombre: 'Información clave de la oferta',
    tipo: 'media',
    temperatura: 'hot',
    resumen:
      'La imagen o GIF que abre la página, con lo esencial de la oferta encima.',
    porQue:
      'Es la única sección donde vale la pena detenerse a pensar y editar con calma. Es lo primero que ve todo el mundo, frío o caliente, y decide si se quedan o se van.',
    claves: [
      'Debe leerse completa sin hacer scroll, también en móvil',
      'Que continúe visualmente el anuncio por el que llegaron',
      'Una sola idea: qué es y para qué sirve',
    ],
    liquid: null,
  },
  {
    id: 'titulo',
    nombre: 'Título del producto + estrellas + precio',
    tipo: 'texto',
    temperatura: 'hot',
    resumen: 'Nombre, calificación en estrellas y precio, juntos y arriba.',
    porQue:
      'Las reseñas aquí importan muchísimo, porque la mayoría de clientes nunca va a llegar hasta abajo a verlas. Las estrellas junto al precio hacen el trabajo de las reseñas para quien no baja.',
    claves: [
      'Precio visible sin scroll: esconderlo genera desconfianza',
      'Las estrellas van pegadas al título, no sueltas',
      'Si hay precio tachado, que la comparación sea honesta',
    ],
    liquid: null,
  },
  {
    id: 'interes',
    nombre: 'Interés y confianza',
    tipo: 'texto',
    temperatura: 'hot',
    resumen: 'Bloque corto que responde "¿por qué te compro a ti?".',
    porQue:
      'Vamos a aumentar la confianza en la tienda de forma sutil cada vez que tengamos la oportunidad, mientras resolvemos dudas frecuentes. No es una sección, es una costumbre.',
    claves: [
      'Envío, garantía y devolución en una línea cada uno',
      'Mejor íconos y frases cortas que un párrafo',
      'Resolver la duda antes de que la piensen',
    ],
    liquid: null,
  },
  {
    id: 'social',
    nombre: 'Validación social',
    tipo: 'social',
    temperatura: 'hot',
    resumen: 'Señal rápida de que otros ya compraron y quedaron bien.',
    porQue:
      'Arriba va la versión corta: un contador, tres caras, una frase. Las reseñas largas van al final, pero quien compra rápido necesita ver la señal aquí.',
    claves: [
      'Cifras concretas antes que adjetivos',
      'Fotos reales pesan más que estrellas dibujadas',
      'Si no tienes reseñas todavía, no las inventes',
    ],
    liquid: null,
  },
  {
    id: 'cta-1',
    nombre: 'Botón de compra',
    tipo: 'cta',
    temperatura: 'hot',
    resumen: 'El primer botón, arriba del todo.',
    porQue:
      'Todo lo de arriba existe para que este botón tenga sentido. El cliente caliente ya venía decidido: obligarlo a bajar media página para comprar es perder ventas.',
    claves: [
      'Que contraste con todo lo demás de la página',
      'Texto en primera persona: "Lo quiero", no "Enviar"',
      'Se repite más abajo, pero este es el que atrapa al que ya decidió',
    ],
    liquid: null,
  },
  {
    id: 'gif-principal',
    nombre: 'GIF principal',
    tipo: 'media',
    temperatura: 'tibio',
    resumen: 'El producto en movimiento, mostrando lo que mejor hace.',
    porQue:
      'Mostramos la parte más llamativa del producto, la misma que aparece en el anuncio o en las imágenes de la página. Si el anuncio prometió algo, aquí se ve.',
    claves: [
      'Que se entienda sin sonido y sin explicación',
      'Corto y en bucle: 2 a 4 segundos',
      'Peso controlado o se cae la velocidad de carga',
    ],
    liquid: null,
  },
  {
    id: 'copy',
    nombre: 'Copy de mayor interés',
    tipo: 'texto',
    temperatura: 'tibio',
    resumen: 'El titular más fuerte, con un texto complementario debajo.',
    porQue:
      'Aquí es donde se convence a quien todavía duda. El titular carga el argumento principal y el texto de abajo lo sostiene.',
    claves: [
      'Un beneficio, no una lista de características',
      'Hablarle al problema del cliente, no al producto',
      'Frases cortas: en móvil se lee en diagonal',
    ],
    liquid: null,
  },
  {
    id: 'gif-2',
    nombre: 'GIF 2',
    tipo: 'media',
    temperatura: 'tibio',
    resumen: 'Segundo apoyo visual, con otro ángulo o uso.',
    porQue:
      'Rompe el muro de texto y muestra un uso distinto al del primer GIF. Sirve de respiro visual antes de la lista de beneficios.',
    claves: [
      'Que no repita el ángulo del GIF principal',
      'Ideal: el producto en manos de una persona real',
      'Va justo antes de la lista para preparar el terreno',
    ],
    liquid: null,
  },
  {
    id: 'beneficios',
    nombre: 'Lista de beneficios',
    tipo: 'lista',
    temperatura: 'tibio',
    resumen: 'Los "por qué sí" del producto, en lista.',
    porQue:
      'Las listas de beneficios hacen que las personas consuman más fácil los "por qué sí" de tu producto. En bloque de texto se pierden; en lista se leen.',
    claves: [
      'Beneficio, no característica: qué gana el cliente',
      'Entre 4 y 6 puntos, más se vuelve ruido',
      'Cada punto en una sola línea',
    ],
    liquid: null,
  },
  {
    id: 'porcentaje',
    nombre: '% de beneficio o tabla comparativa',
    tipo: 'datos',
    temperatura: 'tibio',
    resumen: 'Cifras o una tabla que comparan tu producto contra la alternativa.',
    porQue:
      'El porcentaje de beneficio o una tabla deben usarse para comparar atributos de tu producto. Es el bloque que convierte una opinión en un dato.',
    claves: [
      'Comparar contra la alternativa real del cliente',
      'Tres cifras redondas pesan más que diez exactas',
      'Si el dato no se puede sostener, mejor no ponerlo',
    ],
    liquid: null,
  },
  {
    id: 'caracteristicas',
    nombre: 'Lista de características',
    tipo: 'lista',
    temperatura: 'frio',
    resumen: 'La ficha técnica: medidas, materiales, contenido, compatibilidad.',
    porQue:
      'Son fundamentales, porque una buena landing debe responder todas las preguntas del cliente. Cada duda que no resuelvas aquí es una venta que se cae o un mensaje que toca contestar a mano.',
    claves: [
      'Medidas y materiales exactos',
      'Qué incluye y qué no incluye la caja',
      'Es la sección que más reduce mensajes de WhatsApp',
    ],
    liquid: null,
  },
  {
    id: 'deseo',
    nombre: 'Deseo: antes y después',
    tipo: 'media',
    temperatura: 'frio',
    resumen:
      'Antes y después, o video del producto con texto diciendo lo que va a recibir.',
    porQue:
      'Aquí nos centramos en lo que el cliente va a sentir cuando adquiera el producto, para activar el deseo. Ya entendió qué es; ahora tiene que verse a sí mismo usándolo.',
    claves: [
      'Mostrar el resultado, no el producto',
      'El antes tiene que parecerse a la situación del cliente',
      'Decir explícitamente qué va a recibir',
    ],
    liquid: null,
  },
  {
    id: 'urgencia',
    nombre: 'Urgencia',
    tipo: 'urgencia',
    temperatura: 'frio',
    resumen: 'La razón para comprar hoy y no "después".',
    porQue:
      'Sin una razón real para decidir ahora, el cliente frío cierra la página con toda la intención de volver — y no vuelve.',
    claves: [
      'Que la escasez sea verdadera: stock o envío real',
      'Los contadores falsos se notan y queman la tienda',
      'Una sola línea, sin gritar',
    ],
    liquid: null,
  },
  {
    id: 'resenas',
    nombre: 'Reseñas',
    tipo: 'social',
    temperatura: 'frio',
    resumen: 'La prueba social completa, al cierre.',
    porQue:
      'Al menos 5 reseñas, y al menos 2 con foto si las conseguimos. Quien llegó hasta aquí es el más desconfiado de todos: necesita ver gente real antes de decidir.',
    claves: [
      'Mínimo 5, con nombre y fecha',
      'Al menos 2 con foto real del cliente',
      'Una reseña que mencione una pega menor da más credibilidad',
    ],
    liquid: null,
  },
];

export const TEMPERATURAS = {
  hot: {
    etiqueta: 'HOT',
    descripcion: 'Ya conoce el producto y viene a comprar',
    color: '#F87171',
  },
  tibio: {
    etiqueta: 'TIBIO',
    descripcion: 'Le interesa, pero todavía compara',
    color: '#F59E0B',
  },
  frio: {
    etiqueta: 'FRÍO',
    descripcion: 'Llegó del anuncio y aún no confía',
    color: '#22D3EE',
  },
} as const;
