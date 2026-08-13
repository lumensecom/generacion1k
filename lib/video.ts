// Normaliza las URLs de video que pega Juan en el panel de admin.
//
// El portal usaba Loom, que obliga a un <iframe> de un tercero. Ahora los
// videos son propios y viven en Cloudinary, así que se sirven con un <video>
// nativo: sin cookies de terceros, sin logo ajeno, y con control real sobre
// el reproductor.

export type TipoVideo = 'bunny' | 'cloudinary' | 'archivo' | 'loom' | 'youtube' | null;

export interface VideoNormalizado {
  tipo: TipoVideo;
  /** Para <video src>. Null si el tipo necesita iframe. */
  src: string | null;
  /** Para <iframe src>. Null si se reproduce con <video>. */
  embed: string | null;
  /** Miniatura generada por Cloudinary; null en el resto. */
  poster: string | null;
}

const VACIO: VideoNormalizado = { tipo: null, src: null, embed: null, poster: null };

/**
 * Cloudinary sirve el mismo video en varios formatos según el navegador si
 * se le pide `f_auto`, y ajusta la calidad al ancho real con `q_auto`. Se
 * inyectan en la URL si no venían ya, que es lo normal cuando se copia el
 * enlace desde el panel de Cloudinary.
 */
function conTransformaciones(url: string): string {
  const marca = '/upload/';
  const i = url.indexOf(marca);
  if (i === -1) return url;

  const despues = url.slice(i + marca.length);
  // Si ya trae transformaciones (f_auto, q_auto, w_...), no se tocan.
  if (/^[a-z]{1,2}_[^/]+\//.test(despues)) return url;

  return `${url.slice(0, i + marca.length)}f_auto,q_auto/${despues}`;
}

/** Miniatura: el mismo asset pero pidiendo un jpg del primer fotograma. */
function posterDeCloudinary(url: string): string | null {
  const marca = '/upload/';
  const i = url.indexOf(marca);
  if (i === -1) return null;
  const base = url.slice(0, i + marca.length);
  const resto = url.slice(i + marca.length).replace(/^[a-z]{1,2}_[^/]+\//, '');
  const sinExtension = resto.replace(/\.[a-z0-9]+$/i, '');
  return `${base}so_0,f_jpg,q_auto,w_1280/${sinExtension}.jpg`;
}

/**
 * Bunny Stream da dos formas de la misma clase y Juan puede pegar cualquiera:
 * el reproductor embebido (iframe.mediadelivery.net/embed/BIBLIOTECA/GUID) o
 * el HLS directo de la pull zone (vz-XXXX.b-cdn.net/GUID/playlist.m3u8).
 *
 * El HLS directo es el bueno: se reproduce con el <video> propio del portal,
 * con su póster y midiendo cuánto se ha visto. Del embed no se puede deducir
 * el HLS — el dominio de la pull zone es otro y no viene en la URL — así que
 * ese cae al iframe. No se pierde la medición: el reproductor de Bunny habla
 * player.js y el VideoPlayer lo escucha.
 */
function deBunny(url: string): VideoNormalizado | null {
  // La pull zone sirve el HLS y también los MP4 sueltos. Los dos llevan el
  // GUID en la ruta, que es lo que hace falta para armar la miniatura.
  const cdn = url.match(/^(https?:\/\/[\w-]+\.b-cdn\.net)\/([0-9a-f-]{36})\/.+\.(m3u8|mp4)(\?|$)/i);
  if (cdn) {
    return {
      tipo: 'bunny',
      src: url,
      embed: null,
      // Bunny genera esta miniatura para todos los videos de la biblioteca.
      poster: `${cdn[1]}/${cdn[2]}/thumbnail.jpg`,
    };
  }

  const embed = url.match(/iframe\.mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})/i);
  if (embed) {
    return {
      tipo: 'bunny',
      src: null,
      // autoplay=false para que abrir la página no arranque el video solo.
      embed: `https://iframe.mediadelivery.net/embed/${embed[1]}/${embed[2]}?autoplay=false&preload=false&responsive=true`,
      poster: null,
    };
  }

  return null;
}

export function normalizarVideo(url: string | null | undefined): VideoNormalizado {
  let limpia = url?.trim();
  if (!limpia) return VACIO;

  // Bunny entrega el reproductor como un <iframe ...> entero para copiar y
  // pegar. Si viene así, se saca el src y se sigue con la URL a secas.
  const iframe = limpia.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframe) limpia = iframe[1].trim();

  const bunny = deBunny(limpia);
  if (bunny) return bunny;

  // Cloudinary — el caso normal a partir de ahora.
  if (/res\.cloudinary\.com\/.+\/video\/upload\//i.test(limpia)) {
    return {
      tipo: 'cloudinary',
      src: conTransformaciones(limpia),
      embed: null,
      poster: posterDeCloudinary(limpia),
    };
  }

  // Cualquier otro archivo de video servido directo.
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(limpia)) {
    return { tipo: 'archivo', src: limpia, embed: null, poster: null };
  }

  // Loom — se mantiene solo para no romper lo que ya estuviera cargado.
  const loom = limpia.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loom) {
    return { tipo: 'loom', src: null, embed: `https://www.loom.com/embed/${loom[1]}`, poster: null };
  }

  const yt = limpia.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return {
      tipo: 'youtube',
      src: null,
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`,
      poster: null,
    };
  }

  return VACIO;
}

export function tieneVideo(url: string | null | undefined): boolean {
  return normalizarVideo(url).tipo !== null;
}
