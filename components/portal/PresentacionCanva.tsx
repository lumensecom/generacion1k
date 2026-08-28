import { ExternalLink, Presentation } from 'lucide-react';

/**
 * Una presentación de Canva incrustada.
 *
 * Va aparte del VideoPlayer porque no es un video: es una presentación que se
 * pasa diapositiva a diapositiva. Se usa la URL /view?embed y nunca la que
 * comparte Canva por defecto, que es de EDICIÓN — con esa, cualquiera con el
 * enlace podría cambiar o borrar el material.
 */
export function PresentacionCanva({ url, titulo }: { url: string; titulo: string }) {
  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-light-border bg-light-bg">
        <iframe
          src={url}
          title={titulo}
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12.5px] text-light-muted">
          <Presentation className="h-3.5 w-3.5" /> Presentación · pásala con las flechas
        </span>
        <a
          href={url.replace('?embed', '')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-purple transition-colors hover:underline"
        >
          Abrirla en grande <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
