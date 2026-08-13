'use client';

import { useState } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { normalizarVideo } from '@/lib/video';
import { cn } from '@/lib/utils';

/**
 * Reproductor de los videos del portal.
 *
 * Los videos propios viven en Cloudinary y se sirven con <video> nativo:
 * sin iframe de terceros, sin cookies ajenas y con la miniatura generada por
 * el propio Cloudinary. Loom y YouTube siguen funcionando por si quedara
 * alguna URL vieja, pero esos sí necesitan iframe.
 */
export function VideoPlayer({
  url,
  titulo,
  vacio = 'Video en camino — Juan lo está grabando.',
  className,
  onProgreso,
}: {
  url: string | null | undefined;
  titulo?: string;
  vacio?: string;
  className?: string;
  /**
   * Fracción vista, de 0 a 1. Solo llega en los videos que se reproducen con
   * <video> nativo (Cloudinary y archivos sueltos): en un iframe de YouTube o
   * Loom no hay forma de saberlo desde fuera. Usa puedeMedirProgreso() antes
   * de condicionar nada a esto.
   */
  onProgreso?: (fraccion: number) => void;
}) {
  const video = normalizarVideo(url);
  // El póster se sustituye por el reproductor real al primer clic: así la
  // página no descarga el video hasta que alguien decide verlo.
  const [reproduciendo, setReproduciendo] = useState(false);

  const marco = cn(
    'relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-bg-card',
    className
  );

  if (video.tipo === null) {
    return (
      <div className={cn(marco, 'flex flex-col items-center justify-center gap-3 text-text-muted')}>
        <VideoOff className="h-7 w-7" />
        <p className="px-6 text-center text-sm">{vacio}</p>
      </div>
    );
  }

  if (video.embed) {
    return (
      <div className={marco}>
        <iframe
          src={video.embed}
          title={titulo ?? 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (video.poster && !reproduciendo) {
    return (
      <button
        type="button"
        onClick={() => setReproduciendo(true)}
        aria-label={`Reproducir ${titulo ?? 'el video'}`}
        className={cn(marco, 'group')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- viene de Cloudinary ya optimizada */}
        <img
          src={video.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-2xl transition-transform duration-300 group-hover:scale-110">
          <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
        </span>
        {titulo && (
          <span className="absolute inset-x-0 bottom-0 truncate px-5 pb-4 text-left font-display text-[15px] font-extrabold text-white">
            {titulo}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={marco}>
      <video
        src={video.src ?? undefined}
        poster={video.poster ?? undefined}
        controls
        autoPlay={reproduciendo}
        playsInline
        preload={reproduciendo ? 'auto' : 'metadata'}
        onTimeUpdate={
          onProgreso &&
          ((e) => {
            const v = e.currentTarget;
            if (v.duration > 0) onProgreso(v.currentTime / v.duration);
          })
        }
        onEnded={onProgreso && (() => onProgreso(1))}
        className="absolute inset-0 h-full w-full bg-black"
      >
        Tu navegador no puede reproducir este video.
      </video>
    </div>
  );
}

/** Si este video puede informar de cuánto se ha visto. Los iframes no pueden. */
export function puedeMedirProgreso(url: string | null | undefined): boolean {
  return normalizarVideo(url).src !== null;
}
