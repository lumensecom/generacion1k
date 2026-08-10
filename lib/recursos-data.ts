// Contenido de la zona pública de recursos (/recursos).
//
// Vive aparte de portal-data.ts a propósito: esto es material abierto, no
// requiere sesión y no toca Supabase.

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
      'Las 16 secciones de una página de producto, en orden, con el código Liquid de cada una listo para pegar en Shopify.',
    etiqueta: 'Interactivo',
    disponible: true,
  },
  {
    slug: 'landing-con-ia',
    numero: 2,
    titulo: 'Cómo armar la landing con IA',
    descripcion:
      'El paso a paso y los prompts exactos: uno para que Gemini escriba tus bloques Liquid y otros para generar las imágenes.',
    etiqueta: 'Prompts',
    disponible: true,
  },
  {
    slug: 'producto-ganador',
    numero: 3,
    titulo: 'Cómo validar un producto ganador',
    descripcion:
      'Los criterios que uso antes de invertir un peso en pauta: margen, dolor, diferencial y prueba de demanda.',
    etiqueta: 'Guía',
    disponible: false,
  },
  {
    slug: 'estructura-campanas',
    numero: 4,
    titulo: 'Estructura de campañas en TikTok Ads',
    descripcion:
      'Cómo armo, leo y escalo una campaña de contra entrega sin quemar presupuesto en los primeros días.',
    etiqueta: 'Guía',
    disponible: false,
  },
];

// ---------------------------------------------------------------------------
// Anatomía de una landing
//
// Orden real de la plantilla: arriba lo que necesita quien ya viene decidido
// (tráfico HOT), abajo lo que necesita quien acaba de llegar del anuncio y
// todavía no confía (FRÍO). Por eso el botón de compra aparece antes que las
// reseñas: quien ya está listo no debería tener que bajar hasta el final.
// ---------------------------------------------------------------------------

export type Bloque = {
  id: string;
  nombre: string;
  tipo: 'anuncio' | 'media' | 'texto' | 'social' | 'cta' | 'lista' | 'datos' | 'urgencia';
  temperatura: 'hot' | 'tibio' | 'frio';
  bloque: 1 | 2;
  resumen: string;
  porQue: string;
  claves: string[];
  liquid: string;
};

export const BLOQUES: Bloque[] = [
  {
    id: 'anuncios',
    nombre: 'Barra de anuncios',
    tipo: 'anuncio',
    temperatura: 'hot',
    bloque: 1,
    resumen: 'La franja de arriba del todo, con la condición que más desarma la objeción.',
    porQue:
      'Es lo primero que entra en campo visual, antes incluso de la foto. En contra entrega, "pagas al recibir" ahí arriba quita de un golpe la objeción más grande: el miedo a pagar por adelantado.',
    claves: [
      'Una sola idea, no tres beneficios apretados',
      'El punto que parpadea da sensación de "en vivo" sin mentir',
      'Si vendes contra entrega, esa es la frase que va',
    ],
    liquid: `<div class="pdp-announce">
  <span class="pdp-announce-dot"></span>
  [ENVÍO GRATIS HOY · PAGAS AL RECIBIR]
</div>`,
  },
  {
    id: 'hero',
    nombre: 'Hero: galería de imágenes',
    tipo: 'media',
    temperatura: 'hot',
    bloque: 1,
    resumen: 'El carrusel de fotos del producto, deslizable, con puntos de posición.',
    porQue:
      'Es la única sección donde vale la pena detenerse a pensar y editar con calma. Debe continuar visualmente el anuncio por el que llegaron: si el anuncio mostró un resultado, la primera foto tiene que ser ese resultado.',
    claves: [
      'La primera imagen carga en eager, las demás en lazy',
      'Máximo 5 fotos: más es indecisión, no variedad',
      'Toma las imágenes del producto de Shopify automáticamente',
    ],
    liquid: `<div class="pdp-gallery">
  <div class="pdp-track" id="pdpTrack">
    {%- if product.images.size > 0 -%}
      {%- for image in product.images limit: 5 -%}
        <div class="pdp-slide">
          <img src="{{ image | image_url: width: 900 }}"
               alt="{{ image.alt | default: product.title | escape }}"
               loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">
        </div>
      {%- endfor -%}
    {%- endif -%}
  </div>
  <div class="pdp-dots" id="pdpDots"></div>
</div>`,
  },
  {
    id: 'oferta',
    nombre: 'Oferta: precio y beneficios',
    tipo: 'datos',
    temperatura: 'hot',
    bloque: 1,
    resumen:
      'Estrellas, título, precio con ahorro, aviso de stock y los tres beneficios de confianza.',
    porQue:
      'Las estrellas aquí importan muchísimo, porque la mayoría de clientes nunca va a llegar hasta abajo a ver las reseñas. Y el ahorro se muestra en pesos, no en porcentaje: "ahorras $80.000" pesa más que "40% off" porque el cerebro no tiene que calcular nada.',
    claves: [
      'Precio visible sin scroll: esconderlo genera desconfianza',
      'El tachado tiene que ser un precio que de verdad tuviste',
      'Los tres beneficios son envío, forma de pago y garantía',
    ],
    liquid: `<div class="pdp-rating">
  <span class="pdp-stars">★★★★★</span>
  <span><b>[4.9]</b> · [+1.800] clientes satisfechos</span>
</div>

<h1 class="pdp-title">{{ product.title }}</h1>

<div class="pdp-price-row">
  <span class="pdp-price">{{ product.price | money }}</span>
  {%- if product.compare_at_price > product.price -%}
    <span class="pdp-price-old">{{ product.compare_at_price | money }}</span>
    <span class="pdp-save">
      AHORRAS {{ product.compare_at_price | minus: product.price | money }}
    </span>
  {%- endif -%}
</div>

<div class="pdp-stock">
  <span class="pdp-pulse"></span>
  [ÚLTIMAS UNIDADES DISPONIBLES]
</div>`,
  },
  {
    id: 'cronograma',
    nombre: 'Cronograma del pedido',
    tipo: 'datos',
    temperatura: 'hot',
    bloque: 1,
    resumen: 'Los tres pasos con fechas reales: hoy pides, tal día se despacha, tal día lo recibes.',
    porQue:
      'Convierte una promesa vaga ("envío rápido") en fechas concretas que el cliente puede imaginar. Las calcula Liquid a partir de la fecha de hoy, así que nunca quedan desactualizadas ni hay que tocarlas.',
    claves: [
      'Las fechas se calculan solas: +1, +2 y +4 días',
      'Los meses van en un array porque Liquid no los tiene en español',
      'Ajusta los rangos a los tiempos reales de tu transportadora',
    ],
    liquid: `{%- assign hoy = "now" | date: "%s" -%}
{%- assign meses = "Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic" | split: "," -%}
{%- assign s_desp = hoy | plus: 86400 -%}
{%- assign m_desp = s_desp | date: "%m" | minus: 1 -%}
{%- assign f_desp = s_desp | date: "%d " | append: meses[m_desp] -%}
{%- assign s_min = hoy | plus: 172800 -%}
{%- assign m_min = s_min | date: "%m" | minus: 1 -%}
{%- assign f_min = s_min | date: "%d " | append: meses[m_min] -%}
{%- assign s_max = hoy | plus: 345600 -%}
{%- assign m_max = s_max | date: "%m" | minus: 1 -%}
{%- assign f_max = s_max | date: "%d " | append: meses[m_max] -%}

<div class="pdp-tl-row">
  <div class="pdp-tl-step">
    <div class="pdp-tl-icon on">🛒</div>
    <span class="pdp-tl-date">Hoy</span>
    <span class="pdp-tl-desc">Tu pedido</span>
  </div>
  <div class="pdp-tl-step">
    <div class="pdp-tl-icon">🚚</div>
    <span class="pdp-tl-date">{{ f_desp }}</span>
    <span class="pdp-tl-desc">Despacho</span>
  </div>
  <div class="pdp-tl-step">
    <div class="pdp-tl-icon">📦</div>
    <span class="pdp-tl-date">{{ f_min }} – {{ f_max }}</span>
    <span class="pdp-tl-desc">Recibes y pagas</span>
  </div>
</div>`,
  },
  {
    id: 'vs',
    nombre: 'Antes y después / vs competencia',
    tipo: 'media',
    temperatura: 'tibio',
    bloque: 2,
    resumen: 'Dos imágenes lado a lado: cómo está hoy y cómo queda con el producto.',
    porQue:
      'Va apenas debajo de la oferta porque es la prueba visual más rápida que existe. El cerebro compara antes de leer: dos fotos lado a lado hacen en un segundo el trabajo de tres párrafos de copy.',
    claves: [
      'El "antes" tiene que parecerse a la situación real del cliente',
      'Misma luz y mismo encuadre en ambas o pierde credibilidad',
      'Sirve igual para "antes/después" que para "ellos/nosotros"',
    ],
    liquid: `<div class="pdp-vs">
  <h2 class="pdp-h">La diferencia se ve <mark>desde el primer uso</mark></h2>
  <div class="pdp-vs-grid">
    <div class="pdp-vs-card bad">
      <img src="[URL_IMAGEN_ANTES]" alt="[Antes]" loading="lazy">
      <div class="pdp-vs-tag">Antes / otros</div>
    </div>
    <div class="pdp-vs-card good">
      <img src="[URL_IMAGEN_DESPUES]" alt="[Después]" loading="lazy">
      <div class="pdp-vs-tag">Después / con esto</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'cta',
    nombre: 'Botón de compra',
    tipo: 'cta',
    temperatura: 'hot',
    bloque: 2,
    resumen: 'El botón naranja con brillo que barre, repetido tres veces en la página.',
    porQue:
      'El color de acento está reservado solo para esto. Si el mismo naranja aparece en decoración, el ojo deja de asociarlo con "aquí se hace clic" y el botón pierde fuerza. El texto va en primera persona porque el cliente se lo dice a sí mismo.',
    claves: [
      'Un solo color de acento en toda la página, solo para botones',
      'Dispara el formulario de contra entrega, no un carrito normal',
      'La nota de abajo repite que se paga al recibir',
    ],
    liquid: `<div class="pdp-cta-wrap">
  <button type="button" class="pdp-cta pdp-buy">[LO QUIERO · PAGO AL RECIBIR]</button>
  <p class="pdp-cta-note">Pagas cuando lo recibes · Envío gratis</p>
</div>

<script>
/* Los CTA disparan el formulario de contra entrega.
   Cambia el selector si no usas ReleasIt. */
document.querySelectorAll('.pdp-buy').forEach(function(btn){
  btn.addEventListener('click', function(e){
    e.preventDefault();
    var t = document.getElementById('rsi_buy_now_button');
    if (t) {
      ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ev){
        t.dispatchEvent(new MouseEvent(ev, { view: window, bubbles: true, cancelable: true, buttons: 1 }));
      });
    }
  });
});
</script>`,
  },
  {
    id: 'dolor',
    nombre: 'El problema',
    tipo: 'lista',
    temperatura: 'tibio',
    bloque: 2,
    resumen: 'Bloque oscuro con cuatro molestias concretas del día a día.',
    porQue:
      'Va sobre fondo oscuro a propósito: el cambio de color marca un cambio de tono y el lector baja la guardia. Aquí no se habla del producto, se habla de lo que le duele — si no se reconoce en al menos uno, no va a comprar.',
    claves: [
      'Cuatro dolores, no ocho: más se vuelve queja',
      'Concretos y cotidianos, no abstractos',
      'Ninguno menciona el producto todavía',
    ],
    liquid: `<div class="pdp-dark">
  <h2 class="pdp-h">¿Vas a seguir <mark>[con el mismo problema]</mark>?</h2>
  <div class="pdp-pain">
    <span class="pdp-pain-e">😩</span>
    <p class="pdp-pain-t">[Dolor 1: la molestia concreta del día a día]</p>
  </div>
  <div class="pdp-pain">
    <span class="pdp-pain-e">⏳</span>
    <p class="pdp-pain-t">[Dolor 2: el tiempo que pierde]</p>
  </div>
  <div class="pdp-pain">
    <span class="pdp-pain-e">💸</span>
    <p class="pdp-pain-t">[Dolor 3: lo que le cuesta seguir así]</p>
  </div>
  <div class="pdp-pain">
    <span class="pdp-pain-e">😖</span>
    <p class="pdp-pain-t">[Dolor 4: la consecuencia que más le pesa]</p>
  </div>
</div>`,
  },
  {
    id: 'video',
    nombre: 'Video del producto',
    tipo: 'media',
    temperatura: 'tibio',
    bloque: 2,
    resumen: 'Video en bucle, sin sonido, mostrando el producto funcionando.',
    porQue:
      'Después del bloque de dolor, el video es la respuesta. Va en autoplay silenciado y en bucle porque nadie le da play a un video en una página de producto: si no arranca solo, no se ve.',
    claves: [
      'Se tiene que entender sin sonido y sin explicación',
      'Corto y en bucle: entre 5 y 15 segundos',
      'El poster evita el recuadro negro mientras carga',
    ],
    liquid: `<video class="pdp-img" style="width:100%;margin:0;"
       autoplay loop muted playsinline
       preload="metadata" poster="[URL_POSTER]">
  <source src="[URL_VIDEO]" type="video/mp4">
</video>`,
  },
  {
    id: 'caracteristicas',
    nombre: 'Características',
    tipo: 'lista',
    temperatura: 'tibio',
    bloque: 2,
    resumen: 'Rejilla de cuatro tarjetas: qué hace y qué gana el cliente con eso.',
    porQue:
      'Las listas hacen que las personas consuman más fácil los "por qué sí" de tu producto. Cada tarjeta lleva la característica arriba y el beneficio abajo, porque la característica sola no vende: "125 cm" no dice nada, "sin agacharte" sí.',
    claves: [
      'Cuatro tarjetas: llenan la pantalla sin exigir scroll largo',
      'Característica arriba, lo que gana el cliente abajo',
      'Si un dato no se puede sostener, mejor no ponerlo',
    ],
    liquid: `<div class="pdp-feats">
  <div class="pdp-feat">
    <span class="pdp-feat-e">⚙️</span>
    <div class="pdp-feat-t">[Característica 1]</div>
    <div class="pdp-feat-s">[Qué gana con eso]</div>
  </div>
  <div class="pdp-feat">
    <span class="pdp-feat-e">📐</span>
    <div class="pdp-feat-t">[Característica 2]</div>
    <div class="pdp-feat-s">[Qué gana con eso]</div>
  </div>
  <div class="pdp-feat">
    <span class="pdp-feat-e">🔋</span>
    <div class="pdp-feat-t">[Característica 3]</div>
    <div class="pdp-feat-s">[Qué gana con eso]</div>
  </div>
  <div class="pdp-feat">
    <span class="pdp-feat-e">🛡️</span>
    <div class="pdp-feat-t">[Característica 4]</div>
    <div class="pdp-feat-s">[Qué gana con eso]</div>
  </div>
</div>`,
  },
  {
    id: 'tabla',
    nombre: 'Tabla comparativa',
    tipo: 'datos',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Tu producto contra la alternativa, criterio por criterio.',
    porQue:
      'Es el bloque que convierte una opinión en un dato. La columna tuya va resaltada en amarillo suave y la del rival en gris apagado: el contraste hace la comparación antes de que lea una sola palabra.',
    claves: [
      'Comparar contra la alternativa real, no contra un invento',
      'Cuatro o cinco criterios, los que de verdad decide el cliente',
      'La columna propia siempre resaltada, la otra apagada',
    ],
    liquid: `<table class="pdp-tbl">
  <thead>
    <tr>
      <th>Criterio</th>
      <th class="hi">Con esto</th>
      <th>Lo de siempre</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>[Criterio 1]</td><td class="hi">✅ [Bien]</td><td class="lo">❌ [Mal]</td></tr>
    <tr><td>[Criterio 2]</td><td class="hi">⚡ [Bien]</td><td class="lo">⏳ [Mal]</td></tr>
    <tr><td>[Criterio 3]</td><td class="hi">✅ [Bien]</td><td class="lo">❌ [Mal]</td></tr>
    <tr><td>[Criterio 4]</td><td class="hi">🛡️ [Bien]</td><td class="lo">⚠️ [Mal]</td></tr>
  </tbody>
</table>`,
  },
  {
    id: 'pasos',
    nombre: 'Cómo se usa',
    tipo: 'lista',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Tres pasos numerados que muestran lo fácil que es.',
    porQue:
      'Ataca una objeción que casi nadie escribe pero mucha gente piensa: "seguro es complicado". Tres pasos, ni uno más — cuatro ya se lee como instructivo y activa justo el miedo que quieres desactivar.',
    claves: [
      'Exactamente tres pasos, aunque el proceso tenga cinco',
      'Cada paso empieza con un verbo en negrita',
      'Si puedes, acompáñalo de una imagen del proceso',
    ],
    liquid: `<div class="pdp-steps">
  <h2 class="pdp-h">Resultados en <mark>3 pasos</mark></h2>
  <div class="pdp-step">
    <div class="pdp-step-n">1</div>
    <p class="pdp-step-t"><b>[Acción 1]:</b> [detalle breve]</p>
  </div>
  <div class="pdp-step">
    <div class="pdp-step-n">2</div>
    <p class="pdp-step-t"><b>[Acción 2]:</b> [detalle breve]</p>
  </div>
  <div class="pdp-step">
    <div class="pdp-step-n">3</div>
    <p class="pdp-step-t"><b>[Acción 3]:</b> [detalle breve]</p>
  </div>
</div>`,
  },
  {
    id: 'resenas',
    nombre: 'Reseñas',
    tipo: 'social',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Tres reseñas con avatar, ciudad, fecha relativa y sello de verificado.',
    porQue:
      'Quien llegó hasta aquí es el más desconfiado de todos. Cada reseña empieza por el problema que la persona tenía y termina en el resultado, en negrita — esa estructura hace que el lector se reconozca antes de llegar a la parte que lo convence.',
    claves: [
      'Mínimo tres, con ciudad y fecha relativa ("hace 4 días")',
      'Cada una debe cubrir un uso o un perfil distinto',
      'Si no tienes reseñas todavía, no las inventes',
    ],
    liquid: `<div class="pdp-rev">
  <div class="pdp-rev-s">★★★★★</div>
  <p class="pdp-rev-t">
    "[Empieza por el problema que tenía y termina en el resultado.
    <b>La frase con el resultado va en negrita.</b>]"
  </p>
  <div class="pdp-rev-m">
    <div class="pdp-rev-av">[XX]</div>
    <div>
      <div class="pdp-rev-n">[Nombre A.]</div>
      <div class="pdp-rev-l">[Ciudad] · Hace [4] días</div>
    </div>
    <span class="pdp-rev-v">✓ Verificado</span>
  </div>
</div>`,
  },
  {
    id: 'incluye',
    nombre: 'Qué incluye',
    tipo: 'lista',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'La lista de todo lo que llega en la caja, con visto verde.',
    porQue:
      'Cada línea con visto es una unidad de valor percibido. Siete líneas hacen que el mismo precio se sienta más justo que si dijeras solo "el producto", aunque sea exactamente lo mismo que llega.',
    claves: [
      'Desglosa: cada accesorio va en su propia línea',
      'Incluye el envío y la garantía como si fueran productos',
      'El borde punteado lo hace leer como "paquete"',
    ],
    liquid: `<div class="pdp-bundle">
  <h2 class="pdp-h" style="font-size:16px;">¿Qué recibes?</h2>
  <ul>
    <li><span>✓</span> 1× [Producto principal]</li>
    <li><span>✓</span> [N]× [Accesorio incluido]</li>
    <li><span>✓</span> 1× [Cable / manual / extra]</li>
    <li><span>✓</span> Envío gratis a tu domicilio</li>
    <li><span>✓</span> Garantía de [90] días</li>
    <li><span>✓</span> Pago contra entrega</li>
  </ul>
</div>`,
  },
  {
    id: 'garantia',
    nombre: 'Garantía',
    tipo: 'texto',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Bloque corto que traslada el riesgo de la compra hacia ti.',
    porQue:
      'Es reversión de riesgo: mientras el cliente sienta que arriesga su plata, no compra. Una garantía concreta y con plazo mueve ese riesgo a tu lado, y por eso funciona mejor que cualquier adjetivo sobre la calidad.',
    claves: [
      'Plazo concreto en días, nunca "garantía de por vida"',
      'Decir qué pasa exactamente si falla',
      'Va cerca del cierre, cuando ya está decidiendo',
    ],
    liquid: `<div class="pdp-gar">
  <div class="pdp-gar-e">🛡️</div>
  <div>
    <h3 class="pdp-gar-t">Garantía de [90] días</h3>
    <p class="pdp-gar-b">
      [Si presenta cualquier falla de fábrica dentro del periodo,
      se cambia sin trámites.]
    </p>
  </div>
</div>`,
  },
  {
    id: 'faq',
    nombre: 'Preguntas frecuentes',
    tipo: 'lista',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Acordeón con las dudas que de verdad frenan la compra.',
    porQue:
      'Una buena landing debe responder todas las preguntas del cliente. Cada duda que no resuelvas aquí es una venta que se cae o un mensaje que toca contestar a mano — esta es la sección que más reduce el WhatsApp.',
    claves: [
      'Saca las preguntas de tus propios chats, no las inventes',
      'Que "cómo funciona el pago contra entrega" nunca falte',
      'Solo uno abierto a la vez, para que no se vuelva un muro',
    ],
    liquid: `<div class="pdp-faq-i">
  <button type="button" class="pdp-faq-q">
    <span>[¿Cómo funciona el pago contra entrega?]</span>
    <span class="pdp-faq-ic">+</span>
  </button>
  <div class="pdp-faq-p">
    <div class="pdp-faq-c">
      Haces el pedido sin pagar nada por adelantado y le pagas
      al mensajero cuando llega a tu casa.
    </div>
  </div>
</div>`,
  },
  {
    id: 'cierre',
    nombre: 'Cierre y urgencia',
    tipo: 'urgencia',
    temperatura: 'frio',
    bloque: 2,
    resumen: 'Bloque oscuro final: prueba social, último botón y sellos de confianza.',
    porQue:
      'Sin una razón real para decidir ahora, el cliente frío cierra la página con toda la intención de volver — y no vuelve. Los tres sellos de abajo son lo último que ve antes de decidir, y por eso repiten las tres objeciones principales.',
    claves: [
      'Que la escasez sea verdadera: los contadores falsos se notan',
      'Repite las tres condiciones que quitan miedo',
      'Es el tercer botón: quien llegó aquí ya leyó todo',
    ],
    liquid: `<div class="pdp-close">
  <p>★★★★★ Más de <b>[1.800] clientes</b> ya lo tienen en casa</p>
  <button type="button" class="pdp-cta pdp-buy">[LO QUIERO · PAGO AL RECIBIR]</button>
  <div class="pdp-trust">
    <div><i></i>Pago contra entrega</div>
    <div><i></i>Envío gratis</div>
    <div><i></i>Garantía [90] días</div>
  </div>
</div>`,
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
