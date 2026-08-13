'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { normalizarVideo } from '@/lib/video';
import { cn } from '@/lib/utils';

/**
 * Reproductor de los videos del portal.
 *
 * Las clases largas viven en Bunny Stream, que entrega HLS: el navegador pide
 * el video por trozos y cambia de calidad según le aguante la conexión, en vez
 * de descargarse 400 MB de golpe. Se reproduce con el <video> propio del
 * portal siempre que se pueda — sin iframe de terceros, sin cookies ajenas y
 * midiendo cuánto se ha visto.
 *
 * Cloudinary sigue sirviendo los videos cortos que ya estaban. Loom y YouTube
 * se mantienen por si queda alguna URL vieja, y esos sí necesitan iframe.
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
   * Fracción vista, de 0 a 1. Llega en el <video> nativo (Bunny por HLS,
   * Cloudinary, archivos sueltos) y también en el iframe de Bunny, que habla
   * player.js. En YouTube y Loom no hay forma de saberlo desde fuera: ahí no
   * se llama nunca. Usa puedeMedirProgreso() antes de condicionar nada a esto.
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
        <IframeVideo
          src={video.embed}
          titulo={titulo}
          // Solo el reproductor de Bunny informa del avance. YouTube y Loom no.
          onProgreso={video.tipo === 'bunny' ? onProgreso : undefined}
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
        {/* eslint-disable-next-line @next/next/no-img-element -- viene del CDN ya optimizada */}
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
      <VideoNativo
        src={video.src}
        poster={video.poster}
        autoPlay={reproduciendo}
        onProgreso={onProgreso}
      />
    </div>
  );
}

/**
 * El <video> de siempre, con HLS cuando hace falta.
 *
 * Safari lee HLS de fábrica; el resto no, y ahí entra hls.js. Se carga con un
 * import dinámico para que sus ~30 KB no viajen en páginas que no reproducen
 * nada, que son casi todas.
 */
function VideoNativo({
  src,
  poster,
  autoPlay,
  onProgreso,
}: {
  src: string | null;
  poster: string | null;
  autoPlay: boolean;
  onProgreso?: (fraccion: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const esHls = !!src && /\.m3u8(\?|$)/i.test(src);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src || !esHls) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    let hls: { destroy: () => void } | null = null;
    let cancelado = false;

    import('hls.js').then(({ default: Hls }) => {
      // El import es asíncrono: para cuando resuelve, el componente puede
      // haberse desmontado ya.
      if (cancelado || !ref.current) return;
      if (!Hls.isSupported()) return;
      const instancia = new Hls({ enableWorker: true });
      instancia.loadSource(src);
      instancia.attachMedia(ref.current);
      hls = instancia;
    });

    return () => {
      cancelado = true;
      hls?.destroy();
    };
  }, [src, esHls]);

  return (
    <video
      ref={ref}
      // Con HLS la fuente la pone el efecto de arriba, no el atributo.
      src={esHls ? undefined : (src ?? undefined)}
      poster={poster ?? undefined}
      controls
      autoPlay={autoPlay}
      playsInline
      preload={autoPlay ? 'auto' : 'metadata'}
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
  );
}

/**
 * Iframe con escucha de avance para el reproductor de Bunny.
 *
 * Bunny implementa player.js, el protocolo de postMessage que usan los
 * reproductores embebidos: se le pide suscribirse a un evento y él responde
 * con mensajes según avanza. Es la única forma de saber cuánto lleva visto
 * alguien dentro de un iframe.
 */
function IframeVideo({
  src,
  titulo,
  onProgreso,
}: {
  src: string;
  titulo?: string;
  onProgreso?: (fraccion: number) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  // El padre pasa una función nueva en cada render. Si el efecto dependiera
  // de ella, se desuscribiría y volvería a suscribirse constantemente, así
  // que se guarda en una ref y el efecto solo depende del src.
  const avisar = useRef(onProgreso);
  avisar.current = onProgreso;
  const mide = !!onProgreso;

  useEffect(() => {
    if (!mide) return;
    const iframe = ref.current;
    if (!iframe) return;

    let origen: string;
    try {
      origen = new URL(src).origin;
    } catch {
      return;
    }

    const pedir = (evento: string) =>
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          context: 'player.js',
          version: '0.0.11',
          method: 'addEventListener',
          value: evento,
          listener: evento,
        }),
        origen
      );

    const alMensaje = (e: MessageEvent) => {
      if (e.origin !== origen || e.source !== iframe.contentWindow) return;
      let dato: { context?: string; event?: string; value?: { seconds?: number; duration?: number } };
      try {
        dato = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (dato?.context !== 'player.js') return;

      if (dato.event === 'ready') {
        pedir('timeupdate');
        pedir('ended');
      } else if (dato.event === 'timeupdate') {
        const { seconds = 0, duration = 0 } = dato.value ?? {};
        if (duration > 0) avisar.current?.(seconds / duration);
      } else if (dato.event === 'ended') {
        avisar.current?.(1);
      }
    };

    window.addEventListener('message', alMensaje);
    // El "ready" puede haber salido antes de que montáramos el listener, así
    // que la suscripción se pide también a pelo. Suscribirse dos veces no
    // molesta; perderse el ready sí deja el avance a cero para siempre.
    pedir('timeupdate');
    pedir('ended');
    const reintento = setTimeout(() => {
      pedir('timeupdate');
      pedir('ended');
    }, 1500);

    return () => {
      window.removeEventListener('message', alMensaje);
      clearTimeout(reintento);
    };
  }, [src, mide]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={titulo ?? 'Video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className="absolute inset-0 h-full w-full"
    />
  );
}

/**
 * Si este video puede informar de cuánto se ha visto: el <video> nativo
 * siempre, y el iframe solo si es de Bunny. YouTube y Loom no pueden.
 */
export function puedeMedirProgreso(url: string | null | undefined): boolean {
  const v = normalizarVideo(url);
  return v.src !== null || v.tipo === 'bunny';
}
