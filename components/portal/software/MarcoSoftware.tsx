import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

/**
 * La cabecera común de las herramientas del Software 1K: el camino de vuelta al
 * mapa, el nombre y una línea que diga para qué sirve. Se repite en las cuatro
 * para que cambiar de una a otra no se sienta como cambiar de aplicación.
 */
export function MarcoSoftware({
  titulo,
  bajada,
  icono: Icono,
  color,
  acciones,
  children,
}: {
  titulo: string;
  bajada: string;
  icono: LucideIcon;
  color: string;
  acciones?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Link
        href="/portal/software"
        className="inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={13} /> Software 1K
      </Link>

      <div className="mb-8 mt-6 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: `${color}1A`,
              borderColor: `${color}40`,
              color,
            }}
          >
            <Icono className="h-[22px] w-[22px]" />
          </span>
          <div>
            <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
              {titulo}
            </h1>
            <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-text-secondary">
              {bajada}
            </p>
          </div>
        </div>
        {acciones}
      </div>

      {children}
    </>
  );
}
