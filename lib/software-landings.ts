/**
 * Los lineamientos de landing de LUMENS, portados tal cual del sistema con el
 * que Juan arma las suyas.
 *
 * El orden no se negocia y no es estético: es el orden en que una persona que
 * no te conoce decide comprarte. Si mueves la prueba social antes del
 * problema, la estás poniendo a defender algo que el visitante todavía no
 * siente que necesita.
 */

export interface BloqueLanding {
  id: string;
  numero: number;
  nombre: string;
  /** Qué tiene que lograr este bloque. Uno solo. */
  trabajo: string;
  /** Lo que va adentro, concreto. */
  piezas: string[];
  /** El error que casi todos cometen en este bloque. */
  error: string;
  /** Cómo saber si quedó bien. */
  prueba: string;
}

export const BLOQUES: BloqueLanding[] = [
  {
    id: 'hero',
    numero: 1,
    nombre: 'Hero',
    trabajo: 'Que en tres segundos sepa qué es, para quién, cuánto cuesta y que paga cuando llegue.',
    piezas: [
      'Headline con el hook principal — el mismo del creativo que lo trajo',
      'Subheadline con la promesa concreta, no adjetivos',
      'Foto o video del producto en uso, no en fondo blanco',
      'Precio con el tachado al lado, para que el ancla exista',
      'Sello visible de Pago contra entrega',
      'Botón de comprar, arriba, sin tener que bajar',
    ],
    error:
      'Poner un headline distinto al del anuncio. El visitante llega buscando lo que le prometiste y no lo encuentra: se va antes de leer la segunda línea.',
    prueba:
      'Tápale todo menos el hero a alguien que no conoce el producto. Si no te puede decir qué es y cuánto vale, el hero no sirve.',
  },
  {
    id: 'problema',
    numero: 2,
    nombre: 'Problema',
    trabajo: 'Que se reconozca. Que piense "esto me pasa a mí" antes de que le vendas nada.',
    piezas: [
      'El dolor descrito con las palabras del cliente, sacadas de reseñas y comentarios',
      'La situación específica, con hora y lugar: no "dolor de espalda" sino "a las 3 de la tarde ya no aguantas sentado"',
      'Lo que ya intentó y no le funcionó',
    ],
    error:
      'Escribirlo con tus palabras y no con las suyas. Si dices "optimiza tu descanso" y él dice "amanezco molido", le estás hablando a otra persona.',
    prueba:
      'Cada frase de este bloque debería poder aparecer entre comillas en una reseña real. Si suena a folleto, reescríbela.',
  },
  {
    id: 'solucion',
    numero: 3,
    nombre: 'Solución y demostración',
    trabajo: 'Mostrar que funciona. No decirlo: mostrarlo.',
    piezas: [
      'El producto en acción, en video o en secuencia de fotos',
      'De tres a cinco beneficios, cada uno atado a algo que se ve',
      'Cómo se usa, en pasos, para que no quede duda de que es fácil',
    ],
    error:
      'Listar características en vez de beneficios. "Material de silicona grado alimenticio" no vende; "no le pasa el sabor a la comida" sí.',
    prueba:
      'Por cada bullet, pregúntate "¿y eso qué?". Si la respuesta es más interesante que el bullet, el bullet está mal escrito.',
  },
  {
    id: 'prueba-social',
    numero: 4,
    nombre: 'Prueba social',
    trabajo: 'Bajar la desconfianza. En contra entrega es el freno número uno.',
    piezas: [
      'Testimonios con nombre y ciudad colombiana, no "María G."',
      'Fotos reales de clientes con el producto, aunque estén mal tomadas',
      'Capturas de WhatsApp o de comentarios, con lo personal tapado',
      'Un número si lo tienes: cuántos has vendido, cuántos repiten',
    ],
    error:
      'Testimonios perfectos y genéricos. Uno que diga "llegó un día tarde pero el producto es buenísimo" convierte más que cinco de cinco estrellas sin defecto.',
    prueba:
      'Si los testimonios podrían estar en la landing de cualquier otro producto, no son testimonios: son relleno.',
  },
  {
    id: 'oferta',
    numero: 5,
    nombre: 'Oferta',
    trabajo: 'Que la decisión se sienta fácil y que haya una razón para hoy.',
    piezas: [
      'El stack de valor: todo lo que recibe, con su precio por separado',
      'La garantía, escrita como la entendería alguien desconfiado',
      'Envío gratis si lo tienes — y si no, dilo claro aquí y no en el carrito',
      'Escasez honesta: una fecha real, un inventario real. Nada de contadores falsos',
    ],
    error:
      'Urgencia inventada. Un contador que se reinicia al recargar la página le dice al visitante que le estás mintiendo, y ahí perdiste todo lo que construiste arriba.',
    prueba:
      'Si tuvieras que defender cada afirmación de este bloque frente al cliente por teléfono, ¿podrías? Si no, bórrala.',
  },
  {
    id: 'cierre',
    numero: 6,
    nombre: 'Cierre',
    trabajo: 'Quitar la última duda y tomar el pedido sin fricción.',
    piezas: [
      'FAQ cortas, respondiendo las objeciones reales: cuánto demora, qué pasa si no me sirve, cómo pago',
      'El formulario: nombre, teléfono, dirección, ciudad y departamento. Nada más',
      'Repetir el sello de contra entrega justo al lado del botón',
    ],
    error:
      'Pedir correo, cédula o fecha de nacimiento. Cada campo extra en un formulario de contra entrega te cuesta pedidos, y ninguno de esos datos lo necesitas para despachar.',
    prueba:
      'Cuenta los campos. Si son más de cinco, sobra alguno. Llena el formulario tú mismo desde el celular, con una mano.',
  },
];

/** Lo que hay que tener a mano antes de abrir el editor. */
export const ANTES_DE_EMPEZAR = [
  'Las reseñas del producto ya leídas y con las frases textuales subrayadas',
  'El hook del creativo que va a traer el tráfico, porque el headline tiene que ser el mismo',
  'Las fotos del producto en uso, no las del proveedor en fondo blanco',
  'El precio y el precio tachado ya decididos, con el costeo hecho',
];

export interface TareaEstudio {
  id: string;
  nombre: string;
  descripcion: string;
  marcador: string;
  /** Lo que se le antepone a lo que escriba el estudiante. */
  instruccion: string;
}

/**
 * Las tareas del estudio, portadas de AI_TASKS de LUMENS OS. Corren contra el
 * mismo proveedor que el asistente del portal, no contra el de aquel repo.
 */
export const TAREAS: TareaEstudio[] = [
  {
    id: 'codigo',
    nombre: 'Código de la landing',
    descripcion: 'La sección completa en Liquid, lista para pegar en Shopify.',
    marcador:
      'Producto, precio y precio tachado, a quién le vendes, los 3 beneficios, y qué sección quieres (producto, testimonios, comparativa, FAQ, oferta…). Si tienes colores de marca, dilos.',
    // Esta tarea no usa SISTEMA_ESTUDIO sino SISTEMA_CODIGO, que lleva adentro
    // la paleta, las fuentes y la anatomía del botón sacadas de las landings
    // de referencia. Por eso la instrucción aquí es corta.
    instruccion:
      'Genera la sección de Shopify completa y auto-contenida que te pide el usuario, siguiendo al pie de la letra el sistema de diseño. Entrega el código y una nota corta de instalación.',
  },
  {
    id: 'landing',
    nombre: 'Copy de la landing',
    descripcion: 'La landing completa, bloque por bloque, con la estructura de arriba.',
    marcador:
      'Producto, a quién le vendes, precio y precio tachado, el ángulo del creativo, y las frases que sacaste de las reseñas…',
    instruccion:
      'Crea el copy COMPLETO de una landing de pago contra entrega siguiendo exactamente la estructura de seis bloques (Hero → Problema → Solución y demostración → Prueba social → Oferta → Cierre). Entrega cada bloque con su título, el copy final listo para pegar, y al final sugiere qué imagen o video va en cada uno. Usa las palabras del cliente, no las de marketing.',
  },
  {
    id: 'hooks',
    nombre: '10 hooks',
    descripcion: 'Diez aperturas de tres segundos, cada una con un ángulo distinto.',
    marcador: 'Producto, ángulo y a quién le vendes…',
    instruccion:
      'Genera 10 hooks distintos, de máximo 12 palabras cada uno, para este producto. Numéralos y varía el ángulo emocional entre ellos. Tienen que funcionar en los primeros 3 segundos de un video de Meta o TikTok.',
  },
  {
    id: 'guion',
    nombre: 'Guion de video',
    descripcion: 'Un guion de 30 a 40 segundos, de hook a CTA.',
    marcador: 'Producto, ángulo y duración…',
    instruccion:
      'Escribe un guion de video ad de 30 a 40 segundos con hook, desarrollo del dolor, demostración, prueba social y CTA de pago contra entrega. Marca los tiempos de cada escena.',
  },
  {
    id: 'faq',
    nombre: 'FAQ y objeciones',
    descripcion: 'Las dudas que frenan el pedido, con su respuesta.',
    marcador: 'Producto, precio, tiempo de entrega y lo que te preguntan más…',
    instruccion:
      'Lista las 8 objeciones más probables de un comprador colombiano de contra entrega para este producto, cada una con una respuesta corta y honesta lista para poner en la FAQ de la landing. Ordénalas de la que más frena a la que menos.',
  },
];

/**
 * El sistema del estudio. Es el BASE_SYSTEM de LUMENS OS con la estructura de
 * landing adentro, para que lo que genere la IA sea lo mismo que enseñan los
 * lineamientos de esta página y no otra cosa.
 */
export const SISTEMA_ESTUDIO = `Eres el asistente creativo de Generación 1K Élite, el programa de
Juan Felipe López para montar un ecommerce de pago contra entrega (PCE) en Colombia.
Escribes en español colombiano, directo y emocional, sin palabras de marketing vacías.

Los hooks tienen que funcionar en los primeros 3 segundos de un video de Meta o TikTok.

Estructura de landing, siempre en este orden:
1. HERO: headline con el hook principal (el mismo del creativo que trae el trafico),
   subheadline con la promesa concreta, precio con tachado como ancla, sello de
   "Pago contra entrega" y boton de compra visible sin bajar.
2. PROBLEMA: el dolor en las palabras del cliente, sacadas de resenas reales.
   Situacion especifica, no categorias.
3. SOLUCION Y DEMOSTRACION: el producto en accion, 3 a 5 beneficios atados a algo
   que se ve, y como se usa en pasos.
4. PRUEBA SOCIAL: testimonios con nombre y ciudad colombiana, fotos reales de
   clientes, capturas de WhatsApp. Mejor uno con un defecto menor que cinco perfectos.
5. OFERTA: stack de valor con precios por separado, garantia escrita para alguien
   desconfiado, envio, y escasez honesta. Nunca contadores falsos.
6. CIERRE: FAQ cortas contra las objeciones reales y formulario de maximo cinco
   campos (nombre, telefono, direccion, ciudad, departamento).

Reglas que no se rompen:
- Beneficios, no caracteristicas. Por cada afirmacion, responde "y eso que".
- Nada de urgencia inventada ni cifras que el estudiante no pueda defender por telefono.
- No pidas correo ni cedula en el formulario: cada campo extra cuesta pedidos.
- Si te falta un dato para escribir bien (precio, a quien le vende, el angulo),
  pidelo en una linea antes de escribir, no lo inventes.

Responde solo con la respuesta final, sin mostrar tu razonamiento paso a paso.`;
