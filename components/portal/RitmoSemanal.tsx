import Link from 'next/link';
import { Users, User, ArrowRight } from 'lucide-react';
import { GRUPAL_HORA, CUPO_SEMANAL_1A1 } from '@/lib/reuniones';

/**
 * El ritmo de la semana, en la primera pantalla.
 *
 * El modelo cambió y hay que decirlo donde se ve sin buscarlo: el peso está en
 * las tres grupales, y la 1:1 es una y hay que pedirla. Si esto solo vive en
 * la Agenda y en Ayuda, el estudiante se entera cuando ya se hizo una idea
 * equivocada de lo que compró.
 */
export function RitmoSemanal() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-brand-cyan/25 bg-brand-cyan/[0.05] p-5">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-cyan">
          <Users className="h-3.5 w-3.5" /> Cada semana
        </span>
        <p className="mt-2 font-display text-[17px] font-extrabold leading-tight">
          3 clases grupales en vivo
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          Martes, jueves y domingo a las {GRUPAL_HORA} pm. Hora y media cada una, y quedan grabadas
          si no puedes entrar.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-purple/25 bg-brand-purple/[0.05] p-5">
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-brand-purpleLight">
          <User className="h-3.5 w-3.5" /> Además
        </span>
        <p className="mt-2 font-display text-[17px] font-extrabold leading-tight">
          {CUPO_SEMANAL_1A1} sesión 1:1 de una hora
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          La pides tú cuando la necesites. No se acumula: si no la usas esta semana, el lunes
          vuelves a tener una.
        </p>
        <Link
          href="/portal/ayuda"
          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-purpleLight transition-colors hover:text-white"
        >
          Solicitar mi 1:1 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
