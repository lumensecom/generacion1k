import Link from 'next/link';
import {
  ArrowUpRight,
  Calculator,
  Clapperboard,
  Lock,
  type LucideIcon,
  FlaskConical,
  PackageSearch,
  PhoneCall,
  Receipt,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatearCOP } from '@/lib/software-tipos';

/**
 * El mapa del Software 1K: el negocio del estudiante dibujado como un sistema,
 * no como un menú.
 *
 * En el centro va lo único que importa de verdad — cuánto entró, cuánto salió,
 * qué quedó — y de ahí salen las cuatro herramientas que mueven ese número. El
 * estudiante ve primero el resultado y después por dónde tocarlo.
 *
 * Las coordenadas viven en un viewBox de 1000x640. Los conectores son SVG y las
 * tarjetas son HTML posicionado en porcentajes sobre ese mismo sistema, así que
 * los dos se escalan juntos sin medir nada en el cliente. Debajo de lg el mapa
 * no cabe sin volverse ilegible, así que ahí las mismas tarjetas se apilan.
 */

interface Nodo {
  id: string;
  titulo: string;
  resumen: string;
  href: string;
  icono: LucideIcon;
  color: string;
  /** Posición del centro de la tarjeta dentro del viewBox. */
  x: number;
  y: number;
  /** El conector que la une al centro. */
  path: string;
  proximamente?: boolean;
}

const HUB = { x: 500, y: 310 };
const ANCHO = 1000;
const ALTO = 640;

const NODOS: Nodo[] = [
  {
    id: 'contabilidad',
    titulo: 'Contabilidad',
    resumen: 'Cada peso que entra y cada peso que sale, con el cierre del mes listo.',
    href: '/portal/software/contabilidad',
    icono: Receipt,
    color: '#A855F7',
    x: 160,
    y: 95,
    path: 'M500,310 C385,278 265,165 163,100',
  },
  {
    id: 'productos',
    titulo: 'Productos y costeo',
    resumen: 'Qué te deja de verdad cada producto después de las devoluciones.',
    href: '/portal/software/productos',
    icono: Calculator,
    color: '#22D3EE',
    x: 160,
    y: 310,
    path: 'M500,310 C420,310 330,310 166,310',
  },
  {
    id: 'creativos',
    titulo: 'Creativos y ángulos',
    resumen: 'Tu banco de hooks, guiones y ángulos. Lo que ganó queda guardado.',
    href: '/portal/software/creativos',
    icono: Clapperboard,
    color: '#F5C518',
    x: 840,
    y: 95,
    path: 'M500,310 C615,278 735,165 837,100',
  },
  {
    id: 'landings',
    titulo: 'Landings que venden',
    resumen: 'La estructura exacta, bloque por bloque, con los prompts para armarla.',
    href: '/portal/software/landings',
    icono: Rocket,
    color: '#EC4899',
    x: 840,
    y: 310,
    path: 'M500,310 C580,310 670,310 834,310',
  },
  {
    id: 'testeos',
    titulo: 'Testeos',
    resumen: '¿Cuál sigue y cuál apago? Sube el reporte y te los califico.',
    href: '/portal/software/testeos',
    icono: FlaskConical,
    color: '#F59E0B',
    x: 840,
    y: 525,
    path: 'M500,310 C615,342 735,455 837,520',
  },
  {
    id: 'llamadas',
    titulo: 'Llamadas con IA',
    resumen: 'Confirmación de pedidos por voz para bajar las devoluciones.',
    href: '/portal/software',
    icono: PhoneCall,
    color: '#75757F',
    x: 500,
    y: 600,
    path: 'M500,310 C500,430 500,500 500,594',
    proximamente: true,
  },
  {
    id: 'dropi',
    titulo: 'Análisis Dropi',
    resumen: 'Tu efectividad real salida del reporte, no de una suposición.',
    href: '/portal/software/dropi',
    icono: PackageSearch,
    color: '#22C55E',
    x: 160,
    y: 525,
    path: 'M500,310 C385,342 265,455 163,520',
  },
];

export interface ResumenHub {
  ingresos: number;
  gastos: number;
  utilidad: number;
  roas: number;
}

export function MapaSoftware({
  resumen,
  soloVista = false,
}: {
  resumen: ResumenHub;
  /**
   * Adelanto: las tarjetas se pintan igual pero sin enlace. No basta con
   * apagar el puntero — un enlace sin puntero sigue cogiendo foco con el
   * tabulador y se puede abrir con Enter.
   */
  soloVista?: boolean;
}) {
  return (
    <>
      {/* El mapa. Sólo desde lg, donde hay ancho para que se lea. */}
      <div
        className="relative hidden lg:block [perspective:1600px]"
        style={{ aspectRatio: `${ANCHO} / ${ALTO}` }}
      >
        <div className="absolute inset-0 [transform:rotateX(7deg)] [transform-style:preserve-3d]">
          <Conectores />

          {NODOS.map((n, i) => (
            <div
              key={n.id}
              className="absolute w-[254px]"
              style={{
                left: `${(n.x / ANCHO) * 100}%`,
                top: `${(n.y / ALTO) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="motion-safe:animate-nodoFlota"
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <TarjetaNodo nodo={n} elevada soloVista={soloVista} />
              </div>
            </div>
          ))}

          <div
            className="absolute"
            style={{
              left: `${(HUB.x / ANCHO) * 100}%`,
              top: `${(HUB.y / ALTO) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Centro resumen={resumen} />
          </div>
        </div>
      </div>

      {/* Lo mismo, apilado, para pantallas angostas. */}
      <div className="lg:hidden">
        <div className="mb-6">
          <Centro resumen={resumen} compacto />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {NODOS.map((n) => (
            <TarjetaNodo key={n.id} nodo={n} soloVista={soloVista} />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Los conectores. Cada uno va en tres capas: un trazo ancho y difuso que hace
 * de resplandor, una línea punteada que corre hacia afuera, y un punto que
 * viaja el recorrido. El movimiento sugiere que el dato fluye del centro a la
 * herramienta, que es exactamente lo que pasa.
 */
function Conectores() {
  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="absolute inset-0 h-full w-full overflow-visible"
      fill="none"
    >
      <defs>
        <filter id="sw-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {NODOS.map((n) => (
          <linearGradient key={n.id} id={`sw-grad-${n.id}`} gradientUnits="userSpaceOnUse"
            x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y}>
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
            <stop offset="100%" stopColor={n.color} stopOpacity="0.9" />
          </linearGradient>
        ))}
      </defs>

      {NODOS.map((n) => (
        <g key={n.id} opacity={n.proximamente ? 0.4 : 1}>
          <path id={`sw-path-${n.id}`} d={n.path} stroke={`url(#sw-grad-${n.id})`} strokeWidth={9}
            strokeLinecap="round" opacity={0.16} filter="url(#sw-glow)" />
          <path d={n.path} stroke={`url(#sw-grad-${n.id})`} strokeWidth={1.8} strokeLinecap="round"
            strokeDasharray="7 13" className="motion-safe:animate-dashFlow" />
          {!n.proximamente && (
            <circle r={4} fill={n.color} filter="url(#sw-glow)">
              <animateMotion dur="3.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1"
                calcMode="spline" keySplines="0.45 0 0.55 1">
                <mpath href={`#sw-path-${n.id}`} />
              </animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
}

/** El centro: el estado del negocio en cuatro cifras. */
function Centro({ resumen, compacto = false }: { resumen: ResumenHub; compacto?: boolean }) {
  const positiva = resumen.utilidad >= 0;

  return (
    <div
      className={cn(
        'relative',
        compacto ? 'w-full' : 'h-[230px] w-[230px]'
      )}
    >
      {!compacto && (
        <>
          <div className="absolute -inset-10 rounded-full bg-brand-purple/20 blur-3xl motion-safe:animate-halo" />
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute -inset-5 rounded-full border border-white/[0.06]" />
        </>
      )}

      <div
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden border border-white/10 bg-gradient-to-br from-[#1A1030] via-[#120C22] to-[#0A0A0A] text-center shadow-[0_24px_70px_-20px_rgba(124,58,237,0.55)]',
          compacto ? 'rounded-2xl px-6 py-7' : 'h-full w-full rounded-full px-7'
        )}
      >
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-brand-purpleLight">
          Últimos 30 días
        </span>

        <p
          className={cn(
            'mt-2 font-display font-extrabold leading-none tracking-tight',
            compacto ? 'text-4xl' : 'text-[30px]',
            positiva ? 'text-white' : 'text-brand-danger'
          )}
        >
          {formatearCOP(resumen.utilidad)}
        </p>
        <span className="mt-1.5 text-[11.5px] font-semibold text-text-muted">
          {positiva ? 'de utilidad' : 'en pérdida'}
        </span>

        <div
          className={cn(
            'mt-4 grid w-full gap-x-4 gap-y-2 border-t border-white/10 pt-3.5',
            compacto ? 'grid-cols-3' : 'grid-cols-2'
          )}
        >
          <Cifra etiqueta="Entró" valor={formatearCOP(resumen.ingresos)} tono="text-brand-success" />
          <Cifra etiqueta="Salió" valor={formatearCOP(resumen.gastos)} tono="text-brand-danger" />
          {compacto && (
            <Cifra
              etiqueta="ROAS"
              valor={resumen.roas > 0 ? `${resumen.roas.toFixed(2)}x` : '—'}
              tono="text-brand-cyan"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Cifra({ etiqueta, valor, tono }: { etiqueta: string; valor: string; tono: string }) {
  return (
    <div className="min-w-0">
      <span className="block font-mono text-[9px] uppercase tracking-wider text-text-muted">
        {etiqueta}
      </span>
      <span className={cn('block truncate text-[12.5px] font-bold', tono)}>{valor}</span>
    </div>
  );
}

function TarjetaNodo({
  nodo,
  elevada = false,
  soloVista = false,
}: {
  nodo: Nodo;
  elevada?: boolean;
  soloVista?: boolean;
}) {
  const inerte = soloVista || nodo.proximamente;
  // En el adelanto cada tarjeta conserva su ícono y su color: la gracia es
  // que vean qué hay, no un muro de candados.
  const Icono = nodo.proximamente && !soloVista ? Lock : nodo.icono;

  const contenido = (
    <>
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(130% 100% at 50% 0%, ${nodo.color}22, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border"
            style={{
              backgroundColor: `${nodo.color}1A`,
              borderColor: `${nodo.color}40`,
              color: nodo.color,
            }}
          >
            <Icono className="h-[17px] w-[17px]" />
          </span>
          {nodo.proximamente && !soloVista ? (
            <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-text-muted">
              Pronto
            </span>
          ) : soloVista ? null : (
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          )}
        </div>

        <h3 className="mt-3 font-display text-[15px] font-extrabold leading-tight tracking-tight text-white">
          {nodo.titulo}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-snug text-text-secondary">{nodo.resumen}</p>
      </div>
    </>
  );

  const clases = cn(
    'group relative block overflow-hidden rounded-2xl border border-white/10 bg-bg-card/80 p-4 backdrop-blur-xl transition-all duration-300',
    elevada && 'shadow-[0_18px_44px_-18px_rgba(0,0,0,0.9)]',
    inerte
      ? 'cursor-default'
      : 'hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_26px_60px_-18px_rgba(124,58,237,0.5)]',
    nodo.proximamente && !soloVista && 'opacity-55'
  );

  if (inerte) {
    return <div className={clases}>{contenido}</div>;
  }

  return (
    <Link href={nodo.href} className={clases}>
      {contenido}
    </Link>
  );
}
