// Prompts para armar la landing con IA.
//
// La idea: la estructura ya está decidida y probada (es la de /recursos/
// anatomia-landing). La IA no inventa la arquitectura de la página, solo
// rellena la plantilla con el producto, el ángulo y la paleta de cada uno.
// Eso es lo que hace que el resultado sea usable y no un "diseño de IA".

export type PasoPrevio = {
  numero: number;
  titulo: string;
  descripcion: string;
  entrega: string;
};

export const PASOS_PREVIOS: PasoPrevio[] = [
  {
    numero: 1,
    titulo: 'Ten clara la tienda de referencia y el ángulo',
    descripcion:
      'El ángulo es la razón por la que alguien compra: no es lo que el producto es, es el problema que resuelve. El mismo cepillo eléctrico se puede vender por "limpia sin agacharte" (dolor de espalda) o por "quita el sarro que no sale con nada" (frustración). Son dos landings distintas.',
    entrega: 'Una frase: "le vendo a [quién] que sufre de [problema]".',
  },
  {
    numero: 2,
    titulo: 'Ten el producto listo en Shopify',
    descripcion:
      'Creado, con precio, precio comparativo y las fotos cargadas. El bloque toma título, precio y galería directo de Shopify con Liquid, así que si el producto no existe todavía, la mitad de la plantilla queda vacía.',
    entrega: 'Producto publicado, con compare_at_price y mínimo 3 fotos.',
  },
  {
    numero: 3,
    titulo: 'Define la paleta antes de pedir nada',
    descripcion:
      'Tres colores bastan: uno oscuro para texto, uno de acento solo para botones y uno suave de fondo. El de acento no se usa en ningún otro lado — si aparece en decoración, el ojo deja de asociarlo con "aquí se hace clic".',
    entrega: 'Tres códigos hex. Ej: #0F172A, #F97316, #F8FAFC.',
  },
  {
    numero: 4,
    titulo: 'Reúne las imágenes o mándalas a generar',
    descripcion:
      'Necesitas mínimo cinco: tres de galería, una de "antes" y una de "después". Si no las tienes, los prompts de más abajo las generan. Súbelas a Shopify primero y copia las URLs.',
    entrega: 'URLs de las imágenes ya subidas a Shopify.',
  },
];

// ---------------------------------------------------------------------------
// Prompt para Gemini
// ---------------------------------------------------------------------------

export const PROMPT_GEMINI = `Actúa como un desarrollador de Shopify especializado en landings de producto para venta contra entrega en Latinoamérica.

Vas a escribir DOS bloques de HTML/Liquid para pegar en una página de producto de Shopify. Te doy la estructura exacta; tu trabajo es rellenarla, no rediseñarla.

═══════════════════════════════════════
DATOS DEL PROYECTO
═══════════════════════════════════════

PRODUCTO:
{{PRODUCTO}}

ÁNGULO DE VENTA:
{{ANGULO}}

PALETA (usa exactamente estos hex, nada más):
{{COLORES}}

PÚBLICO:
{{PUBLICO}}

═══════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════

BLOQUE 1 — va arriba del formulario de pedido:
 1. Barra de anuncios (una sola frase, la que quite la objeción de pagar por adelantado)
 2. Hero: carrusel de imágenes del producto, deslizable, con puntos de posición
 3. Oferta: estrellas + título + precio con ahorro EN PESOS + aviso de stock
 4. Tres beneficios de confianza con íconos SVG (envío, forma de pago, garantía)
 5. Cronograma del pedido con fechas calculadas en Liquid desde "now"

BLOQUE 2 — va debajo del formulario:
 6. Antes y después / nosotros vs la alternativa (dos imágenes lado a lado)
 7. Botón de compra
 8. El problema: cuatro dolores concretos, sobre fondo oscuro
 9. Video del producto en bucle, silenciado
10. Características: cuatro tarjetas, característica arriba y beneficio abajo
11. Tabla comparativa: tu producto contra la alternativa
12. Cómo se usa: exactamente tres pasos
13. Reseñas: tres, con ciudad y fecha relativa
14. Botón de compra (segunda vez)
15. Qué incluye: lista desglosada con vistos
16. Garantía con plazo concreto
17. FAQ en acordeón, mínimo cuatro preguntas
18. Cierre oscuro: prueba social + botón final + tres sellos de confianza

═══════════════════════════════════════
REGLAS TÉCNICAS
═══════════════════════════════════════

- Todo el CSS va en un <style> dentro del bloque 1, con la paleta en variables
  CSS sobre :root del contenedor. El bloque 2 hereda esas variables.
- Prefija TODAS las clases con "pdp-" para no chocar con el tema de Shopify.
- Ancho máximo 500px, centrado. Diseño mobile-first.
- Usa Liquid real para lo dinámico:
    {{ product.title }}
    {{ product.price | money }}
    {{ product.compare_at_price | money }}
    galería con {% for image in product.images limit: 5 %}
- Las fechas del cronograma se calculan con "now" | date: "%s" más segundos
  (86400 = 1 día). Los meses en español van en un array partido con split,
  porque Liquid no los trae localizados.
- Los botones NO son un carrito normal: disparan el formulario de contra
  entrega buscando #rsi_buy_now_button y despachándole eventos de mouse.
- Nada de librerías externas. Solo la fuente de Google Fonts.
- El JavaScript va en <script> al final de cada bloque, envuelto en IIFE.

═══════════════════════════════════════
REGLAS DE COPY
═══════════════════════════════════════

- Español neutro de Colombia. Tuteo. Sin "usted".
- El ahorro se muestra en pesos, nunca en porcentaje: "AHORRAS $80.000"
  pesa más que "40% OFF" porque el cerebro no tiene que calcular.
- Los cuatro dolores no mencionan el producto. Son la vida del cliente hoy.
- Cada característica lleva el beneficio pegado: "125 cm" no dice nada,
  "125 cm para que no te agaches" sí.
- Cada reseña empieza por el problema que la persona tenía y termina en el
  resultado. El resultado va en <b>.
- Exactamente tres pasos en "cómo se usa", aunque el proceso real tenga cinco.
  Cuatro ya se lee como instructivo y activa el miedo a que sea complicado.
- Nada de promesas médicas, ni cifras que no se puedan sostener, ni
  contadores regresivos falsos.

═══════════════════════════════════════
MARCADORES
═══════════════════════════════════════

Donde necesites una imagen o un video que yo debo subir, deja el marcador
literal [URL_IMAGEN_ANTES], [URL_IMAGEN_DESPUES], [URL_VIDEO], [URL_POSTER].
No inventes URLs de CDN ni uses placeholders de servicios externos.

═══════════════════════════════════════
SALIDA
═══════════════════════════════════════

Devuelve exactamente dos bloques de código, sin explicaciones entre ellos:

BLOQUE 1
\`\`\`html
(código)
\`\`\`

BLOQUE 2
\`\`\`html
(código)
\`\`\`

Si te paso imágenes adjuntas, léelas para sacar el color real del producto,
el material y el contexto de uso, y ajusta el copy a lo que realmente se ve.`;

export const CAMPOS_GEMINI = [
  {
    slot: '{{PRODUCTO}}',
    etiqueta: 'Producto',
    ejemplo:
      'Cepillo eléctrico de limpieza multiusos, 9 cabezales intercambiables, mango extensible a 125 cm, batería de 90 minutos, resistente al agua. Precio $119.900, antes $199.900.',
  },
  {
    slot: '{{ANGULO}}',
    etiqueta: 'Ángulo de venta',
    ejemplo:
      'Limpiar sin agacharse ni tallar. Le hablo a quien termina el aseo con dolor de espalda y rodillas.',
  },
  {
    slot: '{{COLORES}}',
    etiqueta: 'Paleta',
    ejemplo:
      'Texto y fondos oscuros #0F172A · Acento solo para botones #F97316 · Fondo suave de tarjetas #F8FAFC · Subrayado #FEF08A · Verde de confianza #16A34A',
  },
  {
    slot: '{{PUBLICO}}',
    etiqueta: 'Público',
    ejemplo:
      'Mujeres de 30 a 60 años en Colombia, amas de casa o que trabajan y hacen el aseo los fines de semana. Compran por WhatsApp y pagan contra entrega.',
  },
];

// ---------------------------------------------------------------------------
// Prompts de imagen
// ---------------------------------------------------------------------------

export type PromptImagen = {
  id: string;
  nombre: string;
  donde: string;
  prompt: string;
};

export const PROMPTS_IMAGENES: PromptImagen[] = [
  {
    id: 'hero-1',
    nombre: 'Hero principal',
    donde: 'Primera foto del carrusel',
    prompt: `Fotografía de producto de [PRODUCTO] sobre fondo liso [COLOR CLARO NEUTRO], iluminación de estudio suave con sombra difusa debajo, ángulo tres cuartos ligeramente elevado, producto ocupando el 70% del encuadre y centrado, colores fieles al real, alta nitidez en los detalles de material y textura, sin texto, sin logotipos, sin marcas de agua, formato cuadrado 1:1, calidad de catálogo de ecommerce.`,
  },
  {
    id: 'hero-2',
    nombre: 'Producto en uso',
    donde: 'Segunda foto del carrusel',
    prompt: `Fotografía lifestyle de una persona [PERFIL DEL CLIENTE: ej. mujer latina de 35 años] usando [PRODUCTO] en [CONTEXTO REAL: ej. el baño de una casa de clase media latinoamericana], luz natural de ventana, expresión relajada y cómoda, el producto claramente visible y en foco, encuadre medio, aspecto documental y realista, nada de aspecto de stock corporativo, sin texto, formato cuadrado 1:1.`,
  },
  {
    id: 'hero-3',
    nombre: 'Qué incluye',
    donde: 'Tercera foto del carrusel',
    prompt: `Fotografía cenital tipo "flat lay" de [PRODUCTO] con todos sus accesorios ordenados y separados sobre fondo [COLOR CLARO NEUTRO], distribución simétrica y aireada, luz de estudio pareja sin sombras duras, todos los elementos visibles y distinguibles entre sí, sin texto ni etiquetas, formato cuadrado 1:1.`,
  },
  {
    id: 'antes',
    nombre: 'Antes',
    donde: 'Columna izquierda del bloque antes/después',
    prompt: `Fotografía realista de [SUPERFICIE U OBJETO] en estado [PROBLEMA: ej. sucio, con sarro acumulado, opaco], luz natural neutra ligeramente fría, encuadre cerrado, aspecto cotidiano y creíble de un hogar latinoamericano real, sin exagerar ni parecer montaje, sin texto, formato cuadrado 1:1. IMPORTANTE: memoriza el encuadre, el ángulo y la iluminación exactos para reutilizarlos en la imagen del "después".`,
  },
  {
    id: 'despues',
    nombre: 'Después',
    donde: 'Columna derecha del bloque antes/después',
    prompt: `La misma escena, el mismo encuadre, el mismo ángulo y la misma iluminación de la imagen anterior, pero con [SUPERFICIE U OBJETO] ya [RESULTADO: ej. limpio, sin sarro, brillante]. Solo cambia el estado del objeto: la cámara, la luz y la composición no se mueven. Sin texto, formato cuadrado 1:1.`,
  },
  {
    id: 'detalle',
    nombre: 'Macro de detalle',
    donde: 'Refuerzo entre secciones',
    prompt: `Macrofotografía de [PARTE ESPECÍFICA DEL PRODUCTO] en pleno uso sobre [SUPERFICIE], profundidad de campo corta con el punto de acción en foco nítido, luz lateral que marca la textura, se aprecia el efecto ocurriendo, realista y sin retoque exagerado, sin texto, formato cuadrado 1:1.`,
  },
];

export const NOTA_IMAGENES = `Genera "antes" y "después" en la misma conversación y una detrás de otra: es la única forma de que el encuadre y la luz coincidan. Si las pides por separado, salen dos escenas distintas y la comparación pierde toda credibilidad — que es justo lo que ese bloque tiene que lograr.`;
