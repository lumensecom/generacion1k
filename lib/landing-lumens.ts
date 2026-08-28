// La guía "Estructura Ganadora de Landing LUMENS".
//
// Sale de las landings que YA están convirtiendo en lumenscol.com, no de
// teoría. Los datos de la sección de auditoría se sacaron leyendo el HTML
// real de las dos páginas en producción, no de memoria.

export interface BloqueAIDA {
  n: number;
  fase: 'Atención' | 'Interés' | 'Deseo' | 'Acción';
  nombre: string;
  contiene: string;
  copy: string;
}

export const BLOQUES_AIDA: BloqueAIDA[] = [
  {
    n: 1, fase: 'Atención', nombre: 'Hero',
    contiene: 'Imagen hero + título + precio + CTA',
    copy: `[Emoji] ★★★★★ 4.9 · +XXX clientes felices

# [Nombre del Producto] [Beneficio en 3 palabras]

$[PRECIO_TACHADO]  $[PRECIO_ACTUAL]  AHORRAS $[DIFERENCIA]

[URGENCIA: "ÚLTIMAS X UNIDADES EN STOCK HOY"]

✓ Envío Gratis  ✓ Pago Contra Entrega  ✓ Garantía [XX] Días

[BOTÓN CTA principal]`,
  },
  {
    n: 2, fase: 'Interés', nombre: 'Cronograma',
    contiene: 'Cuándo pides · Cuándo despachamos · Cuándo llega',
    copy: `📦 ¿CUÁNDO RECIBES TU PEDIDO?

🛒 Hoy — Tu pedido
🚚 [FECHA+1] — Despacho
🎁 [FECHA+2] a [FECHA+4] — Recibes y pagas`,
  },
  {
    n: 3, fase: 'Interés', nombre: 'Comparativa',
    contiene: 'Producto vs alternativa, en imagen',
    copy: `## ¿Por qué cambiar a [PRODUCTO]?

✕ [ALTERNATIVA TRADICIONAL]
[Descripción problema breve]

✓ [PRODUCTO]
[Descripción solución breve]

[IMAGEN 2 · Antes/Después]

[Grid de 3 features rápidos con emojis]`,
  },
  {
    n: 4, fase: 'Deseo', nombre: 'Dolores del cliente',
    contiene: '4 iconos con problemas + imagen de uso',
    copy: `## ¿[PREGUNTA QUE ACTIVA EL DOLOR]?

🚫 [Dolor 1 — el más común]
🪒 [Dolor 2 — dolor físico o emocional]
😤 [Dolor 3 — pérdida de tiempo o dinero]
💸 [Dolor 4 — costo de no resolver]

[IMAGEN 4 · Producto en uso]`,
  },
  {
    n: 5, fase: 'Deseo', nombre: 'Beneficios y features',
    contiene: 'Grid de features + imagen infográfica',
    copy: `### Todo el poder de [X] en [Y]

⚡ [Feature 1]
📐 [Feature 2]
🔋 [Feature 3]
💧 [Feature 4]

[IMAGEN 3 · Infografía técnica]`,
  },
  {
    n: 6, fase: 'Deseo', nombre: 'Imagina tu vida',
    contiene: '4 iconos con la transformación',
    copy: `### Imagina [ACCIÓN] sin…

🪒 [Sin dolor específico 1]
⏳ [Sin frustración 2]
🧴 [Sin gasto 3]
💪 [Sin esfuerzo 4]`,
  },
  {
    n: 7, fase: 'Deseo', nombre: 'Tabla comparativa',
    contiene: 'Nosotros vs otros, con checks',
    copy: `| MÉTODO     | LUMENS™      | OTROS         |
|------------|--------------|---------------|
| Aspecto 1  | ✨ Beneficio | ⚠️ Limitación |
| Aspecto 2  | ✅ Beneficio | ❌ Limitación |
| Aspecto 3  | ⚡ Beneficio | ⏳ Limitación |
| Aspecto 4  | ✅ Beneficio | ❌ Limitación |
| Aspecto 5  | 🛡️ Beneficio | ❌ Limitación |`,
  },
  {
    n: 8, fase: 'Deseo', nombre: 'Testimonios',
    contiene: '3 reseñas con ciudades colombianas',
    copy: `### Opiniones Reales en Colombia 🇨🇴

Más de [XXX] [personas] ya [BENEFICIO]

⭐⭐⭐⭐⭐
"[Testimonio 1 · foco en resultado tangible]"
[INICIAL] [Nombre]. [Ciudad] · ✓ Verificado

⭐⭐⭐⭐⭐
"[Testimonio 2 · foco en emoción o transformación]"
[INICIAL] [Nombre]. [Ciudad] · ✓ Verificado

⭐⭐⭐⭐⭐
"[Testimonio 3 · foco en regalar o recomendar]"
[INICIAL] [Nombre]. [Ciudad] · ✓ Verificado`,
  },
  {
    n: 9, fase: 'Acción', nombre: 'Cierre',
    contiene: 'Lo que recibes + garantía + FAQ + CTA final',
    copy: `[BOTÓN CTA principal]

### ¿Qué vas a recibir en tu paquete?

✓ 1× [Producto principal]
✓ [Accesorios]
✓ 1× Cable de carga USB
✓ 1× Manual en español
✓ Envío Gratis a domicilio
✓ Garantía de [XX] días
✓ Pago Contra Entrega

🛡️ Garantía LUMENS [XX] días
[Copy de garantía breve]

### Preguntas Frecuentes
[Las 6 obligatorias]

★★★★★ Más de [XXX] [personas] ya [BENEFICIO]
🔥 Envío gratis solo para pedidos completados hoy

[BOTÓN CTA FINAL con urgencia]`,
  },
];

export interface ImagenClave {
  n: number;
  nombre: string;
  uso: string;
  ratio: string;
  fondo: string;
  prompt: string;
}

export const IMAGENES: ImagenClave[] = [
  {
    n: 1, nombre: 'Hero principal', uso: 'Primera imagen del bloque 1',
    ratio: '1:1 cuadrado o 4:5 vertical', fondo: 'Blanco o color muy suave del producto',
    prompt: `Ultra premium e-commerce hero image, professional product photography, [DESCRIPCIÓN DEL PRODUCTO], centered composition, soft studio lighting from top-left, clean white or pastel background (color: [COLOR SUAVE RELACIONADO AL PRODUCTO]), high detail, sharp focus on product, subtle shadow underneath, 4:5 vertical aspect ratio, 1080x1350 resolution, photorealistic, commercial quality, no text, no watermark, no logo overlay`,
  },
  {
    n: 2, nombre: 'Comparativa antes/después', uso: 'Bloque 3, después del cronograma',
    ratio: '16:9 horizontal', fondo: 'Dividido en dos (izquierda problema · derecha solución)',
    prompt: `Modern e-commerce comparison infographic, split-screen layout, LEFT side shows [PROBLEMA SIN PRODUCTO] labeled "SIN [PRODUCTO]", RIGHT side shows [SOLUCIÓN CON PRODUCTO] labeled "CON [PRODUCTO]", high contrast between both sides, professional lighting, clean design, subtle red tint on left side and green tint on right side, 16:9 horizontal, photorealistic, commercial quality, minimal text only for labels`,
  },
  {
    n: 3, nombre: 'Infografía técnica', uso: 'Bloque 5, mostrando features',
    ratio: '4:5 vertical', fondo: 'Neutro con etiquetas de partes del producto',
    prompt: `Photorealistic infographic image, 4:5 vertical, central focus on [PRODUCTO] displayed clearly, 4-6 small labels connected with thin lines pointing to specific product parts, labels in Spanish showing features like "[FEATURE 1]", "[FEATURE 2]", "[FEATURE 3]", clean minimalist style, white background, soft shadows, technical specifications visible but not overwhelming, premium editorial quality, 1080x1350 resolution`,
  },
  {
    n: 4, nombre: 'Producto en uso (lifestyle)', uso: 'Bloque 4 o 5, persona real usándolo',
    ratio: '4:5 vertical', fondo: 'Entorno cotidiano (baño, cocina, sala, cama)',
    prompt: `Photorealistic lifestyle photo, 4:5 vertical, Colombian woman aged 25-35 with warm brown skin tone, using [PRODUCTO] in [ESCENARIO NATURAL: baño moderno / cocina hogar / sala / cama], natural daylight through window, authentic candid moment (not posed), warm relatable atmosphere, soft focus background, product visible but not dominant, expression of satisfaction or relief, commercial quality but real UGC feel, no logos, 1080x1350 resolution`,
  },
  {
    n: 5, nombre: 'Detalle macro del producto', uso: 'Bloque 5 o 7, calidad de construcción',
    ratio: '1:1 cuadrado', fondo: 'Oscuro o neutro para resaltar el detalle',
    prompt: `Extreme macro close-up of the [PRODUCTO], shot on Sony a7R with 90mm macro lens f/2.8, ultra sharp detail focusing on [PARTE ESPECÍFICA DEL PRODUCTO], dramatic lighting from one side, premium materials visible (metal, glass, silicone texture), dark gradient background (charcoal to black), subtle rim light on product edges, 1:1 square ratio, professional product photography, 8K quality, editorial style`,
  },
  {
    n: 6, nombre: 'Instrucciones de uso (3 pasos)', uso: 'Bloque 5, explicando cómo se usa',
    ratio: '1:1 cuadrado', fondo: 'Blanco con 3 pasos numerados',
    prompt: `Instructional infographic, easy to understand, 3 numbered steps arranged horizontally left to right, each step shows [PRODUCTO] being used at that stage, clean white background, minimal design, big numbers (1, 2, 3) in brand color [#F5C518 amarillo LUMENS], brief Spanish labels under each step, arrow indicators between steps, 1:1 square ratio, professional icon-style illustration mixed with photorealistic product render, 1080x1080 resolution`,
  },
];

export const FAQS_OBLIGATORIAS: { p: string; r: string }[] = [
  { p: '¿Para qué sirve? / ¿Es para mi caso?', r: '[Respuesta específica al producto]' },
  { p: '¿Cuánto dura la batería? / ¿Cuánto rinde?', r: '[Duración específica]' },
  { p: '¿Es fácil de usar?', r: '[Confirmar simplicidad + mencionar manual]' },
  {
    p: '¿Cómo funciona el pago contra entrega?',
    r: 'Es 100% seguro. Haces tu pedido rellenando tus datos en el formulario y no tienes que pagar nada por adelantado. Le entregas el dinero en efectivo directamente al mensajero cuando llegue a tu casa.',
  },
  {
    p: '¿Cuánto demora el envío?',
    r: 'Los envíos a ciudades principales como Bogotá, Medellín y Cali tardan normalmente de 2 a 4 días hábiles. Para el resto del país puede demorar de 3 a 6 días hábiles.',
  },
  {
    p: '¿Qué pasa si llega dañado?',
    r: 'Si el producto llega a presentar daños en el transporte o algún defecto, te comunicas de inmediato con nuestra línea de atención y te enviaremos una unidad completamente nueva sin costo adicional.',
  },
];

export const COLORES = [
  { nombre: 'Amarillo LUMENS', hex: '#F5C518', uso: 'CTAs, precio destacado, badges' },
  { nombre: 'Negro LUMENS', hex: '#1A1A1A', uso: 'Fondos, texto principal' },
  { nombre: 'Beige LUMENS', hex: '#FFF8F5', uso: 'Backgrounds cálidos' },
  { nombre: 'Verde LUMENS', hex: '#22A55B', uso: 'Confianza, garantía, "AHORRAS"' },
  { nombre: 'Rojo alerta', hex: '#EF4444', uso: 'Urgencia, ✕ en comparativas' },
];

export const ERRORES = [
  { t: 'Empezar con logo grande arriba', d: 'El logo grande arriba mata la conversión. Va abajo o en el header pequeño. Lo primero que se ve debe ser el PRODUCTO.' },
  { t: 'Imágenes de stock genéricas', d: 'Fotos de mujeres blancas rubias en fondos blancos son penalizadas por TikTok/Meta y desconfiadas por el cliente colombiano. Usa "Colombian woman", "Latin American features" en los prompts.' },
  { t: 'Copy en inglés o traducido literal', d: '"Discover the best solution" → mal. "Encuentra la solución que buscabas" → bien. Escribe como habla el cliente, no como traduce Google.' },
  { t: 'Muchos productos en la misma landing', d: 'Una landing = un producto. Si vendes 3 productos, son 3 landings distintas.' },
  { t: 'Botones con textos genéricos', d: '"Comprar" → mal. "QUIERO MI [PRODUCTO] · PAGO AL RECIBIR" → bien.' },
  { t: 'FAQs mal escritas o inventadas', d: 'Usa las 6 obligatorias. No inventes FAQ que no tengan que ver con dudas reales del cliente.' },
  { t: 'Sin urgencia real', d: 'Sin urgencia, el cliente se va y no vuelve. Pero no exageres: si ve "solo 2 unidades" tres días seguidos, pierde confianza.' },
  { t: 'Testimonios con nombres extranjeros', d: '"John Smith de New York" → mal. "Camila R. de Bogotá" → bien. Nombres colombianos + inicial de apellido + ciudad colombiana.' },
];

export const CHECKLIST: { grupo: string; items: string[] }[] = [
  {
    grupo: 'Estructura',
    items: [
      'Los 9 bloques están en el orden correcto',
      'Hay mínimo 3 CTAs distribuidos en la página',
      'El primer CTA aparece antes del scroll',
      'Los testimonios son de ciudades colombianas reales',
      'Las FAQs incluyen las 6 obligatorias',
    ],
  },
  {
    grupo: 'Imágenes',
    items: [
      'Las 6 imágenes están generadas y optimizadas en WebP',
      'Todas pesan menos de 200 KB (TinyPNG o Squoosh)',
      'Tienen alt text descriptivo en español',
      'Están cargadas con nombres claros (no "IMG_1234.webp")',
    ],
  },
  {
    grupo: 'Copy',
    items: [
      'El precio tachado y el precio actual están visibles',
      'La palabra "AHORRAS" aparece en color verde',
      'Los tiempos del cronograma son coherentes con hoy',
      'La urgencia está presente pero no exagerada',
      'Ningún emoji está roto o mal renderizado',
    ],
  },
  {
    grupo: 'Técnico',
    items: [
      'La página carga en menos de 3 segundos en móvil',
      'Los botones CTA abren el formulario de Releasit',
      'El pixel de Meta y TikTok disparan PageView',
      'Se ve bien en iPhone y en Android',
      'El botón flotante de WhatsApp está activo',
    ],
  },
  {
    grupo: 'Legal y confianza',
    items: [
      '"Envío gratis" mínimo 3 veces en la página',
      '"Pago Contra Entrega" mínimo 3 veces',
      '"Garantía" con número de días específico',
      'Los testimonios NO son de famosos ni fotos de stock',
      'Ninguna promesa tipo "cura", "milagro", "en 24 horas"',
    ],
  },
];

// ---------------------------------------------------------------------------
// Auditoría de las landings vivas
//
// Medido leyendo el HTML de lumenscol.com, no de memoria: se contaron las
// menciones de cada señal y se leyeron los textos reales de los botones. Sirve
// de ejemplo doble — una landing que cumple casi todo y otra que se salta tres
// cosas concretas — que es más útil que una sola "perfecta".
// ---------------------------------------------------------------------------

export interface AuditoriaLanding {
  producto: string;
  url: string;
  precioAntes: string;
  precioAhora: string;
  ahorro: string;
  cta: string;
  senales: { etiqueta: string; veces: number | null; ok: boolean }[];
  falla: string[];
  veredicto: string;
}

export const AUDITORIAS: AuditoriaLanding[] = [
  {
    producto: 'AquaPro™ · Irrigador Dental',
    url: 'https://lumenscol.com/products/irrigador-oral',
    precioAntes: '$149.900',
    precioAhora: '$89.900',
    ahorro: '$60.000',
    cta: '🛒 QUIERO MI AQUAPRO™ · PAGO AL RECIBIR',
    senales: [
      { etiqueta: 'Pago contra entrega', veces: 14, ok: true },
      { etiqueta: 'Envío gratis', veces: 8, ok: true },
      { etiqueta: 'Garantía', veces: 6, ok: true },
      { etiqueta: 'Cronograma de entrega', veces: 2, ok: true },
      { etiqueta: 'Urgencia / stock', veces: 2, ok: true },
      { etiqueta: 'Reseñas con "Verificado"', veces: 2, ok: true },
      { etiqueta: 'FAQ', veces: null, ok: true },
      { etiqueta: 'CTA en formato correcto', veces: 3, ok: true },
    ],
    falla: [],
    veredicto:
      'Esta es la de referencia. Cumple la estructura entera: el CTA usa el formato exacto ("QUIERO MI [PRODUCTO] · PAGO AL RECIBIR"), repite las tres condiciones que quitan miedo muy por encima del mínimo de 3 veces, y tiene urgencia y reseñas verificadas. Cópiala.',
  },
  {
    producto: 'Alivio Pro™ · Cinturón Anticólicos',
    url: 'https://lumenscol.com/products/alivio-pro-lumens',
    precioAntes: '$109.900',
    precioAhora: '$69.900',
    ahorro: '$40.000',
    cta: 'ORDENA CONTRA ENTREGA · Pagas al recibir · Envío gratis',
    senales: [
      { etiqueta: 'Pago contra entrega', veces: 9, ok: true },
      { etiqueta: 'Envío gratis', veces: 7, ok: true },
      { etiqueta: 'Garantía', veces: 6, ok: true },
      { etiqueta: 'Cronograma de entrega', veces: 2, ok: true },
      { etiqueta: 'Urgencia / stock', veces: 0, ok: false },
      { etiqueta: 'Reseñas con "Verificado"', veces: 0, ok: false },
      { etiqueta: 'FAQ', veces: null, ok: true },
      { etiqueta: 'CTA en formato correcto', veces: 0, ok: false },
    ],
    falla: [
      'No hay urgencia en ninguna parte. Es el bloque que más cuesta cuando falta: sin una razón para decidir hoy, el cliente cierra la página con toda la intención de volver, y no vuelve.',
      'Las reseñas no llevan el sello "✓ Verificado". El testimonio sin sello se lee como opinión; con sello, como dato.',
      'El botón dice "ORDENA CONTRA ENTREGA" en vez de "QUIERO MI ALIVIO PRO™ · PAGO AL RECIBIR". El formato del manual va en primera persona a propósito: el cliente se lo dice a sí mismo, no recibe una orden.',
    ],
    veredicto:
      'Convierte, pero se está dejando puntos en la mesa. Son tres arreglos de media hora y ninguno toca el diseño.',
  },
];
