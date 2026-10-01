import { formatearCOP } from '@/lib/software-tipos';

/**
 * Entradas y salidas día por día, en SVG puro.
 *
 * Dos áreas superpuestas en vez de barras: lo que importa no es el valor de un
 * día suelto sino si la línea verde va por encima de la roja. Cuando se cruzan,
 * ese día se perdió plata, y eso se ve de lejos sin leer un número.
 */
export function GraficaFlujo({
  serie,
}: {
  serie: { fecha: string; ingresos: number; gastos: number }[];
}) {
  const ANCHO = 760;
  const ALTO = 190;
  const techo = Math.max(1, ...serie.map((d) => Math.max(d.ingresos, d.gastos)));

  // Un punto por día. Con un solo día la división se cae, así que el paso
  // mínimo es el ancho completo.
  const paso = serie.length > 1 ? ANCHO / (serie.length - 1) : ANCHO;
  const puntos = (clave: 'ingresos' | 'gastos') =>
    serie.map((d, i) => [i * paso, ALTO - (d[clave] / techo) * (ALTO - 12)] as const);

  const linea = (ps: readonly (readonly [number, number])[]) =>
    ps.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = (ps: readonly (readonly [number, number])[]) =>
    `${linea(ps)} L${ANCHO},${ALTO} L0,${ALTO} Z`;

  const pIng = puntos('ingresos');
  const pGas = puntos('gastos');

  const hayDatos = serie.some((d) => d.ingresos > 0 || d.gastos > 0);

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[15px] font-extrabold tracking-tight">
          Últimos {serie.length} días
        </h2>
        <div className="flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-brand-success">
            <span className="h-2 w-2 rounded-full bg-brand-success" /> Entró
          </span>
          <span className="flex items-center gap-1.5 text-brand-danger">
            <span className="h-2 w-2 rounded-full bg-brand-danger" /> Salió
          </span>
        </div>
      </div>

      {hayDatos ? (
        <>
          <svg
            viewBox={`0 0 ${ANCHO} ${ALTO}`}
            className="h-[190px] w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Entradas y salidas de los últimos ${serie.length} días`}
          >
            <defs>
              <linearGradient id="gf-ing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gf-gas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F87171" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={0}
                x2={ANCHO}
                y1={ALTO * f}
                y2={ALTO * f}
                stroke="#26262E"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={area(pGas)} fill="url(#gf-gas)" />
            <path d={area(pIng)} fill="url(#gf-ing)" />
            <path
              d={linea(pGas)}
              fill="none"
              stroke="#F87171"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            <path
              d={linea(pIng)}
              fill="none"
              stroke="#10B981"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-2 flex justify-between font-mono text-[10px] text-text-muted">
            <span>{etiquetaDia(serie[0]?.fecha)}</span>
            <span>{etiquetaDia(serie[serie.length - 1]?.fecha)}</span>
          </div>
          <p className="mt-3 border-t border-border pt-3 font-mono text-[10.5px] text-text-muted">
            Pico del período: {formatearCOP(techo)}
          </p>
        </>
      ) : (
        <p className="py-14 text-center text-[13.5px] text-text-muted">
          Cuando registres tu primer movimiento, acá se dibuja el flujo.
        </p>
      )}
    </div>
  );
}

/** "2026-10-01" → "1 oct". La fecha ya viene en clave local de Bogotá. */
function etiquetaDia(clave: string | undefined): string {
  if (!clave) return '';
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const [, mes, dia] = clave.split('-').map(Number);
  return `${dia} ${meses[mes - 1] ?? ''}`;
}
