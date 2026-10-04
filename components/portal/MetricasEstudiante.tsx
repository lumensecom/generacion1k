import { CalendarDays, CheckCircle2, Flame, GraduationCap, LogIn, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Las cifras del estudiante, en el orden en que le importan: primero lo que
 * ha avanzado, después con qué constancia, y de último lo administrativo.
 *
 * Cada una lleva una línea que dice qué significa. Un número suelto no le
 * dice nada a alguien que entra por tercera vez en su vida a un portal.
 */
export interface MetricasVista {
  porcentaje: number;
  modulosHechos: number;
  modulosTotales: number;
  leccionesVistas: number;
  testsAprobados: number;
  racha: number;
  diasActivos: number;
  sesionesTomadas: number;
  sesionesTotales: number;
  ultimoIngreso: string | null;
  primerIngreso: string | null;
}

export function MetricasEstudiante({ m }: { m: MetricasVista }) {
  const tarjetas = [
    {
      icono: GraduationCap,
      color: '#A855F7',
      etiqueta: 'Módulos',
      valor: `${m.modulosHechos}/${m.modulosTotales}`,
      pie: m.modulosHechos === 0 ? 'Empieza por el primero' : `${m.porcentaje}% del programa`,
    },
    {
      icono: Video,
      color: '#22D3EE',
      etiqueta: 'Lecciones vistas',
      valor: String(m.leccionesVistas),
      pie: m.leccionesVistas === 0 ? 'Todavía ninguna' : 'Clases que ya viste',
    },
    {
      icono: CheckCircle2,
      color: '#10B981',
      etiqueta: 'Tests aprobados',
      valor: String(m.testsAprobados),
      pie: 'Cada uno desbloquea el siguiente módulo',
    },
    {
      icono: Flame,
      color: '#F59E0B',
      etiqueta: 'Racha',
      valor: m.racha === 1 ? '1 día' : `${m.racha} días`,
      pie: m.racha === 0 ? 'Marca hoy para arrancarla' : 'Seguidos trabajando',
      encendido: m.racha >= 3,
    },
    {
      icono: CalendarDays,
      color: '#EC4899',
      etiqueta: 'Mentorías 1:1',
      valor: `${m.sesionesTomadas}/${m.sesionesTotales}`,
      pie: 'Las que ya tomaste de tu plan',
    },
    {
      icono: LogIn,
      color: '#75757F',
      etiqueta: 'Último ingreso',
      valor: m.ultimoIngreso ?? 'Hoy',
      pie: m.primerIngreso ? `Desde el ${m.primerIngreso}` : 'Tu primera vez',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tarjetas.map((t) => (
        <div
          key={t.etiqueta}
          className={cn(
            'rounded-2xl border bg-bg-card px-4 py-4',
            t.encendido ? 'border-brand-yellow/35' : 'border-border'
          )}
        >
          <t.icono className="h-4 w-4" style={{ color: t.color }} />
          <span className="mt-2.5 block truncate text-[19px] font-extrabold leading-none tabular-nums">
            {t.valor}
          </span>
          <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-wider text-text-muted">
            {t.etiqueta}
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-text-muted">{t.pie}</span>
        </div>
      ))}
    </div>
  );
}
