// Plantilla genérica de landing de producto para Shopify (contra entrega).
//
// Es la misma estructura de una landing que ya funciona, pero despersonalizada:
// sin marca, sin nombres de producto y sin la paleta de ninguna tienda. Todo el
// color vive en variables CSS al inicio del bloque 1, así que re-tematizar la
// página entera es cambiar seis líneas.
//
// La paleta por defecto está elegida por función, no por gusto:
//   --pdp-ink      azul casi negro. Lee como autoridad y se apoya en que el
//                  contraste alto reduce la carga cognitiva al leer precios.
//   --pdp-accent   naranja cálido reservado EXCLUSIVAMENTE a los CTA. Si el
//                  acento aparece en decoración, el ojo deja de asociarlo con
//                  "aquí se hace clic" y el botón pierde fuerza.
//   --pdp-ok       verde solo para señales de seguridad (verificado, incluido,
//                  garantía). Nunca para acciones.
//   --pdp-highlight amarillo suave como subrayado de marcador: dirige la vista
//                  a la promesa sin gritar.

export const PALETA_DEFECTO = [
  { nombre: '--pdp-ink', valor: '#0F172A', uso: 'Titulares, precio, texto fuerte' },
  { nombre: '--pdp-body', valor: '#475569', uso: 'Párrafos y texto secundario' },
  { nombre: '--pdp-accent', valor: '#F97316', uso: 'Solo botones de acción' },
  { nombre: '--pdp-soft', valor: '#F8FAFC', uso: 'Fondos de tarjeta' },
  { nombre: '--pdp-line', valor: '#E2E8F0', uso: 'Bordes y separadores' },
  { nombre: '--pdp-ok', valor: '#16A34A', uso: 'Señales de seguridad' },
  { nombre: '--pdp-highlight', valor: '#FEF08A', uso: 'Subrayado de la promesa' },
];

// ---------------------------------------------------------------------------
// BLOQUE 1 — Barra de anuncios, hero con carrusel, oferta y beneficios
// ---------------------------------------------------------------------------

export const LIQUID_BLOQUE_1 = `{%- comment -%}
  BLOQUE 1 de 2 — Cabecera de la landing.
  Pegar en una sección de HTML personalizado, arriba del formulario.

  Para adaptar: cambia solo las variables de :root y los textos marcados
  con [ ]. No toques las clases.
{%- endcomment -%}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">

<style>
  .pdp-top *, .pdp-body * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  .pdp-top, .pdp-body {
    /* ── PALETA: lo único que necesitas cambiar por tienda ── */
    --pdp-ink: #0F172A;
    --pdp-body: #475569;
    --pdp-accent: #F97316;
    --pdp-accent-ink: #FFFFFF;
    --pdp-soft: #F8FAFC;
    --pdp-line: #E2E8F0;
    --pdp-ok: #16A34A;
    --pdp-highlight: #FEF08A;

    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    color: var(--pdp-ink);
    background: #fff;
  }

  /* ── Barra de anuncios ── */
  .pdp-announce {
    background: var(--pdp-ink);
    color: #fff;
    text-align: center;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }
  .pdp-announce-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--pdp-ok);
    animation: pdp-blink 1.6s infinite;
  }
  @keyframes pdp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

  /* ── Hero: carrusel ── */
  .pdp-gallery { position: relative; background: var(--pdp-soft); }
  .pdp-track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .pdp-track::-webkit-scrollbar { display: none; }
  .pdp-slide { flex: 0 0 100%; scroll-snap-align: center; }
  .pdp-slide img { width: 100%; height: auto; display: block; }
  .pdp-dots {
    position: absolute; bottom: 12px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 6px;
  }
  .pdp-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(15,23,42,0.22);
    transition: all 0.25s ease;
  }
  .pdp-dot.on { background: var(--pdp-ink); width: 20px; border-radius: 4px; }

  /* ── Oferta ── */
  .pdp-offer { padding: 18px 16px 4px; }
  .pdp-rating { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-bottom: 7px; }
  .pdp-stars { color: #FBBF24; font-size: 14px; letter-spacing: 1px; }
  .pdp-rating span { color: var(--pdp-body); font-weight: 600; }
  .pdp-title {
    font-size: 22px; font-weight: 900; line-height: 1.18;
    letter-spacing: -0.02em; margin-bottom: 10px;
  }
  .pdp-price-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
  .pdp-price { font-size: 34px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }
  .pdp-price-old { font-size: 15px; color: #94A3B8; text-decoration: line-through; font-weight: 700; }
  .pdp-save {
    background: var(--pdp-highlight); color: var(--pdp-ink);
    font-size: 10.5px; font-weight: 900; padding: 5px 10px;
    border-radius: 50px; letter-spacing: 0.03em; white-space: nowrap;
  }
  .pdp-stock {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11.5px; font-weight: 800; color: var(--pdp-ink);
    background: var(--pdp-soft); border: 1px solid var(--pdp-line);
    padding: 7px 13px; border-radius: 50px; margin-bottom: 16px;
  }
  .pdp-pulse {
    width: 7px; height: 7px; border-radius: 50%; background: var(--pdp-accent);
    box-shadow: 0 0 0 0 rgba(249,115,22,0.6); animation: pdp-pulse 1.6s infinite;
  }
  @keyframes pdp-pulse {
    0% { box-shadow: 0 0 0 0 rgba(249,115,22,0.6); }
    70% { box-shadow: 0 0 0 7px rgba(249,115,22,0); }
    100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
  }

  /* ── Beneficios ── */
  .pdp-benefits {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    padding: 14px 0; border-top: 1px solid var(--pdp-line); text-align: center;
  }
  .pdp-benefit { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .pdp-benefit svg { width: 21px; height: 21px; stroke: var(--pdp-ink); }
  .pdp-benefit span {
    font-size: 9.5px; font-weight: 800; line-height: 1.25;
    text-transform: uppercase; letter-spacing: 0.03em;
  }

  /* ── Cronograma ── */
  .pdp-timeline { margin-top: 4px; padding: 16px 0 4px; border-top: 1px solid var(--pdp-line); position: relative; }
  .pdp-tl-head {
    font-size: 11px; font-weight: 900; text-transform: uppercase;
    letter-spacing: 0.09em; text-align: center; margin-bottom: 14px;
  }
  .pdp-tl-line { position: absolute; top: 62px; left: 14%; width: 72%; height: 2px; background: var(--pdp-line); z-index: 1; }
  .pdp-tl-row { display: flex; justify-content: space-between; position: relative; z-index: 2; }
  .pdp-tl-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .pdp-tl-icon {
    width: 32px; height: 32px; background: #fff; border: 1.5px solid var(--pdp-line);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 13px; margin-bottom: 6px;
  }
  .pdp-tl-icon.on { background: var(--pdp-ink); border-color: var(--pdp-ink); }
  .pdp-tl-date { font-size: 10.5px; font-weight: 900; line-height: 1.2; }
  .pdp-tl-desc { font-size: 9px; color: var(--pdp-body); font-weight: 700; margin-top: 2px; }
</style>

<div class="pdp-top">

  <!-- BARRA DE ANUNCIOS -->
  <div class="pdp-announce">
    <span class="pdp-announce-dot"></span>
    [ENVÍO GRATIS HOY · PAGAS AL RECIBIR]
  </div>

  <!-- HERO: CARRUSEL -->
  <div class="pdp-gallery">
    <div class="pdp-track" id="pdpTrack">
      {%- comment -%} Usa las imágenes del producto; si no hay, cae al placeholder. {%- endcomment -%}
      {%- if product.images.size > 0 -%}
        {%- for image in product.images limit: 5 -%}
          <div class="pdp-slide">
            <img src="{{ image | image_url: width: 900 }}"
                 alt="{{ image.alt | default: product.title | escape }}"
                 width="900" height="900"
                 loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">
          </div>
        {%- endfor -%}
      {%- else -%}
        <div class="pdp-slide">
          <img src="[URL_IMAGEN_1]" alt="[DESCRIPCIÓN]" loading="eager">
        </div>
      {%- endif -%}
    </div>
    <div class="pdp-dots" id="pdpDots"></div>
  </div>

  <!-- OFERTA -->
  <div class="pdp-offer">
    <div class="pdp-rating">
      <span class="pdp-stars">★★★★★</span>
      <span><b>[4.9]</b> · [+1.800] clientes satisfechos</span>
    </div>

    <h1 class="pdp-title">{{ product.title | default: '[NOMBRE DEL PRODUCTO]' }}</h1>

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
    </div>

    <!-- BENEFICIOS -->
    <div class="pdp-benefits">
      <div class="pdp-benefit">
        <svg fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
        </svg>
        <span>[Envío gratis]</span>
      </div>
      <div class="pdp-benefit">
        <svg fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>
        </svg>
        <span>[Pago contra entrega]</span>
      </div>
      <div class="pdp-benefit">
        <svg fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12l2 2 4-4m5.6-4A12 12 0 0112 2.9 12 12 0 013.4 6 12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z"/>
        </svg>
        <span>[Garantía 90 días]</span>
      </div>
    </div>

    <!-- CRONOGRAMA: las fechas se calculan solas -->
    {%- assign hoy = "now" | date: "%s" -%}
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

    <div class="pdp-timeline">
      <div class="pdp-tl-head">Cronograma de tu pedido</div>
      <div class="pdp-tl-line"></div>
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
      </div>
    </div>
  </div>
</div>

<script>
(function(){
  var track = document.getElementById('pdpTrack');
  var dots = document.getElementById('pdpDots');
  if (!track || !dots) return;
  var slides = track.querySelectorAll('.pdp-slide');
  if (slides.length < 2) return;

  for (var i = 0; i < slides.length; i++) {
    var d = document.createElement('span');
    d.className = 'pdp-dot' + (i === 0 ? ' on' : '');
    dots.appendChild(d);
  }
  track.addEventListener('scroll', function(){
    var idx = Math.round(track.scrollLeft / track.clientWidth);
    var all = dots.children;
    for (var j = 0; j < all.length; j++) {
      all[j].className = 'pdp-dot' + (j === idx ? ' on' : '');
    }
  }, { passive: true });
})();
</script>`;

// ---------------------------------------------------------------------------
// BLOQUE 2 — Antes/después, dolor, características, prueba y cierre
// ---------------------------------------------------------------------------

export const LIQUID_BLOQUE_2 = `{%- comment -%}
  BLOQUE 2 de 2 — Cuerpo de la landing.
  Pegar debajo del formulario de pedido. Hereda la paleta del bloque 1.
{%- endcomment -%}

<style>
  .pdp-body { padding-bottom: 30px; }
  .pdp-rv { opacity: 0; transform: translateY(18px); transition: opacity .6s cubic-bezier(.25,1,.5,1), transform .6s cubic-bezier(.25,1,.5,1); }
  .pdp-rv.on { opacity: 1; transform: none; }

  .pdp-h { font-size: 20px; font-weight: 900; line-height: 1.28; text-align: center; margin-bottom: 16px; letter-spacing: -0.02em; }
  .pdp-h mark { background: linear-gradient(180deg, transparent 60%, var(--pdp-highlight) 60%); color: inherit; }
  .pdp-img { display: block; width: calc(100% - 32px); margin: 0 16px 22px; border-radius: 16px; }

  /* Antes y después / VS */
  .pdp-vs { margin: 0 16px 22px; }
  .pdp-vs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pdp-vs-card { border-radius: 14px; overflow: hidden; border: 1px solid var(--pdp-line); }
  .pdp-vs-card img { width: 100%; height: auto; display: block; }
  .pdp-vs-tag { font-size: 10.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px; text-align: center; }
  .pdp-vs-card.bad .pdp-vs-tag { background: var(--pdp-soft); color: #94A3B8; }
  .pdp-vs-card.good .pdp-vs-tag { background: var(--pdp-ink); color: #fff; }

  /* CTA */
  .pdp-cta-wrap { padding: 0 16px 22px; }
  .pdp-cta {
    display: block; width: 100%; background: var(--pdp-accent); color: var(--pdp-accent-ink);
    font-size: 14.5px; font-weight: 900; text-align: center; padding: 18px 12px;
    border-radius: 12px; border: none; cursor: pointer; position: relative; overflow: hidden;
    box-shadow: 0 8px 22px rgba(249,115,22,0.32); letter-spacing: -0.01em;
  }
  .pdp-cta:active { transform: scale(0.98); }
  .pdp-cta::after {
    content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: pdp-shine 3.5s infinite;
  }
  @keyframes pdp-shine { 0% { left: -100%; } 30% { left: 100%; } 100% { left: 100%; } }
  .pdp-cta-note { text-align: center; font-size: 11px; color: var(--pdp-body); margin-top: 8px; font-weight: 700; }

  /* Dolor */
  .pdp-dark { background: var(--pdp-ink); border-radius: 20px; padding: 22px 16px; margin: 0 16px 22px; }
  .pdp-dark .pdp-h { color: #fff; }
  .pdp-dark .pdp-h mark { background: linear-gradient(180deg, transparent 60%, rgba(249,115,22,0.45) 60%); color: #fff; }
  .pdp-pain { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 11px; padding: 14px; margin-bottom: 9px; }
  .pdp-pain:last-child { margin-bottom: 0; }
  .pdp-pain-e { font-size: 21px; flex-shrink: 0; }
  .pdp-pain-t { font-size: 13px; color: #fff; line-height: 1.45; font-weight: 600; }

  /* Características */
  .pdp-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px 22px; }
  .pdp-feat { background: var(--pdp-soft); border: 1px solid var(--pdp-line); border-radius: 14px; padding: 16px 12px; text-align: center; }
  .pdp-feat-e { font-size: 24px; display: block; margin-bottom: 6px; }
  .pdp-feat-t { font-size: 13px; font-weight: 900; line-height: 1.3; margin-bottom: 4px; }
  .pdp-feat-s { font-size: 11.5px; color: var(--pdp-body); line-height: 1.45; }

  /* Tabla comparativa */
  .pdp-tbl-box { margin: 0 16px 22px; }
  .pdp-tbl { width: 100%; border-collapse: collapse; font-size: 12px; border: 2px solid var(--pdp-ink); border-radius: 12px; overflow: hidden; }
  .pdp-tbl th { background: var(--pdp-ink); color: #fff; font-weight: 900; padding: 12px 6px; text-align: center; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.05em; }
  .pdp-tbl th.hi { color: var(--pdp-highlight); }
  .pdp-tbl td { padding: 12px 6px; text-align: center; border-bottom: 1px solid var(--pdp-line); font-weight: 700; }
  .pdp-tbl tr:last-child td { border-bottom: none; }
  .pdp-tbl td:first-child { text-align: left; padding-left: 12px; width: 40%; border-right: 1px solid var(--pdp-line); }
  .pdp-tbl .hi { background: #FFFBEB; font-weight: 900; border-right: 1px solid var(--pdp-line); }
  .pdp-tbl .lo { color: #94A3B8; }

  /* Pasos */
  .pdp-steps { padding: 0 16px 22px; }
  .pdp-step { display: flex; align-items: flex-start; gap: 12px; background: var(--pdp-soft); border: 1px solid var(--pdp-line); border-radius: 13px; padding: 14px; margin-bottom: 9px; }
  .pdp-step-n { background: var(--pdp-ink); color: #fff; font-size: 13px; font-weight: 900; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pdp-step-t { font-size: 13px; line-height: 1.45; color: var(--pdp-body); }
  .pdp-step-t b { color: var(--pdp-ink); font-weight: 900; }

  /* Reseñas */
  .pdp-revs { padding: 0 16px 22px; }
  .pdp-rev { background: var(--pdp-soft); border: 1px solid var(--pdp-line); border-radius: 14px; padding: 16px; margin-bottom: 11px; }
  .pdp-rev:last-child { margin-bottom: 0; }
  .pdp-rev-s { font-size: 12px; margin-bottom: 7px; color: #FBBF24; letter-spacing: 1px; }
  .pdp-rev-t { font-size: 13px; line-height: 1.55; margin-bottom: 12px; }
  .pdp-rev-t b { font-weight: 900; }
  .pdp-rev-m { display: flex; align-items: center; gap: 9px; }
  .pdp-rev-av { width: 31px; height: 31px; border-radius: 50%; background: var(--pdp-ink); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; }
  .pdp-rev-n { font-size: 12px; font-weight: 800; }
  .pdp-rev-l { font-size: 10px; color: var(--pdp-body); margin-top: 1px; }
  .pdp-rev-v { font-size: 10px; color: var(--pdp-ok); font-weight: 800; margin-left: auto; }

  /* Incluye + garantía */
  .pdp-bundle { background: var(--pdp-soft); border: 2px dashed var(--pdp-line); border-radius: 16px; padding: 22px 16px; margin: 0 16px 22px; }
  .pdp-bundle li { font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; gap: 9px; line-height: 1.35; list-style: none; }
  .pdp-bundle li:last-child { margin-bottom: 0; }
  .pdp-bundle li span { color: var(--pdp-ok); font-weight: 900; flex-shrink: 0; }
  .pdp-gar { background: var(--pdp-soft); border: 1px solid var(--pdp-line); border-radius: 14px; padding: 16px; margin: 0 16px 22px; display: flex; gap: 12px; }
  .pdp-gar-e { font-size: 24px; flex-shrink: 0; line-height: 1; }
  .pdp-gar-t { font-size: 13px; font-weight: 900; margin-bottom: 3px; }
  .pdp-gar-b { font-size: 12px; color: var(--pdp-body); line-height: 1.45; }

  /* FAQ */
  .pdp-faq { padding: 0 16px 22px; }
  .pdp-faq-i { background: var(--pdp-soft); border: 1px solid var(--pdp-line); border-radius: 10px; margin-bottom: 7px; overflow: hidden; }
  .pdp-faq-q { width: 100%; background: none; border: none; padding: 14px 16px; text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 10px; cursor: pointer; font-family: inherit; }
  .pdp-faq-q span:first-child { font-size: 13px; font-weight: 800; line-height: 1.35; color: var(--pdp-ink); }
  .pdp-faq-ic { font-size: 15px; font-weight: 900; color: var(--pdp-ink); transition: transform .2s ease; flex-shrink: 0; }
  .pdp-faq-i.on .pdp-faq-ic { transform: rotate(45deg); }
  .pdp-faq-p { max-height: 0; overflow: hidden; transition: max-height .25s cubic-bezier(.25,1,.5,1); }
  .pdp-faq-c { padding: 0 16px 14px; font-size: 12.5px; color: var(--pdp-body); line-height: 1.55; }

  /* Cierre */
  .pdp-close { background: var(--pdp-ink); border-radius: 22px; padding: 24px 16px; margin: 0 16px; text-align: center; }
  .pdp-close p { font-size: 12.5px; color: #fff; margin-bottom: 14px; line-height: 1.45; }
  .pdp-close p b { color: var(--pdp-highlight); }
  .pdp-trust { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 16px; }
  .pdp-trust div { font-size: 10px; color: #fff; display: flex; align-items: center; gap: 5px; font-weight: 700; }
  .pdp-trust i { width: 6px; height: 6px; border-radius: 50%; background: var(--pdp-ok); }
</style>

<div class="pdp-body">

  <!-- ANTES Y DESPUÉS / NOSOTROS VS COMPETENCIA -->
  <div class="pdp-vs pdp-rv">
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
  </div>

  <!-- CTA 1 -->
  <div class="pdp-cta-wrap pdp-rv">
    <button type="button" class="pdp-cta pdp-buy">[LO QUIERO · PAGO AL RECIBIR]</button>
    <p class="pdp-cta-note">Pagas cuando lo recibes · Envío gratis</p>
  </div>

  <!-- DOLOR -->
  <div class="pdp-dark pdp-rv">
    <h2 class="pdp-h">¿Vas a seguir <mark>[con el mismo problema]</mark>?</h2>
    <div class="pdp-pain"><span class="pdp-pain-e">😩</span><p class="pdp-pain-t">[Dolor 1: la molestia concreta del día a día]</p></div>
    <div class="pdp-pain"><span class="pdp-pain-e">⏳</span><p class="pdp-pain-t">[Dolor 2: el tiempo que pierde]</p></div>
    <div class="pdp-pain"><span class="pdp-pain-e">💸</span><p class="pdp-pain-t">[Dolor 3: lo que le cuesta seguir así]</p></div>
    <div class="pdp-pain"><span class="pdp-pain-e">😖</span><p class="pdp-pain-t">[Dolor 4: la consecuencia que más le pesa]</p></div>
  </div>

  <!-- VIDEO -->
  <div class="pdp-cta-wrap pdp-rv">
    <video class="pdp-img" style="width:100%;margin:0;" autoplay loop muted playsinline preload="metadata" poster="[URL_POSTER]">
      <source src="[URL_VIDEO]" type="video/mp4">
    </video>
  </div>

  <!-- CARACTERÍSTICAS -->
  <h2 class="pdp-h pdp-rv" style="padding:0 16px;">Todo lo que hace <mark>por ti</mark></h2>
  <div class="pdp-feats pdp-rv">
    <div class="pdp-feat"><span class="pdp-feat-e">⚙️</span><div class="pdp-feat-t">[Característica 1]</div><div class="pdp-feat-s">[Qué gana con eso]</div></div>
    <div class="pdp-feat"><span class="pdp-feat-e">📐</span><div class="pdp-feat-t">[Característica 2]</div><div class="pdp-feat-s">[Qué gana con eso]</div></div>
    <div class="pdp-feat"><span class="pdp-feat-e">🔋</span><div class="pdp-feat-t">[Característica 3]</div><div class="pdp-feat-s">[Qué gana con eso]</div></div>
    <div class="pdp-feat"><span class="pdp-feat-e">🛡️</span><div class="pdp-feat-t">[Característica 4]</div><div class="pdp-feat-s">[Qué gana con eso]</div></div>
  </div>

  <!-- TABLA COMPARATIVA -->
  <div class="pdp-tbl-box pdp-rv">
    <table class="pdp-tbl">
      <thead>
        <tr><th>Criterio</th><th class="hi">Con esto</th><th>Lo de siempre</th></tr>
      </thead>
      <tbody>
        <tr><td>[Criterio 1]</td><td class="hi">✅ [Bien]</td><td class="lo">❌ [Mal]</td></tr>
        <tr><td>[Criterio 2]</td><td class="hi">⚡ [Bien]</td><td class="lo">⏳ [Mal]</td></tr>
        <tr><td>[Criterio 3]</td><td class="hi">✅ [Bien]</td><td class="lo">❌ [Mal]</td></tr>
        <tr><td>[Criterio 4]</td><td class="hi">🛡️ [Bien]</td><td class="lo">⚠️ [Mal]</td></tr>
      </tbody>
    </table>
  </div>

  <!-- CÓMO SE USA -->
  <div class="pdp-steps pdp-rv">
    <h2 class="pdp-h">Resultados en <mark>3 pasos</mark></h2>
    <div class="pdp-step"><div class="pdp-step-n">1</div><p class="pdp-step-t"><b>[Acción 1]:</b> [detalle breve]</p></div>
    <div class="pdp-step"><div class="pdp-step-n">2</div><p class="pdp-step-t"><b>[Acción 2]:</b> [detalle breve]</p></div>
    <div class="pdp-step"><div class="pdp-step-n">3</div><p class="pdp-step-t"><b>[Acción 3]:</b> [detalle breve]</p></div>
  </div>

  <!-- RESEÑAS -->
  <div class="pdp-revs pdp-rv">
    <h2 class="pdp-h">Lo que dicen quienes ya lo tienen</h2>
    <div class="pdp-rev">
      <div class="pdp-rev-s">★★★★★</div>
      <p class="pdp-rev-t">"[Reseña 1: empieza por el problema que tenía y termina en el resultado. <b>La frase con el resultado va en negrita.</b>]"</p>
      <div class="pdp-rev-m"><div class="pdp-rev-av">[XX]</div><div><div class="pdp-rev-n">[Nombre A.]</div><div class="pdp-rev-l">[Ciudad] · Hace [4] días</div></div><span class="pdp-rev-v">✓ Verificado</span></div>
    </div>
    <div class="pdp-rev">
      <div class="pdp-rev-s">★★★★★</div>
      <p class="pdp-rev-t">"[Reseña 2: que mencione un uso distinto al de la primera. <b>Resultado en negrita.</b>]"</p>
      <div class="pdp-rev-m"><div class="pdp-rev-av">[XX]</div><div><div class="pdp-rev-n">[Nombre B.]</div><div class="pdp-rev-l">[Ciudad] · Hace [2] días</div></div><span class="pdp-rev-v">✓ Verificado</span></div>
    </div>
    <div class="pdp-rev">
      <div class="pdp-rev-s">★★★★★</div>
      <p class="pdp-rev-t">"[Reseña 3: idealmente de quien lo compró para regalar. <b>Resultado en negrita.</b>]"</p>
      <div class="pdp-rev-m"><div class="pdp-rev-av">[XX]</div><div><div class="pdp-rev-n">[Nombre C.]</div><div class="pdp-rev-l">[Ciudad] · Hace [6] días</div></div><span class="pdp-rev-v">✓ Verificado</span></div>
    </div>
  </div>

  <!-- CTA 2 -->
  <div class="pdp-cta-wrap pdp-rv">
    <button type="button" class="pdp-cta pdp-buy">[LO QUIERO · PAGO AL RECIBIR]</button>
    <p class="pdp-cta-note">Pagas cuando lo recibes · Envío gratis</p>
  </div>

  <!-- QUÉ INCLUYE -->
  <div class="pdp-bundle pdp-rv">
    <h2 class="pdp-h" style="font-size:16px;margin-bottom:14px;">¿Qué recibes?</h2>
    <ul>
      <li><span>✓</span> 1× [Producto principal]</li>
      <li><span>✓</span> [N]× [Accesorio incluido]</li>
      <li><span>✓</span> 1× [Cable / manual / extra]</li>
      <li><span>✓</span> Envío gratis a tu domicilio</li>
      <li><span>✓</span> Garantía de [90] días</li>
      <li><span>✓</span> Pago contra entrega</li>
    </ul>
  </div>

  <!-- GARANTÍA -->
  <div class="pdp-gar pdp-rv">
    <div class="pdp-gar-e">🛡️</div>
    <div>
      <h3 class="pdp-gar-t">Garantía de [90] días</h3>
      <p class="pdp-gar-b">[Si presenta cualquier falla de fábrica dentro del periodo, se cambia sin trámites.]</p>
    </div>
  </div>

  <!-- FAQ -->
  <div class="pdp-faq pdp-rv">
    <h2 class="pdp-h">Preguntas frecuentes</h2>
    <div class="pdp-faq-i">
      <button type="button" class="pdp-faq-q"><span>[¿Para qué sirve exactamente?]</span><span class="pdp-faq-ic">+</span></button>
      <div class="pdp-faq-p"><div class="pdp-faq-c">[Respuesta concreta, sin adornos.]</div></div>
    </div>
    <div class="pdp-faq-i">
      <button type="button" class="pdp-faq-q"><span>[¿Cómo funciona el pago contra entrega?]</span><span class="pdp-faq-ic">+</span></button>
      <div class="pdp-faq-p"><div class="pdp-faq-c">Haces el pedido sin pagar nada por adelantado y le pagas al mensajero cuando llega a tu casa.</div></div>
    </div>
    <div class="pdp-faq-i">
      <button type="button" class="pdp-faq-q"><span>[¿Cuánto demora el envío?]</span><span class="pdp-faq-ic">+</span></button>
      <div class="pdp-faq-p"><div class="pdp-faq-c">[2 a 4 días hábiles en ciudades principales, 3 a 6 en el resto del país.]</div></div>
    </div>
    <div class="pdp-faq-i">
      <button type="button" class="pdp-faq-q"><span>[¿Qué pasa si llega dañado?]</span><span class="pdp-faq-ic">+</span></button>
      <div class="pdp-faq-p"><div class="pdp-faq-c">[Se reemplaza por una unidad nueva sin costo.]</div></div>
    </div>
  </div>

  <!-- CIERRE -->
  <div class="pdp-close pdp-rv">
    <p>★★★★★ Más de <b>[1.800] clientes</b> ya lo tienen en casa</p>
    <button type="button" class="pdp-cta pdp-buy" style="margin-bottom:8px;">[LO QUIERO · PAGO AL RECIBIR]</button>
    <p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;margin:0;">Confirmas tu pedido y pagas en tu puerta</p>
    <div class="pdp-trust">
      <div><i></i>Pago contra entrega</div>
      <div><i></i>Envío gratis</div>
      <div><i></i>Garantía [90] días</div>
    </div>
  </div>
</div>

<script>
(function(){
  function init(){
    /* Reveal al hacer scroll */
    var els = document.querySelectorAll('.pdp-rv');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.05 });
      els.forEach(function(el){ obs.observe(el); });
    } else {
      els.forEach(function(el){ el.classList.add('on'); });
    }

    /* Acordeón del FAQ */
    document.querySelectorAll('.pdp-faq-q').forEach(function(btn){
      btn.addEventListener('click', function(){
        var item = btn.parentElement;
        var panel = btn.nextElementSibling;
        var abierto = item.classList.contains('on');
        document.querySelectorAll('.pdp-faq-i').forEach(function(i){
          i.classList.remove('on');
          var p = i.querySelector('.pdp-faq-p');
          if (p) p.style.maxHeight = null;
        });
        if (!abierto) {
          item.classList.add('on');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });

    /* Los CTA disparan el formulario de contra entrega.
       Cambia el selector si usas otra app que no sea ReleasIt. */
    document.querySelectorAll('.pdp-buy').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var target = document.getElementById('rsi_buy_now_button') || document.querySelector('.rsi_buy_now_button');
        if (target) {
          ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){
            target.dispatchEvent(new MouseEvent(t, { view: window, bubbles: true, cancelable: true, buttons: 1 }));
          });
        } else {
          var form = document.querySelector('form[action*="/cart"]');
          if (form) form.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>`;
