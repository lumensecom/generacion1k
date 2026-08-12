// Enlaces para guardar una sesión en el calendario.
//
// No hay integración con la API de Google: eso obligaría a que cada
// estudiante autorizara la app con OAuth y a mantener tokens. Para "que me
// quede en el calendario" basta con el enlace de creación de evento de
// Google y un archivo .ics para todo lo demás (Apple, Outlook), que es lo
// que hace cualquier página de eventos.

export interface EventoCalendario {
  titulo: string;
  descripcion?: string | null;
  /** ISO. Si falta, no hay evento que guardar. */
  inicio: string | null;
  duracionMinutos: number;
  /** Link de la videollamada; se usa como "ubicación" del evento. */
  url?: string | null;
}

/** Formato de fecha de iCalendar y de Google: 20260812T190000Z */
function aFormatoUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function rango(evento: EventoCalendario): { inicio: Date; fin: Date } | null {
  if (!evento.inicio) return null;
  const inicio = new Date(evento.inicio);
  if (Number.isNaN(inicio.getTime())) return null;
  return { inicio, fin: new Date(inicio.getTime() + evento.duracionMinutos * 60_000) };
}

export function urlGoogleCalendar(evento: EventoCalendario): string | null {
  const r = rango(evento);
  if (!r) return null;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${aFormatoUTC(r.inicio)}/${aFormatoUTC(r.fin)}`,
  });
  // El link de la llamada va en los dos campos: Google muestra "location"
  // en la tarjeta del evento, pero el botón de unirse sale de la descripción.
  if (evento.url) params.set('location', evento.url);
  const detalles = [evento.descripcion?.trim(), evento.url ? `Link: ${evento.url}` : null]
    .filter(Boolean)
    .join('\n\n');
  if (detalles) params.set('details', detalles);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escapa según RFC 5545: las comas y los punto y coma son separadores. */
function escaparICS(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export function contenidoICS(evento: EventoCalendario, uid: string): string | null {
  const r = rango(evento);
  if (!r) return null;

  const descripcion = [evento.descripcion?.trim(), evento.url ? `Link: ${evento.url}` : null]
    .filter(Boolean)
    .join('\n\n');

  // Las líneas van separadas por CRLF, no por \n: hay clientes que
  // descartan el archivo entero si no.
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Generacion 1K//Portal//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@generacion1k`,
    `DTSTAMP:${aFormatoUTC(new Date())}`,
    `DTSTART:${aFormatoUTC(r.inicio)}`,
    `DTEND:${aFormatoUTC(r.fin)}`,
    `SUMMARY:${escaparICS(evento.titulo)}`,
    descripcion ? `DESCRIPTION:${escaparICS(descripcion)}` : null,
    evento.url ? `LOCATION:${escaparICS(evento.url)}` : null,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter((l): l is string => l !== null)
    .join('\r\n');
}

/** data: URI para descargar el .ics sin pedirle nada al servidor. */
export function urlDescargaICS(evento: EventoCalendario, uid: string): string | null {
  const ics = contenidoICS(evento, uid);
  if (!ics) return null;
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
