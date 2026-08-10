import Link from 'next/link';

// Zona pública de recursos. No pasa por el middleware (que solo cubre
// /portal/:path*), así que es abierta y sí queremos que la indexen.
export const metadata = {
  title: 'Recursos | Generación 1K',
  description:
    'Recursos abiertos de ecommerce y contra entrega: anatomía de landings, productos ganadores, campañas y logística.',
};

export default function RecursosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-bg-primary/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/recursos" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/dss3b02ao/image/upload/c_crop,x_540,y_288,w_557,h_385/f_auto,q_auto,w_200/v1786067394/1KCLUB_uofkqi.png"
              alt="1K Club"
              className="h-8 w-auto"
            />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted sm:block">
              Recursos
            </span>
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-text-secondary transition-colors hover:text-white">
              Inicio
            </Link>
            <Link
              href="/portal"
              className="rounded-lg border border-brand-purple/40 px-3.5 py-2 text-[13px] font-semibold text-brand-purpleLight transition-colors hover:border-brand-purple hover:bg-brand-purple/10"
            >
              Portal
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-border/70 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
          <p className="text-[13px] text-text-muted">
            © 2026 Generación 1K · Juan Felipe López
          </p>
          <Link
            href="https://instagram.com/juanflopezzz"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[12px] text-brand-purpleLight transition-opacity hover:opacity-70"
          >
            @juanflopezzz
          </Link>
        </div>
      </footer>
    </div>
  );
}
