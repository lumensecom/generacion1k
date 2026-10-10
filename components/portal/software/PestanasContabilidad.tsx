'use client';

import { useState, type ReactNode } from 'react';
import { CalendarCheck, Receipt } from 'lucide-react';
import { CierreDeMes } from '@/components/portal/software/CierreDeMes';
import type { SwGasto, SwIngreso } from '@/lib/software-tipos';
import { cn } from '@/lib/utils';

/**
 * El día a día y el cierre del mes son la misma contabilidad mirada con dos
 * lentes: uno para registrar y otro para entender. Viven en la misma pantalla
 * porque quien cierra el mes acaba de registrar, y mandarlo a otra ruta sería
 * hacerle perder el hilo.
 *
 * El diario llega ya renderizado desde el servidor; aquí sólo se decide cuál
 * de los dos se ve.
 */
export function PestanasContabilidad({
  diario,
  ingresos,
  gastos,
}: {
  diario: ReactNode;
  ingresos: SwIngreso[];
  gastos: SwGasto[];
}) {
  const [tab, setTab] = useState<'diario' | 'cierre'>('diario');

  const pestanas = [
    { id: 'diario', etiqueta: 'El día a día', icono: Receipt },
    { id: 'cierre', etiqueta: 'Cierre de mes', icono: CalendarCheck },
  ] as const;

  return (
    <>
      <div className="mb-6 inline-flex gap-1.5 rounded-2xl border border-border bg-bg-secondary p-1.5">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setTab(p.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-bold transition-colors',
              tab === p.id ? 'bg-brand-purple text-white' : 'text-text-muted hover:text-white'
            )}
          >
            <p.icono className="h-4 w-4" /> {p.etiqueta}
          </button>
        ))}
      </div>

      {tab === 'diario' ? diario : <CierreDeMes ingresos={ingresos} gastos={gastos} />}
    </>
  );
}
