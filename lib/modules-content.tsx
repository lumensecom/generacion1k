import type { ReactNode } from 'react';
import type { ComparisonColumn } from '@/components/animated/ComparisonBlock';
import type { TimelineStep } from '@/components/animated/Timeline';

// Contenido pedagógico hardcodeado de los 10 módulos — fuente de verdad
// mientras no exista un editor visual en /portal/admin. El editor JSON
// crudo que ya existe en el admin (theory_content en la tabla `modules`)
// sigue funcionando como respaldo: si un slug no aparece en MODULES_CONTENT,
// la vista de módulo cae de vuelta a ese contenido guardado en Supabase.

export type TestAnswerValue = number | number[] | string | null;

export type ToolExplainerId = 'dropi-flow' | 'shopify-setup' | 'pixel-events' | 'ads-structure';

export type TestQuestionDef =
  | { type: 'single'; question: string; options: string[]; correctIndex: number }
  | { type: 'multiple'; question: string; options: string[]; correctIndices: number[] }
  | { type: 'text'; question: string };

export type TheoryBlock2 =
  | { type: 'heading'; level?: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; content: ReactNode }
  | { type: 'list'; variant: 'numbered' | 'bulleted' | 'checked'; items: ReactNode[] }
  | { type: 'stats'; items: { number: number; label: string; prefix?: string; suffix?: string; decimals?: number }[] }
  | { type: 'diagram'; steps: string[] }
  | { type: 'callout'; variant: 'tip' | 'warning' | 'success' | 'info'; content: ReactNode }
  | { type: 'example'; company?: string; content: ReactNode }
  | { type: 'comparison'; columns: ComparisonColumn[] }
  | { type: 'timeline'; steps: TimelineStep[] }
  | { type: 'toolGrid'; tools: { name: string; description: string; url: string }[] }
  | { type: 'toolExplainer'; tool: ToolExplainerId };

export interface ModuleContent {
  slug: string;
  accentColor: string;
  durationMinutes: number;
  introLine1: string;
  introLine2?: string;
  theory: TheoryBlock2[];
  practiceChecklist: string[];
  test: TestQuestionDef[];
}

const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-white">{children}</strong>;

export const MODULES_CONTENT: Record<string, ModuleContent> = {
  // ============================================================
  // MÓDULO 1 — Mentalidad del emprendedor PCE
  // ============================================================
  'mentalidad-pce': {
    slug: 'mentalidad-pce',
    accentColor: '#7C3AED',
    durationMinutes: 45,
    introLine1: 'Bienvenido al inicio de todo.',
    introLine2: 'El 85% del éxito es mental. Empecemos por ahí.',
    theory: [
      { type: 'heading', text: '¿Qué es el modelo PCE y por qué funciona en Colombia?' },
      {
        type: 'paragraph',
        content:
          'El PCE es un modelo de comercio donde el cliente PAGA CUANDO RECIBE el producto en su casa. No paga en línea, no da tarjeta de crédito, no confía su dinero a un extraño en internet.',
      },
      { type: 'diagram', steps: ['Cliente ve anuncio', 'Deja datos en tienda', 'Producto llega a su casa', 'Paga en efectivo al mensajero'] },
      {
        type: 'callout',
        variant: 'info',
        content:
          'En Colombia, más del 60% de compras online se hacen bajo modelo PCE. La razón: solo el 30% de la población tiene tarjeta de crédito. El resto usa efectivo.',
      },
      { type: 'stats', items: [
        { number: 60, suffix: '%', label: 'de compras online en Colombia son PCE' },
        { number: 30, suffix: '%', label: 'de colombianos tienen tarjeta de crédito' },
      ] },
      { type: 'heading', text: 'Las 4 barreras que detienen al 90% de los emprendedores' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>Miedo al qué dirán</B> — "¿Y si no funciona, qué va a pensar mi familia?"</span>,
        <span key="2"><B>Perfeccionismo paralizante</B> — "Todavía no tengo TODO listo, mejor espero"</span>,
        <span key="3"><B>Síndrome del sabelotodo</B> — "Voy a estudiar 6 meses más antes de arrancar"</span>,
        <span key="4"><B>Miedo a perder el dinero</B> — "¿Y si invierto $500 mil y me quedo sin nada?"</span>,
      ] },
      {
        type: 'example',
        content:
          'Cuando arranqué LUMENS, tenía las 4 barreras. Empecé con $200.000 pesos, un TikTok orgánico, y sin saber nada de Shopify. Hoy facturo $1.000 USD por semana. La diferencia entre yo y tú no es talento — es que yo EJECUTÉ mientras estaba asustado.',
      },
      { type: 'heading', text: 'Todos vamos a pasar por el valle. La pregunta es si salimos.' },
      { type: 'diagram', steps: ['Optimismo inicial', 'La realidad golpea', 'Valle profundo', 'Iluminación', 'Escala'] },
      {
        type: 'callout',
        variant: 'warning',
        content:
          'El 80% abandona en el valle. Sabiendo esto de antemano, la próxima vez que quieras rendirte, vas a saber que es NORMAL. No es señal de que debas parar.',
      },
      { type: 'heading', text: 'Los 3 tipos de emprendedores' },
      {
        type: 'comparison',
        columns: [
          { label: 'Los que fallan', tone: 'bad', items: [
            <span key="1"><B>El que mira:</B> ve las clases, no ejecuta</span>,
            <span key="2"><B>El que intenta:</B> ejecuta a medias, se rinde rápido</span>,
            <span key="3"><B>El que se distrae:</B> empieza 5 negocios, no termina ninguno</span>,
          ] },
          { label: 'El que gana', tone: 'good', items: [
            <span key="1"><B>El que ejecuta:</B> hace lo que se le pide, en el orden pedido, sin excusas</span>,
          ] },
        ],
      },
      { type: 'callout', variant: 'success', content: 'El que ejecuta gana. Simple. No hay más ciencia.' },
    ],
    practiceChecklist: [
      'Escribe en un papel las 4 barreras mentales que MÁS te afectan',
      'Identifica en cuál de los 5 puntos de la curva estás hoy',
      'Escribe una carta a tu yo del futuro (60 días adelante) contándole qué logró',
      'Define exactamente CUÁNTAS HORAS al día vas a dedicar a esto',
      'Comprométete con la primera acción de mañana (una sola)',
    ],
    test: [
      { type: 'single', question: '¿Cuál es el % aproximado de compras online en Colombia que se hacen bajo modelo PCE?', options: ['20%', '40%', '60%', '80%'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál NO es una de las 4 barreras mentales del emprendedor?', options: ['Miedo al qué dirán', 'Perfeccionismo paralizante', 'Falta de conexión a internet', 'Miedo a perder el dinero'], correctIndex: 2 },
      { type: 'single', question: 'En el valle de la desesperación, ¿qué % de emprendedores abandona?', options: ['20%', '40%', '60%', '80%'], correctIndex: 3 },
      { type: 'single', question: '¿Cuál es la diferencia entre el que EJECUTA y el que INTENTA?', options: ['El que ejecuta tiene más plata', 'El que ejecuta tiene mejor educación', 'El que ejecuta hace lo pedido, en el orden pedido, sin excusas', 'El que ejecuta ya sabía todo antes'], correctIndex: 2 },
      { type: 'text', question: '¿Cuál es la barrera mental que más te afecta HOY y qué vas a hacer para superarla esta semana?' },
    ],
  },

  // ============================================================
  // MÓDULO 2 — Cómo elegir tu producto ganador
  // ============================================================
  'producto-ganador': {
    slug: 'producto-ganador',
    accentColor: '#10B981',
    durationMinutes: 60,
    introLine1: 'El producto es el 40% del éxito.',
    introLine2: 'Elige mal y ni el mejor creativo te salva.',
    theory: [
      { type: 'heading', text: 'El framework para elegir tu producto ganador' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>MARGEN</B> — Costo debe ser máximo 40-45% del precio de venta. Ejemplo: cinturón anticólicos LUMENS — precio venta $69.900 · costo $37.900 · margen $32.000 (46%)</span>,
        <span key="2"><B>DEMANDA</B> — Debe haber competidores activos anunciando el mismo producto. Buen síntoma: más de 10 anuncios activos en Meta Ads Library. Mal síntoma: no encuentras a nadie vendiéndolo</span>,
        <span key="3"><B>VISUAL</B> — El producto debe entenderse en 3 segundos de video. Bueno: se ve fácilmente qué es y qué hace. Malo: necesita explicación técnica larga</span>,
        <span key="4"><B>LOGÍSTICA</B> — Disponibilidad en Dropi con buena cobertura Colombia. Verificar en el catálogo Dropi, preferir productos con múltiples proveedores</span>,
        <span key="5"><B>COMPETENCIA</B> — Ni saturado ni desierto. Ideal: 10-30 tiendas activas. Malo: 0 tiendas o más de 100</span>,
      ] },
      { type: 'heading', text: 'Sistema de scoring' },
      { type: 'paragraph', content: 'Cada criterio se puntúa 0-10. Score total: 0-50.' },
      { type: 'list', variant: 'checked', items: [
        '40+ = LANZAR YA',
        '30-39 = TESTEAR con presupuesto bajo',
        'Menos de 30 = DESCARTAR',
      ] },
      { type: 'heading', text: 'Dónde buscar productos' },
      { type: 'toolGrid', tools: [
        { name: 'Meta Ads Library', description: 'La biblioteca oficial de anuncios activos en Meta. Aquí ves qué está funcionando HOY. Filtro clave: ordenar por "longest running".', url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=CO' },
        { name: 'TikTok Creative Center', description: 'Ver qué anuncios están rompiéndola en TikTok Colombia ahora. Filtros: Colombia + últimos 30 días.', url: 'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/es' },
        { name: 'AliExpress', description: 'Ver productos best sellers globales y validar disponibilidad. Búsqueda por categoría con filtro "Más pedidos".', url: 'https://es.aliexpress.com' },
        { name: 'Amazon LATAM', description: 'Validar demanda real. Si vende en Amazon LATAM, vende en Colombia. Sección: Best Sellers por categoría.', url: 'https://www.amazon.com' },
      ] },
      { type: 'heading', text: 'Los 3 tipos de productos que mejor convierten en Colombia' },
      {
        type: 'comparison',
        columns: [
          { label: 'Problema-Solución', tone: 'good', items: ['Resuelve un dolor específico', 'Fácil de vender emocionalmente', 'Margen alto — la gente paga por resolver dolor', 'Ejemplo LUMENS: cinturón anticólicos'] },
          { label: 'Regalo emocional', tone: 'neutral', items: ['Ocasión especial', 'El cliente compra para OTRO, no para él', 'Menor sensibilidad al precio', 'Ejemplo LUMENS: combo colágeno Día de la Madre'] },
          { label: 'Producto viral', tone: 'neutral', items: ['Trending en TikTok', 'Curiosidad + demostración visual', 'Requiere producción de creativo más pro', 'Ejemplo: aspiradora robot'] },
        ],
      },
      {
        type: 'example',
        content:
          'Nuestro producto ganador #1 es el Cinturón Anticólicos Alivio Pro. ¿Por qué? Porque resuelve un dolor masivo y frecuente (cólicos menstruales), el margen permite ads agresivos, y el ángulo "hombres regalando" abre un público que nadie más está atacando: novios y esposos que quieren regalar solución al dolor de su pareja.',
      },
    ],
    practiceChecklist: [
      'Abre Meta Ads Library y busca 3 productos que veas anunciándose',
      'Puntúa cada uno con los 5 criterios (0-10 cada uno)',
      'Verifica disponibilidad de los 3 en Dropi',
      'Elige tu producto ganador (el de mayor score)',
      'Escribe 3 hooks/ángulos posibles para atacarlo',
    ],
    test: [
      { type: 'single', question: '¿Cuál es el margen ideal mínimo para un producto ganador?', options: ['20% del precio de venta', '30% del precio de venta', '55% del precio de venta o más', '80% del precio de venta'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál score total del sistema LUMENS indica LANZAR YA?', options: ['20+', '30+', '40+', '45+'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál de estas NO es una herramienta oficial para research de productos?', options: ['Meta Ads Library', 'TikTok Creative Center', 'AliExpress', 'Google Trends Colombia'], correctIndex: 3 },
      { type: 'multiple', question: '¿Cuáles son los 3 tipos de productos que mejor convierten en Colombia?', options: ['Problema-Solución', 'Regalo emocional', 'Viral de TikTok', 'Ropa fashion', 'Productos de lujo'], correctIndices: [0, 1, 2] },
      { type: 'text', question: 'Cuéntame qué producto elegiste para testear y por qué. Incluye tu score de los 5 criterios.' },
    ],
  },

  // ============================================================
  // MÓDULO 3 — Setup Shopify completo
  // ============================================================
  'setup-shopify': {
    slug: 'setup-shopify',
    accentColor: '#3B82F6',
    durationMinutes: 90,
    introLine1: 'En las próximas 2 horas tendrás tu tienda funcionando.',
    introLine2: 'Sin código. Sin diseñador. Sin excusas.',
    theory: [
      { type: 'heading', text: 'Por qué Shopify (y no otro)' },
      { type: 'list', variant: 'checked', items: [
        'Trial de $1 USD el primer mes',
        'Templates gratuitos que convierten',
        'App store con Dropi y ReleaseIt integrados',
        'Soporte 24/7 en español',
        'Optimizado para móvil por defecto',
      ] },
      { type: 'example', content: 'lumenscol.com corre en Shopify con el tema Horizon 3.2.1. Está optimizado para el 90% de tráfico móvil que llega desde TikTok Ads.' },
      { type: 'heading', text: 'Los 7 pasos del setup' },
      { type: 'timeline', steps: [
        { title: 'Crear cuenta Shopify', meta: '5 min', description: 'Usar link de $1 USD primer mes' },
        { title: 'Elegir tema Horizon', meta: '10 min', description: 'Gratuito, optimizado para PCE Colombia' },
        { title: 'Configurar dominio', meta: '15 min', description: 'Comprar en Namecheap ($10 USD/año) o usar temporal .myshopify.com' },
        { title: 'Configurar moneda COP', meta: '5 min', description: 'Settings → General → Currency → COP' },
        { title: 'Configurar checkout PCE', meta: '15 min', description: 'Desactivar pasarelas de pago, activar "Cash on Delivery"' },
        { title: 'Instalar ReleaseIt COD', meta: '10 min', description: 'App Store → buscar "ReleaseIt" → instalar' },
        { title: 'Subir primer producto', meta: '30 min', description: 'Con imágenes, precio, descripción, variantes' },
      ] },
      { type: 'toolExplainer', tool: 'shopify-setup' },
      { type: 'heading', text: 'Configuración del checkout' },
      {
        type: 'comparison',
        columns: [
          { label: 'No hacer', tone: 'bad', items: ['Checkout de 3 pasos con formulario largo', 'Pedir email obligatorio en el primer paso', 'Mostrar cálculo de impuestos separado'] },
          { label: 'Sí hacer', tone: 'good', items: ['Checkout de 1 paso (con ReleaseIt)', 'Solo pedir: nombre, teléfono, dirección, ciudad', 'Precio final ya incluye envío'] },
        ],
      },
      { type: 'callout', variant: 'tip', content: 'Cada paso extra en el checkout pierde 15-20% de conversión. En PCE, menos es más.' },
      { type: 'toolGrid', tools: [
        { name: 'Shopify', description: 'Plataforma para tu tienda. Trial de $1 USD el primer mes.', url: 'https://www.shopify.com/co/prueba-gratis' },
        { name: 'Namecheap', description: 'Comprar dominio .com por $10 USD al año.', url: 'https://www.namecheap.com' },
        { name: 'ReleaseIt COD', description: 'App para checkout PCE simplificado.', url: 'https://apps.shopify.com/releaseit' },
      ] },
    ],
    practiceChecklist: [
      'Crear cuenta Shopify con el link de $1 USD',
      'Instalar tema gratuito Horizon (o similar)',
      'Configurar moneda COP en Settings',
      'Comprar dominio en Namecheap (o dejar temporal)',
      'Instalar ReleaseIt COD desde App Store',
      'Configurar checkout de 1 paso',
      'Subir el producto ganador que elegiste en módulo 2',
    ],
    test: [
      { type: 'single', question: '¿Cuánto cuesta Shopify el primer mes con el link oficial?', options: ['Gratis', '$1 USD', '$29 USD', '$79 USD'], correctIndex: 1 },
      { type: 'single', question: '¿Cuál es la moneda que debes configurar para Colombia?', options: ['USD', 'MXN', 'COP', 'EUR'], correctIndex: 2 },
      { type: 'single', question: '¿Cuántos pasos debe tener idealmente tu checkout en PCE?', options: ['1 paso', '2 pasos', '3 pasos', '5 pasos'], correctIndex: 0 },
      { type: 'single', question: '¿Qué app se instala desde el Shopify App Store para checkout PCE?', options: ['Recharge', 'ReleaseIt COD', 'Shopify Payments', 'PayPal'], correctIndex: 1 },
      { type: 'text', question: 'Comparte el link de tu tienda Shopify (aunque esté incompleta). Si aún no la creaste, cuéntame qué obstáculo encontraste.' },
    ],
  },

  // ============================================================
  // MÓDULO 4 — Dropi + ADMA: configuración
  // ============================================================
  'dropi-adma': {
    slug: 'dropi-adma',
    accentColor: '#F97316',
    durationMinutes: 60,
    introLine1: 'Sin bodega. Sin inventario. Sin logística que manejar.',
    introLine2: 'Alguien más despacha tus productos. Tú solo vendes.',
    theory: [
      { type: 'heading', text: 'Qué es Dropi' },
      {
        type: 'paragraph',
        content:
          'Dropi es la plataforma #1 de dropshipping en Colombia. Conecta tu tienda Shopify con proveedores locales que tienen inventario y logística. Cuando alguien te compra, Dropi despacha por ti.',
      },
      { type: 'toolExplainer', tool: 'dropi-flow' },
      { type: 'heading', text: 'Por qué ADMA como proveedor principal' },
      { type: 'list', variant: 'checked', items: [
        'Stock permanente de productos ganadores en Colombia',
        'Envíos a todo el país en 2-7 días',
        'Precios competitivos que dejan buen margen',
        'Soporte directo cuando hay problemas',
        'Historial comprobado — LUMENS lleva 6+ meses trabajando con ellos',
      ] },
      { type: 'heading', text: 'Zonas de cobertura' },
      {
        type: 'comparison',
        columns: [
          { label: 'Interrapidísimo', tone: 'good', items: ['Ciudades principales: 2-3 días', 'Municipios: 3-5 días', 'Cobertura amplia', 'Recaudo confiable'] },
          { label: 'Coordinadora', tone: 'neutral', items: ['San Andrés y zonas remotas', '5-10 días', 'Cobertura donde otros no llegan', 'Costo más alto'] },
        ],
      },
      { type: 'callout', variant: 'warning', content: 'Las zonas más problemáticas para devoluciones: San Andrés, Amazonas, Vaupés, Guainía. No vender ahí sin doble confirmación.' },
      { type: 'heading', text: 'El wallet de Dropi' },
      {
        type: 'paragraph',
        content:
          'El wallet es tu billetera en Dropi. Ahí llegan las ganancias cuando el cliente paga al recibir. Los fletes se descuentan automáticamente. Puedes retirar el saldo a tu banco cuando quieras (mínimo $50.000 COP).',
      },
      { type: 'toolGrid', tools: [
        { name: 'Dropi', description: 'Plataforma de dropshipping. Regístrate con tu cédula y RUT.', url: 'https://dropi.co' },
      ] },
    ],
    practiceChecklist: [
      'Crear cuenta Dropi con tu cédula y RUT',
      'Esperar aprobación (24-48 horas)',
      'Conectar Dropi con tu tienda Shopify',
      'Buscar tu producto ganador en el catálogo Dropi',
      'Verificar disponibilidad y precio de ADMA',
      'Pedir un producto de muestra a tu dirección',
      'Verificar zonas de cobertura donde vas a vender',
    ],
    test: [
      { type: 'single', question: '¿Qué documentos necesitas para crear cuenta en Dropi?', options: ['Solo cédula', 'Cédula + RUT', 'Cédula + pasaporte', 'Cédula + libreta militar'], correctIndex: 1 },
      { type: 'single', question: '¿Cuánto tarda la aprobación de tu cuenta Dropi?', options: ['5 minutos', '24-48 horas', '1 semana', '1 mes'], correctIndex: 1 },
      { type: 'single', question: '¿Cuál transportadora usar para San Andrés y zonas remotas?', options: ['Interrapidísimo', 'Servientrega', 'Coordinadora', 'Envía'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál es el monto mínimo para retirar de tu wallet Dropi?', options: ['$10.000 COP', '$50.000 COP', '$100.000 COP', '$500.000 COP'], correctIndex: 1 },
      { type: 'text', question: '¿Ya tienes tu cuenta Dropi aprobada? Si sí, comparte captura del catálogo con tu producto. Si no, cuéntame en qué paso estás.' },
    ],
  },

  // ============================================================
  // MÓDULO 5 — ReleaseIt COD: pagos y confirmación
  // ============================================================
  'releasit-cod': {
    slug: 'releasit-cod',
    accentColor: '#EC4899',
    durationMinutes: 45,
    introLine1: 'El checkout que reduce fricción.',
    introLine2: 'Y el mensaje de WhatsApp que reduce devoluciones.',
    theory: [
      { type: 'heading', text: 'Qué hace ReleaseIt COD' },
      { type: 'list', variant: 'checked', items: [
        'Convierte tu checkout de 3 pasos a 1 solo paso',
        'Envía mensaje de WhatsApp automático al cliente',
        'Sincroniza con Dropi automáticamente',
        'Trackea eventos de conversión para Meta/TikTok',
        'Permite bundles (2x1, 3x1) fácilmente',
      ] },
      { type: 'heading', text: 'El mensaje de confirmación optimizado' },
      { type: 'paragraph', content: 'El mensaje default de ReleaseIt es genérico. Lo optimizamos para reducir devoluciones.' },
      {
        type: 'comparison',
        columns: [
          { label: 'Mensaje default', tone: 'bad', items: ['"¡Hola! Mi nombre es {nombre}. Confirmo que acabo de realizar un pedido..."'] },
          { label: 'Mensaje LUMENS optimizado', tone: 'good', items: ['"¡Hola! CONFIRMO mi pedido en LUMENS. Soy {nombre} y autorizo el envío con los siguientes datos..."'] },
        ],
      },
      { type: 'callout', variant: 'success', content: 'Solo con este cambio, LUMENS bajó devoluciones del 33% al 11%. El cliente se compromete activamente con la palabra "CONFIRMO" en mayúsculas.' },
      { type: 'heading', text: 'Bundles de cantidad' },
      {
        type: 'paragraph',
        content: 'El Bundle de ReleaseIt permite ofrecer descuentos por cantidad (2 unidades, 3 unidades). Aumenta AOV (ticket promedio) sin gastar más en ads.',
      },
      {
        type: 'example',
        content: (
          <>
            Bundle actual del cinturón: 1 unidad $69.900 · 2 unidades $119.900 (ahorra $19.900) · 3 unidades $169.900
            (ahorra $39.800). Con esto, el <B>35% de clientes</B> compran 2+ unidades.
          </>
        ),
      },
      { type: 'toolGrid', tools: [
        { name: 'ReleaseIt COD', description: 'Checkout PCE + confirmación WhatsApp automática.', url: 'https://apps.shopify.com/releaseit' },
        { name: 'ReleaseIt Bundle', description: 'Bundles de cantidad para aumentar ticket promedio.', url: 'https://apps.shopify.com/releasit-bundles' },
      ] },
    ],
    practiceChecklist: [
      'Instalar ReleaseIt COD desde App Store',
      'Configurar el formulario de checkout de 1 paso',
      'Personalizar el mensaje de WhatsApp con la versión optimizada',
      'Hacer un pedido de prueba a ti mismo',
      'Verificar que el mensaje de WhatsApp llegue correctamente',
      'Instalar ReleaseIt Bundle App',
      'Configurar bundle de 2 y 3 unidades',
    ],
    test: [
      { type: 'single', question: '¿Cuál es el principal beneficio del checkout de ReleaseIt vs el default de Shopify?', options: ['Es más caro', 'Convierte 3 pasos a 1 solo paso', 'Acepta más monedas', 'Tiene más colores'], correctIndex: 1 },
      { type: 'single', question: '¿Qué palabra clave usa el mensaje LUMENS optimizado para reducir devoluciones?', options: ['"Ordeno"', '"Compro"', '"CONFIRMO"', '"Autorizo"'], correctIndex: 2 },
      { type: 'single', question: '¿En cuánto redujo LUMENS su tasa de devolución con el mensaje optimizado?', options: ['De 40% a 30%', 'De 33% a 11%', 'De 25% a 15%', 'De 50% a 40%'], correctIndex: 1 },
      { type: 'single', question: '¿Para qué sirve la app ReleaseIt Bundle?', options: ['Para pagar en cuotas', 'Para ofrecer descuentos por cantidad', 'Para gestionar devoluciones', 'Para calcular impuestos'], correctIndex: 1 },
      { type: 'text', question: 'Escribe aquí el mensaje de WhatsApp EXACTO que configuraste. Si no lo hiciste aún, escribe el que planeas usar.' },
    ],
  },

  // ============================================================
  // MÓDULO 6 — Meta Pixel + TikTok Pixel
  // ============================================================
  'pixel-tracking': {
    slug: 'pixel-tracking',
    accentColor: '#06B6D4',
    durationMinutes: 75,
    introLine1: 'El pixel es la memoria de tus campañas.',
    introLine2: 'Sin él, gastás en publicidad a ciegas.',
    theory: [
      { type: 'heading', text: 'Qué es un pixel' },
      {
        type: 'paragraph',
        content:
          'Un pixel es un pedazo de código invisible en tu tienda que le cuenta a Meta o TikTok qué hace cada visitante: si vio un producto, agregó al carrito, o compró. Con esa info, Meta y TikTok aprenden a mostrarle tus ads a gente parecida a tus compradores.',
      },
      { type: 'diagram', steps: ['Visitante entra a tu tienda', 'Pixel detecta cada acción', 'Envía data a Meta/TikTok', 'Optimizan para conseguir más compras'] },
      { type: 'heading', text: 'Los eventos que debes trackear' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>PageView</B> — Alguien entró a tu tienda</span>,
        <span key="2"><B>ViewContent</B> — Alguien vio un producto</span>,
        <span key="3"><B>AddToCart</B> — Alguien agregó al carrito</span>,
        <span key="4"><B>InitiateCheckout</B> — Alguien empezó el checkout</span>,
        <span key="5"><B>Purchase</B> — Alguien COMPRÓ (el más importante)</span>,
      ] },
      { type: 'callout', variant: 'warning', content: 'Sin el evento Purchase configurado, Meta/TikTok NO PUEDE optimizar tus campañas. Estarás gastando plata sin aprender.' },
      { type: 'toolExplainer', tool: 'pixel-events' },
      { type: 'heading', text: 'Setup paso a paso' },
      { type: 'timeline', steps: [
        { title: 'Crear Meta Business Manager', description: 'business.facebook.com, con tu Facebook personal' },
        { title: 'Crear Ad Account', description: 'Business Settings → Ad Accounts → Create, moneda COP' },
        { title: 'Crear Meta Pixel', description: 'Business Settings → Data Sources → Pixels → Create' },
        { title: 'Instalar Meta Pixel en Shopify', description: 'Shopify Admin → Sales Channels → Facebook & Instagram' },
        { title: 'Crear TikTok Ads Manager', description: 'ads.tiktok.com' },
        { title: 'Crear TikTok Pixel', description: 'Assets → Events → Web Events → Create' },
        { title: 'Instalar TikTok Pixel en Shopify', description: 'Shopify App Store → TikTok' },
        { title: 'Verificar con Pixel Helper', description: 'Chrome Extensions' },
      ] },
      { type: 'heading', text: 'Verificación de dominio' },
      {
        type: 'paragraph',
        content: 'Meta y TikTok requieren que verifiques que ERES el dueño del dominio. Sin esto, los pixels no funcionan correctamente.',
      },
      { type: 'list', variant: 'checked', items: [
        'Meta Business Manager → Business Settings → Brand Safety → Domains',
        'TikTok Ads Manager → Assets → Events → Domain',
      ] },
      { type: 'toolGrid', tools: [
        { name: 'Meta Business', description: 'Todo el ecosistema de Meta Ads en un lugar.', url: 'https://business.facebook.com' },
        { name: 'TikTok Ads Manager', description: 'Plataforma para crear campañas de TikTok Ads.', url: 'https://ads.tiktok.com' },
        { name: 'Meta Pixel Helper', description: 'Extensión Chrome para verificar que el pixel dispare eventos.', url: 'https://chrome.google.com/webstore/detail/meta-pixel-helper' },
        { name: 'TikTok Pixel Helper', description: 'Extensión Chrome para verificar TikTok Pixel.', url: 'https://chrome.google.com/webstore/detail/tiktok-pixel-helper' },
      ] },
    ],
    practiceChecklist: [
      'Crear Meta Business Manager',
      'Crear Ad Account con moneda COP',
      'Crear Meta Pixel',
      'Instalar Meta Pixel en Shopify',
      'Verificar dominio en Meta Business',
      'Crear TikTok Ads Manager account',
      'Crear TikTok Pixel',
      'Instalar TikTok Pixel en Shopify',
      'Instalar Meta Pixel Helper (Chrome)',
      'Verificar que PageView y Purchase disparen correctamente',
    ],
    test: [
      { type: 'single', question: '¿Cuál es el evento MÁS IMPORTANTE que debes trackear?', options: ['PageView', 'ViewContent', 'AddToCart', 'Purchase'], correctIndex: 3 },
      { type: 'single', question: '¿Qué es Meta Business Manager?', options: ['Una app para hacer pagos', 'La plataforma para gestionar todo el ecosistema de Meta Ads', 'Un CRM', 'Un editor de video'], correctIndex: 1 },
      { type: 'multiple', question: '¿Cuáles herramientas verifican que un pixel dispare correctamente?', options: ['Meta Pixel Helper', 'TikTok Pixel Helper', 'Google Analytics', 'Shopify Reports'], correctIndices: [0, 1] },
      { type: 'single', question: '¿Qué pasa si NO verificas tu dominio en Meta?', options: ['Nada, es opcional', 'Los pixels no funcionan correctamente y no puedes crear conversion campaigns', 'Solo afecta a Instagram', 'Solo afecta la app móvil'], correctIndex: 1 },
      { type: 'text', question: 'Comparte captura de pantalla del Pixel Helper mostrando que tu pixel dispara PageView y Purchase correctamente. Si no lo has hecho, cuéntame en qué paso estás bloqueado.' },
    ],
  },

  // ============================================================
  // MÓDULO 7 — Cómo crear tu primer creativo ganador
  // ============================================================
  'primer-creativo': {
    slug: 'primer-creativo',
    accentColor: '#F5C518',
    durationMinutes: 90,
    introLine1: 'El creativo es el 60% del éxito.',
    introLine2: 'Producto ganador + creativo malo = fracaso. Producto normal + creativo ganador = éxito.',
    theory: [
      { type: 'heading', text: 'Los 6 ángulos validados en Colombia' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>Hombres regalando</B> (ganador #1) — "Mi novio no es el típico tómate algo" · CPA histórico $4.897 COP · hombre resuelve problema de su pareja</span>,
        <span key="2"><B>Papá/hija emocional</B> — "Mi niña jamás se hará espectadora" · CPA histórico $4.269 COP · protección paternal</span>,
        <span key="3"><B>Dolor directo</B> — "No más días perdidos por el dolor" · CPA histórico $7.089 COP · identificación con el sufrimiento</span>,
        <span key="4"><B>Antes/Después visual</B> — "Yo antes con pastillas... ahora con esto" · transformación tangible</span>,
        <span key="5"><B>Unboxing POV</B> — "Por fin llegó mi cinturón" · CPA histórico $9.187 COP · emoción del recibido</span>,
        <span key="6"><B>Testimonio real</B> — clienta usando y explicando · prueba social</span>,
      ] },
      { type: 'heading', text: 'Estructura del hook (primeros 3 segundos)' },
      { type: 'paragraph', content: 'En TikTok tienes 3 segundos para detener el scroll. Si en esos 3 segundos no captas, perdiste.' },
      { type: 'list', variant: 'checked', items: [
        'Empieza con acción, no con logo',
        'Muestra el producto en uso, no en foto',
        'Voz humana (no música sola)',
        'Texto grande en primeros 2 segundos',
        'Emoción cruda (dolor, alegría, sorpresa)',
      ] },
      { type: 'callout', variant: 'tip', content: 'El hook debe funcionar SIN AUDIO. El 70% de usuarios TikTok ven video sin sonido en el primer scroll.' },
      { type: 'heading', text: 'Especificaciones técnicas' },
      { type: 'list', variant: 'checked', items: [
        'Formato: 9:16 vertical',
        'Resolución: 1080x1920',
        'Duración: 15-30 segundos (nunca menos, nunca más)',
        'FPS: 30',
        'Codec: H.264',
        'Audio: AAC estéreo',
        'Copy máximo 100 caracteres',
        'Sin emojis en el copy',
        'Sin logos al principio',
      ] },
      { type: 'heading', text: 'CapCut vs Google Flow vs UGC real' },
      {
        type: 'comparison',
        columns: [
          { label: 'CapCut — edición manual', tone: 'neutral', items: ['Herramienta gratis', 'Curva de aprendizaje media', 'Control total del resultado', 'Ideal para editar UGC real'] },
          { label: 'Google Flow + Veo 3 — IA', tone: 'neutral', items: ['Genera videos con IA', 'Rápido pero requiere prompts precisos', 'Ideal para productos abstractos', 'Riesgo: puede rechazar por policy'] },
        ],
      },
      { type: 'toolGrid', tools: [
        { name: 'CapCut', description: 'Editor de video gratis. Templates optimizados para TikTok.', url: 'https://www.capcut.com' },
        { name: 'Google Flow', description: 'Generador de video con IA (Veo 3). Requiere prompts precisos.', url: 'https://flow.google' },
        { name: 'ElevenLabs', description: 'Voces con IA en español. Para voiceover de anuncios.', url: 'https://elevenlabs.io' },
      ] },
    ],
    practiceChecklist: [
      'Elegir 1 de los 6 ángulos validados',
      'Escribir el guión con hook + desarrollo + CTA',
      'Grabar o generar el video (30 segundos máx)',
      'Editar en CapCut con texto grande primeros 2 seg',
      'Agregar música trending desde biblioteca TikTok',
      'Exportar en 9:16 vertical 1080x1920',
      'Ver el video CON MUTE para verificar que se entienda',
      'Crear 3 variaciones del mismo ángulo con diferente hook',
    ],
    test: [
      { type: 'single', question: '¿Cuántos segundos tienes para captar la atención en TikTok?', options: ['1 segundo', '3 segundos', '5 segundos', '10 segundos'], correctIndex: 1 },
      { type: 'single', question: '¿Cuál es el ángulo GANADOR #1 validado en LUMENS Colombia?', options: ['Dolor directo', 'Hombres regalando', 'Antes/Después', 'Testimonio'], correctIndex: 1 },
      { type: 'single', question: '¿Cuál es el formato correcto para TikTok Ads?', options: ['16:9 horizontal', '1:1 cuadrado', '9:16 vertical', '4:5 vertical'], correctIndex: 2 },
      { type: 'multiple', question: '¿Qué debe cumplir el copy de un ad TikTok?', options: ['Máximo 100 caracteres', 'Sin emojis', 'Con muchos hashtags', 'Precio + PCE + envío gratis mencionados'], correctIndices: [0, 1, 3] },
      { type: 'text', question: 'Sube el link de tu creativo (Drive, Dropbox, YouTube unlisted). Si aún no lo tienes, cuéntame qué ángulo elegiste y por qué.' },
    ],
  },

  // ============================================================
  // MÓDULO 8 — Lanzamiento de tu primera campaña
  // ============================================================
  lanzamiento: {
    slug: 'lanzamiento',
    accentColor: '#EF4444',
    durationMinutes: 60,
    introLine1: 'Este es el momento de la verdad.',
    introLine2: 'Todo lo anterior te preparó. Ahora se lanza.',
    theory: [
      { type: 'heading', text: 'Estructura de cuenta' },
      { type: 'toolExplainer', tool: 'ads-structure' },
      { type: 'heading', text: 'Objetivo correcto' },
      {
        type: 'comparison',
        columns: [
          { label: 'Correcto', tone: 'good', items: ['Website Conversion → Purchase'] },
          { label: 'Incorrectos', tone: 'bad', items: ['Traffic — no optimiza para compra', 'Reach — no genera ventas', 'Engagement — likes no son ventas'] },
        ],
      },
      { type: 'heading', text: 'Targeting inicial' },
      { type: 'callout', variant: 'tip', content: 'Al inicio: targeting Automatic (Broad). El algoritmo aprende más rápido con audiencia abierta. Los intereses vienen DESPUÉS cuando ya tienes 50+ conversiones.' },
      { type: 'list', variant: 'checked', items: [
        'Colombia (todo el país)',
        'Edad: 18-55',
        'Género: según producto',
        'Idioma: español',
        'NO agregar intereses al inicio',
        'NO usar audiencias custom (aún no tienes data)',
      ] },
      { type: 'heading', text: 'Presupuesto' },
      {
        type: 'comparison',
        columns: [
          { label: 'Mal', tone: 'bad', items: ['Empezar con $100.000+ COP/día', 'CBO con múltiples ad groups', 'Escalar antes de 3 días de data'] },
          { label: 'Bien', tone: 'good', items: ['Empezar con $50.000 COP/día ABO', '1 solo ad group con 3-5 creativos', 'Dejar correr 72 horas antes de tocar'] },
        ],
      },
      { type: 'heading', text: 'Las primeras 72 horas' },
      { type: 'timeline', steps: [
        { title: 'Día 1 (0-24h)', description: 'Fase de aprendizaje. Data errática, ignora los números. No pausar nada.' },
        { title: 'Día 2 (24-48h)', description: 'Empiezas a ver tendencias. CPA todavía inestable. No pausar nada.' },
        { title: 'Día 3 (48-72h)', description: 'Ya tienes data real. Puedes empezar a evaluar. Pausa creativos con CPA >2x el ganador.' },
      ] },
      { type: 'callout', variant: 'warning', content: 'El error #1 del principiante: pausar campañas a las 6 horas porque "no funciona". La campaña necesita 72 HORAS mínimo para hablar.' },
      { type: 'toolGrid', tools: [
        { name: 'TikTok Ads Manager', description: 'Donde crearás y gestionarás todas tus campañas.', url: 'https://ads.tiktok.com' },
      ] },
    ],
    practiceChecklist: [
      'Verificar que Pixel + Purchase estén tracking',
      'Crear campaña Website Conversion → Purchase',
      'Crear 1 ad group Broad Colombia',
      'Subir 3-5 creativos del mismo ángulo',
      'Configurar presupuesto $50.000 COP/día ABO',
      'Verificar copy con precio + PCE + envío gratis',
      'Lanzar la campaña',
      'NO tocar nada por 72 horas',
      'Prepararte mentalmente para el valle del inicio',
    ],
    test: [
      { type: 'single', question: '¿Cuál es el objetivo CORRECTO para campañas de ecommerce?', options: ['Traffic', 'Reach', 'Website Conversion → Purchase', 'Engagement'], correctIndex: 2 },
      { type: 'single', question: '¿Qué targeting debes usar al iniciar?', options: ['Intereses específicos', 'Audiencias lookalike', 'Automatic (Broad)', 'Retargeting'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál es el presupuesto inicial recomendado por día?', options: ['$10.000 COP', '$50.000 COP', '$200.000 COP', '$500.000 COP'], correctIndex: 1 },
      { type: 'single', question: '¿Cuántas horas debes esperar antes de tocar la campaña?', options: ['6 horas', '12 horas', '24 horas', '72 horas'], correctIndex: 3 },
      { type: 'text', question: '¿Ya lanzaste tu campaña? Comparte el link de tu ad group o cuéntame cuándo planeas lanzar.' },
    ],
  },

  // ============================================================
  // MÓDULO 9 — Optimización y escalado
  // ============================================================
  escalado: {
    slug: 'escalado',
    accentColor: '#84CC16',
    durationMinutes: 75,
    introLine1: 'Aquí es donde separas los que ejecutan...',
    introLine2: '...de los que escalan.',
    theory: [
      { type: 'heading', text: 'Las 6 reglas de oro' },
      { type: 'list', variant: 'numbered', items: [
        'Nunca cambies presupuesto Y creativos el mismo día',
        'Escalar máximo 25-30% cada 3-4 días',
        'Mínimo 20 conversiones antes de escalar',
        'Pausar si CPA >80% del margen por 3 días seguidos',
        'No abrir nuevas campañas mientras hay optimización activa',
        'Nuevos creativos solo en CBO nueva, NO en la vieja',
      ] },
      { type: 'callout', variant: 'warning', content: 'Romper cualquiera de estas reglas puede quemar semanas de aprendizaje del algoritmo. Cuando estés emocionado y quieras romper una, ES ESE MOMENTO cuando debes seguirlas más.' },
      { type: 'heading', text: 'Cuándo pausar un creativo' },
      {
        type: 'comparison',
        columns: [
          { label: 'Pausar cuando', tone: 'bad', items: ['CPA >80% del margen por 3 días seguidos', 'Frecuencia >2 con 0 conversiones', 'CTR <0.4% sostenido', 'Sin conversiones tras $50.000 gastados'] },
          { label: 'Mantener cuando', tone: 'good', items: ['CPA <50% del margen', 'Frecuencia <1.5', 'CTR >0.7%', 'Al menos 5 conversiones acumuladas'] },
        ],
      },
      { type: 'heading', text: 'Cuándo escalar — ejemplo real LUMENS' },
      {
        type: 'example',
        content: (
          <>
            Situación: ad group con CPA $10.931 y 26 conversiones. Análisis: CPA &lt;50% del margen ($32.000) ·
            frecuencia &lt;1.5 (era 1.39) · 20+ conversiones acumuladas · 3+ días de data estable. Decisión:{' '}
            <B>escalar 30%</B> de $150k a $195k/día.
          </>
        ),
      },
      { type: 'heading', text: 'Cuándo pausar un ad group completo' },
      { type: 'list', variant: 'checked', items: [
        'Frecuencia >2.0 sostenida',
        'CPA subiendo día tras día por 3 días',
        'CTR bajando dramáticamente',
        'Fatiga total del creativo',
      ] },
      { type: 'example', content: 'El ad group CINTURON_MAY llegó a frecuencia 21.4 en algunos creativos individuales. Fue el momento de matarlo definitivamente y migrar todo el presupuesto a la nueva broad.' },
      { type: 'heading', text: 'El valle de la muerte del creativo' },
      { type: 'diagram', steps: ['Día 1-3: aprendizaje', 'Día 4-14: rendimiento óptimo', 'Día 15-25: estable', 'Día 26+: declive', 'Día 30+: muerte'] },
      { type: 'callout', variant: 'tip', content: 'Ningún creativo dura para siempre. En promedio 30 días. Después necesitas variaciones frescas del mismo ángulo. Nunca dejes de producir creativos nuevos.' },
      { type: 'toolGrid', tools: [
        { name: 'Meta Ads Library (espionaje)', description: 'Ver qué creativos están corriendo tus competidores más tiempo — eso significa que funcionan.', url: 'https://www.facebook.com/ads/library' },
      ] },
    ],
    practiceChecklist: [
      'Revisar métricas de tu campaña actual',
      'Identificar creativos con CPA <50% del margen',
      'Identificar creativos con CPA >80% del margen (candidatos a pausar)',
      'Si tienes 20+ conversiones estables, escalar 25%',
      'Preparar 3 variaciones nuevas del ángulo ganador',
      'NUNCA hacer 2 cambios el mismo día',
    ],
    test: [
      { type: 'single', question: '¿Cuánto puedes escalar el presupuesto máximo cada 3-4 días?', options: ['10%', '25-30%', '50%', '100%'], correctIndex: 1 },
      { type: 'single', question: '¿Cuántas conversiones mínimo antes de escalar?', options: ['5', '10', '20', '50'], correctIndex: 2 },
      { type: 'single', question: '¿Cuándo pausar un creativo?', options: ['Cuando la frecuencia llega a 1', 'Cuando CPA >80% del margen por 3 días seguidos', 'Después de 24 horas sin ventas', 'Nunca'], correctIndex: 1 },
      { type: 'single', question: '¿Cuánto dura en promedio un creativo antes de saturarse?', options: ['7 días', '15 días', '30 días', '90 días'], correctIndex: 2 },
      { type: 'text', question: 'Comparte captura de las métricas de tu campaña actual. ¿Qué decisión vas a tomar esta semana según lo aprendido?' },
    ],
  },

  // ============================================================
  // MÓDULO 10 — Gestión de devoluciones y customer service
  // ============================================================
  'devoluciones-cs': {
    slug: 'devoluciones-cs',
    accentColor: '#6366F1',
    durationMinutes: 60,
    introLine1: 'El 30% de tus ventas pueden convertirse en devoluciones.',
    introLine2: 'O el 11%, si haces esto bien.',
    theory: [
      { type: 'heading', text: 'Por qué se devuelven los pedidos en PCE' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>Cliente cambió de opinión</B> (35% de devoluciones) — compró impulsivo y se arrepintió, vio precio en otro lado, se le acabó la plata</span>,
        <span key="2"><B>Cliente no estuvo en casa</B> (25%) — zona alejada, mensajero solo pasa 1 vez, cliente no responde WhatsApp</span>,
        <span key="3"><B>Dirección mal escrita</B> (20%) — cliente puso barrio mal, sin punto de referencia, municipio equivocado</span>,
        <span key="4"><B>Confirmación tardía</B> (15%) — cliente no confirmó a tiempo, se olvidó del pedido</span>,
        <span key="5"><B>Problema con producto</B> (5%) — llegó dañado, no era lo que esperaba</span>,
      ] },
      { type: 'heading', text: 'Las 6 palancas para reducir devoluciones' },
      { type: 'list', variant: 'numbered', items: [
        <span key="1"><B>Velocidad de contacto</B> — WhatsApp en menos de 5 min post-compra</span>,
        <span key="2"><B>Mensaje que pide respuesta explícita</B> — "Responde CONFIRMO"</span>,
        <span key="3"><B>Segundo toque a las 3 horas</B> — si no responde</span>,
        <span key="4"><B>Filtrar zonas antes del checkout</B> — advertencia de tiempos</span>,
        <span key="5"><B>Ofrecer pago anticipado con descuento</B> — confirma 100%</span>,
        <span key="6"><B>Llamar a pendientes +4 horas</B> — mejor ROI horario del negocio</span>,
      ] },
      { type: 'example', content: 'Con estas 6 palancas, LUMENS bajó devoluciones del 33% al 11% en 2 meses. Cada punto porcentual de reducción son $2M+ COP recuperados al mes.' },
      { type: 'heading', text: 'El mensaje de recoger en oficina' },
      {
        type: 'paragraph',
        content: 'Cuando el mensajero no encuentra al cliente en casa, el paquete queda en oficina de Interrapidísimo. El cliente tiene 7 días para reclamarlo. Si no lo hace, se devuelve.',
      },
      { type: 'callout', variant: 'warning', content: 'El 40% de estos paquetes se devuelven porque el cliente NO SABE que está en la oficina. Enviar mensaje avisándole reduce esta fuga.' },
      {
        type: 'example',
        content: '"¡Hola {nombre}! Te informamos que tu pedido ya está disponible para reclamar en la oficina de Interrapidísimo de {ciudad}. Recógelo lo antes posible — se conserva por tiempo limitado."',
      },
      { type: 'heading', text: 'Manejo de reclamos reales' },
      {
        type: 'comparison',
        columns: [
          { label: 'No hacer', tone: 'bad', items: ['Discutir con el cliente', 'Ignorar mensajes agresivos', 'Negar problemas del producto', 'Prometer sin poder cumplir'] },
          { label: 'Sí hacer', tone: 'good', items: ['Validar la emoción primero ("Entiendo tu frustración")', 'Ofrecer solución concreta (reenvío, devolución, descuento)', 'Actuar rápido (<1 hora respuesta)', 'Documentar caso para aprender'] },
        ],
      },
      { type: 'toolGrid', tools: [
        { name: 'WhatsApp Business', description: 'Cuenta gratis con etiquetas, respuestas automáticas y catálogo.', url: 'https://business.whatsapp.com' },
        { name: 'Wappi (BSP oficial)', description: 'Automatización WhatsApp con API oficial. Reduce trabajo manual.', url: 'https://wappi.chat' },
      ] },
    ],
    practiceChecklist: [
      'Configurar WhatsApp Business con perfil de tienda',
      'Crear etiquetas: "Confirmado", "Pendiente", "Devuelto", "Problema"',
      'Configurar respuestas automáticas para preguntas frecuentes',
      'Establecer horario de atención',
      'Crear mensaje templates para: confirmar, recoger oficina, devolución',
      'Calcular tu tasa de devolución actual',
      'Definir cuáles de las 6 palancas vas a implementar esta semana',
    ],
    test: [
      { type: 'single', question: '¿Cuál es la razón #1 de devoluciones en PCE?', options: ['Producto dañado', 'Cliente cambió de opinión', 'Dirección mal escrita', 'Confirmación tardía'], correctIndex: 1 },
      { type: 'single', question: '¿En cuánto tiempo debes contactar al cliente post-compra?', options: ['1 hora', 'Menos de 5 minutos', '24 horas', 'Cuando puedas'], correctIndex: 1 },
      { type: 'single', question: '¿Qué % de paquetes en oficina se devuelven por falta de aviso?', options: ['10%', '20%', '40%', '60%'], correctIndex: 2 },
      { type: 'single', question: '¿Cuál NO es una de las 6 palancas para reducir devoluciones?', options: ['Velocidad de contacto', 'Mensaje que pide respuesta explícita', 'Llamar al cliente para venderle otro producto', 'Filtrar zonas antes del checkout'], correctIndex: 2 },
      { type: 'text', question: '¿Cuál es tu tasa de devolución actual? ¿Qué 3 palancas vas a implementar esta semana? Al final del programa validaremos la mejora.' },
    ],
  },
};

export function getModuleContent(slug: string): ModuleContent | null {
  return MODULES_CONTENT[slug] ?? null;
}
