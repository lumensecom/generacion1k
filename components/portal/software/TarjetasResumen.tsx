import { formatearCOP, type ResumenMes } from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

/**
 * Las seis cifras del período.
 *
 * El orden no es decorativo: primero lo que entró y lo que salió, después lo
 * que quedó, y sólo al final las métricas de pauta. Un estudiante que todavía
 * no pauta ve las tres primeras llenas y entiende que las otras llegan después.
 */
export function TarjetasResumen({ resumen }: { resumen: ResumenMes }) {
  const positiva = resumen.utilidad >= 0;

  const cifras = [
    { etiqueta: 'Entró', valor: formatearCOP(resumen.ingresos), tono: 'text-brand-success' },
    { etiqueta: 'Salió', valor: formatearCOP(resumen.gastos), tono: 'text-brand-danger' },
    {
      etiqueta: positiva ? 'Utilidad' : 'Pérdida',
      valor: formatearCOP(Math.abs(resumen.utilidad)),
      tono: positiva ? 'text-white' : 'text-brand-danger',
      nota: resumen.ingresos > 0 ? `${resumen.margenPct.toFixed(1)}% de margen` : null,
      ancha: true,
    },
    {
      etiqueta: 'ROAS',
      valor: resumen.roas > 0 ? `${resumen.roas.toFixed(2)}x` : '—',
      tono: resumen.roas >= 2 ? 'text-brand-cyan' : 'text-text-secondary',
      nota: resumen.gastoPauta > 0 ? `sobre ${formatearCOP(resumen.gastoPauta)} de pauta` : null,
    },
    {
      etiqueta: 'CPA',
      valor: resumen.cpa > 0 ? formatearCOP(resumen.cpa) : '—',
      tono: 'text-text-secondary',
      nota: resumen.pedidos > 0 ? `${resumen.pedidos} pedidos` : null,
    },
    {
      etiqueta: 'Ticket promedio',
      valor: resumen.ticketPromedio > 0 ? formatearCOP(resumen.ticketPromedio) : '—',
      tono: 'text-text-secondary',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cifras.map((c) => (
        <div
          key={c.etiqueta}
          className={cn(
            'rounded-2xl border border-border bg-bg-card px-4 py-3.5',
            c.ancha && 'col-span-2 sm:col-span-1'
          )}
        >
          <span className="block font-mono text-[9.5px] uppercase tracking-wider text-text-muted">
            {c.etiqueta}
          </span>
          <span className={cn('mt-1 block truncate text-[17px] font-extrabold tabular-nums', c.tono)}>
            {c.valor}
          </span>
          {c.nota && (
            <span className="mt-0.5 block truncate font-mono text-[9.5px] text-text-muted">
              {c.nota}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
