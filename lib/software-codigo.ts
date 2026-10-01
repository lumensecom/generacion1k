import productoCinturon from '@/lib/landings-referencia/producto-cinturon.liquid';

/**
 * El generador de código de landings.
 *
 * Aquí no se guarda el código de Juan como adorno: se le extrajo el sistema que
 * lo sostiene — tokens, anatomía del botón, patrones de sección, reglas de
 * convivencia con el tema de Shopify — y ese sistema es lo que se le pasa a la
 * IA. Por eso lo que genera se parece a sus landings y no a una plantilla
 * genérica de internet.
 *
 * Las landings de referencia viven como archivos .liquid en
 * lib/landings-referencia/. Para agregar una nueva: suelta el archivo y
 * añádela al array de abajo.
 */

export interface LandingReferencia {
  id: string;
  nombre: string;
  /** Qué parte de la tienda es. */
  ubicacion: string;
  producto: string;
  /** Por qué esta convierte. Lo que hay que mirar al leerla. */
  porQueFunciona: string[];
  lenguaje: 'liquid' | 'html';
  codigo: string;
}

export const LANDINGS_REFERENCIA: LandingReferencia[] = [
  {
    id: 'producto-cinturon',
    nombre: 'Sección de producto · Cinturón Anticólicos',
    ubicacion: 'Página de producto (arriba del todo)',
    producto: 'Cinturón masajeador anticólicos — contra entrega, Colombia',
    porQueFunciona: [
      'El botón no es un rectángulo plano: tiene profundidad con una sombra sólida sin desenfoque y se hunde al tocarlo. En móvil eso se siente como un botón de verdad y se toca más.',
      'Debajo del precio va el ahorro en pesos, no el porcentaje. "Ahorras $40.000" pesa más que "36% off" en una cabeza colombiana.',
      'La barra flotante aparece sólo cuando el formulario sale de la pantalla, no desde el principio. Si está siempre, deja de verse.',
      'Los tres sellos de confianza van justo debajo del botón, que es donde aparece la duda de "¿y si no llega?".',
      'El carrusel es propio, con swipe táctil y puntos. Ninguna librería externa que cargue de más.',
    ],
    lenguaje: 'liquid',
    codigo: productoCinturon,
  },
];

// ---------------------------------------------------------------------------
// El sistema de diseño, sacado del código de arriba
// ---------------------------------------------------------------------------

export interface GrupoTokens {
  titulo: string;
  nota: string;
  tokens: { nombre: string; valor: string; uso: string }[];
}

export const PALETA: GrupoTokens[] = [
  {
    titulo: 'Morados — la marca',
    nota: 'El morado manda. El oscuro nunca es decorativo: es la sombra sólida que le da volumen al botón.',
    tokens: [
      { nombre: '--lmn-purple', valor: '#7C3AED', uso: 'Botones, acentos, íconos' },
      { nombre: '--lmn-purple-dark', valor: '#5B21B6', uso: 'La sombra sólida del botón 3D' },
      { nombre: '--lmn-purple-light', valor: '#F4F0FF', uso: 'Fondos de chip y de aviso' },
      { nombre: '(cuerpo) morado hondo', valor: '#381A60', uso: 'Secciones oscuras y tabla comparativa' },
      { nombre: '(cuerpo) borde inferior', valor: '#200E3A', uso: 'El borde que hunde el botón' },
    ],
  },
  {
    titulo: 'Amarillos — el dinero',
    nota: 'El amarillo sólo aparece donde hay plata de por medio: el ahorro, el regalo, el badge de la columna ganadora.',
    tokens: [
      { nombre: 'Amarillo oferta', valor: '#FFF3A6', uso: 'Fondo del "Ahorras $X", con texto #111' },
      { nombre: 'Amarillo botón', valor: '#FFE454 → #FFB800', uso: 'Degradado del botón secundario' },
      { nombre: 'Amarillo sobre oscuro', valor: '#FFEA5E', uso: 'Palabra destacada en fondo negro' },
    ],
  },
  {
    titulo: 'Semáforo — urgencia y prueba',
    nota: 'Rojo para lo que se acaba, verde para lo que ya pasó. Nunca al revés.',
    tokens: [
      { nombre: 'Rojo escasez', valor: '#DC2626 sobre #FEF2F2', uso: 'Stock bajo, con punto pulsante' },
      { nombre: 'Verde en vivo', valor: '#22C55E', uso: 'Punto de "gente comprando ahora"' },
      { nombre: 'Fondo cálido', valor: '#FFF9F4 / #FAF6F0', uso: 'Secciones de prueba social' },
    ],
  },
  {
    titulo: 'Texto y fondo',
    nota: 'Nunca negro puro sobre blanco puro. El gris azulado cansa menos y se ve más caro.',
    tokens: [
      { nombre: '--lmn-text-dark', valor: '#0F172A', uso: 'Títulos' },
      { nombre: '--lmn-text-gray', valor: '#475569', uso: 'Párrafos' },
      { nombre: '--lmn-bg-soft', valor: '#F8F9FA', uso: 'Fondo del bloque, para que las tarjetas blancas resalten' },
    ],
  },
];

export const TIPOGRAFIAS = [
  {
    familia: 'Fredoka',
    pesos: '600, 700',
    uso: 'Títulos y texto de botones. Redonda y amable: baja la barrera de un producto de salud.',
  },
  {
    familia: 'Plus Jakarta Sans',
    pesos: '400 a 800',
    uso: 'Todo el cuerpo. Legible en móvil, que es donde se compra.',
  },
  {
    familia: 'Satoshi',
    pesos: '700, 900',
    uso: 'Sólo el precio. Un peso 900 hace que el número se lea antes que cualquier otra cosa.',
  },
  {
    familia: 'Inter',
    pesos: '400 a 900',
    uso: 'El cuerpo largo de la página, debajo de la sección de producto.',
  },
];

export interface PatronCodigo {
  id: string;
  nombre: string;
  queHace: string;
  /** El fragmento mínimo que lo define. */
  fragmento: string;
  lenguaje: 'css' | 'html' | 'js';
}

export const PATRONES: PatronCodigo[] = [
  {
    id: 'boton-3d',
    nombre: 'El botón con profundidad',
    queHace:
      'La sombra va sin desenfoque, así que no es sombra: es el grosor del botón. Al tocarlo baja esos mismos píxeles y la sombra se encoge, que es exactamente lo que hace una tecla real.',
    lenguaje: 'css',
    fragmento: `.boton {
  background-color: var(--lmn-purple);
  border: none;
  border-radius: 16px;
  padding: 5px;                               /* el marco exterior */
  box-shadow: 0 6px 0 var(--lmn-purple-dark); /* sin blur: es grosor */
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.boton:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--lmn-purple-dark);
}
.boton-inner {
  border: 2px solid rgba(255, 255, 255, 0.25); /* doble marco */
  border-radius: 12px;                          /* menor que el de afuera */
  padding: 14px 20px;
}`,
  },
  {
    id: 'pulso',
    nombre: 'El punto que respira',
    queHace:
      'Un anillo que crece y se desvanece. Rojo avisa que se acaba, verde que hay gente comprando. Cuesta nada y el ojo lo persigue.',
    lenguaje: 'css',
    fragmento: `@keyframes pulse-red {
  0%   { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}
.punto {
  width: 8px; height: 8px;
  background: #DC2626;
  border-radius: 50%;
  animation: pulse-red 1.5s infinite;
}`,
  },
  {
    id: 'sticky',
    nombre: 'La barra que aparece a tiempo',
    queHace:
      'Observa el formulario de compra. Mientras se vea, la barra no existe; apenas sale por arriba, entra. Una barra siempre visible se vuelve parte del fondo.',
    lenguaje: 'js',
    fragmento: `const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Sólo cuando el form salió POR ARRIBA, no al cargar la página.
    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
      stickyBar.classList.add("is-visible");
    } else {
      stickyBar.classList.remove("is-visible");
    }
  });
}, { threshold: 0 });

observer.observe(checkoutArea);`,
  },
  {
    id: 'comparativa',
    nombre: 'La tabla donde tú ganas',
    queHace:
      'Tu columna sale del plano con un scale ligero, borde grueso y sombra fuerte; la del competidor queda plana y con opacidad baja. No hace falta decir cuál es mejor.',
    lenguaje: 'css',
    fragmento: `.pt-lumens {
  background: #FFFFFF;
  border: 3px solid #381A60;
  border-radius: 18px;
  box-shadow: 0 25px 50px rgba(56, 26, 96, 0.25);
  transform: scale(1.08);   /* sale del plano */
  z-index: 2;
}
.pt-others {
  background: #F8F9FA;
  border: 1px solid #E9ECEF;
  opacity: 0.95;            /* se queda atrás */
  z-index: 1;
}`,
  },
  {
    id: 'faq',
    nombre: 'FAQ sin una línea de JavaScript',
    queHace:
      'Usa <details> y <summary> del navegador. Abre, cierra, es accesible y no pesa. El + se vuelve − con un ::after.',
    lenguaje: 'css',
    fragmento: `.faq-question::-webkit-details-marker { display: none; }
.faq-question::after {
  content: "+";
  font-size: 22px;
  transition: transform 0.3s ease;
}
.faq-item[open] .faq-question::after { content: "−"; }
.faq-item[open] {
  border-color: #381A60;
  box-shadow: 0 10px 25px rgba(56, 26, 96, 0.12);
}`,
  },
  {
    id: 'testimonio-ig',
    nombre: 'Testimonios con cara de Instagram',
    queHace:
      'Header con nombre, palomita azul y ciudad; foto cuadrada; barra de corazón, comentario y avión; conteo de likes; y el texto con el @handle en negrita. El cerebro ya sabe leer ese formato y le baja la guardia.',
    lenguaje: 'html',
    fragmento: `<div class="ig-card">
  <div class="ig-card-header">
    <div class="ig-user-details">
      <div class="ig-name-row">
        <span class="ig-user-name">Andrea Restrepo</span>
        <span class="ig-badge-verified">✓</span>
      </div>
      <span class="ig-location">Medellín, Colombia</span>
    </div>
    <span class="ig-more-options">•••</span>
  </div>
  <div class="ig-card-media"><img loading="lazy" src="..." alt="..."></div>
  <div class="ig-action-bar">…❤️ 💬 ✈️… 🔖</div>
  <div class="ig-likes-count">Les gusta a 1.482 personas</div>
  <div class="ig-card-body">
    <div class="ig-stars-tag">★★★★★</div>
    <span class="ig-handle-bold">@andrea.restrepo_med</span>
    ¡Uff, manas! …
  </div>
  <div class="ig-time-ago">Hace 2 horas</div>
</div>`,
  },
];

export const REGLAS_CODIGO = [
  {
    titulo: 'Todo prefijado',
    detalle:
      'Cada clase lleva un prefijo propio (.lmn-, .cb-, .rsi-). Sin eso el tema de Shopify te pisa los estilos o tú le pisas los suyos, y acabas peleando con !important.',
  },
  {
    titulo: 'Una sola sección, auto-contenida',
    detalle:
      'HTML, <style> y <script> en el mismo archivo. Se pega en Shopify y funciona. Nada de librerías externas que carguen de más en una conexión móvil colombiana.',
  },
  {
    titulo: 'Reset local, no global',
    detalle:
      'El box-sizing se aplica al contenedor y sus hijos (.mi-contenedor, .mi-contenedor *), nunca con un * suelto que le rompa el tema a la tienda.',
  },
  {
    titulo: 'Móvil primero, de verdad',
    detalle:
      'El breakpoint va en 768 o 900px y el diseño de una columna es el que manda. Más del 90% del tráfico de contra entrega entra por celular.',
  },
  {
    titulo: 'Fuentes con preconnect',
    detalle:
      'Los <link rel="preconnect"> antes del CSS de fuentes. Ahorran el tiempo del handshake, que en 3G se nota.',
  },
  {
    titulo: 'Las imágenes por Liquid',
    detalle:
      'Siempre {{ media | image_url: width: 1000 }} y loading="lazy" en todas menos la primera. Shopify sirve el tamaño correcto y no revientas el LCP.',
  },
];

// ---------------------------------------------------------------------------
// El prompt del generador
// ---------------------------------------------------------------------------

/**
 * El sistema del generador de código. Lleva adentro la paleta, las fuentes y
 * la anatomía de los patrones, de modo que lo que salga se pueda pegar en
 * Shopify y se vea como una landing de LUMENS, no como un wireframe.
 */
export const SISTEMA_CODIGO = `Eres un generador de secciones de Shopify para landings de pago contra entrega
(PCE) en Colombia, dentro del programa Generacion 1K Elite. Devuelves CODIGO,
no explicaciones.

FORMATO DE SALIDA
- Un solo bloque de codigo. Empieza con los <link> de fuentes, sigue el HTML,
  despues un <style> y al final un <script> si de verdad hace falta.
- Todo auto-contenido: nada de librerias externas, ni Bootstrap, ni jQuery, ni
  Tailwind, ni iconos por CDN. Los iconos van como SVG inline.
- Prefija TODAS las clases con un prefijo corto derivado del producto, para no
  chocar con el tema de la tienda. Nunca uses !important.
- El reset de box-sizing se aplica solo al contenedor y sus hijos
  (.prefijo-contenedor, .prefijo-contenedor *), jamas con un selector * global.
- Mobile-first. Breakpoint en 768px o 900px. Una columna manda.
- Si el usuario pide una seccion de PRODUCTO, usa Liquid de Shopify:
  {{ product.price | money }}, {{ product.compare_at_price | money }},
  {% form 'product', product %} con el input hidden del variant id,
  {% for media in product.media %} con {{ media | image_url: width: 1000 }}.
  Si pide una seccion de CUERPO de pagina, HTML puro basta.
- loading="lazy" en todas las imagenes menos la primera.

PALETA POR DEFECTO (cambiala si el usuario da colores de su marca)
  --purple: #7C3AED        morado principal, botones y acentos
  --purple-dark: #5B21B6   la sombra solida del boton, nunca decorativo
  --purple-light: #F4F0FF  fondos de chip y avisos
  --deep: #381A60          secciones oscuras y tabla comparativa
  --deep-edge: #200E3A     borde inferior del boton oscuro
  amarillo oferta #FFF3A6 con texto #111111
  amarillo boton #FFE454 a #FFB800, borde #CC9300
  amarillo sobre oscuro #FFEA5E
  rojo escasez #DC2626 sobre #FEF2F2
  verde en vivo #22C55E
  texto #0F172A, parrafos #475569, fondo suave #F8F9FA
  El amarillo SOLO aparece donde hay plata de por medio: el ahorro, el regalo,
  la columna ganadora. El rojo solo para lo que se acaba.
  Nunca negro puro sobre blanco puro.

TIPOGRAFIAS
  Fredoka 600/700 para titulos y texto de botones.
  Plus Jakarta Sans 400-800 para el cuerpo.
  Satoshi 700/900 SOLO para el precio.
  Inter 400-900 para cuerpos largos de pagina.
  Siempre con <link rel="preconnect"> antes del CSS de fuentes.

EL BOTON (es la firma, no lo cambies)
  box-shadow: 0 6px 0 <color-oscuro>   sin blur: es grosor, no sombra
  :active { transform: translateY(4px); box-shadow: 0 2px 0 <color-oscuro>; }
  Doble marco: el boton con padding 5px y radius 16px, y adentro un div con
  border 2px solid rgba(255,255,255,0.25) y radius 12px.
  Texto en Fredoka mayusculas, con un subtexto chico en Jakarta debajo
  ("Pago Contra Entrega", "Pagas al recibir").

PATRONES QUE YA ESTAN PROBADOS
  - Punto pulsante con @keyframes para escasez (rojo) y actividad (verde).
  - Barra flotante que aparece con IntersectionObserver SOLO cuando el
    formulario sale por arriba (entry.boundingClientRect.top < 0), nunca al
    cargar la pagina.
  - Testimonios con formato de post de Instagram: nombre + palomita + ciudad,
    foto cuadrada, barra de acciones, conteo de likes, @handle en negrita.
  - Tabla comparativa donde tu columna lleva transform: scale(1.08), borde de
    3px y sombra fuerte, y la del competidor queda plana con opacidad 0.95.
  - FAQ con <details>/<summary> nativos y el + que se vuelve - con ::after.
  - Carrusel propio: track con transform translateX, puntos, y swipe tactil con
    touchstart/touchend. Sin librerias.
  - Radios de 16 a 28px en todo. Sombras tintadas del morado
    (rgba(56,26,96,0.08) a rgba(56,26,96,0.25)), nunca grises.

COPY
  Espanol colombiano, directo. El ahorro en pesos y no en porcentaje
  ("Ahorras $40.000", no "36% off"). Beneficios, no caracteristicas.
  Nada de urgencia inventada ni contadores que se reinician al recargar.
  Si te falta el precio, el producto o a quien le vende, pidelo en una linea
  antes de generar; no lo inventes.

Responde solo con el codigo final y una nota corta de instalacion
(Personalizar > Agregar seccion). Sin razonamiento paso a paso.`;
