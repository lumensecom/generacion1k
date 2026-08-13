import { CalendarClock } from 'lucide-react';
import { diaLargo } from '@/lib/agenda';

/**
 * Ocupa el sitio del reproductor mientras el video no se ha estrenado.
 *
 * No es un bloqueo por progreso como el de los módulos: es una fecha. El
 * estudiante no ha hecho nada mal y no hay nada que pueda hacer para
 * adelantarlo, así que la pantalla lo dice con la fecha exacta en vez de un
 * candado seco, y le señala qué sí puede hacer mientras tanto.
 */
export function VideoProximamente({ dia }: { dia: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-brand-purple/30 bg-brand-purple/[0.04] px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple/15">
        <CalendarClock className="h-5 w-5 text-brand-purpleLight" />
      </span>
      <div>
        <p className="font-display text-[17px] font-extrabold tracking-tight">
          La clase se estrena el {diaLargo(dia)}
        </p>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-text-secondary">
          Ese día se abre aquí mismo, sin que tengas que hacer nada. Mientras tanto puedes
          adelantar la <strong className="font-semibold text-white">Teoría</strong> y la{' '}
          <strong className="font-semibold text-white">Práctica</strong> de este módulo — el test
          no depende del video.
        </p>
      </div>
    </div>
  );
}
